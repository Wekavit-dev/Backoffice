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
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingDown as TrendingDownIcon,
  FileDownload as FileDownloadIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { AppContext } from 'AppContext';
import { IconUsers, IconUserX, IconInbox, IconCopy } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import CountryApi from 'api/country';
import systemApi from 'api/system/system';

const NoSavePlans = () => {
  const { globalState, setGlobalState } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [noSavePlanUsers, setNoSavePlanUsers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isLoadingUsers, setLoadingUsers] = useState(false);

  // Country statistics
  const [countryStats, setCountryStats] = useState({
    burundi: 0,
    rwanda: 0,
    congo: 0
  });

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
            setSelectedCountry(countriesData[0]._id);
          }
        }
      }
    } catch (error) {
      console.log('Error fetching countries:', error);
      toast.error('Erreur lors du chargement des pays', { position: 'top-right' });
      setLoading(false);
    }
  };

  const TOP_SECRET_KEY = 'vbhuiopjk@ercxdeùùéé""--èè__ççàà)))=é';

  const fetchUsersWithDepositNoPlans = async (countryId) => {
    if (!countryId) return;

    setLoadingUsers(true);
    try {
      const response = await systemApi.getUsersWithDepositNoPlans(globalState?.key, countryId, TOP_SECRET_KEY);

      if (response.data) {
        const { data: responseData, status } = response;
        if (status === 200 || status === 201) {
          const usersData = responseData.data || responseData;
          setNoSavePlanUsers(Array.isArray(usersData) ? usersData : []);
        }
      } else {
        setNoSavePlanUsers([]);
      }
    } catch (error) {
      console.log('Error fetching users with deposits but no save plans:', error);
      toast.error('Erreur lors du chargement des utilisateurs', { position: 'top-right' });
      setNoSavePlanUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAllCountriesStats = async () => {
    const stats = { burundi: 0, rwanda: 0, congo: 0 };

    try {
      // Fetch stats for each country
      for (const country of countries) {
        const response = await systemApi.getUsersWithDepositNoPlans(globalState?.key, country._id, TOP_SECRET_KEY);

        if (response.data) {
          const { data: responseData, status } = response;
          if (status === 200 || status === 201) {
            const usersData = responseData.data || responseData;
            const userCount = Array.isArray(usersData) ? usersData.length : 0;

            // Map country names to stats
            const countryName = country.nom.toLowerCase();
            if (countryName.includes('burundi')) {
              stats.burundi = userCount;
            } else if (countryName.includes('rwanda')) {
              stats.rwanda = userCount;
            } else if (countryName.includes('congo')) {
              stats.congo = userCount;
            }
          }
        }
      }

      setCountryStats(stats);
    } catch (error) {
      console.log('Error fetching country statistics:', error);
    }
  };

  useEffect(() => {
    if (globalState?.key) {
      fetchCountries();
    }
  }, [globalState?.key]);

  useEffect(() => {
    if (countries.length > 0 && globalState?.key) {
      fetchAllCountriesStats();
    }
    if (countries.length > 0 && (!selectedCountry || !isLoadingUsers)) {
      setLoading(false);
    }
  }, [countries, globalState?.key]);

  useEffect(() => {
    if (selectedCountry && globalState?.key) {
      fetchUsersWithDepositNoPlans(selectedCountry);
    }
  }, [selectedCountry, globalState?.key]);

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

  // Filter users based on search term
  const filteredUsers = noSavePlanUsers.filter((user) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.telephone?.includes(searchTerm)
    );
  });

  // Export emails to Excel
  const exportEmailsToExcel = () => {
    try {
      if (filteredUsers.length === 0) {
        toast.warning('Aucun utilisateur à exporter', { position: 'top-right' });
        return;
      }

      // Prepare data for Excel
      const emailData = filteredUsers.map((user, index) => ({
        'N°': index + 1,
        Nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
        Email: user.email || 'Email non disponible',
        Téléphone: user.phone || user.telephone || 'Téléphone non disponible',
        "Date d'inscription": formatDate(user.createdAt || user.dateInscription)
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(emailData);

      // Set column widths
      const columnWidths = [
        { wch: 5 }, // N°
        { wch: 25 }, // Nom
        { wch: 30 }, // Email
        { wch: 20 }, // Téléphone
        { wch: 15 } // Date
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Utilisateurs sans plan épargne');

      // Get country name for filename
      const selectedCountryData = countries.find((c) => c._id === selectedCountry);
      const countryName = selectedCountryData?.nom || 'Tous';
      const currentDate = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');

      // Generate filename
      const filename = `utilisateurs_sans_plan_epargne_${countryName}_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      toast.success(`${filteredUsers.length} emails exportés avec succès!`, { position: 'top-right' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error("Erreur lors de l'export vers Excel", { position: 'top-right' });
    }
  };

  // Copy phone number to clipboard
  const copyPhoneNumber = async (phoneNumber) => {
    try {
      if (!phoneNumber || phoneNumber === 'Téléphone non disponible') {
        toast.warning('Aucun numéro de téléphone à copier', { position: 'top-right' });
        return;
      }

      await navigator.clipboard.writeText(phoneNumber);
      toast.success('Numéro copié dans le presse-papiers!', { position: 'top-right' });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Erreur lors de la copie', { position: 'top-right' });
    }
  };

  const SummaryCard = ({ title, amount, icon, color = '#1976d2', country }) => (
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
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem'
                }}
              >
                {title}
              </Typography>
              {country && (
                <Typography variant="body2" sx={{ fontSize: '1rem' }}>
                  {getCountryFlag(country)}
                </Typography>
              )}
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {amount}
            </Typography>
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
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <MainCard title="Utilisateurs sans plan d'épargne">
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
            <Skeleton variant="rounded" width={300} height={40} />
            <Skeleton variant="rounded" width={200} height={40} />
          </Box>

          {/* Table Skeleton */}
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  {[1, 2, 3, 4].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width="100%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4].map((cell) => (
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

  const totalUsers = countryStats.burundi + countryStats.rwanda + countryStats.congo;

  return (
    <MainCard title="Utilisateurs sans plan d'épargne">
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <SummaryCard title="Total Utilisateurs" amount={totalUsers} icon={<IconUsers />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard title="Burundi" amount={countryStats.burundi} icon={<IconUserX />} color="#d32f2f" country="Burundi" />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard title="Rwanda" amount={countryStats.rwanda} icon={<IconUserX />} color="#ed6c02" country="Rwanda" />
          </Grid>
          <Grid item xs={12} md={3}>
            <SummaryCard title="Congo DRC" amount={countryStats.congo} icon={<IconUserX />} color="#2e7d32" country="Congo DRC" />
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher des utilisateurs..."
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
            <InputLabel>Filtrer par pays</InputLabel>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              label="Filtrer par pays"
              startAdornment={<FilterIcon sx={{ mr: 1, fontSize: '1rem' }} />}
            >
              {countries.map((country) => (
                <MenuItem key={country._id} value={country._id}>
                  {getCountryFlag(country.nom)} {country.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportEmailsToExcel}
            disabled={filteredUsers.length === 0 || isLoadingUsers}
            sx={{
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' }
            }}
          >
            Exporter les emails
          </Button>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip icon={<TrendingDownIcon />} label={`${filteredUsers.length} utilisateurs trouvés`} variant="outlined" color="primary" />
          </Box>
        </Box>

        {/* Users Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Utilisateur</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date d&apos;inscription</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoadingUsers ? (
                // Loading skeleton for table
                [1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4].map((cell) => (
                      <TableCell key={cell}>
                        <Skeleton variant="text" width="100%" height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{ py: 3 }}>
                      <IconInbox sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedCountry
                          ? "Aucun utilisateur sans plan d'épargne trouvé"
                          : 'Sélectionnez un pays pour voir les utilisateurs'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user._id || index} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: '#bbdefb',
                            fontSize: '0.875rem'
                          }}
                        >
                          {user.nom ? user.nom.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.prenom} {user.nom}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email || 'Email non disponible'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                          {user.phone || user.telephone || 'Téléphone non disponible'}
                        </Typography>
                        {(user.phone || user.telephone) && (
                          <Tooltip title="Copier le numéro">
                            <IconButton
                              size="small"
                              onClick={() => copyPhoneNumber(user.phone || user.telephone)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.50' }
                              }}
                            >
                              <IconCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.createdAt || user.dateInscription)}
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

export default NoSavePlans;
