import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Box,
  alpha,
  useTheme,
  Paper,
  Fade,
  Grow,
  Zoom,
  Chip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  ClickAwayListener,
  Popper,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  ContentCopy as CopyIcon,
  PhoneInTalk as PhoneInTalkIcon,
  Message as MessageIcon,
  Schedule as ScheduleIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  PhoneEnabled as PhoneEnabledIcon,
  PhoneDisabled as PhoneDisabledIcon,
  WifiCalling as WifiCallIcon,
  Videocam as VideoCallIcon,
  QrCode as QrCodeIcon,
  PersonAdd as PersonAddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Settings as SettingsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { maskPhone, telHref, whatsappHref } from '../labels';

const TEAL = { main: '#0D9488', dark: '#0F766E' };

// Styles personnalisés
const PhoneContainer = styled(Paper)(({ theme, isHovered }) => ({
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(2),
  backgroundColor: isHovered
    ? alpha(TEAL.main, 0.04)
    : 'transparent',
  border: `1px solid ${isHovered
    ? alpha(TEAL.main, 0.15)
    : 'transparent'}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  cursor: 'default',
  '&:hover': {
    backgroundColor: alpha(TEAL.main, 0.05),
    borderColor: alpha(TEAL.main, 0.18),
  },
  '&:hover .phone-action-btn': {
    opacity: 1
  }
}));

const PhoneNumber = styled(Typography)(({ theme, isRevealed, isHovered }) => ({
  fontFamily: 'monospace',
  letterSpacing: 0.5,
  fontWeight: isRevealed ? 600 : 400,
  color: isRevealed
    ? theme.palette.text.primary
    : theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  position: 'relative',
  '&::after': !isRevealed ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    background: `linear-gradient(90deg, ${TEAL.main}, ${TEAL.dark})`,
    opacity: isHovered ? 0.6 : 0,
    transition: 'opacity 0.25s ease'
  } : {}
}));

const ActionButton = styled(IconButton)(({ theme, color }) => ({
  transition: 'all 0.25s ease',
  padding: 4,
  opacity: 0.5,
  '&:hover': {
    transform: 'scale(1.12)',
    opacity: 1,
    backgroundColor: color
      ? alpha(theme.palette[color].main, 0.12)
      : alpha(TEAL.main, 0.1),
  },
  '&:active': {
    transform: 'scale(0.95)',
  }
}));

const CallQualityIndicator = styled(Box)(({ theme, quality }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
  padding: '2px 6px',
  borderRadius: 8,
  fontSize: '0.6rem',
  fontWeight: 600,
  backgroundColor: quality === 'excellent'
    ? alpha(theme.palette.success.main, 0.1)
    : quality === 'good'
      ? alpha(theme.palette.info.main, 0.1)
      : quality === 'poor'
        ? alpha(theme.palette.warning.main, 0.1)
        : alpha(theme.palette.error.main, 0.1),
  color: quality === 'excellent'
    ? theme.palette.success.main
    : quality === 'good'
      ? theme.palette.info.main
      : quality === 'poor'
        ? theme.palette.warning.main
        : theme.palette.error.main,
  border: `1px solid ${quality === 'excellent'
    ? alpha(theme.palette.success.main, 0.2)
    : quality === 'good'
      ? alpha(theme.palette.info.main, 0.2)
      : quality === 'poor'
        ? alpha(theme.palette.warning.main, 0.2)
        : alpha(theme.palette.error.main, 0.2)}`,
}));

/**
 * PhoneAction amélioré avec animations, interactions et design moderne
 */
const PhoneAction = ({
  phone,
  size = 'medium',
  allowReveal = true,
  showActions = true,
  variant = 'default', // 'default' | 'compact' | 'minimal' | 'chip'
  showIcon = true,
  showQuality = false,
  quality = 'good',
  callHistory = [],
  onCall,
  onWhatsApp,
  onCopy,
  onSchedule,
  onAddContact,
  onFavoriteToggle,
  isFavorite = false,
  disabled = false,
  loading = false,
  error = false,
  tooltipPlacement = 'top',
  className,
  sx = {}
}) => {
  const theme = useTheme();
  const [revealed, setRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPopper, setShowPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef(null);

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  // Effet pour le copier
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Gestionnaires d'actions
  const handleCall = (e) => {
    e?.stopPropagation();
    if (disabled) return;

    if (onCall) {
      onCall(phone);
    } else {
      window.location.href = telHref(phone);
    }
    setShowPopper(false);
  };

  const handleWhatsApp = (e) => {
    e?.stopPropagation();
    if (disabled) return;

    if (onWhatsApp) {
      onWhatsApp(phone);
    } else {
      window.open(whatsappHref(phone), '_blank', 'noopener');
    }
    setShowPopper(false);
  };

  const handleCopy = (e) => {
    e?.stopPropagation();
    if (disabled) return;

    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      if (onCopy) onCopy(phone);
      setSnackbar({ open: true, message: 'Numéro copié !', severity: 'success' });
    });
    setShowPopper(false);
  };

  const handleToggleReveal = (e) => {
    e?.stopPropagation();
    setRevealed(!revealed);
  };

  const handleSchedule = (e) => {
    e?.stopPropagation();
    setDialogAction('schedule');
    setOpenDialog(true);
    setShowPopper(false);
  };

  const handleAddContact = (e) => {
    e?.stopPropagation();
    setDialogAction('addContact');
    setOpenDialog(true);
    setShowPopper(false);
  };

  const handleFavoriteToggle = (e) => {
    e?.stopPropagation();
    if (onFavoriteToggle) onFavoriteToggle(phone);
    setShowPopper(false);
  };

  const handleMenuOpen = (e) => {
    e?.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setDialogAction(null);
  };

  const handleDialogConfirm = () => {
    // Logique de confirmation
    setOpenDialog(false);
    setDialogAction(null);
    setSnackbar({
      open: true,
      message: `Action planifiée avec succès`,
      severity: 'success'
    });
  };

  // Rendu du statut de qualité
  const renderQuality = () => {
    if (!showQuality) return null;

    const qualityLabels = {
      excellent: 'Excellente',
      good: 'Bonne',
      poor: 'Moyenne',
      bad: 'Mauvaise'
    };

    return (
      <CallQualityIndicator quality={quality}>
        {quality === 'excellent' && <CheckCircleIcon sx={{ fontSize: 12 }} />}
        {quality === 'good' && <InfoIcon sx={{ fontSize: 12 }} />}
        {quality === 'poor' && <ErrorIcon sx={{ fontSize: 12 }} />}
        {quality === 'bad' && <ErrorIcon sx={{ fontSize: 12 }} />}
        {qualityLabels[quality] || quality}
      </CallQualityIndicator>
    );
  };

  // Rendu du bouton d'action principal
  const renderActionButton = () => {
    if (variant === 'chip') {
      return (
        <Chip
          label={revealed ? phone : maskPhone(phone)}
          icon={showIcon ? <CallIcon /> : undefined}
          size={isSmall ? 'small' : 'medium'}
          onClick={handleCall}
          onDelete={allowReveal ? handleToggleReveal : undefined}
          disabled={disabled || loading}
          color="primary"
          variant="outlined"
          sx={{
            fontFamily: 'monospace',
            '& .MuiChip-label': { fontWeight: 500 },
            ...(isHovered && {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            })
          }}
        />
      );
    }

    return (
      <PhoneContainer
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={className}
        sx={sx}
      >
        {showIcon && (
          <PhoneEnabledIcon
            sx={{
              fontSize: isSmall ? 16 : isLarge ? 24 : 20,
              color: error ? theme.palette.error.main : TEAL.main,
              opacity: disabled ? 0.5 : 1,
              transition: 'color 0.2s ease'
            }}
          />
        )}

        <PhoneNumber
          variant={isSmall ? 'caption' : isLarge ? 'h6' : 'body2'}
          isRevealed={revealed}
          isHovered={isHovered}
          sx={{
            fontSize: isSmall ? '0.75rem' : isLarge ? '1.25rem' : '0.9rem',
            opacity: disabled ? 0.5 : 1
          }}
        >
          {loading ? (
            <CircularProgress size={isSmall ? 12 : 16} />
          ) : error ? (
            'Erreur'
          ) : revealed ? (
            phone
          ) : (
            maskPhone(phone)
          )}
        </PhoneNumber>

        {renderQuality()}

        {!disabled && !loading && !error && (
          <Stack direction="row" spacing={0.25} alignItems="center" sx={{ opacity: revealed ? 1 : undefined }}>
            {allowReveal && (
              <Tooltip title={revealed ? 'Cacher le numéro' : 'Afficher le numéro'} placement={tooltipPlacement}>
                <ActionButton
                  size="small"
                  className="phone-action-btn"
                  onClick={handleToggleReveal}
                >
                  {revealed ? <HideIcon fontSize="small" /> : <ShowIcon fontSize="small" />}
                </ActionButton>
              </Tooltip>
            )}

            {showActions && (
              <>
                <Tooltip title="Appeler" placement={tooltipPlacement}>
                  <ActionButton
                    size="small"
                    className="phone-action-btn"
                    color="primary"
                    onClick={handleCall}
                  >
                    <CallIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>

                <Tooltip title="WhatsApp" placement={tooltipPlacement}>
                  <ActionButton
                    size="small"
                    className="phone-action-btn"
                    color="success"
                    onClick={handleWhatsApp}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>

                <Tooltip title="Plus d'actions" placement={tooltipPlacement}>
                  <ActionButton
                    size="small"
                    className="phone-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPopper(!showPopper);
                      setAnchorEl(buttonRef.current);
                    }}
                    ref={buttonRef}
                  >
                    <MoreVertIcon fontSize="small" />
                  </ActionButton>
                </Tooltip>
              </>
            )}
          </Stack>
        )}
      </PhoneContainer>
    );
  };

  // Rendu du menu contextuel
  const renderContextMenu = () => (
    <Popper
      open={showPopper}
      anchorEl={anchorEl}
      placement="bottom-end"
      transition
      sx={{ zIndex: 1400 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            elevation={8}
            sx={{
              mt: 1,
              borderRadius: 2,
              minWidth: 220,
              maxWidth: 280,
              overflow: 'hidden',
              boxShadow: theme.shadows[8]
            }}
          >
            <ClickAwayListener onClickAway={() => setShowPopper(false)}>
              <Box>
                <Box sx={{ p: 2, bgcolor: alpha(TEAL.main, 0.05) }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Actions disponibles
                  </Typography>
                </Box>

                <Box sx={{ py: 1 }}>
                  <MenuItem onClick={handleCall} dense>
                    <ListItemIcon><CallIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Appeler" secondary="Appel vocal" />
                  </MenuItem>

                  <MenuItem onClick={handleWhatsApp} dense>
                    <ListItemIcon><WhatsAppIcon fontSize="small" color="success" /></ListItemIcon>
                    <ListItemText primary="WhatsApp" secondary="Message ou appel" />
                  </MenuItem>

                  <MenuItem onClick={handleCopy} dense>
                    <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Copier le numéro" secondary={copied ? 'Copié !' : 'Copier dans le presse-papier'} />
                  </MenuItem>

                  <Divider />

                  <MenuItem onClick={handleSchedule} dense>
                    <ListItemIcon><ScheduleIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Planifier un appel" secondary="Rappel programmé" />
                  </MenuItem>

                  <MenuItem onClick={handleAddContact} dense>
                    <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ajouter au répertoire" secondary="Sauvegarder le contact" />
                  </MenuItem>

                  <MenuItem onClick={handleFavoriteToggle} dense>
                    <ListItemIcon>
                      {isFavorite ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText primary={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} />
                  </MenuItem>

                  {callHistory?.length > 0 && (
                    <>
                      <Divider />
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Derniers appels
                        </Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          {callHistory.slice(0, 2).map((call, i) => (
                            <Typography key={i} variant="caption" color="text.secondary">
                              {call.date} - {call.duration}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  // Rendu du dialogue
  const renderDialog = () => (
    <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialogAction === 'schedule' ? 'Planifier un appel' : 'Ajouter au répertoire'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Numéro de téléphone"
            value={phone}
            disabled
            variant="outlined"
            size="small"
          />
          {dialogAction === 'schedule' && (
            <>
              <TextField
                fullWidth
                label="Date et heure"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                placeholder="Ajouter des notes pour l'appel..."
                size="small"
              />
            </>
          )}
          {dialogAction === 'addContact' && (
            <>
              <TextField
                fullWidth
                label="Nom du contact"
                placeholder="Nom complet"
                size="small"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                placeholder="email@exemple.com"
                size="small"
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Annuler</Button>
        <Button onClick={handleDialogConfirm} variant="contained" sx={{
          borderRadius: 2,
          background: `linear-gradient(135deg, ${TEAL.main}, ${TEAL.dark})`,
          '&:hover': { background: `linear-gradient(135deg, ${TEAL.dark}, #115E59)` }
        }}>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Rendu principal
  if (!phone) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Numéro non renseigné
      </Typography>
    );
  }

  return (
    <>
      {renderActionButton()}
      {showActions && renderContextMenu()}
      {renderDialog()}

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Indicateur de copie */}
      <Zoom in={copied}>
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            textAlign: 'center',
            zIndex: 9999
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h6">Copié !</Typography>
          <Typography variant="body2" color="text.secondary">
            Le numéro a été copié dans le presse-papier
          </Typography>
        </Paper>
      </Zoom>
    </>
  );
};

/**
 * PhoneActionGroup - Groupe de numéros de téléphone
 */
export const PhoneActionGroup = ({
  phones = [],
  size = 'medium',
  allowReveal = true,
  showActions = true,
  variant = 'default',
  onCall,
  onWhatsApp,
  ...props
}) => {
  const theme = useTheme();

  if (!phones.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Aucun numéro enregistré
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {phones.map((phone, index) => (
        <PhoneAction
          key={index}
          phone={phone}
          size={size}
          allowReveal={allowReveal}
          showActions={showActions}
          variant={variant}
          onCall={onCall}
          onWhatsApp={onWhatsApp}
          {...props}
        />
      ))}
    </Stack>
  );
};

/**
 * PhoneActionButton - Version simplifiée en bouton
 */
export const PhoneActionButton = ({
  phone,
  label = 'Appeler',
  icon = <CallIcon />,
  variant = 'contained',
  color = 'primary',
  fullWidth = false,
  size = 'medium',
  ...props
}) => (
  <Button
    variant={variant}
    color={color}
    fullWidth={fullWidth}
    size={size}
    startIcon={icon}
    onClick={() => window.location.href = telHref(phone)}
    disabled={!phone}
    sx={{ borderRadius: 2 }}
    {...props}
  >
    {label}
  </Button>
);

export default PhoneAction;