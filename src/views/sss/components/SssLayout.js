import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Paper,
  TableContainer,
  alpha,
  darken,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Skeleton
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Kit d'interface SSS — épuré, moderne, léger.
 * Cartes blanches, accents doux, une seule couleur d'accent par élément,
 * pensé mobile-first (grilles xs, boutons pleine largeur, cibles tactiles ≥ 40px).
 */

/**
 * Palette « fintech calme » — accents désaturés à luminance proche pour qu'ils
 * cohabitent sans agresser l'œil (indigo, émeraude, ambre, corail, azur).
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
  pageBg: '#f7f8fb',
  cardBorder: '#ecedf3',
  muted: '#667085',
  text: '#111827'
};

/** Résolution d'un ton sémantique vers la palette douce (au lieu des couleurs MUI vives) */
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
  return alpha(color, 0.1);
};

/** En-tête de page : icône + titre + sous-titre | actions à droite */
export const PageToolbar = ({
  icon,
  title,
  subtitle,
  actions,
  color = SSS_COLORS.brand
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1.5, sm: 2 }}
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      justifyContent="space-between"
      sx={{ mb: { xs: 2, sm: 2.5 } }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        {icon && (
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: softBgFor(color),
              color,
              flexShrink: 0,
              '& svg': { fontSize: 22 }
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.45rem' },
              color: SSS_COLORS.text,
              lineHeight: 1.25
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: SSS_COLORS.muted, maxWidth: 620, lineHeight: 1.5, mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {actions && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          justifyContent={isXs ? 'stretch' : 'flex-end'}
          sx={{
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' },
            '& > button': { flex: { xs: '1 1 auto', sm: '0 0 auto' } }
          }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
  );
};

/**
 * Carte KPI — épurée par défaut (fond blanc, pastille d'icône teintée,
 * grand chiffre sombre). Variantes : 'plain' (défaut), 'soft', 'solid'.
 */
export const KpiCard = ({
  title,
  value,
  hint,
  icon,
  color = SSS_COLORS.brand,
  softBg,
  onClick,
  loading = false,
  selected = false,
  variant = 'plain'
}) => {
  const isSolid = variant === 'solid';
  const isSoft = variant === 'soft';
  const bg = isSolid
    ? `linear-gradient(135deg, ${color} 0%, ${darken(color, 0.14)} 100%)`
    : isSoft
      ? (softBg || softBgFor(color))
      : '#fff';
  const onColor = isSolid ? '#fff' : SSS_COLORS.text;

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.75, sm: 2 },
          borderRadius: 3,
          border: `1px solid ${SSS_COLORS.cardBorder}`,
          minHeight: 118,
          height: '100%'
        }}
      >
        <Skeleton variant="rounded" width={38} height={38} />
        <Skeleton width="55%" height={34} sx={{ mt: 1.25 }} />
        <Skeleton width="75%" sx={{ mt: 0.5 }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: 3,
        background: bg,
        border: `1px solid ${
          selected ? color : isSolid ? 'transparent' : isSoft ? alpha(color, 0.18) : SSS_COLORS.cardBorder
        }`,
        minHeight: 118,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        '&:hover': onClick
          ? {
              boxShadow: `0 10px 24px ${alpha(color, 0.18)}`,
              transform: 'translateY(-2px)',
              borderColor: isSolid ? 'transparent' : alpha(color, 0.5)
            }
          : undefined
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isSolid ? alpha('#fff', 0.18) : alpha(color, 0.12),
            color: isSolid ? '#fff' : color,
            '& svg': { fontSize: 20 }
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.6rem', sm: '1.85rem' },
            lineHeight: 1,
            color: onColor,
            letterSpacing: '-0.02em'
          }}
        >
          {value ?? '—'}
        </Typography>
      </Stack>
      <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: onColor, mb: 0.2 }}>
        {title}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{
            color: isSolid ? alpha('#fff', 0.85) : SSS_COLORS.muted,
            display: 'block',
            lineHeight: 1.4
          }}
        >
          {hint}
        </Typography>
      )}
    </Paper>
  );
};

/** Bandeau d'info doux */
export const InfoBanner = ({ children, icon, color = SSS_COLORS.brand }) => (
  <Paper
    elevation={0}
    sx={{
      px: { xs: 1.5, sm: 1.75 },
      py: 1.1,
      mb: 2,
      borderRadius: 2.5,
      bgcolor: alpha(color, 0.06),
      border: `1px solid ${alpha(color, 0.14)}`
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      {icon && <Box sx={{ color, mt: 0.15, '& svg': { fontSize: 18 } }}>{icon}</Box>}
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
        {children}
      </Typography>
    </Stack>
  </Paper>
);

/** Ligne de filtres : selects + recherche + bouton Actualiser */
export const FilterBar = ({
  children,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher…',
  onRefresh,
  refreshing = false
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        mb: 2,
        borderRadius: 3,
        border: `1px solid ${SSS_COLORS.cardBorder}`,
        bgcolor: 'background.paper'
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.25}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ width: '100%' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          flex={1}
          flexWrap="wrap"
          useFlexGap
        >
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
        </Stack>

        {onRefresh && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
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
                bgcolor: alpha(SSS_COLORS.brand, 0.04)
              }
            }}
          >
            Actualiser
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export const filterFieldSx = {
  minWidth: { xs: '100%', sm: 150 },
  '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 }
};

/** Conteneur table blanche + coins arrondis */
export const TableShell = ({ children, sx = {} }) => (
  <TableContainer
    component={Paper}
    elevation={0}
    sx={{
      borderRadius: 3,
      border: `1px solid ${SSS_COLORS.cardBorder}`,
      bgcolor: 'background.paper',
      overflowX: 'auto',
      ...sx
    }}
  >
    {children}
  </TableContainer>
);

/** Styles d'en-têtes de table (caps grises) */
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

/** Bouton d'action « Voir » discret et cohérent (tables) */
export const viewButtonSx = {
  borderRadius: 2,
  textTransform: 'none',
  fontWeight: 600,
  borderColor: SSS_COLORS.brandBorder,
  color: SSS_COLORS.brand,
  bgcolor: alpha(SSS_COLORS.brand, 0.04),
  px: 1.5,
  '&:hover': { borderColor: SSS_COLORS.brand, bgcolor: alpha(SSS_COLORS.brand, 0.1) }
};

/** Bouton primaire violet */
export const PrimaryButton = ({ children, sx = {}, ...props }) => (
  <Button
    variant="contained"
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
        boxShadow: `0 6px 16px ${alpha(SSS_COLORS.brand, 0.3)}`
      },
      ...sx
    }}
  >
    {children}
  </Button>
);

/** Bouton ghost violet */
export const GhostButton = ({ children, sx = {}, ...props }) => (
  <Button
    variant="outlined"
    {...props}
    sx={{
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      borderColor: alpha(SSS_COLORS.brand, 0.3),
      color: SSS_COLORS.brand,
      bgcolor: alpha(SSS_COLORS.brand, 0.03),
      minHeight: 40,
      '&:hover': {
        borderColor: SSS_COLORS.brand,
        bgcolor: alpha(SSS_COLORS.brand, 0.08)
      },
      ...sx
    }}
  >
    {children}
  </Button>
);

/** Conteneur de page */
export const PageFrame = ({ children, sx = {} }) => (
  <Box sx={{ mx: { xs: -1, sm: 0 }, ...sx }}>{children}</Box>
);

export default {
  SSS_COLORS,
  TONE,
  toneColor,
  toneSoftBg,
  PageToolbar,
  KpiCard,
  InfoBanner,
  FilterBar,
  filterFieldSx,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  viewButtonSx,
  PrimaryButton,
  GhostButton,
  PageFrame
};
