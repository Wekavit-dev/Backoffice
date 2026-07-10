import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Call as CallIcon,
  WhatsApp as WhatsAppIcon,
  Groups as GroupsIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppContext } from 'AppContext';
import MainCard from 'ui-component/cards/MainCard';
import SssApi from 'api/sss/sss';
import { maskPhone, telHref, whatsappHref, STAGE_OPTIONS, COHORT_LABELS, formatDateFr } from './labels';
import { AlertChips, EmptyState, PersonCell, StageChip, UrgencyChip } from './components/Chips';
import HealthMeter from './components/HealthMeter';
import PageHeader from './components/PageHeader';
import PersonCard from './components/PersonCard';

const PeoplePage = () => {
  const { globalState } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [stage, setStage] = useState(searchParams.get('stage') || '');
  const [urgency, setUrgency] = useState(searchParams.get('urgency') || '');
  const [cohort, setCohort] = useState(searchParams.get('cohort') || '');

  const load = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const params = { page, limit: 40 };
      if (stage) params.stage = stage;
      if (urgency) params.urgency = urgency;
      if (cohort) params.cohort = cohort;
      if (searchApplied.trim()) params.search = searchApplied.trim();

      const res = await SssApi.listUsers(params, globalState.key);
      if (res?.status === 200) {
        setRows(res.data?.data || []);
        setTotal(res.data?.total || 0);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Impossible de charger les personnes');
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, page, stage, urgency, cohort, searchApplied]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const next = {};
    if (stage) next.stage = stage;
    if (urgency) next.urgency = urgency;
    if (cohort) next.cohort = cohort;
    setSearchParams(next, { replace: true });
  }, [stage, urgency, cohort, setSearchParams]);

  const pageCount = Math.max(1, Math.ceil(total / 40));

  return (
    <MainCard
      title={
        <PageHeader
          icon={<GroupsIcon />}
          eyebrow="Accompagnement"
          title="Personnes à accompagner"
          subtitle="Cherchez quelqu’un, filtrez par étape ou urgence, puis ouvrez sa fiche pour noter, changer l’étape ou l’action conseillée."
          color="info"
        />
      }
      secondary={
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading} size="small">
          Actualiser
        </Button>
      }
      sx={{ '& .MuiCardHeader-content': { minWidth: 0 } }}
      contentSX={{ p: { xs: 1.5, sm: 3 } }}
    >
      <Grid container spacing={1.5} sx={{ mt: 1, mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nom, prénom ou téléphone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1);
                  setSearchApplied(search);
                }
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                setPage(1);
                setSearchApplied(search);
              }}
              sx={{ flexShrink: 0 }}
            >
              Chercher
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Étape"
            value={stage}
            onChange={(e) => {
              setPage(1);
              setStage(e.target.value);
            }}
          >
            <MenuItem value="">Toutes</MenuItem>
            {STAGE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Urgence"
            value={urgency}
            onChange={(e) => {
              setPage(1);
              setUrgency(e.target.value);
            }}
          >
            <MenuItem value="">Toutes</MenuItem>
            <MenuItem value="critical">Urgent</MenuItem>
            <MenuItem value="high">Prioritaire</MenuItem>
            <MenuItem value="medium">À suivre</MenuItem>
            <MenuItem value="low">Tranquille</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Groupe"
            value={cohort}
            onChange={(e) => {
              setPage(1);
              setCohort(e.target.value);
            }}
          >
            <MenuItem value="">Tous</MenuItem>
            {Object.entries(COHORT_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {!loading && rows.length === 0 ? (
        <EmptyState
          title="Aucune personne trouvée"
          subtitle="Essayez d’autres filtres, ou initialisez les profils dans Réglages."
          action={
            <Button variant="outlined" onClick={() => navigate('/wekavit/sss/settings')}>
              Aller aux réglages
            </Button>
          }
        />
      ) : (
        <>
          {/* Phones & narrow tablets: one card per person */}
          <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
            {rows.map((profile) => {
              const userId = profile.idUser?._id || profile.idUser;
              return <PersonCard key={profile._id} profile={profile} onOpen={() => navigate(`/wekavit/sss/people/${userId}`)} />;
            })}
          </Stack>

          {/* Tablets landscape & desktop: compact table */}
          <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Personne</TableCell>
                  <TableCell>Étape</TableCell>
                  <TableCell>Santé</TableCell>
                  <TableCell>Urgence</TableCell>
                  <TableCell>Alertes</TableCell>
                  <TableCell>Dernière activité</TableCell>
                  <TableCell align="right">Fiche</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((profile) => {
                  const user = profile.idUser || {};
                  const userId = user._id || profile.idUser;
                  const phone = user.phone;
                  return (
                    <TableRow key={profile._id} hover>
                      <TableCell>
                        <PersonCell user={user} phone={maskPhone(phone)} />
                      </TableCell>
                      <TableCell>
                        <StageChip stage={profile.stage} />
                      </TableCell>
                      <TableCell>
                        <HealthMeter level={profile.healthLevel} score={profile.healthScore} dense />
                      </TableCell>
                      <TableCell>
                        <UrgencyChip urgency={profile.urgency} />
                      </TableCell>
                      <TableCell>
                        <AlertChips alerts={profile.alerts} max={2} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateFr(profile.ledgerSnapshot?.lastActivityAt)}
                        </Typography>
                        {profile.ledgerSnapshot?.daysSinceLastActivity != null && (
                          <Typography variant="caption" color="text.secondary">
                            il y a {profile.ledgerSnapshot.daysSinceLastActivity} j
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {phone && (
                            <>
                              <Tooltip title="Appeler">
                                <IconButton size="small" color="primary" onClick={() => { window.location.href = telHref(phone); }}>
                                  <CallIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="WhatsApp">
                                <IconButton size="small" color="success" onClick={() => window.open(whatsappHref(phone), '_blank', 'noopener')}>
                                  <WhatsAppIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Ouvrir la fiche">
                            <IconButton color="primary" onClick={() => navigate(`/wekavit/sss/people/${userId}`)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              {total} personne{total > 1 ? 's' : ''}
            </Typography>
            <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" size="small" />
          </Stack>
        </>
      )}
    </MainCard>
  );
};

export default PeoplePage;
