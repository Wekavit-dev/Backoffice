import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  LinearProgress,
  Alert,
  Divider,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Refresh as RefreshIcon,
  PlaylistAddCheck as GenerateIcon,
  WarningAmber as WarningIcon,
  Phone as PhoneIcon,
  Favorite as HeartIcon,
  PersonAdd as NewIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  MonitorHeart as MonitorHeartIcon,
  AssignmentLate as AssignmentLateIcon,
  PriorityHigh as PriorityHighIcon,
  Campaign as CampaignIcon,
  WavingHand as WavingHandIcon,
  NightsStay as NightsStayIcon,
  Star as StarIcon,
  RecordVoiceOver as RecordVoiceOverIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { StatCard, EmptyState } from './components/Chips';
import PageHeader from './components/PageHeader';

const DashboardPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [boardSummary, setBoardSummary] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, boardRes] = await Promise.all([
        SssApi.getMetrics(globalState.key),
        SssApi.getBoard({}, globalState.key)
      ]);
      if (metricsRes?.status === 200) setMetrics(metricsRes.data?.data || null);
      if (boardRes?.status === 200) {
        setBoardSummary(boardRes.data?.summary || null);
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Impossible de charger la vue du jour');
    } finally {
      setLoading(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    if (!globalState?.key) return;
    setGenerating(true);
    try {
      const res = await SssApi.generateBoard({ refresh: true }, globalState.key);
      if (res?.status === 200) {
        toast.success('Liste du jour préparée');
        await load();
        navigate('/wekavit/sss/today');
      } else {
        toast.error(res?.data?.message || 'Échec de la préparation');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Échec de la préparation');
    } finally {
      setGenerating(false);
    }
  };

  const cats = metrics?.dashboardCategories || {};
  const base = metrics?.base || {};
  const tasks = metrics?.tasks || {};

  return (
    <MainCard
      title={
        <PageHeader
          icon={<HeartIcon />}
          eyebrow="Accompagnement"
          title="Vue du jour"
          subtitle="Qui a besoin d’attention aujourd’hui ? Cliquez sur une carte pour agir. Pas de jargon : juste les personnes à aider à réussir leur épargne."
          color="error"
        />
      }
      secondary={
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
          {isXs ? (
            <Tooltip title="Actualiser">
              <IconButton onClick={load} disabled={loading} size="small">
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading} size="small">
              Actualiser
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<GenerateIcon />}
            onClick={handleGenerate}
            disabled={generating || loading}
            size="small"
          >
            {generating ? 'Préparation…' : isXs ? 'Préparer' : 'Préparer la journée'}
          </Button>
        </Stack>
      }
      sx={{ '& .MuiCardHeader-content': { minWidth: 0 } }}
      contentSX={{ p: { xs: 1.5, sm: 3 } }}
    >
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Personnes suivies"
            value={base.totalProfiles ?? '—'}
            hint={`${base.neverDeposited ?? 0} n’ont jamais déposé`}
            icon={<GroupsIcon />}
            onClick={() => navigate('/wekavit/sss/people')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ont déjà déposé"
            value={base.everDeposited != null ? `${base.conversionInscriptionToDepositPct}%` : '—'}
            hint={`${base.everDeposited ?? 0} personnes`}
            color="success.main"
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Santé moyenne"
            value={base.avgHealthScore ?? '—'}
            hint="Plus c’est haut, mieux c’est"
            color="info.main"
            icon={<MonitorHeartIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Actions du jour"
            value={boardSummary?.open ?? tasks.todayTotal ?? '—'}
            hint={`${boardSummary?.done ?? tasks.todayDone ?? 0} terminées · ${tasks.overdueOpen ?? 0} en retard`}
            color="warning.main"
            icon={<AssignmentLateIcon />}
            onClick={() => navigate('/wekavit/sss/today')}
          />
        </Grid>
      </Grid>

      <Typography variant="h4" sx={{ mb: 1.5 }}>
        Qui contacter en priorité ?
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="À appeler d’urgence"
            value={cats.callUrgent ?? 0}
            hint="Risque de perdre ces personnes"
            color="error.main"
            icon={<PriorityHighIcon />}
            onClick={() => navigate('/wekavit/sss/people?urgency=critical')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="À relancer"
            value={cats.toRelaunch ?? 0}
            hint="Argent qui dort ou dépôt sans plan"
            color="warning.main"
            icon={<CampaignIcon />}
            onClick={() => navigate('/wekavit/sss/people')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Nouveaux à accueillir"
            value={cats.newToWelcome ?? 0}
            hint="Inscrits récents"
            color="info.main"
            icon={<WavingHandIcon />}
            onClick={() => navigate('/wekavit/sss/people?cohort=new')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="À réveiller"
            value={cats.toReactivate ?? 0}
            hint="Inactifs depuis 2 à 4 semaines"
            icon={<NightsStayIcon />}
            onClick={() => navigate('/wekavit/sss/people?stage=S11')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="À féliciter"
            value={cats.toCongratulate ?? 0}
            hint="Bonne progression cette semaine"
            color="success.main"
            icon={<StarIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Ambassadeurs potentiels"
            value={cats.ambassadorsToInvite ?? 0}
            hint="Prêts à témoigner ou parrainer"
            color="secondary.main"
            icon={<RecordVoiceOverIcon />}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" startIcon={<PhoneIcon />} onClick={() => navigate('/wekavit/sss/today')}>
          Voir les actions du jour
        </Button>
        <Button variant="outlined" startIcon={<WarningIcon />} color="warning" onClick={() => navigate('/wekavit/sss/overdue')}>
          Voir les retards ({tasks.overdueOpen ?? 0})
        </Button>
        <Button variant="outlined" startIcon={<NewIcon />} onClick={() => navigate('/wekavit/sss/people')}>
          Parcourir les personnes
        </Button>
        <Button variant="text" startIcon={<TrophyIcon />} onClick={() => navigate('/wekavit/sss/settings')}>
          Réglages
        </Button>
      </Stack>

      {!loading && !metrics && !error && (
        <Box mt={3}>
          <EmptyState
            title="Rien à afficher pour l’instant"
            subtitle="Préparez d’abord les profils (Réglages → Initialiser), puis générez la liste du jour."
            action={
              <Button variant="contained" onClick={() => navigate('/wekavit/sss/settings')}>
                Aller aux réglages
              </Button>
            }
          />
        </Box>
      )}
    </MainCard>
  );
};

export default DashboardPage;
