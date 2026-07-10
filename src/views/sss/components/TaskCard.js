import React from 'react';
import { Box, Button, Divider, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import {
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  EventRepeat as CarryIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import { displayName, maskPhone, telHref, whatsappHref, URGENCY_BG } from '../labels';
import { ActionLabel, AlertChips, PersonAvatar, RankBadge, StageChip, StatusChip } from './Chips';

/**
 * Mobile-friendly alternative to a dense table row: everything needed to
 * decide and act on one task, stacked vertically, with big tap targets.
 * Used by both "today" and "overdue" screens (phones & narrow tablets).
 */
const TaskCard = ({ task, rank, showDate = false, onOpen, onCarry, onCopy, onView }) => {
  const phone = task.idUser?.phone;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderLeft: '4px solid',
        borderLeftColor: URGENCY_BG[task.urgency] || 'grey.400',
        bgcolor: task.status === 'carried_over' ? 'warning.lighter' : 'background.paper'
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
          <RankBadge rank={rank} urgency={task.urgency} size={26} />
          <PersonAvatar user={task.idUser} size={36} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {displayName(task.idUser)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {maskPhone(phone)}
            </Typography>
          </Box>
        </Stack>
        <StatusChip status={task.status} />
      </Stack>

      {showDate && (
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Prévu le {task.date}
          {task.originDate && task.originDate !== task.date ? ` (depuis ${task.originDate})` : ''}
        </Typography>
      )}

      <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" useFlexGap alignItems="center">
        <ActionLabel action={task.actionType} />
        <StageChip stage={task.stageSnapshot} />
      </Stack>

      {task.carryCount > 0 && (
        <Typography variant="caption" color="warning.main" display="block" mt={0.5}>
          Reporté {task.carryCount}×
        </Typography>
      )}

      <Box mt={1}>
        <AlertChips alerts={task.alertsSnapshot} max={3} />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
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
        {task.templateSnapshot && onCopy && (
          <Tooltip title="Copier le message">
            <IconButton size="small" onClick={() => onCopy(task.templateSnapshot)}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Voir la fiche">
          <IconButton size="small" onClick={() => onView(task)}>
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reporter">
          <IconButton size="small" onClick={() => onCarry(task)}>
            <CarryIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Button fullWidth variant="contained" startIcon={<StartIcon />} onClick={() => onOpen(task)} sx={{ mt: 1 }}>
        Traiter
      </Button>
    </Paper>
  );
};

export default TaskCard;
