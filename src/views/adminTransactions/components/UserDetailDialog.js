import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  OpenInNew as OpenIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminTransactionsApi from 'api/adminTransactions/adminTransactions';
import { PrimaryButton, GhostButton, SSS_COLORS } from 'views/sss/components/SssLayout';

const formatMoney = (amount, unite) => {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  const n = Number(amount);
  const formatted = n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  return unite ? `${formatted} ${unite}` : formatted;
};

const UserDetailDialog = ({ open, onClose, token, userId, onCreateTransaction }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!open || !token || !userId) return undefined;
    let cancelled = false;
    setLoading(true);
    setUser(null);

    AdminTransactionsApi.getUserBrief(userId, token)
      .then((res) => {
        if (cancelled) return;
        if (res?.status === 200) {
          setUser(res.data?.data || res.data || null);
        } else {
          toast.error(res?.data?.message || 'Impossible de charger le profil');
        }
      })
      .catch((err) => {
        if (!cancelled) toast.error(err?.data?.message || 'Erreur profil utilisateur');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, token, userId]);

  const initials = user
    ? `${(user.prenom || '').charAt(0)}${(user.nom || '').charAt(0)}`.toUpperCase() || '?'
    : '?';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <div className="flex items-start justify-between border-b border-sss-border bg-[#fcfcff] px-5 py-4">
        <div>
          <h3 className="m-0 text-base font-bold text-sss-text">Détails utilisateur</h3>
          <p className="sss-muted m-0 mt-1 text-sm">Profil et soldes wallet pour l’opération.</p>
        </div>
        <IconButton size="small" onClick={onClose} aria-label="Fermer">
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <DialogContent className="!px-5 !py-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <CircularProgress size={28} sx={{ color: SSS_COLORS.brand }} />
          </div>
        ) : !user ? (
          <p className="sss-muted m-0 py-6 text-center text-sm">Aucune donnée</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={user.pictureUrl || user.avatarUrl || (typeof user.picture === 'string' ? user.picture : undefined)}
                sx={{ width: 52, height: 52, bgcolor: SSS_COLORS.brandSoft, color: SSS_COLORS.brand, fontWeight: 800 }}
              >
                {initials}
              </Avatar>
              <div className="min-w-0">
                <p className="m-0 truncate text-base font-bold text-sss-text">{user.displayName}</p>
                <p className="sss-muted m-0 mt-0.5 truncate text-xs font-mono">{user._id}</p>
              </div>
              <Chip
                size="small"
                label={user.active === false ? 'Inactif' : 'Actif'}
                color={user.active === false ? 'default' : 'success'}
                sx={{ ml: 'auto', fontWeight: 700 }}
              />
            </div>

            <div className="grid gap-2 rounded-2xl border border-sss-border bg-white p-3 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <EmailIcon sx={{ fontSize: 18, color: SSS_COLORS.muted, mt: '2px' }} />
                <div>
                  <p className="sss-muted m-0 text-[11px] font-bold uppercase tracking-wide">Email</p>
                  <p className="m-0 break-all text-sm font-semibold text-sss-text">{user.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <PhoneIcon sx={{ fontSize: 18, color: SSS_COLORS.muted, mt: '2px' }} />
                <div>
                  <p className="sss-muted m-0 text-[11px] font-bold uppercase tracking-wide">Téléphone</p>
                  <p className="m-0 text-sm font-semibold text-sss-text">{user.phone || '—'}</p>
                </div>
              </div>
            </div>

            <Divider />

            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <WalletIcon sx={{ fontSize: 18, color: SSS_COLORS.brand }} />
                <p className="m-0 text-sm font-bold text-sss-text">Soldes wallet</p>
              </div>
              {!(user.wallets || []).length ? (
                <p className="sss-muted m-0 text-sm">Aucun solde enregistré</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {user.wallets.map((w) => (
                    <div
                      key={String(w.idDevise || w.unite || Math.random())}
                      className="rounded-xl border border-sss-border bg-[#fafbff] px-3 py-2.5"
                    >
                      <p className="sss-muted m-0 text-[11px] font-bold uppercase">
                        {w.unite || w.name || 'Devise'}
                        {w.local ? ' · locale' : ''}
                      </p>
                      <p className="m-0 mt-0.5 text-base font-extrabold text-sss-text">{formatMoney(w.montant, w.unite)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions className="!flex-wrap !gap-2 !border-t !border-sss-border !px-5 !py-4">
        <GhostButton
          startIcon={<OpenIcon />}
          onClick={() => {
            onClose();
            navigate(`/wekavit/sss/people/${userId}`);
          }}
          disabled={!userId}
        >
          Fiche SSS
        </GhostButton>
        <div className="flex-1" />
        <GhostButton onClick={onClose}>Fermer</GhostButton>
        {onCreateTransaction && (
          <PrimaryButton
            onClick={() => {
              onClose();
              onCreateTransaction(user);
            }}
            disabled={!user}
          >
            Nouvelle opération
          </PrimaryButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

UserDetailDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  token: PropTypes.string,
  userId: PropTypes.string,
  onCreateTransaction: PropTypes.func
};

export default UserDetailDialog;
