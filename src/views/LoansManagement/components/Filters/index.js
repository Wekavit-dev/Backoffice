// src/pages/LoansManagement/components/Filters/index.js
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
  Chip,
  Typography
} from '@mui/material';
import { Clear, FilterList, Warning } from '@mui/icons-material';

const Filters = ({ filters, onFiltersChange, funds, loans }) => {
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

  // Statistiques pour les filtres
  const stats = {
    total: loans.length,
    overdue: loans.filter(loan => 
      loan.status === 'active' && new Date(loan.endDate) < new Date()
    ).length,
    pending: loans.filter(loan => loan.status === 'pending').length,
    active: loans.filter(loan => loan.status === 'approved').length
  };

  // Devises uniques
  const currencies = [...new Set(loans.map(loan => loan.currency))];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterList color="primary" />
          <Typography variant="h6" fontWeight="600">
            Filtres
          </Typography>
        </Box>
        
        {/* Statistiques rapides */}
        <Box display="flex" gap={1} flexWrap="wrap">
          {stats.overdue > 0 && (
            <Chip
              icon={<Warning />}
              label={`${stats.overdue} en retard`}
              color="error"
              size="small"
              variant="outlined"
            />
          )}
          <Chip
            label={`${stats.pending} en attente`}
            color="primary"
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${stats.active} actifs`}
            color="success"
            size="small"
            variant="outlined"
          />
        </Box>
      </Box>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Rechercher..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Nom, email, téléphone..."
            size="small"
          />
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
              <MenuItem value="approved">Approuvé</MenuItem>
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="completed">Complété</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
              <MenuItem value="defaulted">En défaut</MenuItem>
            </Select>
          </FormControl>
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
            fullWidth
            variant="outlined"
            startIcon={<Clear />}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            size="small"
            sx={{ height: 40 }}
          >
            Effacer
          </Button>
        </Grid>
      </Grid>

      {/* Filtres actifs */}
      {hasActiveFilters && (
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            let label = '';
            switch (key) {
              case 'status':
                label = `Statut: ${value}`;
                break;
              case 'fundId':
                const fund = funds.find(f => f._id === value);
                label = `Fonds: ${fund?.name}`;
                break;
              case 'currency':
                label = `Devise: ${value}`;
                break;
              case 'search':
                label = `Recherche: "${value}"`;
                break;
              case 'startDate':
                label = `À partir du: ${new Date(value).toLocaleDateString('fr-FR')}`;
                break;
              case 'endDate':
                label = `Jusqu'au: ${new Date(value).toLocaleDateString('fr-FR')}`;
                break;
              default:
                label = `${key}: ${value}`;
            }

            return (
              <Chip
                key={key}
                label={label}
                size="small"
                onDelete={() => handleFilterChange(key, '')}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Filters;