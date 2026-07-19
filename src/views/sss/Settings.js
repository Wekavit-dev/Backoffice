import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Snackbar,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  CloudDownload as BackfillIcon,
  Tune as TuneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  PeopleAlt as PeopleAltIcon,
  NotificationsActive as NotificationsActiveIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  History as HistoryIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  PlayArrow as RocketIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { PageToolbar, PrimaryButton, GhostButton, SSS_COLORS } from './components/SssLayout';

const cronToTime = (cron) => {
  const parts = String(cron || '').trim().split(/\s+/);
  if (parts.length >= 2) {
    const minute = Number(parts[0]);
    const hour = Number(parts[1]);
    if (Number.isFinite(minute) && Number.isFinite(hour)) {
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
  }
  return '05:30';
};

const timeToCron = (hhmm) => {
  const [hour, minute] = String(hhmm || '05:30').split(':');
  return `${Number(minute) || 0} ${Number(hour) || 0} * * 1-5`;
};

const FIELD_LABELS = {
  'flags.enabled': 'Module activé',
  'flags.autoBoard': 'Liste automatique',
  'flags.ignoreLost': 'Ignorer comptes perdus',
  'board.cronExpression': 'Heure de préparation',
  'board.timezone': 'Fuseau horaire',
  'lifecycle.newAccountGraceDays': 'Compte inactif après',
  'lifecycle.dormantMinDays': 'En pause après',
  'lifecycle.reactivateMinDays': 'À réveiller après',
  'lifecycle.neverDepositedAlertHours': 'Alerte jamais déposé',
  'lifecycle.lostMinDays': 'Inactif longtemps après',
  'board.maxTasksPerDay': 'Actions max / jour',
  'board.maxCarry': 'Reports max',
  'board.recentContactHours': 'Délai entre contacts',
  'alerts.pendingDepositStuckHours': 'Dépôt en attente',
  'alerts.idleBalanceMinDays': 'Argent qui dort',
  'alerts.highValueMinUsd': 'Client important (USD)'
};

const SectionCard = ({ title, hint, icon, tone = SSS_COLORS.brand, children, badge }) => (
  <section className="sss-surface relative h-full overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${tone}, ${tone}66)` }} />
    <div className="flex items-start justify-between gap-3 border-b border-sss-border px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl [&>svg]:text-[1.15rem]"
          style={{ backgroundColor: `${tone}1a`, color: tone }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="m-0 text-base font-bold text-sss-text">{title}</h3>
          {hint && <p className="sss-muted m-0 mt-0.5 text-xs leading-relaxed">{hint}</p>}
        </div>
      </div>
      {badge}
    </div>
    <div className="space-y-4 px-4 py-4 sm:px-5">{children}</div>
  </section>
);

const Field = ({ label, description, children }) => (
  <div>
    <label className="mb-1 block text-sm font-bold text-sss-text">{label}</label>
    {description && <p className="sss-muted m-0 mb-2 text-xs leading-relaxed">{description}</p>}
    {children}
  </div>
);

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' }
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { globalState } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [config, setConfig] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [modifiedFields, setModifiedFields] = useState([]);

  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const res = await SssApi.getConfig(globalState.key);
      if (res?.status === 200) {
        setConfig(res.data?.data || res.data || null);
        setModifiedFields([]);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les réglages');
      setSnackbar({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (path, value) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cursor = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        if (!cursor[parts[i]]) cursor[parts[i]] = {};
        cursor = cursor[parts[i]];
      }
      cursor[parts[parts.length - 1]] = value;
      return next;
    });
    setModifiedFields((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const handleSave = async () => {
    if (!config || !globalState?.key) return;
    setSaving(true);
    try {
      const payload = {
        flags: config.flags,
        lifecycle: config.lifecycle,
        alerts: config.alerts,
        board: {
          maxTasksPerDay: config.board?.maxTasksPerDay,
          maxCarry: config.board?.maxCarry,
          recentContactHours: config.board?.recentContactHours,
          cronExpression: config.board?.cronExpression,
          timezone: config.board?.timezone,
          bucketQuotas: config.board?.bucketQuotas
        },
        priority: config.priority,
        health: config.health
      };
      const res = await SssApi.updateConfig(payload, globalState.key);
      if (res?.status === 200) {
        toast.success('Réglages enregistrés');
        setConfig(res.data?.data || config);
        setModifiedFields([]);
        setSaveDialogOpen(false);
        setSnackbar({ open: true, message: 'Réglages enregistrés', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || "Échec de l'enregistrement");
      setSnackbar({ open: true, message: "Erreur lors de l'enregistrement", severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleBackfill = async () => {
    if (!globalState?.key) return;
    setBackfilling(true);
    try {
      const res = await SssApi.runBackfill({ async: 'true' }, globalState.key);
      if (res?.status === 202 || res?.status === 200) {
        toast.success(res.data?.message || 'Initialisation lancée');
        setSnackbar({ open: true, message: 'Initialisation lancée', severity: 'success' });
      } else {
        toast.error(res?.data?.message || 'Échec');
      }
    } catch (err) {
      if (err?.status === 202) {
        toast.success(err?.data?.message || 'Initialisation lancée');
        setSnackbar({ open: true, message: 'Initialisation lancée', severity: 'success' });
      } else {
        toast.error(err?.data?.message || err?.message || 'Échec');
        setSnackbar({ open: true, message: "Erreur lors de l'initialisation", severity: 'error' });
      }
    } finally {
      setBackfilling(false);
    }
  };

  if (loading) {
    return (
      <MainCard contentSX={{ p: { xs: 2, sm: 3 }, bgcolor: SSS_COLORS.pageBg }}>
        <div className="sss-page">
          <div className="h-1.5 overflow-hidden rounded-full bg-sss-brand-soft">
            <div className="h-full w-1/3 animate-sss-shimmer rounded-full bg-sss-brand" />
          </div>
          <p className="sss-muted mt-3 text-sm">Chargement des réglages…</p>
        </div>
      </MainCard>
    );
  }

  if (!config) {
    return (
      <MainCard contentSX={{ p: { xs: 2, sm: 3 }, bgcolor: SSS_COLORS.pageBg }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <GhostButton size="small" onClick={load}>
              Réessayer
            </GhostButton>
          }
        >
          Réglages indisponibles.
        </Alert>
      </MainCard>
    );
  }

  const prepTime = cronToTime(config.board?.cronExpression);
  const hasUnsavedChanges = modifiedFields.length > 0;
  const moduleOn = Boolean(config.flags?.enabled);

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5, md: 3 }, bgcolor: SSS_COLORS.pageBg }}>
      <div className="sss-page pb-24">
        <PageToolbar
          icon={<TuneIcon />}
          title="Réglages"
          subtitle="Pilotez qui apparaît dans la liste du jour, quand elle est préparée, et les seuils d’inactivité. Les valeurs par défaut conviennent déjà à Wekavit."
          actions={
            <>
              <GhostButton startIcon={<RefreshIcon />} onClick={load} disabled={loading || saving}>
                Actualiser
              </GhostButton>
              <PrimaryButton
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                disabled={saving || !hasUnsavedChanges}
              >
                Enregistrer
                {hasUnsavedChanges ? ` (${modifiedFields.length})` : ''}
              </PrimaryButton>
            </>
          }
        />

        {/* Status strip */}
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sss-surface flex items-center gap-3 p-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: moduleOn ? SSS_COLORS.successSoft : SSS_COLORS.errorSoft,
                color: moduleOn ? SSS_COLORS.success : SSS_COLORS.error
              }}
            >
              <PowerSettingsNewIcon />
            </span>
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-sss-muted">Module</p>
              <p className="m-0 text-sm font-extrabold text-sss-text">{moduleOn ? 'Activé' : 'Désactivé'}</p>
            </div>
          </div>
          <div className="sss-surface flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sss-info-soft text-sss-info">
              <ScheduleIcon />
            </span>
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-sss-muted">Préparation</p>
              <p className="m-0 text-sm font-extrabold text-sss-text">
                {prepTime} · {config.board?.timezone || 'Africa/Bujumbura'}
              </p>
            </div>
          </div>
          <div className="sss-surface flex items-center gap-3 p-4">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: hasUnsavedChanges ? SSS_COLORS.warningSoft : SSS_COLORS.successSoft,
                color: hasUnsavedChanges ? SSS_COLORS.warning : SSS_COLORS.success
              }}
            >
              {hasUnsavedChanges ? <WarningIcon /> : <CheckCircleIcon />}
            </span>
            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-sss-muted">État</p>
              <p className="m-0 text-sm font-extrabold text-sss-text">
                {hasUnsavedChanges ? `${modifiedFields.length} modif. en attente` : 'Tout est enregistré'}
              </p>
            </div>
          </div>
        </div>

        {/* Getting started */}
        <section className="sss-surface-soft mb-5 overflow-hidden p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sss-brand shadow-sss-sm">
                <RocketIcon />
              </span>
              <div className="min-w-0">
                <h2 className="m-0 text-base font-bold text-sss-text sm:text-lg">Mise en route</h2>
                <p className="sss-muted m-0 mt-1 text-sm leading-relaxed">
                  1) Initialisez les profils · 2) Vérifiez les réglages essentiels · 3) Préparez la liste du jour.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <PrimaryButton
                startIcon={backfilling ? <CircularProgress size={16} color="inherit" /> : <BackfillIcon />}
                onClick={handleBackfill}
                disabled={backfilling}
              >
                {backfilling ? 'Initialisation…' : 'Initialiser les profils'}
              </PrimaryButton>
              <GhostButton startIcon={<TodayIcon />} onClick={() => navigate('/wekavit/sss')}>
                Vue du jour
              </GhostButton>
            </div>
          </div>
        </section>

        {/* Init detail */}
        <section className="sss-surface mb-5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sss-info-soft text-sss-info">
                <PeopleAltIcon />
              </span>
              <div>
                <h3 className="m-0 text-base font-bold text-sss-text">Initialiser toutes les personnes</h3>
                <p className="sss-muted m-0 mt-1 max-w-2xl text-sm leading-relaxed">
                  Crée le suivi SSS pour les comptes déjà inscrits. Peut prendre quelques minutes selon le volume.
                </p>
              </div>
            </div>
            <GhostButton startIcon={<BackfillIcon />} onClick={handleBackfill} disabled={backfilling}>
              {backfilling ? 'En cours…' : 'Lancer'}
            </GhostButton>
          </div>
        </section>

        {/* Essential settings */}
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="sss-section-title m-0">Réglages essentiels</h2>
            <p className="sss-muted m-0 mt-1 text-sm">Les paramètres du quotidien, clairement groupés.</p>
          </div>
        </div>

        <Grid container spacing={2.5} className="mb-5">
          <Grid item xs={12} md={4}>
            <SectionCard
              title="Activation"
              hint="Allumez ou éteignez le module et l’automatisation"
              icon={<PowerSettingsNewIcon />}
              tone={SSS_COLORS.brand}
            >
              <Field label="Module activé">
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(config.flags?.enabled)}
                      onChange={(e) => patch('flags.enabled', e.target.checked)}
                      color="success"
                    />
                  }
                  label={config.flags?.enabled ? 'Activé' : 'Désactivé'}
                />
              </Field>
              <Field
                label="Préparer la liste automatiquement"
                description="Chaque matin ouvré, la liste du jour est générée"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(config.flags?.autoBoard)}
                      onChange={(e) => patch('flags.autoBoard', e.target.checked)}
                    />
                  }
                  label={config.flags?.autoBoard ? 'Activé' : 'Désactivé'}
                />
              </Field>
              <Field
                label="Ignorer les comptes très inactifs"
                description="Évite de remonter les profils perdus depuis longtemps"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(config.flags?.ignoreLost)}
                      onChange={(e) => patch('flags.ignoreLost', e.target.checked)}
                    />
                  }
                  label={config.flags?.ignoreLost ? 'Activé' : 'Désactivé'}
                />
              </Field>
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <SectionCard
              title="Horaire"
              hint="Quand la liste du jour est préparée"
              icon={<ScheduleIcon />}
              tone={SSS_COLORS.info}
            >
              <Field label="Heure de préparation" description="Du lundi au vendredi">
                <TextField
                  type="time"
                  size="small"
                  fullWidth
                  value={prepTime}
                  onChange={(e) => patch('board.cronExpression', timeToCron(e.target.value))}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Field>
              <Field label="Fuseau horaire">
                <TextField
                  size="small"
                  fullWidth
                  value={config.board?.timezone || 'Africa/Bujumbura'}
                  onChange={(e) => patch('board.timezone', e.target.value)}
                  sx={fieldSx}
                />
              </Field>
              <div className="rounded-xl border border-sss-info/20 bg-sss-info-soft/70 px-3 py-2 text-xs text-sss-text">
                <InfoIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5, color: SSS_COLORS.info }} />
                Préparation automatique les jours ouvrés uniquement.
              </div>
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <SectionCard
              title="Délais d’inactivité"
              hint="Quand un profil change d’étape automatiquement"
              icon={<TimerIcon />}
              tone={SSS_COLORS.warning}
              badge={
                (config.lifecycle?.dormantMinDays ?? 14) > 14 ? (
                  <Chip label="Ajusté" size="small" color="warning" sx={{ fontWeight: 700 }} />
                ) : null
              }
            >
              <Field label="Compte inactif après (jours)" description="Sans dépôt depuis l’inscription">
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={config.lifecycle?.newAccountGraceDays ?? 7}
                  onChange={(e) => patch('lifecycle.newAccountGraceDays', Number(e.target.value))}
                  inputProps={{ min: 0, max: 30 }}
                  sx={fieldSx}
                />
              </Field>
              <Field label="En pause après (jours)" description="Aucune activité récente">
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={config.lifecycle?.dormantMinDays ?? 14}
                  onChange={(e) => patch('lifecycle.dormantMinDays', Number(e.target.value))}
                  inputProps={{ min: 0, max: 60 }}
                  sx={fieldSx}
                />
              </Field>
              <Field label="À réveiller après (jours)" description="Inactif depuis trop longtemps">
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={config.lifecycle?.reactivateMinDays ?? 30}
                  onChange={(e) => patch('lifecycle.reactivateMinDays', Number(e.target.value))}
                  inputProps={{ min: 0, max: 90 }}
                  sx={fieldSx}
                />
              </Field>
            </SectionCard>
          </Grid>
        </Grid>

        {/* Advanced */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-sss-brand/20 bg-white px-4 py-2.5 text-sm font-bold text-sss-brand shadow-sss-sm transition hover:border-sss-brand hover:bg-sss-brand-soft"
          >
            {advancedOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            {advancedOpen ? 'Masquer' : 'Afficher'} les réglages avancés
            <Chip label="8 paramètres" size="small" sx={{ height: 20, fontWeight: 700, ml: 0.5 }} />
          </button>
        </div>

        <Collapse in={advancedOpen} timeout="auto">
          <Grid container spacing={2.5} className="mb-5">
            <Grid item xs={12} md={4}>
              <SectionCard title="Limites de la liste" icon={<SpeedIcon />} tone={SSS_COLORS.brand}>
                <Field label="Actions max par jour" description="Cap de contacts quotidiens">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.board?.maxTasksPerDay ?? 40}
                    onChange={(e) => patch('board.maxTasksPerDay', Number(e.target.value))}
                    inputProps={{ min: 1, max: 100 }}
                    sx={fieldSx}
                  />
                </Field>
                <Field label="Reports max avant abandon" description="Combien de reports avant d’abandonner">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.board?.maxCarry ?? 5}
                    onChange={(e) => patch('board.maxCarry', Number(e.target.value))}
                    inputProps={{ min: 1, max: 20 }}
                    sx={fieldSx}
                  />
                </Field>
                <Field label="Délai entre deux contacts (h)" description="Ne pas recontacter trop tôt">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.board?.recentContactHours ?? 48}
                    onChange={(e) => patch('board.recentContactHours', Number(e.target.value))}
                    inputProps={{ min: 1, max: 168 }}
                    sx={fieldSx}
                  />
                </Field>
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <SectionCard title="Seuils d’alerte" icon={<NotificationsActiveIcon />} tone={SSS_COLORS.warning}>
                <Field label="Alerte « jamais déposé » (h)">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.lifecycle?.neverDepositedAlertHours ?? 48}
                    onChange={(e) => patch('lifecycle.neverDepositedAlertHours', Number(e.target.value))}
                    inputProps={{ min: 1, max: 168 }}
                    sx={fieldSx}
                  />
                </Field>
                <Field label="Dépôt en attente bloqué (h)">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.alerts?.pendingDepositStuckHours ?? 24}
                    onChange={(e) => patch('alerts.pendingDepositStuckHours', Number(e.target.value))}
                    inputProps={{ min: 1, max: 72 }}
                    sx={fieldSx}
                  />
                </Field>
                <Field label="Argent qui dort (jours)">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.alerts?.idleBalanceMinDays ?? 3}
                    onChange={(e) => patch('alerts.idleBalanceMinDays', Number(e.target.value))}
                    inputProps={{ min: 1, max: 30 }}
                    sx={fieldSx}
                  />
                </Field>
                <Field label="Client important (USD)">
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.alerts?.highValueMinUsd ?? 150}
                    onChange={(e) => patch('alerts.highValueMinUsd', Number(e.target.value))}
                    inputProps={{ min: 0, max: 10000 }}
                    sx={fieldSx}
                  />
                </Field>
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <SectionCard title="Inactivité longue" icon={<HistoryIcon />} tone={SSS_COLORS.error}>
                <Field
                  label="Inactif longtemps après (jours)"
                  description="Seuil avant de considérer le compte perdu"
                >
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={config.lifecycle?.lostMinDays ?? 90}
                    onChange={(e) => patch('lifecycle.lostMinDays', Number(e.target.value))}
                    inputProps={{ min: 30, max: 365 }}
                    sx={fieldSx}
                  />
                </Field>
                <div className="rounded-xl border border-sss-border bg-sss-page p-3 text-xs leading-relaxed text-sss-muted">
                  Les poids avancés (priorité, santé) restent disponibles via l’API. Cette page montre les réglages
                  utiles au quotidien.
                </div>
              </SectionCard>
            </Grid>
          </Grid>
        </Collapse>

        {/* Sticky save bar */}
        <div
          className={`fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 backdrop-blur transition-all ${
            hasUnsavedChanges
              ? 'border-sss-warning/30 bg-sss-warning-soft/95'
              : 'border-sss-border bg-white/95'
          }`}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm">
              {hasUnsavedChanges ? (
                <>
                  <WarningIcon sx={{ fontSize: 18, color: SSS_COLORS.warning }} />
                  <span className="font-semibold text-sss-text">
                    {modifiedFields.length} modification{modifiedFields.length > 1 ? 's' : ''} non enregistrée
                    {modifiedFields.length > 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircleIcon sx={{ fontSize: 18, color: SSS_COLORS.success }} />
                  <span className="font-semibold text-sss-text">Tous les réglages sont à jour</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <GhostButton onClick={load} disabled={saving}>
                Annuler les changements
              </GhostButton>
              <PrimaryButton
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                disabled={saving || !hasUnsavedChanges}
              >
                Enregistrer
              </PrimaryButton>
            </div>
          </div>
        </div>

        <Dialog
          open={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Confirmer l’enregistrement</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Vous allez enregistrer {modifiedFields.length} modification
              {modifiedFields.length > 1 ? 's' : ''}.
            </Typography>
            <div className="flex flex-wrap gap-1.5">
              {modifiedFields.map((field) => (
                <Chip
                  key={field}
                  label={FIELD_LABELS[field] || field}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </div>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            <GhostButton onClick={() => setSaveDialogOpen(false)} disabled={saving}>
              Annuler
            </GhostButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            >
              {saving ? 'Enregistrement…' : 'Confirmer'}
            </PrimaryButton>
          </DialogActions>
        </Dialog>

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
      </div>
    </MainCard>
  );
};

export default SettingsPage;
