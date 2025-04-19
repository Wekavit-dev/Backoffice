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

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppContext } from 'AppContext';
import { DepositsAPI } from 'api';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  }
}));

export default function CustomizedTables() {
  const { globalState } = useContext(AppContext);
  const [deposits, setDeposits] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEtat, setSelectedEtat] = useState('pending');
  const [searchCodeTransaction, setSearchCodeTransaction] = useState('');
  const [editedRow, setEditedRow] = useState(null);

  const handleEtatChange = (event) => {
    setSelectedEtat(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchCodeTransaction(event.target.value);
  };

  const filteredDeposits = deposits.filter((deposit) => {
    const etatCondition = selectedEtat === 'all' || deposit.etat === selectedEtat;
    const searchCondition = deposit.codeTransaction && deposit.codeTransaction.includes(searchCodeTransaction);
    return etatCondition && searchCondition;
  });

  useEffect(() => {
    const data = { idCountry: globalState?.idPays };
    DepositsAPI.getAllDepositsByCountry(data, globalState?.key)
      .then((res) => {
        if (res.data) {
          let response = res.data;
          let status = res.status;
          if (status === 200 || status === 201) {
            setDeposits(response.data);
          }
        } else {
          const response = res.response;
          console.log(response);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleRefresh = () => {
    // Perform the API call to refetch the list of deposits
    DepositsAPI.getAllDepositsByCountry({ idCountry: globalState?.idPays }, globalState?.key)
      .then((res) => {
        if (res.data) {
          let response = res.data;
          let status = res.status;
          if (status === 200 || status === 201) {
            setDeposits(response.data);
          }
        } else {
          const response = res.response;
          console.log(response);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleValidate = async (id, userId) => {
    try {
      const data = {
        idDepot: id,
        valid: 'validated'
      };
      const response = await DepositsAPI.validDeposit(userId, data, globalState?.key);

      // Check if the response indicates success
      if (response.status === 200 || response.status === 201) {
        setDeposits((prevDeposits) => prevDeposits.filter((deposit) => deposit.id !== id));
        toast.success('Dépôt validé avec succès !', { position: toast.POSITION.TOP_RIGHT });
      } else {
        toast.error('Échec de validation. Veuillez réessayer.', { position: toast.POSITION.TOP_RIGHT });
      }
    } catch (error) {
      // Handle errors from the API request
      console.error('Error validating deposit:', error);
      toast.error("Une erreur s'est produite lors de la validation du dépôt.", { position: toast.POSITION.TOP_RIGHT });
    }
  };

  const handleReject = async (id, userId) => {
    try {
      const data = {
        idDepot: id,
        valid: 'rejected'
      };
      const response = await DepositsAPI.validDeposit(userId, data, globalState?.key);

      // Check if the response indicates success
      if (response.status === 200 || response.status === 201) {
        setDeposits((prevDeposits) => prevDeposits.filter((deposit) => deposit.id !== id));
        toast.success('Dépôt rejeté avec succès !', { position: toast.POSITION.TOP_RIGHT });
      } else {
        toast.error('Échec du rejet. Veuillez réessayer.', { position: toast.POSITION.TOP_RIGHT });
      }
    } catch (error) {
      // Handle errors from the API request
      console.error('Error rejecting deposit:', error);
      toast.error("Une erreur s'est produite lors du rejet du dépôt.", { position: toast.POSITION.TOP_RIGHT });
    }
  };

  const handleUpdate = (row) => {
    setEditedRow(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    // Close the modal and reset the state
    setModalOpen(false);
    setEditedRow(null);
  };

  const handleModalSubmit = async () => {
    try {
      const { id, idUser, updatedValue } = editedRow;
      const data = {
        idDepot: id,
        valid: 'validated',
        montant: updatedValue
      };

      const response = await DepositsAPI.validDeposit(idUser, data, globalState?.key);

      if (response.status === 200 || response.status === 201) {
        setDeposits((prevDeposits) => prevDeposits.filter((deposit) => deposit.id !== id));
        setEditedRow(null);
        handleCloseModal();
        toast.success('Dépôt modifié & validé avec succès !', { position: toast.POSITION.TOP_RIGHT });
      } else {
        handleCloseModal();
        setEditedRow(null);
        toast.error('Échec de modification. Veuillez réessayer.', { position: toast.POSITION.TOP_RIGHT });
      }
    } catch (error) {
      handleCloseModal();
      setEditedRow(null);
      console.error('Error updating deposit:', error);
      toast.error("Une erreur s'est produite lors de la modification du dépôt.", { position: toast.POSITION.TOP_RIGHT });
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    const formattedDate = new Date(dateString).toLocaleDateString('fr-FR', options);

    // Extract the time part and format it as HHhmm
    const timePart = new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const formattedTime = timePart.replace(':', 'h');

    // Remove the time and the comma at the end of the date
    const finalFormattedDate = formattedDate.replace(/, \d{2}:\d{2}/, '');

    return `${finalFormattedDate} à ${formattedTime}`;
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14
    },
    '&.pending': {
      color: 'orange'
    },
    '&.rejected': {
      color: 'red'
    }
  }));

  return (
    <div>
      <Box mb={2} position="fix" top={0} bgcolor="white" zIndex={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box display="flex" justifyContent="center" mr={2} alignItems="center">
            {/* Select for filtering deposits */}
            <Box mr={2}>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Filtrer par statut:
              </Typography>
              <Select value={selectedEtat} onChange={handleEtatChange} variant="outlined">
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="rejected">Rejetée</MenuItem>
              </Select>
            </Box>

            {/* Refresh Button */}
            <Box mt={4}>
              <IconButton aria-label="update" mt={10} onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Input for searching by codeTransaction */}
          <Box ml={2}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Recherche par code de transaction:
            </Typography>
            <TextField
              value={searchCodeTransaction}
              onChange={handleSearchChange}
              variant="outlined"
              fullWidth
              placeholder="Entrer le code de transaction"
            />
          </Box>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Code Transaction</StyledTableCell>
              <StyledTableCell align="right">Montant</StyledTableCell>
              <StyledTableCell align="right">Devise</StyledTableCell>
              <StyledTableCell align="right">Status</StyledTableCell>
              <StyledTableCell align="right">Date & heure</StyledTableCell>
              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDeposits.map((row) => (
              <StyledTableRow key={row.id}>
                <StyledTableCell component="th" scope="row">
                  {row.codeTransaction}
                </StyledTableCell>
                <StyledTableCell align="right">{numeral(row.montantInitial).format('0,0')}</StyledTableCell>
                <StyledTableCell align="right">{row.unite}</StyledTableCell>
                <StyledTableCell align="right" className={row.etat.toLowerCase()}>
                  <Typography variant="body1">{row.etat}</Typography>
                </StyledTableCell>
                <StyledTableCell align="right">{formatDate(row.dateDepot)}</StyledTableCell>
                <StyledTableCell align="right">
                  <IconButton aria-label="validate" onClick={() => handleValidate(row.id, row.idUser)}>
                    <CheckIcon />
                  </IconButton>
                  <IconButton aria-label="reject" onClick={() => handleReject(row.id, row.idUser)}>
                    <CloseIcon />
                  </IconButton>
                  <IconButton aria-label="update" onClick={() => handleUpdate(row)}>
                    <EditIcon />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
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
            borderRadius: 2
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
            Modifier Balance
          </Typography>
          <TextField
            fullWidth
            label="Balance"
            variant="outlined"
            margin="normal"
            type="number"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            value={editedRow?.updatedValue || ''}
            onChange={(e) => setEditedRow({ ...editedRow, updatedValue: e.target.value })}
          />
          <Button variant="contained" color="primary" onClick={handleModalSubmit} sx={{ width: '100%', mt: 2 }}>
            Modifier
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
