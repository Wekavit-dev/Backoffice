// src/pages/LoansManagement/components/Statistics/index.js
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Schedule,
  Warning,
  CheckCircle,
  Payment
} from '@mui/icons-material';

const Statistics = ({ loan }) => {
  // Calculs pour les statistiques
  const calculations = {
    progress: Math.min(100, Math.max(0, 
      ((new Date() - new Date(loan.startDate)) / 
      (new Date(loan.endDate) - new Date(loan.startDate))) * 100
    )),
    daysRemaining: Math.ceil((new Date(loan.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
    isOverdue: loan.status === 'active' && new Date(loan.endDate) < new Date(),
    interestAmount: loan.totalAmount - loan.amount,
    dailyPayment: loan.totalAmount / loan.days
  };

  const formatCurrency = (amount) => {
    return `${amount?.toLocaleString()} ${loan.currency}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusInfo = () => {
    switch (loan.status) {
      case 'active':
        return {
          color: calculations.isOverdue ? 'error' : 'success',
          message: calculations.isOverdue 
            ? `En retard de ${Math.abs(calculations.daysRemaining)} jours`
            : `${calculations.daysRemaining} jours restants`
        };
      case 'pending':
        return { color: 'warning', message: 'En attente d\'approbation' };
      case 'approved':
        return { color: 'info', message: 'Approuvé, en attente de déblocage' };
      case 'completed':
        return { color: 'primary', message: 'Prêt complété avec succès' };
      case 'cancelled':
        return { color: 'default', message: 'Prêt annulé' };
      default:
        return { color: 'default', message: loan.status };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Statistiques du Prêt
      </Typography>

      {/* Statut et progression */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">
              État du Prêt
            </Typography>
            <Chip
              label={statusInfo.message}
              color={statusInfo.color}
              variant="filled"
            />
          </Box>

          {loan.status === 'active' && (
            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Progression
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {Math.round(calculations.progress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={calculations.progress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: calculations.isOverdue ? '#d32f2f' : '#2e7d32',
                    borderRadius: 4
                  }
                }}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Début: {formatDate(loan.startDate)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Fin: {formatDate(loan.endDate)}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Récapitulatif financier */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                Récapitulatif Financier
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalance color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Capital prêté"
                    secondary={formatCurrency(loan.amount)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Intérêts"
                    secondary={formatCurrency(calculations.interestAmount)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Payment color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total à rembourser"
                    secondary={formatCurrency(loan.totalAmount)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Paiement quotidien moyen"
                    secondary={formatCurrency(calculations.dailyPayment.toFixed(2))}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: '#e8f5e8', 
                  borderRadius: 2,
                  border: '1px solid #c8e6c9'
                }}
              >
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Taux d'intérêt effectif
                </Typography>
                <Typography variant="h5" fontWeight="700" color="#2e7d32">
                  {loan.interestRate}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Informations temporelles */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                Informations Temporelles
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date de début"
                    secondary={formatDate(loan.startDate)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date de fin"
                    secondary={formatDate(loan.endDate)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Durée totale"
                    secondary={`${loan.days} jours`}
                  />
                </ListItem>

                {loan.status === 'active' && (
                  <ListItem>
                    <ListItemIcon>
                      <Warning color={calculations.isOverdue ? "error" : "warning"} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Jours restants"
                      secondary={
                        <Typography 
                          color={calculations.isOverdue ? "error" : "textPrimary"}
                          fontWeight="600"
                        >
                          {calculations.daysRemaining > 0 ? calculations.daysRemaining : Math.abs(calculations.daysRemaining)} jours
                          {calculations.isOverdue && ' (en retard)'}
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>

              <Divider sx={{ my: 2 }} />

              {loan.createdAt && (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Date de création
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {formatDate(loan.createdAt)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Analyse de performance */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                Analyse de Performance
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: '#e8f5e8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: '3px solid #2e7d32'
                      }}
                    >
                      <Typography variant="h5" fontWeight="700" color="#2e7d32">
                        {loan.interestRate}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Taux de rendement
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: calculations.isOverdue ? '#ffebee' : '#e8f5e8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: `3px solid ${calculations.isOverdue ? '#d32f2f' : '#2e7d32'}`
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        fontWeight="700" 
                        color={calculations.isOverdue ? '#d32f2f' : '#2e7d32'}
                      >
                        {Math.round(calculations.progress)}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Progression du prêt
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: calculations.daysRemaining < 7 ? '#fff3e0' : '#e8f5e8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        border: `3px solid ${calculations.daysRemaining < 7 ? '#ed6c02' : '#2e7d32'}`
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        fontWeight="700" 
                        color={calculations.daysRemaining < 7 ? '#ed6c02' : '#2e7d32'}
                      >
                        {calculations.daysRemaining > 0 ? calculations.daysRemaining : Math.abs(calculations.daysRemaining)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      Jours {calculations.isOverdue ? 'de retard' : 'restants'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Alertes importantes */}
              {calculations.isOverdue && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#ffebee', 
                    borderRadius: 2,
                    border: '1px solid #ffcdd2'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Warning color="error" />
                    <Typography variant="subtitle2" fontWeight="600" color="error">
                      Prêt en retard
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="error">
                    Ce prêt est en retard de {Math.abs(calculations.daysRemaining)} jours. 
                    Prenez contact avec le bénéficiaire pour régulariser la situation.
                  </Typography>
                </Box>
              )}

              {calculations.daysRemaining > 0 && calculations.daysRemaining <= 7 && !calculations.isOverdue && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    backgroundColor: '#fff3e0', 
                    borderRadius: 2,
                    border: '1px solid #ffe0b2'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Warning color="warning" />
                    <Typography variant="subtitle2" fontWeight="600" color="warning.dark">
                      Échéance proche
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="warning.dark">
                    Ce prêt arrive à échéance dans {calculations.daysRemaining} jours. 
                    Préparez le processus de remboursement.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics;