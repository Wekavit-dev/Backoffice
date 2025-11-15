// src/pages/ExpensesManagement/components/Filters/index.js
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

const Filters = ({ filters, onFiltersChange, funds, expenseTypes }) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

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
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Rechercher..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Raison, fonds..."
            size="small"
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Fonds</InputLabel>
            <Select
              value={filters.fundId || ''}
              label="Fonds"
              onChange={(e) => handleFilterChange('fundId', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {funds.map(fund => (
                <MenuItem key={fund._id} value={fund._id}>
                  {fund.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.expenseTypeId || ''}
              label="Type"
              onChange={(e) => handleFilterChange('expenseTypeId', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {expenseTypes.map(type => (
                <MenuItem key={type._id} value={type._id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.status || ''}
              label="Statut"
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="completed">Complétée</MenuItem>
              <MenuItem value="cancelled">Annulée</MenuItem>
              <MenuItem value="failed">Échouée</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Date début"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                label="Date fin"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={12} jusCtifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            size="small"
          >
            Effacer
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Filters;