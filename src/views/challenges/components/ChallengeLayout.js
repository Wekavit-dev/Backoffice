import React from 'react';
import PropTypes from 'prop-types';
import { LinearProgress, Skeleton } from '@mui/material';
import {
  PageToolbar,
  KpiCard,
  FilterBar,
  FilterSelect,
  PrimaryButton,
  GhostButton,
  PageFrame,
  InfoBanner,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  SSS_COLORS
} from 'views/sss/components/SssLayout';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/challengeUi';

export {
  PageToolbar,
  KpiCard,
  FilterBar,
  FilterSelect,
  PrimaryButton,
  GhostButton,
  PageFrame,
  InfoBanner,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  SSS_COLORS
};

/** Accent doré « défi / trophée » */
export const CHALLENGE_ACCENT = '#d97706';
export const CHALLENGE_ACCENT_SOFT = '#fff7ed';

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#fff',
    transition: 'box-shadow 0.2s ease',
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${SSS_COLORS.brand}22` }
  }
};

const STATUS_TONE = {
  draft: { bg: '#f2f4f7', text: '#667085', ring: '#e4e7ec' },
  active: { bg: '#e9f5f0', text: '#3aa17a', ring: '#bfe8d9' },
  completed: { bg: '#eaf2fb', text: '#4a8fd6', ring: '#c5ddf5' },
  cancelled: { bg: '#fbeeed', text: '#d96a63', ring: '#f5cfcb' }
};

export const StatusBadge = ({ status, published, featured }) => {
  const tone = STATUS_TONE[status] || STATUS_TONE.draft;
  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className="admin-badge"
        style={{ backgroundColor: tone.bg, color: tone.text, border: `1px solid ${tone.ring}` }}
      >
        {STATUS_LABELS[status] || status}
      </span>
      <span
        className="admin-badge"
        style={{
          backgroundColor: published ? '#e9f5f0' : '#f2f4f7',
          color: published ? '#3aa17a' : '#667085',
          border: `1px solid ${published ? '#bfe8d9' : '#e4e7ec'}`
        }}
      >
        {published ? 'Visible' : 'Masqué'}
      </span>
      {featured && (
        <span
          className="admin-badge"
          style={{ backgroundColor: '#fff7ed', color: CHALLENGE_ACCENT, border: '1px solid #fed7aa' }}
        >
          Mis en avant
        </span>
      )}
    </div>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
  published: PropTypes.bool,
  featured: PropTypes.bool
};

export const ChallengeListItem = ({
  name,
  subtitle,
  meta,
  progress = 0,
  participants,
  maxParticipants,
  selected,
  onClick
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group w-full rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sss-brand/40 ${
      selected
        ? 'border-sss-brand bg-gradient-to-br from-sss-brand-soft to-white shadow-sss-md ring-1 ring-sss-brand/20'
        : 'border-sss-border bg-white hover:-translate-y-0.5 hover:border-sss-brand/35 hover:shadow-sss-card'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-sss-text group-hover:text-sss-brand">{name}</p>
        {subtitle && <p className="sss-muted m-0 mt-0.5 truncate text-xs">{subtitle}</p>}
      </div>
      {progress > 0 && (
        <span className="shrink-0 rounded-full bg-sss-brand/10 px-2 py-0.5 text-xs font-bold tabular-nums text-sss-brand">
          {progress}%
        </span>
      )}
    </div>

    <div className="admin-progress-track mt-3">
      <div className="admin-progress-fill" style={{ width: `${Math.min(100, progress)}%` }} />
    </div>

    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
      {meta && <span className="text-xs text-sss-muted">{meta}</span>}
      <span className="text-xs font-semibold text-sss-text">
        {participants ?? 0}
        {maxParticipants > 0 ? ` / ${maxParticipants}` : ''} participant{(participants ?? 0) > 1 ? 's' : ''}
      </span>
    </div>
  </button>
);

ChallengeListItem.propTypes = {
  name: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  meta: PropTypes.string,
  progress: PropTypes.number,
  participants: PropTypes.number,
  maxParticipants: PropTypes.number,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center animate-sss-fade-up">
    {icon && (
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] [&>svg]:text-[2rem]"
        style={{ backgroundColor: CHALLENGE_ACCENT_SOFT, color: CHALLENGE_ACCENT }}
      >
        {icon}
      </div>
    )}
    <h3 className="m-0 text-base font-bold text-sss-text">{title}</h3>
    {description && <p className="sss-muted m-0 mt-2 max-w-sm leading-relaxed">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node
};

export const DetailWorkspace = ({ children, className = '' }) => (
  <div className={`admin-workspace overflow-hidden ${className}`}>{children}</div>
);

export const DetailHeader = ({ children }) => (
  <div className="admin-panel-header admin-dot-grid px-4 py-4 sm:px-5 sm:py-5">{children}</div>
);

export const ListPanel = ({ title, count, children, className = '' }) => (
  <div className={`sss-surface flex flex-col overflow-hidden ${className}`}>
    <div className="flex items-center justify-between border-b border-sss-border px-4 py-3.5 sm:px-5">
      <div>
        <h2 className="m-0 text-sm font-bold text-sss-text">{title}</h2>
        {count != null && (
          <p className="sss-muted m-0 mt-0.5 text-xs">
            {count} résultat{count > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-3 sm:p-4">{children}</div>
  </div>
);

ListPanel.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number,
  children: PropTypes.node,
  className: PropTypes.string
};

export const KpiSkeletonGrid = () => (
  <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <KpiCard key={i} loading title="" value="" icon={null} />
    ))}
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="rounded-2xl border border-sss-border p-4">
        <Skeleton variant="text" width="55%" height={22} />
        <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
        <LinearProgress variant="determinate" value={30 + i * 10} sx={{ mt: 2, height: 6, borderRadius: 3 }} />
      </div>
    ))}
  </div>
);

export const SectionCard = ({ title, hint, children, action }) => (
  <section className="sss-surface overflow-hidden">
    {(title || action) && (
      <div className="flex items-start justify-between gap-3 border-b border-sss-border px-4 py-3.5 sm:px-5">
        <div>
          {title && <h3 className="m-0 text-sm font-bold text-sss-text">{title}</h3>}
          {hint && <p className="sss-muted m-0 mt-0.5 text-xs">{hint}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-4 sm:p-5">{children}</div>
  </section>
);

SectionCard.propTypes = {
  title: PropTypes.string,
  hint: PropTypes.string,
  children: PropTypes.node,
  action: PropTypes.node
};
