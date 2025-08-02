/* eslint-disable no-unexpected-multiline */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */


import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RefreshIcon from '@mui/icons-material/Refresh';
import numeral from 'numeral';
import { CircularProgress } from '@mui/material';
import CustomDeleteIconChips from './amount';
import Chip from '@mui/material/Chip';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppContext } from 'AppContext';
import { DepositsAPI } from 'api'; // Assuming DepositsAPI still exists and might contain general methods
import { locekdSavesAPI } from 'api'; // Assuming you'll have a new API file or section for general lists
import Grid from '@mui/material/Grid'; // Import Grid

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  '&.pending': {
    color: 'orange',
  },
  '&.rejected': {
    color: 'red',
  },
  '&.validated': {
    color: 'green',
  },
}));

export default function CustomizedTables() {
  const { globalState } = useContext(AppContext);
  const [savings, setSavings] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedStatus,] = useState('all');
  const [searchCodeTransaction] = useState('');
  const [editedRow, setEditedRow] = useState(null);
  const [minDays, setMinDays] = useState('');
  const [maxDays, setMaxDays] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [withdrawn, setWithdrawn] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // New states for lists from API
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [savingTypes, setSavingTypes] = useState([]);

  // New states for selected filter values
  const [selectedCountry, setSelectedCountry] = useState('all'); // 'all' or actual country ID
  const [selectedCurrency, setSelectedCurrency] = useState('all'); // 'all' or actual currency ID
  const [selectedSavingType, setSelectedSavingType] = useState('all'); // 'all' or actual Type epargnes
  const [totalData, setTotalData] = useState(null); // 'All' or 'actual total amount fetched
  const [totalInterests, setTotalInterests] = useState(null); // 'All' or 'actual total interest of amount fetched

  /**
   * Fetches the list of savings based on current filters.
   */
  const fetchSavings = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        // Only include filter parameters if they are not 'all' or empty
        ...(selectedCountry !== 'all' && { idCountry: selectedCountry }),
        ...(selectedSavingType !== 'all' && { typeEpargneId: selectedSavingType }),
        ...(minDays && { minDays }),
        ...(maxDays && { maxDays }),
        ...(minAmount && { minAmount }),
        ...(maxAmount && { maxAmount }),
        ...(selectedCurrency !== 'all' && { idDevise: selectedCurrency }),
        ...(withdrawn !== 'all' && { withdrawn }),
        // The API controller does not support codeTransaction, so it's filtered client-side.
      };

      await locekdSavesAPI.filterSavingsForInvestment(params, globalState?.key).then((res)=>{
      console.log('res===>', res);
      if (res.data) {
        setSavings(res.data.data);
        setTotalData(res.data.totalAmount);
        setTotalInterests(res.data.totalInterest);
        setTotalRecords(res.total);
        setLoading(false);
      }
      }).catch((err)=>{
        console.error('Failed to fetch savings data:', err);
        setLoading(false);
        // toast.error('Échec de la récupération des données d\'épargne.', { position: toast.POSITION.TOP_RIGHT });

      });
      

      // if (res.data) {
      //   setSavings(res.data);
      //   setTotalRecords(res.total);
      // } else {
      //   console.error('Failed to fetch savings data:', res.response);
      //   toast.error('Échec de la récupération des données d\'épargne.', { position: toast.POSITION.TOP_RIGHT });
      // }
    } catch (err) {
      console.error('Error fetching savings:', err);
      toast.error('Une erreur est survenue lors de la récupération des épargnes.', { position: toast.POSITION.TOP_RIGHT });
    }
  };

  /**
   * Fetches auxiliary data (countries, currencies, saving types).
   */
  const fetchAuxiliaryData = async () => {
    try {
      // Fetch Countries
      const countryRes = await locekdSavesAPI.getCountries
      (globalState?.key);
      console.log('countryRes', countryRes);
      
      if (countryRes.data && countryRes.status === 200) {
        setCountries(countryRes.data.data);
      } else {
        console.error('Failed to fetch countries:', countryRes.response);
      }

      // Fetch Currencies
      const currencyRes = await locekdSavesAPI.getCurriences(globalState?.key);
      console.log('currencyRes', currencyRes);
      if (currencyRes.data && currencyRes.status === 200) {
        setCurrencies(currencyRes.data.data);
      } else {
        console.error('Failed to fetch currencies:', currencyRes.response);
      }

      // Fetch Saving Types
      const savingTypeRes = await locekdSavesAPI.getSavingTypes(globalState?.key);
      console.log('savingTypeRes', savingTypeRes);
      if (savingTypeRes.data && savingTypeRes.status === 200) {
        setSavingTypes(savingTypeRes.data.data);
      } else {
        console.error('Failed to fetch saving types:', savingTypeRes.response);
      }
    } catch (error) {
      console.error('Error fetching auxiliary data:', error);
      toast.error('Une erreur est survenue lors de la récupération des listes de filtres.', { position: toast.POSITION.TOP_RIGHT });
    }
  };

  // Effect to fetch auxiliary data on component mount
  useEffect(() => {
    fetchAuxiliaryData();
  }, [globalState?.key]);

  // Effect to fetch savings whenever filter dependencies change
  useEffect(() => {
    fetchSavings();
  }, [page, limit, selectedCountry, selectedSavingType, selectedCurrency, withdrawn]);

  const handleRefresh = () => {
    fetchSavings();
    fetchAuxiliaryData(); // Also refresh filter options
  };

  const handleChangeAndResetPage = (setter) => (event) => {
    setter(event.target.value);
    setPage(1); // Reset to first page on filter change
  };

   const handleMinDaysInputChange = (event) => {
    setMinDays(event.target.value);
  };

  const handleMinDaysBlur = () => {
    setPage(1); // Reset page on blur
    fetchSavings(); // Trigger API call on blur
  };

  const handleMaxDaysInputChange = (event) => {
    setMaxDays(event.target.value);
  };

  const handleMaxDaysBlur = () => {
    setPage(1); // Reset page on blur
    fetchSavings(); // Trigger API call on blur
  };

  const handleMinAmountInputChange = (event) => {
    setMinAmount(event.target.value);
  };

  const handleMinAmountBlur = () => {
    setPage(1); // Reset page on blur
    fetchSavings(); // Trigger API call on blur
  };

  const handleMaxAmountInputChange = (event) => {
    setMaxAmount(event.target.value);
  };

  const handleMaxAmountBlur = () => {
    setPage(1); // Reset page on blur
    fetchSavings(); // Trigger API call on blur
  };

  const handleCountryChange = handleChangeAndResetPage(setSelectedCountry);
  const handleSavingTypeChange = handleChangeAndResetPage(setSelectedSavingType);
  const handleMinDaysChange = handleChangeAndResetPage(setMinDays);
  const handleMaxDaysChange = handleChangeAndResetPage(setMaxDays);
  const handleMinAmountChange = handleChangeAndResetPage(setMinAmount);
  const handleMaxAmountChange = handleChangeAndResetPage(setMaxAmount);
  const handleCurrencyChange = handleChangeAndResetPage(setSelectedCurrency);
  const handleWithdrawnChange = handleChangeAndResetPage(setWithdrawn);

  // Client-side filter for codeTransaction (since API doesn't support it directly)
  // const filteredSavings = savings.filter((saving) => {
  //   const statusCondition = selectedStatus === 'all' || saving.etat === selectedStatus;
  //   const searchCondition = saving.codeTransaction && saving.codeTransaction.toLowerCase().includes(searchCodeTransaction.toLowerCase());
  //   return statusCondition && searchCondition;
  // });
 

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditedRow(null);
  };

  const handleModalSubmit = async () => {
    try {
      const { _id, idUser, montantInitial } = editedRow; // Use _id from MongoDB and montantInitial
      const data = {
        idEpargne: _id, // Use idEpargne for the API call
        valid: 'validated',
        montant: parseFloat(montantInitial), // Ensure it's a number
      };

      // Placeholder: Replace with your actual Savings update API call
      const response = await DepositsAPI.validDeposit(idUser?._id, data, globalState?.key); // Pass idUser._id

      if (response.status === 200 || response.status === 201) {
        toast.success('Épargne modifiée & validée avec succès !', { position: toast.POSITION.TOP_RIGHT });
        fetchSavings();
        handleCloseModal();
      } else {
        toast.error('Échec de modification. Veuillez réessayer.', { position: toast.POSITION.TOP_RIGHT });
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error updating saving:', error);
      toast.error("Une erreur s'est produite lors de la modification de l'épargne.", { position: toast.POSITION.TOP_RIGHT });
      handleCloseModal();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('fr-FR', options);
    const timePart = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const formattedTime = timePart.replace(':', 'h');
    const finalFormattedDate = formattedDate.replace(/, \d{2}:\d{2}/, '');
    return `${finalFormattedDate} à ${formattedTime}`;
  };

  const calculateDaysDiff = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  console.log('data===', savings);
  

  return (
    <div>
      <Box mb={2} sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, p: 2, boxShadow: 0 }}>
        {/* Use Grid Container here */}
        <Grid container spacing={2} alignItems="flex-end">

          {/* Filter by Country */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Pays:
            </Typography>
            <Select value={selectedCountry} onChange={handleCountryChange} variant="filled" size="small" fullWidth>
              <MenuItem value="all">Tous les pays</MenuItem>
              {countries.map((country) => (
                <MenuItem key={country._id} value={country._id}>{country.nom}</MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Filter by Type d'épargne */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Type d'épargne:
            </Typography>
            <Select value={selectedSavingType} onChange={handleSavingTypeChange} variant="filled" size="small" fullWidth>
              <MenuItem value="all">Tous</MenuItem>
              {savingTypes.map((type) => (
                <MenuItem key={type._id} value={type._id}>{type.designation}</MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Filter by Min/Max Days */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Durée (jours):
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                label="Min"
                type="number"
                value={minDays}
                onChange={handleMinDaysInputChange} // Update state on every change
                onBlur={handleMinDaysBlur}       // Trigger API call on blur
                variant="filled"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="Max"
                type="number"
                value={maxDays}
                onChange={handleMaxDaysInputChange} // Update state on every change
                onBlur={handleMaxDaysBlur}       // Trigger API call on blur
                variant="filled"
                size="small"
                sx={{ flexGrow: 1 }}
              />
            </Box>
          </Grid>

          {/* Filter by Min/Max Amount */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Montant:
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                label="Min"
                type="number"
                value={minAmount}
                onChange={handleMinAmountInputChange} // Update state on every change
                onBlur={handleMinAmountBlur}       // Trigger API call on blur
                variant="filled"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="Max"
                type="number"
                value={maxAmount}
                onChange={handleMaxAmountInputChange} // Update state on every change
                onBlur={handleMaxAmountBlur}       // Trigger API call on blur
                variant="filled"
                size="small"
                sx={{ flexGrow: 1 }}
              />
            </Box>
          </Grid>

          {/* Filter by Currency */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Devise:
            </Typography>
            <Select value={selectedCurrency} onChange={handleCurrencyChange} variant="filled" size="small" fullWidth>
              <MenuItem value="all">Toutes les devises</MenuItem>
              {currencies.map((curr) => (
                <MenuItem key={curr._id} value={curr._id}>{`${curr.unite} (${curr.idPays.code})`}</MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Filter by Withdrawn Status */}
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Retiré:
            </Typography>
            <Select value={withdrawn} onChange={handleWithdrawnChange} variant="filled" size="small" fullWidth>
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="true">Oui</MenuItem>
              <MenuItem value="false">Non</MenuItem>
            </Select>
          </Grid>

          {/* Refresh Button */}
          
        </Grid>
      </Box>

      {!loading && <Box mb={2} sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, p: 2, boxShadow: 0, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
        <CustomDeleteIconChips data={totalData} interest={totalInterests} />
      </Box>}



      <TableContainer sx={{ mt: 3 }} component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Type d'épargne</StyledTableCell>
              <StyledTableCell align="right">Montant Initial</StyledTableCell>
              <StyledTableCell align="right">Montant Total</StyledTableCell>
              <StyledTableCell align="right">Intérêt</StyledTableCell>
              <StyledTableCell align="right">Devise</StyledTableCell>
              <StyledTableCell align="right">Durée (jours)</StyledTableCell>
              <StyledTableCell align="right">Statut</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? 
            <TableRow sx={{ height: '300px' }}>
                <StyledTableCell colSpan={11} align="center">
                  <CircularProgress size="2.8rem"color="success"/>
                </StyledTableCell>
              </TableRow>
            : 
            savings.length === 0 ? (
              <TableRow>
                <StyledTableCell colSpan={11} align="center">
                  Aucune épargne trouvée avec les filtres actuels.
                </StyledTableCell>
              </TableRow>
            ) : (
              savings.map((row) => (
                <StyledTableRow  key={row._id}>
                  <StyledTableCell sx={{ paddingY: 2.5, fontSize: '2rem' }} align="left">{row.idTypeEpargne?.designation || 'N/A'}</StyledTableCell>
                  <StyledTableCell align="right">{numeral(row.montantInitial).format('0,0')}</StyledTableCell>
                  <StyledTableCell align="right">{numeral(row.montantTotal).format('0,0')}</StyledTableCell>
                  <StyledTableCell align="right">{numeral(row.interet).format('0,0')}</StyledTableCell>
                  <StyledTableCell align="right">{row.idDevise?.unite || 'N/A'}</StyledTableCell>
                  <StyledTableCell align="right">{calculateDaysDiff(row.startDate, row.endDate)}</StyledTableCell>
                  <StyledTableCell align="right" className={row.etat ? row.etat.toLowerCase() : ''}>
                    {row.withdrawn === true ? <Chip
                            label='retiré'
                            color="default"
                    /> : <Chip
                            label='en cours'
                            color="success"
                    /> }
                  </StyledTableCell>

                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for editing */}
      <Modal open={isModalOpen} onClose={handleCloseModal} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            sx={{ position: 'absolute', top: 10, right: 25 }}
          >
            <CloseIcon />
          </IconButton>
          <Typography id="modal-title" variant="h5" component="div" sx={{ fontSize: '1.5rem', mb: 2 }}>
            Modifier Montant Épargne
          </Typography>
          <TextField
            fullWidth
            label="Montant"
            variant="outlined"
            margin="normal"
            type="number"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            value={editedRow?.montantInitial || ''}
            onChange={(e) => setEditedRow({ ...editedRow, montantInitial: e.target.value })}
          />
          <Button variant="contained" color="primary" onClick={handleModalSubmit} sx={{ width: '100%', mt: 2 }}>
            Modifier & Valider
          </Button>
        </Box>
      </Modal>
    </div>
  );
}