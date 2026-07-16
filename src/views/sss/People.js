import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Grow,
  Zoom,
  Chip,
  Box,
  Card,
  CardContent,
  Divider,
  Badge,
  Menu,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Collapse
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  Groups as GroupsIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  PersonAdd as PersonAddIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleAltIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  FilterAlt as FilterAltIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewQuilt as ViewQuiltIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import {
  maskPhone,
  telHref,
  whatsappHref,
  STAGE_OPTIONS,
  COHORT_LABELS,
  formatDateFr,
  URGENCY_LABELS,
  STAGE_LABELS
} from './labels';
import {
  AlertChips,
  EmptyState,
  PersonCell,
  StageChip,
  UrgencyChip
} from './components/Chips';
import HealthMeter from './components/HealthMeter';
import PageHeader from './components/PageHeader';
import PersonCard from './components/PersonCard';

// Composant de statistiques
const StatsCard = ({ title, value, subtitle, icon, color, onClick, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack spacing={1}>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={60} height={40} />
            <Skeleton variant="text" width={120} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: alpha(color || theme.palette.primary.main, 0.04),
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          borderColor: color || theme.palette.primary.main,
        } : {}
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={color || theme.palette.text.primary}>
              {value ?? '—'}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
          <Box sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: alpha(color || theme.palette.primary.main, 0.1),
            color: color || theme.palette.primary.main
          }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Composant de filtres avancés
const AdvancedFilters = ({ filters, onFilterChange, onClear }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const filterGroups = [
    {
      id: 'stage',
      label: 'Étape',
      options: STAGE_OPTIONS,
      getLabel: (v) => STAGE_LABELS[v] || v
    },
    {
      id: 'urgency',
      label: 'Urgence',
      options: [
        { value: 'critical', label: 'Critique' },
        { value: 'high', label: 'Élevée' },
        { value: 'medium', label: 'Moyenne' },
        { value: 'low', label: 'Basse' }
      ]
    },
    {
      id: 'cohort',
      label: 'Groupe',
      options: Object.entries(COHORT_LABELS).map(([value, label]) => ({ value, label }))
    }
  ];

  const activeFilters = useMemo(() => {
    const active = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        const group = filterGroups.find(g => g.id === key);
        const option = group?.options.find(o => o.value === value);
        active.push({ id: key, label: `${group?.label}: ${option?.label || value}` });
      }
    });
    return active;
  }, [filters, filterGroups]);

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button
          size="small"
          startIcon={<FilterAltIcon />}
          onClick={() => setExpanded(!expanded)}
          variant={activeFilters.length > 0 ? 'contained' : 'outlined'}
          color={activeFilters.length > 0 ? 'primary' : 'inherit'}
          sx={{ borderRadius: 2 }}
        >
          Filtres {activeFilters.length > 0 && `(${activeFilters.length})`}
        </Button>

        {activeFilters.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.label}
            onDelete={() => onFilterChange(filter.id, '')}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          />
        ))}

        {activeFilters.length > 0 && (
          <Button size="small" onClick={onClear} color="inherit">
            Tout effacer
          </Button>
        )}
      </Stack>

      <Collapse in={expanded}>
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Grid container spacing={2}>
            {filterGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={group.label}
                  value={filters[group.id] || ''}
                  onChange={(e) => onFilterChange(group.id, e.target.value)}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) return <Typography color="text.secondary">Tous</Typography>;
                      const option = group.options.find(o => o.value === selected);
                      return option?.label || selected;
                    }
                  }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {group.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Collapse>
    </Box>
  );
};

const PeoplePage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [filters, setFilters] = useState({
    stage: searchParams.get('stage') || '',
    urgency: searchParams.get('urgency') || '',
    cohort: searchParams.get('cohort') || ''
  });
  const [viewMode, setViewMode] = useState('table');
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exporting, setExporting] = useState(false);

  // Statistiques calculées
  const stats = useMemo(() => {
    if (!rows.length) return { total: 0, urgent: 0, new: 0, healthy: 0 };

    return {
      total: rows.length,
      urgent: rows.filter(p => p.urgency === 'critical' || p.urgency === 'high').length,
      new: rows.filter(p => p.stage === 'S1' || p.stage === 'S2').length,
      healthy: rows.filter(p => p.healthLevel === 'excellent' || p.healthLevel === 'good').length
    };
  }, [rows]);

  // Chargement des données
  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const params = {
        page,
        limit: 40,
        ...(filters.stage && { stage: filters.stage }),
        ...(filters.urgency && { urgency: filters.urgency }),
        ...(filters.cohort && { cohort: filters.cohort }),
        ...(searchApplied.trim() && { search: searchApplied.trim() })
      };

      const res = await SssApi.listUsers(params, globalState.key);
      if (res?.status === 200) {
        setRows(res.data?.data || []);
        setTotal(res.data?.total || 0);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les personnes');
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des données',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, page, filters, searchApplied]);

  useEffect(() => {
    load();
  }, [load]);

  // Mise à jour des paramètres d'URL
  useEffect(() => {
    const next = {};
    if (filters.stage) next.stage = filters.stage;
    if (filters.urgency) next.urgency = filters.urgency;
    if (filters.cohort) next.cohort = filters.cohort;
    setSearchParams(next, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ stage: '', urgency: '', cohort: '' });
    setSearch('');
    setSearchApplied('');
    setPage(1);
    setSnackbar({ open: true, message: 'Filtres réinitialisés', severity: 'success' });
  };

  const handleSearch = () => {
    setPage(1);
    setSearchApplied(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    setSearchApplied('');
    setPage(1);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = ['Nom', 'Téléphone', 'Email', 'Étape', 'Urgence', 'Santé', 'Alertes', 'Dernière activité'];
      const data = rows.map(p => [
        p.idUser?.name || 'N/A',
        p.idUser?.phone || 'N/A',
        p.idUser?.email || 'N/A',
        STAGE_LABELS[p.stage] || p.stage || 'N/A',
        URGENCY_LABELS[p.urgency] || p.urgency || 'N/A',
        p.healthLevel || 'N/A',
        p.alerts?.length || 0,
        formatDateFr(p.ledgerSnapshot?.lastActivityAt) || 'N/A'
      ]);

      const csv = [headers, ...data].map(row => row.join(',')).join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personnes_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExporting(false);
      setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
    }, 500);
  };

  const pageCount = Math.max(1, Math.ceil(total / 40));

  // Rendu du tableau
  const renderTable = () => (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableCell>Personne</TableCell>
            <TableCell>Étape</TableCell>
            <TableCell>Santé</TableCell>
            <TableCell>Urgence</TableCell>
            <TableCell>Alertes</TableCell>
            <TableCell>Dernière activité</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((profile, index) => {
            const user = profile.idUser || {};
            const userId = user._id || profile.idUser;
            const phone = user.phone;
            const isUrgent = profile.urgency === 'critical' || profile.urgency === 'high';

            return (
              <Grow key={profile._id} in timeout={index * 50}>
                <TableRow
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    bgcolor: isUrgent ? alpha(theme.palette.error.main, 0.02) : 'inherit',
                    borderLeft: isUrgent ? `3px solid ${theme.palette.error.main}` : 'none'
                  }}
                >
                  <TableCell>
                    <PersonCell user={user} phone={maskPhone(phone)} />
                  </TableCell>
                  <TableCell>
                    <StageChip stage={profile.stage} size="small" />
                  </TableCell>
                  <TableCell>
                    <HealthMeter level={profile.healthLevel} score={profile.healthScore} dense />
                  </TableCell>
                  <TableCell>
                    <UrgencyChip urgency={profile.urgency} size="small" />
                  </TableCell>
                  <TableCell>
                    <AlertChips alerts={profile.alerts} max={2} />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">
                        {formatDateFr(profile.ledgerSnapshot?.lastActivityAt)}
                      </Typography>
                      {profile.ledgerSnapshot?.daysSinceLastActivity != null && (
                        <Chip
                          label={`Il y a ${profile.ledgerSnapshot.daysSinceLastActivity} j`}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.5rem',
                            bgcolor: profile.ledgerSnapshot.daysSinceLastActivity > 7
                              ? alpha(theme.palette.warning.main, 0.1)
                              : alpha(theme.palette.success.main, 0.1),
                            color: profile.ledgerSnapshot.daysSinceLastActivity > 7
                              ? theme.palette.warning.main
                              : theme.palette.success.main
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {phone && (
                        <>
                          <Tooltip title="Appeler">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => { window.location.href = telHref(phone); }}
                              sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <CallIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="WhatsApp">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => window.open(whatsappHref(phone), '_blank', 'noopener')}
                              sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip title="Ouvrir la fiche">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/wekavit/sss/people/${userId}`)}
                          sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              </Grow>
            );
          })}

          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                <Stack spacing={2} alignItems="center">
                  <PeopleAltIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucune personne trouvée
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Essayez de modifier vos filtres ou d'initialiser les profils
                  </Typography>
                  <Button variant="outlined" onClick={handleClearFilters}>
                    Réinitialiser les filtres
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <MainCard
      title={
        <PageHeader
          icon={<GroupsIcon />}
          eyebrow="Accompagnement"
          title="Personnes à accompagner"
          subtitle="Cherchez quelqu’un, filtrez par étape ou urgence, puis ouvrez sa fiche pour noter, changer l’étape ou l’action conseillée."
          color="info"
        />
      }
      secondary={
        <Stack direction="row" spacing={1}>
          {!isMobile && (
            <>
              <Button
                startIcon={<RefreshIcon />}
                onClick={load}
                disabled={loading}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                {loading ? 'Chargement...' : 'Actualiser'}
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                size="small"
                sx={{ borderRadius: 2 }}
                disabled={exporting || rows.length === 0}
              >
                {exporting ? 'Export...' : 'Exporter'}
              </Button>
            </>
          )}
          {isMobile && (
            <IconButton onClick={load} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          )}
        </Stack>
      }
      sx={{ '& .MuiCardHeader-content': { minWidth: 0 } }}
      contentSX={{ p: { xs: 1.5, sm: 3 } }}
    >
      {/* Loading */}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Chargement des personnes...
          </Typography>
        </Box>
      )}

      {/* Statistiques */}
      {!loading && rows.length > 0 && (
        <Fade in>
          <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Total"
                value={stats.total}
                icon={<PeopleAltIcon />}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Urgents"
                value={stats.urgent}
                subtitle={`${Math.round((stats.urgent / stats.total) * 100)}% du total`}
                icon={<WarningIcon />}
                color={theme.palette.error.main}
                onClick={() => setFilters(prev => ({ ...prev, urgency: 'critical' }))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Nouveaux"
                value={stats.new}
                icon={<PersonAddIcon />}
                color={theme.palette.info.main}
                onClick={() => setFilters(prev => ({ ...prev, cohort: 'new' }))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="En bonne santé"
                value={stats.healthy}
                icon={<CheckCircleIcon />}
                color={theme.palette.success.main}
              />
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Filtres et recherche */}
      {!loading && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Nom, prénom ou téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={handleClearSearch}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ bgcolor: 'background.paper' }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    borderRadius: 2,
                    minWidth: 100,
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  Chercher
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <AdvancedFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Contenu principal */}
      {!loading && rows.length === 0 ? (
        <EmptyState
          title="Aucune personne trouvée"
          subtitle="Essayez d'autres filtres, ou initialisez les profils dans Réglages."
          action={
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleClearFilters}>
                Réinitialiser les filtres
              </Button>
              <Button variant="outlined" onClick={() => navigate('/wekavit/sss/settings')}>
                Aller aux réglages
              </Button>
            </Stack>
          }
        />
      ) : (
        <>
          {/* Version mobile: cartes */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2}>
              {rows.map((profile) => {
                const userId = profile.idUser?._id || profile.idUser;
                return (
                  <PersonCard
                    key={profile._id}
                    profile={profile}
                    onOpen={() => navigate(`/wekavit/sss/people/${userId}`)}
                    variant="default"
                    animated
                  />
                );
              })}
            </Stack>
          </Box>

          {/* Version desktop: tableau */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {renderTable()}
          </Box>

            {/* Pagination */}
            {rows.length > 0 && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 3 }}
              >
                <Typography variant="caption" color="text.secondary">
                  {total} personne{total > 1 ? 's' : ''}
                  {total > 40 && ` · Page ${page} sur ${pageCount}`}
                </Typography>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Stack>
            )}
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Speed Dial */}
      {!loading && rows.length > 0 && (
        <SpeedDial
          ariaLabel="Actions rapides"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
          direction="up"
        >
          <SpeedDialAction
            icon={<RefreshIcon />}
            tooltipTitle="Actualiser"
            onClick={load}
          />
          <SpeedDialAction
            icon={<DownloadIcon />}
            tooltipTitle="Exporter"
            onClick={handleExport}
          />
          <SpeedDialAction
            icon={<PersonAddIcon />}
            tooltipTitle="Ajouter une personne"
            onClick={() => navigate('/wekavit/sss/people/add')}
          />
        </SpeedDial>
      )}
    </MainCard>
  );
};

export default PeoplePage;