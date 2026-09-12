import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  PersonSearch as PersonSearchIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import AdminTransactionsApi from 'api/adminTransactions/adminTransactions';
import { PrimaryButton, GhostButton, SSS_COLORS } from 'views/sss/components/SssLayout';

const emptyForm = {
  kind: 'deposit',
  montant: '',
  idDevise: '',
  codeTransaction: '',
  telephone: '',
  note: '',
  autoValidate: false
};

const displayUser = (u) => {
  if (!u) return '';
  return u.displayName || [u.prenom, u.nom].filter(Boolean).join(' ') || u.email || String(u._id || '');
};

const CreateTransactionDialog = ({ open, onClose, token, initialUser, lockedUserId, defaultPhone, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [devises, setDevises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDevises, setLoadingDevises] = useState(false);

  const userLocked = Boolean(lockedUserId || initialUser?._id);

  useEffect(() => {
    if (!open) return;

    setForm({ ...emptyForm, telephone: defaultPhone || initialUser?.phone || '' });
    setQuery('');
    setResults([]);

    if (initialUser?._id) {
      setSelectedUser(initialUser);
      setStep(2);
    } else if (lockedUserId) {
      setSelectedUser({ _id: lockedUserId, phone: defaultPhone });
      setStep(2);
      if (token) {
        AdminTransactionsApi.getUserBrief(lockedUserId, token)
          .then((res) => {
            if (res?.status === 200) {
              const u = res.data?.data || res.data;
              if (u) {
                setSelectedUser(u);
                setForm((prev) => ({ ...prev, telephone: u.phone || defaultPhone || '' }));
              }
            }
          })
          .catch(() => {});
      }
    } else {
      setSelectedUser(null);
      setStep(1);
    }

    if (!token) return;
    setLoadingDevises(true);
    AdminTransactionsApi.getDevises(token)
      .then((res) => {
        const list = res?.data?.data || res?.data || [];
        setDevises(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error('Impossible de charger les devises (CHALLENGE_IP)'))
      .finally(() => setLoadingDevises(false));
  }, [open, token, lockedUserId, initialUser, defaultPhone]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const runSearch = async (value = query) => {
    const q = String(value || '').trim();
    if (!token || q.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await AdminTransactionsApi.searchUsers(q, token, 12);
      if (res?.status === 200) {
        setResults(res.data?.data || []);
      } else {
        toast.error(res?.data?.message || 'Recherche impossible');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur recherche utilisateur');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
    }
  };

  const pickUser = (user) => {
    setSelectedUser(user);
    setForm((prev) => ({
      ...prev,
      telephone: user.phone || defaultPhone || prev.telephone || ''
    }));
    setStep(2);
  };

  const handleSubmit = async () => {
    const userId = selectedUser?._id || lockedUserId;
    if (!userId) {
      toast.error('Sélectionnez un utilisateur');
      setStep(1);
      return;
    }
    if (!form.montant || Number(form.montant) <= 0) {
      toast.error('Montant invalide');
      return;
    }
    if (!form.idDevise) {
      toast.error('Sélectionnez une devise');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        kind: form.kind,
        userId,
        montant: Number(form.montant),
        idDevise: form.idDevise,
        note: form.note || undefined,
        autoValidate: Boolean(form.autoValidate)
      };
      if (form.kind === 'deposit' && form.codeTransaction) {
        payload.codeTransaction = form.codeTransaction;
      }
      if (form.kind === 'withdraw' && form.telephone) {
        payload.telephone = form.telephone;
      }

      const res = await AdminTransactionsApi.createUserTransaction(payload, token);
      if (res?.status === 201 || res?.status === 200) {
        toast.success(res.data?.message || 'Transaction créée');
        onSuccess?.({
          ...(res.data || {}),
          user: selectedUser,
          userId
        });
        onClose();
      } else {
        toast.error(res?.data?.message || 'Échec de la création');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const initials = selectedUser
    ? `${(selectedUser.prenom || '').charAt(0)}${(selectedUser.nom || '').charAt(0)}`.toUpperCase() || '?'
    : '?';

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogContent className="!p-0">
        <div className="border-b border-sss-border bg-[#fcfcff] px-5 py-4">
          <div className="flex items-center gap-2">
            {step === 2 && !userLocked && (
              <IconButton
                size="small"
                onClick={() => setStep(1)}
                disabled={loading}
                aria-label="Retour recherche"
              >
                <BackIcon fontSize="small" />
              </IconButton>
            )}
            <div>
              <h3 className="m-0 text-base font-bold text-sss-text">
                {step === 1 ? 'Trouver l’utilisateur' : 'Nouvelle opération wallet'}
              </h3>
              <p className="sss-muted m-0 mt-1 text-sm">
                {step === 1
                  ? 'Recherchez par email, nom ou prénom, puis créez le dépôt ou le retrait.'
                  : 'La transaction apparaîtra dans l’historique de l’utilisateur.'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                step === 1 ? 'bg-[#eeeefb] text-[#5b5bd6]' : 'bg-[#f2f4f7] text-[#667085]'
              }`}
            >
              1 · Utilisateur
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                step === 2 ? 'bg-[#eeeefb] text-[#5b5bd6]' : 'bg-[#f2f4f7] text-[#667085]'
              }`}
            >
              2 · Transaction
            </span>
          </div>
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-3 px-5 py-4">
            <TextField
              fullWidth
              autoFocus
              label="Email, nom ou prénom"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="ex. jean@mail.com ou Dupont"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: SSS_COLORS.muted }} />
                  </InputAdornment>
                ),
                endAdornment: searching ? (
                  <InputAdornment position="end">
                    <CircularProgress size={18} />
                  </InputAdornment>
                ) : null
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <PrimaryButton onClick={() => runSearch()} disabled={searching || query.trim().length < 2}>
              Rechercher
            </PrimaryButton>

            <div className="max-h-72 overflow-auto rounded-2xl border border-sss-border">
              {!results.length ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <PersonSearchIcon sx={{ fontSize: 36, color: SSS_COLORS.muted }} />
                  <p className="sss-muted m-0 text-sm">
                    {query.trim().length < 2
                      ? 'Saisissez au moins 2 caractères pour lancer la recherche.'
                      : searching
                        ? 'Recherche…'
                        : 'Aucun résultat. Essayez l’email exact.'}
                  </p>
                </div>
              ) : (
                results.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => pickUser(u)}
                    className="flex w-full items-center gap-3 border-b border-sss-border px-3 py-3 text-left transition hover:bg-[#f7f8fc] last:border-b-0"
                  >
                    <Avatar
                      src={u.pictureUrl || u.avatarUrl || (typeof u.picture === 'string' ? u.picture : undefined)}
                      sx={{ width: 40, height: 40, bgcolor: SSS_COLORS.brandSoft, color: SSS_COLORS.brand, fontWeight: 700 }}
                    >
                      {`${(u.prenom || '').charAt(0)}${(u.nom || '').charAt(0)}`.toUpperCase() || '?'}
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-bold text-sss-text">{displayUser(u)}</p>
                      <p className="sss-muted m-0 truncate text-xs">{u.email || '—'}</p>
                    </div>
                    {u.phone && <span className="hidden text-xs text-sss-muted sm:inline">{u.phone}</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-5 py-4">
            {selectedUser && (
              <div className="flex items-center gap-3 rounded-2xl border border-sss-border bg-[#fafbff] px-3 py-2.5">
                <Avatar
                  src={selectedUser.pictureUrl || selectedUser.avatarUrl || (typeof selectedUser.picture === 'string' ? selectedUser.picture : undefined)}
                  sx={{ width: 40, height: 40, bgcolor: SSS_COLORS.brandSoft, color: SSS_COLORS.brand, fontWeight: 700 }}
                >
                  {initials}
                </Avatar>
                <div className="min-w-0">
                  <p className="m-0 truncate text-sm font-bold text-sss-text">{displayUser(selectedUser)}</p>
                  <p className="sss-muted m-0 truncate text-xs">{selectedUser.email || selectedUser._id}</p>
                </div>
              </div>
            )}

            <TextField
              select
              fullWidth
              label="Type"
              value={form.kind}
              onChange={(e) => setField('kind', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="deposit">Dépôt</MenuItem>
              <MenuItem value="withdraw">Retrait</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="number"
              label="Montant"
              value={form.montant}
              onChange={(e) => setField('montant', e.target.value)}
              inputProps={{ min: 0, step: 'any' }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              select
              fullWidth
              label="Devise"
              value={form.idDevise}
              onChange={(e) => setField('idDevise', e.target.value)}
              disabled={loadingDevises}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {devises.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.unite || d.name || d._id}
                  {d.local ? ' (locale)' : ''}
                </MenuItem>
              ))}
            </TextField>

            {form.kind === 'deposit' && (
              <TextField
                fullWidth
                label="Code transaction (optionnel)"
                value={form.codeTransaction}
                onChange={(e) => setField('codeTransaction', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}

            {form.kind === 'withdraw' && (
              <TextField
                fullWidth
                label="Téléphone retrait"
                value={form.telephone}
                onChange={(e) => setField('telephone', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Note (audit)"
              value={form.note}
              onChange={(e) => setField('note', e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.autoValidate}
                  onChange={(e) => setField('autoValidate', e.target.checked)}
                  sx={{ color: SSS_COLORS.brand, '&.Mui-checked': { color: SSS_COLORS.brand } }}
                />
              }
              label="Valider immédiatement (crédite / débite le wallet)"
            />
          </div>
        )}
      </DialogContent>

      <DialogActions className="!border-t !border-sss-border !px-5 !py-4">
        <GhostButton onClick={onClose} disabled={loading}>
          Annuler
        </GhostButton>
        {step === 2 && (
          <PrimaryButton
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {form.autoValidate ? 'Créer et valider' : 'Créer (en attente)'}
          </PrimaryButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

CreateTransactionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  token: PropTypes.string,
  initialUser: PropTypes.object,
  lockedUserId: PropTypes.string,
  defaultPhone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func
};

export default CreateTransactionDialog;
