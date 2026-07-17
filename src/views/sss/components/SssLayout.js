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
 * Layout kit aligné sur la page « Vérification client » :
 * header + actions, KPI colorés, bandeau info, filtres, table blanche.
 */

export const SSS_COLORS = {
  brand: '#673ab7',
  brandDark: '#5e35b1',
  brandSoft: '#ede7f6',
  brandBorder: '#d1c4e9',
  success: '#2e7d32',
  successSoft: '#e8f5e9',
  warning: '#ed6c02',
  warningSoft: '#fff3e0',
  error: '#d32f2f',
  errorSoft: '#ffebee',
  info: '#0288d1',
  infoSoft: '#e1f5fe',
  pageBg: '#f5f7fb',
  cardBorder: '#e8eaf0',
  muted: '#6b7280'
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
      sx={{ mb: { xs: 2, sm: 2.75 } }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
        {icon && (
          <Box
            sx={{
              width: 44,
            height: 42,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(color, 0.12),
              color,
              flexShrink: 0,
              '& svg': { fontSize: 24 }
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.3rem', sm: '1.55rem' },
              color: 'text.primary',
              lineHeight: 1.25,
              mb: 0.35
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: SSS_COLORS.muted, maxWidth: 640, lineHeight: 1.5 }}>
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
          justifyContent={isXs ? 'flex-start' : 'flex-end'}
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

/** Carte KPI façon référence : fond teinté, icône, gros chiffre, labels */
const softBgFor = (color) => {
  if (color === SSS_COLORS.brand || color === SSS_COLORS.brandDark) return SSS_COLORS.brandSoft;
  if (color === SSS_COLORS.success) return SSS_COLORS.successSoft;
  if (color === SSS_COLORS.warning) return SSS_COLORS.warningSoft;
  if (color === SSS_COLORS.error) return SSS_COLORS.errorSoft;
  if (color === SSS_COLORS.info) return SSS_COLORS.infoSoft;
  return alpha(color, 0.12);
};

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
  variant = 'solid'
}) => {
  const theme = useTheme();
  const bg = softBg || softBgFor(color);
  const isSolid = variant === 'solid';

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 1.75 },
          borderRadius: 2,
          border: `1px solid ${SSS_COLORS.cardBorder}`,
          minHeight: 116,
          height: '100%'
        }}
      >
        <Skeleton width="40%" />
        <Skeleton width="60%" height={36} sx={{ my: 1 }} />
        <Skeleton width="80%" />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: { xs: 1.5, sm: 1.75 },
        borderRadius: 2,
        background: isSolid ? `linear-gradient(135deg, ${color} 0%, ${darken(color, 0.16)} 100%)` : bg,
        border: `1px solid ${selected ? color : isSolid ? alpha(color, 0.65) : alpha(color, 0.18)}`,
        minHeight: 116,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
        '&:hover': onClick
          ? {
              boxShadow: `0 8px 20px ${alpha(color, 0.24)}`,
              transform: 'translateY(-3px)',
              borderColor: color
            }
          : undefined
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isSolid ? alpha('#fff', 0.16) : alpha(color, 0.16),
            color: isSolid ? '#fff' : color,
            border: isSolid ? `1px solid ${alpha('#fff', 0.2)}` : 'none',
            '& svg': { fontSize: 19 }
          }}
        >
          {icon}
        </Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.55rem', sm: '1.75rem' },
            lineHeight: 1,
            color: isSolid ? '#fff' : 'text.primary',
            letterSpacing: '-0.02em'
          }}
        >
          {value ?? '—'}
        </Typography>
      </Stack>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isSolid ? '#fff' : 'text.primary', mb: 0.2 }}>
        {title}
      </Typography>
      {hint && (
        <Typography
          variant="caption"
          sx={{ color: isSolid ? alpha('#fff', 0.82) : SSS_COLORS.muted, display: 'block', lineHeight: 1.35 }}
        >
          {hint}
        </Typography>
      )}
    </Paper>
  );
};

/** Bandeau d’info doux (comme le bandeau lilac de la référence) */
export const InfoBanner = ({ children, icon, color = SSS_COLORS.brand }) => (
  <Paper
    elevation={0}
    sx={{
      px: { xs: 1.5, sm: 1.75 },
      py: 1,
      mb: 1.75,
      borderRadius: 1.5,
      bgcolor: alpha(color, 0.07),
      border: `1px solid ${alpha(color, 0.12)}`,
      color: SSS_COLORS.muted
    }}
  >
    <Stack direction="row" spacing={1} alignItems="flex-start">
      {icon && (
        <Box sx={{ color, mt: 0.15, '& svg': { fontSize: 18 } }}>{icon}</Box>
      )}
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
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
        borderRadius: 2,
        border: `1px solid ${SSS_COLORS.cardBorder}`,
        bgcolor: 'background.paper'
      }}
    >
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
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
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper',
                borderRadius: 1.5
              }
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
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: SSS_COLORS.cardBorder,
            color: 'text.primary',
            bgcolor: 'background.paper',
            whiteSpace: 'nowrap',
            minHeight: 40,
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              bgcolor: alpha(theme.palette.secondary.main, 0.04)
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
  '& .MuiOutlinedInput-root': {
    bgcolor: 'background.paper',
    borderRadius: 1.5
  }
};

/** Conteneur table blanche + coins arrondis */
export const TableShell = ({ children, sx = {} }) => (
  <TableContainer
    component={Paper}
    elevation={0}
    sx={{
      borderRadius: 2,
      border: `1px solid ${SSS_COLORS.cardBorder}`,
      bgcolor: 'background.paper',
      overflowX: 'auto',
      ...sx
    }}
  >
    {children}
  </TableContainer>
);

/** Styles d’en-têtes de table (caps grises) */
export const tableHeadCellSx = {
  fontWeight: 700,
  fontSize: '0.7rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: SSS_COLORS.muted,
  bgcolor: '#f8f9fc',
  borderBottom: `1px solid ${SSS_COLORS.cardBorder}`,
  py: 1.35,
  px: 1.75,
  whiteSpace: 'nowrap'
};

export const tableBodyCellSx = {
  borderBottom: `1px solid ${SSS_COLORS.cardBorder}`,
  py: 1.5,
  px: 1.75,
  fontSize: '0.875rem',
  verticalAlign: 'middle'
};

/** Bouton primaire violet (référence) */
export const PrimaryButton = ({ children, sx = {}, ...props }) => (
  <Button
    variant="contained"
    {...props}
    sx={{
      borderRadius: 1.5,
      textTransform: 'none',
      fontWeight: 600,
      bgcolor: SSS_COLORS.brand,
      boxShadow: 'none',
      px: 1.75,
      minHeight: 40,
      '&:hover': {
        bgcolor: SSS_COLORS.brandDark,
        boxShadow: `0 4px 12px ${alpha(SSS_COLORS.brand, 0.35)}`
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
      borderRadius: 1.5,
      textTransform: 'none',
      fontWeight: 600,
      borderColor: alpha(SSS_COLORS.brand, 0.35),
      color: SSS_COLORS.brand,
      bgcolor: alpha(SSS_COLORS.brand, 0.04),
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

/** Conteneur de page (fond gris clair comme la référence) */
export const PageFrame = ({ children, sx = {} }) => (
  <Box
    sx={{
      mx: { xs: -1, sm: 0 },
      ...sx
    }}
  >
    {children}
  </Box>
);

export default {
  SSS_COLORS,
  PageToolbar,
  KpiCard,
  InfoBanner,
  FilterBar,
  filterFieldSx,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  PrimaryButton,
  GhostButton,
  PageFrame
};
