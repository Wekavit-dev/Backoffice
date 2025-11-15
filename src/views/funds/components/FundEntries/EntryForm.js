// src/pages/FundsManagement/components/FundEntries/EntryForm.js
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
  Alert
} from '@mui/material';

const EntryForm = ({ fund, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    entryDate: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    returnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    interestToReturn: '',
    description: ''
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
    if (!formData.amount || formData.amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      setLoading(false);
      return;
    }
    if (!formData.source.trim()) {
      setError('La source est obligatoire');
      setLoading(false);
      return;
    }
    if (!formData.interestToReturn || formData.interestToReturn < 0) {
      setError('Les intérêts doivent être positifs');
      setLoading(false);
      return;
    }

    const entryDate = new Date(formData.entryDate);
    const returnDate = new Date(formData.returnDate);
    
    if (returnDate <= entryDate) {
      setError('La date de retour doit être après la date d\'entrée');
      setLoading(false);
      return;
    }

    const result = await onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      interestToReturn: parseFloat(formData.interestToReturn),
      entryDate: entryDate,
      returnDate: returnDate
    });

    if (result && !result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>
        <Typography variant="h5" fontWeight="600">
          Nouvelle Entrée de Fonds
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {fund.name} - {fund.currency}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
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
                endAdornment: fund.currency
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Intérêts à retourner *"
              value={formData.interestToReturn}
              onChange={(e) => handleChange('interestToReturn', e.target.value)}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: fund.currency
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Source *"
              value={formData.source}
              onChange={(e) => handleChange('source', e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Ex: Banque, Investisseur, Épargne..."
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Date d'entrée *"
              value={formData.entryDate}
              onChange={(e) => handleChange('entryDate', e.target.value)}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Date de retour *"
              value={formData.returnDate}
              onChange={(e) => handleChange('returnDate', e.target.value)}
              margin="normal"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              placeholder="Description détaillée de cette entrée de fonds..."
            />
          </Grid>
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
        >
          {loading ? 'Création...' : 'Créer l\'entrée'}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default EntryForm;