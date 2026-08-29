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

const CoverImageField = ({ value, onChange, token, disabled, sx }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [previewOverride, setPreviewOverride] = useState('');

  useEffect(() => {
    setPreviewOverride('');
    setImgError(false);
  }, [value]);

  const previewUrl = useMemo(
    () => previewOverride || resolveChallengeCoverUrl(value),
    [previewOverride, value]
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
      const res = await ChallengesApi.uploadCoverImage(file, token);
      if (!isApiSuccess(res)) {
        toast.error(res?.data?.error || 'Upload impossible', { position: 'top-right' });
        return;
      }

      const data = extractData(res);
      const storedPath = data?.coverImage || '';
      onChange(storedPath);
      setPreviewOverride(data?.coverImageUrl || resolveChallengeCoverUrl(storedPath));
      toast.success('Image de couverture uploadée', { position: 'top-right' });
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
        L&apos;image sera visible sur la fiche du défi dans l&apos;app mobile.
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
  sx: PropTypes.object
};

export default CoverImageField;
