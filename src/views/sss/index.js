import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  LinearProgress,
  Alert,
  Divider,
  useMediaQuery,
  Avatar,
  Paper,
  Fade,
  alpha,
  useTheme
} from '@mui/material';
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
  EmojiPeople as WavingHandIcon,
  NightsStay as NightsStayIcon,
  Star as StarIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleAltIcon,
  Settings as SettingsIcon,
  Today as TodayIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { PageToolbar, KpiCard, InfoBanner, PrimaryButton, GhostButton, SSS_COLORS } from './components/SssLayout';

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
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showLoading = true) => {
    if (!globalState?.key) return;
    if (showLoading) setLoading(true);
    else setRefreshing(true);
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
      setRefreshing(false);
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
        toast.success('Liste du jour préparée avec succès !');
        await load(false);
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

  const handleRefresh = () => {
    load(false);
    toast.info('Actualisation en cours...');
  };

  const cats = metrics?.dashboardCategories || {};
  const base = metrics?.base || {};
  const tasks = metrics?.tasks || {};

  const quickActions = [
    {
      icon: <PhoneIcon />,
      label: 'Actions du jour',
      path: '/wekavit/sss/today',
      color: 'primary',
      count: boardSummary?.open || tasks.todayTotal || 0
    },
    {
      icon: <WarningIcon />,
      label: 'Retards',
      path: '/wekavit/sss/overdue',
      color: 'warning',
      count: tasks.overdueOpen || 0
    },
    {
      icon: <NewIcon />,
      label: 'Personnes',
      path: '/wekavit/sss/people',
      color: 'info'
    },
    {
      icon: <TrophyIcon />,
      label: 'Réglages',
      path: '/wekavit/sss/settings',
      color: 'secondary'
    }
  ];

  const categories = [
    {
      title: "À appeler d'urgence",
      value: cats.callUrgent,
      hint: 'Risque de perdre ces personnes',
      icon: <PriorityHighIcon />,
      color: SSS_COLORS.error,
      onClick: () => navigate('/wekavit/sss/people?urgency=critical')
    },
    {
      title: 'À relancer',
      value: cats.toRelaunch,
      hint: 'Argent qui dort ou dépôt sans plan',
      icon: <CampaignIcon />,
      color: SSS_COLORS.warning,
      onClick: () => navigate('/wekavit/sss/people')
    },
    {
      title: 'Nouveaux à accueillir',
      value: cats.newToWelcome,
      hint: 'Inscrits récents',
      icon: <WavingHandIcon />,
      color: SSS_COLORS.info,
      onClick: () => navigate('/wekavit/sss/people?cohort=new')
    },
    {
      title: 'À réveiller',
      value: cats.toReactivate,
      hint: 'Inactifs depuis 2 à 4 semaines',
      icon: <NightsStayIcon />,
      color: SSS_COLORS.brand,
      onClick: () => navigate('/wekavit/sss/people?stage=S11')
    },
    {
      title: 'À féliciter',
      value: cats.toCongratulate,
      hint: 'Bonne progression cette semaine',
      icon: <StarIcon />,
      color: SSS_COLORS.success,
      onClick: () => navigate('/wekavit/sss/people')
    },
    {
      title: 'Ambassadeurs potentiels',
      value: cats.ambassadorsToInvite,
      hint: 'Prêts à témoigner ou parrainer',
      icon: <RecordVoiceOverIcon />,
      color: SSS_COLORS.brandDark,
      onClick: () => navigate('/wekavit/sss/people')
    }
  ];

  const hasData = metrics || boardSummary;

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5, md: 3 }, bgcolor: 'background.paper' }}>
      <PageToolbar
        icon={<HeartIcon />}
        title="Vue du jour"
        subtitle="Qui a besoin d'attention aujourd'hui ? Cliquez sur une carte pour agir."
        actions={
          <>
            <GhostButton startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={loading || refreshing}>
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </GhostButton>
            <PrimaryButton startIcon={<GenerateIcon />} onClick={handleGenerate} disabled={generating || loading}>
              {generating ? 'Préparation...' : isXs ? 'Préparer' : 'Préparer la journée'}
            </PrimaryButton>
          </>
        }
      />

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Chargement des données...
          </Typography>
        </Box>
      )}

      {error && (
        <Fade in>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {hasData && !loading && (
        <Fade in>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              mb: 3,
              borderRadius: 2.5,
              bgcolor: SSS_COLORS.brandSoft,
              border: `1px solid ${SSS_COLORS.brandBorder}`
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 32, color: SSS_COLORS.brand }} />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Prêt pour aujourd'hui ?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous avez {boardSummary?.open || tasks.todayTotal || 0} actions à réaliser aujourd'hui.
                  {tasks.overdueOpen > 0 && ` Dont ${tasks.overdueOpen} en retard.`}
                </Typography>
              </Box>
              <PrimaryButton startIcon={<TodayIcon />} onClick={() => navigate('/wekavit/sss/today')} sx={{ flexShrink: 0 }}>
                Voir les actions
              </PrimaryButton>
            </Stack>
          </Paper>
        </Fade>
      )}

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3.5 }}>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            title="Personnes suivies"
            value={base.totalProfiles}
            hint={`${base.neverDeposited ?? 0} n'ont jamais déposé`}
            icon={<GroupsIcon />}
            color={SSS_COLORS.brand}
            onClick={() => navigate('/wekavit/sss/people')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            title="Taux de conversion"
            value={base.conversionInscriptionToDepositPct != null ? `${base.conversionInscriptionToDepositPct}%` : '—'}
            hint={`${base.everDeposited ?? 0} ont déjà déposé`}
            icon={<TrendingUpIcon />}
            color={SSS_COLORS.success}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            title="Santé moyenne"
            value={base.avgHealthScore ?? '—'}
            hint="Plus c'est haut, mieux c'est"
            icon={<MonitorHeartIcon />}
            color={SSS_COLORS.info}
            loading={loading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            title="Actions du jour"
            value={boardSummary?.open ?? tasks.todayTotal ?? '—'}
            hint={`${boardSummary?.done ?? tasks.todayDone ?? 0} terminées · ${tasks.overdueOpen ?? 0} en retard`}
            icon={<AssignmentLateIcon />}
            color={SSS_COLORS.warning}
            onClick={() => navigate('/wekavit/sss/today')}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Qui contacter en priorité ?
        </Typography>
        <Button
          size="small"
          startIcon={<PeopleAltIcon />}
          onClick={() => navigate('/wekavit/sss/people')}
          sx={{ textTransform: 'none', fontWeight: 600, color: SSS_COLORS.brand }}
        >
          Voir toutes les personnes
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {categories.map((cat) => (
          <Grid item key={cat.title} xs={12} sm={6} md={4}>
            <KpiCard
              title={cat.title}
              value={cat.value ?? 0}
              hint={cat.hint}
              icon={cat.icon}
              color={cat.color}
              onClick={cat.onClick}
              loading={loading}
              variant="soft"
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={2}>
        {quickActions.map((action) => (
          <Grid item key={action.label} xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color={action.color}
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                justifyContent: 'center',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: alpha(theme.palette[action.color].main, 0.3),
                '&:hover': {
                  borderColor: theme.palette[action.color].main,
                  bgcolor: alpha(theme.palette[action.color].main, 0.04)
                },
                position: 'relative'
              }}
            >
              {action.label}
              {action.count > 0 && (
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    height: 20,
                    minWidth: 20,
                    px: 0.5,
                    borderRadius: 10,
                    bgcolor: SSS_COLORS.error,
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {action.count}
                </Box>
              )}
            </Button>
          </Grid>
        ))}
      </Grid>

      {!loading && !metrics && !error && (
        <Fade in>
          <Box mt={4}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 3,
                border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`
              }}
            >
              <Avatar sx={{ width: 64, height: 64, bgcolor: SSS_COLORS.brandSoft, color: SSS_COLORS.brand, mx: 'auto', mb: 2 }}>
                <DashboardIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Bienvenue dans votre tableau de bord
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                Préparez d'abord les profils, puis générez la liste du jour pour commencer à accompagner vos clients.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <PrimaryButton startIcon={<SettingsIcon />} onClick={() => navigate('/wekavit/sss/settings')}>
                  Aller aux réglages
                </PrimaryButton>
                <Button variant="outlined" startIcon={<GenerateIcon />} onClick={handleGenerate} disabled={generating}>
                  {generating ? 'Préparation...' : 'Préparer la journée'}
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Fade>
      )}
    </MainCard>
  );
};

export default DashboardPage;
