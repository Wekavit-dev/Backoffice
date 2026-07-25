import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAdminAccess } from 'hooks/useAdminAccess';

const AccessDenied = () => {
  const { defaultPath } = useAdminAccess();

  return (
    <div className="admin-page flex min-h-[70vh] items-center justify-center p-6">
      <div className="admin-glass w-full max-w-lg animate-sss-fade-up p-8 text-center sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/15 to-orange-400/10 text-rose-500 ring-1 ring-rose-500/20">
          <ShieldExclamationIcon className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-sss-text">Accès restreint</h1>
        <p className="mt-3 text-sm leading-relaxed text-sss-muted">
          Vous n&apos;avez pas les droits nécessaires pour consulter cette section. Contactez un super-administrateur si
          vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
        <Link to={defaultPath} className="admin-btn-primary mt-8 inline-flex">
          <ArrowLeftIcon className="h-4 w-4" />
          Retour à mon espace
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
