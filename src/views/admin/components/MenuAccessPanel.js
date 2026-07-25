import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  SparklesIcon,
  Squares2X2Icon,
  ChevronDownIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import AdminsApi from 'api/admins/admins';
import { ACCESS_PRESETS, getAvatarTone, getInitials } from '../utils/adminUi';

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

const Switch = ({ checked, onChange, label, description }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all ${
      checked
        ? 'border-sss-brand bg-gradient-to-r from-sss-brand-soft to-white shadow-sss-sm'
        : 'border-sss-border bg-white hover:border-sss-brand/25'
    }`}
  >
    <div>
      <div className="flex items-center gap-2">
        <SparklesIcon className={`h-4 w-4 ${checked ? 'text-sss-brand' : 'text-sss-muted'}`} />
        <span className="text-sm font-bold text-sss-text">{label}</span>
      </div>
      {description && <p className="mt-1 text-xs text-sss-muted">{description}</p>}
    </div>
    <span className={`admin-switch ${checked ? 'admin-switch-on' : ''}`}>
      <span className={`admin-switch-knob ${checked ? 'translate-x-5' : ''}`} />
    </span>
  </button>
);

Switch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  description: PropTypes.string
};

const MenuAccessPanel = ({ admin, token, isSuperAdminViewer, onSaved, onBack, showBack }) => {
  const [catalogTree, setCatalogTree] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [makeSuperAdmin, setMakeSuperAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [activePreset, setActivePreset] = useState(null);

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
        setActivePreset(null);
        setOpenGroups({});
      } catch (error) {
        toast.error("Impossible de charger les droits d'accès");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [admin?._id, token, isSuperAdminViewer]);

  const markDirty = (updater) => {
    setSelectedIds(updater);
    setDirty(true);
    setActivePreset(null);
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
    const next = preset.menuIds.filter((id) => allowed.has(id));
    setSelectedIds(next);
    setMakeSuperAdmin(false);
    setDirty(true);
    setActivePreset(preset.id);
  };

  const resetChanges = () => {
    if (!admin?._id) return;
    setLoading(true);
    AdminsApi.getAdminMenuAccess(admin._id, token)
      .then((accessRes) => {
        const access = accessRes?.data?.data || accessRes?.data || {};
        setSelectedIds(access.menuAccess || []);
        setMakeSuperAdmin(Boolean(access.isSuperAdmin));
        setDirty(false);
        setActivePreset(null);
      })
      .finally(() => setLoading(false));
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
      setActivePreset(null);
      toast.success('Droits enregistrés avec succès');
      onSaved?.(payload);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement des droits");
    } finally {
      setSaving(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  if (!isSuperAdminViewer) {
    return (
      <div className="admin-workspace flex min-h-[680px] flex-col items-center justify-center p-10 text-center lg:min-h-[760px]">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-slate-100 text-sss-muted">
          <ShieldCheckIcon className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-sss-text">Espace réservé</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-sss-muted">
          Seuls les super-administrateurs peuvent configurer les droits d&apos;accès aux menus du backoffice.
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="admin-workspace relative flex min-h-[680px] flex-col items-center justify-center overflow-hidden p-10 text-center lg:min-h-[760px]">
        <div className="admin-hero-mesh absolute inset-0 opacity-70" />
        <div className="relative">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-white shadow-sss-lg ring-1 ring-sss-brand/10">
            <Squares2X2Icon className="h-10 w-10 text-sss-brand" />
          </div>
          <h3 className="text-2xl font-bold text-sss-text">Choisissez un profil</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-sss-muted">
            Sélectionnez un administrateur dans la liste pour visualiser sa couverture d&apos;accès et configurer les
            menus visibles dans l&apos;interface.
          </p>
          <div className="mt-6 grid gap-2 text-left sm:grid-cols-3">
            {['Presets métier', 'Sélection fine', 'Super-admin'].map((step, index) => (
              <div key={step} className="rounded-xl border border-sss-border bg-white/85 px-3 py-3 text-xs shadow-sss-sm">
                <p className="font-bold text-sss-brand">0{index + 1}</p>
                <p className="mt-1 font-semibold text-sss-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="admin-workspace relative flex min-h-[680px] flex-col lg:min-h-[760px]">
        <div className="relative overflow-hidden border-b border-sss-border">
          <div className="absolute inset-0 bg-gradient-to-br from-sss-brand via-indigo-600 to-violet-600" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_42%)]" />
          <div className="relative px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-4">
                {showBack && (
                  <button type="button" className="admin-btn-ghost !min-h-10 !bg-white/15 !text-white !ring-white/20 lg:hidden" onClick={onBack}>
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>
                )}
                <div className={`admin-avatar-lg bg-gradient-to-br ${getAvatarTone(admin.email || admin.nom)}`}>
                  {getInitials(admin.nom)}
                </div>
                <div className="min-w-0 text-white">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white/70">Configuration des accès</p>
                  <h2 className="mt-1 truncate text-2xl font-bold">{admin.nom}</h2>
                  <p className="truncate text-sm text-white/85">{admin.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-white/70">Couverture</p>
                  <p className="text-2xl font-bold text-white">{coverage}%</p>
                </div>
                {dirty && (
                  <span className="admin-badge bg-amber-300/20 text-amber-50 ring-1 ring-amber-200/30">Non enregistré</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-sss-border bg-[#fafbfc] px-4 py-4 sm:px-6">
          <Switch
            checked={makeSuperAdmin}
            onChange={(value) => {
              setMakeSuperAdmin(value);
              setDirty(true);
              setActivePreset(null);
            }}
            label="Super-administrateur"
            description="Accès total à tous les menus et à la gestion des droits"
          />
        </div>

        {!makeSuperAdmin && (
          <div className="border-b border-sss-border px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <BoltIcon className="h-4 w-4 text-sss-brand" />
              <p className="text-sm font-bold text-sss-text">Presets rapides</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {ACCESS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`admin-preset-card ${activePreset === preset.id ? 'admin-preset-card-active' : ''}`}
                >
                  <p className="text-sm font-bold text-sss-text">{preset.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-sss-muted">{preset.description}</p>
                  <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-wide text-sss-brand">
                    {preset.menuIds.length} menus
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-b border-sss-border px-4 py-4 sm:px-6">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sss-muted" />
            <input
              className="admin-input !bg-white pl-10"
              placeholder="Filtrer les menus par nom, groupe ou identifiant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={makeSuperAdmin}
            />
          </div>
        </div>

        <div className="admin-dot-grid flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="sss-skeleton h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : makeSuperAdmin ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.2rem] border border-dashed border-sss-brand/25 bg-gradient-to-br from-sss-brand-soft/70 to-white p-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sss-brand text-white shadow-sss-md">
                <SparklesIcon className="h-7 w-7" />
              </div>
              <p className="text-lg font-bold text-sss-text">Accès illimité activé</p>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-sss-muted">
                Ce profil verra l&apos;intégralité du backoffice, y compris la gestion des administrateurs et la
                configuration des droits des autres membres.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedCatalog.map((group) => {
                const visibleSections = group.sections
                  .map((section) => ({
                    ...section,
                    items: section.items.filter((item) => {
                      if (!normalizedSearch) return true;
                      return (
                        item.label?.toLowerCase().includes(normalizedSearch) ||
                        item.menuId?.toLowerCase().includes(normalizedSearch) ||
                        group.group?.toLowerCase().includes(normalizedSearch) ||
                        section.label?.toLowerCase().includes(normalizedSearch)
                      );
                    })
                  }))
                  .filter((section) => section.items.length > 0);

                if (!visibleSections.length) return null;

                const groupIds = visibleSections.flatMap((section) => section.items.map((item) => item.menuId));
                const selectedInGroup = groupIds.filter((id) => selectedIds.includes(id)).length;
                const groupChecked = groupIds.length > 0 && selectedInGroup === groupIds.length;
                const isOpen = openGroups[group.group] ?? normalizedSearch.length > 0;

                return (
                  <div key={group.group} className="admin-accordion">
                    <div className="admin-accordion-trigger">
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpenGroups((prev) => ({ ...prev, [group.group]: !isOpen }))}>
                        <p className="text-sm font-bold text-sss-text">{group.group}</p>
                        <p className="text-xs text-sss-muted">
                          {selectedInGroup}/{groupIds.length} menus sélectionnés
                        </p>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="admin-btn-ghost !min-h-8 !px-3 !py-1 !text-xs"
                          onClick={() => toggleGroup(visibleSections, !groupChecked)}
                        >
                          {groupChecked ? 'Retirer' : 'Tout cocher'}
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-1 text-sss-muted hover:bg-sss-brand-soft"
                          onClick={() => setOpenGroups((prev) => ({ ...prev, [group.group]: !isOpen }))}
                        >
                          <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="space-y-3 border-t border-sss-border bg-[#fafbfc] p-3 sm:p-4">
                        {visibleSections.map((section) => {
                          const sectionIds = section.items.map((item) => item.menuId);
                          const sectionChecked = sectionIds.every((id) => selectedIds.includes(id));

                          return (
                            <div key={`${group.group}-${section.label || 'root'}`} className="rounded-xl border border-sss-border bg-white p-3">
                              {section.label && (
                                <div className="mb-3 flex items-center justify-between gap-2">
                                  <p className="text-xs font-bold uppercase tracking-wide text-sss-muted">{section.label}</p>
                                  <button
                                    type="button"
                                    className="text-xs font-semibold text-sss-brand hover:underline"
                                    onClick={() => toggleSection(section.items, !sectionChecked)}
                                  >
                                    {sectionChecked ? 'Tout retirer' : 'Tout ajouter'}
                                  </button>
                                </div>
                              )}

                              <div className="grid gap-2 md:grid-cols-2">
                                {section.items.map((item) => {
                                  const active = selectedIds.includes(item.menuId);
                                  return (
                                    <button
                                      key={item.menuId}
                                      type="button"
                                      onClick={() => toggleMenu(item.menuId)}
                                      className={`admin-menu-tile text-left ${active ? 'admin-menu-tile-active' : ''}`}
                                    >
                                      <span
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                          active
                                            ? 'border-sss-brand bg-sss-brand text-white'
                                            : 'border-sss-border bg-white text-transparent'
                                        }`}
                                      >
                                        <CheckIcon className="h-3.5 w-3.5" />
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-sss-text">{item.label}</p>
                                        <p className="mt-0.5 truncate text-xs text-sss-muted">{item.path || item.menuId}</p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {dirty && (
        <div className="admin-floating-bar animate-sss-fade-up">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Modifications en attente</p>
            <p className="truncate text-xs text-white/70">
              {makeSuperAdmin ? 'Super-admin activé' : `${selectedIds.length} menu(s) sélectionné(s)`} — pensez à enregistrer
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" className="admin-btn-ghost !border-white/20 !bg-white/10 !text-white hover:!bg-white/15" onClick={resetChanges}>
              <XMarkIcon className="h-4 w-4" />
              Annuler
            </button>
            <button type="button" className="admin-btn-primary !shadow-none" disabled={saving || loading} onClick={handleSave}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

MenuAccessPanel.propTypes = {
  admin: PropTypes.object,
  token: PropTypes.string,
  isSuperAdminViewer: PropTypes.bool,
  onSaved: PropTypes.func,
  onBack: PropTypes.func,
  showBack: PropTypes.bool
};

export default MenuAccessPanel;
