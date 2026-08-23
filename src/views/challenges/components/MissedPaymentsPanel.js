import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Skeleton,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as CheckIcon,
  Undo as UndoIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ChallengesApi from 'api/challenges/challenges';
import ConfirmDialog from './ConfirmDialog';
import {
  formatDate,
  formatDateTime,
  getMemberDisplayName,
  isApiSuccess
} from '../utils/challengeUi';

const MissedPaymentsPanel = ({ challenge, token }) => {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [items, setItems] = useState([]);
  const [waivingId, setWaivingId] = useState(null);
  const [itemToWaive, setItemToWaive] = useState(null);

  const loadMissed = useCallback(async () => {
    if (!challenge?._id || !token) return;
    setLoading(true);
    try {
      const res = await ChallengesApi.getMissedPayments(challenge._id, token);
      const list = res?.data?.data ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error?.data?.error || 'Impossible de charger les versements manqués', { position: 'top-right' });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [challenge?._id, token]);

  useEffect(() => {
    loadMissed();
  }, [loadMissed]);

  const stats = useMemo(() => {
    const open = items.filter((item) => !item.waived).length;
    const waived = items.filter((item) => item.waived).length;
    return { open, waived, total: items.length };
  }, [items]);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await ChallengesApi.checkMissedPayments(challenge._id, token);
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Vérification impossible', { position: 'top-right' });
        return;
      }
      const result = res?.data?.data;
      toast.success(
        result
          ? `Vérification terminée${result.detected != null ? ` — ${result.detected} nouveau(x)` : ''}`
          : 'Vérification terminée',
        { position: 'top-right' }
      );
      await loadMissed();
    } catch (error) {
      toast.error(error?.data?.error || 'Vérification impossible', { position: 'top-right' });
    } finally {
      setChecking(false);
    }
  };

  const handleWaive = async (item) => {
    setWaivingId(item.missedPaymentId);
    try {
      const res = await ChallengesApi.waiveMissedPayment(
        challenge._id,
        item.userId,
        { missedPaymentId: item.missedPaymentId },
        token
      );
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Annulation impossible', { position: 'top-right' });
        return;
      }
      toast.success('Versement manqué annulé', { position: 'top-right' });
      await loadMissed();
    } catch (error) {
      toast.error(error?.data?.error || 'Annulation impossible', { position: 'top-right' });
    } finally {
      setWaivingId(null);
      setItemToWaive(null);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={36} sx={{ mb: 2 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Versements manqués
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stats.open} en attente · {stats.waived} annulé{stats.waived > 1 ? 's' : ''} · {stats.total} au total
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button size="small" startIcon={<RefreshIcon />} variant="outlined" onClick={loadMissed}>
            Actualiser
          </Button>
          <Button
            size="small"
            startIcon={<CheckIcon />}
            variant="contained"
            onClick={handleCheck}
            disabled={checking}
          >
            {checking ? 'Vérification...' : 'Lancer une vérification'}
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
        Un versement manqué apparaît quand un participant n’a pas payé à la date prévue (modes à échéances). Vous pouvez
        l’annuler pour retirer la pénalité.
      </Alert>

      {items.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Aucun versement manqué pour ce défi.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Participant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Échéance</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Détecté le</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pénalité</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={String(item.missedPaymentId)} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {getMemberDisplayName(item.user)}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(item.dueDate)}</TableCell>
                  <TableCell>{formatDateTime(item.detectedAt)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      −{item.scorePenaltyApplied || 0} pts
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.waived ? 'Annulé' : 'À traiter'}
                      color={item.waived ? 'default' : 'warning'}
                    />
                    {item.waived && item.waivedAt && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        le {formatDate(item.waivedAt)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!item.waived && (
                      <Tooltip title="Annuler ce manquement">
                        <span>
                          <Button
                            size="small"
                            startIcon={<UndoIcon />}
                            disabled={waivingId === item.missedPaymentId}
                            onClick={() => setItemToWaive(item)}
                          >
                            Annuler
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={Boolean(itemToWaive)}
        title="Annuler ce versement manqué ?"
        message={
          itemToWaive
            ? `Le manquement de ${getMemberDisplayName(itemToWaive.user)} (échéance du ${formatDate(itemToWaive.dueDate)}) sera annulé et la pénalité de points retirée.`
            : ''
        }
        confirmLabel="Annuler le manquement"
        confirmColor="warning"
        loading={Boolean(itemToWaive && waivingId === itemToWaive.missedPaymentId)}
        onConfirm={() => itemToWaive && handleWaive(itemToWaive)}
        onCancel={() => setItemToWaive(null)}
      />
    </Box>
  );
};

MissedPaymentsPanel.propTypes = {
  challenge: PropTypes.object,
  token: PropTypes.string
};

export default MissedPaymentsPanel;
