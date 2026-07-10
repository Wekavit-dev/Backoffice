import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as StartIcon,
  EventRepeat as CarryIcon,
  Visibility as ViewIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  HistoryToggleOff as HistoryIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { maskPhone, telHref, whatsappHref, formatDateFr } from './labels';
import { ActionLabel, EmptyState, PersonCell, RankBadge, StageChip, StatusChip, UrgencyChip } from './components/Chips';
import PageHeader from './components/PageHeader';
import TaskCard from './components/TaskCard';
import TaskActionDialog from './components/TaskActionDialog';

const OverdueTasksPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const res = await SssApi.getOverdueTasks(globalState.key);
      if (res?.status === 200) setTasks(res.data?.data || []);
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les retards');
    } finally {
      setLoading(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (payload) => {
    if (!selected || !globalState?.key) return;
    setSaving(true);
    try {
      const res = await SssApi.updateTask(selected._id, payload, globalState.key);
      if (res?.status === 200) {
        toast.success('Action mise à jour');
        setDialogOpen(false);
        await load();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const handleCarry = async (task) => {
    try {
      const res = await SssApi.carryTask(task._id, {}, globalState.key);
      if (res?.status === 200) {
        toast.success('Ajouté à aujourd’hui / prochain jour ouvré');
        await load();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de reporter');
    }
  };

  return (
    <MainCard
      title={
        <PageHeader
          icon={<HistoryIcon />}
          eyebrow="Accompagnement"
          title="Actions en retard"
          subtitle="Ces actions n’ont pas été terminées les jours précédents. Traitez-les maintenant ou reportez-les au prochain jour ouvré."
          color="error"
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
      {loading && <LinearProgress sx={{ mt: 2, mb: 2 }} />}

      {!loading && tasks.length === 0 ? (
        <Box mt={2}>
          <EmptyState title="Aucun retard" subtitle="Bravo — tout est à jour." />
        </Box>
      ) : (
        <>
          {/* Phones & narrow tablets: one big tappable card per person */}
          <Stack spacing={1.5} sx={{ mt: 2, display: { xs: 'flex', md: 'none' } }}>
            {tasks.map((task, idx) => (
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
              />
            ))}
          </Stack>

          {/* Tablets landscape & desktop: compact table */}
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={44}>#</TableCell>
                  <TableCell>Jour prévu</TableCell>
                  <TableCell>Personne</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Étape</TableCell>
                  <TableCell>Urgence</TableCell>
                  <TableCell>État</TableCell>
                  <TableCell>Reports</TableCell>
                  <TableCell align="right">Faire</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task, idx) => {
                  const phone = task.idUser?.phone;
                  return (
                    <TableRow key={task._id} hover>
                      <TableCell>
                        <RankBadge rank={idx + 1} urgency={task.urgency} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{task.date}</Typography>
                        {task.originDate && task.originDate !== task.date && (
                          <Typography variant="caption" color="text.secondary">
                            depuis {task.originDate}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <PersonCell user={task.idUser} phone={maskPhone(phone)} />
                      </TableCell>
                      <TableCell>
                        <ActionLabel action={task.actionType} />
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
                      <TableCell>{task.carryCount || 0}</TableCell>
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
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<StartIcon />}
                            onClick={() => {
                              setSelected(task);
                              setDialogOpen(true);
                            }}
                          >
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

      <Typography variant="caption" color="text.secondary" display="block" mt={2}>
        Dernière actualisation : {formatDateFr(new Date())}
      </Typography>

      <TaskActionDialog open={dialogOpen} task={selected} onClose={() => setDialogOpen(false)} onSave={handleSave} saving={saving} />
    </MainCard>
  );
};

export default OverdueTasksPage;
