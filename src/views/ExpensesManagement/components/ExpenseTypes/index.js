// src/pages/ExpensesManagement/components/ExpenseTypes/index.js
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Add, Category } from '@mui/icons-material';

const ExpenseTypes = ({ expenseTypes, onCreateExpenseType }) => {
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'operationnel'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'operationnel', label: 'Opérationnel', color: 'primary' },
    { value: 'administratif', label: 'Administratif', color: 'secondary' },
    { value: 'marketing', label: 'Marketing', color: 'success' },
    { value: 'technique', label: 'Technique', color: 'warning' },
    { value: 'divers', label: 'Divers', color: 'info' }
  ];

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

    if (!formData.name.trim()) {
      setError('Le nom est obligatoire');
      setLoading(false);
      return;
    }

    const result = await onCreateExpenseType(formData);
    if (result && result.success) {
      setFormData({ name: '', description: '', category: 'operationnel' });
      setOpenForm(false);
    } else if (result && !result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : 'default';
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <Box>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="600">
          Types de Dépenses
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
          size="small"
        >
          Nouveau Type
        </Button>
      </Box>

      {/* Liste des types */}
      <Grid container spacing={2}>
        {expenseTypes.map((type) => (
          <Grid item xs={12} key={type._id}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Category sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="600">
                        {type.name}
                      </Typography>
                      <Chip
                        label={getCategoryLabel(type.category)}
                        size="small"
                        color={getCategoryColor(type.category)}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {type.description || 'Aucune description'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="textSecondary">
                      {type.isActive ? 'Actif' : 'Inactif'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {expenseTypes.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              Aucun type de dépense créé. Créez votre premier type pour commencer.
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Dialog de création de type */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>
            <Typography variant="h6" fontWeight="600">
              Nouveau Type de Dépense
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
              label="Nom *"
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
              rows={2}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Catégorie *</InputLabel>
              <Select
                value={formData.category}
                label="Catégorie *"
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setOpenForm(false)} disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ExpenseTypes;