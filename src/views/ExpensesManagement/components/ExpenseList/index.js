// src/pages/ExpensesManagement/components/ExpenseList/index.js
import React from 'react';
import {
  Box,
  List,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import ExpenseCard from './ExpenseCard';

const ExpenseList = ({ expenses, onCancelExpense, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (expenses.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          Aucune dépense trouvée. Créez votre première dépense pour commencer.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <List sx={{ p: 0 }}>
        {expenses.map((expense, index) => (
          <ExpenseCard
            key={expense._id}
            expense={expense}
            onCancelExpense={onCancelExpense}
            showDivider={index < expenses.length - 1}
          />
        ))}
      </List>
    </Box>
  );
};

export default ExpenseList;