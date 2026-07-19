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
  PeopleAlt as PeopleAltIcon,
  Refresh as RefreshIcon
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
  STAGE_LABELS,
  displayName
} from './labels';
import {
  EmptyState,
  PersonAvatar,
  UrgencyChip
} from './components/Chips';
import PersonCard from './components/PersonCard';
import PersonPreviewDialog from './components/PersonPreviewDialog';
import {
  PageToolbar,
  KpiCard,
  InfoBanner,
  FilterBar,
  filterFieldSx,
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  viewButtonSx,
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
  const [preview, setPreview] = useState(null);

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
        const payload = res.data?.data ?? res.data ?? [];
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.users)
            ? payload.users
            : Array.isArray(payload.data)
              ? payload.data
              : [];
        setRows(list);
        setTotal(res.data?.total ?? payload.total ?? list.length ?? 0);
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
            <TableCell sx={tableHeadCellSx}>Urgence</TableCell>
            <TableCell align="right" sx={tableHeadCellSx}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((profile) => {
            const user = profile.idUser || {};

            return (
              <TableRow
                key={profile._id}
                hover
                onClick={() => setPreview(profile)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={tableBodyCellSx}>
                  <div className="flex items-center gap-2.5">
                    <PersonAvatar user={user} size={32} />
                    <span className="text-sm font-semibold text-sss-text">{displayName(user)}</span>
                  </div>
                </TableCell>
                <TableCell sx={tableBodyCellSx}>
                  <UrgencyChip urgency={profile.urgency} size="small" />
                </TableCell>
                <TableCell align="right" sx={tableBodyCellSx} onClick={(e) => e.stopPropagation()}>
                  <Button size="small" variant="outlined" onClick={() => setPreview(profile)} sx={viewButtonSx}>
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}

          {rows.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 6, border: 0 }}>
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
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: SSS_COLORS.pageBg }}>
      <div className="sss-page">
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
          <div className="mb-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-sss-info-soft">
              <div className="h-full w-1/3 animate-sss-shimmer rounded-full bg-sss-info" />
            </div>
            <p className="sss-muted mt-2 text-xs">Chargement des personnes...</p>
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total" value={stats.total} hint="Personnes suivies" icon={<GroupsIcon />} color={SSS_COLORS.brand} loading={loading} variant="dark" />
          <KpiCard
            title="Urgents"
            value={stats.urgent}
            hint="Critique ou élevée"
            icon={<WarningIcon />}
            color={SSS_COLORS.error}
            loading={loading}
            onClick={() => handleFilterChange('urgency', 'critical')}
            variant="dark"
          />
          <KpiCard
            title="Nouveaux"
            value={stats.new}
            hint="Étapes S1 · S2"
            icon={<PersonAddIcon />}
            color={SSS_COLORS.info}
            loading={loading}
            onClick={() => handleFilterChange('cohort', 'new')}
            variant="dark"
          />
          <KpiCard title="Bonne santé" value={stats.healthy} hint="Excellente ou bonne" icon={<CheckCircleIcon />} color={SSS_COLORS.success} loading={loading} variant="dark" />
        </div>

        <InfoBanner icon={<InfoIcon />}>
          Astuce : combinez les filtres d&apos;étape et d&apos;urgence pour cibler les personnes à contacter en priorité.
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
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
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
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </FilterBar>

        {!loading && rows.length === 0 ? (
          <EmptyState
            icon={<PeopleAltIcon />}
            title="Aucune personne trouvée"
            subtitle="Essayez d'autres filtres, ou initialisez les profils dans Réglages."
            action={
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                <PrimaryButton onClick={handleClearFilters}>Réinitialiser les filtres</PrimaryButton>
                <GhostButton onClick={() => navigate('/wekavit/sss/settings')}>Aller aux réglages</GhostButton>
              </div>
            }
          />
        ) : (
          <>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <div className="flex flex-col gap-3">
                {rows.map((profile) => (
                  <PersonCard
                    key={profile._id}
                    profile={profile}
                    onOpen={() => setPreview(profile)}
                    animated
                  />
                ))}
              </div>
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>{renderTable()}</Box>

            {rows.length > 0 && (
              <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="sss-muted m-0 text-xs">
                  {total} personne{total > 1 ? 's' : ''}
                  {total > 40 && ` · Page ${page} sur ${pageCount}`}
                </p>
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
              </div>
            )}
          </>
        )}

        <PersonPreviewDialog
          open={Boolean(preview)}
          profile={preview}
          onClose={() => setPreview(null)}
          onOpenFiche={() => {
            const userId = preview?.idUser?._id || preview?.idUser;
            setPreview(null);
            if (userId) navigate(`/wekavit/sss/people/${userId}`);
          }}
        />

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
      </div>
    </MainCard>
  );
};

export default PeoplePage;
