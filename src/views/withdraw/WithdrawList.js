import React, { useState, useEffect, useContext } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { Input } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AppContext } from 'AppContext';
import { WithdrawAPI } from 'api';

const columns = [
  { id: 'telephone', label: 'Numéro de retrait', minWidth: 170 },
  { id: 'montant', label: 'Montant', minWidth: 100, align: 'center' },
  {
    id: 'devise',
    label: 'Devise',
    minWidth: 170,
    align: 'right'
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 170,
    align: 'right'
  },
  { id: 'dateOperation', label: 'Date de retrait', minWidth: 170, align: 'right' },
  {
    id: 'Actions',
    label: 'Actions',
    minWidth: 170,
    align: 'right'
  }
];

export default function WithdrawList() {
  const { globalState } = useContext(AppContext);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [withdraws, setWithdraws] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchInput, setSearchInput] = useState('');

  function createData(withdraw) {
    const { telephone, dateOperation, montant, idDevise, etat } = withdraw;
    const Actions = (
      <div>
        <IconButton color="primary" onClick={() => handleValidate(withdraw)}>
          <CheckCircleOutlineIcon />
        </IconButton>
        <IconButton color="secondary" onClick={() => handleReject(withdraw)}>
          <CancelIcon />
        </IconButton>
      </div>
    );

    return { telephone, dateOperation, montant, devise: idDevise?.nom, status: etat, Actions };
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  useEffect(() => {
    const data = { idCountry: globalState?.idPays };
    WithdrawAPI.getWithdrawsByCountry(data, globalState?.key)
      .then((res) => {
        if (res.data) {
          let response = res.data;
          let status = res.status;
          if (status === 200 || status === 201) {
            setWithdraws(response.data);
          }
        } else {
          const response = res.response;
          console.log(response);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [globalState]);

  const handleRefresh = () => {
    // Fetch data again when refresh button is clicked
    const data = { idCountry: globalState?.idPays };
    WithdrawAPI.getWithdrawsByCountry(data, globalState?.key)
      .then((res) => {
        if (res.data) {
          let response = res.data;
          let status = res.status;
          if (status === 200 || status === 201) {
            toast.success('Tableau actualiser avec success !', { position: toast.POSITION.TOP_RIGHT });
            setWithdraws(response.data);
          }
        } else {
          const response = res.response;
          console.log(response);
        }
      })
      .catch((err) => {
        toast.error('Actualisation échoué. Veuillez vous réconnecter.', { position: toast.POSITION.TOP_RIGHT });
        console.log(err);
      });
  };

  const handleValidate = async (withdraw) => {
    try {
      const data = {
        idWithdraw: withdraw.id,
        valid: 'validated'
      };
      const response = await WithdrawAPI.validWithdraw(withdraw.idUser, data, globalState?.key);

      // Check if the response indicates success
      if (response.status === 200 || response.status === 201) {
        setWithdraws((prevWithdraws) => prevWithdraws.filter((w) => w.id !== withdraw.id));
        toast.success('Retrait validé avec succès !', { position: toast.POSITION.TOP_RIGHT });
      } else {
        toast.error('Échec de validation. Veuillez réessayer.', { position: toast.POSITION.TOP_RIGHT });
      }
    } catch (error) {
      // Handle errors from the API request
      console.error('Error validating deposit:', error);
      toast.error("Une erreur s'est produite lors de la validation du retrait.", { position: toast.POSITION.TOP_RIGHT });
    }
  };

  const handleReject = async (withdraw) => {
    try {
      const data = {
        idWithdraw: withdraw.id,
        valid: 'rejected'
      };

      const response = await WithdrawAPI.validWithdraw(withdraw.idUser, data, globalState?.key);

      if (response.status === 200 || response.status === 201) {
        // Remove the rejected withdraw from the state
        setWithdraws((prevWithdraws) => prevWithdraws.filter((w) => w.id !== withdraw.id));
        toast.success('Retrait refusé avec succès !', { position: toast.POSITION.TOP_RIGHT });
      } else {
        toast.error('Échec du refus. Veuillez réessayer.', { position: toast.POSITION.TOP_RIGHT });
      }
    } catch (error) {
      console.error('Error rejecting withdraw:', error);
      toast.error("Une erreur s'est produite lors du refus du retrait.", { position: toast.POSITION.TOP_RIGHT });
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow sx={{ background: 'black', color: 'white' }}>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {withdraws
              .filter((withdraw) => {
                // Check status filter and search input
                const statusCondition = statusFilter === 'all' || withdraw.etat.toLowerCase() === statusFilter.toLowerCase();
                const searchCondition = !searchInput || (withdraw.telephone && withdraw.telephone.toString().includes(searchInput));

                return statusCondition && searchCondition;
              })
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((withdraw) => {
                const rowData = createData(withdraw);
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={withdraw._id}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={
                          column.id === 'status' && withdraw.etat === 'pending'
                            ? { color: 'orange' }
                            : column.id === 'status' && withdraw.etat === 'rejected'
                            ? { color: 'red' }
                            : {}
                        }
                      >
                        {column.format && typeof rowData[column.id] === 'number' ? column.format(rowData[column.id]) : rowData[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, mt: 2 }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="status-filter-label">Filtrer statut</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Filter Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Toutes</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="rejected">Rejeté</MenuItem>
            </Select>
          </FormControl>

          {/* Add the search input field */}
          <FormControl sx={{ minWidth: 180, ml: 5, mt: 0.5 }}>
            <InputLabel htmlFor="search-input">Rechercher un numéro</InputLabel>
            <Input id="search-input" type="text" value={searchInput} onChange={handleSearchInputChange} />
          </FormControl>

          {/* Add the refresh button */}
          <Box sx={{ mt: 2, ml: 5 }}>
            <IconButton color="primary" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <TablePagination
          rowsPerPageOptions={[10, 20]}
          component="div"
          count={withdraws.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
        />
      </Box>
    </Paper>
  );
}
