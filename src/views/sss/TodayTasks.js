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
  EmptyState,
  PersonAvatar,
  RankBadge,
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
  viewButtonSx,
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
        const payload = res.data?.data && !Array.isArray(res.data.data) ? res.data.data : res.data || {};
        const taskList = Array.isArray(payload.tasks)
          ? payload.tasks
          : Array.isArray(res.data?.tasks)
            ? res.data.tasks
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];
        setBoard(payload.board || res.data?.board || null);
        setTasks(taskList);
        setSummary(payload.summary || res.data?.summary || null);
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
    const list = Array.isArray(tasks) ? tasks : [];

    return list
      .filter((t) => {
        const status = t?.status || 'todo';
        if (filterStatus === 'open' && (status === 'done' || status === 'skipped')) return false;
        if (filterStatus === 'done' && status !== 'done') return false;
        if (filterStatus !== 'all' && filterStatus !== 'open' && filterStatus !== 'done' && status !== filterStatus) {
          return false;
        }
        if (filterUrgency && t.urgency !== filterUrgency) return false;
        if (q) {
          const name = displayName(t.idUser).toLowerCase();
          const action = (ACTION_LABELS[t.actionType] || t.actionType || '').toLowerCase();
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
            <TableCell width={48} sx={tableHeadCellSx}>#</TableCell>
            <TableCell sx={tableHeadCellSx}>Personne</TableCell>
            <TableCell sx={tableHeadCellSx}>À faire</TableCell>
            <TableCell sx={tableHeadCellSx}>Urgence</TableCell>
            <TableCell align="right" sx={tableHeadCellSx}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((task, idx) => (
            <TableRow
              key={task._id}
              hover
              onClick={() => openTask(task)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell sx={tableBodyCellSx}>
                <RankBadge rank={idx + 1} urgency={task.urgency} />
              </TableCell>
              <TableCell sx={tableBodyCellSx}>
                <div className="flex items-center gap-2.5">
                  <PersonAvatar user={task.idUser} size={32} />
                  <span className="text-sm font-semibold text-sss-text">{displayName(task.idUser)}</span>
                </div>
              </TableCell>
              <TableCell sx={tableBodyCellSx}>
                <ActionLabel action={task.actionType} />
              </TableCell>
              <TableCell sx={tableBodyCellSx}>
                <UrgencyChip urgency={task.urgency} size="small" />
              </TableCell>
              <TableCell align="right" sx={tableBodyCellSx} onClick={(e) => e.stopPropagation()}>
                <Button size="small" variant="outlined" onClick={() => openTask(task)} sx={viewButtonSx}>
                  Traiter
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 6, border: 0 }}>
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
    <>
      {filtered.map((task, idx) => (
        <TaskCard key={task._id} task={task} rank={idx + 1} onOpen={openTask} animated />
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
    </>
  );

  if (!board && !loading) {
    return (
      <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: SSS_COLORS.pageBg }}>
        <div className="sss-page">
          <PageToolbar
            icon={<FactCheckIcon />}
            title="À faire aujourd'hui"
            subtitle="Préparez d'abord la liste du jour"
            color={SSS_COLORS.warning}
          />
          <div className="sss-surface-soft flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="sss-muted m-0 leading-relaxed">
              Aucune liste générée pour aujourd&apos;hui. Retournez à la vue du jour et cliquez sur « Préparer la journée ».
            </p>
            <PrimaryButton onClick={() => navigate('/wekavit/sss')}>Préparer</PrimaryButton>
          </div>
        </div>
      </MainCard>
    );
  }

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: SSS_COLORS.pageBg }}>
      <div className="sss-page">
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
              <PrimaryButton startIcon={<PeopleAltIcon />} onClick={() => navigate('/wekavit/sss/people')}>
                Voir les personnes
              </PrimaryButton>
              <Tooltip title="Actualiser">
                <IconButton
                  onClick={load}
                  disabled={loading}
                  className="!rounded-xl !border !border-sss-border !bg-white"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </>
          }
        />

        {loading && (
          <div className="mb-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-sss-brand-soft">
              <div className="h-full w-1/3 animate-sss-shimmer rounded-full bg-sss-brand" />
            </div>
            <p className="sss-muted mt-2 text-xs">Chargement des tâches du jour...</p>
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total" value={stats.total} hint="Actions du jour" icon={<FactCheckIcon />} color={SSS_COLORS.brand} loading={loading} variant="dark" />
          <KpiCard title="Restantes" value={stats.open} hint="À traiter" icon={<ScheduleIcon />} color={SSS_COLORS.warning} loading={loading} variant="dark" />
          <KpiCard title="Terminées" value={stats.done} hint="Aujourd'hui" icon={<CheckCircleIcon />} color={SSS_COLORS.success} loading={loading} onClick={() => setFilterStatus('done')} variant="dark" />
          <KpiCard title="Reports" value={stats.reports} hint="Reportées au moins 1×" icon={<CarryIcon />} color={SSS_COLORS.error} loading={loading} variant="dark" />
        </div>

        <InfoBanner icon={<InfoIcon />}>
          Astuce : traitez d&apos;abord les lignes <strong>« Urgent »</strong>, puis <strong>« Prioritaire »</strong>. Les
          reportées apparaissent en orange.
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

        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <div className="flex flex-col gap-3">{renderCards()}</div>
        </Box>
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
      </div>
    </MainCard>
  );
};

export default TodayTasksPage;
