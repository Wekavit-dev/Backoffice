// src/pages/FundsManagement/components/Statistics/index.js
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
  AccountBalance,
  Savings,
  Money,
  TrendingUp
} from '@mui/icons-material';

const Statistics = ({ funds, selectedFund, loading }) => {
  // Statistiques globales
  const globalStats = {
    totalFunds: funds.length,
    totalBalance: funds.reduce((sum, fund) => sum + (fund.totalAmount || 0), 0),
    totalAvailable: funds.reduce((sum, fund) => sum + (fund.availableBalance || 0), 0),
    totalAllocated: funds.reduce((sum, fund) => sum + (fund.allocatedBalance || 0), 0),
    activeFunds: funds.filter(fund => fund.status === 'active').length
  };

  // Statistiques par devise
  const statsByCurrency = funds.reduce((acc, fund) => {
    if (!acc[fund.currency]) {
      acc[fund.currency] = {
        currency: fund.currency,
        totalBalance: 0,
        totalAvailable: 0,
        count: 0
      };
    }
    acc[fund.currency].totalBalance += fund.totalAmount || 0;
    acc[fund.currency].totalAvailable += fund.availableBalance || 0;
    acc[fund.currency].count += 1;
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
      <Typography variant="h5" mb={2} fontWeight="600" gutterBottom>
        Statistiques {selectedFund ? `- ${selectedFund.name}` : 'Globales'}
      </Typography>

      {selectedFund ? (
        // Statistiques du fonds sélectionné
        <Grid container spacing={3}mt={2} >
          <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'primary.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <AccountBalance sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Solde Total
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                        {selectedFund.totalAmount?.toLocaleString()} {selectedFund.currency}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'success.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <Savings sx={{ fontSize: 20, color: 'success.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Disponible
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                         {selectedFund.availableBalance?.toLocaleString()} {selectedFund.currency}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'warning.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <Money sx={{ fontSize: 20, color: 'warning.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Alloué
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                         {selectedFund.allocatedBalance?.toLocaleString()} {selectedFund.currency}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'info.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <TrendingUp sx={{ fontSize: 20, color: 'info.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Entrées
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                         {selectedFund.entries?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
        </Grid>
      ) : (
        // Statistiques globales
        <>
          {/* Cartes principales */}
          <Grid container spacing={3} mb={4} sx={{ p: 0, backgroundColor: ''}}>
            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'primary.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <AccountBalance sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Total Fonds
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                        {globalStats.totalFunds}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'success.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <Money sx={{ fontSize: 20, color: 'success.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Solde Global
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                        {globalStats.totalBalance.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'info.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <Savings sx={{ fontSize: 20, color: 'info.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Disponible
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                        {globalStats.totalAvailable.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card sx={{ borderRadius: 1 }}>
                <CardContent sx={{ p:0, borderRadius: 0 }}>
                  <Box 
                  sx={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderTop: '2px solid',
                    borderTopColor: 'warning.main',
                    // borderColor: 'rgba(0,0,0,0.09)',
                    flexDirection: 'column',
                    display: 'flex',
                    gap: 0,
                    p: 1
                  }}
                  >
                    <TrendingUp sx={{ fontSize: 20, color: 'warning.main' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' , mt: 0.5 }}>
                      <Typography color="textSecondary" variant='h6' gutterBottom>
                        Actifs
                      </Typography>
                      <Typography sx={{ width: '100%', textAlign: 'right' }} variant="h4" fontWeight="600">
                        {globalStats.activeFunds}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Statistiques par devise */}
          <Typography variant="h6" gutterBottom fontWeight="600">
            Répartition par Devise
          </Typography>
          <Grid container spacing={2}>
            {Object.values(statsByCurrency).map((currencyStats) => (
              <Grid item xs={12} md={6} key={currencyStats.currency}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      {currencyStats.currency}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Fonds:</Typography>
                      <Typography fontWeight="600">{currencyStats.count}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Solde Total:</Typography>
                      <Typography fontWeight="600">
                        {currencyStats.totalBalance.toLocaleString()} {currencyStats.currency}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Disponible:</Typography>
                      <Typography fontWeight="600" color="success.main">
                        {currencyStats.totalAvailable.toLocaleString()} {currencyStats.currency}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {funds.length === 0 && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Aucun fonds disponible. Créez votre premier fonds pour voir les statistiques.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default Statistics;