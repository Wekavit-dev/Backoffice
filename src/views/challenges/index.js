/* eslint-disable no-unused-vars */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Grid, IconButton, Tooltip } from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  EmojiEvents as TrophyIcon,
  LightbulbOutlined as TipIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { IconTrophy, IconUsers, IconEye, IconFileText } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainCard from 'ui-component/cards/MainCard';
import { AppContext } from 'AppContext';
import ChallengesApi from 'api/challenges/challenges';
import locekdSavesApi from 'api/saves/locked';
import CreateChallengeModal from './components/CreateChallengeModal';
import ChallengeDetailPanel from './components/ChallengeDetailPanel';
import {
  PageToolbar,
  KpiCard,
  FilterBar,
  FilterSelect,
  PrimaryButton,
  GhostButton,
  PageFrame,
  InfoBanner,
  ChallengeListItem,
  EmptyState,
  DetailWorkspace,
  KpiSkeletonGrid,
  ListSkeleton,
  StatusBadge,
  CHALLENGE_ACCENT,
  SSS_COLORS
} from './components/ChallengeLayout';
import {
  PUBLISH_OPTIONS,
  STATUS_OPTIONS,
  extractData,
  extractList,
  formatAmount,
  formatDate,
  getGameModeLabel,
  isApiSuccess
} from './utils/challengeUi';

const ChallengesPage = () => {
  const { globalState } = useContext(AppContext);

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileShowPanel, setMobileShowPanel] = useState(false);
  const [savingTypes, setSavingTypes] = useState([]);
  const [devises, setDevises] = useState([]);

  const fetchMeta = useCallback(async () => {
    if (!globalState?.key) return;
    try {
      const [typesRes, devisesRes] = await Promise.all([
        locekdSavesApi.getSavingTypes(globalState.key),
        locekdSavesApi.getCurriences(globalState.key)
      ]);
      setSavingTypes(extractList(typesRes));
      setDevises(extractList(devisesRes));
    } catch (error) {
      console.error('Meta challenges load error', error);
    }
  }, [globalState?.key]);

  const fetchChallenges = useCallback(
    async (showLoading = true) => {
      if (!globalState?.key) return;
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      try {
        const params = { page: 1, limit: 100 };
        if (statusFilter !== 'all') params.status = statusFilter;
        if (publishFilter !== 'all') params.isPublished = publishFilter;

        const response = await ChallengesApi.listChallenges(params, globalState.key);
        const list = extractList(response);
        setChallenges(list);

        setSelectedChallenge((prev) => {
          if (!list.length) return null;
          if (prev) {
            const stillThere = list.find((item) => item._id === prev._id);
            return stillThere || list[0];
          }
          return list[0];
        });
      } catch (error) {
        toast.error(error?.data?.error || 'Impossible de charger les défis', { position: 'top-right' });
        setChallenges([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [globalState?.key, statusFilter, publishFilter]
  );

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const filteredChallenges = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.gameMode?.toLowerCase().includes(q) ||
        (item.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [challenges, searchTerm]);

  const stats = useMemo(() => {
    const published = challenges.filter((c) => c.isPublished).length;
    const active = challenges.filter((c) => c.status === 'active').length;
    const participants = challenges.reduce((sum, c) => sum + (Number(c.participantCount) || 0), 0);
    return { total: challenges.length, published, active, participants };
  }, [challenges]);

  const handleCreate = async (payload, resetForm) => {
    setIsSubmitting(true);
    try {
      const response = await ChallengesApi.createChallenge(payload, globalState?.key);
      if (!isApiSuccess(response)) {
        toast.error(response?.data?.error || 'Erreur lors de la création', { position: 'top-right' });
        return;
      }

      toast.success('Défi créé en brouillon', { position: 'top-right' });
      setAddModalOpen(false);
      resetForm?.();
      await fetchChallenges(false);
      const created = extractData(response);
      if (created) {
        setSelectedChallenge(created);
        setMobileShowPanel(true);
      }
    } catch (error) {
      toast.error(error?.data?.error || error?.message || 'Erreur lors de la création', { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdated = (updated) => {
    if (!updated?._id) {
      fetchChallenges(false);
      return;
    }
    setChallenges((prev) => prev.map((item) => (item._id === updated._id ? { ...item, ...updated } : item)));
    setSelectedChallenge((prev) => (prev?._id === updated._id ? { ...prev, ...updated } : prev));
  };

  const handleSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setMobileShowPanel(true);
  };

  const getProgress = (challenge) =>
    challenge.goalAmount
      ? Math.min(100, Math.round((Number(challenge.totalSaved || 0) / Number(challenge.goalAmount)) * 100))
      : 0;

  if (loading && !challenges.length) {
    return (
      <MainCard border={false} content={false}>
        <PageFrame className="p-1 sm:p-2">
          <KpiSkeletonGrid />
          <ListSkeleton />
        </PageFrame>
      </MainCard>
    );
  }

  return (
    <MainCard border={false} content={false}>
      <PageFrame className="p-1 sm:p-2">
        <PageToolbar
          icon={<TrophyIcon />}
          title="Défis d’épargne"
          subtitle="Créez, configurez et publiez des défis. Gérez le classement et les versements manqués depuis le panneau de détail."
          color={CHALLENGE_ACCENT}
          actions={
            <>
              <GhostButton startIcon={<RefreshIcon />} onClick={() => fetchChallenges(false)} disabled={refreshing}>
                {refreshing ? '…' : 'Actualiser'}
              </GhostButton>
              <PrimaryButton startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}>
                Nouveau défi
              </PrimaryButton>
            </>
          }
        />

        <InfoBanner icon={<TipIcon />} color={CHALLENGE_ACCENT}>
          Workflow recommandé : créer un brouillon → configurer règles et récompenses → rendre visible dans l’app.
        </InfoBanner>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-sss-fade-up">
          <KpiCard title="Tous les défis" value={stats.total} icon={<IconTrophy />} color={SSS_COLORS.brand} />
          <KpiCard title="Visibles dans l’app" value={stats.published} icon={<IconEye />} color={SSS_COLORS.success} />
          <KpiCard title="En cours" value={stats.active} icon={<IconFileText />} color={SSS_COLORS.warning} />
          <KpiCard title="Participants" value={stats.participants} icon={<IconUsers />} color={SSS_COLORS.info} />
        </div>

        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un défi, un type, un mot-clé…"
        >
          <FilterSelect
            label="État"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            label="Visibilité"
            value={publishFilter}
            onChange={(e) => setPublishFilter(e.target.value)}
            options={PUBLISH_OPTIONS}
          />
        </FilterBar>

        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            xl={5}
            sx={{ display: { xs: mobileShowPanel ? 'none' : 'block', xl: 'block' } }}
          >
            <div className="sss-surface flex max-h-[calc(100vh-280px)] min-h-[420px] flex-col overflow-hidden xl:max-h-[calc(100vh-240px)]">
              <div className="border-b border-sss-border px-4 py-3.5 sm:px-5">
                <h2 className="m-0 text-sm font-bold text-sss-text">Vos défis</h2>
                <p className="sss-muted m-0 mt-0.5 text-xs">
                  {filteredChallenges.length} défi{filteredChallenges.length > 1 ? 's affichés' : ' affiché'}
                </p>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto p-3 sm:p-4">
                {loading ? (
                  <ListSkeleton />
                ) : filteredChallenges.length === 0 ? (
                  <EmptyState
                    icon={<TrophyIcon />}
                    title="Aucun défi trouvé"
                    description="Ajustez vos filtres ou créez votre premier défi d’épargne."
                    action={
                      <PrimaryButton startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}>
                        Créer un défi
                      </PrimaryButton>
                    }
                  />
                ) : (
                  filteredChallenges.map((challenge) => {
                    const selected = selectedChallenge?._id === challenge._id;
                    const progress = getProgress(challenge);
                    return (
                      <div key={challenge._id} className="space-y-2">
                        <ChallengeListItem
                          name={challenge.name}
                          subtitle={`${getGameModeLabel(challenge.gameMode)} · ${formatAmount(challenge.goalAmount, challenge.idDevise)}`}
                          meta={`${formatDate(challenge.startDate)} → ${formatDate(challenge.endDate)}`}
                          coverImage={
                            challenge.coverImageUrl ||
                            challenge.coverImage
                          }
                          progress={progress}
                          participants={challenge.participantCount || 0}
                          maxParticipants={challenge.maxParticipants}
                          selected={selected}
                          onClick={() => handleSelect(challenge)}
                        />
                        {selected && (
                          <div className="px-1">
                            <StatusBadge
                              status={challenge.status}
                              published={challenge.isPublished}
                              featured={challenge.featured}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </Grid>

          <Grid
            item
            xs={12}
            xl={7}
            sx={{ display: { xs: mobileShowPanel ? 'block' : 'none', xl: 'block' } }}
          >
            <DetailWorkspace className="min-h-[420px] xl:min-h-[calc(100vh-240px)]">
              <div className="admin-panel-header flex items-center gap-2 border-b border-sss-border px-4 py-3 sm:px-5">
                {mobileShowPanel && (
                  <Tooltip title="Retour à la liste">
                    <IconButton size="small" onClick={() => setMobileShowPanel(false)} sx={{ display: { xl: 'none' } }}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <div className="min-w-0">
                  <p className="m-0 text-[0.68rem] font-bold uppercase tracking-wider text-sss-muted">Détail</p>
                  <h2 className="m-0 truncate text-base font-bold text-sss-text">
                    {selectedChallenge?.name || 'Sélectionnez un défi'}
                  </h2>
                </div>
              </div>

              <ChallengeDetailPanel
                challenge={selectedChallenge}
                token={globalState?.key}
                onUpdated={handleUpdated}
              />
            </DetailWorkspace>
          </Grid>
        </Grid>

        <CreateChallengeModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          savingTypes={savingTypes}
          devises={devises}
          token={globalState?.key}
        />
      </PageFrame>
    </MainCard>
  );
};

export default ChallengesPage;
