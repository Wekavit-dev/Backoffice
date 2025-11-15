// src/pages/ExpensesManagement/components/ExpenseForm/index.js
import React, { useState } from 'react';
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
  MenuItem
} from '@mui/material';
import { showError } from 'utils/notifications';

const ExpenseForm = ({ funds, expenseTypes, onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    fundId: '',
    amount: '',
    expenseTypeId: '',
    reason: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.fundId) {
      setError('Veuillez sélectionner un fonds');
      setLoading(false);
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      setLoading(false);
      return;
    }
    if (!formData.expenseTypeId) {
      setError('Veuillez sélectionner un type de dépense');
      setLoading(false);
      return;
    }
    if (!formData.reason.trim()) {
      setError('La raison est obligatoire');
      setLoading(false);
      return;
    }

    // Vérifier si le fonds a suffisamment d'argent
    const selectedFund = funds.find(f => f._id === formData.fundId);
    if (selectedFund && selectedFund.availableBalance < parseFloat(formData.amount)) {
      setError(`Fonds insuffisant. Solde disponible: ${selectedFund.availableBalance} ${selectedFund.currency}`);
      setLoading(false);
      return;
    }

    const result = await onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    if (result && !result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  const selectedFund = funds.find(f => f._id === formData.fundId);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>
        <Typography variant="h5" fontWeight="600">
          Nouvelle Dépense
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Sélection du fonds */}
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
          </Grid>

          {/* Montant */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Montant *"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: selectedFund ? selectedFund.currency : ''
              }}
            />
          </Grid>

          {/* Type de dépense */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type de dépense *</InputLabel>
              <Select
                value={formData.expenseTypeId}
                label="Type de dépense *"
                onChange={(e) => handleChange('expenseTypeId', e.target.value)}
              >
                {expenseTypes.map(type => (
                  <MenuItem key={type._id} value={type._id}>
                    {type.name} ({type.category})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date de dépense */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Date de dépense *"
              value={formData.expenseDate}
              onChange={(e) => handleChange('expenseDate', e.target.value)}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* Raison */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Raison *"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              placeholder="Décrivez la raison de cette dépense..."
            />
          </Grid>

          {/* Informations du fonds sélectionné */}
          {selectedFund && (
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  Fonds sélectionné: <strong>{selectedFund.name}</strong><br />
                  Solde disponible: <strong>{selectedFund.availableBalance} {selectedFund.currency}</strong><br />
                  Solde total: <strong>{selectedFund.totalAmount} {selectedFund.currency}</strong>
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#c62828' } }}
        >
          {loading ? 'Création...' : 'Créer la dépense'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ExpenseForm;