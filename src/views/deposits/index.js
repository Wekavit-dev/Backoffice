/* eslint-disable no-unused-vars */
// material-ui
import React, { useEffect, useState, useContext } from 'react';

import {
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Box,
  Chip,
  LinearProgress,
  Modal,
  IconButton,
  Fade,
  Backdrop,
  Divider,
  Skeleton
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { IconTrendingUp, IconMoneybag, IconCalendarTime, IconUsers, IconInbox, IconMapPin, IconCurrencyDollar } from '@tabler/icons';
import { AppContext } from 'AppContext';
import DepositsApi from 'api/deposits/deposit';

// project imports
import MainCard from 'ui-component/cards/MainCard';

const DepositsPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [deposits, setDeposits] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // Mock data - Replace with actual API call
  const mockDepositsData = [
    {
      id: 1,
      codeTransaction: 'DEP001',
      dateDepot: '2024-08-15',
      montant: 50000,
      unite: 'BIF',
      etat: 'Validé',
      checkedBy: 'Admin System',
      country: 'Burundi',
      userName: 'Jean Baptiste',
      timeDeposit: '10:30'
    },
    {
      id: 2,
      codeTransaction: 'DEP002',
      dateDepot: '2024-08-15',
      montant: 75000,
      unite: 'BIF',
      etat: 'En Attente',
      checkedBy: null,
      country: 'Rwanda',
      userName: 'Marie Claire',
      timeDeposit: '14:20'
    },
    {
      id: 3,
      codeTransaction: 'DEP003',
      dateDepot: '2024-08-14',
      montant: 120000,
      unite: 'BIF',
      etat: 'Validé',
      checkedBy: 'Superviseur A',
      country: 'Congo DRC',
      userName: 'Pierre Mukamana',
      timeDeposit: '09:15'
    },
    {
      id: 4,
      codeTransaction: 'DEP004',
      dateDepot: '2024-08-15',
      montant: 30000,
      unite: 'BIF',
      etat: 'Rejeté',
      checkedBy: 'Admin System',
      country: 'Burundi',
      userName: 'Alice Uwimana',
      timeDeposit: '16:45'
    },
    {
      id: 5,
      codeTransaction: 'DEP005',
      dateDepot: '2024-08-13',
      montant: 95000,
      unite: 'BIF',
      etat: 'Validé',
      checkedBy: 'Superviseur B',
      country: 'Rwanda',
      userName: 'Robert Nzeyimana',
      timeDeposit: '11:30'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // TODO: Replace with actual API call
        // const depositsResponse = await DepositsApi.getAllDeposits({}, globalState?.key);

        // if (savingsResponse.data) {
        //   const { data: response, status } = savingsResponse;
        //   if (status === 200 || status === 201) {
        //     setDeposits(response.data || response);
        //   }
        // } else {
        //   console.log('Error getting savings:', savingsResponse.response);
        // }

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Use mock data for now
        setDeposits(mockDepositsData);
      } catch (error) {
        console.log('Erreur lors de la récupération des dépôts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [globalState?.key]);

  // Calculate totals
  const totalSystemDeposits = deposits.length;
  const totalSystemAmount = deposits.reduce((sum, deposit) => sum + deposit.montant, 0);
  const todayDeposits = deposits.filter((deposit) => {
    const today = new Date().toISOString().split('T')[0];
    return deposit.dateDepot === today;
  }).length;

  // Calculate deposits by country
  const burundiDeposits = deposits.filter((d) => d.country === 'Burundi').length;
  const rwandaDeposits = deposits.filter((d) => d.country === 'Rwanda').length;
  const congoDeposits = deposits.filter((d) => d.country === 'Congo DRC').length;

  // Calculate today's deposits by country
  const today = new Date().toISOString().split('T')[0];
  const burundiDepositsToday = deposits.filter((d) => d.country === 'Burundi' && d.dateDepot === today).length;
  const rwandaDepositsToday = deposits.filter((d) => d.country === 'Rwanda' && d.dateDepot === today).length;
  const congoDepositsToday = deposits.filter((d) => d.country === 'Congo DRC' && d.dateDepot === today).length;

  // Filter data based on search
  const filteredData = deposits.filter(
    (item) =>
      item.codeTransaction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.etat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCountryFlag = (country) => {
    const flags = {
      Burundi: '🇧🇮',
      Rwanda: '🇷🇼',
      'Congo DRC': '🇨🇩'
    };
    return flags[country] || '🌍';
  };

  const CountryCard = ({ title, totalCount, todayCount, country, color = '#1976d2' }) => (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 15px -5px rgba(0,0,0,0.12)'
        },
        border: `2px solid ${color}20`,
        borderRadius: 2
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
            {getCountryFlag(country)}
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color
            }}
          >
            <IconMapPin size={18} />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            fontWeight: 500,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: color,
            mb: 1,
            fontSize: '1.5rem'
          }}
        >
          {totalCount}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            bgcolor: `${color}08`,
            borderRadius: 1.5,
            border: `1px solid ${color}15`
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
          <Typography
            variant="caption"
            sx={{
              color: color,
              fontWeight: 600,
              fontSize: '0.7rem'
            }}
          >
            {todayCount} aujourdhui
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const SummaryCard = ({ title, amount, icon, country, color = '#1976d2', showCurrency = true }) => (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -5px rgba(0,0,0,0.15)'
        },
        border: `2px solid ${color}20`,
        borderRadius: 2
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.3rem' }
              }}
            >
              {typeof amount === 'number' ? formatCurrency(amount) : amount}
              {showCurrency && typeof amount === 'number' ? ' BIF' : ''}
            </Typography>
            {country && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: `${color}08`,
                  borderRadius: 2,
                  border: `1px solid ${color}20`
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {getCountryFlag(country)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: color,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  {country}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              ml: 2
            }}
          >
            {React.cloneElement(icon, { size: 24 })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (etat) => {
    switch (etat.toLowerCase()) {
      case 'validé':
        return 'success';
      case 'en attente':
        return 'warning';
      case 'rejeté':
        return 'error';
      default:
        return 'default';
    }
  };

  // PropTypes for SummaryCard
  SummaryCard.propTypes = {
    title: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.node.isRequired,
    country: PropTypes.string,
    color: PropTypes.string,
    showCurrency: PropTypes.bool
  };

  // Make sure to place this definition above its usage in the DepositsPage component.

  // PropTypes for CountryCard
  CountryCard.propTypes = {
    title: PropTypes.string.isRequired,
    totalCount: PropTypes.number.isRequired,
    todayCount: PropTypes.number.isRequired,
    country: PropTypes.string.isRequired,
    color: PropTypes.string
  };

  if (isLoading) {
    return (
      <MainCard title="Gestion Épargnes">
        <Box>
          {/* Summary Cards Skeleton */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={3} key={item}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="70%" height={24} />
                      </Box>
                      <Skeleton variant="rounded" width={48} height={48} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Search Skeleton */}
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rounded" width={300} height={40} />
          </Box>

          {/* Table Skeleton */}
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width="100%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                      <TableCell key={cell}>
                        <Skeleton variant="text" width="100%" height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Rapports Dépôts">
      <Box>
        {/* Main Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Total Dépôts Système"
              amount={totalSystemDeposits}
              icon={<IconTrendingUp />}
              color="#1976d2"
              showCurrency={false}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Montant Total Système" amount={totalSystemAmount} icon={<IconMoneybag />} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Dépôts Aujourd'hui"
              amount={todayDeposits}
              icon={<IconCalendarTime />}
              color="#ed6c02"
              showCurrency={false}
            />
          </Grid>
        </Grid>

        {/* Country-wise Summary Cards */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
          Dépôts par Pays
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Tous Dépôts Burundi"
              amount={burundiDeposits}
              icon={<IconMapPin />}
              country="Burundi"
              color="#9c27b0"
              showCurrency={false}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Tous Dépôts Rwanda"
              amount={rwandaDeposits}
              icon={<IconMapPin />}
              country="Rwanda"
              color="#d32f2f"
              showCurrency={false}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Tous Dépôts Congo DRC"
              amount={congoDeposits}
              icon={<IconMapPin />}
              country="Congo DRC"
              color="#1976d2"
              showCurrency={false}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher des dépôts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        {/* Deposits Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Code Transaction</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date Dépôt</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Unité</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Vérifié Par</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box display="flex" flexDirection="column" alignItems="center" py={4}>
                      <IconInbox size={48} color="#9e9e9e" />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Aucune donnée de dépôt trouvée
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {row.codeTransaction}
                        </Typography>
                        <Typography variant="caption">{getCountryFlag(row.country)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{new Date(row.dateDepot).toLocaleDateString('fr-FR')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.timeDeposit}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(row.montant)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.unite} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Chip label={row.etat} size="small" color={getStatusColor(row.etat)} variant="filled" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.checkedBy || <Chip label="En attente" size="small" color="warning" variant="outlined" />}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewDetails(row)} sx={{ color: 'primary.main' }}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainCard>
  );
};

export default DepositsPage;
