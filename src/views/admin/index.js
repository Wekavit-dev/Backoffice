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
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Menu, MenuList, ListItemIcon, ListItemText } from '@mui/material';
import { AppContext } from 'AppContext';
import { IconUsers, IconUserCheck, IconUserX, IconInbox, IconShield } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import AdminsApi from 'api/admins/admins';

const Administrator = () => {
  const { globalState, setGlobalState } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAdminForAction, setSelectedAdminForAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for adding new admin
  const [newAdmin, setNewAdmin] = useState({
    nom: '',
    email: '',
    password: '',
    Activated: true
  });

  const fetchData = async () => {
    setLoading(true);

    try {
      const adminsResponse = await AdminsApi.getAdmins(globalState?.key);

      // Handle admins response
      if (adminsResponse.data) {
        const { data: response, status } = adminsResponse;
        if (status === 200 || status === 201) {
          setAdmins(response.data || response);
        }
      } else {
        console.log('Error getting admins:', adminsResponse.response);
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
  const totalAdmins = admins.length;
  const verifiedAdmins = admins.filter((admin) => admin.verified).length;
  const connectedAdmins = admins.filter((admin) => admin.connected).length;

  // Filter data based on search
  const filteredData = admins.filter((admin) => {
    const matchesSearch =
      admin.nom.toLowerCase().includes(searchTerm.toLowerCase()) || admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleViewDetails = (admin) => {
    setSelectedAdmin(admin);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleAddAdmin = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setNewAdmin({
      nom: '',
      email: '',
      password: '',
      Activated: true
    });
  };

  const handleInputChange = (field, value) => {
    setNewAdmin((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitAdmin = async () => {
    setIsSubmitting(true);

    try {
      // Create payload according to API requirements
      const payload = {
        nom: newAdmin.nom,
        email: newAdmin.email,
        password: newAdmin.password,
        Activated: newAdmin.Activated
      };

      console.log('Creating new admin with payload:', payload);

      // Call the actual API
      const response = await AdminsApi.createAdmin(payload, globalState?.key);

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
        toast.success('Administrateur créé avec succès!', { position: 'top-right' });
        handleCloseAddModal();

        // Refresh the admins list - wrap in try-catch to prevent error toast
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
      toast.error("Erreur lors de la création de l'administrateur", { position: 'top-right' });
    } catch (error) {
      // This catches network errors, API errors, etc.
      console.error('Error in handleSubmitAdmin catch block:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      toast.error("Erreur lors de la création de l'administrateur", { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (verified) => {
    return verified ? 'success' : 'error';
  };

  // Action menu handlers
  const handleActionClick = (event, admin) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdminForAction(admin);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedAdminForAction(null);
  };

  const handleEditAdmin = () => {
    console.log('Edit admin:', selectedAdminForAction);
    // TODO: Implement edit functionality
    handleActionClose();
  };

  const handleToggleAdminStatus = () => {
    console.log('Toggle admin status:', selectedAdminForAction);
    // TODO: Implement toggle status functionality
    const updatedAdmins = admins.map((admin) =>
      admin._id === selectedAdminForAction._id ? { ...admin, verified: !admin.verified } : admin
    );
    setAdmins(updatedAdmins);
    handleActionClose();
  };

  const handleDeleteAdmin = () => {
    console.log('Delete admin:', selectedAdminForAction);
    // TODO: Implement delete functionality with confirmation dialog
    const updatedAdmins = admins.filter((admin) => admin._id !== selectedAdminForAction._id);
    setAdmins(updatedAdmins);
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
      <MainCard title="Gestion Admin">
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
            <Skeleton variant="rounded" width={140} height={36} />
          </Box>

          {/* Table Skeleton */}
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  {[1, 2, 3, 4, 5].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width="100%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5].map((cell) => (
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
    <MainCard title="Gestion Admin">
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Total Admins" amount={totalAdmins} icon={<IconShield />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Admins Vérifiés" amount={verifiedAdmins} icon={<IconUserCheck />} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} md={4}>
            <SummaryCard title="Admins Connectés" amount={connectedAdmins} icon={<IconUsers />} color="#ed6c02" />
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher des administrateurs..."
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

          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAdmin} sx={{ ml: 'auto' }}>
            Ajouter Admin
          </Button>
        </Box>

        {/* Admins Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Statut Vérification</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Connexion</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3 }}>
                      <IconInbox sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Aucun administrateur trouvé
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
                      <Chip
                        label={row.verified ? 'Vérifié' : 'Non vérifié'}
                        size="small"
                        color={getStatusColor(row.verified)}
                        variant="outlined"
                      />
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

        {/* Add Admin Modal */}
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
                width: { xs: '95%', sm: '500px' },
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
                      Ajouter Nouvel Admin
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
                        value={newAdmin.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Mot de passe"
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newAdmin.Activated}
                            onChange={(e) => handleInputChange('Activated', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Admin Activé"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleCloseAddModal}>
                      Annuler
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitAdmin}
                      disabled={!newAdmin.nom || !newAdmin.email || !newAdmin.password || isSubmitting}
                    >
                      {isSubmitting ? 'Création...' : 'Créer Admin'}
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
                width: { xs: '95%', sm: '500px' },
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                p: 4
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">Détails de l&apos;Administrateur</Typography>
                <IconButton onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </Box>

              {selectedAdmin && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nom:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAdmin.nom}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedAdmin.email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Statut Vérification:
                    </Typography>
                    <Chip
                      label={selectedAdmin.verified ? 'Vérifié' : 'Non vérifié'}
                      size="small"
                      color={getStatusColor(selectedAdmin.verified)}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Connexion:
                    </Typography>
                    <Chip
                      label={selectedAdmin.connected ? 'Connecté' : 'Déconnecté'}
                      size="small"
                      color={selectedAdmin.connected ? 'success' : 'default'}
                      variant={selectedAdmin.connected ? 'filled' : 'outlined'}
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
          <MenuItem onClick={handleEditAdmin}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Modifier</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleToggleAdminStatus}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{selectedAdminForAction?.verified ? 'Désactiver' : 'Activer'}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteAdmin} sx={{ color: 'error.main' }}>
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

export default Administrator;
