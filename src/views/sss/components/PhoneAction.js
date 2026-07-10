import React, { useState } from 'react';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Call as CallIcon, WhatsApp as WhatsAppIcon, Visibility as ShowIcon, VisibilityOff as HideIcon } from '@mui/icons-material';
import { maskPhone, telHref, whatsappHref } from '../labels';

/**
 * Shows a phone number masked by default (privacy) while still letting the
 * admin call or WhatsApp the person in one tap — the number itself is only
 * revealed if explicitly requested. Works from a table cell or a full page.
 */
const PhoneAction = ({ phone, size = 'medium', allowReveal = true, showActions = true }) => {
  const [revealed, setRevealed] = useState(false);

  if (!phone) {
    return (
      <Typography variant="body2" color="text.secondary">
        Numéro non renseigné
      </Typography>
    );
  }

  const isSmall = size === 'small';

  const handleCall = (e) => {
    e.stopPropagation();
    window.location.href = telHref(phone);
  };
  const handleWhatsapp = (e) => {
    e.stopPropagation();
    window.open(whatsappHref(phone), '_blank', 'noopener');
  };

  return (
    <Stack direction="row" spacing={0.25} alignItems="center">
      <Typography
        variant={isSmall ? 'caption' : 'subtitle1'}
        color={isSmall ? 'text.secondary' : 'text.primary'}
        sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}
      >
        {revealed ? phone : maskPhone(phone)}
      </Typography>
      {allowReveal && (
        <Tooltip title={revealed ? 'Cacher le numéro' : 'Afficher le numéro'}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setRevealed((v) => !v); }}>
            {revealed ? <HideIcon fontSize="inherit" /> : <ShowIcon fontSize="inherit" />}
          </IconButton>
        </Tooltip>
      )}
      {showActions && (
        <>
          <Tooltip title="Appeler">
            <IconButton size="small" color="primary" onClick={handleCall}>
              <CallIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Écrire sur WhatsApp">
            <IconButton size="small" color="success" onClick={handleWhatsapp}>
              <WhatsAppIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Stack>
  );
};

export default PhoneAction;
