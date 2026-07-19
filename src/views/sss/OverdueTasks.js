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
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  useMediaQuery,
  useTheme,
  Grid,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  EventRepeat as CarryIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  HistoryToggleOff as HistoryIcon,
  WarningAmber as WarningIcon,
  AccessTime as AccessTimeIcon,
  Download as DownloadIcon,
  PeopleAlt as PeopleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { maskPhone, telHref, whatsappHref, displayName } from './labels';
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
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  viewButtonSx,
  PrimaryButton,
  GhostButton,
  SSS_COLORS
} from './components/SssLayout';

const OverdueTasksPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, urgent: 0, overdue: 0, carried: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const res = await SssApi.getOverdueTasks(globalState.key);
      if (res?.status === 200) {
        const payload = res.data?.data ?? res.data ?? [];
        const data = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.tasks)
            ? payload.tasks
            : Array.isArray(payload.data)
              ? payload.data
              : [];
        setTasks(data);
        setStats({
          total: data.length,
          urgent: data.filter((t) => t.urgency === 'critical' || t.urgency === 'high').length,
          overdue: data.filter((t) => t.date && new Date(t.date) < new Date()).length,
          carried: data.filter((t) => (t.carryCount || 0) > 0).length
        });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les retards');
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let result = Array.isArray(tasks) ? [...tasks] : [];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((task) => {
        const user = task.idUser || {};
        const name = `${user.prenom || ''} ${user.nom || ''} ${user.name || ''}`.toLowerCase();
        return (
          name.includes(term) ||
          String(user.phone || '').includes(term) ||
          String(task.actionType || '').toLowerCase().includes(term) ||
          String(task.stageSnapshot || '').toLowerCase().includes(term)
        );
      });
    }
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => (urgencyOrder[a.urgency] ?? 4) - (urgencyOrder[b.urgency] ?? 4));
    return result;
  }, [tasks, searchTerm]);

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

  const handleExport = () => {
    const headers = ['Personne', 'Téléphone', 'Action', 'Étape', 'Urgence', 'Statut', 'Date prévue', 'Reports'];
    const data = filtered.map((task) => [
      task.idUser?.name || 'N/A',
      task.idUser?.phone || 'N/A',
      task.actionType || 'N/A',
      task.stageSnapshot || 'N/A',
      task.urgency || 'N/A',
      task.status || 'N/A',
      task.date || 'N/A',
      task.carryCount || 0
    ]);

    const csv = [headers, ...data].map((row) => row.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taches_retard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
  };

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
              onClick={() => {
                setSelected(task);
                setDialogOpen(true);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell sx={tableBodyCellSx}>
                <RankBadge rank={idx + 1} urgency={task.urgency} />
              </TableCell>
              <TableCell sx={tableBodyCellSx}>
                <div className="flex items-center gap-2.5">
                  <PersonAvatar user={task.idUser} size={32} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-sss-text">{displayName(task.idUser)}</div>
                    {task.date && (
                      <div className="text-xs text-sss-error">Prévu le {task.date}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell sx={tableBodyCellSx}>
                <ActionLabel action={task.actionType} />
              </TableCell>
              <TableCell sx={tableBodyCellSx}>
                <UrgencyChip urgency={task.urgency} size="small" />
              </TableCell>
              <TableCell
                align="right"
                sx={tableBodyCellSx}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSelected(task);
                    setDialogOpen(true);
                  }}
                  sx={viewButtonSx}
                >
                  Traiter
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 6, border: 0 }}>
                <EmptyState
                  icon={<HistoryIcon />}
                  title="Aucune tâche en retard"
                  subtitle="Toutes vos actions sont à jour !"
                  action={
                    <Button variant="outlined" onClick={load} startIcon={<RefreshIcon />}>
                      Actualiser
                    </Button>
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
        <TaskCard
          key={task._id}
          task={task}
          rank={idx + 1}
          showDate
          onOpen={(t) => {
            setSelected(t);
            setDialogOpen(true);
          }}
          animated
        />
      ))}

      {filtered.length === 0 && !loading && (
        <EmptyState
          icon={<HistoryIcon />}
          title="Aucune tâche en retard"
          subtitle="Toutes vos actions sont à jour. Continuez votre bon travail !"
          action={
            <Button variant="outlined" onClick={load} startIcon={<RefreshIcon />}>
              Actualiser
            </Button>
          }
        />
      )}
    </>
  );

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: SSS_COLORS.pageBg }}>
      <div className="sss-page">
        <PageToolbar
          icon={<HistoryIcon />}
          title="Actions en retard"
          subtitle="Ces actions n'ont pas été terminées les jours précédents. Traitez-les maintenant ou reportez-les au prochain jour ouvré."
          color={SSS_COLORS.error}
          actions={
            <>
              <GhostButton startIcon={<DownloadIcon />} onClick={handleExport} disabled={filtered.length === 0}>
                Exporter
              </GhostButton>
              <PrimaryButton startIcon={<PeopleIcon />} onClick={() => navigate('/wekavit/sss/people')}>
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
            <div className="h-1.5 overflow-hidden rounded-full bg-sss-error-soft">
              <div className="h-full w-1/3 animate-sss-shimmer rounded-full bg-sss-error" />
            </div>
            <p className="sss-muted mt-2 text-xs">Chargement des tâches en retard...</p>
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total des retards" value={stats.total} hint="À traiter" icon={<HistoryIcon />} color={SSS_COLORS.error} loading={loading} variant="dark" />
          <KpiCard title="Urgents" value={stats.urgent} hint="Critique ou élevée" icon={<WarningIcon />} color={SSS_COLORS.error} loading={loading} variant="dark" />
          <KpiCard title="En retard" value={stats.overdue} hint="Échéance dépassée" icon={<AccessTimeIcon />} color={SSS_COLORS.warning} loading={loading} variant="dark" />
          <KpiCard title="Reportés" value={stats.carried} hint="Déjà reportés" icon={<CarryIcon />} color={SSS_COLORS.brand} loading={loading} variant="dark" />
        </div>

        <InfoBanner icon={<InfoIcon />} color={SSS_COLORS.error}>
          Astuce : commencez par les lignes <strong>« Urgent »</strong> puis reportez celles qui ne peuvent pas être
          traitées aujourd&apos;hui.
        </InfoBanner>

        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Nom, téléphone ou action..."
          onRefresh={load}
          refreshing={loading}
        />

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

export default OverdueTasksPage;
