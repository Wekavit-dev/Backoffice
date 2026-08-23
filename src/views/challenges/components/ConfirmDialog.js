import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
  loading = false
}) => (
  <Dialog
    open={open}
    onClose={loading ? undefined : onCancel}
    maxWidth="xs"
    fullWidth
    PaperProps={{ sx: { borderRadius: 2 } }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: confirmColor === 'error' ? 'error.light' : 'warning.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: confirmColor === 'error' ? 'error.dark' : 'warning.dark'
          }}
        >
          <WarningIcon />
        </Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {message}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
      <Button onClick={onCancel} variant="outlined" disabled={loading}>
        {cancelLabel}
      </Button>
      <Button onClick={onConfirm} variant="contained" color={confirmColor} disabled={loading}>
        {loading ? '...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

ConfirmDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmColor: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default ConfirmDialog;
