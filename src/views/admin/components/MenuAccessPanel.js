import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Skeleton,
  Alert,
  Grid,
  Paper,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Shield as ShieldIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import AdminsApi from 'api/admins/admins';
import { ACCESS_PRESETS, getAvatarBgColor, getInitials } from '../utils/adminUi';

const groupItems = (catalogTree = []) => {
  return catalogTree.map((group) => {
    const sectionMap = new Map();

    (group.items || []).forEach((item) => {
      const sectionKey = item.sectionLabel || '__root__';
      if (!sectionMap.has(sectionKey)) {
        sectionMap.set(sectionKey, { label: item.sectionLabel || null, items: [] });
      }
      sectionMap.get(sectionKey).items.push(item);
    });

    (group.sections || []).forEach((section) => {
      if (!sectionMap.has(section.label)) {
        sectionMap.set(section.label, { label: section.label, items: section.children || [] });
      }
    });

    return {
      group: group.group,
      sections: Array.from(sectionMap.values()).filter((section) => section.items.length > 0)
    };
  });
};

const MenuAccessPanel = ({ admin, token, isSuperAdminViewer, onSaved }) => {
  const [catalogTree, setCatalogTree] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [makeSuperAdmin, setMakeSuperAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const groupedCatalog = useMemo(() => groupItems(catalogTree), [catalogTree]);

  const allMenuIds = useMemo(() => {
    const ids = [];
    groupedCatalog.forEach((group) => {
      group.sections.forEach((section) => {
        section.items.forEach((item) => ids.push(item.menuId));
      });
    });
    return ids;
  }, [groupedCatalog]);

  const coverage = useMemo(() => {
    if (makeSuperAdmin) return 100;
    if (!allMenuIds.length) return 0;
    return Math.round((selectedIds.length / allMenuIds.length) * 100);
  }, [makeSuperAdmin, selectedIds, allMenuIds]);

  useEffect(() => {
    if (!admin?._id || !token || !isSuperAdminViewer) return;

    const load = async () => {
      setLoading(true);
      try {
        const [catalogRes, accessRes] = await Promise.all([
          AdminsApi.getMenuCatalog(token),
          AdminsApi.getAdminMenuAccess(admin._id, token)
        ]);

        const tree = catalogRes?.data?.data?.tree || catalogRes?.data?.tree || [];
        const access = accessRes?.data?.data || accessRes?.data || {};

        setCatalogTree(tree);
        setSelectedIds(access.menuAccess || []);
        setMakeSuperAdmin(Boolean(access.isSuperAdmin));
        setDirty(false);
        setExpandedGroups({});
      } catch (error) {
        toast.error("Impossible de charger les droits d'accès", { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [admin?._id, token, isSuperAdminViewer]);

  const markDirty = (updater) => {
    setSelectedIds(updater);
    setDirty(true);
  };

  const toggleMenu = (menuId) => {
    markDirty((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]));
  };

  const toggleSection = (items, checked) => {
    const ids = items.map((item) => item.menuId);
    markDirty((prev) => (checked ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id))));
  };

  const toggleGroup = (sections, checked) => {
    const ids = sections.flatMap((section) => section.items.map((item) => item.menuId));
    markDirty((prev) => (checked ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id))));
  };

  const applyPreset = (preset) => {
    const allowed = new Set(allMenuIds);
    setSelectedIds(preset.menuIds.filter((id) => allowed.has(id)));
    setMakeSuperAdmin(false);
    setDirty(true);
  };

  const resetChanges = async () => {
    if (!admin?._id) return;
    setLoading(true);
    try {
      const accessRes = await AdminsApi.getAdminMenuAccess(admin._id, token);
      const access = accessRes?.data?.data || accessRes?.data || {};
      setSelectedIds(access.menuAccess || []);
      setMakeSuperAdmin(Boolean(access.isSuperAdmin));
      setDirty(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!admin?._id) return;
    setSaving(true);
    try {
      const res = await AdminsApi.updateAdminMenuAccess(
        admin._id,
        { menuIds: makeSuperAdmin ? allMenuIds : selectedIds, isSuperAdmin: makeSuperAdmin },
        token
      );
      const payload = res?.data?.data || res?.data || {};
      setSelectedIds(payload.menuAccess || selectedIds);
      setMakeSuperAdmin(Boolean(payload.isSuperAdmin));
      setDirty(false);
      toast.success('Droits enregistrés avec succès', { position: 'top-right' });
      onSaved?.(payload);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement", { position: 'top-right' });
    } finally {
      setSaving(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  if (!isSuperAdminViewer) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <ShieldIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Espace réservé
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Seuls les super-administrateurs peuvent configurer les droits d&apos;accès.
        </Typography>
      </Box>
    );
  }

  if (!admin) {
    return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <SettingsIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" gutterBottom>
          Sélectionnez un administrateur
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
          Cliquez sur une ligne du tableau pour configurer les menus visibles dans le backoffice.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>
      {/* Profil sélectionné */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: getAvatarBgColor(admin.email || admin.nom),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            {getInitials(admin.nom)}
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              {admin.nom}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {admin.email}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 100, textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Couverture
            </Typography>
            <Typography variant="h6" color="primary.main" fontWeight={700}>
              {coverage}%
            </Typography>
          </Box>
        </Box>
        <LinearProgress
          variant="determinate"
          value={coverage}
          sx={{ mt: 1.5, height: 5, borderRadius: 3 }}
        />
      </Box>

      {/* Super-admin toggle */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <FormControlLabel
          control={
            <Switch
              checked={makeSuperAdmin}
              onChange={(e) => {
                setMakeSuperAdmin(e.target.checked);
                setDirty(true);
              }}
              color="secondary"
            />
          }
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Super-administrateur
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Accès complet à tous les menus et à la gestion des droits
              </Typography>
            </Box>
          }
        />
      </Box>

      {!makeSuperAdmin && (
        <>
          {/* Presets */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <BoltIcon color="primary" sx={{ fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Presets rapides
              </Typography>
            </Box>
            <Grid container spacing={1.5}>
              {ACCESS_PRESETS.map((preset) => (
                <Grid item xs={12} sm={6} key={preset.id}>
                  <Paper
                    variant="outlined"
                    onClick={() => applyPreset(preset)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {preset.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {preset.description}
                    </Typography>
                    <Chip label={`${preset.menuIds.length} menus`} size="small" sx={{ mt: 1 }} />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Search */}
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Filtrer les menus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </>
      )}

      {/* Menu groups */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2, maxHeight: 360 }}>
        {loading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : makeSuperAdmin ? (
          <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2 }}>
            Accès total activé — ce profil verra l&apos;intégralité des menus du backoffice.
          </Alert>
        ) : (
          groupedCatalog.map((group) => {
            const visibleSections = group.sections
              .map((section) => ({
                ...section,
                items: section.items.filter((item) => {
                  if (!normalizedSearch) return true;
                  return (
                    item.label?.toLowerCase().includes(normalizedSearch) ||
                    item.menuId?.toLowerCase().includes(normalizedSearch) ||
                    group.group?.toLowerCase().includes(normalizedSearch)
                  );
                })
              }))
              .filter((section) => section.items.length > 0);

            if (!visibleSections.length) return null;

            const groupIds = visibleSections.flatMap((s) => s.items.map((i) => i.menuId));
            const selectedInGroup = groupIds.filter((id) => selectedIds.includes(id)).length;
            const groupChecked = groupIds.length > 0 && selectedInGroup === groupIds.length;
            const isExpanded = expandedGroups[group.group] ?? Boolean(normalizedSearch);

            return (
              <Accordion
                key={group.group}
                expanded={isExpanded}
                onChange={() => setExpandedGroups((prev) => ({ ...prev, [group.group]: !isExpanded }))}
                sx={{ mb: 1, '&:before': { display: 'none' }, borderRadius: '8px !important', overflow: 'hidden' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" pr={1}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {group.group}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedInGroup}/{groupIds.length} menus
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGroup(visibleSections, !groupChecked);
                      }}
                      sx={{ mr: 1, minWidth: 'auto', px: 1.5, py: 0.25, fontSize: '0.7rem' }}
                    >
                      {groupChecked ? 'Retirer' : 'Tout'}
                    </Button>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  {visibleSections.map((section) => {
                    const sectionIds = section.items.map((i) => i.menuId);
                    const sectionChecked = sectionIds.every((id) => selectedIds.includes(id));

                    return (
                      <Box key={section.label || 'root'} sx={{ mb: 2 }}>
                        {section.label && (
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                              {section.label}
                            </Typography>
                            <Button size="small" onClick={() => toggleSection(section.items, !sectionChecked)}>
                              {sectionChecked ? 'Retirer' : 'Ajouter'}
                            </Button>
                          </Box>
                        )}
                        <Grid container spacing={1}>
                          {section.items.map((item) => {
                            const active = selectedIds.includes(item.menuId);
                            return (
                              <Grid item xs={12} sm={6} key={item.menuId}>
                                <Paper
                                  variant="outlined"
                                  onClick={() => toggleMenu(item.menuId)}
                                  sx={{
                                    p: 1.25,
                                    cursor: 'pointer',
                                    borderColor: active ? 'primary.main' : 'divider',
                                    bgcolor: active ? 'primary.50' : 'background.paper',
                                    transition: 'all 0.15s',
                                    '&:hover': { borderColor: 'primary.light', bgcolor: active ? 'primary.100' : 'grey.50' }
                                  }}
                                >
                                  <Typography variant="body2" fontWeight={active ? 600 : 400} noWrap>
                                    {item.label}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                                    {item.path || item.menuId}
                                  </Typography>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            );
          })
        )}
      </Box>

      {/* Footer actions — pattern growth filter actions */}
      {dirty && (
        <>
          <Divider />
          <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" color="text.secondary">
              {makeSuperAdmin ? 'Super-admin activé' : `${selectedIds.length} menu(s) sélectionné(s)`} — non enregistré
            </Typography>
            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small" onClick={resetChanges} disabled={loading}>
                Annuler
              </Button>
              <Button variant="contained" size="small" onClick={handleSave} disabled={saving || loading}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

MenuAccessPanel.propTypes = {
  admin: PropTypes.object,
  token: PropTypes.string,
  isSuperAdminViewer: PropTypes.bool,
  onSaved: PropTypes.func
};

export default MenuAccessPanel;
