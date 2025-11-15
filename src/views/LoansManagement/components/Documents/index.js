// src/pages/LoansManagement/components/Documents/index.js
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Description,
  Download,
  CheckCircle,
  Schedule,
  Warning
} from '@mui/icons-material';
import { showInfo } from 'utils/notifications';

const Documents = ({ loan, onGenerateDocument, onMarkAsSigned, onDownloadDocument }) => {
  const hasDocument = loan.agreementDocument && loan.agreementDocument.filename;
  const isSigned = loan.agreementDocument?.signed;

  const handleGenerate = async () => {
    await onGenerateDocument(loan._id);
  };

  const handleMarkSigned = async () => {
    if (window.confirm('Marquer ce document comme signé ? Cette action est irréversible.')) {
      await onMarkAsSigned(loan._id);
    }
  };

  const handleDownload = async () => {
    if (hasDocument) {
      showInfo('Téléchargement du document...');
      await onDownloadDocument();
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="600">
        Gestion des Documents
      </Typography>

      {/* Statut du document */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" color="primary">
              Contrat de Prêt
            </Typography>
            <Chip
              icon={isSigned ? <CheckCircle /> : hasDocument ? <Schedule /> : <Warning />}
              label={isSigned ? 'Signé' : hasDocument ? 'Généré' : 'Non généré'}
              color={isSigned ? 'success' : hasDocument ? 'info' : 'warning'}
              variant="outlined"
            />
          </Box>

          {hasDocument ? (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Document généré le {formatDate(loan.agreementDocument.uploadedAt)}
              </Typography>
              {isSigned && (
                <Typography variant="body2" color="success.main" gutterBottom>
                  Signé le {formatDate(loan.agreementDocument.signedAt)}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Aucun document généré pour ce prêt
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Description />}
            onClick={handleGenerate}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' },
              height: 50
            }}
          >
            Générer le contrat
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
            disabled={!hasDocument}
            sx={{ height: 50 }}
          >
            Télécharger
          </Button>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleMarkSigned}
            disabled={!hasDocument || isSigned}
            sx={{ 
              backgroundColor: '#2e7d32',
              '&:hover': { backgroundColor: '#1b5e20' },
              height: 50
            }}
          >
            {isSigned ? 'Déjà signé' : 'Marquer signé'}
          </Button>
        </Grid>
      </Grid>

      {/* Informations */}
      <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="600">
            Informations du Document
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Description color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Nom du fichier"
                secondary={hasDocument ? loan.agreementDocument.originalName : 'Non généré'}
              />
            </ListItem>

            <Divider variant="inset" component="li" />

            <ListItem>
              <ListItemIcon>
                <Schedule color="action" />
              </ListItemIcon>
              <ListItemText
                primary="Date de génération"
                secondary={hasDocument ? formatDate(loan.agreementDocument.uploadedAt) : 'Non applicable'}
              />
            </ListItem>

            <Divider variant="inset" component="li" />

            <ListItem>
              <ListItemIcon>
                <CheckCircle color={isSigned ? "success" : "disabled"} />
              </ListItemIcon>
              <ListItemText
                primary="Statut de signature"
                secondary={
                  isSigned ? 
                  `Signé le ${formatDate(loan.agreementDocument.signedAt)}` : 
                  'En attente de signature'
                }
              />
            </ListItem>
          </List>

          {!hasDocument && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Générez le contrat de prêt pour obtenir un document officiel contenant toutes les informations du prêt.
            </Alert>
          )}

          {hasDocument && !isSigned && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Le document a été généré mais n'est pas encore signé. Marquez-le comme signé une fois la signature effectuée.
            </Alert>
          )}

          {isSigned && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Le contrat a été signé par toutes les parties. Le prêt est maintenant officiel.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Documents;