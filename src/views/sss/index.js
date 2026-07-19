import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlaylistAddCheck as GenerateIcon,
  WarningAmber as WarningIcon,
  Phone as PhoneIcon,
  Favorite as HeartIcon,
  PersonAdd as NewIcon,
  Settings as SettingsIcon,
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
  Today as TodayIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { PageToolbar, KpiCard, PriorityCard, PrimaryButton, GhostButton, QuickNav, ViewAllPeopleButton, SSS_COLORS } from './components/SssLayout';

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

  const load = useCallback(
    async (showLoading = true) => {
      if (!globalState?.key) return;
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const [metricsRes, boardRes] = await Promise.all([
          SssApi.getMetrics(globalState.key),
          SssApi.getBoard({}, globalState.key)
        ]);
        if (metricsRes?.status === 200) setMetrics(metricsRes.data?.data || metricsRes.data || null);
        if (boardRes?.status === 200) {
          const payload = boardRes.data?.data && !Array.isArray(boardRes.data.data) ? boardRes.data.data : boardRes.data || {};
          setBoardSummary(payload.summary || boardRes.data?.summary || null);
        }
      } catch (err) {
        setError(err?.data?.message || err?.message || 'Impossible de charger la vue du jour');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [globalState?.key]
  );

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
  const openCount = boardSummary?.open || tasks.todayTotal || 0;
  const overdueCount = tasks.overdueOpen || 0;
  const hasData = metrics || boardSummary;

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

  const quickActions = [
    {
      icon: <PhoneIcon />,
      label: 'Actions du jour',
      description: 'Traitez les contacts prioritaires de aujourd’hui',
      color: SSS_COLORS.brand,
      count: openCount,
      onClick: () => navigate('/wekavit/sss/today')
    },
    {
      icon: <WarningIcon />,
      label: 'Retards',
      description: 'Rattrapez les actions non terminées',
      color: SSS_COLORS.warning,
      count: overdueCount,
      onClick: () => navigate('/wekavit/sss/overdue')
    },
    {
      icon: <NewIcon />,
      label: 'Personnes',
      description: 'Parcourez et filtrez le portefeuille suivi',
      color: SSS_COLORS.info,
      count: base.totalProfiles,
      onClick: () => navigate('/wekavit/sss/people')
    },
    {
      icon: <SettingsIcon />,
      label: 'Réglages',
      description: 'Configurez les règles d’accompagnement',
      color: SSS_COLORS.neutral,
      onClick: () => navigate('/wekavit/sss/settings')
    }
  ];

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5, md: 3 }, bgcolor: SSS_COLORS.pageBg }}>
      <div className="sss-page">
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
          <div className="mb-6 animate-sss-fade-up">
            <div className="h-1.5 overflow-hidden rounded-full bg-sss-brand-soft">
              <div className="h-full w-1/3 animate-sss-shimmer rounded-full bg-sss-brand" />
            </div>
            <p className="sss-muted mt-2 text-xs">Chargement des données...</p>
          </div>
        )}

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-sss-error/20 bg-sss-error-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between animate-sss-fade-up">
            <p className="m-0 text-sm font-medium text-sss-error">{error}</p>
            <button type="button" onClick={handleRefresh} className="sss-btn-soft !min-h-9 !px-3 text-sss-error">
              Réessayer
            </button>
          </div>
        )}

        {hasData && !loading && (
          <div className="sss-surface-soft mb-6 overflow-hidden p-4 sm:p-5 animate-sss-fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sss-brand shadow-sss-sm">
                <AutoAwesomeIcon />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-base font-bold text-sss-text sm:text-lg">Prêt pour aujourd&apos;hui ?</h2>
                <p className="sss-muted mt-1 m-0 leading-relaxed">
                  Vous avez <span className="font-semibold text-sss-brand">{openCount}</span> actions à réaliser
                  aujourd&apos;hui.
                  {overdueCount > 0 && (
                    <>
                      {' '}
                      Dont <span className="font-semibold text-sss-error">{overdueCount}</span> en retard.
                    </>
                  )}
                </p>
              </div>
              <PrimaryButton
                startIcon={<TodayIcon />}
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/wekavit/sss/today')}
                className="!shrink-0"
              >
                Voir les actions
              </PrimaryButton>
            </div>
          </div>
        )}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Personnes suivies"
            value={base.totalProfiles}
            hint={`${base.neverDeposited ?? 0} n'ont jamais déposé`}
            icon={<GroupsIcon />}
            color={SSS_COLORS.brand}
            onClick={() => navigate('/wekavit/sss/people')}
            loading={loading}
            variant="dark"
          />
          <KpiCard
            title="Taux de conversion"
            value={base.conversionInscriptionToDepositPct != null ? `${base.conversionInscriptionToDepositPct}%` : '—'}
            hint={`${base.everDeposited ?? 0} ont déjà déposé`}
            icon={<TrendingUpIcon />}
            color={SSS_COLORS.success}
            loading={loading}
            variant="dark"
          />
          <KpiCard
            title="Santé moyenne"
            value={base.avgHealthScore ?? '—'}
            hint="Plus c'est haut, mieux c'est"
            icon={<MonitorHeartIcon />}
            color={SSS_COLORS.info}
            loading={loading}
            variant="dark"
          />
          <KpiCard
            title="Actions du jour"
            value={boardSummary?.open ?? tasks.todayTotal ?? '—'}
            hint={`${boardSummary?.done ?? tasks.todayDone ?? 0} terminées · ${overdueCount} en retard`}
            icon={<AssignmentLateIcon />}
            color={SSS_COLORS.warning}
            onClick={() => navigate('/wekavit/sss/today')}
            loading={loading}
            variant="dark"
          />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="sss-section-title m-0">Qui contacter en priorité ?</h2>
            <p className="sss-muted m-0 mt-1">Cliquez une carte pour ouvrir la liste filtrée correspondante.</p>
          </div>
          <ViewAllPeopleButton
            onClick={() => navigate('/wekavit/sss/people')}
            count={base.totalProfiles}
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, index) => (
            <div key={cat.title} className="animate-sss-fade-up h-full" style={{ animationDelay: `${index * 40}ms` }}>
              <PriorityCard
                title={cat.title}
                value={cat.value ?? 0}
                hint={cat.hint}
                icon={cat.icon}
                color={cat.color}
                onClick={cat.onClick}
                loading={loading}
              />
            </div>
          ))}
        </div>

        <div className="sss-surface mb-2 overflow-hidden p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="sss-section-title m-0">Navigation rapide</h2>
              <p className="sss-muted m-0 mt-1">Quatre raccourcis pour enchaîner sans perdre le fil.</p>
            </div>
          </div>
          <QuickNav items={quickActions} />
        </div>

        {!loading && !metrics && !error && (
          <div className="mt-8 animate-sss-fade-up">
            <div className="rounded-sss border-2 border-dashed border-sss-border bg-white px-6 py-12 text-center sm:px-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sss-brand-soft text-sss-brand">
                <DashboardIcon style={{ fontSize: 32 }} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-sss-text">Bienvenue dans votre tableau de bord</h3>
              <p className="sss-muted mx-auto mb-6 max-w-md leading-relaxed">
                Préparez d&apos;abord les profils, puis générez la liste du jour pour commencer à accompagner vos clients.
              </p>
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <PrimaryButton startIcon={<SettingsIcon />} onClick={() => navigate('/wekavit/sss/settings')}>
                  Aller aux réglages
                </PrimaryButton>
                <GhostButton startIcon={<GenerateIcon />} onClick={handleGenerate} disabled={generating}>
                  {generating ? 'Préparation...' : 'Préparer la journée'}
                </GhostButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainCard>
  );
};

export default DashboardPage;
