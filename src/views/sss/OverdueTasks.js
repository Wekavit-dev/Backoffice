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
import { maskPhone, telHref, whatsappHref } from './labels';
import {
  ActionLabel,
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
        const data = res.data?.data || [];
        setTasks(data);
        setStats({
          total: data.length,
          urgent: data.filter((t) => t.urgency === 'critical' || t.urgency === 'high').length,
          overdue: data.filter((t) => new Date(t.date) < new Date()).length,
          carried: data.filter((t) => t.carryCount > 0).length
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
    let result = [...tasks];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (task) =>
          task.idUser?.name?.toLowerCase().includes(term) ||
          task.idUser?.phone?.includes(term) ||
          task.actionType?.toLowerCase().includes(term) ||
          task.stageSnapshot?.toLowerCase().includes(term)
      );
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
            <TableCell width={44} sx={tableHeadCellSx}>#</TableCell>
            <TableCell sx={tableHeadCellSx}>Jour prévu</TableCell>
            <TableCell sx={tableHeadCellSx}>Personne</TableCell>
            <TableCell sx={tableHeadCellSx}>Action</TableCell>
            <TableCell sx={tableHeadCellSx}>Étape</TableCell>
            <TableCell sx={tableHeadCellSx}>Urgence</TableCell>
            <TableCell sx={tableHeadCellSx}>État</TableCell>
            <TableCell align="center" sx={tableHeadCellSx}>Reports</TableCell>
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
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={new Date(task.date) < new Date() ? 600 : 400}>
                      {task.date}
                    </Typography>
                    {task.originDate && task.originDate !== task.date && (
                      <Typography variant="caption" color="text.secondary">
                        depuis {task.originDate}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <PersonCell user={task.idUser} phone={maskPhone(phone)} />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <ActionLabel action={task.actionType} />
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
                <TableCell align="center" sx={tableBodyCellSx}>
                  <Badge badgeContent={task.carryCount || 0} color="warning">
                    <CarryIcon fontSize="small" color="action" />
                  </Badge>
                </TableCell>
                <TableCell align="right" sx={tableBodyCellSx}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewIcon fontSize="small" />}
                    onClick={() => { setSelected(task); setDialogOpen(true); }}
                    sx={viewButtonSx}
                  >
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {filtered.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6, border: 0 }}>
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
    <Stack spacing={2}>
      {filtered.map((task, idx) => (
        <TaskCard
          key={task._id}
          task={task}
          rank={idx + 1}
          showDate
          onOpen={(t) => { setSelected(t); setDialogOpen(true); }}
          onCarry={handleCarry}
          onView={(t) => navigate(`/wekavit/sss/people/${t.idUser?._id || t.idUser}`)}
          variant="default"
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
    </Stack>
  );

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: 'background.paper' }}>
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
                sx={{ border: `1px solid ${SSS_COLORS.cardBorder}`, borderRadius: 2, bgcolor: 'background.paper' }}
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
            Chargement des tâches en retard...
          </Typography>
        </Box>
      )}

      <Grid container spacing={{ xs: 1.25, sm: 2 }} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Total des retards" value={stats.total} hint="À traiter" icon={<HistoryIcon />} color={SSS_COLORS.error} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Urgents" value={stats.urgent} hint="Critique ou élevée" icon={<WarningIcon />} color={SSS_COLORS.error} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="En retard" value={stats.overdue} hint="Échéance dépassée" icon={<AccessTimeIcon />} color={SSS_COLORS.warning} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Reportés" value={stats.carried} hint="Déjà reportés" icon={<CarryIcon />} color={SSS_COLORS.brand} loading={loading} />
        </Grid>
      </Grid>

      <InfoBanner icon={<InfoIcon />} color={SSS_COLORS.error}>
        Astuce : commencez par les lignes <strong>« Urgent »</strong> puis reportez celles qui ne peuvent pas être traitées aujourd'hui.
      </InfoBanner>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Nom, téléphone ou action..."
        onRefresh={load}
        refreshing={loading}
      />

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

export default OverdueTasksPage;
