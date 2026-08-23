import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  OutlinedInput,
  Alert
} from '@mui/material';
import ConfirmDialog from './ConfirmDialog';
import {
  GAME_MODES,
  RULE_CATEGORY_LABELS,
  VALUE_TYPE_LABELS,
  formatRuleBounds
} from '../utils/challengeUi';
import { isFormDirty } from '../utils/formDirty';

const buildFormFromRule = (rule) => ({
  name: rule.name || '',
  description: rule.description || '',
  defaultValue: rule.defaultValue ?? 0,
  min: rule.min ?? 0,
  max: rule.max ?? '',
  valueType: rule.valueType || 'number',
  isActive: rule.isActive !== false,
  appliesToModes: rule.appliesToModes || []
});

const EditRuleTemplateModal = ({ open, rule, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState(null);
  const [baselineForm, setBaselineForm] = useState(null);
  const [error, setError] = useState('');
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open || !rule) {
      setForm(null);
      setBaselineForm(null);
      setError('');
      setDiscardConfirmOpen(false);
      return;
    }

    const next = buildFormFromRule(rule);
    setForm(next);
    setBaselineForm(next);
  }, [open, rule]);

  if (!form || !rule) return null;

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
    onClose();
  };

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    setError('');
    if (!form.name.trim()) {
      setError('Le nom de la règle est requis.');
      return;
    }
    if (!form.appliesToModes.length) {
      setError('Choisissez au moins un type de défi.');
      return;
    }

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      defaultValue: Number(form.defaultValue) || 0,
      min: Number(form.min) || 0,
      max: form.max === '' || form.max == null ? null : Number(form.max),
      valueType: form.valueType,
      isActive: Boolean(form.isActive),
      appliesToModes: form.appliesToModes
    });
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
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Modifier la règle
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {rule.slug} · {RULE_CATEGORY_LABELS[rule.category] || rule.category}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Nom affiché"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Description complète"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              multiline
              minRows={3}
              helperText="Expliquez clairement à quoi sert cette règle et comment elle impacte le score ou le déroulement."
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Type de valeur</InputLabel>
              <Select
                value={form.valueType}
                label="Type de valeur"
                onChange={(e) => handleChange('valueType', e.target.value)}
              >
                {Object.entries(VALUE_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Valeur par défaut"
              value={form.defaultValue}
              onChange={(e) => handleChange('defaultValue', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ pt: 0.5 }}>
              <FormControlLabel
                control={
                  <Switch checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />
                }
                label={form.isActive ? 'Règle active' : 'Règle désactivée'}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Minimum autorisé"
              value={form.min}
              onChange={(e) => handleChange('min', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Maximum autorisé (vide = illimité)"
              value={form.max}
              onChange={(e) => handleChange('max', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Types de défis concernés</InputLabel>
              <Select
                multiple
                value={form.appliesToModes}
                onChange={(e) => handleChange('appliesToModes', e.target.value)}
                input={<OutlinedInput label="Types de défis concernés" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} size="small" label={GAME_MODES.find((m) => m.value === value)?.label || value} />
                    ))}
                  </Box>
                )}
              >
                {GAME_MODES.map((mode) => (
                  <MenuItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Plage actuelle : {formatRuleBounds({ min: form.min, max: form.max === '' ? null : form.max })} · Catégorie :{' '}
              {RULE_CATEGORY_LABELS[rule.category] || rule.category}
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleRequestClose} variant="outlined">
          Annuler
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer la règle'}
        </Button>
      </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={discardConfirmOpen}
        title="Abandonner les modifications ?"
        message="Les changements non enregistrés seront perdus. Voulez-vous vraiment fermer ce formulaire ?"
        confirmLabel="Abandonner"
        confirmColor="warning"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardConfirmOpen(false)}
      />
    </>
  );
};

EditRuleTemplateModal.propTypes = {
  open: PropTypes.bool,
  rule: PropTypes.object,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool
};

export default EditRuleTemplateModal;
