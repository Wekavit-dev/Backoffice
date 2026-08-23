import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Divider,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Publish as PublishIcon,
  Unpublished as UnpublishIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ChallengesApi from 'api/challenges/challenges';
import RankingPanel from './RankingPanel';
import MissedPaymentsPanel from './MissedPaymentsPanel';
import ConfirmDialog from './ConfirmDialog';
import {
  EmptyState,
  StatusBadge,
  DetailHeader,
  fieldSx,
  PrimaryButton,
  GhostButton,
  SSS_COLORS
} from './ChallengeLayout';
import {
  FREQUENCIES,
  GAME_MODES,
  PRIZE_TYPE_LABELS,
  RULE_CATEGORY_LABELS,
  VALUE_TYPE_LABELS,
  extractData,
  formatAmount,
  formatDate,
  formatDateInput,
  formatRuleBounds,
  formatRuleValue,
  getGameModeLabel,
  getGameModeMeta,
  isApiSuccess
} from '../utils/challengeUi';

const TabPanel = ({ value, index, children }) => {
  if (value !== index) return null;
  return <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>;
};

TabPanel.propTypes = {
  value: PropTypes.number,
  index: PropTypes.number,
  children: PropTypes.node
};

const ChallengeDetailPanel = ({ challenge, token, onUpdated }) => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(null);
  const [rulesForm, setRulesForm] = useState({ gameMode: 'fixed_schedule', rules: [] });
  const [prizes, setPrizes] = useState([]);
  const [winnerCount, setWinnerCount] = useState(3);
  const [catalog, setCatalog] = useState({ gameModes: [], templates: [] });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [prizeToRemove, setPrizeToRemove] = useState(null);

  useEffect(() => {
    if (!challenge) {
      setForm(null);
      return;
    }

    setForm({
      name: challenge.name || '',
      description: challenge.description || '',
      goalAmount: challenge.goalAmount ?? '',
      contributionAmount: challenge.contributionAmount ?? '',
      contributionFrequency: challenge.contributionFrequency || 'weekly',
      startDate: formatDateInput(challenge.startDate),
      endDate: formatDateInput(challenge.endDate),
      maxParticipants: challenge.maxParticipants ?? 0,
      featured: Boolean(challenge.featured),
      prizeDescription: challenge.prizeDescription || '',
      tags: (challenge.tags || []).join(', ')
    });

        setRulesForm({
          gameMode: challenge.gameMode || 'fixed_schedule',
          rules: (challenge.rules || []).map((rule) => ({
            slug: rule.slug,
            enabled: rule.enabled !== false,
            value: rule.value ?? 0,
            name: rule.name,
            description: rule.description,
            category: rule.category,
            valueType: rule.valueType,
            min: rule.min,
            max: rule.max,
            defaultValue: rule.defaultValue,
            appliesToModes: rule.appliesToModes || []
          }))
        });

    setWinnerCount(challenge.winnerCount || 3);
    setPrizes(
      (challenge.winnerPrizes || []).map((prize) => ({
        rank: prize.rank,
        title: prize.title || '',
        description: prize.description || '',
        amount: prize.amount ?? 0,
        prizeType: prize.prizeType || 'custom',
        badgeSlug: prize.badgeSlug || ''
      }))
    );
    setTab(0);
  }, [challenge?._id]);

  useEffect(() => {
    if (!token) return;

    ChallengesApi.listRuleTemplates({}, token)
      .then((res) => {
        const data = extractData(res) || res?.data || {};
        setCatalog({
          gameModes: data.gameModes || [],
          templates: data.templates || []
        });
      })
      .catch(() => {
        /* catalogue optionnel au premier chargement */
      });
  }, [token]);

  const modeMeta = useMemo(() => getGameModeMeta(rulesForm.gameMode), [rulesForm.gameMode]);

  const applicableTemplates = useMemo(() => {
    return (catalog.templates || []).filter(
      (template) => !template.appliesToModes?.length || template.appliesToModes.includes(rulesForm.gameMode)
    );
  }, [catalog.templates, rulesForm.gameMode]);

  if (!challenge) {
    return (
      <EmptyState
        icon={<TrophyIcon />}
        title="Sélectionnez un défi"
        description="Choisissez un défi dans la liste pour voir le classement, les règles, les récompenses et la visibilité."
      />
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rounded" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  const handleFormChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveInfos = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        goalAmount: Number(form.goalAmount),
        contributionAmount: Number(form.contributionAmount) || 0,
        contributionFrequency: form.contributionFrequency,
        startDate: form.startDate,
        endDate: form.endDate,
        maxParticipants: Number(form.maxParticipants) || 0,
        featured: Boolean(form.featured),
        prizeDescription: form.prizeDescription.trim(),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      };

      const res = await ChallengesApi.updateChallenge(challenge._id, payload, token);
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Erreur lors de la mise à jour', { position: 'top-right' });
        return;
      }

      toast.success('Défi mis à jour', { position: 'top-right' });
      onUpdated?.(extractData(res));
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Erreur lors de la mise à jour', { position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      const res = challenge.isPublished
        ? await ChallengesApi.unpublishChallenge(challenge._id, token)
        : await ChallengesApi.publishChallenge(challenge._id, token);

      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Action impossible', { position: 'top-right' });
        return;
      }

      toast.success(
        challenge.isPublished ? 'Défi masqué de l’app' : 'Défi visible dans l’app',
        { position: 'top-right' }
      );
      onUpdated?.(extractData(res) || { ...challenge, isPublished: !challenge.isPublished });
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Action impossible', { position: 'top-right' });
    } finally {
      setPublishing(false);
      setPublishConfirmOpen(false);
    }
  };

  const handleConfirmPublish = () => {
    handleTogglePublish();
  };

  const handleGameModeChange = (gameMode) => {
    const templates = (catalog.templates || []).filter(
      (template) => !template.appliesToModes?.length || template.appliesToModes.includes(gameMode)
    );

    const nextRules = templates.map((template) => {
      const existing = rulesForm.rules.find((rule) => rule.slug === template.slug);
      return {
        slug: template.slug,
        enabled: existing ? existing.enabled !== false : true,
        value: existing?.value ?? template.defaultValue ?? 0,
        name: template.name,
        description: template.description,
        category: template.category,
        valueType: template.valueType,
        min: template.min,
        max: template.max,
        defaultValue: template.defaultValue,
        appliesToModes: template.appliesToModes || []
      };
    });

    setRulesForm({ gameMode, rules: nextRules });
  };

  const handleRuleChange = (slug, field, value) => {
    setRulesForm((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => (rule.slug === slug ? { ...rule, [field]: value } : rule))
    }));
  };

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      const res = await ChallengesApi.updateChallengeRules(
        challenge._id,
        {
          gameMode: rulesForm.gameMode,
          rules: rulesForm.rules.map((rule) => ({
            slug: rule.slug,
            enabled: rule.enabled !== false,
            value: Number(rule.value) || 0
          }))
        },
        token
      );

      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Erreur règles', { position: 'top-right' });
        return;
      }

      toast.success('Fonctionnement mis à jour', { position: 'top-right' });
      onUpdated?.(extractData(res));
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Erreur lors de l’enregistrement', { position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrizeChange = (index, field, value) => {
    setPrizes((prev) => prev.map((prize, i) => (i === index ? { ...prize, [field]: value } : prize)));
  };

  const handleAddPrize = () => {
    setPrizes((prev) => [
      ...prev,
      {
        rank: prev.length + 1,
        title: `Récompense ${prev.length + 1}`,
        description: '',
        amount: 0,
        prizeType: 'custom',
        badgeSlug: ''
      }
    ]);
    setWinnerCount((prev) => Math.max(prev, prizes.length + 1));
  };

  const handleRemovePrize = (index) => {
    setPrizes((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((prize, i) => ({ ...prize, rank: i + 1 }))
    );
  };

  const handleSavePrizes = async () => {
    setSaving(true);
    try {
      const res = await ChallengesApi.updateWinnerPrizes(
        challenge._id,
        {
          winnerCount: Math.max(Number(winnerCount) || prizes.length || 1, 1),
          winnerPrizes: prizes.map((prize, index) => ({
            rank: Number(prize.rank) || index + 1,
            title: prize.title || `Récompense ${index + 1}`,
            description: prize.description || '',
            amount: Number(prize.amount) || 0,
            prizeType: prize.prizeType || 'custom',
            badgeSlug: prize.badgeSlug || undefined
          }))
        },
        token
      );

      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Erreur récompenses', { position: 'top-right' });
        return;
      }

      toast.success('Récompenses mises à jour', { position: 'top-right' });
      const data = extractData(res);
      onUpdated?.({
        ...challenge,
        winnerCount: data?.winnerCount ?? winnerCount,
        winnerPrizes: data?.winnerPrizes ?? prizes
      });
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Erreur prix', { position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  const progress = challenge.goalAmount
    ? Math.min(100, Math.round((Number(challenge.totalSaved || 0) / Number(challenge.goalAmount)) * 100))
    : 0;

  const rulesToShow = rulesForm.rules.length
    ? rulesForm.rules
    : applicableTemplates.map((template) => ({
        slug: template.slug,
        enabled: true,
        value: template.defaultValue ?? 0,
        name: template.name,
        description: template.description,
        category: template.category,
        valueType: template.valueType,
        min: template.min,
        max: template.max,
        defaultValue: template.defaultValue,
        appliesToModes: template.appliesToModes || []
      }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
      <DetailHeader>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
          <Box className="min-w-0 flex-1">
            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
              {challenge.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {getGameModeLabel(challenge.gameMode)} · {formatDate(challenge.startDate)} → {formatDate(challenge.endDate)}
            </Typography>
            <Box mt={1.5}>
              <StatusBadge status={challenge.status} published={challenge.isPublished} featured={challenge.featured} />
            </Box>
          </Box>

          <PrimaryButton
            startIcon={challenge.isPublished ? <UnpublishIcon /> : <PublishIcon />}
            onClick={() => setPublishConfirmOpen(true)}
            disabled={publishing || challenge.status === 'completed' || challenge.status === 'cancelled'}
            sx={{
              bgcolor: challenge.isPublished ? SSS_COLORS.warning : SSS_COLORS.success,
              '&:hover': {
                bgcolor: challenge.isPublished ? '#b7791f' : '#2d8a66'
              }
            }}
          >
            {publishing ? '…' : challenge.isPublished ? 'Masquer de l’app' : 'Rendre visible'}
          </PrimaryButton>
        </Box>

        <Box mt={3} className="rounded-2xl border border-sss-border bg-white/80 p-4 backdrop-blur-sm">
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Progression · {challenge.participantCount || 0} participant
              {(challenge.participantCount || 0) > 1 ? 's' : ''}
            </Typography>
            <Typography variant="caption" fontWeight={800} sx={{ color: SSS_COLORS.brand }}>
              {progress}%
            </Typography>
          </Box>
          <div className="admin-progress-track">
            <div className="admin-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {formatAmount(challenge.totalSaved, challenge.idDevise)} / {formatAmount(challenge.goalAmount, challenge.idDevise)}
          </Typography>
        </Box>
      </DetailHeader>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          px: { xs: 1.5, sm: 2 },
          pt: 1.5,
          minHeight: 48,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#fcfcff',
          '& .MuiTabs-indicator': { display: 'none' },
          '& .MuiTab-root': {
            minHeight: 36,
            py: 0.75,
            px: 1.75,
            mr: 0.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderRadius: 2,
            color: 'text.secondary',
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              bgcolor: SSS_COLORS.brand,
              color: '#fff',
              boxShadow: `0 4px 12px ${SSS_COLORS.brand}40`
            },
            '&:hover:not(.Mui-selected)': {
              bgcolor: `${SSS_COLORS.brand}0a`,
              color: SSS_COLORS.brand
            }
          }
        }}
      >
        <Tab label="Infos" />
        <Tab label="Classement" />
        <Tab label="Versements manqués" />
        <Tab label="Comment ça marche" />
        <Tab label="Récompenses" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <TabPanel value={tab} index={0}>
          {challenge.status === 'completed' && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              Un défi terminé ne peut plus être modifié.
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Nom"
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                minRows={2}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Objectif d’épargne"
                value={form.goalAmount}
                onChange={(e) => handleFormChange('goalAmount', e.target.value)}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Montant à verser"
                value={form.contributionAmount}
                onChange={(e) => handleFormChange('contributionAmount', e.target.value)}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" disabled={challenge.status === 'completed'}>
                <InputLabel>Fréquence des versements</InputLabel>
                <Select
                  value={form.contributionFrequency}
                  label="Fréquence des versements"
                  onChange={(e) => handleFormChange('contributionFrequency', e.target.value)}
                >
                  {FREQUENCIES.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Nombre max. de participants (0 = illimité)"
                value={form.maxParticipants}
                onChange={(e) => handleFormChange('maxParticipants', e.target.value)}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date de début"
                value={form.startDate}
                onChange={(e) => handleFormChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date de fin"
                value={form.endDate}
                onChange={(e) => handleFormChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Mots-clés (séparés par une virgule)"
                value={form.tags}
                onChange={(e) => handleFormChange('tags', e.target.value)}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description des récompenses"
                value={form.prizeDescription}
                onChange={(e) => handleFormChange('prizeDescription', e.target.value)}
                disabled={challenge.status === 'completed'}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.featured}
                    onChange={(e) => handleFormChange('featured', e.target.checked)}
                    disabled={challenge.status === 'completed'}
                  />
                }
                label="Mettre en avant sur l’accueil de l’app"
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <PrimaryButton startIcon={<SaveIcon />} onClick={handleSaveInfos} disabled={saving || challenge.status === 'completed'}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </PrimaryButton>
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <RankingPanel challenge={challenge} token={token} onMemberAction={() => onUpdated?.(challenge)} />
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <MissedPaymentsPanel challenge={challenge} token={token} />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={challenge.status === 'completed'}>
            <InputLabel>Type de défi</InputLabel>
            <Select
              value={rulesForm.gameMode}
              label="Type de défi"
              onChange={(e) => handleGameModeChange(e.target.value)}
            >
              {GAME_MODES.map((mode) => (
                <MenuItem key={mode.value} value={mode.value}>
                  {mode.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            {modeMeta.description}
          </Alert>

          {rulesToShow.map((rule) => (
            <Accordion
              key={rule.slug}
              disableGutters
              className="admin-accordion mb-2 !rounded-2xl"
              sx={{ '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1} gap={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {rule.name || rule.slug}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {RULE_CATEGORY_LABELS[rule.category] || rule.category || 'Règle'}
                      {rule.valueType ? ` · ${VALUE_TYPE_LABELS[rule.valueType] || rule.valueType}` : ''}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={0.75} alignItems="center" flexShrink={0}>
                    <Chip size="small" label={formatRuleValue(rule)} color="primary" variant="outlined" />
                    <Chip
                      size="small"
                      label={rule.enabled !== false ? 'Active' : 'Désactivée'}
                      color={rule.enabled !== false ? 'success' : 'default'}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                  {rule.description || 'Aucune description disponible pour cette règle.'}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Valeur actuelle
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {formatRuleValue(rule)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Défaut
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatRuleValue({ ...rule, value: rule.defaultValue })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Plage autorisée
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatRuleBounds(rule)}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.enabled !== false}
                          onChange={(e) => handleRuleChange(rule.slug, 'enabled', e.target.checked)}
                          disabled={challenge.status === 'completed'}
                        />
                      }
                      label="Règle activée pour ce défi"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {rule.valueType === 'boolean' ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(Number(rule.value))}
                            onChange={(e) => handleRuleChange(rule.slug, 'value', e.target.checked ? 1 : 0)}
                            disabled={challenge.status === 'completed' || rule.enabled === false}
                          />
                        }
                        label={Number(rule.value) ? 'Oui' : 'Non'}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={rule.valueType === 'percent' ? 'Valeur pour ce défi (%)' : 'Valeur pour ce défi'}
                        value={rule.value}
                        onChange={(e) => handleRuleChange(rule.slug, 'value', e.target.value)}
                        disabled={challenge.status === 'completed' || rule.enabled === false}
                        helperText={`Entre ${rule.min ?? 0} et ${rule.max != null ? rule.max : '∞'}${
                          rule.valueType === 'percent' ? ' %' : ''
                        }`}
                        inputProps={{
                          min: rule.min,
                          max: rule.max
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <PrimaryButton startIcon={<SaveIcon />} onClick={handleSaveRules} disabled={saving || challenge.status === 'completed'}>
              {saving ? 'Enregistrement…' : 'Enregistrer le fonctionnement'}
            </PrimaryButton>
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={4}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Nombre de gagnants"
                value={winnerCount}
                onChange={(e) => setWinnerCount(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} display="flex" alignItems="center" justifyContent="flex-end">
              <GhostButton startIcon={<AddIcon />} onClick={handleAddPrize} size="small">
                Ajouter une récompense
              </GhostButton>
            </Grid>
          </Grid>

          {prizes.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Aucune récompense définie. Ajoutez-en ou enregistrez pour générer les valeurs par défaut.
            </Alert>
          )}

          {prizes.map((prize, index) => (
            <Box
              key={`prize-${index}`}
              className="admin-preset-card mb-3"
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Place #{prize.rank || index + 1}
                </Typography>
                <IconButton size="small" color="error" onClick={() => setPrizeToRemove(index)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Titre"
                    value={prize.title}
                    onChange={(e) => handlePrizeChange(index, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type de récompense</InputLabel>
                    <Select
                      value={prize.prizeType}
                      label="Type de récompense"
                      onChange={(e) => handlePrizeChange(index, 'prizeType', e.target.value)}
                    >
                      {Object.entries(PRIZE_TYPE_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Montant"
                    value={prize.amount}
                    onChange={(e) => handlePrizeChange(index, 'amount', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Code du badge (optionnel)"
                    value={prize.badgeSlug}
                    onChange={(e) => handlePrizeChange(index, 'badgeSlug', e.target.value)}
                    helperText="Laisser vide si pas de badge"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    value={prize.description}
                    onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="flex-end">
            <PrimaryButton startIcon={<SaveIcon />} onClick={handleSavePrizes} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer les récompenses'}
            </PrimaryButton>
          </Box>
        </TabPanel>
      </Box>

      <ConfirmDialog
        open={publishConfirmOpen}
        title={challenge.isPublished ? 'Masquer ce défi ?' : 'Rendre ce défi visible ?'}
        message={
          challenge.isPublished
            ? `Le défi « ${challenge.name} » ne sera plus visible dans l’application. Les participants déjà inscrits restent membres.`
            : `Le défi « ${challenge.name} » sera visible dans l’application. Les utilisateurs avec la même devise recevront une notification.`
        }
        confirmLabel={challenge.isPublished ? 'Masquer' : 'Rendre visible'}
        confirmColor={challenge.isPublished ? 'warning' : 'success'}
        loading={publishing}
        onConfirm={handleConfirmPublish}
        onCancel={() => setPublishConfirmOpen(false)}
      />

      <ConfirmDialog
        open={prizeToRemove != null}
        title="Supprimer cette récompense ?"
        message={
          prizeToRemove != null
            ? `La récompense « ${prizes[prizeToRemove]?.title || `Place #${prizes[prizeToRemove]?.rank || prizeToRemove + 1}`} » sera retirée de la liste. Enregistrez pour appliquer le changement.`
            : ''
        }
        confirmLabel="Supprimer"
        confirmColor="error"
        onConfirm={() => {
          if (prizeToRemove != null) {
            handleRemovePrize(prizeToRemove);
            setPrizeToRemove(null);
          }
        }}
        onCancel={() => setPrizeToRemove(null)}
      />
    </Box>
  );
};

ChallengeDetailPanel.propTypes = {
  challenge: PropTypes.object,
  token: PropTypes.string,
  onUpdated: PropTypes.func
};

export default ChallengeDetailPanel;
