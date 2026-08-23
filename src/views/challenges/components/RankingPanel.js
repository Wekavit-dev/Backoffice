import React, { useCallback, useEffect, useState } from 'react';
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
  Avatar,
  LinearProgress,
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Classement des participants
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {ranking.length} personne{ranking.length > 1 ? 's' : ''} · scores et positions à jour
          </Typography>
        </Box>
        <Button size="small" startIcon={<RefreshIcon />} onClick={loadRanking} variant="outlined">
          Actualiser
        </Button>
      </Box>

      {ranking.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Personne n’a encore rejoint ce défi.
        </Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Participant</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Épargné</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Points</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
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
                  <TableRow key={userId || row.rank} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {row.rank || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.25}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.main' }}>{initials || '?'}</Avatar>
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
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatAmount(row.totalContributed, challenge.idDevise)}
                      </Typography>
                      {challenge.goalAmount > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.round((Number(row.totalContributed || 0) / Number(challenge.goalAmount)) * 100))}
                          sx={{ mt: 0.5, height: 4, borderRadius: 2, maxWidth: 90 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {Math.round(Number(row.score) || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
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
                    <TableCell align="right">
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
        </TableContainer>
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
