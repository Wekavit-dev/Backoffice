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
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { IconTrendingUp, IconMoneybag, IconTarget, IconUsers, IconInbox } from '@tabler/icons';
import { AppContext } from 'AppContext';
import SavingsApi from 'api/saves/save';

// project imports
import MainCard from 'ui-component/cards/MainCard';

const SavePage = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [savings, setSavings] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch savings
        const savingsResponse = await SavingsApi.getAllSavings({}, globalState?.key);

        if (savingsResponse.data) {
          const { data: response, status } = savingsResponse;
          if (status === 200 || status === 201) {
            setSavings(response.data || response);
          }
        } else {
          console.log('Error getting savings:', savingsResponse.response);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (globalState?.key) {
      fetchData();
    }
  }, [globalState?.key]);

  console.log('All savings leo:', savings);

  // Transform dynamic data to match the table format
  const transformedSavingsData = savings.flatMap((userSaving) =>
    userSaving.epargnes.map((epargne, index) => ({
      id: epargne.id || epargne._id,
      plan: epargne.title || epargne.objectif || `Plan ${index + 1}`,
      initAmount: epargne.montantInitial || 0,
      interest: epargne.interet || 0,
      totAmount: epargne.totalSave || epargne.montantTotal || 0,
      startDate: epargne.startDate || epargne.dateOperation,
      endDate: epargne.endDate,
      restDays: epargne.endDate ? Math.ceil((new Date(epargne.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
      withdrawn: epargne.withdrawn ? epargne.montantTotal - epargne.totalSave : 0,
      type: epargne.frequency ? 'Fixed' : 'Flexible',
      country: 'Burundi', // Default country, you might want to add logic based on idPays
      userName: `${userSaving.idUser.prenom} ${userSaving.idUser.nom}`,
      frequency: epargne.frequency || 'One-time',
      status: epargne.withdrawn ? 'Déjà retiré' : 'En cours', // New status field
      isWithdrawn: epargne.withdrawn // Keep boolean for filtering
    }))
  );

  // Calculate totals from dynamic data
  const totalSystemAmount = transformedSavingsData.reduce((sum, item) => sum + item.totAmount, 0);
  const totalUsers = savings.length;
  const totalPlans = transformedSavingsData.length;
  const totalWithdrawn = savings.reduce((sum, userSaving) => sum + userSaving.totalWithdrawnAmount, 0);

  // Filter data based on search and status
  const filteredData = transformedSavingsData.filter((item) => {
    const matchesSearch =
      item.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (statusFilter === 'withdrawn' && item.isWithdrawn) || (statusFilter === 'active' && !item.isWithdrawn);

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewDetails = (saving) => {
    setSelectedSaving(saving);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSaving(null);
  };

  const getCountryFlag = (country) => {
    const flags = {
      Burundi: '🇧🇮',
      Rwanda: '🇷🇼',
      'Congo DRC': '🇨🇩'
    };
    return flags[country] || '🌍';
  };

  const calculateProgress = (startDate, endDate, restDays) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

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

  // PropTypes for SummaryCard
  SummaryCard.propTypes = {
    title: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.node.isRequired,
    country: PropTypes.string,
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
    <MainCard title="Gestion Épargnes">
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <SummaryCard title="Total Épargnés" amount={totalSystemAmount} icon={<IconTrendingUp />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Total Utilisateurs"
              amount={totalUsers}
              icon={<IconUsers />}
              country="Burundi"
              color="#2e7d32"
              showCurrency={false}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard
              title="Total Plans"
              amount={totalPlans}
              icon={<IconTarget />}
              country="Rwanda"
              color="#ed6c02"
              showCurrency={false}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard title="Total Retiré" amount={totalWithdrawn} icon={<IconMoneybag />} country="Congo DRC" color="#9c27b0" />
          </Grid>
        </Grid>

        {/* Search */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher des épargnes..."
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

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Filtrer par statut</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Filtrer par statut"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="active">En cours</MenuItem>
              <MenuItem value="withdrawn">Déjà retiré</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Savings Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Montant Initial</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Intérêt</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Montant Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date de Début</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date de Fin</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Jours Restants</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <IconInbox sx={{ size: 20, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Aucune donnée d&apos;épargne trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">{row.plan}</Typography>
                        <Typography variant="caption">{getCountryFlag(row.country)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatCurrency(row.initAmount)} BIF</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.interest > 0 ? `${formatCurrency(row.interest)} BIF` : '0 BIF'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(row.totAmount)} BIF
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.startDate ? new Date(row.startDate).toLocaleDateString('fr-FR') : 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.endDate ? new Date(row.endDate).toLocaleDateString('fr-FR') : 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${Math.max(0, row.restDays)} jours`}
                        size="small"
                        color={row.restDays <= 30 ? 'error' : row.restDays <= 60 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.isWithdrawn ? 'error' : 'success'}
                        variant={row.isWithdrawn ? 'filled' : 'outlined'}
                      />
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

        {/* Executive-Style Professional Modal */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.6)' }
          }}
        >
          <Fade in={modalOpen}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '1000px' },
                maxHeight: '95vh',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              {selectedSaving && (
                <Box>
                  {/* Executive Header */}
                  <Box
                    sx={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      borderBottom: '2px solid #e9ecef',
                      p: 5
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
                          <Typography variant="h3" fontWeight="700" sx={{ color: '#1a1a1a' }}>
                            {selectedSaving.plan}
                          </Typography>
                          <Chip
                            label={selectedSaving.type === 'Fixed' ? 'Plan Fixe' : 'Plan Flexible'}
                            color={selectedSaving.type === 'Fixed' ? 'primary' : 'secondary'}
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              height: 32
                            }}
                          />
                          <Chip
                            label={selectedSaving.status}
                            color={selectedSaving.isWithdrawn ? 'error' : 'success'}
                            variant={selectedSaving.isWithdrawn ? 'filled' : 'outlined'}
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              height: 32
                            }}
                          />
                        </Box>
                        <Box display="flex" alignItems="center" gap={3}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                              {getCountryFlag(selectedSaving.country)}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                              {selectedSaving.country}
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem sx={{ height: 20 }} />
                          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                            Fréquence: {selectedSaving.frequency}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={handleCloseModal}
                        size="large"
                        sx={{
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Content Area */}
                  <Box sx={{ maxHeight: 'calc(95vh - 180px)', overflow: 'auto' }}>
                    <Grid container sx={{ height: '100%' }}>
                      {/* Left Column - Financial Overview */}
                      <Grid item xs={12} md={7} sx={{ p: 5, borderRight: { md: '1px solid #e9ecef' } }}>
                        {/* Account Holder Card */}
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#495057' }}>
                            Titulaire du Compte
                          </Typography>
                          <Box
                            sx={{
                              p: 3,
                              bgcolor: '#f8f9fa',
                              borderRadius: 3,
                              border: '1px solid #dee2e6'
                            }}
                          >
                            <Typography variant="h5" fontWeight="600" sx={{ color: '#212529' }}>
                              {selectedSaving.userName}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Financial Metrics */}
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#495057' }}>
                            Synthèse Financière
                          </Typography>
                          <Grid container spacing={3}>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  textAlign: 'center',
                                  p: 3,
                                  bgcolor: '#ffffff',
                                  border: '2px solid #e3f2fd',
                                  borderRadius: 3,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(33, 150, 243, 0.15)'
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#6c757d', mb: 1, fontWeight: 500 }}>
                                  MONTANT INITIAL
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#2196f3', mb: 1 }}>
                                  {formatCurrency(selectedSaving.initAmount)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                  BIF
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  textAlign: 'center',
                                  p: 3,
                                  bgcolor: '#ffffff',
                                  border: '2px solid #e8f5e8',
                                  borderRadius: 3,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)'
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#6c757d', mb: 1, fontWeight: 500 }}>
                                  INTÉRÊTS GAGNÉS
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#4caf50', mb: 1 }}>
                                  {formatCurrency(selectedSaving.interest)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                  BIF
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  textAlign: 'center',
                                  p: 3,
                                  bgcolor: '#ffffff',
                                  border: '2px solid #fff8e1',
                                  borderRadius: 3,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(255, 152, 0, 0.15)'
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#6c757d', mb: 1, fontWeight: 500 }}>
                                  MONTANT TOTAL
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#ffb74d', mb: 1 }}>
                                  {formatCurrency(selectedSaving.totAmount)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                  BIF
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box
                                sx={{
                                  textAlign: 'center',
                                  p: 3,
                                  bgcolor: '#ffffff',
                                  border: '2px solid #ffebee',
                                  borderRadius: 3,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(244, 67, 54, 0.15)'
                                  }
                                }}
                              >
                                <Typography variant="body2" sx={{ color: '#6c757d', mb: 1, fontWeight: 500 }}>
                                  MONTANT RETIRÉ
                                </Typography>
                                <Typography variant="h4" fontWeight="700" sx={{ color: '#e57373', mb: 1 }}>
                                  {formatCurrency(selectedSaving.withdrawn)}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                  BIF
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Progress Visualization */}
                        <Box>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#495057' }}>
                            Progression du Plan
                          </Typography>
                          <Box
                            sx={{
                              p: 4,
                              bgcolor: '#ffffff',
                              border: '1px solid #dee2e6',
                              borderRadius: 3
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                              <Typography variant="h6" fontWeight="500" sx={{ color: '#495057' }}>
                                Temps Écoulé
                              </Typography>
                              <Typography variant="h3" fontWeight="700" sx={{ color: '#2196f3' }}>
                                {Math.round(calculateProgress(selectedSaving.startDate, selectedSaving.endDate, selectedSaving.restDays))}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={calculateProgress(selectedSaving.startDate, selectedSaving.endDate, selectedSaving.restDays)}
                              sx={{
                                height: 16,
                                borderRadius: 8,
                                bgcolor: '#e9ecef',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 8,
                                  background: 'linear-gradient(90deg, #2196f3 0%, #21cbf3 100%)'
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: '#6c757d', mt: 2, textAlign: 'center' }}>
                              Progression depuis le début du plan d&apos;épargne
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Right Column - Timeline & Status */}
                      <Grid item xs={12} md={5} sx={{ p: 5, bgcolor: '#f8f9fa' }}>
                        {/* Timeline Section */}
                        <Box sx={{ mb: 4 }}>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#495057' }}>
                            Calendrier du Plan
                          </Typography>
                          <Box sx={{ position: 'relative' }}>
                            {/* Timeline Line */}
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 20,
                                top: 30,
                                bottom: 30,
                                width: 2,
                                bgcolor: '#dee2e6'
                              }}
                            />

                            {/* Start Date */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: '#4caf50',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  mr: 3,
                                  zIndex: 1
                                }}
                              >
                                1
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ color: '#6c757d', mb: 0.5 }}>
                                  DATE DE DÉBUT
                                </Typography>
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#212529' }}>
                                  {selectedSaving.startDate ? new Date(selectedSaving.startDate).toLocaleDateString('fr-FR') : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>

                            {/* End Date */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: selectedSaving.restDays <= 0 ? '#4caf50' : '#e57373',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  mr: 3,
                                  zIndex: 1
                                }}
                              >
                                2
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ color: '#6c757d', mb: 0.5 }}>
                                  DATE DE FIN
                                </Typography>
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#212529' }}>
                                  {selectedSaving.endDate ? new Date(selectedSaving.endDate).toLocaleDateString('fr-FR') : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* Status Card */}
                        <Box>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#495057' }}>
                            Statut Actuel
                          </Typography>
                          <Box
                            sx={{
                              p: 4,
                              bgcolor: '#ffffff',
                              border: '1px solid #dee2e6',
                              borderRadius: 3,
                              textAlign: 'center'
                            }}
                          >
                            <Typography
                              variant="h2"
                              fontWeight="700"
                              sx={{
                                color: selectedSaving.restDays <= 30 ? '#e57373' : selectedSaving.restDays <= 60 ? '#fff8e1' : '#4caf50',
                                mb: 2
                              }}
                            >
                              {Math.max(0, selectedSaving.restDays)}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#495057', mb: 3 }}>
                              Jours Restants
                            </Typography>
                            <Chip
                              label={
                                selectedSaving.isWithdrawn
                                  ? 'RETIRÉ - Plan Terminé'
                                  : selectedSaving.restDays <= 30
                                  ? 'URGENT - Échéance Proche'
                                  : selectedSaving.restDays <= 60
                                  ? 'ATTENTION - Bientôt Terminé'
                                  : 'EN COURS - Tout va bien'
                              }
                              color={
                                selectedSaving.isWithdrawn
                                  ? 'error'
                                  : selectedSaving.restDays <= 30
                                  ? 'error'
                                  : selectedSaving.restDays <= 60
                                  ? 'warning'
                                  : 'success'
                              }
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                px: 3,
                                py: 1,
                                height: 40
                              }}
                            />

                            {/* Additional Status Info */}
                            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #dee2e6' }}>
                              <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                                {selectedSaving.isWithdrawn ? 'Montant Retiré' : 'Durée Totale du Plan'}
                              </Typography>
                              <Typography variant="h6" fontWeight="600" sx={{ color: '#212529' }}>
                                {selectedSaving.isWithdrawn
                                  ? `${formatCurrency(selectedSaving.withdrawn)} BIF`
                                  : selectedSaving.startDate && selectedSaving.endDate
                                  ? Math.ceil(
                                      (new Date(selectedSaving.endDate) - new Date(selectedSaving.startDate)) / (1000 * 60 * 60 * 24)
                                    ) + ' jours'
                                  : 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>
        </Modal>
      </Box>
    </MainCard>
  );
};

export default SavePage;
