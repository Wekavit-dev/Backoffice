// src/pages/LoansManagement/components/LoanDetails/index.js
import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  AccountBalance,
  Schedule,
  TrendingUp,
  Receipt
} from '@mui/icons-material';

const LoanDetails = ({ loan }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = loan.status === 'active' && new Date(loan.endDate) < new Date();
  const daysRemaining = Math.ceil((new Date(loan.endDate) - new Date()) / (1000 * 60 * 60 * 24));

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'completed': return 'primary';
      case 'cancelled': return 'default';
      case 'defaulted': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'completed': return 'Complété';
      case 'cancelled': return 'Annulé';
      case 'defaulted': return 'En défaut';
      default: return status;
    }
  };

  return (
    <Box>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            {loan.beneficiary.firstName} {loan.beneficiary.lastName}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Détails du prêt #{loan._id.slice(-8)}
          </Typography>
        </Box>
        <Chip
          label={getStatusText(loan.status)}
          color={getStatusColor(loan.status)}
          variant="filled"
          size="medium"
        />
      </Box>

      {isOverdue && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Ce prêt est en retard de {Math.abs(daysRemaining)} jours !
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Informations financières */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                Informations Financières
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccountBalance color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Montant du prêt"
                    secondary={`${loan.amount?.toLocaleString()} ${loan.currency}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Taux d'intérêt"
                    secondary={`${loan.interestRate}%`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Receipt color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Total à rembourser"
                    secondary={`${loan.totalAmount?.toLocaleString()} ${loan.currency}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Durée"
                    secondary={`${loan.days} jours`}
                  />
                </ListItem>
              </List>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  Fonds:
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {loan.fund?.name}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dates et délais */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                Dates et Délais
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Date de début
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {formatDate(loan.startDate)}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Date de fin
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {formatDate(loan.endDate)}
                </Typography>
              </Box>

              {loan.status === 'active' && (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Jours restants
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="600" 
                    color={daysRemaining < 7 ? 'error' : 'success'}
                  >
                    {daysRemaining > 0 ? daysRemaining : Math.abs(daysRemaining)} jours
                    {daysRemaining <= 0 && ' (en retard)'}
                  </Typography>
                </Box>
              )}

              {loan.createdAt && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="textSecondary">
                    Créé le {formatDate(loan.createdAt)}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Informations du bénéficiaire */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                Informations du Bénéficiaire
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Nom complet
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {loan.beneficiary.firstName} {loan.beneficiary.lastName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Email color="action" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {loan.beneficiary.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Phone color="action" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Téléphone
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {loan.beneficiary.phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Adresse
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {loan.beneficiary.address}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {loan.beneficiary.identification && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2">
                    <strong>Identification:</strong> {loan.beneficiary.identification}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Entrées allouées */}
        {loan.allocatedEntries && loan.allocatedEntries.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                  Entrées de Fonds Allouées
                </Typography>
                
                <List>
                  {loan.allocatedEntries.map((allocation, index) => (
                    <ListItem key={index} divider={index < loan.allocatedEntries.length - 1}>
                      <ListItemText
                        primary={`Entrée ${index + 1}`}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Montant alloué: {allocation.allocatedAmount?.toLocaleString()} {loan.currency}
                            </Typography>
                            <Typography variant="body2">
                              Restant après allocation: {allocation.remainingAfterAllocation?.toLocaleString()} {loan.currency}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default LoanDetails;