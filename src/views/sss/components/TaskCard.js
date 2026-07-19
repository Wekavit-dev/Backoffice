import React from 'react';
import { PlayArrow as StartIcon, Warning as WarningIcon } from '@mui/icons-material';
import { displayName, URGENCY_COLORS } from '../labels';
import { ActionLabel, PersonAvatar, RankBadge, UrgencyChip } from './Chips';
import { SSS_COLORS, toneColor, PrimaryButton } from './SssLayout';

const stripeColor = (urgency) => {
  const colorKey = URGENCY_COLORS[urgency];
  if (!colorKey || colorKey === 'default') return SSS_COLORS.neutral;
  return toneColor(colorKey);
};

/** Carte mobile minimale — le détail vit dans la modale d'action */
const TaskCard = ({ task, rank, showDate = false, onOpen, animated = true }) => {
  const stripe = stripeColor(task.urgency);
  const isOverdue = showDate && task.date && new Date(task.date) < new Date();

  return (
    <button
      type="button"
      onClick={() => onOpen?.(task)}
      className={`sss-surface relative w-full overflow-hidden p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-sss-brand/30 hover:shadow-sss-md ${
        animated ? 'animate-sss-fade-up' : ''
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: stripe }} />

      <div className="flex items-center justify-between gap-3 pl-2">
        <div className="flex min-w-0 items-center gap-3">
          <RankBadge rank={rank} urgency={task.urgency} size={28} />
          <PersonAvatar user={task.idUser} size={36} />
          <div className="min-w-0">
            <h3 className="m-0 truncate text-sm font-bold text-sss-text">{displayName(task.idUser)}</h3>
            <div className="mt-1">
              <ActionLabel action={task.actionType} size="small" />
            </div>
            {isOverdue && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sss-error">
                <WarningIcon style={{ fontSize: 12 }} />
                En retard
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <UrgencyChip urgency={task.urgency} />
          <PrimaryButton
            size="small"
            startIcon={<StartIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(task);
            }}
            className="!min-h-8 !px-3"
          >
            Traiter
          </PrimaryButton>
        </div>
      </div>
    </button>
  );
};

export default TaskCard;
