import React, { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
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
  initials,
  avatarColor,
  displayName
} from '../labels';
import { SSS_COLORS, toneColor } from './SssLayout';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const cn = (...parts) => parts.filter(Boolean).join(' ');

const ChipBase = ({ children, className = '', style, onClick, title }) => {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      className={cn('sss-chip', onClick && 'cursor-pointer hover:brightness-95', className)}
      style={style}
    >
      {children}
    </Comp>
  );
};

export const StageChip = ({ stage, size = 'small', onClick }) => {
  const tone = SSS_COLORS.brand;
  return (
    <ChipBase
      onClick={onClick}
      className={size === 'small' ? 'h-6' : 'h-7'}
      style={{ backgroundColor: `${tone}1a`, color: tone }}
    >
      {STAGE_LABELS[stage] || stage || '—'}
    </ChipBase>
  );
};

export const UrgencyChip = ({ urgency, size = 'small' }) => {
  const label = URGENCY_LABELS[urgency] || urgency || '—';
  const tone = toneColor(URGENCY_COLORS[urgency] || 'default');
  return (
    <ChipBase className={size === 'small' ? 'h-6' : 'h-7'} style={{ backgroundColor: `${tone}1f`, color: tone }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone }} />
      {label}
    </ChipBase>
  );
};

export const HealthChip = ({ level, score, size = 'small', showProgress = false }) => {
  const color = toneColor(HEALTH_COLORS[level] || 'default');
  const label =
    score != null ? `${HEALTH_LABELS[level] || level || '—'} ${score}%` : HEALTH_LABELS[level] || level || '—';

  const healthIcons = {
    excellent: <StarIcon style={{ fontSize: 14 }} />,
    good: <TrendingUpIcon style={{ fontSize: 14 }} />,
    fair: <TrendingFlatIcon style={{ fontSize: 14 }} />,
    poor: <TrendingDownIcon style={{ fontSize: 14 }} />
  };

  return (
    <div className="inline-flex items-center gap-2">
      <ChipBase className={size === 'small' ? 'h-6' : 'h-7'} style={{ backgroundColor: `${color}1a`, color }}>
        {healthIcons[level]}
        {label}
      </ChipBase>
      {showProgress && score != null && (
        <div className="h-1 w-14 overflow-hidden rounded-full" style={{ backgroundColor: `${color}1a` }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
        </div>
      )}
    </div>
  );
};

export const StatusChip = ({ status, size = 'small' }) => {
  const tone = toneColor(TASK_STATUS_COLORS[status] || 'default');
  const label = TASK_STATUS_LABELS[status] || status || '—';
  return (
    <ChipBase className={size === 'small' ? 'h-6' : 'h-7'} style={{ backgroundColor: `${tone}1f`, color: tone }}>
      {label}
    </ChipBase>
  );
};

export const ActionLabel = ({ action, showIcon = true, size = 'medium' }) => {
  const label = ACTION_LABELS[action] || action || '—';
  const actionIcons = {
    call: <PhoneIcon style={{ fontSize: 16 }} />,
    email: <EmailIcon style={{ fontSize: 16 }} />,
    chat: <ChatIcon style={{ fontSize: 16 }} />,
    follow_up: <ScheduleIcon style={{ fontSize: 16 }} />
  };

  return (
    <span className="inline-flex items-center gap-2">
      {showIcon && actionIcons[action] && <span className="text-sss-brand">{actionIcons[action]}</span>}
      <span className={cn('font-semibold text-sss-text', size === 'medium' ? 'text-sm' : 'text-xs')}>{label}</span>
    </span>
  );
};

export const AlertChips = ({ alerts = [], max = 3, onAlertClick }) => {
  const [expanded, setExpanded] = useState(false);
  const list = Array.isArray(alerts) ? alerts : [];

  if (!list.length) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-sss-muted">
        <CheckCircleIcon style={{ fontSize: 14, color: SSS_COLORS.success }} />
        Aucune alerte
      </span>
    );
  }

  const shown = list.slice(0, max);
  const rest = list.length - shown.length;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {shown.map((a) => (
          <ChipBase
            key={a}
            onClick={onAlertClick ? () => onAlertClick(a) : undefined}
            style={{ backgroundColor: SSS_COLORS.warningSoft, color: SSS_COLORS.warning }}
          >
            <WarningIcon style={{ fontSize: 14 }} />
            {ALERT_LABELS[a] || a}
          </ChipBase>
        ))}
        {rest > 0 && (
          <ChipBase onClick={() => setExpanded(!expanded)} style={{ backgroundColor: SSS_COLORS.neutralSoft, color: SSS_COLORS.muted }}>
            +{rest}
          </ChipBase>
        )}
      </div>
      {expanded && rest > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {list.slice(max).map((a) => (
            <ChipBase
              key={a}
              onClick={onAlertClick ? () => onAlertClick(a) : undefined}
              style={{ backgroundColor: SSS_COLORS.warningSoft, color: SSS_COLORS.warning }}
            >
              {ALERT_LABELS[a] || a}
            </ChipBase>
          ))}
        </div>
      )}
    </div>
  );
};

export const EmptyState = ({ title, subtitle, action, icon, loading = false }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12">
        <div className="sss-skeleton h-16 w-16 rounded-full" />
        <div className="sss-skeleton h-8 w-48" />
        <div className="sss-skeleton h-5 w-72" />
        <div className="sss-skeleton h-9 w-48" />
      </div>
    );
  }

  return (
    <div className="animate-sss-fade-up rounded-sss border-2 border-dashed border-sss-border bg-sss-page/60 px-6 py-12 text-center transition-colors hover:border-sss-brand/40 hover:bg-sss-brand/[0.02] sm:px-10 sm:py-16">
      {icon && (
        <div className="relative mx-auto mb-5 inline-flex">
          <div className="absolute -inset-2 rounded-full border border-dashed border-sss-brand/25" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-sss-brand-soft text-sss-brand shadow-sss-md [&>svg]:text-[2rem]">
            {icon}
          </div>
        </div>
      )}
      <h3 className="mb-2 text-xl font-bold text-sss-text">{title}</h3>
      {subtitle && <p className="sss-muted mx-auto mb-5 max-w-md leading-relaxed">{subtitle}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export const StatCard = ({ title, value, hint, color = SSS_COLORS.brand, icon, onClick, loading = false, subtitle }) => {
  const resolved = typeof color === 'string' && !color.startsWith('#') ? SSS_COLORS.brand : color;

  if (loading) {
    return (
      <div className="sss-kpi">
        <div className="sss-skeleton h-5 w-24" />
        <div className="sss-skeleton mt-3 h-9 w-20" />
        <div className="sss-skeleton mt-2 h-4 w-32" />
      </div>
    );
  }

  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn('sss-kpi text-left', onClick && 'sss-kpi-clickable')}
      style={{ backgroundColor: `${resolved}1a`, borderColor: `${resolved}2e` }}
    >
      <div className="mb-3 flex items-start justify-between">
        {icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl [&>svg]:text-[1.25rem]"
            style={{ backgroundColor: `${resolved}29`, color: resolved }}
          >
            {icon}
          </div>
        )}
        <div className="text-3xl font-extrabold leading-none tracking-tight text-sss-text">{value ?? '—'}</div>
      </div>
      <div className="text-sm font-bold text-sss-text">{title}</div>
      {subtitle && <div className="sss-muted mt-0.5 text-xs">{subtitle}</div>}
      {hint && <div className="sss-muted mt-1 text-xs">{hint}</div>}
    </Comp>
  );
};

export const PersonAvatar = ({ user, size = 32, showStatus = false, status, onClick }) => {
  const statusColors = { online: '#4caf50', away: '#ff9800', busy: '#f44336', offline: '#9e9e9e' };
  const Comp = onClick ? 'button' : 'div';

  return (
    <div className="relative inline-block">
      <Comp
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-bold text-white transition-transform',
          onClick && 'cursor-pointer hover:scale-110 border-0'
        )}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          backgroundColor: avatarColor(user)
        }}
      >
        {initials(user)}
      </Comp>
      {showStatus && status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
          style={{ backgroundColor: statusColors[status] || statusColors.offline }}
        />
      )}
    </div>
  );
};

export const RankBadge = ({ rank, urgency, size = 28, showTrophy = false }) => {
  if (showTrophy && rank === 1) {
    return (
      <div
        className="relative inline-flex items-center justify-center rounded-full border-2 border-sss-warning bg-sss-warning-soft font-bold text-sss-warning animate-sss-pulse-soft"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        <TrophyIcon style={{ fontSize: size * 0.6 }} />
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center justify-center rounded-full font-bold text-white transition-transform hover:scale-110"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        backgroundColor: urgency ? toneColor(URGENCY_COLORS[urgency]) : SSS_COLORS.neutral
      }}
    >
      {rank}
    </div>
  );
};

export const PersonCell = ({ user, phone, email, showStatus = false, status, rank, urgency, onAction, actions = [] }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const safeUser = user && typeof user === 'object' ? user : null;

  return (
    <div className="flex items-center gap-3 py-1">
      <PersonAvatar user={safeUser} size={40} showStatus={showStatus} status={status} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-sss-text">{displayName(safeUser)}</span>
          {rank && <RankBadge rank={rank} urgency={urgency} size={20} />}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {phone && <span className="font-mono text-xs text-sss-muted">{phone}</span>}
          {email && <span className="truncate text-xs text-sss-muted">{email}</span>}
        </div>
      </div>
      {actions.length > 0 && (
        <>
          <button
            type="button"
            className="rounded-lg p-1.5 text-sss-muted opacity-70 transition hover:bg-sss-neutral-soft hover:opacity-100"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            <MoreVertIcon fontSize="small" />
          </button>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            {actions.map((action) => (
              <MenuItem
                key={action.id}
                onClick={() => {
                  onAction?.(action);
                  setMenuAnchor(null);
                }}
              >
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </div>
  );
};

export const MetricsCard = ({ title, value, change, changeType = 'neutral', color = 'primary', icon, loading = false }) => {
  const colorMap = {
    primary: SSS_COLORS.brand,
    success: SSS_COLORS.success,
    warning: SSS_COLORS.warning,
    error: SSS_COLORS.error,
    info: SSS_COLORS.info
  };
  const tone = colorMap[color] || SSS_COLORS.brand;
  const ChangeIcon = { up: TrendingUpIcon, down: TrendingDownIcon, neutral: TrendingFlatIcon }[changeType];

  if (loading) {
    return (
      <div className="sss-kpi">
        <div className="sss-skeleton h-4 w-28" />
        <div className="sss-skeleton mt-3 h-9 w-24" />
      </div>
    );
  }

  return (
    <div className="sss-kpi hover:-translate-y-1" style={{ backgroundColor: `${tone}08`, borderColor: `${tone}26` }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-sss-muted">{title}</span>
        {icon && <span style={{ color: tone }}>{icon}</span>}
      </div>
      <div className="text-3xl font-extrabold" style={{ color: tone }}>
        {value}
      </div>
      {change && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: tone }}>
          {ChangeIcon && <ChangeIcon style={{ fontSize: 16 }} />}
          {change}
        </div>
      )}
    </div>
  );
};

export default {
  StageChip,
  UrgencyChip,
  HealthChip,
  StatusChip,
  ActionLabel,
  AlertChips,
  EmptyState,
  StatCard,
  PersonAvatar,
  RankBadge,
  PersonCell,
  MetricsCard
};
