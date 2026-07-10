import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import {
  ACTION_LABELS,
  ACTION_OPTIONS,
  STAGE_OPTIONS,
  STAGE_LABELS,
  displayName,
  formatDateFr,
  formatMoney,
  OUTCOME_LABELS
} from './labels';
import { AlertChips, EmptyState, PersonAvatar, StageChip, StatusChip, UrgencyChip } from './components/Chips';
import HealthMeter from './components/HealthMeter';
import PhoneAction from './components/PhoneAction';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return <Box sx={{ pt: 2 }}>{children}</Box>;
}

const PersonFichePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { globalState } = useContext(AppContext);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fiche, setFiche] = useState(null);
  const [tab, setTab] = useState(0);

  const [stageDraft, setStageDraft] = useState('');
  const [stageReason, setStageReason] = useState('');
  const [nbaDraft, setNbaDraft] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [snoozeDays, setSnoozeDays] = useState('7');

  const load = useCallback(async () => {
    if (!globalState?.key || !id) return;
    setLoading(true);
    try {
      const res = await SssApi.getUserFiche(id, globalState.key);
      if (res?.status === 200) {
        const data = res.data?.data;
        setFiche(data);
        setStageDraft(data?.situation?.stage || '');
        setNbaDraft(data?.nextBestAction?.override || data?.nextBestAction?.nba || '');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Fiche introuvable');
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, id]);

  useEffect(() => {
    load();
  }, [load]);

  const identity = fiche?.identity || {};
  const situation = fiche?.situation || {};
  const savings = fiche?.savings || {};
  const deposits = fiche?.deposits || {};
  const balance = fiche?.balance || {};
  const engagement = fiche?.engagement || {};
  const nba = fiche?.nextBestAction || {};

  const handleSaveStage = async () => {
    setSaving(true);
    try {
      const res = await SssApi.overrideStage(id, { stage: stageDraft, reason: stageReason || undefined }, globalState.key);
      if (res?.status === 200) {
        toast.success('Étape mise à jour');
        setStageReason('');
        await load();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNba = async () => {
    setSaving(true);
    try {
      const res = await SssApi.setNba(id, { nba: nbaDraft || null }, globalState.key);
      if (res?.status === 200) {
        toast.success('Action conseillée mise à jour');
        await load();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteBody.trim()) {
      toast.error('Écrivez une note');
      return;
    }
    setSaving(true);
    try {
      const res = await SssApi.addNote(id, { body: noteBody.trim() }, globalState.key);
      if (res?.status === 201 || res?.status === 200) {
        toast.success('Note enregistrée');
        setNoteBody('');
        await load();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const handleSnooze = async () => {
    setSaving(true);
    try {
      const res = await SssApi.snoozeUser(id, { days: Number(snoozeDays) || 7 }, globalState.key);
      if (res?.status === 200) {
        toast.success(`Pause de contact pendant ${snoozeDays} jour(s)`);
        await load();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const handleRecompute = async () => {
    setSaving(true);
    try {
      const res = await SssApi.recomputeUser(id, globalState.key);
      if (res?.status === 200) {
        toast.success('Situation recalculée');
        await load();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
    } finally {
      setSaving(false);
    }
  };

  const copyTemplate = async () => {
    if (!nba.template) return;
    try {
      await navigator.clipboard.writeText(nba.template);
      toast.success('Message copié');
    } catch {
      toast.error('Copie impossible');
    }
  };

  if (loading) {
    return (
      <MainCard title="Fiche personne">
        <LinearProgress />
      </MainCard>
    );
  }

  if (!fiche) {
    return (
      <MainCard title="Fiche personne">
        <EmptyState
          title="Personne introuvable"
          action={
            <Button startIcon={<BackIcon />} onClick={() => navigate('/wekavit/sss/people')}>
              Retour
            </Button>
          }
        />
      </MainCard>
    );
  }

  return (
    <MainCard
      title={
        <Typography variant="h3" noWrap sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
          {displayName(identity)}
        </Typography>
      }
      secondary={
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
          {isXs ? (
            <Tooltip title="Retour">
              <IconButton size="small" onClick={() => navigate('/wekavit/sss/people')}>
                <BackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button startIcon={<BackIcon />} onClick={() => navigate('/wekavit/sss/people')} size="small">
              Retour
            </Button>
          )}
          {isXs ? (
            <Tooltip title="Recalculer">
              <IconButton size="small" onClick={handleRecompute} disabled={saving}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button startIcon={<RefreshIcon />} onClick={handleRecompute} disabled={saving} size="small">
              Recalculer
            </Button>
          )}
        </Stack>
      }
      sx={{ '& .MuiCardHeader-content': { minWidth: 0, overflow: 'hidden' } }}
      contentSX={{ p: { xs: 1.5, sm: 3 } }}
    >
      {/* Header summary — sensitive fields (phone) stay masked unless revealed */}
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 }, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PersonAvatar user={identity} size={44} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h3" sx={{ wordBreak: 'break-word' }}>
                  {displayName(identity)}
                </Typography>
                {identity.profession && (
                  <Typography variant="body2" color="text.secondary">
                    {identity.profession}
                  </Typography>
                )}
              </Box>
            </Stack>
            <Box mt={1}>
              <PhoneAction phone={identity.phone} />
            </Box>
            <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap alignItems="center">
              <StageChip stage={situation.stage} />
              <UrgencyChip urgency={situation.urgency} />
              <HealthMeter level={situation.healthLevel} score={situation.healthScore} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={7}>
            <Alert
              severity="info"
              action={
                <Button size="small" startIcon={<CopyIcon />} onClick={copyTemplate}>
                  Copier
                </Button>
              }
              sx={{ '& .MuiAlert-action': { alignItems: 'center', pt: 0 } }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Prochaine action conseillée : {ACTION_LABELS[nba.nba] || nba.nba || '—'}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {nba.template || 'Aucun message suggéré'}
              </Typography>
            </Alert>
          </Grid>
        </Grid>
        <Box mt={2}>
          <AlertChips alerts={situation.alerts || []} max={8} />
        </Box>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Situation" />
        <Tab label="Épargne & dépôts" />
        <Tab label="Actions & notes" />
        <Tab label="Historique" />
        <Tab label="Modifier le suivi" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Où en est-elle ?
              </Typography>
              <Stack spacing={1}>
                <Row label="Étape actuelle" value={STAGE_LABELS[situation.stage] || situation.stage} />
                <Row label="Étape calculée auto" value={STAGE_LABELS[situation.stageSuggested] || situation.stageSuggested} />
                <Row label="Depuis" value={formatDateFr(situation.stageEnteredAt)} />
                <Row label="Inscrit(e) le" value={formatDateFr(situation.signupDate)} />
                <Row label="Pause contact jusqu’au" value={formatDateFr(situation.snoozeUntil)} />
                <Row label="Dernier calcul" value={formatDateFr(situation.lastComputedAt)} />
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Engagement
              </Typography>
              <Stack spacing={1}>
                <Row label="Dernière activité" value={formatDateFr(engagement.lastActivityAt)} />
                <Row
                  label="Jours sans activité"
                  value={engagement.daysSinceLastActivity != null ? `${engagement.daysSinceLastActivity} j` : '—'}
                />
                <Row label="Dernier contact" value={formatDateFr(engagement.lastContactedAt)} />
                <Row label="Dernière action faite" value={ACTION_LABELS[engagement.lastContactAction] || '—'} />
                <Row label="Parrainages" value={`${engagement.activeReferralCount || 0} actifs / ${engagement.referralCount || 0}`} />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Dépôts
              </Typography>
              <Stack spacing={1}>
                <Row label="Nombre validés" value={deposits.validatedDepositCount} />
                <Row label="En attente" value={deposits.pendingDepositCount} />
                <Row label="Premier dépôt" value={formatDateFr(deposits.firstDepositAt)} />
                <Row label="Dernier dépôt" value={formatDateFr(deposits.lastDepositAt)} />
                <Row label="Total déposé (approx.)" value={formatMoney(deposits.totalDepositedUsd)} />
                <Row label="Semaines d’affilée" value={deposits.streakWeeks} />
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Plans d’épargne
              </Typography>
              <Stack spacing={1}>
                <Row label="Plans actifs" value={savings.activePlanCount} />
                <Row label="Plans créés" value={savings.everPlanCount} />
                <Row label="Capital en cours" value={formatMoney(savings.totalSavedCapitalUsd)} />
                <Row label="Total avec intérêts" value={formatMoney(savings.totalSaveSumUsd)} />
                <Row label="Plans terminés" value={savings.plansMaturedCount} />
                <Row label="Retraits anticipés" value={savings.earlyWithdrawCount} />
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Solde disponible
              </Typography>
              <Stack spacing={1}>
                <Row label="Argent non placé" value={formatMoney(balance.idleBalanceUsd)} />
                <Row label="Depuis (jours)" value={balance.idleBalanceDays} />
                <Row label="Retraits wallet" value={engagement.withdrawCount} />
                <Row label="Dernier retrait" value={formatDateFr(engagement.lastWithdrawAt)} />
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Ajouter une note
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Ex. : Attend son salaire vendredi. Relancer samedi matin."
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                sx={{ mb: 1.5 }}
              />
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleAddNote} disabled={saving}>
                Enregistrer la note
              </Button>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Notes précédentes
              </Typography>
              {(fiche.notes || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucune note pour l’instant.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {fiche.notes.map((n) => (
                    <Box key={n._id} sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2">{n.body}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {n.authorName || 'Admin'} · {formatDateFr(n.createdAt)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Dernières actions
              </Typography>
              {(fiche.tasks || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucune action planifiée.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {fiche.tasks.slice(0, 12).map((t) => (
                    <Box key={t._id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {ACTION_LABELS[t.actionType] || t.actionType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t.date} · {OUTCOME_LABELS[t.outcome] || '—'}
                        </Typography>
                      </Box>
                      <StatusChip status={t.status} />
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Historique d’accompagnement
          </Typography>
          {(fiche.timeline || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun événement encore.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {fiche.timeline.map((ev) => (
                <Box key={ev._id} sx={{ display: 'flex', gap: 2 }}>
                  <Chip size="small" label={ev.source === 'admin' ? 'Vous' : 'Système'} />
                  <Box>
                    <Typography variant="body2">{ev.message || ev.type}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateFr(ev.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Changer l’étape
              </Typography>
              <TextField select fullWidth label="Nouvelle étape" value={stageDraft} onChange={(e) => setStageDraft(e.target.value)} sx={{ mb: 1.5 }}>
                {STAGE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Pourquoi ? (recommandé)"
                value={stageReason}
                onChange={(e) => setStageReason(e.target.value)}
                sx={{ mb: 1.5 }}
              />
              <Button variant="contained" onClick={handleSaveStage} disabled={saving || !stageDraft}>
                Enregistrer l’étape
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Forcer l’action conseillée
              </Typography>
              <TextField select fullWidth label="Action" value={nbaDraft} onChange={(e) => setNbaDraft(e.target.value)} sx={{ mb: 1.5 }}>
                <MenuItem value="">Automatique (laisser le système décider)</MenuItem>
                {ACTION_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={handleSaveNba} disabled={saving}>
                Enregistrer l’action
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Pause de contact
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Utile si la personne a dit « rappelez-moi plus tard ».
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Nombre de jours"
                value={snoozeDays}
                onChange={(e) => setSnoozeDays(e.target.value)}
                sx={{ mb: 1.5 }}
                inputProps={{ min: 1, max: 90 }}
              />
              <Button variant="outlined" onClick={handleSnooze} disabled={saving}>
                Mettre en pause
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </MainCard>
  );
};

const Row = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} textAlign="right">
      {value ?? '—'}
    </Typography>
  </Box>
);

export default PersonFichePage;
