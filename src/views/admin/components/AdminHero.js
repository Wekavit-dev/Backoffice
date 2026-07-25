import React from 'react';
import PropTypes from 'prop-types';
import { UserPlusIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

const AdminHero = ({ stats, isSuperAdmin, onAdd }) => {
  return (
    <section className="admin-hero admin-hero-mesh mb-6 p-6 sm:p-8">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sss-brand/10 blur-3xl" />
      <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sss-brand/15 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-sss-brand shadow-sss-sm backdrop-blur">
            <ShieldCheckIcon className="h-4 w-4" />
            Centre de contrôle
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-sss-text sm:text-4xl">
            Administrateurs & droits d&apos;accès
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sss-muted sm:text-base">
            Pilotez qui voit quoi dans le backoffice. Assignez des menus par profil, appliquez des presets métier et
            gardez une vue claire sur la couverture d&apos;accès de chaque membre.
          </p>

          {!isSuperAdmin && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              <SparklesIcon className="h-4 w-4" />
              Mode lecture seule — la configuration des droits est réservée aux super-administrateurs.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="admin-stat-pill min-w-[88px]">
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-sss-muted">Équipe</p>
              <p className="mt-1 text-2xl font-bold text-sss-text">{stats.total}</p>
            </div>
            <div className="admin-stat-pill min-w-[88px]">
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-sss-muted">Vérifiés</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.verified}</p>
            </div>
            <div className="admin-stat-pill min-w-[88px]">
              <p className="text-[0.65rem] font-bold uppercase tracking-wide text-sss-muted">En ligne</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{stats.connected}</p>
            </div>
          </div>

          {isSuperAdmin && (
            <button type="button" className="admin-btn-primary !min-h-11 whitespace-nowrap" onClick={onAdd}>
              <UserPlusIcon className="h-4 w-4" />
              Nouvel admin
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

AdminHero.propTypes = {
  stats: PropTypes.object.isRequired,
  isSuperAdmin: PropTypes.bool,
  onAdd: PropTypes.func
};

export default AdminHero;