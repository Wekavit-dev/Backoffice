import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon, UserPlusIcon, EnvelopeIcon, KeyIcon, UserIcon } from '@heroicons/react/24/outline';

const AddAdminModal = ({ open, onClose, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({ nom: '', email: '', password: '' });

  useEffect(() => {
    if (!open) {
      setForm({ nom: '', email: '', password: '' });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form, () => setForm({ nom: '', email: '', password: '' }));
  };

  const passwordStrength = form.password.length >= 10 ? 'Fort' : form.password.length >= 6 ? 'Moyen' : 'Faible';
  const strengthColor =
    passwordStrength === 'Fort' ? 'from-emerald-500 to-teal-500' : passwordStrength === 'Moyen' ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-pink-500';

  return (
    <div className="fixed inset-0 z-[1300] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} aria-label="Fermer" />

      <div className="admin-glass relative w-full max-w-xl animate-sss-fade-up overflow-hidden rounded-t-[1.5rem] sm:rounded-[1.35rem]">
        <div className="relative overflow-hidden border-b border-sss-border px-6 py-5">
          <div className="absolute inset-0 admin-hero-mesh opacity-80" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sss-brand to-indigo-500 text-white shadow-sss-md">
                <UserPlusIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-sss-text">Nouvel administrateur</h3>
                <p className="text-sm text-sss-muted">Créez un compte, puis assignez ses menus</p>
              </div>
            </div>
            <button type="button" className="admin-btn-ghost !min-h-9 !px-3" onClick={onClose}>
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sss-muted">
              <UserIcon className="h-3.5 w-3.5" />
              Nom complet
            </span>
            <input className="admin-input" value={form.nom} onChange={(e) => handleChange('nom', e.target.value)} required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sss-muted">
              <EnvelopeIcon className="h-3.5 w-3.5" />
              Email professionnel
            </span>
            <input
              className="admin-input"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sss-muted">
              <KeyIcon className="h-3.5 w-3.5" />
              Mot de passe temporaire
            </span>
            <input
              className="admin-input"
              type="password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              minLength={6}
            />
            {form.password && (
              <div className="mt-2">
                <div className="mb-1 flex items-center justify-between text-[0.68rem] font-semibold text-sss-muted">
                  <span>Force du mot de passe</span>
                  <span>{passwordStrength}</span>
                </div>
                <div className="admin-progress-track">
                  <div
                    className={`admin-progress-fill bg-gradient-to-r ${strengthColor}`}
                    style={{ width: passwordStrength === 'Fort' ? '100%' : passwordStrength === 'Moyen' ? '66%' : '33%' }}
                  />
                </div>
              </div>
            )}
          </label>

          <div className="rounded-2xl border border-sss-border bg-[#fafbfc] px-4 py-3 text-xs leading-relaxed text-sss-muted">
            Après création, sélectionnez ce profil dans la liste pour lui attribuer des menus ou appliquer un preset métier.
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" className="admin-btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Création en cours...' : 'Créer le profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddAdminModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  isSubmitting: PropTypes.bool
};

export default AddAdminModal;
