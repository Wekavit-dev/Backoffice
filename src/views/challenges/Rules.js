import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  Grid,
  Button,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Edit as EditIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';
import { IconSettings } from '@tabler/icons';
import { toast } from 'react-toastify';

import MainCard from 'ui-component/cards/MainCard';
import SummaryCard from 'views/admin/components/SummaryCard';
import { AppContext } from 'AppContext';
import ChallengesApi from 'api/challenges/challenges';
import EditRuleTemplateModal from './components/EditRuleTemplateModal';
import {
  GAME_MODES,
  RULE_CATEGORY_LABELS,
  VALUE_TYPE_LABELS,
  extractData,
  formatRuleBounds,
  formatRuleValue,
  getGameModeLabel,
  isApiSuccess
} from './utils/challengeUi';

const CATEGORY_COLORS = {
  scoring: 'primary',
  impayes: 'warning',
  disqualification: 'error',
  gameplay: 'info'
};

const ChallengesRulesPage = () => {
  const { globalState } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [gameModes, setGameModes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameModeFilter, setGameModeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRule, setSelectedRule] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  const fetchRules = useCallback(async () => {
    if (!globalState?.key) return;
    setLoading(true);
    try {
      const params = {};
      if (gameModeFilter !== 'all') params.gameMode = gameModeFilter;

      const response = await ChallengesApi.listRuleTemplates(params, globalState.key);
      const data = extractData(response) || response?.data || {};
      const list = Array.isArray(data.templates) ? data.templates : [];
      setTemplates(list);
      setGameModes(Array.isArray(data.gameModes) ? data.gameModes : []);

      setSelectedRule((prev) => {
        if (!list.length) return null;
        if (prev) {
          const still = list.find((item) => item.slug === prev.slug);
          return still || list[0];
        }
        return list[0];
      });
    } catch (error) {
      toast.error(error?.data?.error || 'Impossible de charger les règles', { position: 'top-right' });
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [globalState?.key, gameModeFilter]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const categories = useMemo(() => {
    return [...new Set(templates.map((item) => item.category).filter(Boolean))];
  }, [templates]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return templates.filter((item) => {
      const matchesSearch =
        !q ||
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        RULE_CATEGORY_LABELS[item.category]?.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: templates.length,
      scoring: templates.filter((t) => t.category === 'scoring').length,
      impayes: templates.filter((t) => t.category === 'impayes').length,
      modes: gameModes.length || GAME_MODES.length
    }),
    [templates, gameModes]
  );

  const handleSelect = (rule) => {
    setSelectedRule(rule);
    setMobileShowDetail(true);
  };

  const handleSaveRule = async (payload) => {
    if (!selectedRule?.slug) return;
    setSaving(true);
    try {
      const res = await ChallengesApi.updateRuleTemplate(selectedRule.slug, payload, globalState?.key);
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Enregistrement impossible', { position: 'top-right' });
        return;
      }
      toast.success('Règle mise à jour', { position: 'top-right' });
      setEditOpen(false);
      await fetchRules();
    } catch (error) {
      toast.error(error?.data?.error || 'Enregistrement impossible', { position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainCard title="Comment fonctionnent les défis">
      <Box>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Chaque règle est expliquée en détail. Cliquez une ligne pour tout lire, puis modifiez si besoin. Les changements
          s’appliquent aux nouveaux réglages de défis.
        </Alert>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Règles" amount={stats.total} icon={<IconSettings />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Points & classement" amount={stats.scoring} icon={<IconSettings />} color="#2e7d32" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Versements manqués" amount={stats.impayes} icon={<IconSettings />} color="#ed6c02" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Types de défis" amount={stats.modes} icon={<IconSettings />} color="#7b1fa2" />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher une règle..."
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

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Type de défi</InputLabel>
            <Select
              value={gameModeFilter}
              label="Type de défi"
              onChange={(e) => setGameModeFilter(e.target.value)}
              startAdornment={<FilterIcon sx={{ mr: 1, fontSize: '1rem', color: 'action.active' }} />}
            >
              <MenuItem value="all">Tous les types</MenuItem>
              {GAME_MODES.map((mode) => (
                <MenuItem key={mode.value} value={mode.value}>
                  {mode.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select value={categoryFilter} label="Catégorie" onChange={(e) => setCategoryFilter(e.target.value)}>
              <MenuItem value="all">Toutes</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {RULE_CATEGORY_LABELS[category] || category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} xl={5} sx={{ display: { xs: mobileShowDetail ? 'none' : 'block', xl: 'block' } }}>
            <TableContainer component={Card}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Règle</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Catégorie</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Valeur</TableCell>
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
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Box sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            Aucune règle trouvée
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((rule) => {
                      const selected = selectedRule?.slug === rule.slug;
                      return (
                        <TableRow
                          key={rule.slug}
                          hover
                          selected={selected}
                          onClick={() => handleSelect(rule)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {rule.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 220, display: 'block' }}>
                              {rule.description}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={RULE_CATEGORY_LABELS[rule.category] || rule.category}
                              color={CATEGORY_COLORS[rule.category] || 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700}>
                              {formatRuleValue(rule)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} xl={7} sx={{ display: { xs: mobileShowDetail ? 'block' : 'none', xl: 'block' } }}>
            <Card sx={{ p: 2.5, minHeight: 420, border: '1px solid', borderColor: 'divider' }}>
              {!selectedRule ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography color="text.secondary">Sélectionnez une règle pour voir tous les détails</Typography>
                </Box>
              ) : (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
                    <Box display="flex" alignItems="flex-start" gap={1}>
                      {mobileShowDetail && (
                        <IconButton size="small" onClick={() => setMobileShowDetail(false)} sx={{ display: { xl: 'none' }, mt: 0.5 }}>
                          <ChevronLeftIcon />
                        </IconButton>
                      )}
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {selectedRule.name}
                        </Typography>
                        <Box display="flex" gap={0.75} mt={1} flexWrap="wrap">
                          <Chip
                            size="small"
                            label={RULE_CATEGORY_LABELS[selectedRule.category] || selectedRule.category}
                            color={CATEGORY_COLORS[selectedRule.category] || 'default'}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={VALUE_TYPE_LABELS[selectedRule.valueType] || selectedRule.valueType}
                          />
                          <Chip
                            size="small"
                            label={selectedRule.isActive !== false ? 'Active' : 'Désactivée'}
                            color={selectedRule.isActive !== false ? 'success' : 'default'}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Tooltip title="Modifier">
                      <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                        Modifier
                      </Button>
                    </Tooltip>
                  </Box>

                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                    {selectedRule.description || 'Aucune description.'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Valeur par défaut
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        {formatRuleValue(selectedRule)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Plage autorisée
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatRuleBounds(selectedRule)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        S’applique aux types de défis
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.75}>
                        {(selectedRule.appliesToModes || []).length === 0 ? (
                          <Chip size="small" label="Tous les types" />
                        ) : (
                          selectedRule.appliesToModes.map((mode) => (
                            <Chip key={mode} size="small" variant="outlined" label={getGameModeLabel(mode)} />
                          ))
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Identifiant technique : <strong>{selectedRule.slug}</strong> — utile pour le support, masqué dans
                        l’expérience utilisateur.
                      </Alert>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>

        <EditRuleTemplateModal
          open={editOpen}
          rule={selectedRule}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSaveRule}
          isSubmitting={saving}
        />
      </Box>
    </MainCard>
  );
};

export default ChallengesRulesPage;
