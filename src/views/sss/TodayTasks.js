import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography,
  Tooltip,
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Grow,
  Zoom,
  Card,
  CardContent,
  Grid,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Skeleton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  EventRepeat as CarryIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  FactCheck as FactCheckIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  DoneAll as DoneAllIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  PeopleAlt as PeopleAltIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewQuilt as ViewQuiltIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { displayName, maskPhone, telHref, whatsappHref, ACTION_LABELS, URGENCY_LABELS } from './labels';
import {
  ActionLabel,
  AlertChips,
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

const TEAL = { main: '#0D9488', dark: '#0F766E', deeper: '#115E59' };
const tealGradient = {
  background: `linear-gradient(135deg, ${TEAL.main}, ${TEAL.dark})`,
  '&:hover': { background: `linear-gradient(135deg, ${TEAL.dark}, ${TEAL.deeper})` }
};

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

// Composant de filtre rapide
const QuickFilterChips = ({ filters, onFilterChange, onClear }) => {
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
            bgcolor: alpha(TEAL.main, 0.08),
            color: TEAL.dark,
            borderColor: alpha(TEAL.main, 0.2),
            '&:hover': {
              bgcolor: alpha(TEAL.main, 0.12)
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

const TodayTasksPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // États principaux
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filterStatus, setFilterStatus] = useState('open');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('urgency');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exporting, setExporting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Chargement des données
  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const res = await SssApi.getBoard({}, globalState.key);
      if (res?.status === 200) {
        setBoard(res.data?.board || null);
        setTasks(res.data?.tasks || []);
        setSummary(res.data?.summary || null);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les actions du jour');
      setSnackbar({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  // Filtrage et tri des tâches
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = tasks.filter((t) => {
      if (filterStatus === 'open' && !['todo', 'in_progress', 'partial', 'blocked', 'carried_over'].includes(t.status)) {
        return false;
      }
      if (filterStatus === 'done' && t.status !== 'done') return false;
      if (filterStatus !== 'all' && filterStatus !== 'open' && filterStatus !== 'done' && t.status !== filterStatus) {
        return false;
      }
      if (filterUrgency && t.urgency !== filterUrgency) return false;
      if (q) {
        const name = displayName(t.idUser).toLowerCase();
        const action = (ACTION_LABELS[t.actionType] || '').toLowerCase();
        if (!name.includes(q) && !action.includes(q)) return false;
      }
      return true;
    });

    // Tri
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = (urgencyOrder[a.urgency] || 4) - (urgencyOrder[b.urgency] || 4);
          break;
        case 'priority':
          comparison = (a.priority || 0) - (b.priority || 0);
          break;
        case 'name':
          comparison = (a.idUser?.name || '').localeCompare(b.idUser?.name || '');
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, filterStatus, filterUrgency, search, sortBy, sortOrder]);

  // Statistiques
  const stats = useMemo(() => {
    if (!summary) return { total: 0, open: 0, done: 0, overdue: 0, completionRate: 0 };
    return {
      total: summary.total || 0,
      open: summary.open || 0,
      done: summary.done || 0,
      overdue: summary.overdueFromPastDays || 0,
      completionRate: summary.completionRate || 0
    };
  }, [summary]);

  // Gestionnaires d'actions
  const openTask = (task) => {
    setSelected(task);
    setDialogOpen(true);
  };

  const handleSave = async (payload) => {
    if (!selected || !globalState?.key) return;
    setSaving(true);
    try {
      const res = await SssApi.updateTask(selected._id, payload, globalState.key);
      if (res?.status === 200) {
        toast.success('Action enregistrée avec succès');
        setDialogOpen(false);
        await load();
        setSnackbar({ open: true, message: 'Tâche mise à jour', severity: 'success' });
      } else {
        toast.error(res?.data?.message || 'Échec');
        setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Échec');
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCarry = async (task) => {
    if (!globalState?.key) return;
    try {
      const res = await SssApi.carryTask(task._id, {}, globalState.key);
      if (res?.status === 200) {
        toast.success('Reporté au prochain jour ouvré');
        await load();
        setSnackbar({ open: true, message: 'Tâche reportée', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de reporter');
      setSnackbar({ open: true, message: 'Erreur lors du report', severity: 'error' });
    }
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Message copié dans le presse-papier');
      setSnackbar({ open: true, message: 'Message copié', severity: 'success' });
    } catch {
      toast.error('Copie impossible');
    }
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = ['Rang', 'Personne', 'Téléphone', 'Action', 'Étape', 'Urgence', 'Statut', 'Alertes', 'Reports'];
      const data = filtered.map((task, idx) => [
        idx + 1,
        displayName(task.idUser),
        task.idUser?.phone || 'N/A',
        ACTION_LABELS[task.actionType] || task.actionType || 'N/A',
        task.stageSnapshot || 'N/A',
        URGENCY_LABELS[task.urgency] || task.urgency || 'N/A',
        task.status || 'N/A',
        task.alertsSnapshot?.length || 0,
        task.carryCount || 0
      ]);

      const csv = [headers, ...data].map(row => row.join(',')).join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taches_jour_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExporting(false);
      setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
    }, 500);
  };

  const handleBulkAction = (action) => {
    // Implémenter les actions en masse
    setMenuAnchor(null);
    setSnackbar({ open: true, message: `${selectedTasks.length} tâches ${action}ées`, severity: 'success' });
    setSelectedTasks([]);
  };

  const getActiveFilters = () => {
    const active = [];
    if (search) active.push({ id: 'search', label: `Recherche: ${search}` });
    if (filterStatus !== 'open' && filterStatus !== 'all') {
      active.push({ id: 'status', label: `Statut: ${filterStatus}` });
    }
    if (filterUrgency) {
      active.push({ id: 'urgency', label: `Urgence: ${URGENCY_LABELS[filterUrgency] || filterUrgency}` });
    }
    return active;
  };

  const clearFilter = (filterId) => {
    if (filterId === 'search') {
      setSearch('');
    } else if (filterId === 'status') {
      setFilterStatus('open');
    } else if (filterId === 'urgency') {
      setFilterUrgency('');
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setFilterStatus('open');
    setFilterUrgency('');
  };

  // Rendu du tableau
  const renderTable = () => (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        borderColor: alpha(TEAL.main, 0.12)
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(TEAL.main, 0.04) }}>
            <TableCell width={44}>#</TableCell>
            <TableCell>Personne</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Étape</TableCell>
            <TableCell>Urgence</TableCell>
            <TableCell>État</TableCell>
            <TableCell>Alertes</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((task, idx) => {
            const phone = task.idUser?.phone;
            const isUrgent = task.urgency === 'critical' || task.urgency === 'high';
            const isCarried = task.status === 'carried_over';

            return (
              <Grow key={task._id} in timeout={idx * 50}>
                <TableRow
                  hover
                  sx={{
                    '&:hover': { bgcolor: alpha(TEAL.main, 0.03) },
                    bgcolor: isCarried
                      ? alpha(theme.palette.warning.main, 0.04)
                      : isUrgent
                        ? alpha(theme.palette.error.main, 0.02)
                        : 'inherit',
                    borderLeft: isCarried
                      ? `3px solid ${theme.palette.warning.main}`
                      : isUrgent
                        ? `3px solid ${theme.palette.error.main}`
                        : 'none',
                    position: 'relative',
                    '&::after': isCarried ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 3,
                      height: '100%',
                      background: `linear-gradient(180deg, ${theme.palette.warning.main}, ${alpha(theme.palette.warning.main, 0.3)})`,
                    } : {}
                  }}
                >
                  <TableCell>
                    <RankBadge rank={idx + 1} urgency={task.urgency} />
                  </TableCell>
                  <TableCell>
                    <PersonCell user={task.idUser} phone={maskPhone(phone)} />
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <ActionLabel action={task.actionType} />
                      {task.carryCount > 0 && (
                        <Chip
                          icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
                          label={`Reporté ${task.carryCount}×`}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.6rem' }}
                        />
                      )}
                    </Stack>
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
                  <TableCell>
                    <AlertChips alerts={task.alertsSnapshot} max={2} />
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
                      {task.templateSnapshot && (
                        <Tooltip title="Copier le message">
                          <IconButton
                            size="small"
                            onClick={() => copyMessage(task.templateSnapshot)}
                            sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                        onClick={() => openTask(task)}
                        sx={{
                          borderRadius: 2,
                          ...(isUrgent ? {
                            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.warning.dark})`,
                            }
                          } : tealGradient)
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

          {filtered.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                <Stack spacing={2} alignItems="center">
                  <FactCheckIcon sx={{ fontSize: 48, color: 'action.disabled' }} />
                  <Typography variant="h6" color="text.secondary">
                    {search || filterStatus !== 'open' || filterUrgency
                      ? 'Aucune tâche ne correspond aux filtres'
                      : 'Toutes les tâches sont terminées !'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {search || filterStatus !== 'open' || filterUrgency
                      ? 'Essayez de modifier vos filtres'
                      : 'Bravo, vous avez terminé toutes les tâches du jour !'}
                  </Typography>
                  {(search || filterStatus !== 'open' || filterUrgency) && (
                    <Button variant="outlined" onClick={clearAllFilters}>
                      Réinitialiser les filtres
                    </Button>
                  )}
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
    <Stack spacing={2}>
      {filtered.map((task, idx) => (
        <TaskCard
          key={task._id}
          task={task}
          rank={idx + 1}
          onOpen={openTask}
          onCarry={handleCarry}
          onCopy={copyMessage}
          onView={(t) => navigate(`/wekavit/sss/people/${t.idUser?._id || t.idUser}`)}
          variant="default"
          animated
        />
      ))}

      {filtered.length === 0 && !loading && (
        <EmptyState
          title="Aucune tâche à afficher"
          subtitle={search || filterStatus !== 'open' || filterUrgency
            ? 'Essayez de modifier vos filtres'
            : 'Toutes les tâches sont terminées !'}
          action={
            (search || filterStatus !== 'open' || filterUrgency) && (
              <Button variant="outlined" onClick={clearAllFilters}>
                Réinitialiser les filtres
              </Button>
            )
          }
        />
      )}
    </Stack>
  );

  // Si pas de board
  if (!board && !loading) {
    return (
      <MainCard
        title={
          <PageHeader
            icon={<FactCheckIcon />}
            eyebrow="Accompagnement"
            title="À faire aujourd’hui"
            subtitle="Préparez d'abord la liste du jour"
            color="warning"
          />
        }
        contentSX={{ p: { xs: 1.5, sm: 3 } }}
      >
        <Alert
          severity="info"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" onClick={() => navigate('/wekavit/sss')} size="small">
              Préparer
            </Button>
          }
        >
          Aucune liste générée pour aujourd’hui. Retournez à la vue du jour et cliquez sur « Préparer la journée ».
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard
      title={
        <PageHeader
          icon={<FactCheckIcon />}
          eyebrow="Accompagnement"
          title="À faire aujourd’hui"
          subtitle="Chaque ligne est une personne à contacter, classée de la plus urgente à la moins urgente. Ouvrez l’action, copiez le message si besoin, puis indiquez le résultat."
          color="warning"
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
                disabled={exporting || filtered.length === 0}
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
            Chargement des tâches du jour...
          </Typography>
        </Box>
      )}

      {/* Résumé */}
      {summary && !loading && (
        <Fade in>
          <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Total"
                value={stats.total}
                icon={<FactCheckIcon />}
                color={theme.palette.primary.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Restantes"
                value={stats.open}
                subtitle={`${Math.round((stats.open / stats.total) * 100)}%`}
                icon={<ScheduleIcon />}
                color={theme.palette.warning.main}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Terminées"
                value={stats.done}
                subtitle={`${Math.round((stats.done / stats.total) * 100)}%`}
                icon={<CheckCircleIcon />}
                color={theme.palette.success.main}
                onClick={() => setFilterStatus('done')}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatsCard
                title="Taux de complétion"
                value={`${stats.completionRate}%`}
                icon={<TrendingUpIcon />}
                color={stats.completionRate > 70 ? theme.palette.success.main : theme.palette.warning.main}
              />
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Filtres */}
      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          mb: 3,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          borderColor: alpha(TEAL.main, 0.12),
          bgcolor: alpha(TEAL.main, 0.02)
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <FilterIcon sx={{ fontSize: 18, color: TEAL.dark }} />
          <Typography variant="subtitle2" fontWeight={600} color="text.primary">
            Filtres
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              placeholder="Rechercher une personne..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                ),
                endAdornment: search && (
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
                sx: { borderRadius: 2, bgcolor: 'background.paper' }
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              select
              size="small"
              label="État"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              fullWidth
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
              SelectProps={{ sx: { borderRadius: 2 } }}
            >
              <MenuItem value="open">À traiter</MenuItem>
              <MenuItem value="done">Terminées</MenuItem>
              <MenuItem value="all">Toutes</MenuItem>
              <MenuItem value="todo">À faire</MenuItem>
              <MenuItem value="in_progress">En cours</MenuItem>
              <MenuItem value="partial">Partielles</MenuItem>
              <MenuItem value="blocked">Bloquées</MenuItem>
              <MenuItem value="carried_over">Reportées</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              select
              size="small"
              label="Urgence"
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              fullWidth
              sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
              SelectProps={{ sx: { borderRadius: 2 } }}
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="critical">Critique</MenuItem>
              <MenuItem value="high">Élevée</MenuItem>
              <MenuItem value="medium">Moyenne</MenuItem>
              <MenuItem value="low">Basse</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
              size="small"
              sx={{
                height: '100%',
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  px: 2,
                  bgcolor: 'background.paper'
                },
                '& .MuiToggleButton-root.Mui-selected': {
                  bgcolor: alpha(TEAL.main, 0.12),
                  color: TEAL.dark,
                  borderColor: alpha(TEAL.main, 0.3),
                  '&:hover': { bgcolor: alpha(TEAL.main, 0.18) }
                }
              }}
            >
              <ToggleButton value="table">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="cards">
                <ViewModuleIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Paper>

      {/* Filtres actifs */}
      {getActiveFilters().length > 0 && (
        <Box sx={{ mb: 2 }}>
          <QuickFilterChips
            filters={getActiveFilters()}
            onFilterChange={clearFilter}
            onClear={clearAllFilters}
          />
        </Box>
      )}

      {/* Contenu principal */}
      {!loading && filtered.length === 0 ? (
        <EmptyState
          title={search || filterStatus !== 'open' || filterUrgency
            ? "Aucune tâche ne correspond aux filtres"
            : "Toutes les tâches sont terminées !"}
          subtitle={search || filterStatus !== 'open' || filterUrgency
            ? "Essayez de modifier vos filtres ou d'élargir votre recherche"
            : "Bravo, vous avez terminé toutes les tâches du jour. Profitez du reste de votre journée !"}
          action={
            (search || filterStatus !== 'open' || filterUrgency) && (
              <Button variant="contained" onClick={clearAllFilters} sx={{ borderRadius: 2, ...tealGradient }}>
                Réinitialiser les filtres
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Version mobile: cartes */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {renderCards()}
          </Box>

          {/* Version desktop: tableau */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {renderTable()}
          </Box>
        </>
      )}

      {/* Astuce */}
      {!loading && filtered.length > 0 && (
        <Box mt={2}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <InfoIcon />
              <Typography variant="body2">
                Astuce : traitez d'abord les lignes <strong>« Urgent »</strong>, puis <strong>« Prioritaire »</strong>.
                Les reportées apparaissent en jaune.
              </Typography>
            </Stack>
          </Alert>
        </Box>
      )}

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
      {!loading && filtered.length > 0 && (
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
            icon={<PeopleAltIcon />}
            tooltipTitle="Voir les personnes"
            onClick={() => navigate('/wekavit/sss/people')}
          />
        </SpeedDial>
      )}
    </MainCard>
  );
};

export default TodayTasksPage;