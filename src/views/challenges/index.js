/* eslint-disable no-unused-vars */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Grid,
  Box,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  EmojiEvents as TrophyIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { IconTrophy, IconUsers, IconEye, IconFileText } from '@tabler/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainCard from 'ui-component/cards/MainCard';
import { AppContext } from 'AppContext';
import ChallengesApi from 'api/challenges/challenges';
import locekdSavesApi from 'api/saves/locked';
import SummaryCard from 'views/admin/components/SummaryCard';
import CreateChallengeModal from './components/CreateChallengeModal';
import ChallengeDetailPanel from './components/ChallengeDetailPanel';
import {
  PUBLISH_OPTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  extractData,
  extractList,
  formatAmount,
  formatDate,
  getGameModeLabel,
  isApiSuccess
} from './utils/challengeUi';

const ChallengesPage = () => {
  const { globalState } = useContext(AppContext);

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileShowPanel, setMobileShowPanel] = useState(false);
  const [savingTypes, setSavingTypes] = useState([]);
  const [devises, setDevises] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  const fetchMeta = useCallback(async () => {
    if (!globalState?.key) return;
    try {
      const [typesRes, devisesRes] = await Promise.all([
        locekdSavesApi.getSavingTypes(globalState.key),
        locekdSavesApi.getCurriences(globalState.key)
      ]);
      setSavingTypes(extractList(typesRes));
      setDevises(extractList(devisesRes));
    } catch (error) {
      console.error('Meta challenges load error', error);
    }
  }, [globalState?.key]);

  const fetchChallenges = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const params = { page: 1, limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (publishFilter !== 'all') params.isPublished = publishFilter;

      const response = await ChallengesApi.listChallenges(params, globalState.key);
      const list = extractList(response);
      const pageInfo = response?.data?.pagination;

      setChallenges(list);
      if (pageInfo) setPagination(pageInfo);

      setSelectedChallenge((prev) => {
        if (!list.length) return null;
        if (prev) {
          const stillThere = list.find((item) => item._id === prev._id);
          return stillThere || list[0];
        }
        return list[0];
      });
    } catch (error) {
      toast.error(error?.data?.error || 'Impossible de charger les défis', { position: 'top-right' });
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, statusFilter, publishFilter]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const filteredChallenges = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter((item) => {
      return (
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.gameMode?.toLowerCase().includes(q) ||
        (item.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [challenges, searchTerm]);

  const stats = useMemo(() => {
    const published = challenges.filter((c) => c.isPublished).length;
    const drafts = challenges.filter((c) => !c.isPublished || c.status === 'draft').length;
    const active = challenges.filter((c) => c.status === 'active').length;
    const participants = challenges.reduce((sum, c) => sum + (Number(c.participantCount) || 0), 0);
    return {
      total: challenges.length,
      published,
      drafts,
      active,
      participants
    };
  }, [challenges]);

  const handleCreate = async (payload, resetForm) => {
    setIsSubmitting(true);
    try {
      const response = await ChallengesApi.createChallenge(payload, globalState?.key);
      if (!isApiSuccess(response)) {
        toast.error(response?.data?.error || 'Erreur lors de la création', { position: 'top-right' });
        return;
      }

      toast.success('Défi créé en brouillon', { position: 'top-right' });
      setAddModalOpen(false);
      resetForm?.();
      await fetchChallenges();
      const created = extractData(response);
      if (created) {
        setSelectedChallenge(created);
        setMobileShowPanel(true);
      }
    } catch (error) {
      toast.error(error?.data?.error || error?.message || 'Erreur lors de la création', { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdated = (updated) => {
    if (!updated?._id) {
      fetchChallenges();
      return;
    }

    setChallenges((prev) => prev.map((item) => (item._id === updated._id ? { ...item, ...updated } : item)));
    setSelectedChallenge((prev) => (prev?._id === updated._id ? { ...prev, ...updated } : prev));
  };

  const handleSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setMobileShowPanel(true);
  };

  if (loading && !challenges.length) {
    return (
      <MainCard title="Tous les défis d’épargne">
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card>
                  <Box sx={{ p: 3 }}>
                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={32} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={420} />
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Tous les défis d’épargne">
      <Box>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Créez un défi en brouillon, configurez-le, puis rendez-le visible dans l’app. Le classement et les versements
          manqués se gèrent depuis le panneau de droite.
        </Alert>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Tous les défis" amount={stats.total} icon={<IconTrophy />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Visibles dans l’app" amount={stats.published} icon={<IconEye />} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="En cours" amount={stats.active} icon={<IconFileText />} color="#ed6c02" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Participants" amount={stats.participants} icon={<IconUsers />} color="#7b1fa2" />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher un défi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 260 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>État</InputLabel>
            <Select
              value={statusFilter}
              label="État"
              onChange={(e) => setStatusFilter(e.target.value)}
              startAdornment={<FilterIcon sx={{ mr: 1, fontSize: '1rem', color: 'action.active' }} />}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Visibilité</InputLabel>
            <Select value={publishFilter} label="Visibilité" onChange={(e) => setPublishFilter(e.target.value)}>
              {PUBLISH_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddModalOpen(true)}>
            Nouveau défi
          </Button>

          <Box sx={{ ml: 'auto' }}>
            <Chip
              icon={<TrophyIcon sx={{ fontSize: '1rem !important' }} />}
              label={`${filteredChallenges.length} défi${filteredChallenges.length > 1 ? 's' : ''}`}
              variant="outlined"
              color="primary"
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} xl={5} sx={{ display: { xs: mobileShowPanel ? 'none' : 'block', xl: 'block' } }}>
            <TableContainer component={Card}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Défi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Participants</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    [1, 2, 3, 4, 5].map((row) => (
                      <TableRow key={row}>
                        {[1, 2, 3].map((cell) => (
                          <TableCell key={cell}>
                            <Skeleton variant="text" width="100%" height={20} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredChallenges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Box sx={{ py: 4 }}>
                          <TrophyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Aucun défi trouvé avec ces critères
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChallenges.map((challenge) => {
                      const selected = selectedChallenge?._id === challenge._id;
                      return (
                        <TableRow
                          key={challenge._id}
                          hover
                          selected={selected}
                          onClick={() => handleSelect(challenge)}
                          sx={{
                            cursor: 'pointer',
                            '&.Mui-selected': {
                              bgcolor: 'primary.50',
                              '&:hover': { bgcolor: 'primary.100' }
                            }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {challenge.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {getGameModeLabel(challenge.gameMode)} · {formatAmount(challenge.goalAmount, challenge.idDevise)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(challenge.startDate)} → {formatDate(challenge.endDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" flexDirection="column" gap={0.5} alignItems="flex-start">
                              <Chip
                                size="small"
                                label={STATUS_LABELS[challenge.status] || challenge.status}
                                color={STATUS_COLORS[challenge.status] || 'default'}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={challenge.isPublished ? 'Visible' : 'Masqué'}
                                color={challenge.isPublished ? 'success' : 'default'}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {challenge.participantCount || 0}
                            </Typography>
                            {challenge.maxParticipants > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                / {challenge.maxParticipants}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} xl={7} sx={{ display: { xs: mobileShowPanel ? 'block' : 'none', xl: 'block' } }}>
            <Card sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider', minHeight: { xs: 'auto', xl: 560 } }}>
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  {mobileShowPanel && (
                    <Tooltip title="Retour à la liste">
                      <IconButton size="small" onClick={() => setMobileShowPanel(false)} sx={{ display: { xl: 'none' } }}>
                        <ChevronLeftIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <SettingsIcon color="primary" sx={{ fontSize: 20 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Détail du défi
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedChallenge ? selectedChallenge.name : 'Sélectionnez un défi dans le tableau'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <ChallengeDetailPanel
                challenge={selectedChallenge}
                token={globalState?.key}
                onUpdated={handleUpdated}
              />
            </Card>
          </Grid>
        </Grid>

        <CreateChallengeModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
          savingTypes={savingTypes}
          devises={devises}
        />
      </Box>
    </MainCard>
  );
};

export default ChallengesPage;
