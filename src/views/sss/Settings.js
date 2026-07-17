import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  alpha,
  Fade,
  Grow,
  Zoom,
  Card,
  CardContent,
  Chip,
  Badge,
  Snackbar,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Skeleton,
  MenuItem
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
  Settings as SettingsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsActive as NotificationIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  RestartAlt as RestartIcon,
  Backup as BackupIcon,
  History as HistoryIcon,
  DoneAll as DoneAllIcon,
  Error as ErrorIcon,
  PowerSettingsNew as PowerSettingsNewIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { PageToolbar, PrimaryButton, GhostButton, SSS_COLORS } from './components/SssLayout';

// Composant de carte de configuration
const ConfigCard = ({ title, icon, children, color, badge, loading, onSave, saving }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width={200} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: alpha(color || SSS_COLORS.brand, 0.02),
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          borderColor: alpha(color || SSS_COLORS.brand, 0.3),
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color || SSS_COLORS.brand}, ${alpha(color || SSS_COLORS.brand, 0.3)})`,
          opacity: 0.3,
          transition: 'opacity 0.3s ease'
        },
        '&:hover::before': {
          opacity: 1
        }
      }}
    >
      {badge && (
        <Badge
          badgeContent={badge}
          color="error"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            '& .MuiBadge-badge': {
              fontSize: 10,
              height: 20,
              minWidth: 20,
              fontWeight: 700
            }
          }}
        />
      )}
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            {icon && (
              <Box sx={{
                color: color || SSS_COLORS.brand,
                display: 'flex',
                '& svg': { fontSize: 24 }
              }}>
                {icon}
              </Box>
            )}
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          </Stack>
          <Divider sx={{ opacity: 0.3 }} />
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
};

// Composant d'option de configuration
const ConfigOption = ({ label, description, value, onChange, type = 'text', options = [], ...props }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {label}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {description}
        </Typography>
      )}
      {type === 'switch' ? (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.success.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.08),
                  }
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.success.main,
                }
              }}
            />
          }
          label={value ? 'Activé' : 'Désactivé'}
          sx={{ mr: 0 }}
        />
      ) : type === 'number' ? (
        <TextField
          type="number"
          size="small"
          fullWidth
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
          {...props}
        />
      ) : type === 'time' ? (
        <TextField
          type="time"
          size="small"
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
          {...props}
        />
      ) : type === 'select' ? (
        <TextField
          select
          size="small"
          fullWidth
          value={value}
          onChange={(e) => onChange(e.target.value)}
          SelectProps={{
            sx: { borderRadius: 2 }
          }}
          {...props}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ) : (
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            sx: { borderRadius: 2 }
          }}
          {...props}
        />
      )}
    </Box>
  );
};

// Composant de guide d'initialisation
const SetupGuide = ({ onBackfill, backfilling }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Initialiser les profils',
      description: 'Créez le suivi pour toutes les personnes déjà inscrites',
      icon: <PeopleAltIcon />,
      action: 'Lancer l\'initialisation'
    },
    {
      label: 'Configurer les réglages',
      description: 'Ajustez les paramètres selon vos besoins',
      icon: <SettingsIcon />,
      action: 'Aller aux réglages'
    },
    {
      label: 'Préparer la liste du jour',
      description: 'Générez la liste des personnes à contacter',
      icon: <ScheduleIcon />,
      action: 'Préparer la journée'
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: alpha(SSS_COLORS.brand, 0.02),
        border: `1px solid ${alpha(SSS_COLORS.brand, 0.12)}`,
        mb: 3
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: alpha(SSS_COLORS.brand, 0.1),
          color: SSS_COLORS.brandDark
        }}>
          <PlayArrowIcon />
        </Box>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={600}>
            Guide de mise en route
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Suivez ces étapes pour configurer le module d'accompagnement
          </Typography>
        </Box>
        <Chip
          label="3 étapes"
          size="small"
          variant="outlined"
          sx={{ borderColor: alpha(SSS_COLORS.brand, 0.3), color: SSS_COLORS.brandDark }}
        />
      </Stack>

      <Stepper activeStep={activeStep} orientation="vertical" sx={{
        '& .MuiStepConnector-line': { minHeight: 30 },
        '& .MuiStepLabel-label': {
          fontWeight: activeStep === 0 ? 600 : 400,
          color: activeStep === 0 ? theme.palette.text.primary : theme.palette.text.secondary
        }
      }}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel
              StepIconProps={{
                sx: {
                  '& .MuiStepIcon-root': {
                    color: index === activeStep ? SSS_COLORS.brandDark : theme.palette.grey[400],
                    fontSize: 28
                  }
                }
              }}
            >
              <Typography variant="body2" fontWeight={index === activeStep ? 600 : 400}>
                {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {step.description}
              </Typography>
              <Button
                variant={index === 0 ? 'contained' : 'outlined'}
                size="small"
                onClick={() => {
                  if (index === 0) {
                    onBackfill();
                  } else if (index === 1) {
                    document.getElementById('settings-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (index === 2) {
                    // Navigate to today page
                  }
                }}
                disabled={index === 0 && backfilling}
                startIcon={index === 0 ? <BackfillIcon /> : <ArrowForwardIcon />}
                sx={{
                  borderRadius: 2,
                  ...(index === 0 ? {
                    bgcolor: SSS_COLORS.brand,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: SSS_COLORS.brandDark }
                  } : {
                    borderColor: alpha(SSS_COLORS.brand, 0.3),
                    color: SSS_COLORS.brandDark
                  })
                }}
              >
                {index === 0 && backfilling ? 'Initialisation...' : step.action}
              </Button>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

// Fonctions de conversion
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

const SettingsPage = () => {
  const { globalState } = useContext(AppContext);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
        setConfig(res.data?.data || null);
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
        cursor = cursor[parts[i]];
      }
      cursor[parts[parts.length - 1]] = value;
      return next;
    });

    // Track modified fields
    setModifiedFields(prev =>
      prev.includes(path) ? prev : [...prev, path]
    );
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
        toast.success('Réglages enregistrés avec succès');
        setConfig(res.data?.data || config);
        setModifiedFields([]);
        setSaveDialogOpen(false);
        setSnackbar({ open: true, message: 'Réglages enregistrés', severity: 'success' });
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec de l\'enregistrement');
      setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement', severity: 'error' });
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
        toast.success(res.data?.message || 'Initialisation lancée en arrière-plan');
        setSnackbar({ open: true, message: 'Initialisation lancée', severity: 'success' });
      } else {
        toast.error(res?.data?.message || 'Échec');
        setSnackbar({ open: true, message: 'Erreur lors de l\'initialisation', severity: 'error' });
      }
    } catch (err) {
      if (err?.status === 202) {
        toast.success(err?.data?.message || 'Initialisation lancée');
        setSnackbar({ open: true, message: 'Initialisation lancée', severity: 'success' });
      } else {
        toast.error(err?.data?.message || err?.message || 'Échec');
        setSnackbar({ open: true, message: 'Erreur lors de l\'initialisation', severity: 'error' });
      }
    } finally {
      setBackfilling(false);
    }
  };

  if (loading) {
    return (
      <MainCard title="Réglages d'accompagnement">
        <Box sx={{ p: 3 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Chargement des réglages...
          </Typography>
        </Box>
      </MainCard>
    );
  }

  if (!config) {
    return (
      <MainCard title="Réglages d'accompagnement">
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Réglages indisponibles. Veuillez réessayer.
        </Alert>
      </MainCard>
    );
  }

  const prepTime = cronToTime(config.board?.cronExpression);
  const hasUnsavedChanges = modifiedFields.length > 0;

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: 'background.paper' }}>
      <PageToolbar
        icon={<TuneIcon />}
        title="Réglages"
        subtitle="Ces réglages décident qui apparaît dans la liste du jour et à quel moment. Les valeurs par défaut conviennent déjà à Wekavit — changez-les seulement si nécessaire."
        actions={
          <>
            <GhostButton startIcon={<RefreshIcon />} onClick={load}>
              Actualiser
            </GhostButton>
            <PrimaryButton
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={() => setSaveDialogOpen(true)}
              disabled={saving || !hasUnsavedChanges}
            >
              Enregistrer
              {hasUnsavedChanges && (
                <Chip
                  label={modifiedFields.length}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'white',
                    fontSize: '0.6rem'
                  }}
                />
              )}
            </PrimaryButton>
          </>
        }
      />

      {/* Guide de mise en route */}
      <SetupGuide onBackfill={handleBackfill} backfilling={backfilling} />

      {/* Section d'initialisation */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 3,
          borderColor: alpha(theme.palette.secondary.main, 0.2),
          bgcolor: alpha(theme.palette.secondary.main, 0.02)
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Initialiser les profils
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Créez le suivi de toutes les personnes déjà inscrites (anciennes et nouvelles).
              Cela peut prendre quelques minutes selon le nombre de profils.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<BackfillIcon />}
            onClick={handleBackfill}
            disabled={backfilling}
            sx={{
              borderRadius: 2,
              minWidth: 180,
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }}
          >
            {backfilling ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} color="inherit" />
                <Typography>Initialisation...</Typography>
              </Stack>
            ) : (
              'Initialiser toutes les personnes'
            )}
          </Button>
        </Stack>
      </Paper>

      {/* Section des réglages */}
      <div id="settings-section">
        <Grid container spacing={3}>
          {/* Activation */}
          <Grid item xs={12} md={4}>
            <ConfigCard
              title="Activation"
              icon={<PowerSettingsNewIcon />}
              color={SSS_COLORS.brand}
            >
              <ConfigOption
                label="Module activé"
                type="switch"
                value={config.flags?.enabled}
                onChange={(v) => patch('flags.enabled', v)}
              />
              <ConfigOption
                label="Préparer la liste automatiquement"
                type="switch"
                value={config.flags?.autoBoard}
                onChange={(v) => patch('flags.autoBoard', v)}
                description="Chaque matin, la liste est préparée automatiquement"
              />
              <ConfigOption
                label="Ignorer les comptes inactifs"
                type="switch"
                value={config.flags?.ignoreLost}
                onChange={(v) => patch('flags.ignoreLost', v)}
                description="Ignore les comptes inactifs depuis très longtemps"
              />
            </ConfigCard>
          </Grid>

          {/* Horaire de préparation */}
          <Grid item xs={12} md={4}>
            <ConfigCard
              title="Horaire de préparation"
              icon={<ScheduleIcon />}
              color={theme.palette.info.main}
            >
              <ConfigOption
                label="Heure de préparation"
                type="time"
                value={prepTime}
                onChange={(v) => patch('board.cronExpression', timeToCron(v))}
                description="Du lundi au vendredi à cette heure"
              />
              <ConfigOption
                label="Fuseau horaire"
                type="text"
                value={config.board?.timezone || 'Africa/Bujumbura'}
                onChange={(v) => patch('board.timezone', v)}
              />
              <Box sx={{ mt: 1 }}>
                <Chip
                  icon={<InfoIcon />}
                  label="La liste est préparée automatiquement les jours ouvrés"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Box>
            </ConfigCard>
          </Grid>

          {/* Délais d'inactivité */}
          <Grid item xs={12} md={4}>
            <ConfigCard
              title="Délais d'inactivité"
              icon={<TimerIcon />}
              color={theme.palette.warning.main}
              badge={config.lifecycle?.dormantMinDays > 14 ? 'Ajusté' : undefined}
            >
              <ConfigOption
                label="Compte inactif après"
                type="number"
                value={config.lifecycle?.newAccountGraceDays ?? 7}
                onChange={(v) => patch('lifecycle.newAccountGraceDays', v)}
                description="Sans dépôt depuis l'inscription"
                inputProps={{ min: 0, max: 30 }}
              />
              <ConfigOption
                label="En pause après"
                type="number"
                value={config.lifecycle?.dormantMinDays ?? 14}
                onChange={(v) => patch('lifecycle.dormantMinDays', v)}
                description="Aucune activité récente"
                inputProps={{ min: 0, max: 60 }}
              />
              <ConfigOption
                label="À réveiller après"
                type="number"
                value={config.lifecycle?.reactivateMinDays ?? 30}
                onChange={(v) => patch('lifecycle.reactivateMinDays', v)}
                description="Inactif depuis plus de X jours"
                inputProps={{ min: 0, max: 90 }}
              />
            </ConfigCard>
          </Grid>
        </Grid>
      </div>

      {/* Section avancée */}
      <Box mt={3}>
        <Button
          size="medium"
          onClick={() => setAdvancedOpen((v) => !v)}
          endIcon={advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            bgcolor: alpha(SSS_COLORS.brand, 0.04),
            color: SSS_COLORS.brandDark,
            '&:hover': {
              bgcolor: alpha(SSS_COLORS.brand, 0.08),
            }
          }}
        >
          {advancedOpen ? 'Masquer' : 'Afficher'} les réglages avancés
          {!advancedOpen && (
            <Chip
              label="8 paramètres"
              size="small"
              sx={{ ml: 1, height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Button>

        <Collapse in={advancedOpen} timeout="auto">
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <ConfigCard
                title="Limites de la liste"
                icon={<SpeedIcon />}
                color={SSS_COLORS.brand}
              >
                <ConfigOption
                  label="Actions max par jour"
                  type="number"
                  value={config.board?.maxTasksPerDay ?? 40}
                  onChange={(v) => patch('board.maxTasksPerDay', v)}
                  description="Nombre maximum de personnes à contacter par jour"
                  inputProps={{ min: 1, max: 100 }}
                />
                <ConfigOption
                  label="Reports max avant abandon"
                  type="number"
                  value={config.board?.maxCarry ?? 5}
                  onChange={(v) => patch('board.maxCarry', v)}
                  description="Nombre de reports avant de laisser tomber"
                  inputProps={{ min: 1, max: 20 }}
                />
                <ConfigOption
                  label="Délai entre deux contacts"
                  type="number"
                  value={config.board?.recentContactHours ?? 48}
                  onChange={(v) => patch('board.recentContactHours', v)}
                  description="Ne pas recontacter avant X heures"
                  inputProps={{ min: 1, max: 168 }}
                />
              </ConfigCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <ConfigCard
                title="Seuils d'alerte"
                icon={<NotificationsActiveIcon />}
                color={theme.palette.warning.main}
              >
                <ConfigOption
                  label="Alerte 'jamais déposé'"
                  type="number"
                  value={config.lifecycle?.neverDepositedAlertHours ?? 48}
                  onChange={(v) => patch('lifecycle.neverDepositedAlertHours', v)}
                  description="Heures après l'inscription sans dépôt"
                  inputProps={{ min: 1, max: 168 }}
                />
                <ConfigOption
                  label="Dépôt en attente"
                  type="number"
                  value={config.alerts?.pendingDepositStuckHours ?? 24}
                  onChange={(v) => patch('alerts.pendingDepositStuckHours', v)}
                  description="Heures avant de considérer un dépôt bloqué"
                  inputProps={{ min: 1, max: 72 }}
                />
                <ConfigOption
                  label="Argent qui dort"
                  type="number"
                  value={config.alerts?.idleBalanceMinDays ?? 3}
                  onChange={(v) => patch('alerts.idleBalanceMinDays', v)}
                  description="Jours avant d'alerter sur l'argent non placé"
                  inputProps={{ min: 1, max: 30 }}
                />
                <ConfigOption
                  label="Client important (USD)"
                  type="number"
                  value={config.alerts?.highValueMinUsd ?? 150}
                  onChange={(v) => patch('alerts.highValueMinUsd', v)}
                  description="Seuil pour considérer un client comme important"
                  inputProps={{ min: 0, max: 10000 }}
                />
              </ConfigCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <ConfigCard
                title="Inactivité longue"
                icon={<HistoryIcon />}
                color={theme.palette.error.main}
              >
                <ConfigOption
                  label="Inactif longtemps après"
                  type="number"
                  value={config.lifecycle?.lostMinDays ?? 90}
                  onChange={(v) => patch('lifecycle.lostMinDays', v)}
                  description="Jours sans activité avant de considérer le compte perdu"
                  inputProps={{ min: 30, max: 365 }}
                />
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="caption">
                      Les poids avancés (priorité, santé) restent disponibles via l'API.
                      Cette interface montre les réglages utiles au quotidien.
                    </Typography>
                  </Alert>
                </Box>
              </ConfigCard>
            </Grid>
          </Grid>
        </Collapse>
      </Box>

      {/* Information de sauvegarde */}
      <Box mt={3}>
        <Alert
          severity={hasUnsavedChanges ? 'warning' : 'success'}
          sx={{ borderRadius: 2 }}
          icon={hasUnsavedChanges ? <WarningIcon /> : <CheckCircleIcon />}
        >
          {hasUnsavedChanges ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">
                Vous avez {modifiedFields.length} modification{modifiedFields.length > 1 ? 's' : ''} non enregistrée{modifiedFields.length > 1 ? 's' : ''}.
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => setSaveDialogOpen(true)}
                sx={{ borderRadius: 2, bgcolor: SSS_COLORS.brand, boxShadow: 'none', '&:hover': { bgcolor: SSS_COLORS.brandDark } }}
              >
                Enregistrer maintenant
              </Button>
            </Stack>
          ) : (
            <Typography variant="body2">
              Tous les réglages sont enregistrés
            </Typography>
          )}
        </Alert>
      </Box>

      {/* Dialogue de confirmation de sauvegarde */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <SaveIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Enregistrer les modifications
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Vous êtes sur le point d'enregistrer {modifiedFields.length} modification{modifiedFields.length > 1 ? 's' : ''} dans les réglages.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Champs modifiés :
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, gap: 1 }}>
              {modifiedFields.map((field, index) => (
                <Chip
                  key={index}
                  label={field}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ borderRadius: 2, bgcolor: SSS_COLORS.brand, boxShadow: 'none', '&:hover': { bgcolor: SSS_COLORS.brandDark } }}
          >
            {saving ? 'Enregistrement...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Actions rapides"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        direction="up"
      >
        <SpeedDialAction
          icon={<RefreshIcon />}
          tooltipTitle="Actualiser"
          onClick={load}
        />
        <SpeedDialAction
          icon={<SaveIcon />}
          tooltipTitle="Enregistrer"
          onClick={() => setSaveDialogOpen(true)}
          disabled={!hasUnsavedChanges}
        />
        <SpeedDialAction
          icon={<BackfillIcon />}
          tooltipTitle="Initialiser"
          onClick={handleBackfill}
          disabled={backfilling}
        />
      </SpeedDial>
    </MainCard>
  );
};

export default SettingsPage;