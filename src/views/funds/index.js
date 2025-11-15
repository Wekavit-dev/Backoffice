// src/pages/FundsManagement/index.js
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
import { Add, AccountBalance, TrendingUp } from '@mui/icons-material';
import { FundsAPI } from 'api';
import { AppContext } from 'AppContext';

// Import des composants
import FundList from './components/fundList';
import FundForm from './components/FundForm';
import FundEntries from './components/FundEntries';
import Statistics from './components/Statistics';
import Filters from './components/Filters';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FundsManagement = () => {
  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState({});
  const [fundEditData, setFundEditData] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { globalState, setGlobalState } = useContext(AppContext);

  console.log("globalState12", globalState);


  // Charger les fonds
  const loadFunds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await FundsAPI.getAllFunds(globalState?.key);
      if (response.data) {
        setFunds(response.data.data || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des fonds:', err);
      setError('Erreur lors du chargement des fonds');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    loadFunds();
  }, [refreshTrigger]);

  // Gérer la sélection d'un fonds
  const handleSelectFund = (fund) => {
    setSelectedFund(fund);
    setActiveTab(1); // Basculer vers l'onglet des entrées
  };

  // Gérer la création d'un fonds
  const handleCreateFund = async (fundData) => {
    console.log("fundEditData", fundEditData);
    if(fundEditData._id){
        const { _id, __v, name, description, currency, ...updateData } = fundEditData;
    try {
      const response = await FundsAPI.updateFund(_id, {name: fundData.name, currency: fundData.currency, description: fundData.description, ...updateData}, globalState?.key);
      if (response.data.message) {
        toast.success(response.data.message);
        setOpenForm(false);
        refreshData();
        return { success: true, message: response.message };
      }
    } catch (error) {
        console.log('error', error);
        toast.error(error.data.error);
        
      return { success: false, message: error.message };
    }
    }else{
        try {
      const response = await FundsAPI.createFund(fundData, globalState?.key);
      if (response.data.message) {
        toast.success(response.data.message);
        setOpenForm(false);
        refreshData();
        return { success: true, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
    }
  };

  // Gérer la suppression d'un fonds
  const handleDeleteFund = async (fundId) => {
    try {
      const response = await FundsAPI.deleteFund(fundId, globalState?.key);
      if (response.data.message) {
        toast.success(response.data.message);
        refreshData();
        if (selectedFund && selectedFund._id === fundId) {
          setSelectedFund(null);
        }
        return { success: true, message: response.message };
      }
    } catch (error) {
        toast.error(error.message);
        console.log("erreur", error);
        
      return { success: false, message: error.message };
    }
  };

  // Appliquer les filtres
  const filteredFunds = funds.length > 0 ? funds?.filter(fund => {
    if (filters.status && fund.status !== filters.status) return false;
    if (filters.currency && fund.currency !== filters.currency) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        fund.name.toLowerCase().includes(searchLower) ||
        fund.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }): [];


  if (loading && funds.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  console.log("selectedFund", filteredFunds);



  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Gestion des Fonds
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez vos fonds, ajoutez des entrées et suivez vos statistiques
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Nouveau Fonds
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
        />
      </Paper>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Liste des fonds */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <FundList
              funds={filteredFunds}
              selectedFund={selectedFund}
              onSelectFund={handleSelectFund}
              onDeleteFund={handleDeleteFund}
              loading={loading}
              setOpenForm={setOpenForm}
              setFundEditData={setFundEditData}
            />
          </Paper>
        </Grid>

        {/* Détails et actions */}
        <Grid item xs={12} md={8}>
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
                icon={<AccountBalance />} 
                label="Statistiques" 
                iconPosition="start" 
              />
              <Tab 
                icon={<TrendingUp />} 
                label="Entrées de Fonds" 
                iconPosition="start" 
                disabled={!selectedFund}
              />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Statistics 
                  funds={funds}
                  selectedFund={selectedFund}
                  loading={loading}
                />
              )}

              {activeTab === 1 && selectedFund && (
                <FundEntries
                  fund={selectedFund}
                  onRefresh={refreshData}
                  token={globalState?.key}
                />
              )}

              {activeTab === 1 && !selectedFund && (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  height={400}
                >
                  <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Aucun fonds sélectionné
                  </Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    Sélectionnez un fonds dans la liste pour voir ses entrées et statistiques détaillées
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de création de fonds */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <FundForm
          onSubmit={handleCreateFund}
          onCancel={() => setOpenForm(false)}
          initialData={fundEditData}
        />
      </Dialog>
    </Container>
  );
};

export default FundsManagement;