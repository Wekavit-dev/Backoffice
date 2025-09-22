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
  TextField,
  InputAdornment,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  FileDownload as FileDownloadIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  DateRange as DateRangeIcon,
  MonetizationOn as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  DateRange as DateRangePresetIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { AppContext } from 'AppContext';
import { IconTrophy, IconMedal, IconAward, IconUsers, IconChartBar } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import CountryApi from 'api/country';
import systemApi from 'api/system/system';
import locekdSavesApi from 'api/saves/locked';

const BestSaver = () => {
  const { globalState, setGlobalState } = useContext(AppContext);

  // Helper function to format date to YYYY-MM-DD
  const formatDateToInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Helper function to get date presets
  const getDatePresets = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    return {
      today: {
        startDate: formatDateToInput(today),
        endDate: formatDateToInput(today)
      },
      last7Days: {
        startDate: formatDateToInput(last7Days),
        endDate: formatDateToInput(today)
      },
      last30Days: {
        startDate: formatDateToInput(last30Days),
        endDate: formatDateToInput(today)
      }
    };
  };

  // State for filters with smart default (Last 7 days)
  const [filters, setFilters] = useState(() => {
    const presets = getDatePresets();
    return {
      numberOfBest: 10,
      country: '',
      idTypeEpargne: '',
      startDate: presets.last7Days.startDate,
      endDate: presets.last7Days.endDate,
      minAmount: 1000,
      maxAmount: 200000,
      greatestAmount: true,
      morePlans: false,
      greatestInterest: true,
      mostResilient: false,
      mostFrequent: true,
      mostEducated: false
    };
  });

  // State for active date preset
  const [activeDatePreset, setActiveDatePreset] = useState('last7Days');

  // State for data
  const [countries, setCountries] = useState([]);
  const [savingTypes, setSavingTypes] = useState([]);
  const [bestSavers, setBestSavers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [isLoadingSavers, setLoadingSavers] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalAmount: 0,
    topSaver: null,
    totalSavers: 0
  });

  // Date preset handler
  const handleDatePreset = (preset) => {
    const presets = getDatePresets();
    let newDates = {};

    switch (preset) {
      case 'today':
        newDates = presets.today;
        break;
      case 'last7Days':
        newDates = presets.last7Days;
        break;
      case 'last30Days':
        newDates = presets.last30Days;
        break;
      case 'custom':
        // Don't change dates for custom, just update the active preset
        setActiveDatePreset('custom');
        return;
      default:
        newDates = presets.last7Days;
    }

    setFilters((prev) => ({
      ...prev,
      startDate: newDates.startDate,
      endDate: newDates.endDate
    }));
    setActiveDatePreset(preset);
  };

  // Handle manual date changes (sets to custom)
  const handleDateChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setActiveDatePreset('custom');
  };

  // Date preset buttons configuration
  const datePresets = [
    { key: 'today', label: "Aujourd'hui", icon: <TodayIcon sx={{ fontSize: '1rem' }} /> },
    { key: 'last7Days', label: '7 derniers jours', icon: <ScheduleIcon sx={{ fontSize: '1rem' }} /> },
    { key: 'last30Days', label: '30 derniers jours', icon: <CalendarTodayIcon sx={{ fontSize: '1rem' }} /> },
    { key: 'custom', label: 'Personnalisé', icon: <DateRangePresetIcon sx={{ fontSize: '1rem' }} /> }
  ];

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const response = await CountryApi.getCountries(globalState?.key);
      if (response.data) {
        const { data: responseData, status } = response;
        if (status === 200 || status === 201) {
          const countriesData = responseData.data || responseData;
          setCountries(countriesData);

          // Auto-select first country if available
          if (countriesData.length > 0) {
            setFilters((prev) => ({ ...prev, country: countriesData[0]._id }));
          }
        }
      }
    } catch (error) {
      console.log('Error fetching countries:', error);
      toast.error('Erreur lors du chargement des pays', { position: 'top-right' });
    }
  };

  // Fetch saving types
  const fetchSavingTypes = async () => {
    try {
      const response = await locekdSavesApi.getSavingTypes(globalState?.key);
      if (response.data) {
        const { data: responseData, status } = response;
        if (status === 200 || status === 201) {
          const typesData = responseData.data || responseData;
          setSavingTypes(Array.isArray(typesData) ? typesData : []);

          // Auto-select first saving type if available
          if (Array.isArray(typesData) && typesData.length > 0) {
            setFilters((prev) => ({ ...prev, idTypeEpargne: typesData[0]._id }));
          }
        }
      }
    } catch (error) {
      console.log('Error fetching saving types:', error);
      toast.error("Erreur lors du chargement des types d'épargne", { position: 'top-right' });
    }
  };

  // Fetch best savers
  const fetchBestSavers = async () => {
    if (!filters.country || !filters.idTypeEpargne) return;

    setLoadingSavers(true);
    try {
      const bestSaversData = await systemApi.getBestSavers(globalState?.key, filters);

      if (bestSaversData.data) {
        const { data: responseData, status } = bestSaversData;
        if (status === 200 || status === 201) {
          const saversData = responseData.data || responseData;
          setBestSavers(Array.isArray(saversData) ? saversData : []);

          // Calculate statistics
          if (Array.isArray(saversData) && saversData.length > 0) {
            const totalAmount = saversData.reduce((sum, saver) => sum + (saver.totalInitialAmount || 0), 0);
            const topSaver = saversData[0]; // First one has highest amount

            setStats({
              totalAmount,
              topSaver,
              totalSavers: saversData.length
            });
          } else {
            setStats({ totalAmount: 0, topSaver: null, totalSavers: 0 });
          }
        }
      } else {
        setBestSavers([]);
        setStats({ totalAmount: 0, topSaver: null, totalSavers: 0 });
      }
    } catch (error) {
      console.log('Error fetching best savers:', error);
      toast.error('Erreur lors du chargement des meilleurs épargnants', { position: 'top-right' });
      setBestSavers([]);
      setStats({ totalAmount: 0, topSaver: null, totalSavers: 0 });
    } finally {
      setLoadingSavers(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchBestSavers();
  };

  // Reset filters
  const resetFilters = () => {
    const presets = getDatePresets();
    setFilters({
      numberOfBest: 10,
      country: countries.length > 0 ? countries[0]._id : '',
      idTypeEpargne: savingTypes.length > 0 ? savingTypes[0]._id : '',
      startDate: presets.last7Days.startDate,
      endDate: presets.last7Days.endDate,
      minAmount: 1000,
      maxAmount: 50000,
      greatestAmount: true,
      morePlans: false,
      greatestInterest: true,
      mostResilient: false,
      mostFrequent: true,
      mostEducated: false
    });
    setActiveDatePreset('last7Days');
  };

  // Get country flag
  const getCountryFlag = (countryName) => {
    const flags = {
      Burundi: '🇧🇮',
      Rwanda: '🇷🇼',
      'Congo DRC': '🇨🇩',
      Congo: '🇨🇩'
    };
    return flags[countryName] || '🌍';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'BIF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get rank icon
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <IconTrophy style={{ color: '#FFD700', fontSize: '1.5rem' }} />;
      case 1:
        return <IconMedal style={{ color: '#C0C0C0', fontSize: '1.5rem' }} />;
      case 2:
        return <IconAward style={{ color: '#CD7F32', fontSize: '1.5rem' }} />;
      default:
        return (
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
            {index + 1}
          </Typography>
        );
    }
  };

  // Update the filteredSavers filter function:
  const filteredSavers = bestSavers.filter((saver) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      saver.user?.nom?.toLowerCase().includes(searchLower) ||
      saver.user?.prenom?.toLowerCase().includes(searchLower) ||
      saver.user?.email?.toLowerCase().includes(searchLower) ||
      saver.user?.phone?.includes(searchTerm)
    );
  });

  // Export to Excel
  const exportToExcel = () => {
    try {
      if (filteredSavers.length === 0) {
        toast.warning('Aucun épargnant à exporter', { position: 'top-right' });
        return;
      }

      const exportData = filteredSavers.map((saver, index) => ({
        Rang: index + 1,
        Nom: `${saver.user.prenom || ''} ${saver.user.nom || ''}`.trim(),
        Email: saver.user.email || 'Email non disponible',
        Téléphone: saver.user.phone || 'Téléphone non disponible',
        'Montant Total': saver.totalInitialAmount || 0,
        'Nombre de Plans': saver.numPlans || 0,
        'Intérêts Gagnés': saver.totalInterest || 0,
        "Date d'inscription": formatDate(saver.user.createdAt)
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const columnWidths = [
        { wch: 5 }, // Rang
        { wch: 25 }, // Nom
        { wch: 30 }, // Email
        { wch: 20 }, // Téléphone
        { wch: 15 }, // Montant Total
        { wch: 15 }, // Nombre de Plans
        { wch: 15 }, // Intérêts
        { wch: 15 } // Date
      ];
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Meilleurs Épargnants');

      const selectedCountryData = countries.find((c) => c._id === filters.country);
      const countryName = selectedCountryData?.nom || 'Tous';
      const currentDate = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
      const filename = `meilleurs_epargnants_${countryName}_${currentDate}.xlsx`;

      XLSX.writeFile(workbook, filename);
      toast.success(`${filteredSavers.length} épargnants exportés avec succès!`, { position: 'top-right' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error("Erreur lors de l'export vers Excel", { position: 'top-right' });
    }
  };

  // Summary Card Component
  const SummaryCard = ({ title, amount, icon, color = '#1976d2', subtitle }) => (
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
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
                mb: 1
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5,
                fontSize: { xs: '0.5rem', sm: '1.5rem' }
              }}
            >
              {amount}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
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

  // Initialize data
  useEffect(() => {
    if (globalState?.key) {
      Promise.all([fetchCountries(), fetchSavingTypes()]).then(() => {
        setLoading(false);
      });
    }
  }, [globalState?.key]);

  // Fetch savers when filters are ready
  useEffect(() => {
    if (filters.country && filters.idTypeEpargne && !isLoading) {
      fetchBestSavers();
    }
  }, [filters.country, filters.idTypeEpargne, isLoading]);

  if (isLoading) {
    return (
      <MainCard title="Meilleurs épargnants">
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={3} key={item}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
                      </Box>
                      <Skeleton variant="rounded" width={48} height={48} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={400} />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Meilleurs épargnants">
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Total Épargné" amount={formatCurrency(stats.totalAmount)} icon={<IconChartBar />} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Épargnants Actifs" amount={stats.totalSavers} icon={<IconUsers />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard
              title="Meilleur Épargnant"
              amount={stats.topSaver ? `${stats.topSaver.user.prenom} ${stats.topSaver.user.nom?.charAt(0) || ''}.` : '0'}
              icon={<TrophyIcon />}
              color="#d32f2f"
            />
          </Grid>
        </Grid>

        {/* Filters */}
        <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)} sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={1}>
              <FilterIcon />
              <Typography variant="h6">Filtres avancés</Typography>
              <Chip
                label={datePresets.find((p) => p.key === activeDatePreset)?.label || 'Période'}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ ml: 'auto' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Basic Filters */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Pays</InputLabel>
                  <Select value={filters.country} onChange={(e) => handleFilterChange('country', e.target.value)} label="Pays">
                    {countries.map((country) => (
                      <MenuItem key={country._id} value={country._id}>
                        {getCountryFlag(country.nom)} {country.nom}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type d&rsquo;épargne</InputLabel>
                  <Select
                    value={filters.idTypeEpargne}
                    onChange={(e) => handleFilterChange('idTypeEpargne', e.target.value)}
                    label="Type d'épargne"
                  >
                    {savingTypes.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.designation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre de meilleurs"
                  type="number"
                  value={filters.numberOfBest}
                  onChange={(e) => handleFilterChange('numberOfBest', parseInt(e.target.value) || 10)}
                  inputProps={{ min: 1, max: 100 }}
                />
              </Grid>

              {/* Date Preset Buttons */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Période d&lsquo;analyse
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <ButtonGroup variant="outlined" size="small" sx={{ mb: 2 }}>
                    {datePresets.map((preset) => (
                      <Button
                        key={preset.key}
                        variant={activeDatePreset === preset.key ? 'contained' : 'outlined'}
                        onClick={() => handleDatePreset(preset.key)}
                        startIcon={preset.icon}
                        sx={{
                          minWidth: '140px',
                          ...(activeDatePreset === preset.key && {
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark'
                            }
                          })
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>
              </Grid>

              {/* Date Range Fields - Always visible but highlight when custom is selected */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date de début"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      ...(activeDatePreset === 'custom' && {
                        '& fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: 2
                        }
                      })
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Date de fin"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      ...(activeDatePreset === 'custom' && {
                        '& fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: 2
                        }
                      })
                    }
                  }}
                />
              </Grid>

              {/* Amount Filters */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Montant minimum"
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">BIF</InputAdornment>
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Montant maximum"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">BIF</InputAdornment>
                  }}
                />
              </Grid>

              {/* Criteria Switches */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Critères de classement
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={filters.greatestAmount} onChange={handleSwitchChange('greatestAmount')} color="primary" />}
                      label="Plus grand montant"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={filters.morePlans} onChange={handleSwitchChange('morePlans')} color="primary" />}
                      label="Plus de plans"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch checked={filters.greatestInterest} onChange={handleSwitchChange('greatestInterest')} color="primary" />
                      }
                      label="Plus d'intérêts"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={filters.mostResilient} onChange={handleSwitchChange('mostResilient')} color="primary" />}
                      label="Plus résilient"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={filters.mostFrequent} onChange={handleSwitchChange('mostFrequent')} color="primary" />}
                      label="Plus fréquent"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={filters.mostEducated} onChange={handleSwitchChange('mostEducated')} color="primary" />}
                      label="Plus éduqué"
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Filter Actions */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={resetFilters} startIcon={<RefreshIcon />}>
                    Réinitialiser
                  </Button>
                  <Button variant="contained" onClick={applyFilters} startIcon={<FilterIcon />} disabled={isLoadingSavers}>
                    Appliquer les filtres
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Controls */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher des épargnants..."
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

          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportToExcel}
            disabled={filteredSavers.length === 0 || isLoadingSavers}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Exporter Excel
          </Button>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip icon={<TrendingUpIcon />} label={`${filteredSavers.length} épargnants trouvés`} variant="outlined" color="primary" />
          </Box>
        </Box>

        {/* Best Savers Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Rang</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Épargnant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Montant Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Plans</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Intérêts</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Inscription</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingSavers ? (
                [1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                      <TableCell key={cell}>
                        <Skeleton variant="text" width="100%" height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredSavers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 3 }}>
                      <TrophyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        {filters.country && filters.idTypeEpargne
                          ? 'Aucun épargnant trouvé avec ces critères'
                          : 'Configurez les filtres pour voir les meilleurs épargnants'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSavers.map((saver, index) => (
                  <TableRow key={saver.user._id || index} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" justifyContent="center">
                        {getRankIcon(index)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#1976d2',
                            fontSize: '0.875rem'
                          }}
                        >
                          {saver.user.nom ? saver.user.nom.charAt(0).toUpperCase() : 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {saver.user.prenom} {saver.user.nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {saver.user.phone || 'Téléphone N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {saver.user.email || 'Email non disponible'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(saver.totalInitialAmount || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={saver.numPlans || 0} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="warning.main" fontWeight="medium">
                        {formatCurrency(saver.totalInterest || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(saver.user.createdAt)}
                      </Typography>
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

export default BestSaver;
