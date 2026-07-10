import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Consistent page header used across the Accompagnement (SSS) module:
 * a colored icon badge + a short eyebrow + a big plain-language title + a
 * one-sentence explanation. Same shape everywhere so users learn it once.
 */
const PageHeader = ({ icon, eyebrow, title, subtitle, color = 'primary' }) => {
  const theme = useTheme();
  const mainColor = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Stack direction="row" spacing={{ xs: 1.25, sm: 2 }} alignItems="flex-start" sx={{ maxWidth: '100%' }}>
      {icon && (
        <Box
          sx={{
            width: { xs: 36, sm: 48 },
            height: { xs: 36, sm: 48 },
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(mainColor, 0.12),
            color: mainColor,
            flexShrink: 0,
            '& svg': { fontSize: { xs: 20, sm: 24 } }
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {eyebrow && (
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8, lineHeight: 1.6 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h3" sx={{ lineHeight: 1.25, fontSize: { xs: '1.15rem', sm: '1.5rem' } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default PageHeader;
