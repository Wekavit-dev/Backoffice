/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Grid,
  Box,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Skeleton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Shield as ShieldIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { AppContext } from 'AppContext';
import { useAdminAccess } from 'hooks/useAdminAccess';
import { IconUsers, IconUserCheck, IconShield, IconInbox } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainCard from 'ui-component/cards/MainCard';
import AdminsApi from 'api/admins/admins';
import SummaryCard from './components/SummaryCard';
import MenuAccessPanel from './components/MenuAccessPanel';
import AddAdminModal from './components/AddAdminModal';
import { getAvatarBgColor, getInitials, getMenuCoverage } from './utils/adminUi';

const TOTAL_MENU_SLOTS = 27;

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les profils' },
  { value: 'verified', label: 'Vérifiés uniquement' },
  { value: 'super', label: 'Super-administrateurs' },
  { value: 'online', label: 'Connectés maintenant' }
];

const Administrator = () => {
  const { globalState } = useContext(AppContext);
  const { isSuperAdmin } = useAdminAccess();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileShowPanel, setMobileShowPanel] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AdminsApi.getAdmins(globalState?.key);
      if (response?.data) {
        const payload = response.data?.data || response.data || [];
        const list = Array.isArray(payload) ? payload : [];
        setAdmins(list);
        setSelectedAdmin((prev) => {
          if (!list.length) return null;
          if (prev) {
            const stillThere = list.find((item) => item._id === prev._id);
            return stillThere || list[0];
          }
          return list[0];
        });
      }
    } catch (error) {
      toast.error('Impossible de charger les administrateurs', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (globalState?.key) {
      fetchData();
    }
  }, [globalState?.key]);

  const filteredAdmins = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return admins.filter((admin) => {
      const matchesSearch =
        !q || admin.nom?.toLowerCase().includes(q) || admin.email?.toLowerCase().includes(q);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'verified' && admin.verified) ||
        (filter === 'super' && admin.isSuperAdmin) ||
        (filter === 'online' && admin.connected);
      return matchesSearch && matchesFilter;
    });
  }, [admins, searchTerm, filter]);

  const stats = useMemo(
    () => ({
      total: admins.length,
      verified: admins.filter((admin) => admin.verified).length,
      connected: admins.filter((admin) => admin.connected).length,
      superAdmins: admins.filter((admin) => admin.isSuperAdmin).length
    }),
    [admins]
  );

  const handleCreateAdmin = async (form, resetForm) => {
    setIsSubmitting(true);
    try {
      const response = await AdminsApi.createAdmin(
        { nom: form.nom, email: form.email, password: form.password },
        globalState?.key
      );
      const ok =
        response?.status === 200 ||
        response?.status === 201 ||
        response?.data?.status === 200 ||
        response?.data?.status === 201;

      if (ok) {
        toast.success('Administrateur créé avec succès', { position: 'top-right' });
        setAddModalOpen(false);
        resetForm();
        await fetchData();
        setMobileShowPanel(true);
        return;
      }
      toast.error("Erreur lors de la création de l'administrateur", { position: 'top-right' });
    } catch (error) {
      toast.error("Erreur lors de la création de l'administrateur", { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccessSaved = (payload) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin._id === selectedAdmin?._id
          ? { ...admin, menuAccess: payload.menuAccess, isSuperAdmin: payload.isSuperAdmin }
          : admin
      )
    );
    setSelectedAdmin((prev) =>
      prev ? { ...prev, menuAccess: payload.menuAccess, isSuperAdmin: payload.isSuperAdmin } : prev
    );
  };

  const handleSelectAdmin = (admin) => {
    setSelectedAdmin(admin);
    setMobileShowPanel(true);
  };

  if (loading && !admins.length) {
    return (
      <MainCard title="Gestion des administrateurs">
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="40%" height={32} />
                      </Box>
                      <Skeleton variant="rounded" width={48} height={48} />
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Skeleton variant="rounded" width={300} height={40} />
            <Skeleton variant="rounded" width={200} height={40} />
          </Box>
          <Skeleton variant="rounded" height={420} />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Gestion des administrateurs">
      <Box>
        {!isSuperAdmin && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Mode consultation — seuls les super-administrateurs peuvent créer des profils et modifier les droits d&apos;accès.
          </Alert>
        )}

        {/* Summary Cards — même pattern que growth */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Total Admins" amount={stats.total} icon={<IconUsers />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Vérifiés" amount={stats.verified} icon={<IconUserCheck />} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Connectés"
              amount={stats.connected}
              icon={<IconUsers />}
              color="#ed6c02"
              subtitle="Sessions actives"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Super Admins" amount={stats.superAdmins} icon={<IconShield />} color="#7b1fa2" />
          </Grid>
        </Grid>

        {/* Controls — même pattern que growth */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher un administrateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 280 }}
          />

          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Filtrer par statut</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="Filtrer par statut"
              startAdornment={<FilterIcon sx={{ mr: 1, fontSize: '1rem', color: 'action.active' }} />}
            >
              {FILTER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isSuperAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}>
              Ajouter un admin
            </Button>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={<ShieldIcon sx={{ fontSize: '1rem !important' }} />}
              label={`${filteredAdmins.length} administrateur${filteredAdmins.length > 1 ? 's' : ''}`}
              variant="outlined"
              color="primary"
            />
          </Box>
        </Box>

        {/* Master-detail layout */}
        <Grid container spacing={3}>
          {/* Table des admins */}
          <Grid item xs={12} xl={5} sx={{ display: { xs: mobileShowPanel ? 'none' : 'block', xl: 'block' } }}>
            <TableContainer component={Card}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Administrateur</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Accès menus</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((row) => (
                      <TableRow key={row}>
                        {[1, 2, 3].map((cell) => (
                          <TableCell key={cell}>
                            <Skeleton variant="text" width="100%" height={20} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Box sx={{ py: 4 }}>
                          <IconInbox style={{ fontSize: 48, color: '#9e9e9e', marginBottom: 8 }} />
                          <Typography variant="body2" color="text.secondary">
                            Aucun administrateur trouvé avec ces critères
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmins.map((admin) => {
                      const selected = selectedAdmin?._id === admin._id;
                      const coverage = getMenuCoverage(admin, TOTAL_MENU_SLOTS);
                      const avatarColor = getAvatarBgColor(admin.email || admin.nom);

                      return (
                        <TableRow
                          key={admin._id}
                          hover
                          selected={selected}
                          onClick={() => handleSelectAdmin(admin)}
                          sx={{
                            cursor: 'pointer',
                            '&.Mui-selected': {
                              bgcolor: 'primary.50',
                              '&:hover': { bgcolor: 'primary.100' }
                            }
                          }}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                sx={{
                                  width: 42,
                                  height: 42,
                                  bgcolor: avatarColor,
                                  fontSize: '0.875rem',
                                  fontWeight: 700
                                }}
                              >
                                {getInitials(admin.nom)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {admin.nom}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {admin.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {admin.isSuperAdmin && (
                                <Chip label="Super" size="small" color="secondary" variant="filled" />
                              )}
                              <Chip
                                label={admin.verified ? 'Vérifié' : 'En attente'}
                                size="small"
                                color={admin.verified ? 'success' : 'error'}
                                variant="outlined"
                              />
                              {admin.connected && (
                                <Chip label="En ligne" size="small" color="info" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ minWidth: 140 }}>
                            <Box>
                              <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                  {admin.isSuperAdmin ? 'Accès total' : `${admin.menuAccess?.length || 0} menus`}
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" color="primary.main">
                                  {admin.isSuperAdmin ? '100%' : `${coverage}%`}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={coverage}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: 'grey.200',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: 'linear-gradient(90deg, #1976d2, #7b1fa2)'
                                  }
                                }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Panneau permissions */}
          <Grid
            item
            xs={12}
            xl={7}
            sx={{ display: { xs: mobileShowPanel ? 'block' : 'none', xl: 'block' } }}
          >
            <Card
              sx={{
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                minHeight: { xs: 'auto', xl: 560 }
              }}
            >
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  {mobileShowPanel && (
                    <Tooltip title="Retour à la liste">
                      <IconButton size="small" onClick={() => setMobileShowPanel(false)} sx={{ display: { xl: 'none' } }}>
                        <ChevronLeftIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <SettingsIcon color="primary" sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Droits d&apos;accès aux menus
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedAdmin
                        ? `Configuration pour ${selectedAdmin.nom}`
                        : 'Sélectionnez un administrateur dans le tableau'}
                    </Typography>
                  </Box>
                </Box>
                {selectedAdmin && (
                  <Chip
                    label={selectedAdmin.isSuperAdmin ? 'Super-admin' : `${selectedAdmin.menuAccess?.length || 0} menus`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>

              <MenuAccessPanel
                admin={selectedAdmin}
                token={globalState?.key}
                isSuperAdminViewer={isSuperAdmin}
                onSaved={handleAccessSaved}
              />
            </Card>
          </Grid>
        </Grid>

        <AddAdminModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleCreateAdmin}
          isSubmitting={isSubmitting}
        />
      </Box>
    </MainCard>
  );
};

export default Administrator;
