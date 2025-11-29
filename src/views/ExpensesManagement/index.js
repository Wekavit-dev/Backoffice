// src/pages/ExpensesManagement/index.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog
} from '@mui/material';
import { Add, Category, Analytics } from '@mui/icons-material';
import { ExpensesAPI, FundsAPI } from 'api';
import { showSuccess, showError } from 'utils/notifications';
import { AppContext } from 'AppContext';

// Import des composants
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import ExpenseTypes from './components/ExpenseTypes';
import Statistics from './components/Statistics';
import Filters from './components/Filters';

const ExpensesManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [funds, setFunds] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { globalState, setGlobalState } = useContext(AppContext);

  console.log(setGlobalState)

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les dépenses
      const expensesResponse = await ExpensesAPI.getAllExpenses({ page: 1, limit: 100 }, globalState?.key);
      if (expensesResponse.data.data) {
        setExpenses(expensesResponse.data.data);
      }

      // Charger les fonds
      const fundsResponse = await FundsAPI.getAllFunds(globalState?.key);
      if (fundsResponse.data.data) {
        setFunds(fundsResponse.data.data);
      }

      // Charger les types de dépenses
      const typesResponse = await ExpensesAPI.getAllExpenseTypes(globalState?.key);
      if (typesResponse.data.data) {
        setExpenseTypes(typesResponse.data.data);
      }

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Gérer la création d'une dépense
  const handleCreateExpense = async (expenseData) => {
    try {
      const response = await ExpensesAPI.createExpense(expenseData, globalState?.key);
      if (response.data.message) {
        setOpenForm(false);
        refreshData();
        showSuccess('Dépense créée avec succès');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur lors de la création: ${error.message}`);
      return { success: false, message: error.message };
    }
  };

  // Gérer l'annulation d'une dépense
  const handleCancelExpense = async (expenseId) => {
    try {
      const response = await ExpensesAPI.cancelExpense(expenseId, globalState?.key);
      if (response.data.message) {
        refreshData();
        showSuccess('Dépense annulée avec succès');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur lors de l'annulation: ${error.message}`);
      return { success: false, message: error.message };
    }
  };

  // Gérer la création d'un type de dépense
  const handleCreateExpenseType = async (typeData) => {
    try {
      const response = await ExpensesAPI.createExpenseType(typeData, globalState?.key);
      if (response.data.message) {
        refreshData();
        showSuccess('Type de dépense créé avec succès');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur lors de la création: ${error.message}`);
      return { success: false, message: error.message };
    }
  };

  // Appliquer les filtres
  const filteredExpenses = expenses.filter(expense => {
    if (filters.fundId && expense.fund._id !== filters.fundId) return false;
    if (filters.expenseTypeId && expense.expenseType._id !== filters.expenseTypeId) return false;
    if (filters.status && expense.status !== filters.status) return false;
    if (filters.startDate && new Date(expense.expenseDate) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(expense.expenseDate) > new Date(filters.endDate)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        expense.reason.toLowerCase().includes(searchLower) ||
        expense.fund.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading && expenses.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Gestion des Dépenses
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez vos dépenses, catégories et suivez vos statistiques
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
          sx={{
            backgroundColor: '#d32f2f',
            '&:hover': { backgroundColor: '#c62828' }
          }}
        >
          Nouvelle Dépense
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Filters 
          filters={filters} 
          onFiltersChange={setFilters}
          funds={funds}
          expenseTypes={expenseTypes}
        />
      </Paper>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Liste des dépenses */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ borderRadius: 2, minHeight: 600 }}>
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: 1, 
                borderColor: 'divider',
                backgroundColor: '#f8f9fa'
              }}
            >
              <Typography variant="h6" fontWeight="600">
                Dépenses ({filteredExpenses.length})
              </Typography>
            </Box>
            <ExpenseList
              expenses={filteredExpenses}
              onCancelExpense={handleCancelExpense}
              loading={loading}
            />
          </Paper>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ borderRadius: 2, minHeight: 600 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': { fontWeight: 500 }
              }}
            >
              <Tab 
                icon={<Analytics />} 
                label="Statistiques" 
                iconPosition="start" 
              />
              <Tab 
                icon={<Category />} 
                label="Types" 
                iconPosition="start" 
              />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Statistics 
                  expenses={expenses}
                  loading={loading}
                />
              )}

              {activeTab === 1 && (
                <ExpenseTypes
                  expenseTypes={expenseTypes}
                  onCreateExpenseType={handleCreateExpenseType}
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de création de dépense */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <ExpenseForm
          funds={funds}
          expenseTypes={expenseTypes}
          onSubmit={handleCreateExpense}
          onCancel={() => setOpenForm(false)}
        />
      </Dialog>
    </Container>
  );
};

export default ExpensesManagement;