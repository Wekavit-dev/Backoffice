import React from 'react';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { HEALTH_LABELS, HEALTH_COLORS } from '../labels';

const LEVEL_ORDER = ['critical', 'watch', 'good', 'excellent'];
const BAR_COUNT = 4;

/**
 * Human-friendly stand-in for a raw 0-100 score: a short word + a small bar
 * meter (like a signal or battery indicator), so anyone can read it at a
 * glance without needing to interpret a number.
 */
const HealthMeter = ({ level, score, dense = false }) => {
  const idx = Math.max(0, LEVEL_ORDER.indexOf(level));
  const color = HEALTH_COLORS[level] || 'default';
  const label = HEALTH_LABELS[level] || 'Inconnu';
  const barColor = color === 'default' ? 'grey.400' : `${color}.main`;

  return (
    <Tooltip title={score != null ? `Indicateur interne : ${score} sur 100` : ''}>
      <Stack spacing={0.5} sx={{ minWidth: dense ? 72 : 92 }}>
        <Typography variant="caption" fontWeight={700} color={color === 'default' ? 'text.secondary' : `${color}.main`}>
          {label}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <Box
              key={i}
              sx={{
                height: 6,
                flex: 1,
                borderRadius: 3,
                bgcolor: i <= idx ? barColor : 'grey.200'
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Tooltip>
  );
};

export default HealthMeter;
