import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Typography,
  Box,
  Slider,
  Alert,
  useMediaQuery,
  Chip,
  IconButton,
  Paper,
  alpha,
  useTheme,
  Fade,
  Grow,
  CircularProgress,
  Tooltip,
  Snackbar,
  Collapse,
  Grid,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Message as MessageIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  RemoveCircle as RemoveCircleIcon,
  OpenInNew as OpenInNewIcon,
  PersonSearch as PersonSearchIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import {
  ACTION_LABELS,
  OUTCOME_OPTIONS,
  TASK_STATUS_LABELS,
  STAGE_LABELS,
  displayName,
  maskPhone,
  telHref,
  whatsappHref
} from '../labels';
import { AlertChips, PersonAvatar, UrgencyChip, StageChip, StatusChip } from './Chips';
import { GhostButton, PrimaryButton, SSS_COLORS } from './SssLayout';

const STATUS_CHOICES = [
  {
    value: 'in_progress',
    label: 'En cours',
    icon: <TrendingUpIcon fontSize="small" />,
    color: SSS_COLORS.info,
    description: 'Vous démarrez ou poursuivez cette action.'
  },
  {
    value: 'done',
    label: 'Terminé',
    icon: <CheckCircleIcon fontSize="small" />,
    color: SSS_COLORS.success,
    description: 'L’action est complètement réalisée.'
  },
  {
    value: 'partial',
    label: 'Partiel',
    icon: <WarningIcon fontSize="small" />,
    color: SSS_COLORS.warning,
    description: 'Avancement partiel : une suite sera nécessaire.'
  },
  {
    value: 'blocked',
    label: 'Bloqué',
    icon: <CancelIcon fontSize="small" />,
    color: SSS_COLORS.error,
    description: 'Impossible de continuer sans intervention.'
  },
  {
    value: 'skipped',
    label: 'Ignorer',
    icon: <RemoveCircleIcon fontSize="small" />,
    color: SSS_COLORS.neutral,
    description: 'Cette action n’est pas pertinente pour le moment.'
  }
];

const Section = ({ title, subtitle, children, action }) => (
  <Box>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} mb={1.5}>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} color={SSS_COLORS.text}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
    {children}
  </Box>
);

const InfoRow = ({ label, children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
      gap: { xs: 0.5, sm: 2 },
      alignItems: 'start',
      py: 1.1,
      borderBottom: `1px solid ${SSS_COLORS.cardBorder}`
    }}
  >
    <Typography variant="body2" fontWeight={700} color="text.secondary">
      {label}
    </Typography>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
  </Box>
);

/**
 * Modal d’action SSS — large, lisible, avec accès fiche avant traitement.
 */
const TaskActionDialog = ({
  open,
  task,
  onClose,
  onSave,
  saving,
  enableSnooze = true,
  showSuggestions = true,
  onCopyMessage,
  onViewFiche
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [status, setStatus] = useState('done');
  const [completionDegree, setCompletionDegree] = useState(100);
  const [outcome, setOutcome] = useState('reached');
  const [adminNotes, setAdminNotes] = useState('');
  const [snoozeDays, setSnoozeDays] = useState('');
  const [snoozeReason, setSnoozeReason] = useState('');
  const [showSnooze, setShowSnooze] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && task) {
      setStatus(task.status === 'todo' || task.status === 'carried_over' ? 'done' : task.status || 'done');
      setCompletionDegree(task.completionDegree ?? 100);
      setOutcome(task.outcome || 'reached');
      setAdminNotes(task.adminNotes || '');
      setSnoozeDays('');
      setSnoozeReason('');
      setShowSnooze(false);
      setHasError(false);
      setErrorMessage('');
    }
  }, [open, task]);

  if (!task) return null;

  const user = task.idUser && typeof task.idUser === 'object' ? task.idUser : null;
  const userId = user?._id || (typeof task.idUser === 'string' ? task.idUser : null);
  const person = displayName(user);
  const phone = user?.phone;
  const message =
    typeof task.templateSnapshot === 'string'
      ? task.templateSnapshot
      : task.templateSnapshot?.message || task.templateSnapshot?.suggestedMessage || '';
  const isUrgent = task.urgency === 'critical' || task.urgency === 'high';
  const selectedStatus = STATUS_CHOICES.find((s) => s.value === status);
  const fichePath = userId ? `/wekavit/sss/people/${userId}` : null;

  const validateForm = () => {
    if (!status) {
      setHasError(true);
      setErrorMessage('Veuillez sélectionner un statut.');
      return false;
    }
    if (status === 'done' && completionDegree < 100) {
      setHasError(true);
      setErrorMessage('Pour marquer comme terminé, l’avancement doit être à 100 %.');
      return false;
    }
    if (snoozeDays && (Number(snoozeDays) < 1 || Number(snoozeDays) > 90)) {
      setHasError(true);
      setErrorMessage('La période de report doit être entre 1 et 90 jours.');
      return false;
    }
    setHasError(false);
    setErrorMessage('');
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const payload = {
      status,
      completionDegree: Number(completionDegree),
      outcome: status === 'skipped' || status === 'blocked' ? null : outcome,
      adminNotes: adminNotes.trim() || undefined
    };
    if (snoozeDays && Number(snoozeDays) > 0) {
      payload.snoozeDays = Number(snoozeDays);
      payload.snoozeReason = snoozeReason.trim() || undefined;
    }
    onSave(payload);
  };

  const handleCopyMessage = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      onCopyMessage?.(message);
    } catch {
      setHasError(true);
      setErrorMessage('Impossible de copier le message.');
    }
  };

  const handleOpenFiche = (mode = 'tab') => {
    if (!fichePath) return;
    if (onViewFiche) {
      onViewFiche(task, { mode });
      return;
    }
    if (mode === 'tab') {
      window.open(fichePath, '_blank', 'noopener,noreferrer');
      return;
    }
    onClose?.();
    navigate(fichePath);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth={false}
        fullScreen={fullScreen}
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 280 }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
        PaperProps={{
          sx: {
            width: { xs: '100%', md: 'min(1100px, 96vw)' },
            maxWidth: { xs: '100%', md: 1100 },
            borderRadius: { xs: 0, md: 3 },
            maxHeight: { xs: '100%', md: '92vh' },
            overflow: 'hidden',
            m: { xs: 0, md: 2 }
          }
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2.5, md: 3.5 },
            py: 2.5,
            bgcolor: alpha(SSS_COLORS.brand, 0.04),
            borderBottom: `1px solid ${SSS_COLORS.brandBorder}`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: isUrgent
                ? `linear-gradient(90deg, ${SSS_COLORS.error}, ${SSS_COLORS.warning})`
                : `linear-gradient(90deg, ${SSS_COLORS.brand}, ${SSS_COLORS.brandDark})`
            }
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box minWidth={0}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap mb={0.5}>
                <Typography variant="h5" fontWeight={800} sx={{ fontSize: { xs: '1.2rem', md: '1.45rem' } }}>
                  Traiter l’action
                </Typography>
                {isUrgent && (
                  <Chip icon={<WarningIcon />} label="Prioritaire" size="small" color="error" sx={{ fontWeight: 700 }} />
                )}
              </Stack>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                <strong>{ACTION_LABELS[task.actionType] || task.actionType || 'Action'}</strong>
                {' · '}
                {person}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Consultez d’abord la fiche si besoin, puis enregistrez le résultat du contact.
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'background.paper', border: `1px solid ${SSS_COLORS.cardBorder}` }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: { xs: 2, md: 3.5 },
            bgcolor: SSS_COLORS.pageBg,
            overflowY: 'auto'
          }}
        >
          {hasError && (
            <Fade in>
              <Alert severity="error" onClose={() => setHasError(false)} sx={{ mb: 2.5, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            </Fade>
          )}

          <Grid container spacing={3}>
            {/* Colonne contexte */}
            <Grid item xs={12} md={5}>
              <Stack spacing={2.5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${SSS_COLORS.cardBorder}`,
                    bgcolor: '#fff'
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PersonAvatar user={user} size={56} />
                      <Box minWidth={0} flex={1}>
                        <Typography variant="h6" fontWeight={800} noWrap>
                          {person}
                        </Typography>
                        {phone ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mt: 0.25 }}>
                            {maskPhone(phone)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Téléphone non renseigné
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Alert
                      severity="info"
                      icon={<PersonSearchIcon />}
                      sx={{ borderRadius: 2, alignItems: 'center' }}
                      action={
                        fichePath ? (
                          <Button
                            color="inherit"
                            size="small"
                            endIcon={<OpenInNewIcon />}
                            onClick={() => handleOpenFiche('tab')}
                            sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                          >
                            Ouvrir
                          </Button>
                        ) : null
                      }
                    >
                      <Typography variant="body2" fontWeight={600}>
                        Voir la fiche avant de commencer
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                        Historique, épargne et notes s’ouvrent dans un nouvel onglet. Ce formulaire reste ouvert.
                      </Typography>
                    </Alert>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <PrimaryButton
                        fullWidth
                        startIcon={<PersonSearchIcon />}
                        endIcon={<OpenInNewIcon />}
                        onClick={() => handleOpenFiche('tab')}
                        disabled={!fichePath}
                      >
                        Consulter la fiche
                      </PrimaryButton>
                      <GhostButton
                        fullWidth
                        onClick={() => handleOpenFiche('navigate')}
                        disabled={!fichePath}
                      >
                        Aller à la fiche
                      </GhostButton>
                    </Stack>

                    {phone && (
                      <Stack direction="row" spacing={1}>
                        <GhostButton fullWidth startIcon={<CallIcon />} href={telHref(phone)} component="a">
                          Appeler
                        </GhostButton>
                        <GhostButton
                          fullWidth
                          startIcon={<WhatsAppIcon />}
                          href={whatsappHref(phone)}
                          component="a"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </GhostButton>
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: `1px solid ${SSS_COLORS.cardBorder}`,
                    bgcolor: '#fff'
                  }}
                >
                  <Section title="Contexte de l’action" subtitle="Tout ce qu’il faut savoir avant de contacter.">
                    <Box>
                      <InfoRow label="Action">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AssignmentIcon sx={{ fontSize: 18, color: SSS_COLORS.brand }} />
                          <Typography variant="body2" fontWeight={700}>
                            {ACTION_LABELS[task.actionType] || task.actionType || '—'}
                          </Typography>
                        </Stack>
                      </InfoRow>
                      <InfoRow label="Urgence">
                        <UrgencyChip urgency={task.urgency} />
                      </InfoRow>
                      <InfoRow label="Étape">
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <StageChip stage={task.stageSnapshot} />
                          <Typography variant="caption" color="text.secondary">
                            {STAGE_LABELS[task.stageSnapshot] || task.stageSnapshot || '—'}
                          </Typography>
                        </Stack>
                      </InfoRow>
                      <InfoRow label="État actuel">
                        <StatusChip status={task.status} />
                      </InfoRow>
                      <InfoRow label="Échéance">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AccessTimeIcon sx={{ fontSize: 16, color: SSS_COLORS.muted }} />
                          <Typography variant="body2" fontWeight={600}>
                            {task.date || 'Non définie'}
                          </Typography>
                        </Stack>
                      </InfoRow>
                      {(task.carryCount || 0) > 0 && (
                        <InfoRow label="Reports">
                          <Chip
                            size="small"
                            color="warning"
                            icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                            label={`Reporté ${task.carryCount}×`}
                            sx={{ fontWeight: 700 }}
                          />
                        </InfoRow>
                      )}
                      <InfoRow label="Alertes">
                        <AlertChips alerts={task.alertsSnapshot} max={5} />
                      </InfoRow>
                    </Box>
                  </Section>
                </Paper>

                {showSuggestions && message && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1px solid ${alpha(SSS_COLORS.info, 0.25)}`,
                      bgcolor: SSS_COLORS.infoSoft
                    }}
                  >
                    <Section
                      title="Message suggéré"
                      subtitle="Copiez puis adaptez avant d’envoyer."
                      action={
                        <Tooltip title="Copier">
                          <IconButton size="small" onClick={handleCopyMessage} sx={{ bgcolor: '#fff' }}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          bgcolor: '#fff',
                          borderRadius: 2,
                          p: 2,
                          lineHeight: 1.6,
                          border: `1px solid ${SSS_COLORS.cardBorder}`
                        }}
                      >
                        {message}
                      </Typography>
                      {copied && (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Message copié"
                          size="small"
                          color="success"
                          sx={{ mt: 1.5, fontWeight: 600 }}
                        />
                      )}
                    </Section>
                  </Paper>
                )}
              </Stack>
            </Grid>

            {/* Colonne formulaire */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: `1px solid ${SSS_COLORS.cardBorder}`,
                  bgcolor: '#fff',
                  height: '100%'
                }}
              >
                <Stack spacing={3}>
                  <Section title="1. Où en êtes-vous ?" subtitle="Choisissez le statut qui décrit le mieux cette action.">
                    <Grid container spacing={1.25}>
                      {STATUS_CHOICES.map((option) => {
                        const selected = status === option.value;
                        return (
                          <Grid item xs={12} sm={6} key={option.value}>
                            <Box
                              component="button"
                              type="button"
                              onClick={() => setStatus(option.value)}
                              sx={{
                                width: '100%',
                                textAlign: 'left',
                                cursor: 'pointer',
                                borderRadius: 2.5,
                                p: 1.75,
                                border: `2px solid ${selected ? option.color : SSS_COLORS.cardBorder}`,
                                bgcolor: selected ? alpha(option.color, 0.08) : '#fff',
                                transition: 'all 0.15s ease',
                                '&:hover': {
                                  borderColor: option.color,
                                  bgcolor: alpha(option.color, 0.06)
                                }
                              }}
                            >
                              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                                <Box sx={{ color: option.color, mt: 0.15 }}>{option.icon}</Box>
                                <Box>
                                  <Typography variant="body2" fontWeight={800} color={SSS_COLORS.text}>
                                    {option.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35, lineHeight: 1.4 }}>
                                    {option.description}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                    {selectedStatus && (
                      <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1.5, borderRadius: 2 }}>
                        {selectedStatus.description}
                      </Alert>
                    )}
                  </Section>

                  <Divider />

                  {status !== 'skipped' && (
                    <Section title="2. Avancement" subtitle="Indiquez à quel point l’action est réalisée.">
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight={600}>
                          Progression
                        </Typography>
                        <Chip
                          label={`${completionDegree} %`}
                          size="small"
                          color={completionDegree === 100 ? 'success' : completionDegree >= 50 ? 'warning' : 'default'}
                          sx={{ fontWeight: 800 }}
                        />
                      </Stack>
                      <Slider
                        value={completionDegree}
                        onChange={(_, v) => setCompletionDegree(v)}
                        step={5}
                        marks={[
                          { value: 0, label: '0%' },
                          { value: 50, label: '50%' },
                          { value: 100, label: '100%' }
                        ]}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        sx={{
                          color: SSS_COLORS.brand,
                          '& .MuiSlider-markLabel': { fontSize: '0.7rem' }
                        }}
                      />
                    </Section>
                  )}

                  {status !== 'skipped' && status !== 'blocked' && (
                    <Section title="3. Résultat du contact" subtitle="Que s’est-il passé lors de l’échange ?">
                      <TextField
                        select
                        label="Résultat"
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        fullWidth
                        helperText="Ce champ aide à suivre la qualité des contacts."
                      >
                        {OUTCOME_OPTIONS.map((o) => (
                          <MenuItem key={o.value} value={o.value}>
                            {o.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Section>
                  )}

                  <Section title="4. Note" subtitle="Ajoutez un rappel utile pour la prochaine fois (optionnel).">
                    <TextField
                      label="Note rapide"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={6}
                      placeholder="Ex. : Rappeler samedi après son salaire · A promis un dépôt lundi"
                      InputProps={{
                        startAdornment: <EditIcon sx={{ color: 'text.secondary', mr: 1, mt: 1.5, alignSelf: 'flex-start' }} />
                      }}
                    />
                  </Section>

                  {enableSnooze && (
                    <Section
                      title="5. Pause de contact"
                      subtitle="Masquez temporairement cette personne de la liste du jour."
                      action={
                        <Button size="small" onClick={() => setShowSnooze((v) => !v)} startIcon={<ScheduleIcon />} sx={{ textTransform: 'none', fontWeight: 700 }}>
                          {showSnooze ? 'Masquer' : 'Configurer'}
                        </Button>
                      }
                    >
                      <Collapse in={showSnooze}>
                        <Stack spacing={2} sx={{ pt: 0.5 }}>
                          <TextField
                            label="Ne plus contacter pendant (jours)"
                            type="number"
                            value={snoozeDays}
                            onChange={(e) => setSnoozeDays(e.target.value)}
                            fullWidth
                            helperText="Laissez vide pour pouvoir la recontacter dès demain."
                            inputProps={{ min: 1, max: 90 }}
                          />
                          {snoozeDays && (
                            <TextField
                              label="Raison du report (optionnel)"
                              value={snoozeReason}
                              onChange={(e) => setSnoozeReason(e.target.value)}
                              fullWidth
                              placeholder="Ex. : Attendre la paie du mois prochain"
                            />
                          )}
                        </Stack>
                      </Collapse>
                      {!showSnooze && (
                        <Typography variant="body2" color="text.secondary">
                          Aucune pause configurée.
                        </Typography>
                      )}
                    </Section>
                  )}

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(SSS_COLORS.brand, 0.04),
                      border: `1px dashed ${SSS_COLORS.brandBorder}`
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                      <MessageIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5, color: SSS_COLORS.brand }} />
                      Astuce : ouvrez la fiche, vérifiez le contexte, contactez, puis revenez ici pour enregistrer le
                      résultat. Raccourci : <strong>Ctrl/Cmd + Entrée</strong> pour sauvegarder.
                    </Typography>
                  </Paper>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, md: 3.5 },
            py: 2,
            gap: 1,
            flexWrap: 'wrap',
            borderTop: `1px solid ${SSS_COLORS.cardBorder}`,
            bgcolor: '#fff'
          }}
        >
          {fichePath && (
            <GhostButton
              startIcon={<OpenInNewIcon />}
              onClick={() => handleOpenFiche('tab')}
              sx={{ mr: { md: 'auto' } }}
            >
              Voir la fiche
            </GhostButton>
          )}
          <Button onClick={onClose} disabled={saving} startIcon={<CancelIcon />} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Annuler
          </Button>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            sx={{ minWidth: 160 }}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit();
            }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer le résultat'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          Message copié dans le presse-papier
        </Alert>
      </Snackbar>
    </>
  );
};

export const TaskActionDialogQuick = (props) => (
  <TaskActionDialog {...props} showSuggestions={false} enableSnooze={false} />
);

export const TaskActionDialogStepByStep = (props) => <TaskActionDialog {...props} />;

export default TaskActionDialog;
