// src/pages/LoansManagement/index.js
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
import { Add, ReceiptLong, Description, Analytics } from '@mui/icons-material';
import { LoansAPI, FundsAPI } from 'api';
import { showSuccess, showError, showWarning, showInfo } from 'utils/notifications';
import { AppContext } from 'AppContext';

// Import des composants
import LoanList from './components/LoanList';
import LoanForm from './components/LoanForm';
import LoanDetails from './components/LoanDetails';
import Documents from './components/Documents';
import Statistics from './components/Statistics';
import Filters from './components/Filters';

const LoansManagement = () => {
  const [loans, setLoans] = useState([]);
  const [funds, setFunds] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { globalState, setGlobalState } = useContext(AppContext);


  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les prêts
      const loansResponse = await LoansAPI.getAllLoans({ page: 1, limit: 100 }, globalState?.key);
      if (loansResponse.data.data) {
        setLoans(loansResponse.data.data);
      }

      // Charger les fonds
      const fundsResponse = await FundsAPI.getAllFunds(globalState?.key);
      if (fundsResponse.data.data) {
        setFunds(fundsResponse.data.data);
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

  // Gérer la création d'un prêt
  const handleCreateLoan = async (loanData) => {
    try {
      const response = await LoansAPI.createLoan(loanData, globalState?.key);
      if (response.data.message) {
        setOpenForm(false);
        refreshData();
        showSuccess('Prêt créé avec succès');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur lors de la création: ${error.data.message}`);
      return { success: false, message: error.data.message };
    }
  };

  // Gérer l'approbation d'un prêt
  const handleApproveLoan = async (loanId) => {
    try {
      const response = await LoansAPI.approveLoan(loanId, globalState?.key);
      if (response.data.message) {
        refreshData();
        showSuccess('Prêt approuvé avec succès');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur lors de l'approbation: ${error.data.message}`);
      return { success: false, message: error.data.message };
    }
  };

  // Gérer l'annulation d'un prêt
  const handleCancelLoan = async (loanId) => {
    try {
      const response = await LoansAPI.cancelLoan(loanId, globalState?.key);
      if (response.data.message) {
        refreshData();
        if (selectedLoan && selectedLoan._id === loanId) {
          setSelectedLoan(null);
        }
        showSuccess('Prêt annulé avec succès');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur lors de l'annulation: ${error.data.message}`);
      return { success: false, message: error.data.message };
    }
  };

  // Gérer la complétion d'un prêt
  const handleCompleteLoan = async (loanId) => {
    try {
      const response = await LoansAPI.completeLoan(loanId, globalState?.key);
      if (response.data.message) {
        refreshData();
        showSuccess('Prêt marqué comme complété');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur: ${error.data.message}`);
      return { success: false, message: error.data.message };
    }
  };

  // Gérer la génération de document
  const handleGenerateDocument = async (loanId) => {
    try {
      showInfo('Génération du document en cours...');
      const response = await LoansAPI.generateLoanAgreement(loanId, globalState?.key);
      
      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contrat-pret-${loanId}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSuccess('Document généré et téléchargé avec succès');
      refreshData(); // Rafraîchir pour mettre à jour les infos du document
      
    } catch (error) {
      showError(`Erreur lors de la génération: ${error.data.message}`);
    }
  };

  // Gérer le marquage comme signé
  const handleMarkAsSigned = async (loanId) => {
    try {
      const response = await LoansAPI.markDocumentSigned(loanId, globalState?.key);
      if (response.data.message) {
        refreshData();
        showSuccess('Document marqué comme signé');
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      showError(`Erreur: ${error.data.message}`);
      return { success: false, message: error.data.message };
    }
  };

  // Appliquer les filtres
  const filteredLoans = loans.filter(loan => {
    if (filters.status && loan.status !== filters.status) return false;
    if (filters.fundId && loan.fund._id !== filters.fundId) return false;
    if (filters.currency && loan.currency !== filters.currency) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        loan.beneficiary.firstName.toLowerCase().includes(searchLower) ||
        loan.beneficiary.lastName.toLowerCase().includes(searchLower) ||
        loan.beneficiary.email.toLowerCase().includes(searchLower) ||
        loan.fund.name.toLowerCase().includes(searchLower)
      );
    }
    if (filters.startDate && new Date(loan.startDate) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(loan.startDate) > new Date(filters.endDate)) return false;
    return true;
  });

  if (loading && loans.length === 0) {
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
            Gestion des Prêts
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez les prêts, générez des contrats et suivez les remboursements
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
          sx={{
            backgroundColor: '#2e7d32',
            '&:hover': { backgroundColor: '#1b5e20' },
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
          }}
        >
          Nouveau Prêt
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Filters 
          filters={filters} 
          onFiltersChange={setFilters}
          funds={funds}
          loans={loans}
        />
      </Paper>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Liste des prêts */}
        <Grid item xs={12} md={selectedLoan ? 6 : 12}>
          <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
            <LoanList
              loans={filteredLoans}
              selectedLoan={selectedLoan}
              onSelectLoan={setSelectedLoan}
              onApproveLoan={handleApproveLoan}
              onCancelLoan={handleCancelLoan}
              onCompleteLoan={handleCompleteLoan}
              onGenerateDocument={handleGenerateDocument}
              loading={loading}
            />
          </Paper>
        </Grid>

        {/* Détails du prêt sélectionné */}
        {selectedLoan && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ borderRadius: 3, boxShadow: 2, minHeight: 600 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '& .MuiTab-root': { fontWeight: 500, textTransform: 'none' }
                }}
              >
                <Tab 
                  icon={<ReceiptLong />} 
                  label="Détails" 
                  iconPosition="start" 
                />
                <Tab 
                  icon={<Description />} 
                  label="Documents" 
                  iconPosition="start" 
                />
                <Tab 
                  icon={<Analytics />} 
                  label="Statistiques" 
                  iconPosition="start" 
                />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <LoanDetails
                    loan={selectedLoan}
                    onRefresh={refreshData}
                  />
                )}

                {activeTab === 1 && (
                  <Documents
                    loan={selectedLoan}
                    onGenerateDocument={handleGenerateDocument}
                    onMarkAsSigned={handleMarkAsSigned}
                    onDownloadDocument={() => handleGenerateDocument(selectedLoan._id)}
                  />
                )}

                {activeTab === 2 && (
                  <Statistics 
                    loan={selectedLoan}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Dialog de création de prêt */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <LoanForm
          funds={funds}
          onSubmit={handleCreateLoan}
          onCancel={() => setOpenForm(false)}
        />
      </Dialog>
    </Container>
  );
};

export default LoansManagement;