import React from 'react';
import {
  Avatar,
  Box,
  Button,
  TextField,
  Paper,
  Skeleton,
  TableContainer,
  InputAdornment,
  MenuItem,
  Typography
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { Search as SearchIcon, Refresh as RefreshIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

/**
 * Kit d'interface SSS — Tailwind + cartes alignées sur le dashboard Berry.
 */

export const SSS_COLORS = {
  brand: '#5b5bd6',
  brandDark: '#4b49c8',
  brandSoft: '#eeeefb',
  brandBorder: '#ddddf6',
  success: '#3aa17a',
  successSoft: '#e9f5f0',
  warning: '#cc8b3c',
  warningSoft: '#f9f1e6',
  error: '#d96a63',
  errorSoft: '#fbeeed',
  info: '#4a8fd6',
  infoSoft: '#eaf2fb',
  neutral: '#8a94a6',
  neutralSoft: '#f2f4f7',
  pageBg: '#f5f6fa',
  cardBorder: '#ecedf3',
  muted: '#667085',
  text: '#111827'
};

export const TONE = {
  error: { main: SSS_COLORS.error, soft: SSS_COLORS.errorSoft },
  warning: { main: SSS_COLORS.warning, soft: SSS_COLORS.warningSoft },
  info: { main: SSS_COLORS.info, soft: SSS_COLORS.infoSoft },
  success: { main: SSS_COLORS.success, soft: SSS_COLORS.successSoft },
  primary: { main: SSS_COLORS.brand, soft: SSS_COLORS.brandSoft },
  secondary: { main: SSS_COLORS.brand, soft: SSS_COLORS.brandSoft },
  default: { main: SSS_COLORS.neutral, soft: SSS_COLORS.neutralSoft }
};

export const toneColor = (key) => TONE[key]?.main || SSS_COLORS.neutral;
export const toneSoftBg = (key) => TONE[key]?.soft || SSS_COLORS.neutralSoft;

const softBgFor = (color) => {
  if (color === SSS_COLORS.brand || color === SSS_COLORS.brandDark) return SSS_COLORS.brandSoft;
  if (color === SSS_COLORS.success) return SSS_COLORS.successSoft;
  if (color === SSS_COLORS.warning) return SSS_COLORS.warningSoft;
  if (color === SSS_COLORS.error) return SSS_COLORS.errorSoft;
  if (color === SSS_COLORS.info) return SSS_COLORS.infoSoft;
  return SSS_COLORS.neutralSoft;
};

const cn = (...parts) => parts.filter(Boolean).join(' ');

/** En-tête de page : icône + titre + sous-titre | actions */
export const PageToolbar = ({ icon, title, subtitle, actions, color = SSS_COLORS.brand }) => (
  <div className="sss-page mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between animate-sss-fade-up">
    <div className="flex min-w-0 items-center gap-3.5">
      {icon && (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl [&>svg]:text-[1.35rem]"
          style={{ backgroundColor: softBgFor(color), color }}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight tracking-tight text-sss-text sm:text-2xl">{title}</h1>
        {subtitle && <p className="sss-muted mt-1 max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
    </div>

    {actions && (
      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end [&>button]:min-h-10 [&>button]:flex-1 sm:[&>button]:flex-none">
        {actions}
      </div>
    )}
  </div>
);

/**
 * Carte KPI alignée sur le dashboard Berry (EarningCard / TotalOrderLineChartCard) :
 * fond coloré, cercles décoratifs, avatar d'icône, grand chiffre.
 */
export const KpiCard = ({
  title,
  value,
  hint,
  icon,
  color = SSS_COLORS.brand,
  onClick,
  loading = false,
  selected = false,
  variant = 'dark' // 'dark' | 'light' | 'soft' | 'plain' | 'solid'
}) => {
  const isDark = variant === 'dark' || variant === 'solid' || variant === 'soft';
  const isLight = variant === 'light' || variant === 'plain';
  const bgColor = isDark ? color : '#fff';
  const circleColor = isDark ? darken(color, 0.18) : alpha(color, 0.18);
  const textPrimary = isDark ? '#fff' : SSS_COLORS.text;
  const textSecondary = isDark ? alpha('#fff', 0.78) : SSS_COLORS.muted;

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: 3,
          minHeight: 148,
          height: '100%',
          border: `1px solid ${SSS_COLORS.cardBorder}`
        }}
      >
        <Skeleton variant="rounded" width={44} height={44} />
        <Skeleton width="40%" height={40} sx={{ mt: 2 }} />
        <Skeleton width="70%" sx={{ mt: 1 }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        p: 2.25,
        borderRadius: 3,
        minHeight: 148,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: bgColor,
        color: textPrimary,
        border: selected ? `2px solid ${color}` : isLight ? `1px solid ${SSS_COLORS.cardBorder}` : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-3px)',
              boxShadow: `0 12px 28px ${alpha(color, 0.28)}`
            }
          : undefined,
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: circleColor,
          borderRadius: '50%',
          top: -85,
          right: -95,
          opacity: isDark ? 1 : 0.7,
          zIndex: 0
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: circleColor,
          borderRadius: '50%',
          top: -125,
          right: -15,
          opacity: 0.45,
          zIndex: 0
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: isDark ? alpha('#fff', 0.16) : alpha(color, 0.14),
              color: isDark ? '#fff' : color,
              '& svg': { fontSize: 22 }
            }}
          >
            {icon}
          </Avatar>
          {onClick && (
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: isDark ? alpha('#fff', 0.18) : alpha(color, 0.12),
                color: isDark ? '#fff' : color
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Avatar>
          )}
        </Box>

        <Typography
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: textPrimary,
            mb: 0.75
          }}
        >
          {value ?? '—'}
        </Typography>

        <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: textPrimary, mb: hint ? 0.35 : 0 }}>
          {title}
        </Typography>
        {hint && (
          <Typography variant="subtitle2" sx={{ color: textSecondary, fontWeight: 400, lineHeight: 1.4 }}>
            {hint}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

/** Carte priorité — même langage visuel que EarningCard du dashboard */
export const PriorityCard = ({ title, value, hint, icon, color = SSS_COLORS.brand, onClick, loading = false }) => (
  <KpiCard
    title={title}
    value={value}
    hint={hint}
    icon={icon}
    color={color}
    onClick={onClick}
    loading={loading}
    variant="dark"
  />
);

/** Bandeau d'info */
export const InfoBanner = ({ children, icon, color = SSS_COLORS.brand }) => (
  <div
    className="mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3"
    style={{ backgroundColor: `${color}0f`, borderColor: `${color}24` }}
  >
    {icon && (
      <div className="mt-0.5 shrink-0 [&>svg]:text-[1.1rem]" style={{ color }}>
        {icon}
      </div>
    )}
    <p className="sss-muted m-0 leading-relaxed">{children}</p>
  </div>
);

/** Ligne de filtres */
export const FilterBar = ({
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher…',
  onRefresh,
  refreshing = false
}) => (
  <div className="sss-input-shell mb-4 animate-sss-fade-up">
    <div className="flex w-full flex-col items-stretch gap-3 md:flex-row md:items-center">
      <div className="flex flex-1 flex-col flex-wrap items-stretch gap-3 sm:flex-row sm:items-center">
        {children}
        {onSearchChange != null && (
          <TextField
            size="small"
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
            sx={{
              minWidth: { xs: '100%', sm: 220 },
              flex: { sm: 1 },
              maxWidth: { md: 360 },
              '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 }
            }}
          />
        )}
      </div>

      {onRefresh && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={refreshing}
          className="sss-btn-soft !normal-case"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: SSS_COLORS.cardBorder,
            color: 'text.primary',
            bgcolor: 'background.paper',
            whiteSpace: 'nowrap',
            minHeight: 40,
            '&:hover': {
              borderColor: SSS_COLORS.brand,
              bgcolor: `${SSS_COLORS.brand}0a`
            }
          }}
        >
          Actualiser
        </Button>
      )}
    </div>
  </div>
);

export const filterFieldSx = {
  minWidth: { xs: '100%', sm: 150 },
  '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 }
};

export const TableShell = ({ children, sx = {}, className = '' }) => (
  <TableContainer
    component={Paper}
    elevation={0}
    className={cn(className)}
    sx={{
      borderRadius: 3,
      border: `1px solid ${SSS_COLORS.cardBorder}`,
      bgcolor: '#fff',
      overflowX: 'auto',
      width: '100%',
      display: 'block',
      visibility: 'visible',
      opacity: 1,
      '& .MuiTable-root': {
        minWidth: 720
      },
      '& .MuiTableBody-root .MuiTableRow-root': {
        display: 'table-row'
      },
      '& .MuiTableCell-root': {
        color: SSS_COLORS.text,
        visibility: 'visible'
      },
      ...sx
    }}
  >
    {children}
  </TableContainer>
);

export const tableHeadCellSx = {
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: SSS_COLORS.muted,
  bgcolor: '#fafbfc',
  borderBottom: `1px solid ${SSS_COLORS.cardBorder}`,
  py: 1.35,
  px: 1.75,
  whiteSpace: 'nowrap'
};

export const tableBodyCellSx = {
  borderBottom: `1px solid ${SSS_COLORS.cardBorder}`,
  py: 1.4,
  px: 1.75,
  fontSize: '0.875rem',
  verticalAlign: 'middle'
};

export const viewButtonSx = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  borderColor: SSS_COLORS.brandBorder,
  color: SSS_COLORS.brand,
  bgcolor: `${SSS_COLORS.brand}0a`,
  px: 1.5,
  '&:hover': { borderColor: SSS_COLORS.brand, bgcolor: `${SSS_COLORS.brand}1a` }
};

export const PrimaryButton = ({ children, sx = {}, className = '', ...props }) => (
  <Button
    variant="contained"
    className={cn('sss-btn-primary !normal-case', className)}
    {...props}
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      bgcolor: SSS_COLORS.brand,
      boxShadow: 'none',
      px: 1.75,
      minHeight: 40,
      '&:hover': {
        bgcolor: SSS_COLORS.brandDark,
        boxShadow: `0 6px 16px ${SSS_COLORS.brand}4d`
      },
      ...sx
    }}
  >
    {children}
  </Button>
);

export const GhostButton = ({ children, sx = {}, className = '', ...props }) => (
  <Button
    variant="outlined"
    className={cn('sss-btn-ghost !normal-case', className)}
    {...props}
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      borderColor: `${SSS_COLORS.brand}4d`,
      color: SSS_COLORS.brand,
      bgcolor: `${SSS_COLORS.brand}08`,
      minHeight: 40,
      '&:hover': {
        borderColor: SSS_COLORS.brand,
        bgcolor: `${SSS_COLORS.brand}14`
      },
      ...sx
    }}
  >
    {children}
  </Button>
);

export const PageFrame = ({ children, className = '' }) => (
  <div className={cn('sss-page -mx-2 sm:mx-0', className)}>{children}</div>
);

/** Navigation rapide — tuiles immersives avec compteur et description */
export const QuickNav = ({ items = [] }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {items.map((item) => {
      const color = item.color || SSS_COLORS.brand;
      return (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="group relative overflow-hidden rounded-sss border-0 p-5 text-left text-white shadow-sss-md transition-all duration-200 hover:-translate-y-1 hover:shadow-sss-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: color }}
        >
          <span
            className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-30"
            style={{ background: darken(color, 0.18) }}
          />
          <span
            className="pointer-events-none absolute -bottom-12 -right-4 h-32 w-32 rounded-full opacity-20"
            style={{ background: darken(color, 0.12) }}
          />
          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/18 [&>svg]:text-[1.4rem]">
                {item.icon}
              </span>
              <div className="min-w-0 pt-0.5">
                <div className="text-base font-bold tracking-tight">{item.label}</div>
                {item.description && (
                  <p className="m-0 mt-1 text-sm leading-snug text-white/80">{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {item.count != null && (
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-lg font-extrabold leading-none tabular-nums">
                  {item.count}
                </span>
              )}
              <ArrowForwardIcon className="opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100" sx={{ fontSize: 18 }} />
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

/** CTA « Voir toutes les personnes » */
export const ViewAllPeopleButton = ({ onClick, label = 'Voir toutes les personnes', count }) => (
  <button
    type="button"
    onClick={onClick}
    className="group inline-flex items-center gap-2.5 rounded-full border border-sss-brand/20 bg-white px-4 py-2.5 text-sm font-bold text-sss-brand shadow-sss-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sss-brand hover:bg-sss-brand hover:text-white hover:shadow-sss-md"
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sss-brand-soft text-sss-brand transition group-hover:bg-white/20 group-hover:text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    </span>
    <span>{label}</span>
    {count != null && (
      <span className="rounded-full bg-sss-brand/10 px-2 py-0.5 text-xs font-bold tabular-nums transition group-hover:bg-white/20">
        {count}
      </span>
    )}
    <ArrowForwardIcon sx={{ fontSize: 18 }} className="transition group-hover:translate-x-0.5" />
  </button>
);

export const FilterSelect = ({ label, value, onChange, options = [], ...props }) => (
  <TextField
    select
    size="small"
    label={label}
    value={value}
    onChange={onChange}
    sx={filterFieldSx}
    {...props}
  >
    {options.map((opt) => (
      <MenuItem key={opt.value} value={opt.value}>
        {opt.label}
      </MenuItem>
    ))}
  </TextField>
);

export default {
  SSS_COLORS,
  TONE,
  toneColor,
  toneSoftBg,
  PageToolbar,
  KpiCard,
  PriorityCard,
  InfoBanner,
  FilterBar,
  filterFieldSx,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  viewButtonSx,
  PrimaryButton,
  GhostButton,
  PageFrame,
  QuickNav,
  ViewAllPeopleButton,
  FilterSelect
};
