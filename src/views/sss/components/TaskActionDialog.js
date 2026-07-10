import React, { useState } from 'react';
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
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ACTION_LABELS, OUTCOME_OPTIONS, TASK_STATUS_LABELS, displayName } from '../labels';
import { ActionLabel, PersonAvatar, UrgencyChip, StageChip } from './Chips';
import PhoneAction from './PhoneAction';

const STATUS_CHOICES = [
  { value: 'in_progress', label: 'Je commence' },
  { value: 'done', label: 'Terminé' },
  { value: 'partial', label: 'Partiel (à reprendre)' },
  { value: 'blocked', label: 'Bloqué' },
  { value: 'skipped', label: 'Ignorer' }
];

/**
 * Dialog to update a daily task after the admin contacts someone.
 * Keeps wording simple: what did you do, how far, what happened.
 */
const TaskActionDialog = ({ open, task, onClose, onSave, saving }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [status, setStatus] = useState('done');
  const [completionDegree, setCompletionDegree] = useState(100);
  const [outcome, setOutcome] = useState('reached');
  const [adminNotes, setAdminNotes] = useState('');
  const [snoozeDays, setSnoozeDays] = useState('');

  React.useEffect(() => {
    if (open && task) {
      setStatus(task.status === 'todo' || task.status === 'carried_over' ? 'done' : task.status);
      setCompletionDegree(task.completionDegree || 100);
      setOutcome(task.outcome || 'reached');
      setAdminNotes(task.adminNotes || '');
      setSnoozeDays('');
    }
  }, [open, task]);

  if (!task) return null;

  const person = displayName(task.idUser);
  const message = task.templateSnapshot;

  const handleSubmit = () => {
    const payload = {
      status,
      completionDegree: Number(completionDegree),
      outcome: status === 'skipped' || status === 'blocked' ? null : outcome,
      adminNotes: adminNotes.trim() || undefined
    };
    if (snoozeDays) payload.snoozeDays = Number(snoozeDays);
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Mettre à jour l&apos;action</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PersonAvatar user={task.idUser} size={40} />
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
                  Personne
                </Typography>
                <Typography variant="h4">{person}</Typography>
              </Box>
            </Stack>
            <Box mt={1}>
              <PhoneAction phone={task.idUser?.phone} size="small" />
            </Box>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
              <ActionLabel action={task.actionType} />
              <UrgencyChip urgency={task.urgency} />
              <StageChip stage={task.stageSnapshot} />
            </Stack>
          </Box>

          {message && (
            <Alert severity="info" sx={{ whiteSpace: 'pre-wrap' }}>
              <Typography variant="subtitle2" gutterBottom>
                Message suggéré (à copier)
              </Typography>
              {message}
            </Alert>
          )}

          <Divider />

          <TextField select label="Où en êtes-vous ?" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
            {STATUS_CHOICES.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          <Box>
            <Typography variant="body2" gutterBottom>
              Avancement : {completionDegree}%
            </Typography>
            <Slider
              value={completionDegree}
              onChange={(_, v) => setCompletionDegree(v)}
              step={10}
              marks
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>

          {status !== 'skipped' && status !== 'blocked' && (
            <TextField select label="Résultat du contact" value={outcome} onChange={(e) => setOutcome(e.target.value)} fullWidth>
              {OUTCOME_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Note rapide (optionnel)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Ex. : Rappeler samedi après son salaire"
          />

          <TextField
            label="Ne plus contacter pendant (jours)"
            type="number"
            value={snoozeDays}
            onChange={(e) => setSnoozeDays(e.target.value)}
            fullWidth
            helperText="Laissez vide si vous voulez pouvoir le recontacter demain"
            inputProps={{ min: 1, max: 90 }}
          />

          <Typography variant="caption" color="text.secondary">
            Statut actuel : {TASK_STATUS_LABELS[task.status]} · Action : {ACTION_LABELS[task.actionType]}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskActionDialog;
