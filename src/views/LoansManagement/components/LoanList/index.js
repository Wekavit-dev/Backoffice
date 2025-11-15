// src/pages/LoansManagement/components/LoanList/index.js
import React from 'react';
import {
  Box,
  List,
  Typography,
  CircularProgress,
  Alert,
  Chip,} from '@mui/material';
import { Warning } from '@mui/icons-material';
import LoanCard from './LoanCard';

const LoanList = ({ 
  loans, 
  selectedLoan, 
  onSelectLoan, 
  onApproveLoan, 
  onCancelLoan, 
  onCompleteLoan, 
  onGenerateDocument,
  loading 
}) => {
  // Calcul des métriques
  const metrics = {
    total: loans.length,
    active: loans.filter(loan => loan.status === 'approved').length,
    pending: loans.filter(loan => loan.status === 'pending').length,
    overdue: loans.filter(loan => {
      return loan.status === 'active' && new Date(loan.endDate) < new Date();
    }).length
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (loans.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Aucun prêt trouvé. Créez votre premier prêt pour commencer.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête avec métriques */}
      <Box 
        sx={{ 
          p: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: '#f8f9fa',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="600">
            Prêts ({metrics.total})
          </Typography>
          <Box display="flex" gap={1}>
            {metrics.overdue > 0 && (
              <Chip
                icon={<Warning />}
                label={`${metrics.overdue} en retard`}
                color="error"
                variant="outlined"
                size="small"
              />
            )}
            {/* <Chip
              icon={<TrendingUp />}
              label={`${metrics.active} actifs`}
              color="success"
              variant="outlined"
              size="small"
            /> */}
          </Box>
        </Box>

        {/* Métriques rapides */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={1}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#1976d2' 
              }} 
            />
            <Typography variant="body2" color="textSecondary">
              En attente: <strong>{metrics.pending}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#2e7d32' 
              }} 
            />
            <Typography variant="body2" color="textSecondary">
              Actifs: <strong>{metrics.active}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: '#ed6c02' 
              }} 
            />
            <Typography variant="body2" color="textSecondary">
              Complétés: <strong>{loans.filter(l => l.status === 'completed').length}</strong>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Liste des prêts */}
      <List sx={{ p: 0 }}>
        {loans.map((loan, index) => (
          <LoanCard
            key={loan._id}
            loan={loan}
            isSelected={selectedLoan?._id === loan._id}
            onSelect={() => onSelectLoan(loan)}
            onApprove={onApproveLoan}
            onCancel={onCancelLoan}
            onComplete={onCompleteLoan}
            onGenerateDocument={onGenerateDocument}
            showDivider={index < loans.length - 1}
          />
        ))}
      </List>
    </Box>
  );
};

export default LoanList;