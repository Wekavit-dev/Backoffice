import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Typography,
  Tooltip,
  Alert,
  useTheme,
  useMediaQuery,
  Snackbar
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  EventRepeat as CarryIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  FactCheck as FactCheckIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  PeopleAlt as PeopleAltIcon,
  Info as InfoIcon
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
import TaskCard from './components/TaskCard';
import TaskActionDialog from './components/TaskActionDialog';
import {
  PageToolbar,
  KpiCard,
  InfoBanner,
  FilterBar,
  filterFieldSx,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  PrimaryButton,
  GhostButton,
  SSS_COLORS
} from './components/SssLayout';

const TodayTasksPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exporting, setExporting] = useState(false);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return tasks
      .filter((t) => {
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
      })
      .sort((a, b) => (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4));
  }, [tasks, filterStatus, filterUrgency, search]);

  const stats = useMemo(() => {
    if (!summary) return { total: 0, open: 0, done: 0, reports: 0 };
    return {
      total: summary.total || 0,
      open: summary.open || 0,
      done: summary.done || 0,
      reports: tasks.filter((t) => (t.carryCount || 0) > 0).length
    };
  }, [summary, tasks]);

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

      const csv = [headers, ...data].map((row) => row.join(',')).join('\n');
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

  const clearAllFilters = () => {
    setSearch('');
    setFilterStatus('open');
    setFilterUrgency('');
  };

  const hasActiveFilters = Boolean(search || (filterStatus !== 'open' && filterStatus !== 'all') || filterUrgency);

  const renderTable = () => (
    <TableShell>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={44} sx={tableHeadCellSx}>#</TableCell>
            <TableCell sx={tableHeadCellSx}>Personne</TableCell>
            <TableCell sx={tableHeadCellSx}>Action</TableCell>
            <TableCell sx={tableHeadCellSx}>Étape</TableCell>
            <TableCell sx={tableHeadCellSx}>Urgence</TableCell>
            <TableCell sx={tableHeadCellSx}>État</TableCell>
            <TableCell sx={tableHeadCellSx}>Alertes</TableCell>
            <TableCell align="right" sx={tableHeadCellSx}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((task, idx) => {
            const phone = task.idUser?.phone;

            return (
              <TableRow key={task._id} hover>
                <TableCell sx={tableBodyCellSx}>
                  <RankBadge rank={idx + 1} urgency={task.urgency} />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <PersonCell user={task.idUser} phone={maskPhone(phone)} />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <Stack spacing={0.5}>
                    <ActionLabel action={task.actionType} />
                    {task.carryCount > 0 && (
                      <Chip
                        icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
                        label={`Reporté ${task.carryCount}×`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.6rem', width: 'fit-content' }}
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <StageChip stage={task.stageSnapshot} size="small" />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <UrgencyChip urgency={task.urgency} size="small" />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <StatusChip status={task.status} size="small" />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <AlertChips alerts={task.alertsSnapshot} max={2} />
                </TableCell>
                <TableCell align="right" sx={tableBodyCellSx}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewIcon fontSize="small" />}
                    onClick={() => openTask(task)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: SSS_COLORS.brandBorder,
                      color: SSS_COLORS.brand,
                      bgcolor: 'rgba(103,58,183,0.04)',
                      px: 1.5,
                      '&:hover': { borderColor: SSS_COLORS.brand, bgcolor: 'rgba(103,58,183,0.1)' }
                    }}
                  >
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {filtered.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 6, border: 0 }}>
                <EmptyState
                  icon={<FactCheckIcon />}
                  title={hasActiveFilters ? 'Aucune tâche ne correspond aux filtres' : 'Toutes les tâches sont terminées !'}
                  subtitle={hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Bravo, vous avez terminé toutes les tâches du jour !'}
                  action={
                    hasActiveFilters && (
                      <Button variant="outlined" onClick={clearAllFilters}>
                        Réinitialiser les filtres
                      </Button>
                    )
                  }
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableShell>
  );

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
          icon={<FactCheckIcon />}
          title="Aucune tâche à afficher"
          subtitle={hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Toutes les tâches sont terminées !'}
          action={
            hasActiveFilters && (
              <Button variant="outlined" onClick={clearAllFilters}>
                Réinitialiser les filtres
              </Button>
            )
          }
        />
      )}
    </Stack>
  );

  if (!board && !loading) {
    return (
      <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: 'background.paper' }}>
        <PageToolbar
          icon={<FactCheckIcon />}
          title="À faire aujourd'hui"
          subtitle="Préparez d'abord la liste du jour"
          color={SSS_COLORS.warning}
        />
        <Alert
          severity="info"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" onClick={() => navigate('/wekavit/sss')} size="small">
              Préparer
            </Button>
          }
        >
          Aucune liste générée pour aujourd'hui. Retournez à la vue du jour et cliquez sur « Préparer la journée ».
        </Alert>
      </MainCard>
    );
  }

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: 'background.paper' }}>
      <PageToolbar
        icon={<FactCheckIcon />}
        title="À faire aujourd'hui"
        subtitle="Chaque ligne est une personne à contacter, classée de la plus urgente à la moins urgente."
        actions={
          <>
            <GhostButton
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={exporting || filtered.length === 0}
            >
              {exporting ? 'Export...' : 'Exporter'}
            </GhostButton>
            <PrimaryButton
              startIcon={<PeopleAltIcon />}
              onClick={() => navigate('/wekavit/sss/people')}
            >
              Voir les personnes
            </PrimaryButton>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={load}
                disabled={loading}
                sx={{
                  border: `1px solid ${SSS_COLORS.cardBorder}`,
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Chargement des tâches du jour...
          </Typography>
        </Box>
      )}

      <Grid container spacing={{ xs: 1.25, sm: 2 }} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Total" value={stats.total} hint="Actions du jour" icon={<FactCheckIcon />} color={SSS_COLORS.brand} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Restantes" value={stats.open} hint="À traiter" icon={<ScheduleIcon />} color={SSS_COLORS.warning} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Terminées" value={stats.done} hint="Aujourd'hui" icon={<CheckCircleIcon />} color={SSS_COLORS.success} loading={loading} onClick={() => setFilterStatus('done')} />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Reports" value={stats.reports} hint="Reportées au moins 1×" icon={<CarryIcon />} color={SSS_COLORS.error} loading={loading} />
        </Grid>
      </Grid>

      <InfoBanner icon={<InfoIcon />}>
        Astuce : traitez d'abord les lignes <strong>« Urgent »</strong>, puis <strong>« Prioritaire »</strong>. Les reportées apparaissent en orange.
      </InfoBanner>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une personne..."
        onRefresh={load}
        refreshing={loading}
      >
        <TextField
          select
          size="small"
          label="État"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          sx={filterFieldSx}
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
        <TextField
          select
          size="small"
          label="Urgence"
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value)}
          sx={filterFieldSx}
        >
          <MenuItem value="">Toutes</MenuItem>
          <MenuItem value="critical">Critique</MenuItem>
          <MenuItem value="high">Élevée</MenuItem>
          <MenuItem value="medium">Moyenne</MenuItem>
          <MenuItem value="low">Basse</MenuItem>
        </TextField>
      </FilterBar>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>{renderCards()}</Box>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{renderTable()}</Box>

      <TaskActionDialog
        open={dialogOpen}
        task={selected}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        saving={saving}
        showStepper
        enableSnooze
      />

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
    </MainCard>
  );
};

export default TodayTasksPage;
