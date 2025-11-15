// src/pages/FundsManagement/components/FundEntries/index.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add, TrendingUp } from '@mui/icons-material';
import { FundsAPI } from 'api';
import EntryForm from './EntryForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FundEntries = ({ fund, onRefresh, token }) => {
  const [entries, setEntries] = useState([]);
  const [, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openForm, setOpenForm] = useState(false);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await FundsAPI.getFundEntries(fund._id, { page: 1, limit: 50 }, token);
      if (response.data) {
        setEntries(response.data.data || []);
      }
    } catch (err) {
      setError('Erreur lors du chargement des entrées');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fund) {
      loadEntries();
    }
  }, [fund]);

  const handleAddEntry = async (entryData) => {
    try {
      const response = await FundsAPI.addFundEntry(fund._id, entryData, token);
      if (response.data) {
        toast.success(response.data.message);
        setOpenForm(false);
        loadEntries();
        onRefresh();
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <Box>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Entrées de Fonds - {fund.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Gérer les entrées et sorties du fonds
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenForm(true)}
        >
          Nouvelle Entrée
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Entrées
              </Typography>
              <Typography variant="h5" fontWeight="600">
                {entries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Actives
              </Typography>
              <Typography variant="h5" fontWeight="600" color="success.main">
                {entries.filter(e => e.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Retournées
              </Typography>
              <Typography variant="h5" fontWeight="600" color="textSecondary">
                {entries.filter(e => e.status === 'returned').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Montant Total
              </Typography>
              <Typography variant="h5" fontWeight="600" color="primary.main">
                {entries.reduce((sum, entry) => sum + entry.amount, 0).toLocaleString()} {fund.currency}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Liste des entrées */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: '2px solid #ddd', fontWeight: 600 }}>Montant</TableCell>
              <TableCell sx={{ border: '2px solid #ddd', fontWeight: 600 }}>Source</TableCell>
              <TableCell sx={{ border: '2px solid #ddd', fontWeight: 600 }}>Date Entrée</TableCell>
              <TableCell sx={{ border: '2px solid #ddd', fontWeight: 600 }}>Date Retour</TableCell>
              <TableCell sx={{ border: '2px solid #ddd', fontWeight: 600 }}>Intérêts</TableCell>
              <TableCell sx={{ border: '2px solid #ddd', fontWeight: 600 }}>Statut</TableCell>
              {/* <TableCell sx={{ border: '1px solid #ddd', fontWeight: 500 }}>Actions</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id} hover>
                <TableCell sx={{ border: '1px solid #ddd' }}>
                  <Typography fontWeight="600">
                    {entry.amount.toLocaleString()} {entry.currency}
                  </Typography>
                </TableCell>
                <TableCell sx={{ border: '1px solid #ddd' }}>{entry.source}</TableCell>
                <TableCell sx={{ border: '1px solid #ddd' }}>{formatDate(entry.entryDate)}</TableCell>
                <TableCell sx={{ border: '1px solid #ddd' }}>{formatDate(entry.returnDate)}</TableCell>
                <TableCell sx={{ border: '1px solid #ddd' }}>
                  {entry.interestToReturn.toLocaleString()} {entry.currency}
                </TableCell>
                {/* <TableCell sx={{ border: '1px solid #ddd' }}>
                  <Chip
                    label={entry.status === 'active' ? 'Active' : 'Retournée'}
                    size="small"
                    color={getStatusColor(entry.status)}
                  />
                </TableCell> */}
                <TableCell sx={{ border: '1px solid #ddd' }}>
                  <IconButton size="small">
                    <TrendingUp />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell sx={{ border: '1px solid #ddd', py: 4 }} colSpan={7}>
                  <Typography color="textSecondary">
                    Aucune entrée de fonds trouvée
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog d'ajout d'entrée */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="md"
        fullWidth
      >
        <EntryForm
          fund={fund}
          onSubmit={handleAddEntry}
          onCancel={() => setOpenForm(false)}
        />
      </Dialog>
    </Box>
  );
};

export default FundEntries;