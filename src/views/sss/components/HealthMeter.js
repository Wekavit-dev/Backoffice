import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Paper,
  Fade,
  Grow,
  Zoom,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  HEALTH_LABELS,
  HEALTH_COLORS
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
  Favorite as FavoriteIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  MonitorHeart as MonitorHeartIcon,
  BatteryFull as BatteryFullIcon,
  Battery80 as Battery80Icon,
  Battery60 as Battery60Icon,
  Battery30 as Battery30Icon,
  Battery20 as Battery20Icon,
  BatteryChargingFull as BatteryChargingIcon
} from '@mui/icons-material';

const LEVEL_ORDER = ['critical', 'watch', 'good', 'excellent'];
const BAR_COUNT = 4;

// Configuration des niveaux de santé
const LEVEL_CONFIG = {
  critical: {
    icon: ErrorIcon,
    emoji: '🔴',
    description: 'Nécessite une attention immédiate',
    status: 'critical'
  },
  watch: {
    icon: WarningIcon,
    emoji: '🟡',
    description: 'À surveiller de près',
    status: 'warning'
  },
  good: {
    icon: InfoIcon,
    emoji: '🟢',
    description: 'Bonne santé générale',
    status: 'good'
  },
  excellent: {
    icon: TrophyIcon,
    emoji: '🌟',
    description: 'Performance exceptionnelle',
    status: 'excellent'
  }
};

/**
 * HealthMeter amélioré avec plusieurs variantes et animations
 */
const HealthMeter = ({
  level,
  score,
  dense = false,
  variant = 'bars', // 'bars' | 'signal' | 'gauge' | 'chip' | 'compact'
  showLabel = true,
  showScore = false,
  showAnimation = true,
  size = 'medium', // 'small' | 'medium' | 'large'
  interactive = false,
  onClick,
  className
}) => {
  const theme = useTheme();
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(false);

// Index du niveau
  const idx = Math.max(0, LEVEL_ORDER.indexOf(level));
  const color = HEALTH_COLORS[level] || 'default';
  const label = HEALTH_LABELS[level] || 'Inconnu';
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.good;
  const LevelIcon = config.icon;

  // Couleur du thème via HEALTH_COLORS
  const themeColor = useMemo(() => {
    if (color === 'default') return theme.palette.grey[500];
    return theme.palette[color]?.main || theme.palette.primary.main;
  }, [color, theme]);

  // Animation au montage
  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(timer);
    }
  }, [showAnimation]);

  // Valeur normalisée pour les indicateurs
  const normalizedScore = useMemo(() => {
    if (score != null) return Math.min(100, Math.max(0, score));
    return (idx / (LEVEL_ORDER.length - 1)) * 100;
  }, [score, idx]);

  // Icône de batterie basée sur le score
  const BatteryIcon = useMemo(() => {
    if (normalizedScore >= 80) return BatteryFullIcon;
    if (normalizedScore >= 60) return Battery80Icon;
    if (normalizedScore >= 40) return Battery60Icon;
    if (normalizedScore >= 20) return Battery30Icon;
    return Battery20Icon;
  }, [normalizedScore]);

  // Variante "bars" - Version originale améliorée
  const renderBars = () => (
    <Stack spacing={dense ? 0.25 : 0.5} sx={{ minWidth: dense ? 64 : 92 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {showLabel && (
          <Typography
            variant={dense || size === 'small' ? 'caption' : 'body2'}
            fontWeight={700}
            sx={{
              color: themeColor,
              transition: 'color 0.3s ease',
              flex: 1,
              fontSize: dense ? '0.65rem' : undefined,
              lineHeight: dense ? 1.2 : undefined
            }}
          >
            {label}
            {showScore && score != null && ` (${score})`}
          </Typography>
        )}
        {!showLabel && score != null && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: dense ? '0.65rem' : undefined }}>
            {score}%
          </Typography>
        )}
      </Stack>

      <Stack
        direction="row"
        spacing={dense ? 0.35 : 0.5}
        sx={{
          opacity: animate ? 1 : 0,
          transform: animate ? 'translateX(0)' : 'translateX(-10px)',
          transition: 'all 0.5s ease'
        }}
      >
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <Grow
            key={i}
            in={animate}
            timeout={300 + i * 100}
            style={{ transformOrigin: '0 50%' }}
          >
            <Box
              sx={{
                height: dense ? 4 : size === 'small' ? 4 : size === 'large' ? 8 : 6,
                flex: 1,
                borderRadius: 3,
                bgcolor: i <= idx ? themeColor : alpha(theme.palette.grey[300], 0.45),
                transition: 'all 0.4s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::after': hovered && i <= idx ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, transparent, ${alpha(themeColor, 0.3)}, transparent)`,
                  animation: 'shimmer 1.5s infinite',
                  '@keyframes shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                  }
                } : {}
              }}
            />
          </Grow>
        ))}
      </Stack>
    </Stack>
  );

  // Variante "signal" - Style indicateur de signal (comme WiFi)
  const renderSignal = () => (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="flex-end"
        sx={{
          height: size === 'small' ? 20 : size === 'large' ? 40 : 28,
          opacity: animate ? 1 : 0,
          transition: 'opacity 0.5s ease'
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Zoom
            key={i}
            in={animate}
            timeout={200 + i * 100}
            style={{ transformOrigin: 'bottom center' }}
          >
            <Box
              sx={{
                width: size === 'small' ? 3 : size === 'large' ? 6 : 4,
                height: `${((i + 1) / 4) * 100}%`,
                borderRadius: 1,
                bgcolor: i <= idx ? themeColor : alpha(theme.palette.grey[300], 0.45),
                transition: 'all 0.3s ease',
                transform: hovered ? `scaleY(${1 + (i / 10)})` : 'scaleY(1)',
                transformOrigin: 'bottom'
              }}
            />
          </Zoom>
        ))}
      </Stack>

      {showLabel && (
        <Box>
          <Typography
            variant={size === 'small' ? 'caption' : 'body2'}
            fontWeight={700}
            sx={{ color: themeColor }}
          >
            {label}
          </Typography>
          {showScore && score != null && (
            <Typography variant="caption" color="text.secondary">
              {score}%
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );

  // Variante "gauge" - Style jauge circulaire
  const renderGauge = () => {
    const radius = size === 'small' ? 20 : size === 'large' ? 40 : 30;
    const strokeWidth = size === 'small' ? 3 : size === 'large' ? 6 : 4;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (normalizedScore / 100) * circumference;

    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              fill="none"
              stroke={alpha(theme.palette.grey[200], 0.5)}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              fill="none"
              stroke={themeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animate ? offset : circumference}
              style={{
                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </svg>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            {score != null ? (
              <Typography variant={size === 'small' ? 'caption' : 'h6'} fontWeight={700} sx={{ color: themeColor }}>
                {Math.round(normalizedScore)}%
              </Typography>
            ) : (
              <LevelIcon sx={{ fontSize: size === 'small' ? 16 : 24, color: themeColor }} />
            )}
          </Box>
        </Box>

        {showLabel && (
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {config.description}
            </Typography>
          </Box>
        )}
      </Stack>
    );
  };

  // Variante "chip" - Style chip avec icône
  const renderChip = () => (
    <Chip
      icon={<LevelIcon />}
      label={
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          {showScore && score != null && (
            <Typography variant="caption" color="text.secondary">
              {score}%
            </Typography>
          )}
        </Stack>
      }
      sx={{
        bgcolor: alpha(themeColor, 0.1),
        color: themeColor,
        borderColor: alpha(themeColor, 0.3),
        fontWeight: 600,
        '&:hover': {
          bgcolor: alpha(themeColor, 0.15),
          transform: 'scale(1.02)'
        },
        transition: 'all 0.3s ease'
      }}
    />
  );

  // Variante "compact" - Version ultra-compacte
  const renderCompact = () => (
    <Tooltip title={`${label}${score != null ? ` (${score}%)` : ''}`} arrow>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <LevelIcon sx={{ fontSize: 16, color: themeColor }} />
        <Box sx={{ display: 'flex', gap: 0.3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: i <= idx ? themeColor : alpha(theme.palette.grey[300], 0.5),
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
        {showScore && score != null && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
            {Math.round(normalizedScore)}%
          </Typography>
        )}
      </Stack>
    </Tooltip>
  );

  // Variante "battery" - Style batterie
  const renderBattery = () => (
    <Tooltip title={`${label} - ${Math.round(normalizedScore)}%`} arrow>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: size === 'small' ? 30 : size === 'large' ? 50 : 40,
              height: size === 'small' ? 14 : size === 'large' ? 24 : 18,
              border: `2px solid ${themeColor}`,
              borderRadius: 1,
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              bgcolor: alpha(themeColor, 0.05)
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 2,
                left: 2,
                bottom: 2,
                width: `${normalizedScore}%`,
                bgcolor: themeColor,
                borderRadius: 0.5,
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                background: `linear-gradient(90deg, ${themeColor}, ${alpha(themeColor, 0.6)})`
              }}
            />
          </Box>
          <Box
            sx={{
              width: size === 'small' ? 2 : size === 'large' ? 4 : 3,
              height: size === 'small' ? 6 : size === 'large' ? 10 : 8,
              bgcolor: themeColor,
              borderRadius: '0 2px 2px 0',
              ml: 0.5
            }}
          />
        </Box>
        {showLabel && (
          <Typography variant="caption" fontWeight={600} sx={{ color: themeColor }}>
            {label}
          </Typography>
        )}
      </Stack>
    </Tooltip>
  );

  // Rendu principal
  const renderContent = () => {
    switch (variant) {
      case 'signal': return renderSignal();
      case 'gauge': return renderGauge();
      case 'chip': return renderChip();
      case 'compact': return renderCompact();
      case 'battery': return renderBattery();
      default: return renderBars();
    }
  };

  // Si pas de niveau, afficher "Inconnu"
  if (!level || !LEVEL_ORDER.includes(level)) {
    return (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );
  }

  return (
    <Box
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'inline-flex',
        cursor: interactive || onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: hovered && interactive ? 'scale(1.02)' : 'scale(1)',
        ...(interactive && {
          '&:hover': {
            '& .health-meter': {
              boxShadow: theme.shadows[4]
            }
          }
        })
      }}
    >
      {interactive ? (
        <Paper
          className="health-meter"
          elevation={0}
          sx={{
            p: dense ? 0.5 : 1,
            borderRadius: 2,
            border: `1px solid ${alpha(themeColor, 0.1)}`,
            bgcolor: alpha(themeColor, 0.03),
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: alpha(themeColor, 0.3),
              bgcolor: alpha(themeColor, 0.05)
            }
          }}
        >
          {renderContent()}
        </Paper>
      ) : (
        renderContent()
      )}
    </Box>
  );
};

// Composant HealthMeterGroup pour afficher plusieurs métriques
export const HealthMeterGroup = ({
  items = [],
  variant = 'bars',
  dense = false,
  showLabels = true,
  spacing = 2,
  maxItems = 4
}) => {
  const theme = useTheme();
  const displayItems = items.slice(0, maxItems);
  const remaining = items.length - maxItems;

  if (!items.length) {
    return (
      <Typography variant="caption" color="text.secondary">
        Aucune donnée de santé disponible
      </Typography>
    );
  }

  return (
    <Stack spacing={spacing}>
      {displayItems.map((item, index) => (
        <HealthMeter
          key={index}
          level={item.level}
          score={item.score}
          variant={variant}
          dense={dense}
          showLabel={showLabels}
          interactive={item.onClick != null}
          onClick={item.onClick}
          size={item.size || 'medium'}
        />
      ))}
      {remaining > 0 && (
        <Chip
          label={`+${remaining} autres`}
          size="small"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        />
      )}
    </Stack>
  );
};

// Composant HealthMeterSummary pour un résumé rapide
export const HealthMeterSummary = ({ levels, total }) => {
  const theme = useTheme();

  if (!total) return null;

  const distribution = LEVEL_ORDER.map(level => ({
    level,
    count: levels?.[level] || 0,
    percentage: ((levels?.[level] || 0) / total) * 100
  }));

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        Répartition de la santé
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ height: 6 }}>
        {distribution.map(({ level, percentage, count }) => {
          const color = HEALTH_COLORS[level] || 'default';
          const themeColor = color === 'default'
            ? theme.palette.grey[400]
            : theme.palette[color]?.main || theme.palette.primary.main;

          return (
            <Tooltip key={level} title={`${HEALTH_LABELS[level]}: ${count} (${Math.round(percentage)}%)`} arrow>
              <Box
                sx={{
                  flex: percentage > 0 ? percentage : 0,
                  bgcolor: themeColor,
                  borderRadius: 1,
                  transition: 'all 0.5s ease',
                  opacity: percentage > 0 ? 1 : 0.3,
                  minWidth: percentage > 0 ? 4 : 0
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {distribution.map(({ level, count }) => {
          const color = HEALTH_COLORS[level] || 'default';
          const themeColor = color === 'default'
            ? theme.palette.grey[400]
            : theme.palette[color]?.main || theme.palette.primary.main;

          return count > 0 ? (
            <Chip
              key={level}
              label={`${HEALTH_LABELS[level]}: ${count}`}
              size="small"
              sx={{
                bgcolor: alpha(themeColor, 0.1),
                color: themeColor,
                borderColor: alpha(themeColor, 0.2),
                fontWeight: 500
              }}
            />
          ) : null;
        })}
      </Stack>
    </Stack>
  );
};

export default HealthMeter;