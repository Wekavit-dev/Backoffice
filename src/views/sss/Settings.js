import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  CloudDownload as BackfillIcon,
  Tune as TuneIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import PageHeader from './components/PageHeader';

// The daily list is always prepared Monday to Friday — only the time is configurable.
// Cron format kept under the hood as "<minute> <hour> * * 1-5".
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [config, setConfig] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const res = await SssApi.getConfig(globalState.key);
      if (res?.status === 200) setConfig(res.data?.data || null);
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les réglages');
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
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Échec de l’enregistrement');
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
      } else {
        toast.error(res?.data?.message || 'Échec');
      }
    } catch (err) {
      // 202 may be rejected by handleResponse — treat message as success if present
      if (err?.status === 202) {
        toast.success(err?.data?.message || 'Initialisation lancée');
      } else {
        toast.error(err?.data?.message || err?.message || 'Échec');
      }
    } finally {
      setBackfilling(false);
    }
  };

  if (loading) {
    return (
      <MainCard title="Réglages d’accompagnement">
        <LinearProgress />
      </MainCard>
    );
  }

  if (!config) {
    return (
      <MainCard title="Réglages d’accompagnement">
        <Alert severity="error">Réglages indisponibles</Alert>
      </MainCard>
    );
  }

  const prepTime = cronToTime(config.board?.cronExpression);

  return (
    <MainCard
      title={
        <PageHeader
          icon={<TuneIcon />}
          eyebrow="Accompagnement"
          title="Réglages"
          subtitle="Ces réglages décident qui apparaît dans la liste du jour et à quel moment. Les valeurs par défaut conviennent déjà à Wekavit — changez-les seulement si nécessaire."
          color="secondary"
        />
      }
      secondary={
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
          {isXs ? (
            <Tooltip title="Actualiser">
              <IconButton size="small" onClick={load}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button startIcon={<RefreshIcon />} onClick={load} size="small">
              Actualiser
            </Button>
          )}
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} size="small">
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </Stack>
      }
      sx={{ '& .MuiCardHeader-content': { minWidth: 0 } }}
      contentSX={{ p: { xs: 1.5, sm: 3 } }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 }, mb: 3, mt: 1 }}>
        <Typography variant="h4" gutterBottom>
          Première mise en route
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Cliquez une fois pour créer le suivi de toutes les personnes déjà inscrites (anciennes et nouvelles). Cela peut
          prendre quelques minutes.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<BackfillIcon />}
          onClick={handleBackfill}
          disabled={backfilling}
        >
          {backfilling ? 'Initialisation…' : 'Initialiser toutes les personnes'}
        </Button>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Activation
            </Typography>
            <FormControlLabel
              control={
                <Switch checked={Boolean(config.flags?.enabled)} onChange={(e) => patch('flags.enabled', e.target.checked)} />
              }
              label="Module activé"
            />
            <FormControlLabel
              control={
                <Switch checked={Boolean(config.flags?.autoBoard)} onChange={(e) => patch('flags.autoBoard', e.target.checked)} />
              }
              label="Préparer la liste automatiquement chaque matin"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(config.flags?.ignoreLost)}
                  onChange={(e) => patch('flags.ignoreLost', e.target.checked)}
                />
              }
              label="Ignorer les comptes inactifs depuis très longtemps"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Chaque jour, du lundi au vendredi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              À cette heure, la liste des personnes à contacter est préparée automatiquement.
            </Typography>
            <TextField
              type="time"
              label="Heure de préparation"
              value={prepTime}
              onChange={(e) => patch('board.cronExpression', timeToCron(e.target.value))}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Délais d’inactivité (jours)
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                type="number"
                size="small"
                fullWidth
                label="Compte inactif après"
                helperText="Sans dépôt depuis l’inscription"
                value={config.lifecycle?.newAccountGraceDays ?? 7}
                onChange={(e) => patch('lifecycle.newAccountGraceDays', Number(e.target.value))}
              />
              <TextField
                type="number"
                size="small"
                fullWidth
                label="En pause après"
                helperText="Aucune activité récente"
                value={config.lifecycle?.dormantMinDays ?? 14}
                onChange={(e) => patch('lifecycle.dormantMinDays', Number(e.target.value))}
              />
              <TextField
                type="number"
                size="small"
                fullWidth
                label="À réveiller après"
                value={config.lifecycle?.reactivateMinDays ?? 30}
                onChange={(e) => patch('lifecycle.reactivateMinDays', Number(e.target.value))}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Button
          size="small"
          onClick={() => setAdvancedOpen((v) => !v)}
          endIcon={<ExpandMoreIcon sx={{ transform: advancedOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
        >
          Réglages avancés
        </Button>
        <Collapse in={advancedOpen}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Limites de la liste du jour
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    type="number"
                    label="Nombre max d’actions par jour"
                    value={config.board?.maxTasksPerDay ?? 40}
                    onChange={(e) => patch('board.maxTasksPerDay', Number(e.target.value))}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    type="number"
                    label="Reports max avant abandon"
                    value={config.board?.maxCarry ?? 5}
                    onChange={(e) => patch('board.maxCarry', Number(e.target.value))}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    type="number"
                    label="Ne pas recontacter avant (heures)"
                    value={config.board?.recentContactHours ?? 48}
                    onChange={(e) => patch('board.recentContactHours', Number(e.target.value))}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Fuseau horaire"
                    value={config.board?.timezone || 'Africa/Bujumbura'}
                    onChange={(e) => patch('board.timezone', e.target.value)}
                  />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Seuils d’alerte
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="Alerte « jamais déposé » après (heures)"
                    value={config.lifecycle?.neverDepositedAlertHours ?? 48}
                    onChange={(e) => patch('lifecycle.neverDepositedAlertHours', Number(e.target.value))}
                  />
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="Dépôt en attente trop long (heures)"
                    value={config.alerts?.pendingDepositStuckHours ?? 24}
                    onChange={(e) => patch('alerts.pendingDepositStuckHours', Number(e.target.value))}
                  />
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="Argent qui dort — jours min"
                    value={config.alerts?.idleBalanceMinDays ?? 3}
                    onChange={(e) => patch('alerts.idleBalanceMinDays', Number(e.target.value))}
                  />
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="Client important à partir de (USD approx.)"
                    value={config.alerts?.highValueMinUsd ?? 150}
                    onChange={(e) => patch('alerts.highValueMinUsd', Number(e.target.value))}
                  />
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  Inactivité longue durée (jours)
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    label="Inactif longtemps après"
                    value={config.lifecycle?.lostMinDays ?? 90}
                    onChange={(e) => patch('lifecycle.lostMinDays', Number(e.target.value))}
                  />
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Les poids avancés (priorité, santé) restent disponibles via l’API. L’interface montre ici les réglages
                  utiles au quotidien.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Collapse>
      </Box>

      <Box mt={3}>
        <Alert severity="info">
          Après avoir initialisé les personnes, allez dans « Vue du jour » puis cliquez sur « Préparer la journée ».
        </Alert>
      </Box>
    </MainCard>
  );
};

export default SettingsPage;
