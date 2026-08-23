import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
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
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  GhostButton,
  PrimaryButton,
  InfoBanner,
  EmptyState,
  SSS_COLORS
} from './ChallengeLayout';
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
    <Box className="animate-sss-fade-up">
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5} gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="subtitle1" fontWeight={800}>
            Versements manqués
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {stats.open} en attente · {stats.waived} annulé{stats.waived > 1 ? 's' : ''} · {stats.total} au total
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <GhostButton size="small" startIcon={<RefreshIcon />} onClick={loadMissed}>
            Actualiser
          </GhostButton>
          <PrimaryButton size="small" startIcon={<CheckIcon />} onClick={handleCheck} disabled={checking}>
            {checking ? 'Vérification…' : 'Lancer une vérification'}
          </PrimaryButton>
        </Box>
      </Box>

      <InfoBanner color={SSS_COLORS.info}>
        Un versement manqué apparaît quand un participant n’a pas payé à la date prévue. Vous pouvez l’annuler pour retirer la pénalité.
      </InfoBanner>

      {items.length === 0 ? (
        <EmptyState title="Aucun versement manqué" description="Tous les participants sont à jour pour ce défi." />
      ) : (
        <TableShell>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeadCellSx}>Participant</TableCell>
                <TableCell sx={tableHeadCellSx}>Échéance</TableCell>
                <TableCell sx={tableHeadCellSx}>Détecté le</TableCell>
                <TableCell sx={tableHeadCellSx}>Pénalité</TableCell>
                <TableCell sx={tableHeadCellSx}>État</TableCell>
                <TableCell sx={tableHeadCellSx} align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={String(item.missedPaymentId)} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={tableBodyCellSx}>
                    <Typography variant="body2" fontWeight={600}>
                      {getMemberDisplayName(item.user)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableBodyCellSx}>{formatDate(item.dueDate)}</TableCell>
                  <TableCell sx={tableBodyCellSx}>{formatDateTime(item.detectedAt)}</TableCell>
                  <TableCell sx={tableBodyCellSx}>
                    <Typography variant="body2" color="error.main" fontWeight={700}>
                      −{item.scorePenaltyApplied || 0} pts
                    </Typography>
                  </TableCell>
                  <TableCell sx={tableBodyCellSx}>
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
                  <TableCell sx={tableBodyCellSx} align="right">
                    {!item.waived && (
                      <Tooltip title="Annuler ce manquement">
                        <span>
                          <GhostButton
                            size="small"
                            startIcon={<UndoIcon />}
                            disabled={waivingId === item.missedPaymentId}
                            onClick={() => setItemToWaive(item)}
                          >
                            Annuler
                          </GhostButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableShell>
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
