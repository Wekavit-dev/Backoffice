import React from 'react';
import { Avatar, Chip, Stack, Typography, Box } from '@mui/material';
import {
  STAGE_LABELS,
  URGENCY_LABELS,
  URGENCY_COLORS,
  HEALTH_LABELS,
  HEALTH_COLORS,
  ALERT_LABELS,
  ACTION_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  URGENCY_BG,
  initials,
  avatarColor,
  displayName
} from '../labels';

export const StageChip = ({ stage, size = 'small' }) => (
  <Chip size={size} label={STAGE_LABELS[stage] || stage || '—'} color="primary" variant="outlined" />
);

export const UrgencyChip = ({ urgency, size = 'small' }) => (
  <Chip size={size} label={URGENCY_LABELS[urgency] || urgency || '—'} color={URGENCY_COLORS[urgency] || 'default'} />
);

export const HealthChip = ({ level, score, size = 'small' }) => (
  <Chip
    size={size}
    label={score != null ? `${HEALTH_LABELS[level] || level || '—'} (${score})` : HEALTH_LABELS[level] || level || '—'}
    color={HEALTH_COLORS[level] || 'default'}
  />
);

export const StatusChip = ({ status, size = 'small' }) => (
  <Chip size={size} label={TASK_STATUS_LABELS[status] || status || '—'} color={TASK_STATUS_COLORS[status] || 'default'} />
);

export const ActionLabel = ({ action }) => (
  <Typography variant="body2" fontWeight={600}>
    {ACTION_LABELS[action] || action || '—'}
  </Typography>
);

export const AlertChips = ({ alerts = [], max = 3 }) => {
  if (!alerts.length) {
    return (
      <Typography variant="caption" color="text.secondary">
        Aucune alerte
      </Typography>
    );
  }
  const shown = alerts.slice(0, max);
  const rest = alerts.length - shown.length;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {shown.map((a) => (
        <Chip key={a} size="small" label={ALERT_LABELS[a] || a} color="warning" variant="outlined" />
      ))}
      {rest > 0 && <Chip size="small" label={`+${rest}`} />}
    </Stack>
  );
};

export const EmptyState = ({ title, subtitle, action }) => (
  <Box
    sx={{
      py: 6,
      px: 3,
      textAlign: 'center',
      bgcolor: 'grey.50',
      borderRadius: 2,
      border: '1px dashed',
      borderColor: 'grey.300'
    }}
  >
    <Typography variant="h4" gutterBottom>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 420, mx: 'auto' }}>
        {subtitle}
      </Typography>
    )}
    {action}
  </Box>
);

export const StatCard = ({ title, value, hint, color = 'primary.main', icon, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: 2,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderTop: '3px solid',
      borderTopColor: color,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow .2s, transform .2s',
      '&:hover': onClick
        ? {
            boxShadow: 3,
            transform: 'translateY(-2px)'
          }
        : undefined
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {title}
      </Typography>
      {icon && <Box sx={{ color, opacity: 0.85, display: 'flex' }}>{icon}</Box>}
    </Stack>
    <Typography variant="h2" sx={{ color, mt: 0.5, mb: 0.5 }}>
      {value}
    </Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    )}
  </Box>
);

export const PersonAvatar = ({ user, size = 32 }) => (
  <Avatar sx={{ width: size, height: size, fontSize: size * 0.42, bgcolor: avatarColor(user), fontWeight: 700 }}>
    {initials(user)}
  </Avatar>
);

export const RankBadge = ({ rank, urgency, size = 28 }) => (
  <Avatar
    sx={{
      width: size,
      height: size,
      fontSize: size * 0.45,
      fontWeight: 700,
      bgcolor: URGENCY_BG[urgency] || 'grey.400',
      color: '#fff'
    }}
  >
    {rank}
  </Avatar>
);

export const PersonCell = ({ user, phone }) => (
  <Stack direction="row" spacing={1.25} alignItems="center">
    <PersonAvatar user={user} />
    <Box>
      <Typography variant="subtitle2">{displayName(user)}</Typography>
      {phone !== undefined && (
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {phone}
        </Typography>
      )}
    </Box>
  </Stack>
);
