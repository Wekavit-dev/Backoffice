import React from 'react';
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getAvatarTone, getInitials, getMenuCoverage } from '../utils/adminUi';

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'verified', label: 'Vérifiés' },
  { id: 'super', label: 'Super-admins' },
  { id: 'online', label: 'En ligne' }
];

const AdminTeamList = ({
  admins,
  loading,
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  selectedAdmin,
  onSelect,
  totalMenus
}) => {
  return (
    <aside className="admin-workspace flex h-full min-h-[680px] flex-col lg:min-h-[760px]">
      <div className="admin-panel-header px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-sss-muted">Équipe</p>
            <h2 className="text-lg font-bold text-sss-text">Profils administrateurs</h2>
          </div>
          <span className="admin-badge bg-sss-brand-soft text-sss-brand">{admins.length}</span>
        </div>

        <div className="relative mt-4">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sss-muted" />
          <input
            className="admin-input !bg-[#fafbfc] pl-10"
            placeholder="Rechercher un nom ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFilterChange(item.id)}
              className={`admin-filter-chip ${filter === item.id ? 'admin-filter-chip-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-dot-grid flex-1 overflow-y-auto p-3 sm:p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="sss-skeleton h-[92px] w-full rounded-2xl" />
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-sss-border bg-white/70 p-8 text-center">
            <p className="text-sm font-bold text-sss-text">Aucun profil trouvé</p>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-sss-muted">
              Ajustez vos filtres ou créez un nouvel administrateur pour commencer la configuration des accès.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {admins.map((admin) => {
              const active = selectedAdmin?._id === admin._id;
              const coverage = getMenuCoverage(admin, totalMenus);

              return (
                <button
                  key={admin._id}
                  type="button"
                  onClick={() => onSelect(admin)}
                  className={`group w-full rounded-2xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                    active
                      ? 'border-sss-brand bg-gradient-to-r from-sss-brand-soft via-white to-white shadow-sss-md ring-1 ring-sss-brand/15'
                      : 'border-sss-border bg-white/90 hover:-translate-y-0.5 hover:border-sss-brand/25 hover:shadow-sss-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`admin-avatar bg-gradient-to-br ${getAvatarTone(admin.email || admin.nom)}`}>
                      {getInitials(admin.nom)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-sss-text">{admin.nom}</p>
                          <p className="truncate text-xs text-sss-muted">{admin.email}</p>
                        </div>
                        <ChevronRightIcon
                          className={`h-4 w-4 shrink-0 text-sss-muted transition-transform ${
                            active ? 'translate-x-0.5 text-sss-brand' : 'group-hover:translate-x-0.5'
                          }`}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {admin.isSuperAdmin && (
                          <span className="admin-badge bg-violet-100 text-violet-700">Super-admin</span>
                        )}
                        <span
                          className={`admin-badge ${
                            admin.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {admin.verified ? 'Vérifié' : 'En attente'}
                        </span>
                        {admin.connected && (
                          <span className="admin-badge bg-sky-50 text-sky-700">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
                            En ligne
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-[0.68rem] font-semibold text-sss-muted">
                          <span>Couverture menus</span>
                          <span>{admin.isSuperAdmin ? '100%' : `${coverage}%`}</span>
                        </div>
                        <div className="admin-progress-track">
                          <div className="admin-progress-fill" style={{ width: `${coverage}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

AdminTeamList.propTypes = {
  admins: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  filter: PropTypes.string,
  onFilterChange: PropTypes.func,
  selectedAdmin: PropTypes.object,
  onSelect: PropTypes.func,
  totalMenus: PropTypes.number
};

export default AdminTeamList;
