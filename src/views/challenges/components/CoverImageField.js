import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  ImageOutlined as ImageIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import ChallengesApi from 'api/challenges/challenges';
import { CHALLENGE_IP } from 'api/utils/address';
import { GhostButton } from './ChallengeLayout';
import { extractData, isApiSuccess } from '../utils/challengeUi';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_MB = 5;

export function resolveChallengeCoverUrl(value) {
  if (!value?.trim()) return '';
  const path = value.trim();
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = CHALLENGE_IP.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

/** Ne garder que les chemins custom /uploads/... (jamais l'image par défaut). */
export function toStoredCoverPath(value) {
  if (!value?.trim()) return '';
  const raw = value.trim();
  if (/\/assets\/tontine\.jpg/i.test(raw)) return '';

  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const pathname = new URL(raw).pathname;
      return pathname.includes('/uploads/') ? pathname : '';
    }
  } catch {
    return '';
  }

  if (raw.includes('/uploads/challenge-covers/') || raw.startsWith('/uploads/')) {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }

  return '';
}

const CoverImageField = ({ value, onChange, token, disabled, sx, challengeId, onChallengeUpdated }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [previewOverride, setPreviewOverride] = useState('');

  const storedValue = toStoredCoverPath(value);

  useEffect(() => {
    setImgError(false);
    // Ne pas effacer un override si la value parent vient juste d'être alignée sur le même upload
    if (previewOverride) {
      const overridePath = toStoredCoverPath(previewOverride);
      if (overridePath && storedValue && overridePath === storedValue) {
        setPreviewOverride('');
      }
    }
  }, [storedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const previewUrl = useMemo(
    () => previewOverride || resolveChallengeCoverUrl(storedValue),
    [previewOverride, storedValue]
  );
  const showPreview = Boolean(previewUrl && !imgError);

  const handleFile = async (file) => {
    if (!file) return;

    if (!token) {
      toast.error('Session expirée — reconnectez-vous', { position: 'top-right' });
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image trop lourde (max ${MAX_MB} Mo)`, { position: 'top-right' });
      return;
    }

    if (!ACCEPT.split(',').includes(file.type)) {
      toast.error('Format non supporté (JPEG, PNG, WebP, GIF)', { position: 'top-right' });
      return;
    }

    setUploading(true);
    setImgError(false);

    try {
      const res = await ChallengesApi.uploadCoverImage(file, token, { challengeId });
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Upload impossible', { position: 'top-right' });
        return;
      }

      const data = extractData(res);
      const storedPath = toStoredCoverPath(data?.coverImagePath || data?.coverImage || '');
      if (!storedPath) {
        toast.error('Upload OK mais chemin image manquant', { position: 'top-right' });
        return;
      }

      onChange(storedPath);
      setPreviewOverride(data?.coverImageUrl || resolveChallengeCoverUrl(storedPath));

      if (data?.challenge) {
        onChallengeUpdated?.(data.challenge);
        toast.success('Couverture enregistrée sur le défi', { position: 'top-right' });
      } else {
        toast.success(
          challengeId
            ? 'Image uploadée — enregistrez le défi pour confirmer'
            : 'Image de couverture uploadée',
          { position: 'top-right' }
        );
      }
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Upload impossible', { position: 'top-right' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
    setPreviewOverride('');
    setImgError(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const openPicker = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  return (
    <Box sx={sx}>
      <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
        Image de couverture
      </Typography>

      <Box
        sx={{
          position: 'relative',
          borderRadius: 2.5,
          border: '2px dashed',
          borderColor: showPreview ? 'divider' : 'primary.light',
          bgcolor: '#f8fafc',
          overflow: 'hidden'
        }}
      >
        {showPreview ? (
          <>
            <Box
              component="img"
              src={previewUrl}
              alt="Aperçu de la couverture"
              onError={() => setImgError(true)}
              sx={{ display: 'block', width: '100%', maxHeight: 200, objectFit: 'cover' }}
            />
            {!disabled && (
              <IconButton
                size="small"
                onClick={handleClear}
                aria-label="Retirer l'image"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(255,255,255,0.92)',
                  boxShadow: 1,
                  '&:hover': { bgcolor: '#fff' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
            px={2}
            minHeight={140}
          >
            {imgError ? (
              <Typography variant="caption" color="error" textAlign="center" mb={1.5}>
                Impossible d&apos;afficher l&apos;aperçu.
              </Typography>
            ) : (
              <ImageIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            )}
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
              JPEG, PNG, WebP ou GIF — max {MAX_MB} Mo
            </Typography>
            <GhostButton
              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadIcon />}
              disabled={disabled || uploading || !token}
              onClick={openPicker}
            >
              {uploading ? 'Envoi en cours…' : 'Choisir une image'}
            </GhostButton>
          </Box>
        )}
      </Box>

      {showPreview && !disabled && (
        <Box mt={1}>
          <GhostButton
            size="small"
            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadIcon />}
            disabled={uploading}
            onClick={openPicker}
          >
            {uploading ? 'Envoi…' : 'Remplacer l’image'}
          </GhostButton>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        {challengeId
          ? 'L’image est enregistrée dès l’upload sur ce défi.'
          : 'Uploadez une image puis créez le défi pour la conserver.'}
      </Typography>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </Box>
  );
};

CoverImageField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  token: PropTypes.string,
  disabled: PropTypes.bool,
  sx: PropTypes.object,
  challengeId: PropTypes.string,
  onChallengeUpdated: PropTypes.func
};

export default CoverImageField;
