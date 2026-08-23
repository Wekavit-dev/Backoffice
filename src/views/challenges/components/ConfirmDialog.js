import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogActions } from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';
import { PrimaryButton, GhostButton, SSS_COLORS } from './ChallengeLayout';

const toneMap = {
  primary: { bg: `${SSS_COLORS.brand}14`, color: SSS_COLORS.brand },
  success: { bg: SSS_COLORS.successSoft, color: SSS_COLORS.success },
  warning: { bg: SSS_COLORS.warningSoft, color: SSS_COLORS.warning },
  error: { bg: SSS_COLORS.errorSoft, color: SSS_COLORS.error }
};

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
}) => {
  const tone = toneMap[confirmColor] || toneMap.warning;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <DialogContent className="!p-0">
        <div className="border-b border-sss-border bg-[#fcfcff] px-5 py-4">
          <div className="flex items-start gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: tone.bg, color: tone.color }}
            >
              <WarningIcon />
            </span>
            <div>
              <h3 className="m-0 text-base font-bold text-sss-text">{title}</h3>
              <p className="sss-muted m-0 mt-2 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions className="!border-t !border-sss-border !bg-white !px-5 !py-4">
        <GhostButton onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </GhostButton>
        <PrimaryButton
          onClick={onConfirm}
          disabled={loading}
          sx={{
            bgcolor: tone.color,
            '&:hover': { bgcolor: tone.color, filter: 'brightness(0.92)' }
          }}
        >
          {loading ? '…' : confirmLabel}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

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
