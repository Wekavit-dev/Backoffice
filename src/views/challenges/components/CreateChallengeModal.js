import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert
} from '@mui/material';
import { Close as CloseIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';
import ConfirmDialog from './ConfirmDialog';
import CoverImageField from './CoverImageField';
import { PrimaryButton, GhostButton, fieldSx, CHALLENGE_ACCENT } from './ChallengeLayout';
import {
  FREQUENCIES,
  GAME_MODES,
  getGameModeMeta,
  formatDateInput
} from '../utils/challengeUi';
import { isFormDirty } from '../utils/formDirty';

const defaultForm = () => {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);

  return {
    name: '',
    description: '',
    coverImage: '',
    idTypeEpargne: '',
    idDevise: '',
    goalAmount: '',
    contributionAmount: '',
    contributionFrequency: 'weekly',
    startDate: formatDateInput(start),
    endDate: formatDateInput(end),
    gameMode: 'fixed_schedule',
    maxParticipants: '',
    winnerCount: 3,
    prizeDescription: '',
    featured: false
  };
};

const CreateChallengeModal = ({ open, onClose, onSubmit, isSubmitting, savingTypes, devises }) => {
  const [form, setForm] = useState(defaultForm);
  const [baselineForm, setBaselineForm] = useState(null);
  const [error, setError] = useState('');
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm());
      setBaselineForm(null);
      setError('');
      setDiscardConfirmOpen(false);
      return;
    }

    const next = defaultForm();
    next.idTypeEpargne = savingTypes[0]?._id || '';
    next.idDevise = devises[0]?._id || '';
    setForm(next);
    setBaselineForm(next);
  }, [open, savingTypes, devises]);

  const modeMeta = useMemo(() => getGameModeMeta(form.gameMode), [form.gameMode]);
  const dirty = isFormDirty(form, baselineForm);

  const handleRequestClose = () => {
    if (dirty) {
      setDiscardConfirmOpen(true);
      return;
    }
    onClose();
  };

  const handleConfirmDiscard = () => {
    setDiscardConfirmOpen(false);
    setForm(defaultForm());
    onClose();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.idTypeEpargne || !form.idDevise || !form.goalAmount || !form.endDate) {
      setError('Nom, type d’épargne, devise, objectif et date de fin sont requis.');
      return;
    }

    if (modeMeta.requiresContributionAmount && !Number(form.contributionAmount)) {
      setError('Ce type de défi exige un montant à verser à chaque échéance.');
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError('La date de fin doit être après la date de début.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      coverImage: form.coverImage.trim() || undefined,
      idTypeEpargne: form.idTypeEpargne,
      idDevise: form.idDevise,
      goalAmount: Number(form.goalAmount),
      contributionAmount: Number(form.contributionAmount) || 0,
      contributionFrequency: form.contributionFrequency,
      startDate: form.startDate,
      endDate: form.endDate,
      gameMode: form.gameMode,
      maxParticipants: Number(form.maxParticipants) || 0,
      winnerCount: Math.max(Number(form.winnerCount) || 3, 1),
      prizeDescription: form.prizeDescription.trim() || undefined,
      featured: Boolean(form.featured)
    };

    onSubmit(payload, () => setForm(defaultForm()));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
            handleRequestClose();
            return;
          }
          handleRequestClose();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(17, 24, 39, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, bgcolor: '#fcfcff', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: CHALLENGE_ACCENT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 8px 20px ${CHALLENGE_ACCENT}55`
              }}
            >
              <TrophyIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Nouveau défi d’épargne
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Créé en brouillon — rendez-le visible ensuite depuis le détail du défi
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleRequestClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ pt: 2, bgcolor: '#fafbff' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Nom du défi"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                minRows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <CoverImageField
                value={form.coverImage}
                onChange={(value) => handleChange('coverImage', value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Type d’épargne</InputLabel>
                <Select
                  value={form.idTypeEpargne}
                  label="Type d’épargne"
                  onChange={(e) => handleChange('idTypeEpargne', e.target.value)}
                >
                  {savingTypes.map((type) => (
                    <MenuItem key={type._id} value={type._id}>
                      {type.designation || type.nom || type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Devise</InputLabel>
                <Select value={form.idDevise} label="Devise" onChange={(e) => handleChange('idDevise', e.target.value)}>
                  {devises.map((devise) => (
                    <MenuItem key={devise._id} value={devise._id}>
                      {devise.nom || devise.unite} {devise.unite ? `(${devise.unite})` : ''}
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
                label="Objectif d’épargne"
                value={form.goalAmount}
                onChange={(e) => handleChange('goalAmount', e.target.value)}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type de défi</InputLabel>
                <Select value={form.gameMode} label="Type de défi" onChange={(e) => handleChange('gameMode', e.target.value)}>
                  {GAME_MODES.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{modeMeta.description}</FormHelperText>
              </FormControl>
            </Grid>

            {modeMeta.requiresContributionAmount && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Montant à verser à chaque échéance"
                  value={form.contributionAmount}
                  onChange={(e) => handleChange('contributionAmount', e.target.value)}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>
            )}

            {modeMeta.requiresContributionFrequency && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Fréquence des versements</InputLabel>
                  <Select
                    value={form.contributionFrequency}
                    label="Fréquence des versements"
                    onChange={(e) => handleChange('contributionFrequency', e.target.value)}
                  >
                    {FREQUENCIES.map((freq) => (
                      <MenuItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date de début"
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date de fin"
                value={form.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                sx={fieldSx}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Nombre max. de participants (0 = illimité)"
                value={form.maxParticipants}
                onChange={(e) => handleChange('maxParticipants', e.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Nombre de gagnants"
                value={form.winnerCount}
                onChange={(e) => handleChange('winnerCount', e.target.value)}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description des récompenses"
                value={form.prizeDescription}
                onChange={(e) => handleChange('prizeDescription', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: '#fff', borderTop: '1px solid', borderColor: 'divider' }}>
          <GhostButton onClick={handleRequestClose}>Annuler</GhostButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création…' : 'Créer le brouillon'}
          </PrimaryButton>
        </DialogActions>
      </form>
      </Dialog>

      <ConfirmDialog
        open={discardConfirmOpen}
        title="Abandonner la création ?"
        message="Des modifications non enregistrées seront perdues. Voulez-vous vraiment fermer ce formulaire ?"
        confirmLabel="Abandonner"
        confirmColor="warning"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />
    </>
  );
};

CreateChallengeModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool,
  savingTypes: PropTypes.array,
  devises: PropTypes.array
};

CreateChallengeModal.defaultProps = {
  savingTypes: [],
  devises: []
};

export default CreateChallengeModal;
