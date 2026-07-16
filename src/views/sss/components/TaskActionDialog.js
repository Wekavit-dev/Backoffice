import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
  Alert,
  useMediaQuery,
  Chip,
  Avatar,
  IconButton,
  Paper,
  alpha,
  useTheme,
  Fade,
  Grow,
  Zoom,
  LinearProgress,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Snackbar,
  Tooltip,
  Badge,
  Collapse
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  EmojiEmotions as EmojiIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NotificationsActive as NotificationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Send as SendIcon,
  ContentCopy as ContentCopyIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  MoreVert as MoreVertIcon,
  DoneAll as DoneAllIcon,
  RemoveCircle as RemoveCircleIcon
} from '@mui/icons-material';
import { ACTION_LABELS, OUTCOME_OPTIONS, TASK_STATUS_LABELS, displayName } from '../labels';
import { ActionLabel, PersonAvatar, UrgencyChip, StageChip } from './Chips';
import PhoneAction from './PhoneAction';

const TEAL = { main: '#0D9488', dark: '#0F766E', deeper: '#115E59' };
const tealGradient = {
  background: `linear-gradient(135deg, ${TEAL.main}, ${TEAL.dark})`,
  '&:hover': { background: `linear-gradient(135deg, ${TEAL.dark}, ${TEAL.deeper})` }
};

// Options de statut enrichies
const STATUS_CHOICES = [
  {
    value: 'in_progress',
    label: 'En cours',
    icon: <TrendingUpIcon />,
    color: 'info',
    description: 'Je commence à travailler sur cette action'
  },
  {
    value: 'done',
    label: 'Terminé',
    icon: <CheckCircleIcon />,
    color: 'success',
    description: 'Action complétée avec succès'
  },
  {
    value: 'partial',
    label: 'Partiel (à reprendre)',
    icon: <WarningIcon />,
    color: 'warning',
    description: 'Avancement partiel, nécessite une suite'
  },
  {
    value: 'blocked',
    label: 'Bloqué',
    icon: <CancelIcon />,
    color: 'error',
    description: 'Action bloquée, nécessite une intervention'
  },
  {
    value: 'skipped',
    label: 'Ignorer',
    icon: <RemoveCircleIcon />,
    color: 'default',
    description: 'Action à ignorer pour le moment'
  }
];

// Composant de progression étape par étape
const StepProgress = ({ currentStep, steps }) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Stepper activeStep={currentStep} orientation="vertical" sx={{ '& .MuiStepConnector-line': { minHeight: 20 } }}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel
              StepIconProps={{
                sx: {
                  '& .MuiStepIcon-root': {
                    color: index <= currentStep ? TEAL.main : theme.palette.grey[400],
                  }
                }
              }}
            >
              <Typography variant="body2" fontWeight={index === currentStep ? 600 : 400}>
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="caption" color="text.secondary">
                {step.description}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

/**
 * TaskActionDialog amélioré avec design moderne et UX enrichie
 */
const TaskActionDialog = ({
  open,
  task,
  onClose,
  onSave,
  saving,
  variant = 'default', // 'default' | 'step-by-step' | 'quick'
  showStepper = false,
  enableSnooze = true,
  showSuggestions = true,
  onCopyMessage,
  onShare
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // États du formulaire
  const [status, setStatus] = useState('done');
  const [completionDegree, setCompletionDegree] = useState(100);
  const [outcome, setOutcome] = useState('reached');
  const [adminNotes, setAdminNotes] = useState('');
  const [snoozeDays, setSnoozeDays] = useState('');
  const [snoozeReason, setSnoozeReason] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(true);

  // Refs
  const messageInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Initialisation du formulaire
  useEffect(() => {
    if (open && task) {
      setStatus(task.status === 'todo' || task.status === 'carried_over' ? 'done' : task.status);
      setCompletionDegree(task.completionDegree || 100);
      setOutcome(task.outcome || 'reached');
      setAdminNotes(task.adminNotes || '');
      setSnoozeDays('');
      setSnoozeReason('');
      setActiveStep(0);
      setHasError(false);
      setErrorMessage('');
      setShowAdvanced(false);
      setShowSuggestionsPanel(true);
    }
  }, [open, task]);

  if (!task) return null;

  const person = displayName(task.idUser);
  const message = task.templateSnapshot;
  const isUrgent = task.urgency === 'critical' || task.urgency === 'high';

  // Étape actuelle du stepper
  const steps = [
    { label: 'Vérifier les informations', description: 'Confirmez les détails de la personne et du contexte' },
    { label: 'Effectuer l\'action', description: 'Réalisez l\'action comme indiqué ci-dessus' },
    { label: 'Enregistrer le résultat', description: 'Documentez ce qui a été fait et le résultat obtenu' }
  ];

  // Validation
  const validateForm = () => {
    if (!status) {
      setHasError(true);
      setErrorMessage('Veuillez sélectionner un statut');
      return false;
    }

    if (status === 'done' && completionDegree < 100) {
      setHasError(true);
      setErrorMessage('Pour marquer comme terminé, l\'avancement doit être à 100%');
      return false;
    }

    if (snoozeDays && (parseInt(snoozeDays) < 1 || parseInt(snoozeDays) > 90)) {
      setHasError(true);
      setErrorMessage('La période de report doit être entre 1 et 90 jours');
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

    if (snoozeDays && parseInt(snoozeDays) > 0) {
      payload.snoozeDays = Number(snoozeDays);
      payload.snoozeReason = snoozeReason.trim() || undefined;
    }

    onSave(payload);
  };

  const handleCopyMessage = () => {
    if (message) {
      navigator.clipboard.writeText(message).then(() => {
        setCopied(true);
        if (onCopyMessage) onCopyMessage(message);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderStatusChips = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      {STATUS_CHOICES.map((option) => {
        const isSelected = status === option.value;
        const paletteColor = theme.palette[option.color]?.main || theme.palette.grey[500];
        return (
          <Chip
            key={option.value}
            label={option.label}
            icon={option.icon}
            onClick={() => setStatus(option.value)}
            color={isSelected ? option.color : 'default'}
            variant={isSelected ? 'filled' : 'outlined'}
            sx={{
              transition: 'all 0.2s ease',
              fontWeight: isSelected ? 600 : 400,
              transform: isSelected ? 'scale(1.03)' : 'scale(1)',
              boxShadow: isSelected ? `0 2px 8px ${alpha(paletteColor, 0.25)}` : 'none',
              borderWidth: isSelected ? 0 : 1,
              borderColor: isSelected ? 'transparent' : alpha(paletteColor, 0.3),
              '&:hover': {
                transform: 'scale(1.02)',
                borderColor: alpha(paletteColor, 0.5),
                bgcolor: isSelected ? undefined : alpha(paletteColor, 0.06)
              },
              '& .MuiChip-icon': {
                fontSize: 16
              }
            }}
          />
        );
      })}
    </Box>
  );

  const renderProgressSection = () => (
    <Box sx={{ my: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" fontWeight={600}>
          Avancement
        </Typography>
        <Chip
          label={`${completionDegree}%`}
          size="small"
          color={completionDegree === 100 ? 'success' : completionDegree >= 50 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
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
          '& .MuiSlider-track': {
            background: `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.success.main})`,
          }
        }}
      />
    </Box>
  );

  const renderMessageTemplate = () => {
    if (!message || !showSuggestions) return null;

    return (
      <Collapse in={showSuggestionsPanel}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.04),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
            position: 'relative'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2" fontWeight={600} color="info.main">
              <InfoIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              Message suggéré
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Copier le message">
                <IconButton size="small" onClick={handleCopyMessage}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {onShare && (
                <Tooltip title="Partager">
                  <IconButton size="small" onClick={() => onShare(message)}>
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              bgcolor: 'background.paper',
              p: 1.5,
              borderRadius: 1,
              fontStyle: 'italic'
            }}
          >
            {message}
          </Typography>
          {copied && (
            <Chip
              icon={<CheckCircleIcon />}
              label="Copié !"
              size="small"
              color="success"
              sx={{ mt: 1 }}
            />
          )}
        </Paper>
      </Collapse>
    );
  };

  const renderSnoozeSection = () => {
    if (!enableSnooze) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ mb: 2 }}>
          <Chip
            label="Report"
            size="small"
            icon={<ScheduleIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{ cursor: 'pointer' }}
          />
        </Divider>
        <Collapse in={showAdvanced}>
          <Stack spacing={2}>
            <TextField
              label="Ne plus contacter pendant (jours)"
              type="number"
              value={snoozeDays}
              onChange={(e) => setSnoozeDays(e.target.value)}
              fullWidth
              size="small"
              helperText="Laissez vide si vous voulez pouvoir le recontacter demain"
              inputProps={{ min: 1, max: 90 }}
              InputProps={{
                startAdornment: <ScheduleIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
            {snoozeDays && (
              <TextField
                label="Raison du report (optionnel)"
                value={snoozeReason}
                onChange={(e) => setSnoozeReason(e.target.value)}
                fullWidth
                size="small"
                placeholder="Ex. : Attendre la paie du mois prochain"
              />
            )}
          </Stack>
        </Collapse>
      </Box>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        TransitionComponent={Grow}
        TransitionProps={{ timeout: 300 }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        {/* En-tête */}
        <DialogTitle
          sx={{
            p: 3,
            bgcolor: alpha(TEAL.main, 0.03),
            borderBottom: `1px solid ${alpha(TEAL.main, 0.1)}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${TEAL.main}, ${TEAL.dark})`
            }
          }}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                Mettre à jour l'action
              </Typography>
              {isUrgent && (
                <Chip
                  icon={<WarningIcon />}
                  label="Urgent"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {ACTION_LABELS[task.actionType] || 'Action'}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Contenu */}
        <DialogContent
          dividers
          sx={{
            p: 3,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(TEAL.main, 0.2),
              borderRadius: 3,
            }
          }}
        >
          <Stack spacing={3}>
            {/* Erreur */}
            {hasError && (
              <Fade in={hasError}>
                <Alert severity="error" onClose={() => setHasError(false)}>
                  {errorMessage}
                </Alert>
              </Fade>
            )}

            {/* Informations sur la personne */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <PersonAvatar user={task.idUser} size={48} />
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {person}
                  </Typography>
                  <PhoneAction phone={task.idUser?.phone} size="small" allowReveal={false} />
                </Box>
                <Stack direction="row" spacing={1}>
                  <UrgencyChip urgency={task.urgency} size="small" />
                  <StageChip stage={task.stageSnapshot} size="small" />
                </Stack>
              </Stack>
            </Paper>

            {/* Stepper (optionnel) */}
            {showStepper && (
              <StepProgress currentStep={activeStep} steps={steps} />
            )}

            {/* Statut */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Où en êtes-vous ?
              </Typography>
              {renderStatusChips()}
              <Typography variant="caption" color="text.secondary">
                {STATUS_CHOICES.find(s => s.value === status)?.description}
              </Typography>
            </Box>

            {/* Progression */}
            {status !== 'skipped' && renderProgressSection()}

            {/* Résultat */}
            {status !== 'skipped' && status !== 'blocked' && (
              <TextField
                select
                label="Résultat du contact"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                fullWidth
                size="small"
                SelectProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                      {outcome === 'reached' && <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />}
                      {outcome === 'not_reached' && <CancelIcon sx={{ fontSize: 18, color: 'error.main' }} />}
                      {outcome === 'partial' && <WarningIcon sx={{ fontSize: 18, color: 'warning.main' }} />}
                      {outcome === 'voicemail' && <MessageIcon sx={{ fontSize: 18, color: 'info.main' }} />}
                    </Box>
                  )
                }}
              >
                {OUTCOME_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Message template */}
            {renderMessageTemplate()}

            {/* Notes */}
            <TextField
              label="Note rapide (optionnel)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="Ex. : Rappeler samedi après son salaire"
              InputProps={{
                startAdornment: (
                  <EditIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                )
              }}
              onKeyDown={handleKeyDown}
            />

            {/* Snooze */}
            {renderSnoozeSection()}

            {/* Informations de statut */}
            <Box sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.grey[100], 0.5),
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Chip
                label={`Statut actuel: ${TASK_STATUS_LABELS[task.status] || task.status}`}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Action: ${ACTION_LABELS[task.actionType] || task.actionType}`}
                size="small"
                variant="outlined"
              />
            </Box>
          </Stack>
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            p: 3,
            gap: 1,
            flexWrap: 'wrap',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: alpha(theme.palette.background.default, 0.3)
          }}
        >
          <Button
            onClick={onClose}
            disabled={saving}
            startIcon={<CancelIcon />}
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{
              borderRadius: 2,
              minWidth: 120,
              ...tealGradient,
              '&:disabled': {
                opacity: 0.7
              }
            }}
            ref={submitButtonRef}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
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

/**
 * TaskActionDialogQuick - Version rapide simplifiée
 */
export const TaskActionDialogQuick = (props) => (
  <TaskActionDialog
    {...props}
    variant="quick"
    showStepper={false}
    showSuggestions={false}
    enableSnooze={false}
  />
);

/**
 * TaskActionDialogStepByStep - Version avec guide pas à pas
 */
export const TaskActionDialogStepByStep = (props) => (
  <TaskActionDialog
    {...props}
    variant="step-by-step"
    showStepper={true}
    showSuggestions={true}
    enableSnooze={true}
  />
);

/**
 * TaskActionDialogMobile - Version optimisée pour mobile
 */
export const TaskActionDialogMobile = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TaskActionDialog
      {...props}
      variant="mobile"
      fullScreen={isMobile}
      showStepper={false}
      showSuggestions={false}
    />
  );
};

export default TaskActionDialog;