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
  IconButton,
  LinearProgress
} from '@mui/material';
import { Close as CloseIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

const AddAdminModal = ({ open, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({ nom: '', email: '', password: '' });

  useEffect(() => {
    if (!open) setForm({ nom: '', email: '', password: '' });
  }, [open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form, () => setForm({ nom: '', email: '', password: '' }));
  };

  const passwordStrength =
    form.password.length >= 10 ? 100 : form.password.length >= 6 ? 66 : form.password.length > 0 ? 33 : 0;
  const strengthLabel =
    form.password.length >= 10 ? 'Fort' : form.password.length >= 6 ? 'Moyen' : form.password.length > 0 ? 'Faible' : '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <PersonAddIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Nouvel administrateur
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Créez le profil, puis assignez ses menus
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ pt: 2 }}>
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              fullWidth
              label="Nom complet"
              value={form.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              required
              size="small"
            />
            <TextField
              fullWidth
              label="Email professionnel"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              size="small"
            />
            <Box>
              <TextField
                fullWidth
                label="Mot de passe temporaire"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                size="small"
                inputProps={{ minLength: 6 }}
              />
              {form.password && (
                <Box sx={{ mt: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Force du mot de passe
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="primary.main">
                      {strengthLabel}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    color={passwordStrength >= 100 ? 'success' : passwordStrength >= 66 ? 'warning' : 'error'}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le profil'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

AddAdminModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool
};

export default AddAdminModal;
