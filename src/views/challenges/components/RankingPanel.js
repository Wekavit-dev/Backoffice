import React, { useCallback, useEffect, useState } from 'react';
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
  Avatar,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Block as BlockIcon,
  HowToReg as ReinstateIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ChallengesApi from 'api/challenges/challenges';
import ConfirmDialog from './ConfirmDialog';
import {
  TableShell,
  tableHeadCellSx,
  tableBodyCellSx,
  GhostButton,
  EmptyState,
  SSS_COLORS
} from './ChallengeLayout';
import {
  MEMBER_STATUS_COLORS,
  MEMBER_STATUS_LABELS,
  DISQUALIFICATION_LABELS,
  formatAmount,
  formatDate,
  getMemberDisplayName,
  isApiSuccess
} from '../utils/challengeUi';

const RankingPanel = ({ challenge, token, onMemberAction }) => {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [memberToDisqualify, setMemberToDisqualify] = useState(null);

  const loadRanking = useCallback(async () => {
    if (!challenge?._id || !token) return;
    setLoading(true);
    try {
      const res = await ChallengesApi.getChallengeRanking(challenge._id, { limit: 200 }, token);
      const list = res?.data?.data ?? [];
      setRanking(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error?.data?.error || 'Impossible de charger le classement', { position: 'top-right' });
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, [challenge?._id, token]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  const handleDisqualify = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await ChallengesApi.disqualifyMember(challenge._id, userId, token);
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Exclusion impossible', { position: 'top-right' });
        return;
      }
      toast.success('Participant exclu', { position: 'top-right' });
      await loadRanking();
      onMemberAction?.();
    } catch (error) {
      toast.error(error?.data?.error || 'Exclusion impossible', { position: 'top-right' });
    } finally {
      setActionLoading(null);
      setMemberToDisqualify(null);
    }
  };

  const handleReinstate = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await ChallengesApi.reinstateMember(challenge._id, userId, token);
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Réintégration impossible', { position: 'top-right' });
        return;
      }
      toast.success('Participant réintégré', { position: 'top-right' });
      await loadRanking();
      onMemberAction?.();
    } catch (error) {
      toast.error(error?.data?.error || 'Réintégration impossible', { position: 'top-right' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={36} sx={{ mb: 2 }} />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box className="animate-sss-fade-up">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
            Classement des participants
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {ranking.length} personne{ranking.length > 1 ? 's' : ''} · scores et positions à jour
          </Typography>
        </Box>
        <GhostButton size="small" startIcon={<RefreshIcon />} onClick={loadRanking}>
          Actualiser
        </GhostButton>
      </Box>

      {ranking.length === 0 ? (
        <EmptyState
          title="Aucun participant"
          description="Personne n’a encore rejoint ce défi. Publiez-le dans l’app pour attirer des participants."
        />
      ) : (
        <TableShell>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeadCellSx}>#</TableCell>
                <TableCell sx={tableHeadCellSx}>Participant</TableCell>
                <TableCell sx={tableHeadCellSx}>Épargné</TableCell>
                <TableCell sx={tableHeadCellSx}>Points</TableCell>
                <TableCell sx={tableHeadCellSx}>État</TableCell>
                <TableCell sx={tableHeadCellSx} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.map((row) => {
                const userId = row.userId || row.user?._id;
                const name = getMemberDisplayName(row.user);
                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase();

                return (
                  <TableRow key={userId || row.rank} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={tableBodyCellSx}>
                      <Typography variant="body2" fontWeight={800} sx={{ color: SSS_COLORS.brand }}>
                        {row.rank || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableBodyCellSx}>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <Avatar sx={{ width: 34, height: 34, fontSize: 12, bgcolor: SSS_COLORS.brand }}>{initials || '?'}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.contributionsCount || 0} versement{(row.contributionsCount || 0) > 1 ? 's' : ''}
                            {row.streak ? ` · série ${row.streak}` : ''}
                            {row.missedPeriods ? ` · ${row.missedPeriods} manqué(s)` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={tableBodyCellSx}>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAmount(row.totalContributed, challenge.idDevise)}
                      </Typography>
                      {challenge.goalAmount > 0 && (
                        <div className="admin-progress-track mt-1.5 max-w-[96px]">
                          <div
                            className="admin-progress-fill"
                            style={{
                              width: `${Math.min(100, Math.round((Number(row.totalContributed || 0) / Number(challenge.goalAmount)) * 100))}%`
                            }}
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell sx={tableBodyCellSx}>
                      <Typography variant="body2" fontWeight={800}>
                        {Math.round(Number(row.score) || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={tableBodyCellSx}>
                      <Chip
                        size="small"
                        label={MEMBER_STATUS_LABELS[row.status] || row.status}
                        color={MEMBER_STATUS_COLORS[row.status] || 'default'}
                      />
                      {row.disqualificationReason && (
                        <Typography variant="caption" color="error" display="block" mt={0.5}>
                          {DISQUALIFICATION_LABELS[row.disqualificationReason] || row.disqualificationReason}
                        </Typography>
                      )}
                      {row.joinedAt && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Inscrit le {formatDate(row.joinedAt)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={tableBodyCellSx} align="right">
                      {row.status === 'disqualified' ? (
                        <Tooltip title="Réintégrer">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              disabled={actionLoading === userId}
                              onClick={() => handleReinstate(userId)}
                            >
                              <ReinstateIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Exclure du défi">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={!userId || actionLoading === userId || row.status === 'completed'}
                              onClick={() => setMemberToDisqualify(row)}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableShell>
      )}

      <ConfirmDialog
        open={Boolean(memberToDisqualify)}
        title="Exclure ce participant ?"
        message={
          memberToDisqualify
            ? `${getMemberDisplayName(memberToDisqualify.user)} sera exclu du défi « ${challenge.name} ». Cette action peut être annulée via la réintégration.`
            : ''
        }
        confirmLabel="Exclure"
        confirmColor="error"
        loading={Boolean(memberToDisqualify && actionLoading === (memberToDisqualify.userId || memberToDisqualify.user?._id))}
        onConfirm={() => {
          const userId = memberToDisqualify?.userId || memberToDisqualify?.user?._id;
          if (userId) handleDisqualify(userId);
        }}
        onCancel={() => setMemberToDisqualify(null)}
      />
    </Box>
  );
};

RankingPanel.propTypes = {
  challenge: PropTypes.object,
  token: PropTypes.string,
  onMemberAction: PropTypes.func
};

export default RankingPanel;
