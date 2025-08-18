/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Avatar, Button, CardActions, CardContent, Divider, Grid, Menu, MenuItem, Typography, Chip, Box } from '@mui/material';

// project imports
// import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// assets
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import PersonIcon from '@mui/icons-material/Person';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

// eslint-disable-next-line no-unused-vars
const PopularCard = ({ isLoading, userData, history, agents }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Limit agents to max 3
  const displayedAgents = agents?.slice(0, 3) || [];

  // Get operation color based on type
  const getOperationColor = (operation) => {
    switch (operation) {
      case 'Deposit Validation':
        return {
          background: theme.palette.success.light,
          color: theme.palette.success.dark
        };
      case 'Withdraw Validation':
        return {
          background: theme.palette.warning.light,
          color: theme.palette.warning.dark
        };
      default:
        return {
          background: theme.palette.primary.light,
          color: theme.palette.primary.dark
        };
    }
  };

  // Get display text for operation
  const getOperationDisplayText = (operation) => {
    switch (operation) {
      case 'Deposit Validation':
        return 'Deposit';
      case 'Withdraw Validation':
        return 'Withdraw';
      default:
        return operation;
    }
  };

  // Get country emoji based on country name
  const getCountryEmoji = (countryName) => {
    switch (countryName) {
      case 'Congo DRC':
        return '🇨🇩';
      case 'Burundi':
        return '🇧🇮';
      case 'Rwanda':
        return '🇷🇼';
      default:
        return '🌍';
    }
  };

  // Get country flag or default avatar
  const getAgentAvatar = (agent) => {
    const firstLetter = agent.nom?.charAt(0)?.toUpperCase() || 'A';
    return (
      <Avatar
        sx={{
          width: 40,
          height: 40,
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        {firstLetter}
      </Avatar>
    );
  };

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12}>
                <Grid container alignContent="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4">Liste des Agents ({agents.length})</Typography>
                  </Grid>
                  <Grid item>
                    <MoreHorizOutlinedIcon
                      fontSize="small"
                      sx={{
                        color: theme.palette.primary[200],
                        cursor: 'pointer'
                      }}
                      aria-controls="menu-popular-card"
                      aria-haspopup="true"
                      onClick={handleClick}
                    />
                    <Menu
                      id="menu-popular-card"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      variant="selectedMenu"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                    >
                      <MenuItem onClick={handleClose}>Tous les agents</MenuItem>
                      <MenuItem onClick={handleClose}>Agents actifs</MenuItem>
                      <MenuItem onClick={handleClose}>Agents connectés</MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                {displayedAgents.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.6 }}>
                    {displayedAgents.map((agent, index) => {
                      const operationStyle = getOperationColor(agent.operation);
                      return (
                        <Box key={agent._id}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item>{getAgentAvatar(agent)}</Grid>
                            <Grid item xs>
                              <Grid container direction="column">
                                <Grid item>
                                  <Typography variant="subtitle1" fontWeight="medium">
                                    {agent.nom}
                                  </Typography>
                                </Grid>
                                <Grid item>
                                  <Typography variant="body2" color="textSecondary">
                                    {agent.email}
                                  </Typography>
                                </Grid>
                                {agent.idPays && (
                                  <Grid item sx={{ mt: 0.5 }}>
                                    <Typography variant="caption" color="textSecondary">
                                      {getCountryEmoji(agent.idPays.nom)} {agent.idPays.nom} ({agent.idPays.code})
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Grid>
                            <Grid item>
                              <Box
                                xs={12}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  justifyContent: 'space-between'
                                }}
                              >
                                <Chip
                                  label={getOperationDisplayText(agent.operation)}
                                  size="small"
                                  sx={{
                                    backgroundColor: operationStyle.background,
                                    color: operationStyle.color,
                                    fontSize: '0.75rem',
                                    fontWeight: 'medium'
                                  }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <FiberManualRecordIcon
                                    sx={{
                                      fontSize: 8,
                                      color: agent.connected
                                        ? theme.palette.success.main
                                        : agent.actif
                                        ? theme.palette.warning.main
                                        : theme.palette.error.main
                                    }}
                                  />
                                  <Typography variant="caption" color="textSecondary">
                                    {agent.connected ? 'Connecté' : agent.actif ? 'Actif' : 'Inactif'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                          {index < displayedAgents.length - 1 && <Divider sx={{ mt: 2 }} />}
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Grid container direction="column">
                    <Grid item>
                      <Grid container alignItems="center" justifyContent="center">
                        <Grid item>
                          <Typography variant="subtitle1" color="inherit" align="center">
                            Aucun agent disponible
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
            <Button size="small" disableElevation>
              Voir plus
              <ChevronRightOutlinedIcon />
            </Button>
          </CardActions>
        </MainCard>
      )}
    </>
  );
};

PopularCard.propTypes = {
  isLoading: PropTypes.bool,
  userData: PropTypes.any,
  history: PropTypes.any,
  agents: PropTypes.array
};

export default PopularCard;
