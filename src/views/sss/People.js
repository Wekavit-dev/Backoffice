import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  Groups as GroupsIcon,
  Download as DownloadIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PeopleAlt as PeopleAltIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import {
  maskPhone,
  telHref,
  whatsappHref,
  STAGE_OPTIONS,
  COHORT_LABELS,
  formatDateFr,
  URGENCY_LABELS,
  STAGE_LABELS
} from './labels';
import {
  AlertChips,
  EmptyState,
  PersonCell,
  StageChip,
  UrgencyChip
} from './components/Chips';
import HealthMeter from './components/HealthMeter';
import PersonCard from './components/PersonCard';
import {
  PageToolbar,
  KpiCard,
  InfoBanner,
  FilterBar,
  filterFieldSx,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  PrimaryButton,
  GhostButton,
  SSS_COLORS
} from './components/SssLayout';

const PeoplePage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [filters, setFilters] = useState({
    stage: searchParams.get('stage') || '',
    urgency: searchParams.get('urgency') || '',
    cohort: searchParams.get('cohort') || ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exporting, setExporting] = useState(false);

  const stats = useMemo(() => {
    if (!rows.length) return { total: 0, urgent: 0, new: 0, healthy: 0 };
    return {
      total: rows.length,
      urgent: rows.filter((p) => p.urgency === 'critical' || p.urgency === 'high').length,
      new: rows.filter((p) => p.stage === 'S1' || p.stage === 'S2').length,
      healthy: rows.filter((p) => p.healthLevel === 'excellent' || p.healthLevel === 'good').length
    };
  }, [rows]);

  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const params = {
        page,
        limit: 40,
        ...(filters.stage && { stage: filters.stage }),
        ...(filters.urgency && { urgency: filters.urgency }),
        ...(filters.cohort && { cohort: filters.cohort }),
        ...(searchApplied.trim() && { search: searchApplied.trim() })
      };

      const res = await SssApi.listUsers(params, globalState.key);
      if (res?.status === 200) {
        setRows(res.data?.data || []);
        setTotal(res.data?.total || 0);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les personnes');
      setSnackbar({ open: true, message: 'Erreur lors du chargement des données', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, page, filters, searchApplied]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const next = {};
    if (filters.stage) next.stage = filters.stage;
    if (filters.urgency) next.urgency = filters.urgency;
    if (filters.cohort) next.cohort = filters.cohort;
    setSearchParams(next, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ stage: '', urgency: '', cohort: '' });
    setSearch('');
    setSearchApplied('');
    setPage(1);
    setSnackbar({ open: true, message: 'Filtres réinitialisés', severity: 'success' });
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    setSearchApplied(value);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const headers = ['Nom', 'Téléphone', 'Email', 'Étape', 'Urgence', 'Santé', 'Alertes', 'Dernière activité'];
      const data = rows.map((p) => [
        p.idUser?.name || 'N/A',
        p.idUser?.phone || 'N/A',
        p.idUser?.email || 'N/A',
        STAGE_LABELS[p.stage] || p.stage || 'N/A',
        URGENCY_LABELS[p.urgency] || p.urgency || 'N/A',
        p.healthLevel || 'N/A',
        p.alerts?.length || 0,
        formatDateFr(p.ledgerSnapshot?.lastActivityAt) || 'N/A'
      ]);

      const csv = [headers, ...data].map((row) => row.join(',')).join('\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personnes_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExporting(false);
      setSnackbar({ open: true, message: 'Export réussi', severity: 'success' });
    }, 500);
  };

  const pageCount = Math.max(1, Math.ceil(total / 40));

  const renderTable = () => (
    <TableShell>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={tableHeadCellSx}>Personne</TableCell>
            <TableCell sx={tableHeadCellSx}>Étape</TableCell>
            <TableCell sx={tableHeadCellSx}>Santé</TableCell>
            <TableCell sx={tableHeadCellSx}>Urgence</TableCell>
            <TableCell sx={tableHeadCellSx}>Alertes</TableCell>
            <TableCell sx={tableHeadCellSx}>Dernière activité</TableCell>
            <TableCell align="right" sx={tableHeadCellSx}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((profile) => {
            const user = profile.idUser || {};
            const userId = user._id || profile.idUser;
            const phone = user.phone;

            return (
              <TableRow key={profile._id} hover>
                <TableCell sx={tableBodyCellSx}>
                  <PersonCell user={user} phone={maskPhone(phone)} />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <StageChip stage={profile.stage} size="small" />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <HealthMeter level={profile.healthLevel} score={profile.healthScore} dense />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <UrgencyChip urgency={profile.urgency} size="small" />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <AlertChips alerts={profile.alerts} max={2} />
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <Typography variant="body2">
                    {formatDateFr(profile.ledgerSnapshot?.lastActivityAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={tableBodyCellSx}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ViewIcon fontSize="small" />}
                    onClick={() => navigate(`/wekavit/sss/people/${userId}`)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: SSS_COLORS.brandBorder,
                      color: SSS_COLORS.brand,
                      bgcolor: 'rgba(103,58,183,0.04)',
                      px: 1.5,
                      '&:hover': { borderColor: SSS_COLORS.brand, bgcolor: 'rgba(103,58,183,0.1)' }
                    }}
                  >
                    Voir
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, border: 0 }}>
                <EmptyState
                  icon={<PeopleAltIcon />}
                  title="Aucune personne trouvée"
                  subtitle="Essayez de modifier vos filtres ou d'initialiser les profils"
                  action={
                    <Button variant="outlined" onClick={handleClearFilters}>
                      Réinitialiser les filtres
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableShell>
  );

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: 'background.paper' }}>
      <PageToolbar
        icon={<GroupsIcon />}
        title="Personnes à accompagner"
        subtitle="Cherchez quelqu'un, filtrez par étape ou urgence, puis ouvrez sa fiche pour noter, changer l'étape ou l'action conseillée."
        color={SSS_COLORS.info}
        actions={
          <>
            <GhostButton startIcon={<DownloadIcon />} onClick={handleExport} disabled={exporting || rows.length === 0}>
              {exporting ? 'Export...' : 'Exporter'}
            </GhostButton>
            <PrimaryButton startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
              Actualiser
            </PrimaryButton>
          </>
        }
      />

      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Chargement des personnes...
          </Typography>
        </Box>
      )}

      <Grid container spacing={{ xs: 1.25, sm: 2 }} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Total" value={stats.total} hint="Personnes suivies" icon={<GroupsIcon />} color={SSS_COLORS.brand} loading={loading} />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            title="Urgents"
            value={stats.urgent}
            hint="Critique ou élevée"
            icon={<WarningIcon />}
            color={SSS_COLORS.error}
            loading={loading}
            onClick={() => handleFilterChange('urgency', 'critical')}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            title="Nouveaux"
            value={stats.new}
            hint="Étapes S1 · S2"
            icon={<PersonAddIcon />}
            color={SSS_COLORS.info}
            loading={loading}
            onClick={() => handleFilterChange('cohort', 'new')}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard title="Bonne santé" value={stats.healthy} hint="Excellente ou bonne" icon={<CheckCircleIcon />} color={SSS_COLORS.success} loading={loading} />
        </Grid>
      </Grid>

      <InfoBanner icon={<InfoIcon />}>
        Astuce : combinez les filtres d'étape et d'urgence pour cibler les personnes à contacter en priorité.
      </InfoBanner>

      <FilterBar
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Nom, prénom ou téléphone..."
        onRefresh={load}
        refreshing={loading}
      >
        <TextField
          select
          size="small"
          label="Étape"
          value={filters.stage}
          onChange={(e) => handleFilterChange('stage', e.target.value)}
          sx={filterFieldSx}
        >
          <MenuItem value="">Toutes</MenuItem>
          {STAGE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Urgence"
          value={filters.urgency}
          onChange={(e) => handleFilterChange('urgency', e.target.value)}
          sx={filterFieldSx}
        >
          <MenuItem value="">Toutes</MenuItem>
          <MenuItem value="critical">Critique</MenuItem>
          <MenuItem value="high">Élevée</MenuItem>
          <MenuItem value="medium">Moyenne</MenuItem>
          <MenuItem value="low">Basse</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Groupe"
          value={filters.cohort}
          onChange={(e) => handleFilterChange('cohort', e.target.value)}
          sx={filterFieldSx}
        >
          <MenuItem value="">Tous</MenuItem>
          {Object.entries(COHORT_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
      </FilterBar>

      {!loading && rows.length === 0 ? (
        <EmptyState
          icon={<PeopleAltIcon />}
          title="Aucune personne trouvée"
          subtitle="Essayez d'autres filtres, ou initialisez les profils dans Réglages."
          action={
            <Stack direction="row" spacing={2}>
              <PrimaryButton onClick={handleClearFilters}>Réinitialiser les filtres</PrimaryButton>
              <Button variant="outlined" onClick={() => navigate('/wekavit/sss/settings')}>
                Aller aux réglages
              </Button>
            </Stack>
          }
        />
      ) : (
        <>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Stack spacing={2}>
              {rows.map((profile) => {
                const userId = profile.idUser?._id || profile.idUser;
                return (
                  <PersonCard
                    key={profile._id}
                    profile={profile}
                    onOpen={() => navigate(`/wekavit/sss/people/${userId}`)}
                    variant="default"
                    animated
                  />
                );
              })}
            </Stack>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'block' } }}>{renderTable()}</Box>

          {rows.length > 0 && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 3 }}
            >
              <Typography variant="caption" color="text.secondary">
                {total} personne{total > 1 ? 's' : ''}
                {total > 40 && ` · Page ${page} sur ${pageCount}`}
              </Typography>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton
                showLastButton
                sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }}
              />
            </Stack>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainCard>
  );
};

export default PeoplePage;
