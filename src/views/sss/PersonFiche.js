import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  Grid,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  PeopleAlt as PeopleAltIcon,
  Wallet as WalletIcon,
  Savings as SavingsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Flag as FlagIcon,
  PersonAdd as PersonAddIcon,
  AutoAwesome as AutoAwesomeIcon
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
  whatsappHref,
  maskPhone
} from './labels';
import { AlertChips, EmptyState, PersonAvatar, StageChip, StatusChip, UrgencyChip } from './components/Chips';
import HealthMeter from './components/HealthMeter';
import { GhostButton, PrimaryButton, SSS_COLORS } from './components/SssLayout';

const Row = ({ label, value, tone, icon }) => (
  <div className="flex items-start justify-between gap-3 border-b border-sss-border/80 py-2.5 last:border-0">
    <div className="flex min-w-0 items-center gap-2 text-sm text-sss-muted">
      {icon && <span className="inline-flex text-sss-muted [&>svg]:text-[1rem]">{icon}</span>}
      <span>{label}</span>
    </div>
    <div
      className="max-w-[55%] text-right text-sm font-semibold text-sss-text"
      style={tone ? { color: tone } : undefined}
    >
      {value ?? '—'}
    </div>
  </div>
);

const SectionCard = ({ title, icon, children, action, hint, tone = SSS_COLORS.brand }) => (
  <section className="sss-surface h-full overflow-hidden">
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
          {hint && <p className="sss-muted m-0 mt-0.5 text-xs">{hint}</p>}
        </div>
      </div>
      {action}
    </div>
    <div className="px-4 py-3 sm:px-5 sm:py-4">{children}</div>
  </section>
);

const NoteItem = ({ note, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const long = (note.body || '').length > 120;

  return (
    <article className="rounded-2xl border border-sss-border bg-sss-page/70 p-3.5">
      <p
        className={`m-0 whitespace-pre-wrap text-sm leading-relaxed text-sss-text ${
          !expanded && long ? 'line-clamp-3' : ''
        }`}
      >
        {note.body}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-sss-muted">{note.authorName || 'Admin'}</span>
        <span className="text-xs text-sss-muted">·</span>
        <span className="text-xs text-sss-muted">{formatDateFr(note.createdAt)}</span>
        {long && (
          <button
            type="button"
            className="ml-auto text-xs font-bold text-sss-brand"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Réduire' : 'Lire plus'}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="rounded-lg p-1 text-sss-muted hover:bg-sss-error-soft hover:text-sss-error"
            onClick={() => onDelete(note._id)}
            aria-label="Supprimer la note"
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </button>
        )}
      </div>
    </article>
  );
};

const TaskItem = ({ task }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-sss-border bg-white px-3.5 py-3">
    <div className="min-w-0">
      <div className="truncate text-sm font-bold text-sss-text">
        {ACTION_LABELS[task.actionType] || task.actionType}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-sss-muted">
        <span>{task.date || '—'}</span>
        {task.outcome && (
          <>
            <span>·</span>
            <span>{OUTCOME_LABELS[task.outcome] || task.outcome}</span>
          </>
        )}
      </div>
    </div>
    <StatusChip status={task.status} size="small" />
  </div>
);

const TabPanel = ({ children, value, index }) => (
  <Fade in={value === index} timeout={250}>
    <div hidden={value !== index} className={value === index ? 'animate-sss-fade-up' : ''}>
      {value === index && children}
    </div>
  </Fade>
);

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
        const data = res.data?.data || res.data;
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

  const identity = fiche?.identity || {};
  const situation = fiche?.situation || {};
  const savings = fiche?.savings || {};
  const deposits = fiche?.deposits || {};
  const balance = fiche?.balance || {};
  const engagement = fiche?.engagement || {};
  const nba = fiche?.nextBestAction || {};
  const isUrgent = situation.urgency === 'critical' || situation.urgency === 'high';

  const notify = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleSaveStage = async () => {
    setSaving(true);
    try {
      const res = await SssApi.overrideStage(
        id,
        { stage: stageDraft, reason: stageReason || undefined },
        globalState.key
      );
      if (res?.status === 200) {
        toast.success('Étape mise à jour');
        setStageReason('');
        await load();
        notify('Étape mise à jour');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      notify('Erreur lors de la mise à jour', 'error');
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
        notify('Action mise à jour');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      notify('Erreur lors de la mise à jour', 'error');
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
        notify('Note ajoutée');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      notify("Erreur lors de l'ajout", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSnooze = async () => {
    setSaving(true);
    try {
      const res = await SssApi.snoozeUser(id, { days: Number(snoozeDays) || 7 }, globalState.key);
      if (res?.status === 200) {
        toast.success(`Pause pendant ${snoozeDays} jour(s)`);
        await load();
        notify('Pause activée');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      notify('Erreur lors de la pause', 'error');
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
        notify('Recalcul effectué');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec');
      notify('Erreur lors du recalcul', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyTemplate = async () => {
    if (!nba.template) return;
    try {
      await navigator.clipboard.writeText(nba.template);
      toast.success('Message copié');
      notify('Message copié');
    } catch {
      toast.error('Copie impossible');
    }
  };

  const handleDeleteNote = async () => {
    notify('Suppression non disponible côté API', 'info');
  };

  if (loading) {
    return (
      <MainCard contentSX={{ p: { xs: 2, sm: 3 }, bgcolor: SSS_COLORS.pageBg }}>
        <div className="sss-page">
          <div className="h-1.5 overflow-hidden rounded-full bg-sss-brand-soft">
            <div className="h-full w-1/3 animate-sss-shimmer rounded-full bg-sss-brand" />
          </div>
          <p className="sss-muted mt-3 text-sm">Chargement de la fiche…</p>
        </div>
      </MainCard>
    );
  }

  if (!fiche) {
    return (
      <MainCard contentSX={{ p: { xs: 2, sm: 3 }, bgcolor: SSS_COLORS.pageBg }}>
        <EmptyState
          title="Personne introuvable"
          subtitle="La fiche demandée n’existe pas ou a été supprimée."
          action={
            <PrimaryButton startIcon={<BackIcon />} onClick={() => navigate('/wekavit/sss/people')}>
              Retour à la liste
            </PrimaryButton>
          }
        />
      </MainCard>
    );
  }

  const tabs = [
    { label: 'Situation', icon: <PeopleAltIcon /> },
    { label: 'Épargne', icon: <WalletIcon /> },
    { label: 'Notes', icon: <HistoryIcon /> },
    { label: 'Historique', icon: <TimelineIcon /> },
    { label: 'Modifier', icon: <SettingsIcon /> }
  ];

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5, md: 3 }, bgcolor: SSS_COLORS.pageBg }}>
      <div className="sss-page">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
          <GhostButton startIcon={<BackIcon />} onClick={() => navigate('/wekavit/sss/people')}>
            Retour aux personnes
          </GhostButton>
          <div className="flex flex-wrap gap-2">
            <GhostButton startIcon={<RefreshIcon />} onClick={handleRecompute} disabled={saving}>
              {saving ? 'Recalcul…' : 'Recalculer'}
            </GhostButton>
            {identity.phone && (
              <>
                <GhostButton startIcon={<PhoneIcon />} href={telHref(identity.phone)} component="a">
                  Appeler
                </GhostButton>
                <PrimaryButton
                  startIcon={<WhatsAppIcon />}
                  href={whatsappHref(identity.phone)}
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </PrimaryButton>
              </>
            )}
          </div>
        </div>

        {/* Hero */}
        <section
          className={`sss-surface relative mb-5 overflow-hidden ${
            isUrgent ? 'border-sss-error/25' : 'border-sss-brand-border'
          }`}
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5"
            style={{
              background: isUrgent
                ? `linear-gradient(90deg, ${SSS_COLORS.error}, ${SSS_COLORS.warning})`
                : `linear-gradient(90deg, ${SSS_COLORS.brand}, ${SSS_COLORS.brandDark})`
            }}
          />

          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0">
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div
                  className="rounded-full p-0.5 shadow-sss-md"
                  style={{
                    background: `linear-gradient(135deg, ${SSS_COLORS.brand}, ${SSS_COLORS.brandDark})`
                  }}
                >
                  <div className="rounded-full border-2 border-white">
                    <PersonAvatar user={identity} size={isXs ? 52 : 64} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="m-0 text-xl font-extrabold tracking-tight text-sss-text sm:text-2xl">
                    {displayName(identity)}
                  </h1>
                  <p className="sss-muted m-0 mt-1 text-sm">
                    {identity.profession || 'Client accompagné'}
                    {identity.phone ? ` · ${maskPhone(identity.phone)}` : ''}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StageChip stage={situation.stage} />
                    <UrgencyChip urgency={situation.urgency} />
                    <HealthMeter level={situation.healthLevel} score={situation.healthScore} dense />
                    {situation.snoozeUntil && (
                      <Chip
                        icon={<ScheduleIcon />}
                        label={`Pause jusqu’au ${formatDateFr(situation.snoozeUntil)}`}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {situation.alerts?.length > 0 && (
                <div className="mt-4 rounded-2xl border border-sss-warning/20 bg-sss-warning-soft/60 p-3">
                  <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wide text-sss-warning">Alertes</p>
                  <AlertChips alerts={situation.alerts} max={6} />
                </div>
              )}
            </div>

            <div
              className={`rounded-sss border p-4 sm:p-5 ${
                isUrgent
                  ? 'border-sss-error/25 bg-sss-error-soft/50'
                  : 'border-sss-brand-border bg-sss-brand-soft/70'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <AutoAwesomeIcon sx={{ color: isUrgent ? SSS_COLORS.error : SSS_COLORS.brand, fontSize: 20 }} />
                <h2 className="m-0 text-sm font-bold uppercase tracking-wide text-sss-muted">
                  Prochaine action conseillée
                </h2>
              </div>
              <p className="m-0 text-lg font-extrabold text-sss-text">
                {ACTION_LABELS[nba.nba] || nba.nba || 'Aucune action définie'}
              </p>
              {nba.template ? (
                <p className="m-0 mt-2 whitespace-pre-wrap rounded-2xl bg-white/80 p-3 text-sm italic leading-relaxed text-sss-text border border-white">
                  “{nba.template}”
                </p>
              ) : (
                <p className="sss-muted m-0 mt-2 text-sm">Aucun message suggéré pour cette action.</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {nba.template && (
                  <PrimaryButton size="small" startIcon={<CopyIcon />} onClick={copyTemplate}>
                    Copier le message
                  </PrimaryButton>
                )}
                <GhostButton size="small" startIcon={<SettingsIcon />} onClick={() => setTab(4)}>
                  Modifier l’action
                </GhostButton>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="sss-surface mb-4 overflow-hidden">
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 56,
              px: 1,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                minHeight: 56,
                color: SSS_COLORS.muted,
                '&.Mui-selected': { color: SSS_COLORS.brandDark }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                backgroundColor: SSS_COLORS.brand
              }
            }}
          >
            {tabs.map((t) => (
              <Tab key={t.label} label={t.label} icon={t.icon} iconPosition="start" />
            ))}
          </Tabs>
        </div>

        {/* Situation */}
        <TabPanel value={tab} index={0}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <SectionCard
                title="Parcours"
                hint="Où en est cette personne dans le cycle"
                icon={<TimelineIcon />}
                action={
                  <button type="button" className="text-sm font-bold text-sss-brand" onClick={() => setTab(4)}>
                    Modifier
                  </button>
                }
              >
                <Row label="Étape actuelle" value={STAGE_LABELS[situation.stage] || situation.stage} icon={<FlagIcon />} tone={SSS_COLORS.brand} />
                <Row label="Étape calculée" value={STAGE_LABELS[situation.stageSuggested] || situation.stageSuggested} icon={<AutoAwesomeIcon />} />
                <Row label="Depuis le" value={formatDateFr(situation.stageEnteredAt)} icon={<AccessTimeIcon />} />
                <Row label="Inscrit(e) le" value={formatDateFr(situation.signupDate)} icon={<PersonAddIcon />} />
                <Row label="Dernier calcul" value={formatDateFr(situation.lastComputedAt)} icon={<RefreshIcon />} />
              </SectionCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <SectionCard title="Engagement" hint="Activité et contacts récents" icon={<PeopleAltIcon />} tone={SSS_COLORS.info}>
                <Row label="Dernière activité" value={formatDateFr(engagement.lastActivityAt)} icon={<AccessTimeIcon />} />
                <Row
                  label="Jours sans activité"
                  value={engagement.daysSinceLastActivity != null ? `${engagement.daysSinceLastActivity} j` : '—'}
                  icon={<ScheduleIcon />}
                  tone={engagement.daysSinceLastActivity > 7 ? SSS_COLORS.warning : undefined}
                />
                <Row label="Dernier contact" value={formatDateFr(engagement.lastContactedAt)} icon={<PhoneIcon />} />
                <Row label="Dernière action" value={ACTION_LABELS[engagement.lastContactAction] || '—'} icon={<CheckCircleIcon />} />
                <Row
                  label="Parrainages"
                  value={`${engagement.activeReferralCount || 0} actifs / ${engagement.referralCount || 0}`}
                  icon={<PeopleAltIcon />}
                />
              </SectionCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Épargne */}
        <TabPanel value={tab} index={1}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <SectionCard title="Dépôts" icon={<WalletIcon />} tone={SSS_COLORS.success}>
                <Row label="Validés" value={deposits.validatedDepositCount || 0} icon={<CheckCircleIcon />} />
                <Row
                  label="En attente"
                  value={deposits.pendingDepositCount || 0}
                  icon={<ScheduleIcon />}
                  tone={deposits.pendingDepositCount > 0 ? SSS_COLORS.warning : undefined}
                />
                <Row label="Premier dépôt" value={formatDateFr(deposits.firstDepositAt)} icon={<AccessTimeIcon />} />
                <Row label="Dernier dépôt" value={formatDateFr(deposits.lastDepositAt)} icon={<AccessTimeIcon />} />
                <Row label="Total déposé" value={formatMoney(deposits.totalDepositedUsd)} icon={<TrendingUpIcon />} tone={SSS_COLORS.success} />
                <Row label="Semaines d’affilée" value={deposits.streakWeeks || 0} icon={<TrendingUpIcon />} />
              </SectionCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <SectionCard title="Plans d’épargne" icon={<SavingsIcon />} tone={SSS_COLORS.info}>
                <Row label="Plans actifs" value={savings.activePlanCount || 0} icon={<CheckCircleIcon />} />
                <Row label="Plans créés" value={savings.everPlanCount || 0} icon={<AddIcon />} />
                <Row label="Capital en cours" value={formatMoney(savings.totalSavedCapitalUsd)} icon={<SavingsIcon />} />
                <Row label="Total avec intérêts" value={formatMoney(savings.totalSaveSumUsd)} icon={<TrendingUpIcon />} tone={SSS_COLORS.success} />
                <Row label="Plans terminés" value={savings.plansMaturedCount || 0} icon={<CheckCircleIcon />} />
                <Row
                  label="Retraits anticipés"
                  value={savings.earlyWithdrawCount || 0}
                  icon={<WarningIcon />}
                  tone={savings.earlyWithdrawCount > 0 ? SSS_COLORS.warning : undefined}
                />
              </SectionCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <SectionCard title="Solde disponible" icon={<WalletIcon />} tone={SSS_COLORS.brand}>
                <Row label="Argent non placé" value={formatMoney(balance.idleBalanceUsd)} icon={<WalletIcon />} />
                <Row label="Depuis (jours)" value={balance.idleBalanceDays || 0} icon={<AccessTimeIcon />} />
                <Row label="Retraits wallet" value={engagement.withdrawCount || 0} icon={<TrendingDownIcon />} />
                <Row label="Dernier retrait" value={formatDateFr(engagement.lastWithdrawAt)} icon={<AccessTimeIcon />} />
              </SectionCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notes & actions */}
        <TabPanel value={tab} index={2}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <SectionCard title="Notes" hint="Capturer le contexte utile pour le prochain contact" icon={<AddIcon />}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Ex. : Attend son salaire vendredi. Relancer samedi matin."
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <PrimaryButton startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={handleAddNote} disabled={saving || !noteBody.trim()}>
                  Enregistrer la note
                </PrimaryButton>

                <Divider sx={{ my: 2.5 }} />

                <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                  Notes précédentes
                </Typography>
                <div className="flex flex-col gap-2.5">
                  {(fiche.notes || []).length === 0 ? (
                    <p className="sss-muted m-0 py-4 text-center text-sm">Aucune note pour l’instant.</p>
                  ) : (
                    (fiche.notes || []).map((note) => (
                      <NoteItem key={note._id} note={note} onDelete={handleDeleteNote} />
                    ))
                  )}
                </div>
              </SectionCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <SectionCard title="Dernières actions" hint="Historique récent des tâches SSS" icon={<HistoryIcon />} tone={SSS_COLORS.info}>
                {(fiche.tasks || []).length === 0 ? (
                  <p className="sss-muted m-0 py-6 text-center text-sm">Aucune action planifiée.</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {(fiche.tasks || []).slice(0, 12).map((task) => (
                      <TaskItem key={task._id} task={task} />
                    ))}
                  </div>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Timeline */}
        <TabPanel value={tab} index={3}>
          <SectionCard title="Historique d’accompagnement" hint="Événements système et actions admin" icon={<TimelineIcon />} tone={SSS_COLORS.info}>
            {(fiche.timeline || []).length === 0 ? (
              <p className="sss-muted m-0 py-8 text-center text-sm">Aucun événement encore.</p>
            ) : (
              <div className="relative space-y-3 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-sss-border">
                {(fiche.timeline || []).map((ev) => (
                  <div key={ev._id} className="relative flex gap-3 pl-1">
                    <span
                      className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white ${
                        ev.source === 'admin' ? 'bg-sss-brand' : 'bg-sss-neutral'
                      }`}
                    />
                    <div className="min-w-0 flex-1 rounded-2xl border border-sss-border bg-white p-3.5">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <Chip
                          size="small"
                          label={ev.source === 'admin' ? 'Vous' : 'Système'}
                          color={ev.source === 'admin' ? 'primary' : 'default'}
                          sx={{ fontWeight: 700, height: 22 }}
                        />
                        <span className="text-xs text-sss-muted">{formatDateFr(ev.createdAt)}</span>
                      </div>
                      <p className="m-0 text-sm leading-relaxed text-sss-text">{ev.message || ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabPanel>

        {/* Modifier */}
        <TabPanel value={tab} index={4}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <SectionCard title="Changer l’étape" icon={<FlagIcon />}>
                <TextField
                  select
                  fullWidth
                  label="Nouvelle étape"
                  value={stageDraft}
                  onChange={(e) => setStageDraft(e.target.value)}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <PrimaryButton onClick={handleSaveStage} disabled={saving || !stageDraft} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>
                  Enregistrer l’étape
                </PrimaryButton>
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <SectionCard title="Forcer l’action conseillée" icon={<SettingsIcon />} tone={SSS_COLORS.info}>
                <TextField
                  select
                  fullWidth
                  label="Action"
                  value={nbaDraft}
                  onChange={(e) => setNbaDraft(e.target.value)}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">Automatique (système)</MenuItem>
                  {ACTION_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
                <PrimaryButton onClick={handleSaveNba} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>
                  Enregistrer l’action
                </PrimaryButton>
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <SectionCard title="Pause de contact" hint="Utile si la personne a demandé un rappel plus tard" icon={<ScheduleIcon />} tone={SSS_COLORS.warning}>
                <TextField
                  fullWidth
                  type="number"
                  label="Nombre de jours"
                  value={snoozeDays}
                  onChange={(e) => setSnoozeDays(e.target.value)}
                  sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  inputProps={{ min: 1, max: 90 }}
                />
                <GhostButton onClick={handleSnooze} disabled={saving} startIcon={<ScheduleIcon />}>
                  Mettre en pause
                </GhostButton>
              </SectionCard>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Mobile sticky contact bar */}
        {identity.phone && (
          <div className="fixed inset-x-0 bottom-0 z-20 border-t border-sss-border bg-white/95 p-3 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-lg gap-2">
              <GhostButton fullWidth startIcon={<PhoneIcon />} href={telHref(identity.phone)} component="a">
                Appeler
              </GhostButton>
              <PrimaryButton
                fullWidth
                startIcon={<WhatsAppIcon />}
                href={whatsappHref(identity.phone)}
                component="a"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </PrimaryButton>
            </div>
          </div>
        )}

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

export default PersonFichePage;
