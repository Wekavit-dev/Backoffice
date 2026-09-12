import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Clear as ClearIcon,
  OpenInNew as OpenIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminTransactionsApi from 'api/adminTransactions/adminTransactions';
import ConfirmDialog from 'views/challenges/components/ConfirmDialog';
import { PrimaryButton, GhostButton, SSS_COLORS } from 'views/sss/components/SssLayout';
import CreateTransactionDialog from './CreateTransactionDialog';
import UserDetailDialog from './UserDetailDialog';

const etatColor = {
  pending: 'warning',
  validated: 'success',
  rejected: 'error'
};

const etatLabel = {
  pending: 'En attente',
  validated: 'Validé',
  rejected: 'Rejeté'
};

const formatUser = (userId) => {
  if (!userId) return '—';
  if (typeof userId === 'string') return userId.slice(-6);
  const name = [userId.prenom, userId.nom].filter(Boolean).join(' ');
  return name || userId.email || String(userId._id || '').slice(-6);
};

const displayUser = (u) => {
  if (!u) return '';
  return u.displayName || [u.prenom, u.nom].filter(Boolean).join(' ') || u.email || String(u._id || '');
};

const resolveUserId = (row, fallbackUserId) => {
  if (fallbackUserId) return fallbackUserId;
  if (!row?.userId) return null;
  return typeof row.userId === 'string' ? row.userId : row.userId._id;
};

/**
 * Historique + création + validation des transactions wallet (admin).
 * Si lockedUserId est fourni, le filtre user est figé (fiche SSS).
 */
const UserTransactionsPanel = ({ token, lockedUserId, defaultPhone, showUserColumn = true }) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState('all');
  const [etat, setEtat] = useState('all');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialUser, setCreateInitialUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState(null);

  const [confirm, setConfirm] = useState({ open: false, row: null, valid: null });
  const [verifying, setVerifying] = useState(false);

  const effectiveUserId = lockedUserId || selectedUser?._id || undefined;

  useEffect(() => {
    if (!lockedUserId || !token) return;
    AdminTransactionsApi.getUserBrief(lockedUserId, token)
      .then((res) => {
        if (res?.status === 200) {
          setSelectedUser(res.data?.data || res.data || { _id: lockedUserId });
        } else {
          setSelectedUser({ _id: lockedUserId, phone: defaultPhone });
        }
      })
      .catch(() => setSelectedUser({ _id: lockedUserId, phone: defaultPhone }));
  }, [lockedUserId, token, defaultPhone]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = {
        kind,
        etat,
        page: page + 1,
        limit
      };
      if (effectiveUserId) params.userId = effectiveUserId;

      const res = await AdminTransactionsApi.getTransactionHistory(params, token);
      if (res?.status === 200) {
        const payload = res.data || {};
        setRows(payload.data || []);
        setTotal(payload.pagination?.total || 0);
      } else {
        toast.error(res?.data?.message || 'Chargement historique impossible');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || 'Erreur historique');
    } finally {
      setLoading(false);
    }
  }, [token, kind, etat, page, limit, effectiveUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const runUserSearch = async () => {
    const q = searchQuery.trim();
    if (!token || q.length < 2) {
      toast.info('Saisissez au moins 2 caractères');
      return;
    }
    setSearching(true);
    try {
      const res = await AdminTransactionsApi.searchUsers(q, token, 12);
      if (res?.status === 200) {
        setSearchResults(res.data?.data || []);
        if (!(res.data?.data || []).length) toast.info('Aucun utilisateur trouvé');
      } else {
        toast.error(res?.data?.message || 'Recherche impossible');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Erreur recherche');
    } finally {
      setSearching(false);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchQuery('');
    setPage(0);
  };

  const clearSelectedUser = () => {
    if (lockedUserId) return;
    setSelectedUser(null);
    setPage(0);
  };

  const openDetails = (userId) => {
    if (!userId) return;
    setDetailUserId(String(userId));
    setDetailOpen(true);
  };

  const openCreate = (user = null) => {
    setCreateInitialUser(user || selectedUser || null);
    setCreateOpen(true);
  };

  const openVerify = (row, valid) => setConfirm({ open: true, row, valid });

  const handleVerify = async () => {
    const { row, valid } = confirm;
    const userId = resolveUserId(row, effectiveUserId);
    if (!row || !userId) {
      toast.error('Transaction ou user manquant');
      return;
    }

    setVerifying(true);
    try {
      const res = await AdminTransactionsApi.verifyUserTransaction(
        {
          kind: row.kind,
          userId,
          transactionId: row.transactionId,
          valid
        },
        token
      );
      if (res?.status === 200) {
        toast.success(res.data?.message || 'Transaction mise à jour');
        setConfirm({ open: false, row: null, valid: null });
        await load();
      } else {
        toast.error(res?.data?.message || 'Échec validation');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || 'Erreur validation');
    } finally {
      setVerifying(false);
    }
  };

  const onCreateSuccess = async (payload) => {
    const userFromCreate = payload?.user;
    const uid = payload?.userId || userFromCreate?._id || payload?.data?.userId;
    if (!lockedUserId && uid) {
      if (userFromCreate?._id) {
        setSelectedUser(userFromCreate);
      } else {
        try {
          const res = await AdminTransactionsApi.getUserBrief(uid, token);
          if (res?.status === 200) setSelectedUser(res.data?.data || res.data);
          else setSelectedUser({ _id: uid });
        } catch {
          setSelectedUser({ _id: uid });
        }
      }
      setPage(0);
    }
    await load();
  };

  const colSpan = 6 + (showUserColumn && !lockedUserId && !selectedUser ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Recherche utilisateur (page ops) */}
      {!lockedUserId && (
        <div className="rounded-2xl border border-sss-border bg-[#fcfcff] p-4">
          <p className="m-0 text-sm font-bold text-sss-text">Rechercher un utilisateur</p>
          <p className="sss-muted m-0 mt-1 text-xs">Email, nom ou prénom — puis consultez le détail ou filtrez l’historique.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <TextField
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  runUserSearch();
                }
              }}
              placeholder="ex. marie@wekavit.com ou Dupont"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: SSS_COLORS.muted, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searching ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : null
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            />
            <PrimaryButton onClick={runUserSearch} disabled={searching || searchQuery.trim().length < 2}>
              Chercher
            </PrimaryButton>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 max-h-56 overflow-auto rounded-xl border border-sss-border bg-white">
              {searchResults.map((u) => (
                <div
                  key={u._id}
                  className="flex flex-wrap items-center gap-2 border-b border-sss-border px-3 py-2.5 last:border-b-0"
                >
                  <Avatar
                    src={u.pictureUrl || u.avatarUrl || (typeof u.picture === 'string' ? u.picture : undefined)}
                    sx={{ width: 36, height: 36, bgcolor: SSS_COLORS.brandSoft, color: SSS_COLORS.brand, fontWeight: 700 }}
                  >
                    {`${(u.prenom || '').charAt(0)}${(u.nom || '').charAt(0)}`.toUpperCase() || '?'}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-sm font-bold text-sss-text">{displayUser(u)}</p>
                    <p className="sss-muted m-0 truncate text-xs">{u.email || '—'}</p>
                  </div>
                  <GhostButton size="small" startIcon={<ViewIcon />} onClick={() => openDetails(u._id)}>
                    Détails
                  </GhostButton>
                  <PrimaryButton size="small" onClick={() => selectUser(u)}>
                    Sélectionner
                  </PrimaryButton>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Carte utilisateur sélectionné */}
      {selectedUser?._id && (
        <div className="flex flex-col gap-3 rounded-2xl border border-sss-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar
              src={selectedUser.pictureUrl || selectedUser.avatarUrl || (typeof selectedUser.picture === 'string' ? selectedUser.picture : undefined)}
              sx={{ width: 44, height: 44, bgcolor: SSS_COLORS.brandSoft, color: SSS_COLORS.brand, fontWeight: 800 }}
            >
              {`${(selectedUser.prenom || '').charAt(0)}${(selectedUser.nom || '').charAt(0)}`.toUpperCase() || '?'}
            </Avatar>
            <div className="min-w-0">
              <p className="m-0 truncate text-sm font-bold text-sss-text">{displayUser(selectedUser)}</p>
              <p className="sss-muted m-0 truncate text-xs">
                {selectedUser.email || selectedUser._id}
                {selectedUser.phone ? ` · ${selectedUser.phone}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <GhostButton size="small" startIcon={<ViewIcon />} onClick={() => openDetails(selectedUser._id)}>
              Détails
            </GhostButton>
            {!lockedUserId && (
              <GhostButton
                size="small"
                startIcon={<OpenIcon />}
                onClick={() => navigate(`/wekavit/sss/people/${selectedUser._id}`)}
              >
                Fiche SSS
              </GhostButton>
            )}
            {!lockedUserId && (
              <GhostButton size="small" startIcon={<ClearIcon />} onClick={clearSelectedUser}>
                Retirer le filtre
              </GhostButton>
            )}
            <PrimaryButton size="small" startIcon={<AddIcon />} onClick={() => openCreate(selectedUser)}>
              Opération
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Filtres historique */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <TextField
            select
            size="small"
            label="Type"
            value={kind}
            onChange={(e) => {
              setPage(0);
              setKind(e.target.value);
            }}
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="deposit">Dépôts</MenuItem>
            <MenuItem value="withdraw">Retraits</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="État"
            value={etat}
            onChange={(e) => {
              setPage(0);
              setEtat(e.target.value);
            }}
            sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="validated">Validés</MenuItem>
            <MenuItem value="rejected">Rejetés</MenuItem>
          </TextField>
        </div>
        <div className="flex flex-wrap gap-2">
          <GhostButton startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
            Actualiser
          </GhostButton>
          <PrimaryButton startIcon={<AddIcon />} onClick={() => openCreate(null)}>
            Nouvelle opération
          </PrimaryButton>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-sm font-bold text-sss-text">
          Historique des transactions
          {selectedUser ? (
            <span className="sss-muted font-normal"> · {displayUser(selectedUser)}</span>
          ) : (
            <span className="sss-muted font-normal"> · tous les utilisateurs</span>
          )}
        </p>
        <Chip size="small" label={`${total} résultat${total > 1 ? 's' : ''}`} sx={{ fontWeight: 700 }} />
      </div>

      <TableContainer className="overflow-hidden rounded-2xl border border-sss-border bg-white">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: SSS_COLORS.brandSoft }}>
              <TableCell sx={{ fontWeight: 800 }}>Type</TableCell>
              {showUserColumn && !lockedUserId && !selectedUser && (
                <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
              )}
              <TableCell sx={{ fontWeight: 800 }} align="right">
                Montant
              </TableCell>
              <TableCell sx={{ fontWeight: 800 }}>État</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} sx={{ color: SSS_COLORS.brand }} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 5, color: SSS_COLORS.muted }}>
                  Aucune transaction
                  {!effectiveUserId ? ' — sélectionnez un utilisateur ou créez une opération' : ''}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const rowUserId = resolveUserId(row, effectiveUserId);
                return (
                  <TableRow key={`${row.kind}-${row.transactionId}`} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.kind === 'deposit' ? 'Dépôt' : 'Retrait'}
                        sx={{ fontWeight: 700 }}
                        color={row.kind === 'deposit' ? 'primary' : 'secondary'}
                        variant="outlined"
                      />
                    </TableCell>
                    {showUserColumn && !lockedUserId && !selectedUser && (
                      <TableCell>
                        <button
                          type="button"
                          className="border-0 bg-transparent p-0 text-left text-sm font-semibold text-sss-text underline-offset-2 hover:underline"
                          onClick={() => openDetails(rowUserId)}
                        >
                          {formatUser(row.userId)}
                        </button>
                      </TableCell>
                    )}
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {row.montant ?? row.balanceAmount ?? '—'} {row.unite || ''}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={etatLabel[row.etat] || row.etat || 'pending'}
                        color={etatColor[row.etat] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-sss-muted">
                        {row.source || 'user'}
                        {row.createdByRole ? ` · ${row.createdByRole}` : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-sss-muted">{row.date || '—'}</span>
                    </TableCell>
                    <TableCell align="right">
                      {rowUserId && (
                        <Tooltip title="Détails user">
                          <IconButton size="small" onClick={() => openDetails(rowUserId)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(row.etat || 'pending') === 'pending' && (
                        <>
                          <Tooltip title="Valider">
                            <IconButton size="small" color="success" onClick={() => openVerify(row, 'validated')}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rejeter">
                            <IconButton size="small" color="error" onClick={() => openVerify(row, 'rejected')}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={limit}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Lignes"
        />
      </TableContainer>

      <CreateTransactionDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateInitialUser(null);
        }}
        token={token}
        initialUser={createInitialUser}
        lockedUserId={lockedUserId}
        defaultPhone={defaultPhone || selectedUser?.phone}
        onSuccess={onCreateSuccess}
      />

      <UserDetailDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailUserId(null);
        }}
        token={token}
        userId={detailUserId}
        onCreateTransaction={(user) => {
          if (user?._id && !lockedUserId) selectUser(user);
          openCreate(user);
        }}
      />

      <ConfirmDialog
        open={confirm.open}
        title={confirm.valid === 'validated' ? 'Valider la transaction ?' : 'Rejeter la transaction ?'}
        message={
          confirm.valid === 'validated'
            ? 'Le wallet de l’utilisateur sera mis à jour immédiatement.'
            : 'La transaction sera marquée comme rejetée. Aucun mouvement de solde.'
        }
        confirmLabel={confirm.valid === 'validated' ? 'Valider' : 'Rejeter'}
        confirmColor={confirm.valid === 'validated' ? 'success' : 'error'}
        loading={verifying}
        onCancel={() => !verifying && setConfirm({ open: false, row: null, valid: null })}
        onConfirm={handleVerify}
      />
    </div>
  );
};

UserTransactionsPanel.propTypes = {
  token: PropTypes.string,
  lockedUserId: PropTypes.string,
  defaultPhone: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showUserColumn: PropTypes.bool
};

export default UserTransactionsPanel;
