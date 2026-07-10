import React from 'react';
import { Box, Button, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Visibility as ViewIcon, Call as CallIcon, WhatsApp as WhatsAppIcon } from '@mui/icons-material';
import { displayName, maskPhone, telHref, whatsappHref, formatDateFr } from '../labels';
import { AlertChips, PersonAvatar, StageChip, UrgencyChip } from './Chips';
import HealthMeter from './HealthMeter';

/**
 * Mobile-friendly alternative to a dense table row for the people list.
 */
const PersonCard = ({ profile, onOpen }) => {
  const user = profile.idUser || {};
  const phone = user.phone;
  const daysSince = profile.ledgerSnapshot?.daysSinceLastActivity;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <PersonAvatar user={user} size={40} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {displayName(user)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {maskPhone(phone)}
            </Typography>
          </Box>
        </Stack>
        <UrgencyChip urgency={profile.urgency} />
      </Stack>

      <Stack direction="row" spacing={1.5} mt={1.5} flexWrap="wrap" useFlexGap alignItems="center">
        <StageChip stage={profile.stage} />
        <HealthMeter level={profile.healthLevel} score={profile.healthScore} dense />
      </Stack>

      <Box mt={1}>
        <AlertChips alerts={profile.alerts} max={3} />
      </Box>

      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        Dernière activité : {formatDateFr(profile.ledgerSnapshot?.lastActivityAt)}
        {daysSince != null ? ` (il y a ${daysSince} j)` : ''}
      </Typography>

      <Divider sx={{ my: 1.5 }} />

      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
        {phone && (
          <>
            <Tooltip title="Appeler">
              <IconButton size="small" color="primary" onClick={() => { window.location.href = telHref(phone); }}>
                <CallIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="WhatsApp">
              <IconButton size="small" color="success" onClick={() => window.open(whatsappHref(phone), '_blank', 'noopener')}>
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Button size="small" variant="outlined" startIcon={<ViewIcon />} onClick={onOpen} sx={{ flexGrow: 1 }}>
          Voir la fiche
        </Button>
      </Stack>
    </Paper>
  );
};

export default PersonCard;
