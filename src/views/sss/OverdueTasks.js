import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Paper,
  useMediaQuery,
  useTheme,
  alpha,
  Fade,
  Grow,
  Zoom,
  Chip,
  Badge,
  Card,
  CardContent,
  Grid,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  EventRepeat as CarryIcon,
  Visibility as ViewIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  HistoryToggleOff as HistoryIcon,
  WarningAmber as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  PeopleAlt as PeopleIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  DoneAll as DoneAllIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { maskPhone, telHref, whatsappHref, formatDateFr } from './labels';
import {
  ActionLabel,
  EmptyState,
  PersonCell,
  RankBadge,
  StageChip,
  StatusChip,
  UrgencyChip
} from './components/Chips';
import PageHeader from './components/PageHeader';
import TaskCard from './components/TaskCard';
import TaskActionDialog from './components/TaskActionDialog';

// Composant de statistiques
const StatsCard = ({ title, value, subtitle, icon, color, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: alpha(color || theme.palette.primary.main, 0.04),
        transition: 'all 0.3s ease',
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
              {value}
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

// Composant de filtre
const FilterChips = ({ filters, onFilterChange, onClear }) => {
  const theme = useTheme();

  if (!filters.length) return null;

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
      {filters.map((filter, index) => (
        <Chip
          key={index}
          label={filter.label}
          onDelete={() => onFilterChange(filter.id)}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            borderColor: alpha(theme.palette.primary.main, 0.2),
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.12)
            }
          }}
        />
      ))}
      <Chip
        label="Tout effacer"
        size="small"
        onClick={onClear}
        sx={{ cursor: 'pointer' }}
      />
    </Stack>
  );
};

const OverdueTasksPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // États principaux
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortAnchor, setSortAnchor] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [sortBy, setSortBy] = useState('urgency');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
  const [stats, setStats] = useState({ total: 0, urgent: 0, overdue: 0, carried: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Filtres
  const [filters, setFilters] = useState({
    urgency: [],
    status: [],
    stage: [],
    search: ''
  });

  // Chargement des données
  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const res = await SssApi.getOverdueTasks(globalState.key);
      if (res?.status === 200) {
        const data = res.data?.data || [];
        setTasks(data);

        // Calcul des statistiques
        setStats({
          total: data.length,
          urgent: data.filter(t => t.urgency === 'critical' || t.urgency === 'high').length,
          overdue: data.filter(t => new Date(t.date) < new Date()).length,
          carried: data.filter(t => t.carryCount > 0).length
        });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les retards');
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des données',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtrage et tri des tâches
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filtrage par recherche
    if (searchTerm || filters.search) {
      const term = (searchTerm || filters.search).toLowerCase();
      result = result.filter(task =>
        task.idUser?.name?.toLowerCase().includes(term) ||
        task.idUser?.phone?.includes(term) ||
        task.actionType?.toLowerCase().includes(term) ||
        task.stageSnapshot?.toLowerCase().includes(term)
      );
    }

    // Filtrage par urgence
    if (filters.urgency.length) {
      result = result.filter(task => filters.urgency.includes(task.urgency));
    }

    // Filtrage par statut
    if (filters.status.length) {
      result = result.filter(task => filters.status.includes(task.status));
    }

    // Filtrage par étape
    if (filters.stage.length) {
      result = result.filter(task => filters.stage.includes(task.stageSnapshot));
    }

    // Tri
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = (urgencyOrder[a.urgency] || 4) - (urgencyOrder[b.urgency] || 4);
          break;
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'name':
          comparison = (a.idUser?.name || '').localeCompare(b.idUser?.name || '');
          break;
        case 'carryCount':
          comparison = (a.carryCount || 0) - (b.carryCount || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, searchTerm, filters, sortBy, sortOrder]);

  // Gestion des actions
  const handleSave = async (payload) => {
    if (!selected || !globalState?.key) return;
    setSaving(true);
    try {
      const res = await SssApi.updateTask(selected._id, payload, globalState.key);
      if (res?.status === 200) {
        toast.success('Action mise à jour avec succès');
        setDialogOpen(false);
        await load();
        setSnackbar({ open: true, message: 'Tâche mise à jour', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec de la mise à jour');
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCarry = async (task) => {
    try {
      const res = await SssApi.carryTask(task._id, {}, globalState.key);
      if (res?.status === 200) {
        toast.success('Tâche reportée au prochain jour ouvré');
        await load();
        setSnackbar({ open: true, message: 'Tâche reportée avec succès', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de reporter');
      setSnackbar({ open: true, message: 'Erreur lors du report', severity: 'error' });
    }
  };

  const handleBulkAction = async (action) => {
    // Implémenter les actions en masse
    setBulkActionAnchor(null);
    setSnackbar({ open: true, message: `${selectedTasks.length} tâches ${action}ées`, severity: 'success' });
    setSelectedTasks([]);
  };

  const handleExport = () => {
    // Export CSV
    const headers = ['Personne', 'Téléphone', 'Action', 'Étape', 'Urgence', 'Statut', 'Date prévue', 'Reports'];
    const data = filteredAndSortedTasks.map(task => [
      task.idUser?.name || 'N/A',
      task.idUser?.phone || 'N/A',
      task.actionType || 'N/A',
      task.stageSnapshot || 'N/A',
      task.urgency || 'N/A',
      task.status || 'N/A',
      task.date || 'N/A',
      task.carryCount || 0
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taches_retard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
  };

  const getActiveFilters = () => {
    const active = [];
    if (searchTerm) active.push({ id: 'search', label: `Recherche: ${searchTerm}` });
    filters.urgency.forEach(u => active.push({ id: `urgency-${u}`, label: `Urgence: ${u}` }));
    filters.status.forEach(s => active.push({ id: `status-${s}`, label: `Statut: ${s}` }));
    filters.stage.forEach(s => active.push({ id: `stage-${s}`, label: `Étape: ${s}` }));
    return active;
  };

  const clearFilter = (filterId) => {
    if (filterId === 'search') {
      setSearchTerm('');
      setFilters(prev => ({ ...prev, search: '' }));
    } else if (filterId.startsWith('urgency-')) {
      const urgency = filterId.replace('urgency-', '');
      setFilters(prev => ({ ...prev, urgency: prev.urgency.filter(u => u !== urgency) }));
    } else if (filterId.startsWith('status-')) {
      const status = filterId.replace('status-', '');
      setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
    } else if (filterId.startsWith('stage-')) {
      const stage = filterId.replace('stage-', '');
      setFilters(prev => ({ ...prev, stage: prev.stage.filter(s => s !== stage) }));
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({ urgency: [], status: [], stage: [], search: '' });
  };

  // Rendu du tableau des tâches
  const renderTable = () => (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableCell width={44}>#</TableCell>
            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" fontWeight={600}>Jour prévu</Typography>
                <IconButton size="small" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                </IconButton>
              </Stack>
            </TableCell>
            <TableCell>Personne</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Étape</TableCell>
            <TableCell>Urgence</TableCell>
            <TableCell>État</TableCell>
            <TableCell align="center">Reports</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAndSortedTasks.map((task, idx) => {
            const phone = task.idUser?.phone;
            const isUrgent = task.urgency === 'critical' || task.urgency === 'high';

            return (
              <Grow key={task._id} in timeout={idx * 50}>
                <TableRow
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    bgcolor: isUrgent ? alpha(theme.palette.error.main, 0.02) : 'inherit',
                    borderLeft: isUrgent ? `3px solid ${theme.palette.error.main}` : 'none'
                  }}
                >
                  <TableCell>
                    <RankBadge rank={idx + 1} urgency={task.urgency} />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={new Date(task.date) < new Date() ? 600 : 400}>
                        {task.date}
                      </Typography>
                      {task.originDate && task.originDate !== task.date && (
                        <Typography variant="caption" color="text.secondary">
                          depuis {task.originDate}
                        </Typography>
                      )}
                      {new Date(task.date) < new Date() && (
                        <Chip
                          label="En retard"
                          size="small"
                          color="error"
                          sx={{ height: 16, fontSize: '0.5rem' }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <PersonCell user={task.idUser} phone={maskPhone(phone)} />
                  </TableCell>
                  <TableCell>
                    <ActionLabel action={task.actionType} />
                  </TableCell>
                  <TableCell>
                    <StageChip stage={task.stageSnapshot} size="small" />
                  </TableCell>
                  <TableCell>
                    <UrgencyChip urgency={task.urgency} size="small" />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={task.status} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Badge
                      badgeContent={task.carryCount || 0}
                      color="warning"
                      sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}
                    >
                      <CarryIcon fontSize="small" color="action" />
                    </Badge>
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
                      <Tooltip title="Voir la fiche">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/wekavit/sss/people/${task.idUser?._id || task.idUser}`)}
                          sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reporter">
                        <IconButton
                          size="small"
                          onClick={() => handleCarry(task)}
                          sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}
                        >
                          <CarryIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<StartIcon />}
                        onClick={() => {
                          setSelected(task);
                          setDialogOpen(true);
                        }}
                        sx={{
                          borderRadius: 2,
                          minWidth: 80,
                          background: isUrgent
                            ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`
                            : undefined,
                          '&:hover': isUrgent ? {
                            background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.warning.dark})`,
                          } : undefined
                        }}
                      >
                        Traiter
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              </Grow>
            );
          })}

          {filteredAndSortedTasks.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <Stack spacing={2} alignItems="center">
                  <HistoryIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucune tâche en retard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toutes vos actions sont à jour !
                  </Typography>
                  <Button variant="outlined" onClick={load} startIcon={<RefreshIcon />}>
                    Actualiser
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Rendu des cartes (mobile)
  const renderCards = () => (
    <Stack spacing={2} sx={{ mt: 2 }}>
      {filteredAndSortedTasks.map((task, idx) => (
        <TaskCard
          key={task._id}
          task={task}
          rank={idx + 1}
          showDate
          onOpen={(t) => {
            setSelected(t);
            setDialogOpen(true);
          }}
          onCarry={handleCarry}
          onView={(t) => navigate(`/wekavit/sss/people/${t.idUser?._id || t.idUser}`)}
          variant="default"
          animated
        />
      ))}

      {filteredAndSortedTasks.length === 0 && !loading && (
        <EmptyState
          title="Aucune tâche en retard"
          subtitle="Toutes vos actions sont à jour. Continuez votre bon travail !"
          action={
            <Button variant="contained" onClick={load} startIcon={<RefreshIcon />}>
              Actualiser
            </Button>
          }
        />
      )}
    </Stack>
  );

  return (
    <MainCard
      title={
        <PageHeader
          icon={<HistoryIcon />}
          eyebrow="Accompagnement"
          title="Actions en retard"
          subtitle="Ces actions n'ont pas été terminées les jours précédents. Traitez-les maintenant ou reportez-les au prochain jour ouvré."
          color="error"
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
                disabled={filteredAndSortedTasks.length === 0}
              >
                Exporter
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
            Chargement des tâches en retard...
          </Typography>
        </Box>
      )}

      {/* Statistiques */}
      {!loading && tasks.length > 0 && (
        <Fade in>
          <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Total des retards"
                value={stats.total}
                icon={<HistoryIcon />}
                color={theme.palette.error.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Urgents"
                value={stats.urgent}
                subtitle={`${Math.round((stats.urgent / stats.total) * 100)}% du total`}
                icon={<WarningIcon />}
                color={theme.palette.error.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="En retard"
                value={stats.overdue}
                icon={<AccessTimeIcon />}
                color={theme.palette.warning.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Reportés"
                value={stats.carried}
                icon={<CarryIcon />}
                color={theme.palette.info.main}
              />
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Filtres actifs */}
      {!loading && getActiveFilters().length > 0 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <FilterChips
            filters={getActiveFilters()}
            onFilterChange={clearFilter}
            onClear={clearAllFilters}
          />
        </Box>
      )}

      {/* Contenu principal */}
      {!loading && tasks.length === 0 ? (
        <Box mt={2}>
          <EmptyState
            title="Aucun retard"
            subtitle="Bravo — tout est à jour. Continuez à maintenir ce rythme !"
            action={
              <Button variant="contained" onClick={load} startIcon={<RefreshIcon />}>
                Actualiser
              </Button>
            }
          />
        </Box>
      ) : (
        <>
          {/* Version mobile: cartes */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {renderCards()}
          </Box>

          {/* Version desktop: tableau */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 2 }}>
            {renderTable()}
          </Box>
        </>
      )}

      {/* Pied de page */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Dernière actualisation : {formatDateFr(new Date())}
        </Typography>
        {filteredAndSortedTasks.length > 0 && (
          <Chip
            label={`${filteredAndSortedTasks.length} tâche${filteredAndSortedTasks.length > 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>

      {/* Dialogue d'action */}
      <TaskActionDialog
        open={dialogOpen}
        task={selected}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        saving={saving}
        showStepper
        enableSnooze
      />

      {/* Snackbar pour les notifications */}
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

      {/* Speed Dial pour actions rapides */}
      {!loading && tasks.length > 0 && (
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
            icon={<PeopleIcon />}
            tooltipTitle="Voir toutes les personnes"
            onClick={() => navigate('/wekavit/sss/people')}
          />
        </SpeedDial>
      )}
    </MainCard>
  );
};

export default OverdueTasksPage;