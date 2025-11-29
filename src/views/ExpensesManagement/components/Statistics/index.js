// src/pages/ExpensesManagement/components/Statistics/index.js
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Receipt,
  TrendingUp
} from '@mui/icons-material';

const Statistics = ({ expenses, loading }) => {
  // Calcul des statistiques
  const stats = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
    completedExpenses: expenses.filter(e => e.status === 'completed').length,
    pendingExpenses: expenses.filter(e => e.status === 'pending').length,
    cancelledExpenses: expenses.filter(e => e.status === 'cancelled').length
  };

  // Statistiques par type
  const statsByType = expenses.reduce((acc, expense) => {
    const typeName = expense.expenseType?.name || 'Non défini';
    if (!acc[typeName]) {
      acc[typeName] = { totalAmount: 0, count: 0 };
    }
    acc[typeName].totalAmount += expense.amount || 0;
    acc[typeName].count += 1;
    return acc;
  }, {});

  // Statistiques par fonds
  const statsByFund = expenses.reduce((acc, expense) => {
    const fundName = expense.fund?.name || 'Non défini';
    if (!acc[fundName]) {
      acc[fundName] = { totalAmount: 0, count: 0, currency: expense.currency };
    }
    acc[fundName].totalAmount += expense.amount || 0;
    acc[fundName].count += 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Statistiques des Dépenses
      </Typography>

      {/* Cartes principales */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Receipt sx={{ fontSize: 32, color: 'error.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Dépenses
                  </Typography>
                  <Typography variant="h5" fontWeight="600">
                    {stats.totalExpenses}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp sx={{ fontSize: 32, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Montant Total
                  </Typography>
                  <Typography variant="h5" fontWeight="600" color="error.main">
                    {stats.totalAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Complétées
              </Typography>
              <Typography variant="h6" fontWeight="600" color="success.main">
                {stats.completedExpenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                En Attente
              </Typography>
              <Typography variant="h6" fontWeight="600" color="warning.main">
                {stats.pendingExpenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Annulées
              </Typography>
              <Typography variant="h6" fontWeight="600" color="textSecondary">
                {stats.cancelledExpenses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Répartition par type */}
      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
        Par Type
      </Typography>
      <Grid container spacing={1} mb={3}>
        {Object.entries(statsByType).slice(0, 5).map(([typeName, data]) => (
          <Grid item xs={12} key={typeName}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight="500">
                    {typeName}
                  </Typography>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight="600">
                      {data.totalAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {data.count} dépense(s)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Répartition par fonds */}
      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
        Par Fonds
      </Typography>
      <Grid container spacing={1}>
        {Object.entries(statsByFund).slice(0, 5).map(([fundName, data]) => (
          <Grid item xs={12} key={fundName}>
            <Card variant="outlined">
              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" fontWeight="500">
                    {fundName}
                  </Typography>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight="600">
                      {data.totalAmount.toLocaleString()} {data.currency}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {data.count} dépense(s)
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {expenses.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune dépense disponible. Créez votre première dépense pour voir les statistiques.
        </Alert>
      )}
    </Box>
  );
};

export default Statistics;