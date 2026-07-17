import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Chip,
  Badge,
  Collapse,
  Fade,
  Grow,
  Zoom,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  CardActionArea,
  Skeleton,
  SwipeableDrawer,
  Snackbar,
  Alert,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  EventRepeat as CarryIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NotificationsActive as NotificationIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  PhoneInTalk as PhoneInTalkIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  DoneAll as DoneAllIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { displayName, maskPhone, telHref, whatsappHref, URGENCY_COLORS } from '../labels';
import { ActionLabel, AlertChips, PersonAvatar, RankBadge, StageChip, StatusChip } from './Chips';

const getUrgencyStripeColor = (theme, urgency) => {
  const colorKey = URGENCY_COLORS[urgency];
  if (!colorKey || colorKey === 'default') return theme.palette.grey[400];
  return theme.palette[colorKey]?.main || theme.palette.grey[400];
};

// Composant d'indicateur de temps
const TimeIndicator = ({ date, originDate }) => {
  const theme = useTheme();
  const isOverdue = new Date(date) < new Date();
  const daysDiff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  if (isOverdue) {
    return (
      <Chip
        icon={<WarningIcon sx={{ fontSize: 14 }} />}
        label={`En retard de ${Math.abs(daysDiff)} jour${Math.abs(daysDiff) > 1 ? 's' : ''}`}
        size="small"
        color="error"
        sx={{ fontWeight: 600 }}
      />
    );
  }

  if (daysDiff <= 3) {
    return (
      <Chip
        icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
        label={`Échéance dans ${daysDiff} jour${daysDiff > 1 ? 's' : ''}`}
        size="small"
        color="warning"
        sx={{ fontWeight: 600 }}
      />
    );
  }

  return (
    <Chip
      icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
      label={`Prévu le ${date}`}
      size="small"
      variant="outlined"
    />
  );
};

// Composant d'actions rapides
const QuickActions = ({ task, onOpen, onCarry, onCopy, onView, phone }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const actions = [
    {
      icon: <CallIcon />,
      label: 'Appeler',
      action: () => window.location.href = telHref(phone),
      disabled: !phone
    },
    {
      icon: <WhatsAppIcon />,
      label: 'WhatsApp',
      action: () => window.open(whatsappHref(phone), '_blank', 'noopener'),
      disabled: !phone
    },
    {
      icon: <EmailIcon />,
      label: 'Email',
      action: () => window.location.href = `mailto:${task.idUser?.email}`,
      disabled: !task.idUser?.email
    },
    {
      icon: <CopyIcon />,
      label: 'Copier message',
      action: () => onCopy(task.templateSnapshot),
      disabled: !task.templateSnapshot
    },
    {
      icon: <CarryIcon />,
      label: 'Reporter',
      action: () => onCarry(task)
    },
    {
      icon: <ViewIcon />,
      label: 'Voir la fiche',
      action: () => onView(task)
    }
  ];

  return (
    <>
      <Stack direction="row" spacing={0.5}>
        {actions.slice(0, 3).map((action, index) => (
          <Tooltip key={index} title={action.label}>
            <span>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); action.action(); }}
                disabled={action.disabled}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1) rotate(-5deg)',
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                {action.icon}
              </IconButton>
            </span>
          </Tooltip>
        ))}
        <Tooltip title="Plus d'actions">
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                bgcolor: alpha(theme.palette.grey[500], 0.08)
              }
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              action.action();
              handleMenuClose();
            }}
            disabled={action.disabled}
            dense
          >
            <ListItemIcon>
              {React.cloneElement(action.icon, { fontSize: 'small' })}
            </ListItemIcon>
            <ListItemText primary={action.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/**
 * TaskCard amélioré avec design moderne et UX enrichie
 */
const TaskCard = ({
  task,
  rank,
  showDate = false,
  onOpen,
  onCarry,
  onCopy,
  onView,
  onFavoriteToggle,
  isFavorite = false,
  onArchive,
  onDelete,
  onShare,
  variant = 'default', // 'default' | 'compact' | 'minimal' | 'detailed'
  elevation = 1,
  animated = true,
  showActions = true,
  expanded = false,
  onExpandToggle,
  selectable = false,
  selected = false,
  onSelect,
  loading = false
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const cardRef = useRef(null);

  const phone = task.idUser?.phone;
  const isUrgent = task.urgency === 'critical' || task.urgency === 'high';
  const isOverdue = showDate && new Date(task.date) < new Date();
  const urgencyStripe = getUrgencyStripeColor(theme, task.urgency);

  // Animation au montage
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
    setIsLoaded(true);
  }, [animated]);

  // Gestion des interactions
  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setShowCopied(true);
        if (onCopy) onCopy(text);
        setTimeout(() => setShowCopied(false), 2000);
      });
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onExpandToggle) onExpandToggle(!isExpanded);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(task);
  };

  // Rendu du contenu enrichi
  const renderDetailedContent = () => (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Informations de contact
            </Typography>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              {task.idUser?.email && (
                <Typography variant="body2">
                  <EmailIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  {task.idUser.email}
                </Typography>
              )}
              {task.idUser?.address && (
                <Typography variant="body2">
                  <FlagIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                  {task.idUser.address}
                </Typography>
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Détails de la tâche
            </Typography>
            <Stack spacing={1} sx={{ mt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Créée le</Typography>
                <Typography variant="caption" fontWeight={500}>{task.createdAt}</Typography>
              </Stack>
              {task.updatedAt && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Modifiée le</Typography>
                  <Typography variant="caption" fontWeight={500}>{task.updatedAt}</Typography>
                </Stack>
              )}
              {task.carryCount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Nombre de reports</Typography>
                  <Chip
                    label={`${task.carryCount}×`}
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: '0.6rem' }}
                  />
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>

        {task.notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Notes
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mt: 0.5,
                bgcolor: alpha(theme.palette.grey[50], 0.5),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {task.notes}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Collapse>
  );

  // Rendu de la carte compacte
  const renderCompact = () => (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        borderLeft: `4px solid ${urgencyStripe}`,
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: alpha(urgencyStripe, 0.5),
          borderLeftColor: urgencyStripe,
          boxShadow: `0 6px 20px ${alpha(urgencyStripe, 0.12)}`,
          transform: 'translateY(-2px)'
        }
      }}
      onClick={onOpen}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <RankBadge rank={rank} urgency={task.urgency} size={24} />
        <PersonAvatar user={task.idUser} size={32} />
        <Box flex={1}>
          <Typography variant="body2" noWrap fontWeight={600}>
            {displayName(task.idUser)}
          </Typography>
          <ActionLabel action={task.actionType} size="small" />
        </Box>
        <StatusChip status={task.status} size="small" />
      </Stack>
    </Paper>
  );

  // Rendu de la carte minimale
  const renderMinimal = () => (
    <Box
      sx={{
        p: 1,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: isHovered ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.04)
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
    >
      <RankBadge rank={rank} urgency={task.urgency} size={20} />
      <PersonAvatar user={task.idUser} size={24} />
      <Typography variant="caption" noWrap sx={{ flex: 1 }}>
        {displayName(task.idUser)}
      </Typography>
      <StatusChip status={task.status} size="small" />
    </Box>
  );

  // Rendu principal
  const renderDefault = () => {
    if (loading) {
      return (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={1.5}>
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={20} width="60%" />
            <Skeleton variant="rectangular" height={30} />
          </Stack>
        </Paper>
      );
    }

    return (
      <Grow in={isLoaded} timeout={300}>
        <Paper
          ref={cardRef}
          elevation={elevation}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
            borderLeft: `4px solid ${urgencyStripe}`,
            bgcolor: task.status === 'carried_over'
              ? alpha(theme.palette.warning.main, 0.04)
              : isOverdue
                ? alpha(theme.palette.error.main, 0.02)
                : 'background.paper',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'translateY(-3px)' : 'none',
            boxShadow: isHovered
              ? `0 8px 24px ${alpha(urgencyStripe, 0.14)}`
              : theme.shadows[1],
            position: 'relative',
            overflow: 'hidden',
            cursor: selectable ? 'pointer' : 'default',
            '&:hover': {
              borderColor: alpha(urgencyStripe, 0.35),
              borderLeftColor: urgencyStripe,
            },
            ...(selected && {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              boxShadow: theme.shadows[4]
            })
          }}
          onClick={() => {
            if (selectable && onSelect) {
              onSelect(task);
            } else if (onExpandToggle) {
              handleToggleExpand();
            }
          }}
        >
          {/* En-tête */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <RankBadge rank={rank} urgency={task.urgency} size={32} />
              <PersonAvatar user={task.idUser} size={40} showStatus={isHovered} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle1" noWrap fontWeight={600}>
                    {displayName(task.idUser)}
                  </Typography>
                  {isUrgent && (
                    <Chip
                      icon={<WarningIcon sx={{ fontSize: 14 }} />}
                      label="Urgent"
                      size="small"
                      color="error"
                      sx={{ height: 20, fontWeight: 600 }}
                    />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {maskPhone(phone)}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip status={task.status} size="small" />
              {isFavorite !== undefined && (
                <Tooltip title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); onFavoriteToggle?.(!isFavorite); }}
                    sx={{ transition: 'all 0.3s ease' }}
                  >
                    {isFavorite ? (
                      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                    ) : (
                      <StarBorderIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {/* Date et indicateurs de temps */}
          {showDate && (
            <Box sx={{ mt: 1 }}>
              <TimeIndicator date={task.date} originDate={task.originDate} />
              {task.originDate && task.originDate !== task.date && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  (depuis {task.originDate})
                </Typography>
              )}
            </Box>
          )}

          {/* Actions et métriques */}
          <Stack direction="row" spacing={1.5} mt={1.5} flexWrap="wrap" useFlexGap alignItems="center">
            <ActionLabel action={task.actionType} />
            <StageChip stage={task.stageSnapshot} size="small" />
            {task.carryCount > 0 && (
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                label={`Reporté ${task.carryCount}×`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Alertes */}
          {task.alertsSnapshot?.length > 0 && (
            <Box mt={1}>
              <AlertChips alerts={task.alertsSnapshot} max={3} />
            </Box>
          )}

          {/* Message template */}
          {task.templateSnapshot && isHovered && (
            <Fade in={isHovered}>
              <Paper
                elevation={0}
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    <InfoIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    Message suggéré
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleCopy(task.templateSnapshot); }}
                    sx={{ transition: 'all 0.3s ease' }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    maxHeight: 60,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {task.templateSnapshot}
                </Typography>
              </Paper>
            </Fade>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Actions */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
            <QuickActions
              task={task}
              phone={phone}
              onOpen={onOpen}
              onCarry={onCarry}
              onCopy={handleCopy}
              onView={onView}
            />

            <Button
              variant="contained"
              startIcon={<StartIcon />}
              onClick={(e) => { e.stopPropagation(); onOpen(task); }}
              sx={{
                borderRadius: 2,
                minWidth: 120,
                background: isUrgent
                  ? `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.warning.main})`
                  : undefined,
                '&:hover': isUrgent ? {
                  background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.warning.dark})`,
                } : undefined
              }}
            >
              Traiter
            </Button>
          </Stack>

          {/* Contenu développé */}
          {renderDetailedContent()}
        </Paper>
      </Grow>
    );
  };

  // Sélection du rendu selon la variante
  const renderCard = () => {
    switch (variant) {
      case 'compact': return renderCompact();
      case 'minimal': return renderMinimal();
      default: return renderDefault();
    }
  };

  return (
    <>
      {renderCard()}

      {/* Snackbar pour la copie */}
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          Message copié dans le presse-papier
        </Alert>
      </Snackbar>
    </>
  );
};

/**
 * TaskCardSkeleton - État de chargement
 */
export const TaskCardSkeleton = ({ count = 1, variant = 'default' }) => {
  const theme = useTheme();

  if (variant === 'compact') {
    return Array.from({ length: count }).map((_, i) => (
      <Paper key={i} sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={40} height={40} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        </Stack>
      </Paper>
    ));
  }

  return Array.from({ length: count }).map((_, i) => (
    <Paper key={i} sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={40} height={40} />
        <Box flex={1}>
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="30%" />
        </Box>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
      </Stack>
      <Stack direction="row" spacing={1} mt={1.5}>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
      </Stack>
      <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1.5}>
        <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
      </Stack>
    </Paper>
  ));
};

/**
 * TaskCardList - Liste de cartes avec options
 */
export const TaskCardList = ({
  tasks,
  loading = false,
  onOpen,
  onCarry,
  onCopy,
  onView,
  onFavoriteToggle,
  variant = 'default',
  showDate = false,
  ...props
}) => {
  const theme = useTheme();

  if (loading) {
    return <TaskCardSkeleton count={3} variant={variant} />;
  }

  if (!tasks?.length) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Aucune tâche trouvée
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aucune tâche à traiter pour le moment
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {tasks.map((task, index) => (
        <TaskCard
          key={task._id || index}
          task={task}
          rank={index + 1}
          showDate={showDate}
          onOpen={() => onOpen?.(task)}
          onCarry={() => onCarry?.(task)}
          onCopy={onCopy}
          onView={() => onView?.(task)}
          onFavoriteToggle={(favorite) => onFavoriteToggle?.(task, favorite)}
          variant={variant}
          animated
          {...props}
        />
      ))}
    </Stack>
  );
};

export default TaskCard;