import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Box, Typography } from '@mui/material';
import { ImageOutlined as ImageIcon } from '@mui/icons-material';
import { CHALLENGE_ACCENT } from './ChallengeLayout';

const CoverImageField = ({ value, onChange, disabled, sx }) => {
  const [imgError, setImgError] = useState(false);
  const trimmed = value?.trim() || '';
  const showPreview = trimmed && !imgError;

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        label="Image de couverture (URL)"
        value={value}
        onChange={(e) => {
          setImgError(false);
          onChange(e.target.value);
        }}
        disabled={disabled}
        placeholder="https://..."
        helperText="URL de l'image affichée sur la fiche du défi dans l'app"
        sx={sx}
      />
      {showPreview && (
        <Box
          mt={1.5}
          sx={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f8fafc',
            maxHeight: 180
          }}
        >
          <Box
            component="img"
            src={trimmed}
            alt="Aperçu de l'image de couverture"
            onError={() => setImgError(true)}
            sx={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover' }}
          />
        </Box>
      )}
      {trimmed && imgError && (
        <Box
          mt={1.5}
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'error.light',
            bgcolor: '#fef2f2',
            px: 2,
            py: 1.5
          }}
        >
          <ImageIcon fontSize="small" sx={{ color: CHALLENGE_ACCENT }} />
          <Typography variant="caption" color="error">
            Impossible de charger l'image à partir de cette URL.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

CoverImageField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  sx: PropTypes.object
};

export default CoverImageField;
