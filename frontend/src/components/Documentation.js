import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Description, Folder, GetApp, CloudUpload } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * Composant Documentation - Gestion des documents de la copropriété
 * Stockage sur S3, accessible selon les permissions des utilisateurs
 */
function Documentation() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    name: '',
    category: '',
    description: ''
  });
  const userRole = localStorage.getItem('userRole');

  /**
   * Charge les documents au montage du composant
   */
  useEffect(() => {
    loadDocuments();
  }, []);

  /**
   * Récupère tous les documents depuis l'API
   */
  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('YOUR_API_GATEWAY_URL/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  /**
   * Upload un document vers S3
   */
  const handleUploadDocument = async () => {
    if (!selectedFile) return;

    try {
      const token = localStorage.getItem('authToken');

      // Obtenir une URL présignée pour l'upload
      const presignResponse = await fetch('YOUR_API_GATEWAY_URL/documents/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          metadata: uploadMetadata
        })
      });

      const { uploadUrl, documentId } = await presignResponse.json();

      // Upload le fichier vers S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type
        }
      });

      // Enregistrer les métadonnées du document
      await fetch('YOUR_API_GATEWAY_URL/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId,
          fileName: selectedFile.name,
          ...uploadMetadata
        })
      });

      setUploadDialog(false);
      setSelectedFile(null);
      setUploadMetadata({ name: '', category: '', description: '' });
      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  /**
   * Télécharge un document depuis S3
   */
  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`YOUR_API_GATEWAY_URL/documents/${documentId}/download-url`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { downloadUrl } = await response.json();

      // Télécharger le fichier
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  /**
   * Filtre les documents selon le terme de recherche
   */
  const filteredDocuments = documents.filter(doc =>
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Regroupe les documents par catégorie
   */
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    const category = doc.category || t('Sans catégorie');
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {});

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Documentation')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        {t('Documents relatifs à la copropriété')}
      </Typography>

      {/* Barre de recherche et bouton d'upload */}
      <Box style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <TextField
          fullWidth
          label={t('Rechercher un document')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
        />
        {(userRole === 'admin' || userRole === 'superadmin') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialog(true)}
            style={{ minWidth: '150px' }}
          >
            {t('Upload')}
          </Button>
        )}
      </Box>

      {/* Liste des documents par catégorie */}
      {Object.keys(documentsByCategory).map(category => (
        <Paper key={category} elevation={2} style={{ marginBottom: '20px', padding: '15px' }}>
          <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <Folder style={{ marginRight: '10px', color: '#1976d2' }} />
            <Typography variant="h6">{category}</Typography>
            <Chip label={documentsByCategory[category].length} size="small" style={{ marginLeft: '10px' }} />
          </Box>
          <List>
            {documentsByCategory[category].map((doc) => (
              <ListItem
                key={doc.documentId}
                button
                onClick={() => handleDownloadDocument(doc.documentId, doc.fileName)}
              >
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText
                  primary={doc.name || doc.fileName}
                  secondary={
                    <>
                      {doc.description}
                      <br />
                      <Typography component="span" variant="caption" color="textSecondary">
                        {t('Ajouté le')} {new Date(doc.uploadedAt).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
                <GetApp />
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}

      {filteredDocuments.length === 0 && (
        <Paper elevation={1} style={{ padding: '40px', textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {t('Aucun document trouvé')}
          </Typography>
        </Paper>
      )}

      {/* Dialog d'upload */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('Uploader un document')}</DialogTitle>
        <DialogContent>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ marginBottom: '20px', width: '100%' }}
          />
          <TextField
            fullWidth
            label={t('Nom du document')}
            value={uploadMetadata.name}
            onChange={(e) => setUploadMetadata({ ...uploadMetadata, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('Catégorie')}
            value={uploadMetadata.category}
            onChange={(e) => setUploadMetadata({ ...uploadMetadata, category: e.target.value })}
            margin="normal"
            placeholder={t('Ex: Procès-verbaux, Contrats, Factures...')}
          />
          <TextField
            fullWidth
            label={t('Description')}
            value={uploadMetadata.description}
            onChange={(e) => setUploadMetadata({ ...uploadMetadata, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>{t('Annuler')}</Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            color="primary"
            disabled={!selectedFile || !uploadMetadata.name}
          >
            {t('Uploader')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Documentation;

