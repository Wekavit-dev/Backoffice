// src/pages/FundsManagement/components/FundForm/index.js
import React, { useState } from 'react';
import {
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  Alert
} from '@mui/material';

const FundForm = ({ onSubmit, onCancel, initialData, fundEditData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    currency: 'FBU',
    settings: {
      autoUpdateBalance: true,
      allowOverdraft: false,
      overdraftLimit: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencies = [
    { value: 'FBU', label: 'Franc Burundais (FBU)' },
    { value: 'USD', label: 'Dollar Américain (USD)' },
    { value: 'FC', label: 'Franc Congolais (FC)' },
    { value: 'FRW', label: 'Franc Rwandais (FRW)' }
  ];

  const handleChange = (field, value) => {
    if (field.startsWith('settings.')) {
      const settingField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Le nom du fonds est obligatoire');
      setLoading(false);
      return;
    }

    const result = await onSubmit(formData);
    if (result && !result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogTitle>
        <Typography variant="h5" fontWeight="600">
          {initialData ? 'Modifier le Fonds' : 'Nouveau Fonds'}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Nom du fonds *"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          margin="normal"
          variant="outlined"
        />

        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Devise *</InputLabel>
          <Select
            value={formData.currency}
            label="Devise *"
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            {currencies.map(currency => (
              <MenuItem key={currency.value} value={currency.value}>
                {currency.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Paramètres
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={formData.settings.autoUpdateBalance}
                onChange={(e) => handleChange('settings.autoUpdateBalance', e.target.checked)}
              />
            }
            label="Mise à jour automatique du solde"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.settings.allowOverdraft}
                onChange={(e) => handleChange('settings.allowOverdraft', e.target.checked)}
              />
            }
            label="Autoriser le découvert"
          />

          {formData.settings.allowOverdraft && (
            <TextField
              fullWidth
              type="number"
              label="Limite de découvert"
              value={formData.settings.overdraftLimit}
              onChange={(e) => handleChange('settings.overdraftLimit', parseFloat(e.target.value) || 0)}
              margin="normal"
              variant="outlined"
            />
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: '#1976d2' }}
        >
          {loading ? 'Création...' : (initialData ? 'Modifier' : 'Créer')}
        </Button>
      </DialogActions>
    </Box>
  );
};

export default FundForm;