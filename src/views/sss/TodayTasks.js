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
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  EventRepeat as CarryIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  FactCheck as FactCheckIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { displayName, maskPhone, telHref, whatsappHref, ACTION_LABELS } from './labels';
import { ActionLabel, AlertChips, EmptyState, PersonCell, RankBadge, StageChip, StatusChip, UrgencyChip } from './components/Chips';
import PageHeader from './components/PageHeader';
import TaskCard from './components/TaskCard';
import TaskActionDialog from './components/TaskActionDialog';

const TodayTasksPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
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
    } finally {
      setLoading(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
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
  }, [tasks, filterStatus, filterUrgency, search]);

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
        toast.success('Action enregistrée');
        setDialogOpen(false);
        await load();
      } else {
        toast.error(res?.data?.message || 'Échec');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Échec');
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
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de reporter');
    }
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Message copié');
    } catch {
      toast.error('Copie impossible');
    }
  };

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
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading} size="small">
          Actualiser
        </Button>
      }
      sx={{ '& .MuiCardHeader-content': { minWidth: 0 } }}
      contentSX={{ p: { xs: 1.5, sm: 3 } }}
    >
      {summary && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, mb: 2 }}>
          <Chip label={`${summary.total} au total`} />
          <Chip color="warning" label={`${summary.open} restantes`} />
          <Chip color="success" label={`${summary.done} terminées`} />
          <Chip
            color="error"
            variant="outlined"
            label={`${summary.overdueFromPastDays} en retard (autres jours)`}
            onClick={() => navigate('/wekavit/sss/overdue')}
          />
          <Chip label={`${summary.completionRate}% fait`} variant="outlined" />
        </Stack>
      )}

      {!board && !loading && (
        <Alert severity="info" sx={{ mb: 2 }} action={<Button onClick={() => navigate('/wekavit/sss')}>Préparer</Button>}>
          Aucune liste générée pour aujourd’hui. Retournez à la vue du jour et cliquez sur « Préparer la journée ».
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher une personne…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
        <TextField
          select
          size="small"
          label="État"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          fullWidth
          sx={{ minWidth: { sm: 160 } }}
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
          fullWidth
          sx={{ minWidth: { sm: 140 } }}
        >
          <MenuItem value="">Toutes</MenuItem>
          <MenuItem value="critical">Urgent</MenuItem>
          <MenuItem value="high">Prioritaire</MenuItem>
          <MenuItem value="medium">À suivre</MenuItem>
          <MenuItem value="low">Tranquille</MenuItem>
        </TextField>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!loading && filtered.length === 0 ? (
        <EmptyState
          title="Rien à faire ici"
          subtitle="Soit la journée est terminée, soit aucun filtre ne correspond. Bravo si tout est fait !"
        />
      ) : (
        <>
          {/* Phones & narrow tablets: one big tappable card per person */}
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {filtered.map((task, idx) => (
              <TaskCard
                key={task._id}
                task={task}
                rank={idx + 1}
                onOpen={openTask}
                onCarry={handleCarry}
                onCopy={copyMessage}
                onView={(t) => navigate(`/wekavit/sss/people/${t.idUser?._id || t.idUser}`)}
              />
            ))}
          </Stack>

          {/* Tablets landscape & desktop: compact table */}
          <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={44}>#</TableCell>
                  <TableCell>Personne</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Étape</TableCell>
                  <TableCell>Urgence</TableCell>
                  <TableCell>État</TableCell>
                  <TableCell>Alertes</TableCell>
                  <TableCell align="right">Faire</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((task, idx) => {
                  const phone = task.idUser?.phone;
                  return (
                    <TableRow key={task._id} hover sx={{ bgcolor: task.status === 'carried_over' ? 'warning.lighter' : undefined }}>
                      <TableCell>
                        <RankBadge rank={idx + 1} urgency={task.urgency} />
                      </TableCell>
                      <TableCell>
                        <PersonCell user={task.idUser} phone={maskPhone(phone)} />
                      </TableCell>
                      <TableCell>
                        <ActionLabel action={task.actionType} />
                        {task.carryCount > 0 && (
                          <Typography variant="caption" color="warning.main" display="block">
                            Reporté {task.carryCount}×
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <StageChip stage={task.stageSnapshot} />
                      </TableCell>
                      <TableCell>
                        <UrgencyChip urgency={task.urgency} />
                      </TableCell>
                      <TableCell>
                        <StatusChip status={task.status} />
                      </TableCell>
                      <TableCell>
                        <AlertChips alerts={task.alertsSnapshot} max={2} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {phone && (
                            <>
                              <Tooltip title="Appeler">
                                <IconButton size="small" color="primary" onClick={() => { window.location.href = telHref(phone); }}>
                                  <CallIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="WhatsApp">
                                <IconButton size="small" color="success" onClick={() => window.open(whatsappHref(phone), '_blank', 'noopener')}>
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {task.templateSnapshot && (
                            <Tooltip title="Copier le message">
                              <IconButton size="small" onClick={() => copyMessage(task.templateSnapshot)}>
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Voir la fiche">
                            <IconButton size="small" onClick={() => navigate(`/wekavit/sss/people/${task.idUser?._id || task.idUser}`)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reporter">
                            <IconButton size="small" onClick={() => handleCarry(task)}>
                              <CarryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button size="small" variant="contained" startIcon={<StartIcon />} onClick={() => openTask(task)}>
                            Traiter
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Astuce : traitez d’abord les lignes « Urgent », puis « Prioritaire ». Les reportées apparaissent en jaune.
        </Typography>
      </Box>

      <TaskActionDialog open={dialogOpen} task={selected} onClose={() => setDialogOpen(false)} onSave={handleSave} saving={saving} />
    </MainCard>
  );
};

export default TodayTasksPage;
