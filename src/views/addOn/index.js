/* eslint-disable no-unused-vars */
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
  Button,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Avatar
} from '@mui/material';
import {
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';
import { AppContext } from 'AppContext';
import { IconWallet, IconArrowUpRight, IconArrowDownLeft, IconInbox, IconPercentage } from '@tabler/icons';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import AddsOnApi from 'api/addOns/addOns';

const AddOns = () => {
  const { globalState, setGlobalState } = useContext(AppContext);
  const [operationFilter, setOperationFilter] = useState('');
  const [addsOnData, setAddsOnData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching AddOns data with key:', globalState?.key);
      let data = { total: 0 };
      const response = await AddsOnApi.getAddsOn(data, globalState?.key);
      if (response.data) {
        const { data: responseData, status } = response;
        if (status === 200 || status === 201) {
          setAddsOnData(responseData.data || responseData);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log('Error fetching AddOns data:', error);
      setLoading(false);
    }
  };

  const handleChargerBalance = () => {
    // TODO: Implement balance top-up functionality
    console.log('Charger la balance clicked');
    // This will be connected to your top-up API
  };

  useEffect(() => {
    if (globalState?.key) {
      fetchData();
    }
  }, [globalState?.key]);

  // Calculate metrics
  const totalBalance = addsOnData.find((item) => item.main)?.TotalUsBalance || 0;

  const allOperations = addsOnData.filter((item) => !item.main && item.SourceAddsOn).map((item) => item.SourceAddsOn);

  const parainageOperations = allOperations.filter((op) => op.operation === 'parainage');
  const withdrawOperations = allOperations.filter((op) => op.operation === 'withdraw');

  // Calculate parainage total in BIF (assuming Burundian operations)
  const totalParainageBIF = parainageOperations.reduce((sum, op) => sum + (op.montant || 0), 0);

  // Calculate total withdraw amount and system gain (0.5%)
  const totalWithdrawAmount = withdrawOperations.reduce((sum, op) => sum + (op.montant || 0), 0);
  const systemGainPercentage = 0.5; // 0.5%
  const systemGainAmount = totalWithdrawAmount * (systemGainPercentage / 100);

  const getCountryFlag = (country) => {
    const flags = {
      Burundi: '🇧🇮',
      Rwanda: '🇷🇼',
      'Congo DRC': '🇨🇩'
    };
    return flags[country] || '🌍';
  };

  const getOperationColor = (operation) => {
    return operation === 'parainage' ? 'error' : 'success';
  };

  const getOperationIcon = (operation) => {
    return operation === 'parainage' ? (
      <IconArrowDownLeft size={16} style={{ marginRight: 4 }} />
    ) : (
      <IconArrowUpRight size={16} style={{ marginRight: 4 }} />
    );
  };

  // Filter operations
  const filteredOperations = allOperations.filter((operation) => {
    const matchesFilter = operationFilter === '' || operation.operation === operationFilter;
    return matchesFilter;
  });

  const SummaryCard = ({ title, amount, subtitle, icon, color = '#1976d2', trend = null, currency = '' }) => (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -5px rgba(0,0,0,0.15)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`
        }
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
            <Box display="flex" alignItems="center" gap={1}>
              {trend && (
                <Box sx={{ color: trend === 'up' ? 'success.main' : 'error.main' }}>
                  {trend === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                </Box>
              )}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '0.5rem', sm: '1.4rem' }
                }}
              >
                {currency}
                {typeof amount === 'number' ? (currency === 'BIF ' ? amount.toLocaleString() : amount.toFixed(2)) : amount}
              </Typography>
            </Box>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <MainCard title="Gestion des fonds">
        <Box>
          {/* Summary Cards Skeleton */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} md={4} key={item}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="30%" height={16} />
                      </Box>
                      <Skeleton variant="rounded" width={48} height={48} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Controls Skeleton */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="rounded" width={200} height={40} />
            <Skeleton variant="rounded" width={150} height={40} />
          </Box>

          {/* Table Skeleton */}
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  {[1, 2, 3, 4, 5].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width="100%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5].map((cell) => (
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
    <MainCard title="Gestion de fonds">
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Balance Totale"
              amount={totalBalance || 0}
              subtitle="Balance actuelle du système"
              icon={<IconWallet />}
              color="#1976d2"
              currency="$"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Total Parainages"
              amount={totalParainageBIF}
              subtitle={`${parainageOperations.length} opération${parainageOperations.length > 1 ? 's' : ''} • Coût système`}
              icon={<IconArrowDownLeft />}
              color="#d32f2f"
              trend="down"
              currency="BIF "
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Total Withdraws"
              amount={totalWithdrawAmount}
              subtitle={`${withdrawOperations.length} opération${withdrawOperations.length > 1 ? 's' : ''} • Gain système`}
              icon={<IconArrowUpRight />}
              color="#2e7d32"
              trend="up"
              currency="%"
            />
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrer par opération</InputLabel>
            <Select
              value={operationFilter}
              onChange={(e) => setOperationFilter(e.target.value)}
              label="Filtrer par opération"
              startAdornment={<FilterIcon sx={{ mr: 1, fontSize: '1rem' }} />}
            >
              <MenuItem value="">Toutes les opérations</MenuItem>
              <MenuItem value="parainage">
                <Box display="flex" alignItems="center" gap={1}>
                  <IconArrowDownLeft size={16} color="#d32f2f" />
                  Parainages
                </Box>
              </MenuItem>
              <MenuItem value="withdraw">
                <Box display="flex" alignItems="center" gap={1}>
                  <IconArrowUpRight size={16} color="#2e7d32" />
                  Withdraws
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={handleChargerBalance}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Charger la Balance
          </Button>
        </Box>

        {/* Operations Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Opération</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pays</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date Opération</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOperations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3 }}>
                      <IconInbox sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Aucune opération trouvée
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOperations.map((operation, index) => (
                  <TableRow key={`${operation.idTransaction || 'op'}-${index}`} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getOperationIcon(operation.operation)}
                        <Chip
                          label={operation.operation === 'parainage' ? 'Parainage' : 'Withdraw'}
                          size="small"
                          color={getOperationColor(operation.operation)}
                          variant="outlined"
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {operation.operation === 'parainage'
                            ? `-BIF ${Math.round(operation.montant || 0).toLocaleString()}`
                            : `+$${(operation.montant || 0).toFixed(2)}`}
                        </Typography>
                        {operation.operation === 'parainage' && <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />}
                        {operation.operation === 'withdraw' && <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {operation.idPays && (
                          <>
                            <Typography variant="body2">{getCountryFlag(operation.idPays.nom)}</Typography>
                            <Typography variant="body2">{operation.idPays.nom}</Typography>
                            <Chip
                              label={operation.idPays.unite?.toUpperCase()}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={operation.etat === 'validated' ? 'Validé' : operation.etat}
                        size="small"
                        color={operation.etat === 'validated' ? 'success' : 'warning'}
                        variant={operation.etat === 'validated' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(operation.DateOperation)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Summary Info */}
        {filteredOperations.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total des opérations affichées: <strong>{filteredOperations.length}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="error.main">
                  Total Parainages:{' '}
                  <strong>
                    -BIF{' '}
                    {filteredOperations
                      .filter((op) => op.operation === 'parainage')
                      .reduce((sum, op) => sum + (op.montant || 0), 0)
                      .toLocaleString()}
                  </strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="success.main">
                  Gain Système:{' '}
                  <strong>
                    +$
                    {(
                      filteredOperations.filter((op) => op.operation === 'withdraw').reduce((sum, op) => sum + (op.montant || 0), 0) * 0.005
                    ).toFixed(2)}
                  </strong>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </MainCard>
  );
};

export default AddOns;
