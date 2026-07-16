import React, { useState } from 'react';
import {
  Avatar,
  Chip,
  Stack,
  Typography,
  Box,
  Paper,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Badge,
  Zoom,
  Grow,
  Fade,
  Skeleton,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
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

// Import des icônes
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  PriorityHigh as PriorityHighIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';

// ==================== COMPOSANTS AMÉLIORÉS ====================

/**
 * StageChip - Version améliorée avec icône et animation
 */
export const StageChip = ({ stage, size = 'small', showIcon = true, onClick }) => {
  const theme = useTheme();
  const stageColors = {
    'S1': { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main },
    'S2': { bg: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main },
    'S3': { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main },
    'S4': { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main },
  };

  const colors = stageColors[stage] || { bg: alpha(theme.palette.grey[500], 0.1), color: theme.palette.grey[500] };

  return (
    <Chip
      size={size}
      label={STAGE_LABELS[stage] || stage || '—'}
      icon={showIcon ? <FlagIcon style={{ fontSize: size === 'small' ? 14 : 18 }} /> : undefined}
      onClick={onClick}
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        borderColor: alpha(colors.color, 0.2),
        fontWeight: 600,
        '&:hover': onClick ? {
          bgcolor: alpha(colors.color, 0.15),
          transform: 'translateY(-1px)',
          transition: 'all 0.2s ease'
        } : undefined,
        '& .MuiChip-icon': { color: colors.color }
      }}
    />
  );
};

/**
 * UrgencyChip - Version améliorée avec indicateur visuel
 */
export const UrgencyChip = ({ urgency, size = 'small', showDot = true }) => {
  const theme = useTheme();
  const label = URGENCY_LABELS[urgency] || urgency || '—';
  const color = URGENCY_COLORS[urgency] || 'default';

  const urgencyIcons = {
    critical: <PriorityHighIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    high: <WarningIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    medium: <InfoIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    low: <CheckCircleIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />
  };

  return (
    <Chip
      size={size}
      label={label}
      icon={showDot ? urgencyIcons[urgency] : undefined}
      color={color}
      sx={{
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 14 : 18
        },
        animation: urgency === 'critical' ? 'pulse 2s infinite' : undefined,
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' }
        }
      }}
    />
  );
};

/**
 * HealthChip - Version améliorée avec score visuel
 */
export const HealthChip = ({ level, score, size = 'small', showProgress = false }) => {
  const theme = useTheme();
  const color = HEALTH_COLORS[level] || 'default';
  const label = score != null
    ? `${HEALTH_LABELS[level] || level || '—'} ${score}%`
    : HEALTH_LABELS[level] || level || '—';

  const healthIcons = {
    excellent: <StarIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    good: <TrendingUpIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    fair: <TrendingFlatIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    poor: <TrendingDownIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        size={size}
        label={label}
        icon={healthIcons[level]}
        sx={{
          bgcolor: alpha(color, 0.1),
          color: color,
          borderColor: alpha(color, 0.2),
          fontWeight: 600,
          '& .MuiChip-icon': { color: color }
        }}
      />
      {showProgress && score != null && (
        <Box sx={{ width: 60 }}>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: alpha(color, 0.1),
              '& .MuiLinearProgress-bar': { bgcolor: color }
            }}
          />
        </Box>
      )}
    </Stack>
  );
};

/**
 * StatusChip - Version améliorée avec icône
 */
export const StatusChip = ({ status, size = 'small', showIcon = true }) => {
  const color = TASK_STATUS_COLORS[status] || 'default';
  const label = TASK_STATUS_LABELS[status] || status || '—';

  const statusIcons = {
    pending: <ScheduleIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    in_progress: <InfoIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    completed: <CheckCircleIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />,
    cancelled: <ErrorIcon style={{ fontSize: size === 'small' ? 14 : 18 }} />
  };

  return (
    <Chip
      size={size}
      label={label}
      icon={showIcon ? statusIcons[status] : undefined}
      color={color}
      sx={{
        fontWeight: 600,
        '& .MuiChip-icon': {
          fontSize: size === 'small' ? 14 : 18
        }
      }}
    />
  );
};

/**
 * ActionLabel - Version améliorée avec icône
 */
export const ActionLabel = ({ action, showIcon = true, size = 'medium' }) => {
  const theme = useTheme();
  const label = ACTION_LABELS[action] || action || '—';

  const actionIcons = {
    call: <PhoneIcon style={{ fontSize: 16 }} />,
    email: <EmailIcon style={{ fontSize: 16 }} />,
    chat: <ChatIcon style={{ fontSize: 16 }} />,
    follow_up: <ScheduleIcon style={{ fontSize: 16 }} />
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {showIcon && actionIcons[action] && (
        <Box sx={{ color: theme.palette.primary.main }}>
          {actionIcons[action]}
        </Box>
      )}
      <Typography variant={size === 'medium' ? 'body2' : 'caption'} fontWeight={600}>
        {label}
      </Typography>
    </Stack>
  );
};

/**
 * AlertChips - Version améliorée avec interaction
 */
export const AlertChips = ({ alerts = [], max = 3, onAlertClick }) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  if (!alerts.length) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <CheckCircleIcon style={{ fontSize: 14, color: theme.palette.success.main }} />
        Aucune alerte
      </Typography>
    );
  }

  const shown = alerts.slice(0, max);
  const rest = alerts.length - shown.length;

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {shown.map((a) => (
          <Chip
            key={a}
            size="small"
            label={ALERT_LABELS[a] || a}
            icon={<WarningIcon style={{ fontSize: 14 }} />}
            color="warning"
            variant="outlined"
            onClick={() => onAlertClick?.(a)}
            sx={{
              cursor: onAlertClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': onAlertClick ? {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[2]
              } : undefined
            }}
          />
        ))}
        {rest > 0 && (
          <Chip
            size="small"
            label={`+${rest}`}
            onClick={() => setExpanded(!expanded)}
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              bgcolor: theme.palette.grey[100],
              '&:hover': {
                bgcolor: theme.palette.grey[200]
              }
            }}
          />
        )}
      </Stack>
      {expanded && rest > 0 && (
        <Collapse in={expanded}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
            {alerts.slice(max).map((a) => (
              <Chip
                key={a}
                size="small"
                label={ALERT_LABELS[a] || a}
                color="warning"
                variant="outlined"
                onClick={() => onAlertClick?.(a)}
                sx={{ cursor: onAlertClick ? 'pointer' : 'default' }}
              />
            ))}
          </Stack>
        </Collapse>
      )}
    </Stack>
  );
};

/**
 * EmptyState - Version améliorée avec animations
 */
export const EmptyState = ({ title, subtitle, action, icon, loading = false }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ py: 6, px: 3 }}>
        <Stack spacing={2} alignItems="center">
          <Skeleton variant="circular" width={64} height={64} />
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={300} height={20} />
          <Skeleton variant="rectangular" width={200} height={36} sx={{ borderRadius: 2 }} />
        </Stack>
      </Box>
    );
  }

  return (
    <Fade in>
      <Box
        sx={{
          py: { xs: 6, sm: 8 },
          px: { xs: 2.5, sm: 4 },
          textAlign: 'center',
          bgcolor: alpha(theme.palette.grey[50], 0.6),
          borderRadius: 3,
          border: '2px dashed',
          borderColor: alpha(theme.palette.divider, 0.35),
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: alpha('#0D9488', 0.35),
            bgcolor: alpha('#0D9488', 0.02),
          }
        }}
      >
        {icon && (
          <Box sx={{
            mb: 3,
            display: 'inline-flex',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: `2px dashed ${alpha('#0D9488', 0.2)}`,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              bgcolor: alpha('#14B8A6', 0.06),
            }
          }}>
            <Box sx={{
              position: 'relative',
              p: 2.5,
              borderRadius: '50%',
              bgcolor: alpha('#0D9488', 0.1),
              color: '#0D9488',
              boxShadow: `0 4px 20px ${alpha('#0D9488', 0.15)}`,
              '& svg': { fontSize: 40 }
            }}>
              {icon}
            </Box>
          </Box>
        )}
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
            {subtitle}
          </Typography>
        )}
        {action && (
          <Zoom in>
            <Box>{action}</Box>
          </Zoom>
        )}
      </Box>
    </Fade>
  );
};

/**
 * StatCard - Version améliorée avec tendances et interactions
 */
export const StatCard = ({
  title,
  value,
  hint,
  color = 'primary.main',
  icon,
  onClick,
  trend,
  trendValue,
  loading = false,
  badge,
  subtitle
}) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const resolvedColor = typeof color === 'string' && color.includes('.')
    ? theme.palette[color.split('.')[0]]?.[color.split('.')[1]] || theme.palette.primary.main
    : color;

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack spacing={1}>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={80} height={40} />
            <Skeleton variant="text" width={150} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = {
    up: TrendingUpIcon,
    down: TrendingDownIcon,
    flat: TrendingFlatIcon
  }[trend];

  return (
    <Card
      elevation={0}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: hovered ? alpha(resolvedColor, 0.4) : alpha(theme.palette.divider, 0.5),
        bgcolor: hovered ? alpha(resolvedColor, 0.03) : 'background.paper',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered && onClick ? 'translateY(-3px)' : 'none',
        boxShadow: hovered && onClick ? `0 8px 24px ${alpha(resolvedColor, 0.12)}` : 'none',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: resolvedColor,
          opacity: hovered ? 1 : 0.45,
          transition: 'opacity 0.25s ease'
        }
      }}
    >
      {badge && (
        <Badge
          badgeContent={badge}
          color="error"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            '& .MuiBadge-badge': {
              fontSize: 10,
              height: 20,
              minWidth: 20,
              fontWeight: 700
            }
          }}
        />
      )}
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{
              color: alpha(theme.palette.text.primary, 0.55),
              fontWeight: 600,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              fontSize: '0.65rem'
            }}>
              {title}
            </Typography>
            {icon && (
              <Box sx={{
                color: resolvedColor,
                opacity: hovered ? 1 : 0.7,
                display: 'flex',
                p: 0.75,
                borderRadius: 1.5,
                bgcolor: alpha(resolvedColor, 0.08),
                transition: 'all 0.25s ease',
                transform: hovered ? 'scale(1.05)' : 'scale(1)'
              }}>
                {icon}
              </Box>
            )}
          </Stack>

          <Box>
            <Typography variant="h2" sx={{
              color: resolvedColor,
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
              lineHeight: 1.1
            }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {hint && (
            <Stack direction="row" spacing={1} alignItems="center">
              {TrendIcon && trendValue && (
                <Chip
                  size="small"
                  icon={<TrendIcon style={{ fontSize: 14 }} />}
                  label={trendValue}
                  color={trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'}
                  variant="outlined"
                  sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.65rem' } }}
                />
              )}
              <Typography variant="caption" color="text.secondary">
                {hint}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * PersonAvatar - Version améliorée avec statut en ligne
 */
export const PersonAvatar = ({
  user,
  size = 32,
  showStatus = false,
  status,
  onClick
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleClick = (event) => {
    if (onClick) {
      event.stopPropagation();
      setMenuAnchor(event.currentTarget);
    }
  };

  const handleClose = () => {
    setMenuAnchor(null);
  };

  const statusColors = {
    online: '#4caf50',
    away: '#ff9800',
    busy: '#f44336',
    offline: '#9e9e9e'
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.42,
          bgcolor: avatarColor(user),
          fontWeight: 700,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': onClick ? {
            transform: 'scale(1.1)',
            boxShadow: theme.shadows[4]
          } : undefined
        }}
      >
        {initials(user)}
      </Avatar>

      {showStatus && status && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: statusColors[status] || statusColors.offline,
            border: `2px solid ${theme.palette.background.paper}`,
            boxShadow: theme.shadows[1]
          }}
        />
      )}

      {/* Menu d'actions rapides */}
      {onClick && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 180,
              boxShadow: theme.shadows[8]
            }
          }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemIcon><PhoneIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Appeler</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon><EmailIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Envoyer un email</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon><ChatIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Discuter</ListItemText>
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
};

/**
 * RankBadge - Version améliorée avec effet de trophée
 */
export const RankBadge = ({ rank, urgency, size = 28, showTrophy = false }) => {
  const theme = useTheme();

  if (showTrophy && rank === 1) {
    return (
      <Box sx={{ position: 'relative' }}>
        <Avatar
          sx={{
            width: size,
            height: size,
            bgcolor: alpha(theme.palette.warning.main, 0.15),
            color: theme.palette.warning.main,
            fontSize: size * 0.5,
            fontWeight: 700,
            border: `2px solid ${theme.palette.warning.main}`,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        >
          <TrophyIcon style={{ fontSize: size * 0.6 }} />
        </Avatar>
        <Box
          sx={{
            position: 'absolute',
            top: -4,
            right: -4,
            fontSize: 10,
            fontWeight: 700,
            color: theme.palette.warning.main
          }}
        >
          🏆
        </Box>
      </Box>
    );
  }

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.45,
        fontWeight: 700,
        bgcolor: urgency ? URGENCY_BG[urgency] : theme.palette.grey[400],
        color: '#fff',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'scale(1.1)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      {rank}
    </Avatar>
  );
};

/**
 * PersonCell - Version améliorée avec informations enrichies
 */
export const PersonCell = ({
  user,
  phone,
  email,
  showStatus = false,
  status,
  rank,
  urgency,
  onAction,
  actions = []
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleActionClick = (action) => {
    onAction?.(action);
    setMenuAnchor(null);
  };

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.5 }}>
      <PersonAvatar
        user={user}
        size={40}
        showStatus={showStatus}
        status={status}
        onClick={(e) => setMenuAnchor(e.currentTarget)}
      />

      <Box flex={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" fontWeight={600}>
            {displayName(user)}
          </Typography>
          {rank && (
            <RankBadge rank={rank} urgency={urgency} size={20} />
          )}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          {phone && (
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {phone}
            </Typography>
          )}
          {email && (
            <Typography variant="caption" color="text.secondary">
              {email}
            </Typography>
          )}
        </Stack>
      </Box>

      {actions.length > 0 && (
        <>
          <IconButton
            size="small"
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{
              opacity: 0.7,
              '&:hover': { opacity: 1 }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            PaperProps={{
              sx: {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: theme.shadows[8]
              }
            }}
          >
            {actions.map((action) => (
              <MenuItem key={action.id} onClick={() => handleActionClick(action)}>
                <ListItemIcon>{action.icon}</ListItemIcon>
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Stack>
  );
};

/**
 * MetricsCard - Nouveau composant pour les métriques avancées
 */
export const MetricsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  data = [],
  color = 'primary',
  icon,
  loading = false
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Stack spacing={1}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={100} height={40} />
            <Skeleton variant="text" width={80} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const colorMap = {
    primary: theme.palette.primary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  };

  const ChangeIcon = {
    up: TrendingUpIcon,
    down: TrendingDownIcon,
    neutral: TrendingFlatIcon
  }[changeType];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(colorMap[color], 0.15)}`,
        bgcolor: alpha(colorMap[color], 0.03),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
              {title}
            </Typography>
            {icon && (
              <Box sx={{ color: colorMap[color] }}>
                {icon}
              </Box>
            )}
          </Stack>

          <Typography variant="h3" fontWeight={700} color={colorMap[color]}>
            {value}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            {change && (
              <>
                <ChangeIcon style={{ fontSize: 16, color: colorMap[color] }} />
                <Typography variant="caption" fontWeight={600} color={colorMap[color]}>
                  {change}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
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