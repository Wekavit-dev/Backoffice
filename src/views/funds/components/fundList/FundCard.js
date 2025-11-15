// src/pages/FundsManagement/components/FundList/FundCard.js
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
  Edit,
  Delete,
  AccountBalance,
  Visibility
} from '@mui/icons-material';

const FundCard = ({ fund, isSelected, onSelect, onDelete, showDivider, setOpenForm, setFundEditData, selectedFund }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  console.log("selectedFund01", fund);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    handleMenuClose();
    const result = await onDelete(fund._id);
    if (result && !result.success) {
      alert(result.message); // Vous pouvez remplacer par un snackbar
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 0,
          borderBottom: showDivider ? 1 : 0,
          borderColor: 'divider',
          backgroundColor: isSelected ? '#f5f5f5' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: isSelected ? '#f5f5f5' : '#f5f5f5'
          }
        }}
        onClick={onSelect}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AccountBalance sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="600" noWrap>
                  {fund.name}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" mb={1} noWrap>
                {fund.description || 'Aucune description'}
              </Typography>
              
              {/* <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  label={fund.currency}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={fund.status === 'active' ? 'Actif' : 'Inactif'}
                  size="small"
                  color={getStatusColor(fund.status)}
                />
              </Box> */}
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    {fund.totalAmount?.toLocaleString()} {fund.currency}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Solde total
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" fontWeight="500" color="success.main">
                    {fund.availableBalance?.toLocaleString()} {fund.currency}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Disponible
                  </Typography>
                </Box>
              </Box>
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
        <MenuItem onClick={onSelect}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir détails</ListItemText>
        </MenuItem>
        <MenuItem onClick={()=>{
            setOpenForm(true);
            setFundEditData(fund);
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default FundCard;