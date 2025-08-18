/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Modal,
  IconButton,
  Fade,
  Backdrop,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Menu, MenuList, ListItemIcon, ListItemText } from '@mui/material';
import { AppContext } from 'AppContext';
import { IconUsers, IconUserCheck, IconUserX, IconInbox } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import AgentApi from 'api/agents/agent';
import CountryApi from 'api/country';

const Agents = () => {
  const { globalState, setGlobalState } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [agents, setAgents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAgentForAction, setSelectedAgentForAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding new agent
  const [newAgent, setNewAgent] = useState({
    nom: '',
    email: '',
    password: '',
    actif: true,
    idPays: '',
    operation: ''
  });

  // Available operations based on requirements
  const availableOperations = ['Deposit Validation', 'Withdraw Validation'];

  const fetchData = async () => {
    setLoading(true);

    try {
      // Fetch agents and countries in parallel
      const [agentsResponse, countriesResponse] = await Promise.all([
        AgentApi.getAgents(globalState?.key),
        CountryApi.getCountries(globalState?.key)
      ]);

      // Handle agents response
      if (agentsResponse.data) {
        const { data: response, status } = agentsResponse;
        if (status === 200 || status === 201) {
          setAgents(response.data || response);
        }
      } else {
        console.log('Error getting agents:', agentsResponse.response);
      }

      // Handle countries response
      if (countriesResponse.data) {
        const { data: response, status } = countriesResponse;
        if (status === 200 || status === 201) {
          setCountries(response.data || response);
        }
      } else {
        console.log('Error getting countries:', countriesResponse.response);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (globalState?.key) {
      fetchData();
    }
  }, [globalState?.key]);

  // Calculate totals
  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent) => agent.actif).length;
  const inactiveAgents = totalAgents - activeAgents;

  // Get unique countries from agents data
  const getUniqueCountries = () => {
    const countries = agents.filter((agent) => agent.idPays && agent.idPays.nom).map((agent) => agent.idPays.nom);
    return [...new Set(countries)];
  };

  // Filter data based on search and country
  const filteredData = agents.filter((agent) => {
    const matchesSearch =
      agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) || agent.email.toLowerCase().includes(searchTerm.toLowerCase());

    const agentCountry = agent.idPays?.nom || '';
    const matchesCountry = countryFilter === '' || agentCountry === countryFilter;

    return matchesSearch && matchesCountry;
  });

  const handleViewDetails = (agent) => {
    setSelectedAgent(agent);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAgent(null);
  };

  const handleAddAgent = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setNewAgent({
      nom: '',
      email: '',
      password: '',
      actif: true,
      idPays: '',
      operation: ''
    });
  };

  const handleInputChange = (field, value) => {
    setNewAgent((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitAgent = async () => {
    setIsSubmitting(true);

    try {
      // Create payload according to API requirements
      const payload = {
        nom: newAgent.nom,
        password: newAgent.password,
        actif: newAgent.actif.toString(),
        email: newAgent.email,
        idPays: newAgent.idPays,
        operation: newAgent.operation
      };

      console.log('Creating new agent with payload:', payload);

      // Call the actual API
      const response = await AgentApi.createAgent(payload, globalState?.key);

      // Add detailed logging to understand the response structure
      console.log('Full API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      console.log('Response structure keys:', Object.keys(response));

      // Check multiple possible response structures
      const isSuccess =
        // Direct status check
        response.status === 200 ||
        response.status === 201 ||
        // Status in data
        (response.data && (response.data.status === 200 || response.data.status === 201)) ||
        // Success flag
        response.success === true ||
        (response.data && response.data.success === true) ||
        // Check if response.data exists and doesn't have an error
        (response.data && !response.data.error);

      if (isSuccess) {
        toast.success('Agent créé avec succès!', { position: 'top-right' });
        handleCloseAddModal();

        // Refresh the agents list - wrap in try-catch to prevent error toast
        try {
          await fetchData();
        } catch (fetchError) {
          console.log('Error refreshing data after creation:', fetchError);
          // Don't show error toast here, the creation was successful
        }
        return;
      }

      // If we reach here, the creation failed
      console.log('Creation failed - showing error');
      console.log('Response that caused failure:', response);
      toast.error("Erreur lors de la création de l'agent", { position: 'top-right' });
    } catch (error) {
      // This catches network errors, API errors, etc.
      console.error('Error in handleSubmitAgent catch block:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      toast.error("Erreur lors de la création de l'agent", { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCountryFlag = (country) => {
    const flags = {
      Burundi: '🇧🇮',
      Rwanda: '🇷🇼',
      'Congo DRC': '🇨🇩'
    };
    return flags[country] || '🌍';
  };

  const getStatusColor = (actif) => {
    return actif ? 'success' : 'error';
  };

  // Action menu handlers
  const handleActionClick = (event, agent) => {
    setAnchorEl(event.currentTarget);
    setSelectedAgentForAction(agent);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedAgentForAction(null);
  };

  const handleEditAgent = () => {
    console.log('Edit agent:', selectedAgentForAction);
    // TODO: Implement edit functionality
    handleActionClose();
  };

  const handleToggleAgentStatus = () => {
    console.log('Toggle agent status:', selectedAgentForAction);
    // TODO: Implement toggle status functionality
    const updatedAgents = agents.map((agent) => (agent._id === selectedAgentForAction._id ? { ...agent, actif: !agent.actif } : agent));
    setAgents(updatedAgents);
    handleActionClose();
  };

  const handleDeleteAgent = () => {
    console.log('Delete agent:', selectedAgentForAction);
    // TODO: Implement delete functionality with confirmation dialog
    const updatedAgents = agents.filter((agent) => agent._id !== selectedAgentForAction._id);
    setAgents(updatedAgents);
    handleActionClose();
  };

  const SummaryCard = ({ title, amount, icon, color = '#1976d2' }) => (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -5px rgba(0,0,0,0.15)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color}, ${color}cc)`
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {amount}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              ml: 2
            }}
          >
            {React.cloneElement(icon, { size: 24 })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <MainCard title="Gestion Agents">
        <Box>
          {/* Summary Cards Skeleton */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3].map((item) => (
              <Grid item xs={12} md={4} key={item}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
                      </Box>
                      <Skeleton variant="rounded" width={48} height={48} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Controls Skeleton */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="rounded" width={300} height={40} />
            <Skeleton variant="rounded" width={200} height={40} />
            <Skeleton variant="rounded" width={140} height={36} />
          </Box>

          {/* Table Skeleton */}
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width="100%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6].map((cell) => (
                      <TableCell key={cell}>
                        <Skeleton variant="text" width="100%" height={20} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Gestion Agents">
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Total Agents" amount={totalAgents} icon={<IconUsers />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Agents Actifs" amount={activeAgents} icon={<IconUserCheck />} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Agents Inactifs" amount={inactiveAgents} icon={<IconUserX />} color="#ed6c02" />
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher des agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrer par pays</InputLabel>
            <Select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              label="Filtrer par pays"
              startAdornment={<FilterIcon sx={{ mr: 1, fontSize: '1rem' }} />}
            >
              <MenuItem value="">Tous les pays</MenuItem>
              {getUniqueCountries().map((country) => (
                <MenuItem key={country} value={country}>
                  {getCountryFlag(country)} {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAgent} sx={{ ml: 'auto' }}>
            Ajouter Agent
          </Button>
        </Box>

        {/* Agents Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pays</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Opération</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Connexion</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 3 }}>
                      <IconInbox sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Aucun agent trouvé
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {row.nom}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {row.idPays ? (
                          <>
                            <Typography variant="body2">{getCountryFlag(row.idPays.nom)}</Typography>
                            <Typography variant="body2">{row.idPays.nom}</Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Non assigné
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.operation}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.actif ? 'Actif' : 'Inactif'} size="small" color={getStatusColor(row.actif)} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.connected ? 'Connecté' : 'Déconnecté'}
                        size="small"
                        color={row.connected ? 'success' : 'default'}
                        variant={row.connected ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton size="small" onClick={() => handleViewDetails(row)} sx={{ color: 'primary.main' }}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => handleActionClick(e, row)} sx={{ color: 'text.secondary' }}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add Agent Modal */}
        <Modal
          open={addModalOpen}
          onClose={handleCloseAddModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.6)' }
          }}
        >
          <Fade in={addModalOpen}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '600px' },
                maxHeight: '95vh',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <Box>
                {/* Header */}
                <Box
                  sx={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                    borderBottom: '2px solid #e9ecef',
                    p: 3
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                      Ajouter Nouvel Agent
                    </Typography>
                    <IconButton
                      onClick={handleCloseAddModal}
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Form Content */}
                <Box sx={{ p: 3, maxHeight: 'calc(95vh - 140px)', overflow: 'auto' }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nom Complet"
                        value={newAgent.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={newAgent.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mot de passe"
                        type="password"
                        value={newAgent.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Pays</InputLabel>
                        <Select value={newAgent.idPays} onChange={(e) => handleInputChange('idPays', e.target.value)} label="Pays">
                          {countries.map((country) => (
                            <MenuItem key={country._id} value={country._id}>
                              {getCountryFlag(country.nom)} {country.nom}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Opération</InputLabel>
                        <Select
                          value={newAgent.operation}
                          onChange={(e) => handleInputChange('operation', e.target.value)}
                          label="Opération"
                        >
                          {availableOperations.map((operation) => (
                            <MenuItem key={operation} value={operation}>
                              {operation}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newAgent.actif}
                            onChange={(e) => handleInputChange('actif', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Agent Activé"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleCloseAddModal}>
                      Annuler
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitAgent}
                      disabled={
                        !newAgent.nom || !newAgent.email || !newAgent.password || !newAgent.idPays || !newAgent.operation || isSubmitting
                      }
                    >
                      {isSubmitting ? 'Création...' : 'Créer Agent'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* View Details Modal */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.6)' }
          }}
        >
          <Fade in={modalOpen}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '600px' },
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                p: 4
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">Détails de l&apos;Agent</Typography>
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {selectedAgent && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nom:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAgent.nom}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAgent.email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pays:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAgent.idPays ? `${getCountryFlag(selectedAgent.idPays.nom)} ${selectedAgent.idPays.nom}` : 'Non assigné'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Opération:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAgent.operation}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Statut:
                    </Typography>
                    <Chip
                      label={selectedAgent.actif ? 'Actif' : 'Inactif'}
                      size="small"
                      color={getStatusColor(selectedAgent.actif)}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Connexion:
                    </Typography>
                    <Chip
                      label={selectedAgent.connected ? 'Connecté' : 'Déconnecté'}
                      size="small"
                      color={selectedAgent.connected ? 'success' : 'default'}
                      variant={selectedAgent.connected ? 'filled' : 'outlined'}
                    />
                  </Grid>
                </Grid>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCloseModal}>
                  Fermer
                </Button>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleActionClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem onClick={handleEditAgent}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleToggleAgentStatus}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{selectedAgentForAction?.actif ? 'Désactiver' : 'Activer'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteAgent} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Supprimer</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </MainCard>
  );
};

export default Agents;
