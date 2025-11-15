// src/pages/FundsManagement/components/Filters/index.js
import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography
} from '@mui/material';
import { Clear, FilterList } from '@mui/icons-material';

const Filters = ({ filters, onFiltersChange, funds }) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  // Extraire les devises uniques
  const currencies = [...new Set(funds.map(fund => fund.currency))];

  const hasActiveFilters = Object.keys(filters).some(key => filters[key]);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <FilterList color="primary" />
        <Typography variant="h6" fontWeight="600">
          Filtres
        </Typography>
      </Box>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Rechercher..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Nom, description..."
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status || ''}
              label="Statut"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
              <MenuItem value="suspended">Suspendu</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Devise</InputLabel>
            <Select
              value={filters.currency || ''}
              label="Devise"
              onChange={(e) => handleFilterChange('currency', e.target.value)}
            >
              <MenuItem value="">Toutes</MenuItem>
              {currencies.map(currency => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            size="small"
            sx={{ textTransform: 'none', py: 1 }}
          >
            Effacer
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Filters;