import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  alpha,
  useTheme,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  Grow,
  Zoom,
  Skeleton,
  Breadcrumbs,
  Link,
  Avatar,
  Badge
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Notifications as NotificationIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Help as HelpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * PageHeader amélioré avec animations, variantes et actions contextuelles
 */
const PageHeader = ({
  // Props principales
  icon,
  eyebrow,
  title,
  subtitle,
  color = 'primary',

  // Props de navigation
  backButton = false,
  backPath,
  onBack,
  breadcrumbs = [],

  // Props d'affichage
  variant = 'default', // 'default' | 'compact' | 'minimal' | 'centered' | 'hero'
  size = 'medium', // 'small' | 'medium' | 'large'
  align = 'left', // 'left' | 'center' | 'right'
  showDivider = false,
  dividerColor,

  // Props d'interaction
  actions = [],
  favorite = false,
  onFavoriteToggle,
  bookmark = false,
  onBookmarkToggle,
  shareable = false,
  onShare,
  notifications = 0,
  onNotificationClick,

  // Props d'état
  loading = false,
  animated = true,
  elevation = 0,

  // Props de style
  sx = {},
  className,

  // Props enfants
  children,
  extraContent
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(favorite);
  const [isBookmarked, setIsBookmarked] = useState(bookmark);
  const [showActions, setShowActions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation au montage
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
    setIsLoaded(true);
  }, [animated]);

  // Couleur principale
  const mainColor = theme.palette[color]?.main || theme.palette.primary.main;
  const lightColor = alpha(mainColor, 0.08);
  const darkColor = theme.palette[color]?.dark || mainColor;

  // Gestion des actions
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    if (onFavoriteToggle) onFavoriteToggle(!isFavorite);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmarkToggle) onBookmarkToggle(!isBookmarked);
  };

  const handleShare = () => {
    if (onShare) onShare();
    else if (navigator.share) {
      navigator.share({
        title: title,
        text: subtitle || title,
        url: window.location.href,
      });
    }
  };

  // Rendu du contenu principal
  const renderContent = () => {
    if (loading) {
      return (
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={280} height={40} />
          <Skeleton variant="text" width={400} height={24} />
        </Stack>
      );
    }

    return (
      <>
        {/* Eyebrow */}
        {eyebrow && variant !== 'minimal' && (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              letterSpacing: 0.8,
              lineHeight: 1.6,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.4s ease'
            }}
          >
            {eyebrow}
            {variant === 'hero' && (
              <Chip
                label="Nouveau"
                size="small"
                sx={{
                  bgcolor: alpha(mainColor, 0.1),
                  color: mainColor,
                  fontWeight: 600,
                  fontSize: '0.6rem',
                  height: 20
                }}
              />
            )}
          </Typography>
        )}

        {/* Title avec gradient optionnel */}
        <Typography
          variant={variant === 'hero' ? 'h2' : 'h3'}
          sx={{
            lineHeight: 1.2,
            fontSize: {
              xs: variant === 'hero' ? '1.5rem' : variant === 'compact' ? '1rem' : '1.25rem',
              sm: variant === 'hero' ? '2.5rem' : variant === 'compact' ? '1.1rem' : '1.5rem',
              md: variant === 'hero' ? '3rem' : variant === 'compact' ? '1.2rem' : '1.75rem'
            },
            fontWeight: variant === 'hero' ? 800 : 700,
            ...(variant === 'hero' && {
              background: `linear-gradient(135deg, ${mainColor}, ${darkColor})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }),
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.5s ease 0.1s'
          }}
        >
          {title}
        </Typography>

        {/* Subtitle */}
        {subtitle && variant !== 'minimal' && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              maxWidth: 640,
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.5s ease 0.2s'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </>
    );
  };

  // Rendu des actions
  const renderActions = () => {
    const defaultActions = [];

    // Bouton favori
    if (favorite !== undefined) {
      defaultActions.push(
        <Tooltip key="favorite" title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
          <IconButton onClick={handleFavoriteToggle} size="small">
            {isFavorite ? (
              <FavoriteIcon sx={{ color: theme.palette.error.main }} />
            ) : (
              <FavoriteBorderIcon />
            )}
          </IconButton>
        </Tooltip>
      );
    }

    // Bouton bookmark
    if (bookmark !== undefined) {
      defaultActions.push(
        <Tooltip key="bookmark" title={isBookmarked ? 'Retirer le marque-page' : 'Ajouter aux marque-pages'}>
          <IconButton onClick={handleBookmarkToggle} size="small">
            {isBookmarked ? <StarIcon sx={{ color: theme.palette.warning.main }} /> : <StarBorderIcon />}
          </IconButton>
        </Tooltip>
      );
    }

    // Bouton partage
    if (shareable) {
      defaultActions.push(
        <Tooltip key="share" title="Partager">
          <IconButton onClick={handleShare} size="small">
            <ShareIcon />
          </IconButton>
        </Tooltip>
      );
    }

    // Notifications
    if (notifications > 0) {
      defaultActions.push(
        <Tooltip key="notifications" title={`${notifications} notification${notifications > 1 ? 's' : ''}`}>
          <IconButton onClick={onNotificationClick} size="small">
            <Badge badgeContent={notifications} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      );
    }

    // Actions personnalisées
    const allActions = [...defaultActions, ...actions];

    if (allActions.length === 0) return null;

    return (
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateX(0)' : 'translateX(10px)',
          transition: 'all 0.5s ease 0.3s'
        }}
      >
        {allActions}
      </Stack>
    );
  };

  // Rendu des breadcrumbs
  const renderBreadcrumbs = () => {
    if (!breadcrumbs.length) return null;

    return (
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          mb: 1,
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(-5px)',
          transition: 'all 0.4s ease 0.1s'
        }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <Typography key={item.label} color="text.primary" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
          ) : (
            <Link
              key={item.label}
              color="inherit"
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                if (item.onClick) item.onClick();
                else if (item.path) navigate(item.path);
              }}
              sx={{ cursor: 'pointer' }}
            >
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  // Rendu des éléments supplémentaires
  const renderExtraContent = () => {
    if (!extraContent) return null;

    return (
      <Box
        sx={{
          mt: 2,
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.5s ease 0.3s'
        }}
      >
        {extraContent}
      </Box>
    );
  };

  // Rendu principal
  return (
    <Grow in={isLoaded || !animated} timeout={500}>
      <Box
        className={className}
        sx={{
          position: 'relative',
          width: '100%',
          ...sx
        }}
      >
        <Paper
          elevation={elevation}
          sx={{
            p: variant === 'compact' ? 2 : variant === 'minimal' ? 1.5 : 3,
            borderRadius: variant === 'hero' ? 4 : 3,
            bgcolor: variant === 'hero'
              ? `linear-gradient(135deg, ${alpha(mainColor, 0.05)}, ${alpha(mainColor, 0.01)})`
              : 'background.paper',
            border: variant === 'hero'
              ? `1px solid ${alpha(mainColor, 0.1)}`
              : 'none',
            transition: 'all 0.3s ease',
            '&:hover': variant === 'hero' && {
              borderColor: alpha(mainColor, 0.2),
              boxShadow: theme.shadows[4]
            }
          }}
        >
          {/* Breadcrumbs */}
          {renderBreadcrumbs()}

          {/* En-tête principal */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
            justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
            sx={{
              width: '100%',
              textAlign: align === 'center' ? 'center' : align === 'right' ? 'right' : 'left'
            }}
          >
            {/* Icône */}
            {icon && variant !== 'minimal' && (
              <Zoom in={isLoaded || !animated} timeout={300}>
                <Box
                  sx={{
                    width: { xs: 40, sm: variant === 'compact' ? 36 : 48 },
                    height: { xs: 40, sm: variant === 'compact' ? 36 : 48 },
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(mainColor, 0.1),
                    color: mainColor,
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05) rotate(-5deg)',
                      bgcolor: alpha(mainColor, 0.15)
                    },
                    '& svg': {
                      fontSize: { xs: 20, sm: variant === 'compact' ? 18 : 24 }
                    }
                  }}
                >
                  {icon}
                </Box>
              </Zoom>
            )}

            {/* Contenu textuel */}
            <Box
              sx={{
                minWidth: 0,
                flex: 1,
                width: '100%'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
                justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}
              >
                <Box sx={{ flex: 1, width: '100%' }}>
                  {renderContent()}
                </Box>

                {/* Actions */}
                {renderActions()}
              </Stack>
            </Box>
          </Stack>

          {/* Contenu supplémentaire */}
          {renderExtraContent()}

          {/* Divider */}
          {showDivider && (
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: `1px solid ${dividerColor || alpha(theme.palette.divider, 0.5)}`
              }}
            />
          )}

          {/* Children */}
          {children && (
            <Box sx={{ mt: 2 }}>
              {children}
            </Box>
          )}
        </Paper>

        {/* Bouton retour flottant (style hero) */}
        {backButton && variant === 'hero' && (
          <Zoom in={isLoaded || !animated} timeout={300}>
            <IconButton
              onClick={handleBack}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.background.paper, 0.95)
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Zoom>
        )}
      </Box>
    </Grow>
  );
};

/**
 * PageHeaderCompact - Version compacte pour les espaces réduits
 */
export const PageHeaderCompact = (props) => (
  <PageHeader {...props} variant="compact" size="small" />
);

/**
 * PageHeaderMinimal - Version minimale sans icône ni eyebrow
 */
export const PageHeaderMinimal = (props) => (
  <PageHeader {...props} variant="minimal" showDivider={false} />
);

/**
 * PageHeaderHero - Version hero avec grand titre et gradient
 */
export const PageHeaderHero = (props) => (
  <PageHeader {...props} variant="hero" size="large" elevation={2} />
);

/**
 * PageHeaderWithFilters - Version avec filtres intégrés
 */
export const PageHeaderWithFilters = ({
  filters,
  onFilterChange,
  ...props
}) => (
  <PageHeader
    {...props}
    extraContent={
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
        {filters}
      </Stack>
    }
  />
);

export default PageHeader;