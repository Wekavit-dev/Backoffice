// src/pages/LoansManagement/components/LoanForm/index.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const LoanForm = ({ funds, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    fundId: '',
    amount: '',
    beneficiary: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      identification: ''
    },
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    interestRate: '10'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Informations du prêt', 'Bénéficiaire', 'Confirmation'];

  const selectedFund = funds.find(f => f._id === formData.fundId);

  // Calculs automatiques
  const calculations = {
    days: formData.startDate && formData.endDate ? 
      Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) : 0,
    interestAmount: formData.amount && formData.interestRate ? 
      (parseFloat(formData.amount) * parseFloat(formData.interestRate)) / 100 : 0,
    totalAmount: formData.amount && formData.interestRate ? 
      parseFloat(formData.amount) + (parseFloat(formData.amount) * parseFloat(formData.interestRate)) / 100 : 0
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24));
      if (days < 1) {
        setError('La durée doit être d\'au moins 1 jour');
      } else {
        setError('');
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (field, value) => {
    if (field.startsWith('beneficiary.')) {
      const beneficiaryField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        beneficiary: {
          ...prev.beneficiary,
          [beneficiaryField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.fundId) return 'Veuillez sélectionner un fonds';
        if (!formData.amount || formData.amount <= 0) return 'Le montant doit être supérieur à 0';
        if (!formData.interestRate || formData.interestRate < 0) return 'Le taux d\'intérêt doit être positif';
        if (calculations.days < 1) return 'La durée doit être d\'au moins 1 jour';
        if (selectedFund && selectedFund.availableBalance < parseFloat(formData.amount)) {
          return `Fonds insuffisant. Solde disponible: ${selectedFund.availableBalance} ${selectedFund.currency}`;
        }
        return '';
      
      case 1:
        if (!formData.beneficiary.firstName.trim()) return 'Le prénom est obligatoire';
        if (!formData.beneficiary.lastName.trim()) return 'Le nom est obligatoire';
        if (!formData.beneficiary.phone.trim()) return 'Le téléphone est obligatoire';
        if (!formData.beneficiary.email.trim()) return 'L\'email est obligatoire';
        if (!formData.beneficiary.address.trim()) return 'L\'adresse est obligatoire';
        return '';
      
      default:
        return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const stepError = validateStep(activeStep);
    if (stepError) {
      setError(stepError);
      setLoading(false);
      return;
    }

    if (activeStep < steps.length - 1) {
      handleNext();
      setLoading(false);
      return;
    }

    const result = await onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate)
    });

    if (result && !result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Fonds *</InputLabel>
                <Select
                  value={formData.fundId}
                  label="Fonds *"
                  onChange={(e) => handleChange('fundId', e.target.value)}
                >
                  {funds.map(fund => (
                    <MenuItem key={fund._id} value={fund._id}>
                      {fund.name} - {fund.availableBalance} {fund.currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Montant du prêt *"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                margin="normal"
                variant="outlined"
                InputProps={{
                  endAdornment: selectedFund ? selectedFund.currency : ''
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Taux d'intérêt (%) *"
                value={formData.interestRate}
                onChange={(e) => handleChange('interestRate', e.target.value)}
                margin="normal"
                variant="outlined"
                InputProps={{
                  endAdornment: '%'
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Date de début *"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                type="date"
                label="Date de fin *"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />

              {/* Récapitulatif */}
              {selectedFund && formData.amount && (
                <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Récapitulatif
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Durée:</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {calculations.days} jours
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Intérêts:</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {calculations.interestAmount.toLocaleString()} {selectedFund.currency}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total à rembourser:</Typography>
                    <Typography variant="body2" fontWeight="600" color="primary">
                      {calculations.totalAmount.toLocaleString()} {selectedFund.currency}
                    </Typography>
                  </Box>
                </Card>
              )}
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom *"
                value={formData.beneficiary.firstName}
                onChange={(e) => handleChange('beneficiary.firstName', e.target.value)}
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Nom *"
                value={formData.beneficiary.lastName}
                onChange={(e) => handleChange('beneficiary.lastName', e.target.value)}
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Téléphone *"
                value={formData.beneficiary.phone}
                onChange={(e) => handleChange('beneficiary.phone', e.target.value)}
                margin="normal"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="Email *"
                value={formData.beneficiary.email}
                onChange={(e) => handleChange('beneficiary.email', e.target.value)}
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Adresse *"
                value={formData.beneficiary.address}
                onChange={(e) => handleChange('beneficiary.address', e.target.value)}
                margin="normal"
                variant="outlined"
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="Numéro d'identification"
                value={formData.beneficiary.identification}
                onChange={(e) => handleChange('beneficiary.identification', e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="CNI, Passeport..."
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Confirmation du prêt
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Informations du prêt
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Fonds:</Typography>
                    <Typography variant="body2" fontWeight="600">{selectedFund?.name}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Montant:</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {formData.amount} {selectedFund?.currency}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Taux d'intérêt:</Typography>
                    <Typography variant="body2" fontWeight="600">{formData.interestRate}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Durée:</Typography>
                    <Typography variant="body2" fontWeight="600">{calculations.days} jours</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Période:</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {new Date(formData.startDate).toLocaleDateString('fr-FR')} - {new Date(formData.endDate).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Bénéficiaire
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Nom:</strong> {formData.beneficiary.firstName} {formData.beneficiary.lastName}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Email:</strong> {formData.beneficiary.email}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Téléphone:</strong> {formData.beneficiary.phone}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Adresse:</strong> {formData.beneficiary.address}
                  </Typography>
                  {formData.beneficiary.identification && (
                    <Typography variant="body2">
                      <strong>Identification:</strong> {formData.beneficiary.identification}
                    </Typography>
                  )}
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom color="#2e7d32">
                    Récapitulatif financier
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2">Capital:</Typography>
                      <Typography variant="body2">Intérêts:</Typography>
                      <Typography variant="h6" fontWeight="700">Total à rembourser:</Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2">{formData.amount} {selectedFund?.currency}</Typography>
                      <Typography variant="body2">{calculations.interestAmount.toLocaleString()} {selectedFund?.currency}</Typography>
                      <Typography variant="h6" fontWeight="700" color="#2e7d32">
                        {calculations.totalAmount.toLocaleString()} {selectedFund?.currency}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              Vérifiez attentivement toutes les informations avant de confirmer la création du prêt.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>
        <Typography variant="h5" fontWeight="600">
          Nouveau Prêt
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={activeStep === 0 ? onCancel : handleBack} disabled={loading}>
          {activeStep === 0 ? 'Annuler' : 'Retour'}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ 
            backgroundColor: '#2e7d32',
            '&:hover': { backgroundColor: '#1b5e20' }
          }}
        >
          {loading ? 'Traitement...' : 
           activeStep === steps.length - 1 ? 'Créer le prêt' : 'Continuer'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default LoanForm;