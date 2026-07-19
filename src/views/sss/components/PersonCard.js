import React from 'react';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { displayName, URGENCY_COLORS } from '../labels';
import { PersonAvatar, UrgencyChip } from './Chips';
import { SSS_COLORS, toneColor, PrimaryButton } from './SssLayout';

/** Carte mobile minimale — le détail vit dans la modale d'aperçu */
const PersonCard = ({ profile, onOpen, animated = true }) => {
  const user = profile.idUser || {};
  const stripeKey = URGENCY_COLORS[profile.urgency];
  const stripe =
    !stripeKey || stripeKey === 'default' ? SSS_COLORS.neutral : toneColor(stripeKey);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`sss-surface relative w-full overflow-hidden p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-sss-brand/30 hover:shadow-sss-md ${
        animated ? 'animate-sss-fade-up' : ''
      }`}
    >
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: stripe }} />

      <div className="flex items-center justify-between gap-3 pl-2">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar user={user} size={40} />
          <div className="min-w-0">
            <h3 className="m-0 truncate text-sm font-bold text-sss-text">{displayName(user)}</h3>
            <p className="m-0 mt-0.5 truncate text-xs text-sss-muted">Touchez pour voir les détails</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <UrgencyChip urgency={profile.urgency} />
          <PrimaryButton
            size="small"
            startIcon={<ViewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
            className="!min-h-8 !px-3"
          >
            Détails
          </PrimaryButton>
        </div>
      </div>
    </button>
  );
};

export default PersonCard;
