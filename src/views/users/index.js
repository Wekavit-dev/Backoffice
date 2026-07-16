/* eslint-disable no-unused-vars */
// material-ui
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
  LinearProgress,
  Modal,
  IconButton,
  Fade,
  Backdrop,
  Divider,
  Button,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  AccountBalance as BalanceIcon
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { IconUsers, IconInbox } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppContext } from 'AppContext';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import UsersApi from 'api/users/users';

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`activity-tabpanel-${index}`} aria-labelledby={`activity-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

function a11yProps(index) {
  return {
    id: `activity-tab-${index}`,
    'aria-controls': `activity-tabpanel-${index}`
  };
}

const UsersPage = () => {
  // eslint-disable-next-line no-unused-vars
  const { globalState, setGlobalState } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    phone: '',
    profession: '',
    genre: 'none',
    birthDay: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [generalActivities, setGeneralActivities] = useState([]);
  const [balanceActivities, setBalanceActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // Add this after your existing calculations
  const uniqueCountries = [...new Set(users.map((user) => user.idPays?.nom).filter(Boolean))];

  const fetchUserActivities = async (userId) => {
    setActivitiesLoading(true);
    try {
      console.log('Fetching activities for userId:', userId);

      const [generalResponse, balanceResponse] = await Promise.all([
        UsersApi.getUserHistory({ idUser: userId, total: 50 }, globalState?.key),
        UsersApi.getUserBalanceHistory({ idUser: userId, total: 50 }, globalState?.key)
      ]);

      if (generalResponse.data) {
        const generalData = Array.isArray(generalResponse.data) ? generalResponse.data : generalResponse.data.data || [];
        setGeneralActivities(generalData);
      }

      if (balanceResponse.data) {
        const balanceData = Array.isArray(balanceResponse.data) ? balanceResponse.data : balanceResponse.data.data || [];
        setBalanceActivities(balanceData);
      }
    } catch (error) {
      console.error('Error fetching user activities:', error);
      setGeneralActivities([]);
      setBalanceActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersResponse = await UsersApi.getAllUsers({}, globalState?.key);

        if (usersResponse.data) {
          const { data: response, status } = usersResponse;
          if (status === 200 || status === 201) {
            // Handle different possible response structures
            const userData = usersResponse.data;
            if (Array.isArray(userData)) {
              setUsers(userData);
            } else if (userData.data && Array.isArray(userData.data)) {
              setUsers(userData.data);
            } else if (userData.users && Array.isArray(userData.users)) {
              setUsers(userData.users);
            } else {
              console.error('Users data is not an array:', userData);
              setUsers([]);
            }
          }
        } else {
          console.error('Unexpected response format:', usersResponse);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [globalState?.key]);

  const filteredData = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.idPays.nom.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCountry = selectedCountry === '' || user.idPays?.nom === selectedCountry;

        return matchesSearch && matchesCountry;
      })
    : [];

  // Calculate totals from users data
  const totalUsers = users.length;
  const totalBurundiUsers = users.filter((user) => user.idPays?.nom === 'Burundi').length;
  const totalRwandaUsers = users.filter((user) => user.idPays?.nom === 'Rwanda').length;
  const totalCongoUsers = (Array.isArray(users) ? users : []).filter(
    (user) => user.idPays?.nom === 'Congo DRC' || user.idPays?.nom === 'DRC' || user.idPays?.nom === 'Congo' || user.idPays?.nom === 'RDC'
  ).length;

  // Filter activities based on search
  const filteredGeneralActivities = generalActivities.filter(
    (activity) =>
      activity.operation?.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
      activity.detail?.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  const filteredBalanceActivities = balanceActivities.filter(
    (activity) =>
      activity.operation?.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
      activity.detail?.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  const handleViewDetails = (user) => {
    // console.log('Selected user:', user); // Check if user object is correct
    // console.log('User ID:', user._id); // Check if _id exists
    setSelectedUser(user);
    setModalOpen(true);
    setTabValue(0);
    setActivitySearchTerm('');
    // Fetch activities for this user
    fetchUserActivities(user._id);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setTabValue(0);
    setActivitySearchTerm('');
    setGeneralActivities([]);
    setBalanceActivities([]);
  };

  const handleMenuClick = (event, userId) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const handleOpenEditModal = (user) => {
    setEditUser(user);
    setEditForm({
      prenom: user.prenom || '',
      nom: user.nom || '',
      email: user.email || '',
      phone: user.phone || '',
      profession: user.profession || '',
      genre: user.genre || 'none',
      birthDay: user.birthDay || ''
    });
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditUser(null);
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setIsSavingEdit(true);
    try {
      const response = await UsersApi.UpdateUser(editUser._id, editForm, globalState?.key);

      const isSuccess =
        response.status === 200 ||
        response.status === 201 ||
        (response.data && (response.data.status === 200 || response.data.status === 201)) ||
        (response.data && response.data.code === 200);

      if (isSuccess) {
        setUsers((prev) => prev.map((u) => (u._id === editUser._id ? { ...u, ...editForm } : u)));
        toast.success('Profil modifié avec succès !', { position: 'top-right' });
        handleCloseEditModal();
      } else {
        toast.error(response?.data?.message || "Erreur lors de la modification du profil", { position: 'top-right' });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast.error(error?.data?.message || error?.message || "Erreur lors de la modification du profil", {
        position: 'top-right'
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleEdit = () => {
    const user = users.find((u) => u._id === selectedUserId);
    if (user) handleOpenEditModal(user);
    handleMenuClose();
  };

  const handleDelete = () => {
    console.log('Delete user:', selectedUserId);
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    console.log('Toggle status user:', selectedUserId);
    handleMenuClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCountryCardClick = (country) => {
    setSelectedCountry(country);
  };

  const getCountryFlag = (country) => {
    const flags = {
      Burundi: '🇧🇮',
      Rwanda: '🇷🇼',
      DRCongo: '🇨🇩',
      DRC: '🇨🇩',
      Congo: '🇨🇩'
    };
    return flags[country] || '🌍';
  };

  const getOperationColor = (operation) => {
    const colors = {
      Connexion: '#1976d2',
      Déconnexion: '#666666',
      'Modification profil': '#ed6c02',
      Confirmation: '#2e7d32',
      'créer un nouveau plan': '#2e7d32',
      'créer compte': '#666666',
      Validation: '#d32f2f',
      Transfert: '#9c27b0'
    };
    return colors[operation] || '#1976d2';
  };

  const SummaryCard = ({ title, amount, icon, country, color = '#1976d2', showCurrency = false }) => (
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
                fontSize: { xs: '1.4rem', sm: '1.6rem' }
              }}
            >
              {amount}
            </Typography>
            {country && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: `${color}08`,
                  borderRadius: 2,
                  border: `1px solid ${color}20`
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {getCountryFlag(country)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: color,
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                >
                  {country}
                </Typography>
              </Box>
            )}
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

  // PropTypes for SummaryCard
  SummaryCard.propTypes = {
    title: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.node.isRequired,
    country: PropTypes.string,
    color: PropTypes.string,
    showCurrency: PropTypes.bool
  };

  if (isLoading) {
    return (
      <MainCard title="Gestion Épargnes">
        <Box>
          {/* Summary Cards Skeleton */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={3} key={item}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1}>
                        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                        <Skeleton variant="rounded" width="70%" height={24} />
                      </Box>
                      <Skeleton variant="rounded" width={48} height={48} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Search Skeleton */}
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rounded" width={300} height={40} />
          </Box>

          {/* Table Skeleton */}
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width="100%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
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
    <MainCard title="Rapport Utilisateurs">
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <SummaryCard title="Total Utilisateurs" amount={totalUsers} icon={<IconUsers />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box
              onClick={() => handleCountryCardClick('Burundi')}
              onKeyDown={(e) => e.key === 'Enter' && handleCountryCardClick('Burundi')}
              tabIndex={0}
              sx={{
                cursor: 'pointer',
                '&:focus': {
                  outline: '2px solid #1976d2',
                  borderRadius: 1
                }
              }}
            >
              <SummaryCard title="Total Burundi" amount={totalBurundiUsers} icon={<IconUsers />} country="Burundi" color="#2e7d32" />
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box
              onClick={() => handleCountryCardClick('Rwanda')}
              onKeyDown={(e) => e.key === 'Enter' && handleCountryCardClick('Rwanda')}
              tabIndex={0}
              sx={{
                cursor: 'pointer',
                '&:focus': {
                  outline: '2px solid #1976d2',
                  borderRadius: 1
                }
              }}
            >
              <SummaryCard title="Total Rwanda" amount={totalRwandaUsers} icon={<IconUsers />} country="Rwanda" color="#ed6c02" />
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Box
              onClick={() => handleCountryCardClick('Congo DRC')}
              onKeyDown={(e) => e.key === 'Enter' && handleCountryCardClick('Congo DRC')}
              tabIndex={0}
              sx={{
                cursor: 'pointer',
                '&:focus': {
                  outline: '2px solid #1976d2',
                  borderRadius: 1
                }
              }}
            >
              <SummaryCard title="Total RDC" amount={totalCongoUsers} icon={<IconUsers />} country="DRCongo" color="#9c27b0" />
            </Box>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
          />

          <TextField
            select
            size="small"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            sx={{ minWidth: 200 }}
            label="Filtrer par pays"
          >
            <MenuItem value="">
              <em>Tous les pays</em>
            </MenuItem>
            {uniqueCountries.map((country) => (
              <MenuItem key={country} value={country}>
                {getCountryFlag(country)} {country}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Users Table */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Inscription</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pays</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.prenom} {user.nom}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{user.idPays.nom}</TableCell>
                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={() => handleViewDetails(user)} sx={{ color: 'primary.main' }}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenEditModal(user)} sx={{ color: 'warning.main' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={(event) => handleMenuClick(event, user._id)} sx={{ color: 'text.secondary' }}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 150 }
          }}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Modifier
          </MenuItem>
          <MenuItem onClick={handleToggleStatus}>
            <BlockIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Désactiver
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Supprimer
          </MenuItem>
        </Menu>

        {/* Edit User Modal */}
        <Modal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.6)' }
          }}
        >
          <Fade in={editModalOpen}>
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
                    <Box>
                      <Typography variant="h5" fontWeight="600" sx={{ color: '#1a1a1a' }}>
                        Modifier le profil
                      </Typography>
                      {editUser && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {editUser.prenom} {editUser.nom}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      onClick={handleCloseEditModal}
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        value={editForm.prenom}
                        onChange={(e) => handleEditFieldChange('prenom', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Nom" value={editForm.nom} onChange={(e) => handleEditFieldChange('nom', e.target.value)} />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleEditFieldChange('email', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Téléphone"
                        value={editForm.phone}
                        onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Genre"
                        value={editForm.genre}
                        onChange={(e) => handleEditFieldChange('genre', e.target.value)}
                      >
                        <MenuItem value="none">Non précisé</MenuItem>
                        <MenuItem value="male">Homme</MenuItem>
                        <MenuItem value="female">Femme</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Profession"
                        value={editForm.profession}
                        onChange={(e) => handleEditFieldChange('profession', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date de naissance"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={editForm.birthDay}
                        onChange={(e) => handleEditFieldChange('birthDay', e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleCloseEditModal} disabled={isSavingEdit}>
                      Annuler
                    </Button>
                    <Button variant="contained" onClick={handleSaveEdit} disabled={isSavingEdit}>
                      {isSavingEdit ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Modal>

        {/* Activity History Modal */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
            sx: { bgcolor: 'rgba(0, 0, 0, 0.5)' }
          }}
        >
          <Fade in={modalOpen}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', md: '90%', lg: '80%' },
                maxWidth: '1200px',
                maxHeight: '90vh',
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              {selectedUser && (
                <>
                  {/* Modal Header */}
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'grey.50'
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                          Historique des Activités
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {selectedUser.prenom} {selectedUser.nom} • {selectedUser.email}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={handleCloseModal}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Modal Content */}
                  <Box sx={{ height: 'calc(90vh - 80px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                      <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                          px: 3,
                          '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            minHeight: 48,
                            py: 1.5
                          }
                        }}
                      >
                        <Tab
                          icon={<HistoryIcon sx={{ fontSize: '1.1rem' }} />}
                          iconPosition="start"
                          label="Activités Générales"
                          {...a11yProps(0)}
                        />
                        <Tab
                          icon={<BalanceIcon sx={{ fontSize: '1.1rem' }} />}
                          iconPosition="start"
                          label="Activités de Solde"
                          {...a11yProps(1)}
                        />
                      </Tabs>
                    </Box>

                    {/* Search Field */}
                    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Rechercher dans les activités..."
                        value={activitySearchTerm}
                        onChange={(e) => setActivitySearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{ maxWidth: 400 }}
                      />
                    </Box>

                    {/* Tab Panels */}
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      <TabPanel value={tabValue} index={0}>
                        {activitiesLoading ? (
                          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
                            <LinearProgress sx={{ width: '200px' }} />
                          </Box>
                        ) : (
                          <TableContainer sx={{ height: '100%' }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Opération</TableCell>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Détail</TableCell>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Date</TableCell>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Il y a</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredGeneralActivities.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Aucune activité générale trouvée
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredGeneralActivities.map((activity) => (
                                    <TableRow key={activity.id} hover>
                                      <TableCell>
                                        <Chip
                                          label={activity.operation}
                                          size="small"
                                          sx={{
                                            bgcolor: `${getOperationColor(activity.operation)}15`,
                                            color: getOperationColor(activity.operation),
                                            border: `1px solid ${getOperationColor(activity.operation)}30`,
                                            fontWeight: 500
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">{activity.action}</Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">{activity.date}</Typography>
                                      </TableCell>

                                      <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                          {activity.daysAgo}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </TabPanel>

                      <TabPanel value={tabValue} index={1}>
                        {activitiesLoading ? (
                          <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 4 }}>
                            <LinearProgress sx={{ width: '200px' }} />
                          </Box>
                        ) : (
                          <TableContainer sx={{ height: '100%' }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Opération</TableCell>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Détail</TableCell>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Date</TableCell>
                                  <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Il y a</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredBalanceActivities.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Aucune activité de solde trouvée
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  filteredBalanceActivities.map((activity) => (
                                    <TableRow key={activity.id} hover>
                                      <TableCell>
                                        <Chip
                                          label={activity.action}
                                          size="small"
                                          sx={{
                                            bgcolor: `${getOperationColor(activity.action)}15`,
                                            color: getOperationColor(activity.action),
                                            border: `1px solid ${getOperationColor(activity.action)}30`,
                                            fontWeight: 500
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">{activity.operation}</Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">{activity.date}</Typography>
                                      </TableCell>

                                      <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                          {activity.daysAgo}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </TabPanel>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        </Modal>
      </Box>
    </MainCard>
  );
};

export default UsersPage;
