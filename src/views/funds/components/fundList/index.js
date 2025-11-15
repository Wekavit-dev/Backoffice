// src/pages/FundsManagement/components/FundList/index.js
import React from 'react';
import {
  Box,
  List,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import FundCard from './FundCard';
import { create } from 'yup/lib/Reference';

const FundList = ({ funds, selectedFund, onSelectFund, onDeleteFund, loading, setOpenForm, setFundEditData }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (funds.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Aucun fonds trouvé. Créez votre premier fonds pour commencer.
        </Alert>
      </Box>
    );
  }

  console.log("funds", funds);
  

  return (
    <Box>
      {/* En-tête de la liste */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Typography variant="h6" fontWeight="600">
          Fonds ({funds.length})
        </Typography>
      </Box>

      {/* Liste des fonds */}
      <List sx={{ p: 0 }}>
        {funds.map((fund, index) => {
            console.log('fund012', fund);
            return (
          <FundCard
            key={fund._id}
            fund={{...fund, createdBy: fund?.createdBy?._id || null}}
            selectedFund={selectedFund}
            isSelected={selectedFund?._id === fund._id}
            onSelect={() => onSelectFund(fund)}
            onDelete={onDeleteFund}
            showDivider={index < funds.length - 1}
            setOpenForm={setOpenForm}
            setFundEditData={setFundEditData}
          />
        )
        })}
      </List>
    </Box>
  );
};

export default FundList;