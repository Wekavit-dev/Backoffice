import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  LinearProgress,
  Alert,
  Divider,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Chip,
  Badge,
  Collapse,
  Fade,
  Grow,
  Paper,
  Skeleton,
  alpha,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlaylistAddCheck as GenerateIcon,
  WarningAmber as WarningIcon,
  Phone as PhoneIcon,
  Favorite as HeartIcon,
  PersonAdd as NewIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  MonitorHeart as MonitorHeartIcon,
  AssignmentLate as AssignmentLateIcon,
  PriorityHigh as PriorityHighIcon,
  Campaign as CampaignIcon,
  EmojiPeople as WavingHandIcon,
  NightsStay as NightsStayIcon,
  Star as StarIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleAltIcon,
  Settings as SettingsIcon,
  TrendingDown as TrendingDownIcon,
  Today as TodayIcon,
  ArrowForward as ArrowForwardIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';

const MetricCard = ({ title, value, subtitle, icon, color, trend, onClick, loading, badge }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Skeleton variant="rectangular" height={80} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.08)} 0%, ${alpha(color || theme.palette.primary.main, 0.02)} 100%)`,
        borderRadius: 3,
        border: `1px solid ${alpha(color || theme.palette.primary.main, 0.15)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: color || theme.palette.primary.main,
          '& .metric-icon': {
            transform: 'scale(1.1) rotate(-5deg)',
          }
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }
      }}
    >
      {badge && (
        <Badge
          badgeContent={badge}
          color="error"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            '& .MuiBadge-badge': {
              fontSize: 10,
              height: 20,
              minWidth: 20,
            }
          }}
        />
      )}
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.5} flex={1}>
            <Typography variant="caption" sx={{
              color: alpha(theme.palette.text.primary, 0.6),
              fontWeight: 600,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              fontSize: '0.65rem'
            }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{
              fontWeight: 700,
              color: color || theme.palette.text.primary,
              lineHeight: 1.2
            }}>
              {value ?? '—'}
            </Typography>
            {subtitle && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                {trend === 'up' && <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} />}
                {trend === 'down' && <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />}
                {trend === 'neutral' && <TrendingUpIcon sx={{ fontSize: 14, color: 'warning.main', transform: 'rotate(90deg)' }} />}
                <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.7) }}>
                  {subtitle}
                </Typography>
              </Stack>
            )}
          </Stack>
          <Avatar
            className="metric-icon"
            sx={{
              bgcolor: alpha(color || theme.palette.primary.main, 0.12),
              color: color || theme.palette.primary.main,
              width: 44,
              height: 44,
              transition: 'transform 0.3s ease',
              flexShrink: 0
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

const CategoryCard = ({ title, value, subtitle, icon, color, onClick, loading }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Skeleton variant="rectangular" height={60} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(color || theme.palette.primary.main, 0.15)}`,
        background: `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.06)} 0%, transparent 100%)`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateX(4px)',
          boxShadow: theme.shadows[4],
          borderColor: color || theme.palette.primary.main,
          '& .arrow-icon': {
            transform: 'translateX(4px)',
          }
        } : {},
      }}
    >
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{
              bgcolor: alpha(color || theme.palette.primary.main, 0.12),
              color: color || theme.palette.primary.main,
              width: 36,
              height: 36
            }}>
              {icon}
            </Avatar>
            <Stack>
              <Typography variant="body2" fontWeight={500}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" fontWeight={700} color={color || theme.palette.text.primary}>
              {value ?? 0}
            </Typography>
            {onClick && (
              <ArrowForwardIcon
                className="arrow-icon"
                sx={{
                  fontSize: 18,
                  color: alpha(theme.palette.text.primary, 0.3),
                  transition: 'transform 0.3s ease'
                }}
              />
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Quick Actions Speed Dial
const QuickActions = ({ onGenerate, onRefresh, loading, generating }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: <GenerateIcon />, name: 'Préparer journée', action: onGenerate, disabled: generating || loading },
    { icon: <RefreshIcon />, name: 'Actualiser', action: onRefresh, disabled: loading },
    { icon: <PeopleAltIcon />, name: 'Voir les personnes', action: () => navigate('/wekavit/sss/people') },
    { icon: <SettingsIcon />, name: 'Réglages', action: () => navigate('/wekavit/sss/settings') },
  ];

  const navigate = useNavigate();

  return (
    <SpeedDial
      ariaLabel="Actions rapides"
      sx={{ position: 'fixed', bottom: 24, right: 24 }}
      icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      direction="up"
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => {
            action.action();
            setOpen(false);
          }}
          tooltipOpen
          FabProps={{
            disabled: action.disabled,
            sx: {
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }
            }
          }}
        />
      ))}
    </SpeedDial>
  );
};

const DashboardPage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [boardSummary, setBoardSummary] = useState(null);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showLoading = true) => {
    if (!globalState?.key) return;
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [metricsRes, boardRes] = await Promise.all([
        SssApi.getMetrics(globalState.key),
        SssApi.getBoard({}, globalState.key)
      ]);
      if (metricsRes?.status === 200) setMetrics(metricsRes.data?.data || null);
      if (boardRes?.status === 200) {
        setBoardSummary(boardRes.data?.summary || null);
      }
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Impossible de charger la vue du jour');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [globalState?.key]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async () => {
    if (!globalState?.key) return;
    setGenerating(true);
    try {
      const res = await SssApi.generateBoard({ refresh: true }, globalState.key);
      if (res?.status === 200) {
        toast.success('Liste du jour préparée avec succès ! 🎉');
        await load(false);
        navigate('/wekavit/sss/today');
      } else {
        toast.error(res?.data?.message || 'Échec de la préparation');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Échec de la préparation');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = () => {
    load(false);
    toast.info('Actualisation en cours...');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const cats = metrics?.dashboardCategories || {};
  const base = metrics?.base || {};
  const tasks = metrics?.tasks || {};

  const quickActions = [
    {
      icon: <PhoneIcon />,
      label: 'Actions du jour',
      path: '/wekavit/sss/today',
      color: 'primary',
      count: boardSummary?.open || tasks.todayTotal || 0
    },
    {
      icon: <WarningIcon />,
      label: 'Retards',
      path: '/wekavit/sss/overdue',
      color: 'warning',
      count: tasks.overdueOpen || 0
    },
    {
      icon: <NewIcon />,
      label: 'Personnes',
      path: '/wekavit/sss/people',
      color: 'info'
    },
    {
      icon: <TrophyIcon />,
      label: 'Réglages',
      path: '/wekavit/sss/settings',
      color: 'secondary'
    }
  ];

  const hasData = metrics || boardSummary;

  return (
    <MainCard
      title={
        <Box sx={{ width: '100%' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Stack spacing={0.5} flex={1}>
              <Chip
                icon={<HeartIcon sx={{ fontSize: 14 }} />}
                label="Accompagnement"
                size="small"
                sx={{
                  width: 'fit-content',
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  color: 'error.main',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Vue du jour
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Qui a besoin d’attention aujourd’hui ? Cliquez sur une carte pour agir.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              {!isXs && (
                <>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    size="small"
                    variant="outlined"
                  >
                    {refreshing ? 'Actualisation...' : 'Actualiser'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<GenerateIcon />}
                    onClick={handleGenerate}
                    disabled={generating || loading}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #0D9488, #0F766E)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0F766E, #115E59)',
                      }
                    }}
                  >
                    {generating ? 'Préparation...' : isXs ? 'Préparer' : 'Préparer la journée'}
                  </Button>
                </>
              )}
              {isXs && (
                <IconButton onClick={handleMenuOpen} size="small">
                  <MoreVertIcon />
                </IconButton>
              )}
            </Stack>
          </Stack>
        </Box>
      }
      sx={{
        '& .MuiCardHeader-content': { minWidth: 0 },
        borderRadius: 3,
      }}
      contentSX={{ p: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Loading State */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Chargement des données...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Fade in>
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Welcome Banner */}
      {hasData && !loading && (
        <Grow in>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <AutoAwesomeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Prêt pour aujourd'hui ?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vous avez {boardSummary?.open || tasks.todayTotal || 0} actions à réaliser aujourd'hui.
                  {tasks.overdueOpen > 0 && ` Dont ${tasks.overdueOpen} en retard.`}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<TodayIcon />}
                onClick={() => navigate('/wekavit/sss/today')}
                sx={{ flexShrink: 0 }}
              >
                Voir les actions
              </Button>
            </Stack>
          </Paper>
        </Grow>
      )}

      {/* Metrics Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Personnes suivies"
            value={base.totalProfiles}
            subtitle={`${base.neverDeposited ?? 0} n’ont jamais déposé`}
            icon={<GroupsIcon />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/wekavit/sss/people')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Taux de conversion"
            value={base.conversionInscriptionToDepositPct != null ? `${base.conversionInscriptionToDepositPct}%` : '—'}
            subtitle={`${base.everDeposited ?? 0} ont déjà déposé`}
            icon={<TrendingUpIcon />}
            color={theme.palette.success.main}
            trend={base.conversionInscriptionToDepositPct > 50 ? 'up' : 'down'}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Santé moyenne"
            value={base.avgHealthScore ?? '—'}
            subtitle="Plus c’est haut, mieux c’est"
            icon={<MonitorHeartIcon />}
            color={theme.palette.info.main}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Actions du jour"
            value={boardSummary?.open ?? tasks.todayTotal ?? '—'}
            subtitle={`${boardSummary?.done ?? tasks.todayDone ?? 0} terminées · ${tasks.overdueOpen ?? 0} en retard`}
            icon={<AssignmentLateIcon />}
            color={theme.palette.warning.main}
            onClick={() => navigate('/wekavit/sss/today')}
            badge={tasks.overdueOpen > 0 ? tasks.overdueOpen : undefined}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Categories Section */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Qui contacter en priorité ?
        </Typography>
        <Tooltip title="Voir toutes les personnes">
          <IconButton onClick={() => navigate('/wekavit/sss/people')} size="small">
            <PeopleAltIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <CategoryCard
            title="À appeler d'urgence"
            value={cats.callUrgent}
            subtitle="Risque de perdre ces personnes"
            icon={<PriorityHighIcon />}
            color={theme.palette.error.main}
            onClick={() => navigate('/wekavit/sss/people?urgency=critical')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CategoryCard
            title="À relancer"
            value={cats.toRelaunch}
            subtitle="Argent qui dort ou dépôt sans plan"
            icon={<CampaignIcon />}
            color={theme.palette.warning.main}
            onClick={() => navigate('/wekavit/sss/people')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CategoryCard
            title="Nouveaux à accueillir"
            value={cats.newToWelcome}
            subtitle="Inscrits récents"
            icon={<WavingHandIcon />}
            color={theme.palette.info.main}
            onClick={() => navigate('/wekavit/sss/people?cohort=new')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CategoryCard
            title="À réveiller"
            value={cats.toReactivate}
            subtitle="Inactifs depuis 2 à 4 semaines"
            icon={<NightsStayIcon />}
            color={theme.palette.primary.main}
            onClick={() => navigate('/wekavit/sss/people?stage=S11')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CategoryCard
            title="À féliciter"
            value={cats.toCongratulate}
            subtitle="Bonne progression cette semaine"
            icon={<StarIcon />}
            color={theme.palette.success.main}
            onClick={() => navigate('/wekavit/sss/people')}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <CategoryCard
            title="Ambassadeurs potentiels"
            value={cats.ambassadorsToInvite}
            subtitle="Prêts à témoigner ou parrainer"
            icon={<RecordVoiceOverIcon />}
            color={theme.palette.secondary.main}
            onClick={() => navigate('/wekavit/sss/people')}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Divider sx={{ my: 3 }}>
        <Chip label="Actions rapides" size="small" />
      </Divider>

      <Grid container spacing={2}>
        {quickActions.map((action) => (
          <Grid item key={action.label} xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color={action.color}
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                justifyContent: 'center',
                borderColor: alpha(theme.palette[action.color].main, 0.3),
                '&:hover': {
                  borderColor: theme.palette[action.color].main,
                  bgcolor: alpha(theme.palette[action.color].main, 0.04),
                },
                position: 'relative'
              }}
            >
              {action.label}
              {action.count > 0 && (
                <Chip
                  label={action.count}
                  size="small"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    height: 20,
                    minWidth: 20,
                    fontSize: '0.6rem',
                    fontWeight: 700
                  }}
                />
              )}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {!loading && !metrics && !error && (
        <Fade in>
          <Box mt={4}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 3,
                border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
              }}
            >
              <Avatar sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                mx: 'auto',
                mb: 2
              }}>
                <DashboardIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Bienvenue dans votre tableau de bord
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
                Préparez d'abord les profils, puis générez la liste du jour pour commencer à accompagner vos clients.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/wekavit/sss/settings')}
                >
                  Aller aux réglages
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GenerateIcon />}
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? 'Préparation...' : 'Préparer la journée'}
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Fade>
      )}

      {/* Mobile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => { handleRefresh(); handleMenuClose(); }} disabled={loading}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Actualiser</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleGenerate(); handleMenuClose(); }} disabled={generating}>
          <ListItemIcon>
            <GenerateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{generating ? 'Préparation...' : 'Préparer la journée'}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { navigate('/wekavit/sss/people'); handleMenuClose(); }}>
          <ListItemIcon>
            <PeopleAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir les personnes</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate('/wekavit/sss/settings'); handleMenuClose(); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Réglages</ListItemText>
        </MenuItem>
      </Menu>

      {/* Speed Dial for Quick Actions */}
      <QuickActions
        onGenerate={handleGenerate}
        onRefresh={handleRefresh}
        loading={loading}
        generating={generating}
      />
    </MainCard>
  );
};

export default DashboardPage;