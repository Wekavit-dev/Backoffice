// src/pages/LoansManagement/components/LoanList/LoanCard.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Avatar
} from '@mui/material';
import {
  MoreVert,
  CheckCircle,
  Cancel,
  Description,
  Schedule,
  Warning,
  TrendingUp
} from '@mui/icons-material';
import { showError, showWarning, showInfo } from 'utils/notifications';

const LoanCard = ({ 
  loan, 
  isSelected, 
  onSelect, 
  onApprove, 
  onCancel, 
  onComplete, 
  onGenerateDocument,
  showDivider 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = async () => {
    handleMenuClose();
    if (loan.status !== 'pending') {
      showWarning('Seuls les prêts en attente peuvent être approuvés');
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir approuver le prêt de ${loan.beneficiary.firstName} ${loan.beneficiary.lastName} ?`)) {
      const result = await onApprove(loan._id);
      if (result && !result.success) {
        showError(result.message);
      }
    }
  };

  const handleCancel = async () => {
    handleMenuClose();
    if (!['pending', 'approved'].includes(loan.status)) {
      showWarning('Seuls les prêts en attente ou approuvés peuvent être annulés');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir annuler ce prêt ?')) {
      const result = await onCancel(loan._id);
      if (result && !result.success) {
        showError(result.message);
      }
    }
  };

  const handleComplete = async () => {
    handleMenuClose();
    if (loan.status !== 'active') {
      showWarning('Seuls les prêts actifs peuvent être complétés');
      return;
    }

    if (window.confirm('Marquer ce prêt comme complété ?')) {
      const result = await onComplete(loan._id);
      if (result && !result.success) {
        showError(result.message);
      }
    }
  };

  const handleGenerateDoc = async () => {
    handleMenuClose();
    showInfo('Génération du document en cours...');
    await onGenerateDocument(loan._id);
  };

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

  const isOverdue = loan.status === 'active' && new Date(loan.endDate) < new Date();
  const progress = Math.min(100, Math.max(0, 
    ((new Date() - new Date(loan.startDate)) / 
    (new Date(loan.endDate) - new Date(loan.startDate))) * 100
  ));

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 0,
          borderBottom: showDivider ? 1 : 0,
          borderColor: 'divider',
          backgroundColor: isSelected ? '#e8f5e8' : 'white',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            backgroundColor: isSelected ? '#e8f5e8' : '#fafafa',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          },
          '&::before': isSelected ? {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: '#2e7d32'
          } : {}
        }}
        onClick={onSelect}
      >
        {/* Badge de retard */}
        {isOverdue && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1
            }}
          >
            <Chip
              icon={<Warning />}
              label="En retard"
              color="error"
              size="small"
            />
          </Box>
        )}

        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            {/* Avatar du bénéficiaire */}
            <Avatar
              sx={{
                width: 50,
                height: 50,
                backgroundColor: '#2196f3',
                color: 'white',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)'
              }}
            >
              {getInitials(loan.beneficiary.firstName, loan.beneficiary.lastName)}
            </Avatar>

            <Box flex={1} minWidth={0}>
              {/* En-tête */}
              <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
                <Box flex={1} minWidth={0}>
                  <Typography variant="h6" fontWeight="600" noWrap sx={{ mb: 0.5 }}>
                    {loan.beneficiary.firstName} {loan.beneficiary.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {loan.beneficiary.email} • {loan.beneficiary.phone}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" gap={1} ml={1}>
                  <Chip
                    label={getStatusText(loan.status)}
                    size="small"
                    color={getStatusColor(loan.status)}
                    variant={isSelected ? "filled" : "outlined"}
                  />
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </Box>

              {/* Montants */}
              <Box display="flex" alignItems="center" gap={3} mb={2}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Montant
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="#2e7d32">
                    {loan.amount?.toLocaleString()} {loan.currency}
                  </Typography>
                </Box>
                
                <Box sx={{ color: 'text.secondary' }}>
                  <TrendingUp sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  <Typography variant="body2" component="span">
                    {loan.interestRate}%
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Total à rendre
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {loan.totalAmount?.toLocaleString()} {loan.currency}
                  </Typography>
                </Box>
              </Box>

              {/* Informations supplémentaires */}
              <Box display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="textSecondary">
                    {formatDate(loan.startDate)} - {formatDate(loan.endDate)}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary">
                  •
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  {loan.days} jours
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  •
                </Typography>
                
                <Typography variant="body2" color="textSecondary">
                  Fonds: <strong>{loan.fund?.name}</strong>
                </Typography>
              </Box>

              {/* Barre de progression */}
              {loan.status === 'active' && (
                <Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: isOverdue ? '#d32f2f' : '#2e7d32',
                        borderRadius: 3
                      }
                    }}
                  />
                  <Box display="flex" justifyContent="space-between" mt={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      Début: {formatDate(loan.startDate)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {Math.round(progress)}% écoulé
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Fin: {formatDate(loan.endDate)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Actions selon le statut */}
        {loan.status === 'pending' && (
          <MenuItem onClick={handleApprove}>
            <ListItemIcon>
              <CheckCircle color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText>Approuver le prêt</ListItemText>
          </MenuItem>
        )}

        {loan.status === 'active' && (
          <MenuItem onClick={handleComplete}>
            <ListItemIcon>
              <CheckCircle color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText>Marquer comme complété</ListItemText>
          </MenuItem>
        )}

        {['pending', 'approved'].includes(loan.status) && (
          <MenuItem onClick={handleCancel} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Cancel color="error" fontSize="small" />
            </ListItemIcon>
            <ListItemText>Annuler le prêt</ListItemText>
          </MenuItem>
        )}

        {/* Génération de document */}
        <MenuItem onClick={handleGenerateDoc}>
          <ListItemIcon>
            <Description color="info" fontSize="small" />
          </ListItemIcon>
          <ListItemText>Générer le contrat</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default LoanCard;