import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Grid, Typography, Chip, Skeleton, Divider, IconButton, Tooltip } from '@mui/material';
import {
  Tune as TuneIcon,
  Edit as EditIcon,
  ChevronLeft as ChevronLeftIcon,
  MenuBook as BookIcon
} from '@mui/icons-material';
import { IconSettings, IconChartBar, IconAlertTriangle, IconLayersDifference } from '@tabler/icons';
import { toast } from 'react-toastify';

import MainCard from 'ui-component/cards/MainCard';
import { AppContext } from 'AppContext';
import ChallengesApi from 'api/challenges/challenges';
import EditRuleTemplateModal from './components/EditRuleTemplateModal';
import {
  PageToolbar,
  KpiCard,
  FilterBar,
  FilterSelect,
  PrimaryButton,
  PageFrame,
  InfoBanner,
  EmptyState,
  DetailWorkspace,
  KpiSkeletonGrid,
  CHALLENGE_ACCENT,
  SSS_COLORS
} from './components/ChallengeLayout';
import {
  GAME_MODES,
  RULE_CATEGORY_LABELS,
  VALUE_TYPE_LABELS,
  extractData,
  formatRuleBounds,
  formatRuleValue,
  getGameModeLabel,
  isApiSuccess
} from './utils/challengeUi';

const CATEGORY_COLORS = {
  scoring: 'primary',
  impayes: 'warning',
  disqualification: 'error',
  gameplay: 'info'
};

const ChallengesRulesPage = () => {
  const { globalState } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [gameModes, setGameModes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameModeFilter, setGameModeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRule, setSelectedRule] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const params = {};
      if (gameModeFilter !== 'all') params.gameMode = gameModeFilter;

      const response = await ChallengesApi.listRuleTemplates(params, globalState.key);
      const data = extractData(response) || response?.data || {};
      const list = Array.isArray(data.templates) ? data.templates : [];
      setTemplates(list);
      setGameModes(Array.isArray(data.gameModes) ? data.gameModes : []);

      setSelectedRule((prev) => {
        if (!list.length) return null;
        if (prev) {
          const still = list.find((item) => item.slug === prev.slug);
          return still || list[0];
        }
        return list[0];
      });
    } catch (error) {
      toast.error(error?.data?.error || 'Impossible de charger les règles', { position: 'top-right' });
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, gameModeFilter]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const categories = useMemo(() => {
    return [...new Set(templates.map((item) => item.category).filter(Boolean))];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return templates.filter((item) => {
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        RULE_CATEGORY_LABELS[item.category]?.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: templates.length,
      scoring: templates.filter((t) => t.category === 'scoring').length,
      impayes: templates.filter((t) => t.category === 'impayes').length,
      modes: gameModes.length || GAME_MODES.length
    }),
    [templates, gameModes]
  );

  const handleSelect = (rule) => {
    setSelectedRule(rule);
    setMobileShowDetail(true);
  };

  const handleSaveRule = async (payload) => {
    if (!selectedRule?.slug) return;
    setSaving(true);
    try {
      const res = await ChallengesApi.updateRuleTemplate(selectedRule.slug, payload, globalState?.key);
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Enregistrement impossible', { position: 'top-right' });
        return;
      }
      toast.success('Règle mise à jour', { position: 'top-right' });
      setEditOpen(false);
      await fetchRules();
    } catch (error) {
      toast.error(error?.data?.error || 'Enregistrement impossible', { position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !templates.length) {
    return (
      <MainCard border={false} content={false}>
        <PageFrame className="p-1 sm:p-2">
          <KpiSkeletonGrid />
        </PageFrame>
      </MainCard>
    );
  }

  return (
    <MainCard border={false} content={false}>
      <PageFrame className="p-1 sm:p-2">
        <PageToolbar
          icon={<BookIcon />}
          title="Comment fonctionnent les défis"
          subtitle="Catalogue global des règles de jeu. Chaque modification s’applique aux futurs réglages de défis."
          color={CHALLENGE_ACCENT}
        />

        <InfoBanner icon={<TuneIcon />} color={SSS_COLORS.info}>
          Cliquez une règle pour lire la description complète, puis modifiez-la si besoin.
        </InfoBanner>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-sss-fade-up">
          <KpiCard title="Règles" value={stats.total} icon={<IconSettings />} color={SSS_COLORS.brand} />
          <KpiCard title="Points & classement" value={stats.scoring} icon={<IconChartBar />} color={SSS_COLORS.success} />
          <KpiCard title="Versements manqués" value={stats.impayes} icon={<IconAlertTriangle />} color={SSS_COLORS.warning} />
          <KpiCard title="Types de défis" value={stats.modes} icon={<IconLayersDifference />} color={SSS_COLORS.info} />
        </div>

        <FilterBar searchValue={searchTerm} onSearchChange={setSearchTerm} searchPlaceholder="Rechercher une règle…">
          <FilterSelect
            label="Type de défi"
            value={gameModeFilter}
            onChange={(e) => setGameModeFilter(e.target.value)}
            options={[{ value: 'all', label: 'Tous les types' }, ...GAME_MODES.map((m) => ({ value: m.value, label: m.label }))]}
          />
          <FilterSelect
            label="Catégorie"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Toutes' },
              ...categories.map((c) => ({ value: c, label: RULE_CATEGORY_LABELS[c] || c }))
            ]}
          />
        </FilterBar>

        <Grid container spacing={3}>
          <Grid item xs={12} xl={5} sx={{ display: { xs: mobileShowDetail ? 'none' : 'block', xl: 'block' } }}>
            <div className="sss-surface max-h-[calc(100vh-280px)] min-h-[420px] overflow-y-auto p-3 sm:p-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rounded" height={88} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState icon={<BookIcon />} title="Aucune règle trouvée" description="Modifiez vos filtres de recherche." />
              ) : (
                <div className="space-y-2.5">
                  {filtered.map((rule) => {
                    const selected = selectedRule?.slug === rule.slug;
                    return (
                      <button
                        key={rule.slug}
                        type="button"
                        onClick={() => handleSelect(rule)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                          selected
                            ? 'border-sss-brand bg-sss-brand-soft shadow-sss-md ring-1 ring-sss-brand/20'
                            : 'border-sss-border bg-white hover:-translate-y-0.5 hover:border-sss-brand/35 hover:shadow-sss-card'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="m-0 truncate text-sm font-bold text-sss-text">{rule.name}</p>
                            <p className="sss-muted m-0 mt-1 line-clamp-2 text-xs">{rule.description}</p>
                          </div>
                          <span className="shrink-0 rounded-xl bg-sss-brand/10 px-2.5 py-1 text-sm font-bold text-sss-brand">
                            {formatRuleValue(rule)}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <Chip
                            size="small"
                            label={RULE_CATEGORY_LABELS[rule.category] || rule.category}
                            color={CATEGORY_COLORS[rule.category] || 'default'}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Grid>

          <Grid item xs={12} xl={7} sx={{ display: { xs: mobileShowDetail ? 'block' : 'none', xl: 'block' } }}>
            <DetailWorkspace className="min-h-[420px] p-4 sm:p-5">
              {!selectedRule ? (
                <EmptyState
                  icon={<BookIcon />}
                  title="Sélectionnez une règle"
                  description="Le détail complet s’affiche ici : description, valeurs par défaut et types de défis concernés."
                />
              ) : (
                <div className="animate-sss-fade-up">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      {mobileShowDetail && (
                        <IconButton size="small" onClick={() => setMobileShowDetail(false)} sx={{ display: { xl: 'none' } }}>
                          <ChevronLeftIcon />
                        </IconButton>
                      )}
                      <div className="min-w-0">
                        <h2 className="m-0 text-xl font-bold tracking-tight text-sss-text">{selectedRule.name}</h2>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Chip size="small" label={RULE_CATEGORY_LABELS[selectedRule.category] || selectedRule.category} color={CATEGORY_COLORS[selectedRule.category] || 'default'} />
                          <Chip size="small" variant="outlined" label={VALUE_TYPE_LABELS[selectedRule.valueType] || selectedRule.valueType} />
                          <Chip size="small" label={selectedRule.isActive !== false ? 'Active' : 'Désactivée'} color={selectedRule.isActive !== false ? 'success' : 'default'} />
                        </div>
                      </div>
                    </div>
                    <Tooltip title="Modifier">
                      <PrimaryButton startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                        Modifier
                      </PrimaryButton>
                    </Tooltip>
                  </div>

                  <p className="sss-muted m-0 leading-relaxed">{selectedRule.description || 'Aucune description.'}</p>

                  <Divider sx={{ my: 3 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <p className="m-0 text-xs font-bold uppercase tracking-wide text-sss-muted">Valeur par défaut</p>
                      <Typography variant="h4" fontWeight={800} sx={{ color: SSS_COLORS.brand, mt: 0.5 }}>
                        {formatRuleValue(selectedRule)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <p className="m-0 text-xs font-bold uppercase tracking-wide text-sss-muted">Plage autorisée</p>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                        {formatRuleBounds(selectedRule)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide text-sss-muted">Types de défis concernés</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedRule.appliesToModes || []).length === 0 ? (
                          <Chip size="small" label="Tous les types" />
                        ) : (
                          selectedRule.appliesToModes.map((mode) => (
                            <Chip key={mode} size="small" variant="outlined" label={getGameModeLabel(mode)} />
                          ))
                        )}
                      </div>
                    </Grid>
                    <Grid item xs={12}>
                      <div className="rounded-2xl border border-sss-brand/15 bg-sss-brand-soft/40 px-4 py-3 text-sm text-sss-muted">
                        Identifiant technique : <strong className="text-sss-text">{selectedRule.slug}</strong>
                      </div>
                    </Grid>
                  </Grid>
                </div>
              )}
            </DetailWorkspace>
          </Grid>
        </Grid>

        <EditRuleTemplateModal
          open={editOpen}
          rule={selectedRule}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSaveRule}
          isSubmitting={saving}
        />
      </PageFrame>
    </MainCard>
  );
};

export default ChallengesRulesPage;
