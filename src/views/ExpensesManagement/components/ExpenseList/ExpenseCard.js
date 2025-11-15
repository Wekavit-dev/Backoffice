// src/pages/ExpensesManagement/components/ExpenseList/ExpenseCard.js
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
  ListItemText
} from '@mui/material';
import {
  MoreVert,
  Cancel,
  Receipt,
  Info
} from '@mui/icons-material';
import { showError, showWarning } from 'utils/notifications';

const ExpenseCard = ({ expense, onCancelExpense, showDivider }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCancel = async () => {
    handleMenuClose();
    if (expense.status !== 'completed') {
      showWarning('Seules les dépenses complétées peuvent être annulées');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir annuler cette dépense ?')) {
      const result = await onCancelExpense(expense._id);
      if (result && !result.success) {
        showError(result.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'default';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Complétée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'failed': return 'Échouée';
      default: return status;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 0,
          borderBottom: showDivider ? 1 : 0,
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Receipt sx={{ fontSize: 20, color: 'error.main' }} />
                <Typography variant="h6" fontWeight="600" noWrap flex={1}>
                  {expense.reason}
                </Typography>
                <Chip
                  label={getStatusText(expense.status)}
                  size="small"
                  color={getStatusColor(expense.status)}
                />
              </Box>
              
              <Typography variant="body2" color="textSecondary" mb={1}>
                Fonds: <strong>{expense.fund?.name}</strong> • 
                Type: <strong>{expense.expenseType?.name}</strong>
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="body2" color="textSecondary">
                  {formatDate(expense.expenseDate)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  •
                </Typography>
                <Typography variant="body2" fontWeight="600" color="error.main">
                  {expense.amount?.toLocaleString()} {expense.currency}
                </Typography>
              </Box>

              {/* Entrées allouées */}
              {expense.allocatedEntries && expense.allocatedEntries.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" color="textSecondary">
                    Alloué sur {expense.allocatedEntries.length} entrée(s)
                  </Typography>
                </Box>
              )}
            </Box>
            
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Info fontSize="small" />
          </ListItemIcon>
          <ListItemText>Détails</ListItemText>
        </MenuItem>
        
        {expense.status === 'completed' && (
          <MenuItem onClick={handleCancel} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Cancel fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Annuler</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ExpenseCard;