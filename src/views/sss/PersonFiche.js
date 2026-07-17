import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
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
  useMediaQuery,
  alpha,
  useTheme,
  Fade,
  Grow,
  Zoom,
  Card,
  CardContent,
  Badge,
  Avatar,
  Collapse,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as NotificationIcon,
  Timeline as TimelineIcon,
  PeopleAlt as PeopleAltIcon,
  Wallet as WalletIcon,
  Savings as SavingsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Flag as FlagIcon,
  PersonAdd as PersonAddIcon
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
  OUTCOME_LABELS,
  telHref,
  whatsappHref
} from './labels';
import { AlertChips, EmptyState, PersonAvatar, StageChip, StatusChip, UrgencyChip } from './components/Chips';
import HealthMeter from './components/HealthMeter';
import PhoneAction from './components/PhoneAction';
import { SSS_COLORS } from './components/SssLayout';

// Composant Row amélioré
const Row = ({ label, value, color, icon, onClick }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 0.75,
        px: 1,
        borderRadius: 1,
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          bgcolor: alpha(SSS_COLORS.brand, 0.04),
        } : {}
      }}
      onClick={onClick}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon && (
          <Box sx={{ color: color || theme.palette.text.secondary, display: 'flex' }}>
            {icon}
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        fontWeight={600}
        textAlign="right"
        color={color || 'text.primary'}
        sx={{
          fontFamily: typeof value === 'string' && value.includes('F CFA') ? 'monospace' : 'inherit'
        }}
      >
        {value ?? '—'}
      </Typography>
    </Box>
  );
};

// Composant de carte d'information
const InfoCard = ({ title, icon, children, color, action, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1}>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        borderColor: alpha(color || SSS_COLORS.brand, 0.12),
        bgcolor: alpha(color || SSS_COLORS.brand, 0.02),
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(color || SSS_COLORS.brand, 0.25),
          boxShadow: theme.shadows[2]
        }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          {icon && (
            <Box sx={{
              color: color || theme.palette.primary.main,
              display: 'flex',
              '& svg': { fontSize: 20 }
            }}>
              {icon}
            </Box>
          )}
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Stack>
        {action && (
          <Button size="small" startIcon={<EditIcon />} onClick={action}>
            Modifier
          </Button>
        )}
      </Stack>
      <Stack spacing={1}>
        {children}
      </Stack>
    </Paper>
  );
};

// Composant de note
const NoteItem = ({ note, onDelete }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              maxHeight: expanded ? 'none' : 60,
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => setExpanded(!expanded)}
          >
            {note.body}
          </Typography>
          {onDelete && (
            <IconButton size="small" onClick={() => onDelete(note._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {note.authorName || 'Admin'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            •
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateFr(note.createdAt)}
          </Typography>
          {note.body.length > 100 && (
            <Chip
              label={expanded ? 'Voir moins' : 'Voir plus'}
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ height: 20, fontSize: '0.6rem' }}
            />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

// Composant d'action récente
const TaskItem = ({ task }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1,
        px: 1.5,
        borderRadius: 1,
        bgcolor: alpha(theme.palette.background.default, 0.3),
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="body2" fontWeight={600}>
          {ACTION_LABELS[task.actionType] || task.actionType}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {task.date}
          </Typography>
          {task.outcome && (
            <>
              <Typography variant="caption" color="text.secondary">•</Typography>
              <Typography variant="caption" color="text.secondary">
                {OUTCOME_LABELS[task.outcome] || task.outcome}
              </Typography>
            </>
          )}
        </Stack>
      </Stack>
      <StatusChip status={task.status} size="small" />
    </Box>
  );
};

const PersonFichePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { globalState } = useContext(AppContext);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // États principaux
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fiche, setFiche] = useState(null);
  const [tab, setTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // États des formulaires
  const [stageDraft, setStageDraft] = useState('');
  const [stageReason, setStageReason] = useState('');
  const [nbaDraft, setNbaDraft] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [snoozeDays, setSnoozeDays] = useState('7');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editField, setEditField] = useState(null);

  // Chargement des données
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
      setSnackbar({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, id]);

  useEffect(() => {
    load();
  }, [load]);

  // Données dérivées
  const identity = fiche?.identity || {};
  const situation = fiche?.situation || {};
  const savings = fiche?.savings || {};
  const deposits = fiche?.deposits || {};
  const balance = fiche?.balance || {};
  const engagement = fiche?.engagement || {};
  const nba = fiche?.nextBestAction || {};
  const isUrgent = situation.urgency === 'critical' || situation.urgency === 'high';

  // Gestionnaires
  const handleSaveStage = async () => {
    setSaving(true);
    try {
      const res = await SssApi.overrideStage(id, {
        stage: stageDraft,
        reason: stageReason || undefined
      }, globalState.key);
      if (res?.status === 200) {
        toast.success('Étape mise à jour avec succès');
        setStageReason('');
        await load();
        setSnackbar({ open: true, message: 'Étape mise à jour', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec de la mise à jour');
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
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
        setSnackbar({ open: true, message: 'Action mise à jour', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
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
        setSnackbar({ open: true, message: 'Note ajoutée', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' });
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
        setSnackbar({ open: true, message: 'Pause activée', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      setSnackbar({ open: true, message: 'Erreur lors de la pause', severity: 'error' });
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
        setSnackbar({ open: true, message: 'Recalcul effectué', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      setSnackbar({ open: true, message: 'Erreur lors du recalcul', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const copyTemplate = async () => {
    if (!nba.template) return;
    try {
      await navigator.clipboard.writeText(nba.template);
      toast.success('Message copié dans le presse-papier');
      setSnackbar({ open: true, message: 'Message copié', severity: 'success' });
    } catch {
      toast.error('Copie impossible');
    }
  };

  const handleDeleteNote = async (noteId) => {
    // Implémenter la suppression de note
    setSnackbar({ open: true, message: 'Note supprimée', severity: 'success' });
  };

  if (loading) {
    return (
      <MainCard title="Fiche personne">
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Chargement de la fiche...
          </Typography>
        </Box>
      </MainCard>
    );
  }

  if (!fiche) {
    return (
      <MainCard title="Fiche personne">
        <EmptyState
          title="Personne introuvable"
          subtitle="La fiche que vous recherchez n'existe pas ou a été supprimée."
          action={
            <Button startIcon={<BackIcon />} onClick={() => navigate('/wekavit/sss/people')}>
              Retour à la liste
            </Button>
          }
        />
      </MainCard>
    );
  }

  return (
    <MainCard
      title={
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 0.5,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${SSS_COLORS.brand}, ${SSS_COLORS.brandDark})`,
              boxShadow: `0 4px 14px ${alpha(SSS_COLORS.brand, 0.25)}`
            }}
          >
            <Box
              sx={{
                borderRadius: '50%',
                border: `2px solid ${theme.palette.background.paper}`,
                overflow: 'hidden'
              }}
            >
              <PersonAvatar user={identity} size={44} />
            </Box>
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
              {displayName(identity)}
            </Typography>
            {identity.profession && (
              <Typography variant="caption" color="text.secondary">
                {identity.profession}
              </Typography>
            )}
          </Box>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1} alignItems="center">
          {!isXs && (
            <>
              <Button
                startIcon={<BackIcon />}
                onClick={() => navigate('/wekavit/sss/people')}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Retour
              </Button>
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRecompute}
                disabled={saving}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Recalculer
              </Button>
            </>
          )}
          {isXs && (
            <>
              <IconButton size="small" onClick={() => navigate('/wekavit/sss/people')}>
                <BackIcon />
              </IconButton>
              <IconButton size="small" onClick={handleRecompute} disabled={saving}>
                <RefreshIcon />
              </IconButton>
            </>
          )}
        </Stack>
      }
      sx={{
        '& .MuiCardHeader-content': {
          minWidth: 0,
          overflow: 'hidden',
          flex: 1
        }
      }}
      contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: 'background.paper' }}
    >
      {/* En-tête de la fiche */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          mb: 2.5,
          borderRadius: 2,
          borderColor: isUrgent ? alpha(theme.palette.error.main, 0.25) : alpha(SSS_COLORS.brand, 0.12),
          bgcolor: isUrgent ? alpha(theme.palette.error.main, 0.02) : alpha(SSS_COLORS.brand, 0.015),
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.04)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: isUrgent
              ? `linear-gradient(90deg, ${SSS_COLORS.error}, ${SSS_COLORS.warning})`
              : `linear-gradient(90deg, ${SSS_COLORS.brand}, ${SSS_COLORS.brandDark})`,
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <Box>
                <PhoneAction phone={identity.phone} size="medium" showQuality />
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                <StageChip stage={situation.stage} />
                <UrgencyChip urgency={situation.urgency} />
                <HealthMeter level={situation.healthLevel} score={situation.healthScore} />
                {situation.snoozeUntil && (
                  <Chip
                    icon={<ScheduleIcon />}
                    label={`Pause jusqu'au ${formatDateFr(situation.snoozeUntil)}`}
                    size="small"
                    color="warning"
                  />
                )}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Alert
              severity={isUrgent ? 'error' : 'info'}
              icon={isUrgent ? <ErrorIcon /> : <InfoIcon />}
              action={
                <Stack direction="row" spacing={1}>
                  {nba.template && (
                    <Button
                      size="small"
                      startIcon={<CopyIcon />}
                      onClick={copyTemplate}
                      sx={{
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                        '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.3) }
                      }}
                    >
                      Copier
                    </Button>
                  )}
                </Stack>
              }
              sx={{
                borderRadius: 2,
                '& .MuiAlert-action': { alignItems: 'center', pt: 0 }
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {isUrgent && '⚠️ '}Prochaine action conseillée : {ACTION_LABELS[nba.nba] || nba.nba || '—'}
              </Typography>
              {nba.template && (
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    opacity: 0.9,
                    fontStyle: 'italic'
                  }}
                >
                  "{nba.template}"
                </Typography>
              )}
            </Alert>
          </Grid>
        </Grid>

        {situation.alerts?.length > 0 && (
          <Box mt={2}>
            <AlertChips alerts={situation.alerts} max={5} />
          </Box>
        )}
      </Paper>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            minHeight: 48,
            '&.Mui-selected': {
              color: SSS_COLORS.brandDark,
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: SSS_COLORS.brand,
            height: 3,
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Tab label="Situation" icon={<PeopleAltIcon />} iconPosition="start" />
        <Tab label="Épargne & dépôts" icon={<WalletIcon />} iconPosition="start" />
        <Tab label="Actions & notes" icon={<HistoryIcon />} iconPosition="start" />
        <Tab label="Historique" icon={<TimelineIcon />} iconPosition="start" />
        <Tab label="Modifier" icon={<SettingsIcon />} iconPosition="start" />
      </Tabs>

      {/* Onglet 0: Situation */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Parcours"
              icon={<TimelineIcon />}
              color={theme.palette.primary.main}
              action={() => setTab(4)}
            >
              <Row
                label="Étape actuelle"
                value={STAGE_LABELS[situation.stage] || situation.stage}
                color={theme.palette.primary.main}
                icon={<FlagIcon />}
              />
              <Row
                label="Étape calculée"
                value={STAGE_LABELS[situation.stageSuggested] || situation.stageSuggested}
                icon={<InfoIcon />}
              />
              <Row
                label="Depuis le"
                value={formatDateFr(situation.stageEnteredAt)}
                icon={<AccessTimeIcon />}
              />
              <Row
                label="Inscrit(e) le"
                value={formatDateFr(situation.signupDate)}
                icon={<PersonAddIcon />}
              />
              <Row
                label="Dernier calcul"
                value={formatDateFr(situation.lastComputedAt)}
                icon={<RefreshIcon />}
              />
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard
              title="Engagement"
              icon={<PeopleAltIcon />}
              color={theme.palette.secondary.main}
            >
              <Row
                label="Dernière activité"
                value={formatDateFr(engagement.lastActivityAt)}
                icon={<AccessTimeIcon />}
              />
              <Row
                label="Jours sans activité"
                value={engagement.daysSinceLastActivity != null ? `${engagement.daysSinceLastActivity} j` : '—'}
                color={engagement.daysSinceLastActivity > 7 ? theme.palette.warning.main : undefined}
                icon={<ScheduleIcon />}
              />
              <Row
                label="Dernier contact"
                value={formatDateFr(engagement.lastContactedAt)}
                icon={<PhoneIcon />}
              />
              <Row
                label="Dernière action"
                value={ACTION_LABELS[engagement.lastContactAction] || '—'}
                icon={<CheckCircleIcon />}
              />
              <Row
                label="Parrainages"
                value={`${engagement.activeReferralCount || 0} actifs / ${engagement.referralCount || 0}`}
                icon={<PeopleAltIcon />}
              />
            </InfoCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Onglet 1: Épargne & dépôts */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Dépôts"
              icon={<WalletIcon />}
              color={theme.palette.success.main}
            >
              <Row
                label="Validés"
                value={deposits.validatedDepositCount || 0}
                icon={<CheckCircleIcon />}
              />
              <Row
                label="En attente"
                value={deposits.pendingDepositCount || 0}
                color={deposits.pendingDepositCount > 0 ? theme.palette.warning.main : undefined}
                icon={<ScheduleIcon />}
              />
              <Row
                label="Premier dépôt"
                value={formatDateFr(deposits.firstDepositAt)}
                icon={<AccessTimeIcon />}
              />
              <Row
                label="Dernier dépôt"
                value={formatDateFr(deposits.lastDepositAt)}
                icon={<AccessTimeIcon />}
              />
              <Row
                label="Total déposé"
                value={formatMoney(deposits.totalDepositedUsd)}
                color={theme.palette.success.main}
                icon={<TrendingUpIcon />}
              />
              <Row
                label="Semaines d'affilée"
                value={deposits.streakWeeks || 0}
                icon={<TrendingUpIcon />}
              />
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard
              title="Plans d'épargne"
              icon={<SavingsIcon />}
              color={theme.palette.info.main}
            >
              <Row
                label="Plans actifs"
                value={savings.activePlanCount || 0}
                icon={<CheckCircleIcon />}
              />
              <Row
                label="Plans créés"
                value={savings.everPlanCount || 0}
                icon={<AddIcon />}
              />
              <Row
                label="Capital en cours"
                value={formatMoney(savings.totalSavedCapitalUsd)}
                icon={<SavingsIcon />}
              />
              <Row
                label="Total avec intérêts"
                value={formatMoney(savings.totalSaveSumUsd)}
                color={theme.palette.success.main}
                icon={<TrendingUpIcon />}
              />
              <Row
                label="Plans terminés"
                value={savings.plansMaturedCount || 0}
                icon={<CheckCircleIcon />}
              />
              <Row
                label="Retraits anticipés"
                value={savings.earlyWithdrawCount || 0}
                color={savings.earlyWithdrawCount > 0 ? theme.palette.warning.main : undefined}
                icon={<WarningIcon />}
              />
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard
              title="Solde disponible"
              icon={<WalletIcon />}
              color={theme.palette.primary.main}
            >
              <Row
                label="Argent non placé"
                value={formatMoney(balance.idleBalanceUsd)}
                icon={<WalletIcon />}
              />
              <Row
                label="Depuis (jours)"
                value={balance.idleBalanceDays || 0}
                icon={<AccessTimeIcon />}
              />
              <Row
                label="Retraits wallet"
                value={engagement.withdrawCount || 0}
                icon={<TrendingDownIcon />}
              />
              <Row
                label="Dernier retrait"
                value={formatDateFr(engagement.lastWithdrawAt)}
                icon={<AccessTimeIcon />}
              />
            </InfoCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Onglet 2: Actions & notes */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoCard
              title="Ajouter une note"
              icon={<AddIcon />}
              color={theme.palette.primary.main}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Ex. : Attend son salaire vendredi. Relancer samedi matin."
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                sx={{ mb: 1.5 }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleAddNote}
                disabled={saving || !noteBody.trim()}
                sx={{ borderRadius: 2, bgcolor: SSS_COLORS.brand, boxShadow: 'none', '&:hover': { bgcolor: SSS_COLORS.brandDark } }}
              >
                {saving ? <CircularProgress size={20} /> : 'Enregistrer la note'}
              </Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Notes précédentes
              </Typography>
              <Stack spacing={1.5}>
                {(fiche.notes || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    Aucune note pour l’instant.
                  </Typography>
                ) : (
                  (fiche.notes || []).map((note) => (
                    <NoteItem
                      key={note._id}
                      note={note}
                      onDelete={handleDeleteNote}
                    />
                  ))
                )}
              </Stack>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard
              title="Dernières actions"
              icon={<HistoryIcon />}
              color={theme.palette.secondary.main}
            >
              {(fiche.tasks || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  Aucune action planifiée.
                </Typography>
              ) : (
                  <Stack spacing={1.5}>
                    {(fiche.tasks || []).slice(0, 12).map((task) => (
                      <TaskItem key={task._id} task={task} />
                  ))}
                </Stack>
              )}
            </InfoCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Onglet 3: Historique */}
      <TabPanel value={tab} index={3}>
        <InfoCard
          title="Historique d'accompagnement"
          icon={<TimelineIcon />}
          color={theme.palette.info.main}
        >
          {(fiche.timeline || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun événement encore.
            </Typography>
          ) : (
              <Stack spacing={1.5}>
                {(fiche.timeline || []).map((ev) => (
                  <Paper
                    key={ev._id}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.3),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start'
                    }}
                  >
                    <Chip
                      size="small"
                      label={ev.source === 'admin' ? 'Vous' : 'Système'}
                      color={ev.source === 'admin' ? 'primary' : 'default'}
                      sx={{ flexShrink: 0 }}
                    />
                    <Box flex={1}>
                    <Typography variant="body2">{ev.message || ev.type}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateFr(ev.createdAt)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </InfoCard>
      </TabPanel>

      {/* Onglet 4: Modifier */}
      <TabPanel value={tab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <InfoCard
              title="Changer l'étape"
              icon={<FlagIcon />}
              color={theme.palette.primary.main}
            >
              <TextField
                select
                fullWidth
                label="Nouvelle étape"
                value={stageDraft}
                onChange={(e) => setStageDraft(e.target.value)}
                sx={{ mb: 1.5 }}
                SelectProps={{ sx: { borderRadius: 2 } }}
              >
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
                InputProps={{ sx: { borderRadius: 2 } }}
              />
              <Button
                variant="contained"
                onClick={handleSaveStage}
                disabled={saving || !stageDraft}
                sx={{ borderRadius: 2, bgcolor: SSS_COLORS.brand, boxShadow: 'none', '&:hover': { bgcolor: SSS_COLORS.brandDark } }}
              >
                {saving ? <CircularProgress size={20} /> : 'Enregistrer l’étape'}
              </Button>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard
              title="Forcer l'action conseillée"
              icon={<SettingsIcon />}
              color={theme.palette.secondary.main}
            >
              <TextField
                select
                fullWidth
                label="Action"
                value={nbaDraft}
                onChange={(e) => setNbaDraft(e.target.value)}
                sx={{ mb: 1.5 }}
                SelectProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem value="">Automatique (laisser le système décider)</MenuItem>
                {ACTION_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                onClick={handleSaveNba}
                disabled={saving}
                sx={{ borderRadius: 2, bgcolor: SSS_COLORS.brand, boxShadow: 'none', '&:hover': { bgcolor: SSS_COLORS.brandDark } }}
              >
                {saving ? <CircularProgress size={20} /> : 'Enregistrer l’action'}
              </Button>
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <InfoCard
              title="Pause de contact"
              icon={<ScheduleIcon />}
              color={theme.palette.warning.main}
            >
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
                InputProps={{
                  sx: { borderRadius: 2 },
                  inputProps: { min: 1, max: 90 }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleSnooze}
                disabled={saving}
                sx={{ borderRadius: 2 }}
              >
                {saving ? <CircularProgress size={20} /> : 'Mettre en pause'}
              </Button>
            </InfoCard>
          </Grid>
        </Grid>
      </TabPanel>

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
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        direction="up"
      >
        <SpeedDialAction
          icon={<RefreshIcon />}
          tooltipTitle="Recalculer"
          onClick={handleRecompute}
        />
        <SpeedDialAction
          icon={<PhoneIcon />}
          tooltipTitle="Appeler"
          onClick={() => window.location.href = telHref(identity.phone)}
          disabled={!identity.phone}
        />
        <SpeedDialAction
          icon={<WhatsAppIcon />}
          tooltipTitle="WhatsApp"
          onClick={() => window.open(whatsappHref(identity.phone), '_blank', 'noopener')}
          disabled={!identity.phone}
        />
        <SpeedDialAction
          icon={<SettingsIcon />}
          tooltipTitle="Modifier"
          onClick={() => setTab(4)}
        />
      </SpeedDial>
    </MainCard>
  );
};

// Composant TabPanel amélioré
function TabPanel({ children, value, index }) {
  return (
    <Fade in={value === index} timeout={300}>
      <Box sx={{ pt: 2 }}>
        {value === index && children}
      </Box>
    </Fade>
  );
}

export default PersonFichePage;