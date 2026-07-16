import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Chip,
  Avatar,
  Badge,
  Collapse,
  Fade,
  Grow,
  Zoom,
  LinearProgress,
  CardActionArea,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  SwipeableDrawer,
  Modal
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Chat as ChatIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Flag as FlagIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  PersonAdd as PersonAddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ContentCopy as ContentCopyIcon,
  Print as PrintIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  PhoneInTalk as PhoneInTalkIcon,
  Message as MessageIcon,
  Circle as CircleIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { styled, useTheme as useMuiTheme } from '@mui/material/styles';

import { displayName, maskPhone, telHref, whatsappHref, formatDateFr } from '../labels';
import { AlertChips, PersonAvatar, StageChip, UrgencyChip } from './Chips';
import HealthMeter from './HealthMeter';

// Styles personnalisés
const CardWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'transparent',
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: alpha(theme.palette.primary.main, 0.2),
    '&::before': {
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
    '& .action-buttons': {
      opacity: 1,
      transform: 'translateX(0)',
    }
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(-5deg)',
  }
}));

const StatusIndicator = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.2)', opacity: 0.7 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  }
}));

/**
 * PersonCard amélioré avec animations, interactions et design moderne
 */
const PersonCard = ({
  profile,
  onOpen,
  onFavoriteToggle,
  onPinToggle,
  onArchive,
  onDelete,
  onShare,
  onMessage,
  compact = false,
  selectable = false,
  selected = false,
  onSelect,
  variant = 'default', // 'default' | 'compact' | 'minimal'
  elevation = 1,
  animated = true,
  showActions = true,
  showTimeline = false,
  interactions = true
}) => {
  const theme = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const cardRef = useRef(null);

  const user = profile.idUser || {};
  const phone = user.phone;
  const daysSince = profile.ledgerSnapshot?.daysSinceLastActivity;
  const hasUrgency = profile.urgency === 'critical' || profile.urgency === 'high';

  // Animation au montage
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
    setIsLoaded(true);
  }, [animated]);

  // Gestion des interactions
  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteToggle) onFavoriteToggle(profile, !isFavorite);
  };

  const handlePinToggle = (e) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
    if (onPinToggle) onPinToggle(profile, !isPinned);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleAction = (action, e) => {
    e?.stopPropagation();
    handleMenuClose();
    switch (action) {
      case 'view':
        onOpen?.();
        break;
      case 'call':
        window.location.href = telHref(phone);
        break;
      case 'whatsapp':
        window.open(whatsappHref(phone), '_blank', 'noopener');
        break;
      case 'email':
        window.location.href = `mailto:${user.email}`;
        break;
      case 'message':
        onMessage?.(profile);
        break;
      case 'share':
        onShare?.(profile);
        break;
      case 'archive':
        onArchive?.(profile);
        break;
      case 'delete':
        onDelete?.(profile);
        break;
      default:
        break;
    }
  };

  // Rendu des indicateurs de statut
  const renderStatusIndicators = () => {
    const indicators = [];

    if (profile.healthLevel === 'critical') {
      indicators.push(
        <Tooltip key="critical" title="État critique - Action immédiate nécessaire">
          <StatusIndicator sx={{ bgcolor: theme.palette.error.main }} />
        </Tooltip>
      );
    }

    if (profile.alerts?.length > 0) {
      indicators.push(
        <Tooltip key="alerts" title={`${profile.alerts.length} alerte(s)`}>
          <Badge badgeContent={profile.alerts.length} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 8, height: 16, minWidth: 16 } }}>
            <CircleIcon sx={{ fontSize: 8, color: theme.palette.warning.main }} />
          </Badge>
        </Tooltip>
      );
    }

    if (profile.stage === 'S1' || profile.stage === 'S2') {
      indicators.push(
        <Tooltip key="new" title="Nouveau client">
          <Chip
            label="Nouveau"
            size="small"
            sx={{
              height: 16,
              fontSize: '0.5rem',
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              fontWeight: 600
            }}
          />
        </Tooltip>
      );
    }

    return indicators;
  };

  // Rendu des actions rapides
  const renderQuickActions = () => (
    <Stack
      className="action-buttons"
      direction="row"
      spacing={0.5}
      sx={{
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
        transition: 'all 0.3s ease'
      }}
    >
      {phone && (
        <>
          <Tooltip title="Appeler">
            <ActionButton
              size="small"
              color="primary"
              onClick={(e) => handleAction('call', e)}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
            >
              <CallIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          <Tooltip title="WhatsApp">
            <ActionButton
              size="small"
              color="success"
              onClick={(e) => handleAction('whatsapp', e)}
              sx={{ bgcolor: alpha(theme.palette.success.main, 0.08) }}
            >
              <WhatsAppIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
        </>
      )}
      <Tooltip title="Plus d'actions">
        <ActionButton
          size="small"
          onClick={handleMenuOpen}
          sx={{ bgcolor: alpha(theme.palette.grey[500], 0.08) }}
        >
          <MoreVertIcon fontSize="small" />
        </ActionButton>
      </Tooltip>
    </Stack>
  );

  // Rendu de la carte compacte
  const renderCompact = () => (
    <CardWrapper
      ref={cardRef}
      elevation={elevation}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <PersonAvatar user={user} size={36} />
        <Box flex={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" noWrap fontWeight={600}>
              {displayName(user)}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <UrgencyChip urgency={profile.urgency} size="small" />
              {isFavorite && <FavoriteIcon sx={{ fontSize: 14, color: theme.palette.error.main }} />}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {maskPhone(phone)}
            </Typography>
            <HealthMeter level={profile.healthLevel} score={profile.healthScore} dense size="small" />
          </Stack>
        </Box>
      </Stack>
    </CardWrapper>
  );

  // Rendu de la carte minimale
  const renderMinimal = () => (
    <Paper
      elevation={0}
      sx={{
        p: 1,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }
      }}
      onClick={onOpen}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <PersonAvatar user={user} size={28} />
        <Box flex={1}>
          <Typography variant="body2" noWrap fontWeight={500}>
            {displayName(user)}
          </Typography>
        </Box>
        <UrgencyChip urgency={profile.urgency} size="small" />
      </Stack>
    </Paper>
  );

  // Rendu principal
  const renderDefault = () => (
    <Grow in={isLoaded} timeout={300}>
      <CardWrapper
        ref={cardRef}
        elevation={elevation}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          cursor: interactions ? 'pointer' : 'default',
          borderColor: selected ? theme.palette.primary.main : undefined,
          bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : undefined,
          ...(isPinned && {
            borderColor: alpha(theme.palette.warning.main, 0.3),
            bgcolor: alpha(theme.palette.warning.main, 0.02),
          })
        }}
        onClick={() => {
          if (selectable && onSelect) {
            onSelect(profile);
          } else if (interactions) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        {/* En-tête */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <PersonAvatar user={user} size={48} showStatus />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" noWrap fontWeight={600}>
                  {displayName(user)}
                </Typography>
                {renderStatusIndicators()}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {maskPhone(phone)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
              <IconButton size="small" onClick={handleFavoriteToggle}>
                {isFavorite ? (
                  <FavoriteIcon sx={{ color: theme.palette.error.main, fontSize: 18 }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title={isPinned ? 'Désépingler' : 'Épingler'}>
              <IconButton size="small" onClick={handlePinToggle}>
                {isPinned ? (
                  <PushPinIcon sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                ) : (
                  <PushPinOutlinedIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            {!compact && renderQuickActions()}
          </Stack>
        </Stack>

        {/* Urgence et métriques */}
        <Stack direction="row" spacing={1.5} mt={1.5} flexWrap="wrap" useFlexGap alignItems="center">
          <UrgencyChip urgency={profile.urgency} />
          <StageChip stage={profile.stage} />
          <HealthMeter level={profile.healthLevel} score={profile.healthScore} dense />
        </Stack>

        {/* Alertes */}
        {profile.alerts?.length > 0 && (
          <Box mt={1}>
            <AlertChips alerts={profile.alerts} max={3} />
          </Box>
        )}

        {/* Dernière activité */}
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          <AccessTimeIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
          Dernière activité : {formatDateFr(profile.ledgerSnapshot?.lastActivityAt)}
          {daysSince != null && (
            <Chip
              label={`Il y a ${daysSince} jour${daysSince > 1 ? 's' : ''}`}
              size="small"
              sx={{
                ml: 1,
                height: 16,
                fontSize: '0.5rem',
                bgcolor: daysSince > 7 ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                color: daysSince > 7 ? theme.palette.warning.main : theme.palette.success.main
              }}
            />
          )}
        </Typography>

        {/* Section développée */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5}>
              {/* Informations détaillées */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Informations de contact
                  </Typography>
                  <Stack spacing={0.5} mt={0.5}>
                    {user.email && (
                      <Typography variant="body2">
                        <EmailIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {user.email}
                      </Typography>
                    )}
                    {user.address && (
                      <Typography variant="body2">
                        <FlagIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {user.address}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box flex={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Métriques
                  </Typography>
                  <Stack spacing={0.5} mt={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Score de santé</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {profile.healthScore || 'N/A'}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Alertes</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {profile.alerts?.length || 0}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Dépôts</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {profile.ledgerSnapshot?.totalDeposits || 0}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              {/* Actions supplémentaires */}
              <Divider />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ViewIcon />}
                  onClick={(e) => { e.stopPropagation(); handleAction('view'); }}
                >
                  Voir la fiche
                </Button>
                {phone && (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<CallIcon />}
                      onClick={(e) => { e.stopPropagation(); handleAction('call'); }}
                    >
                      Appeler
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      startIcon={<WhatsAppIcon />}
                      onClick={(e) => { e.stopPropagation(); handleAction('whatsapp'); }}
                    >
                      WhatsApp
                    </Button>
                  </>
                )}
                {user.email && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    onClick={(e) => { e.stopPropagation(); handleAction('email'); }}
                  >
                    Email
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Collapse>

        {/* Menu contextuel */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 200,
              boxShadow: theme.shadows[8]
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={() => handleAction('view')}>
            <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Voir la fiche</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('message')}>
            <ListItemIcon><MessageIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Envoyer un message</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('share')}>
            <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Partager</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction('archive')}>
            <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Archiver</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Supprimer</ListItemText>
          </MenuItem>
        </Menu>
      </CardWrapper>
    </Grow>
  );

  // Sélection du rendu selon la variante
  const renderCard = () => {
    switch (variant) {
      case 'compact': return renderCompact();
      case 'minimal': return renderMinimal();
      default: return renderDefault();
    }
  };

  return renderCard();
};

/**
 * PersonCardSkeleton - État de chargement
 */
export const PersonCardSkeleton = ({ count = 1, variant = 'default' }) => {
  const theme = useTheme();

  if (variant === 'compact') {
    return Array.from({ length: count }).map((_, i) => (
      <Paper key={i} sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={36} height={36} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        </Stack>
      </Paper>
    ));
  }

  return Array.from({ length: count }).map((_, i) => (
    <Paper key={i} sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Skeleton variant="circular" width={48} height={48} />
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
    </Paper>
  ));
};

/**
 * PersonCardList - Liste de cartes avec options de tri
 */
export const PersonCardList = ({
  profiles,
  loading = false,
  onOpen,
  onFavoriteToggle,
  variant = 'default',
  compact = false,
  ...props
}) => {
  const theme = useTheme();

  if (loading) {
    return <PersonCardSkeleton count={3} variant={variant} />;
  }

  if (!profiles?.length) {
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
          Aucune personne trouvée
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ajustez vos filtres ou essayez une autre recherche
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {profiles.map((profile, index) => (
        <PersonCard
          key={profile._id || index}
          profile={profile}
          onOpen={() => onOpen?.(profile)}
          onFavoriteToggle={onFavoriteToggle}
          variant={variant}
          compact={compact}
          animated
          {...props}
        />
      ))}
    </Stack>
  );
};

export default PersonCard;