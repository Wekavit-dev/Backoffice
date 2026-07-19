import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Stack,
  Box,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  OpenInNew as OpenIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { displayName, maskPhone, telHref, whatsappHref, formatDateFr } from '../labels';
import { AlertChips, PersonAvatar, StageChip, UrgencyChip, HealthChip } from './Chips';
import { PrimaryButton, GhostButton, SSS_COLORS } from './SssLayout';

/**
 * Aperçu personne — infos secondaires hors liste.
 */
const PersonPreviewDialog = ({ open, profile, onClose, onOpenFiche }) => {
  if (!profile) return null;

  const user = profile.idUser || {};
  const phone = user.phone;
  const daysSince = profile.ledgerSnapshot?.daysSinceLastActivity;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: `${SSS_COLORS.brand}08`,
          borderBottom: `1px solid ${SSS_COLORS.brandBorder}`,
          py: 2
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Détails
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonAvatar user={user} size={52} />
            <Box minWidth={0}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {displayName(user)}
              </Typography>
              {phone && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {maskPhone(phone)}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <UrgencyChip urgency={profile.urgency} />
            <StageChip stage={profile.stage} />
            <HealthChip level={profile.healthLevel} score={profile.healthScore} />
          </Stack>

          <Divider />

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
              Activité
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.75}>
              <AccessTimeIcon sx={{ fontSize: 16, color: SSS_COLORS.muted }} />
              <Typography variant="body2">
                {daysSince != null
                  ? `Dernière activité il y a ${daysSince} jour${daysSince > 1 ? 's' : ''}`
                  : formatDateFr(profile.ledgerSnapshot?.lastActivityAt)}
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
              Alertes
            </Typography>
            <Box mt={0.75}>
              <AlertChips alerts={profile.alerts} max={5} />
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        {phone && (
          <>
            <GhostButton size="small" startIcon={<CallIcon />} href={telHref(phone)} component="a">
              Appeler
            </GhostButton>
            <GhostButton
              size="small"
              startIcon={<WhatsAppIcon />}
              href={whatsappHref(phone)}
              component="a"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </GhostButton>
          </>
        )}
        <PrimaryButton size="small" startIcon={<OpenIcon />} onClick={onOpenFiche} sx={{ ml: 'auto !important' }}>
          Ouvrir la fiche
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default PersonPreviewDialog;
