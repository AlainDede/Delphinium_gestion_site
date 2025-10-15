import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Composant AccessRequest - Formulaire de demande d'accès au site
 * Permet aux nouveaux résidents ou sociétés de demander un compte
 */
function AccessRequest() {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartmentNumber: '',
    userType: 'resident',
    companyName: '',
    reason: '',
    message: ''
  });

  const steps = [t('Informations personnelles'), t('Coordonnées'), t('Confirmation')];

  /**
   * Soumet la demande d'accès
   */
  const handleSubmit = async () => {
    try {
      const response = await fetch('YOUR_API_GATEWAY_URL/access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting access request:', error);
    }
  };

  /**
   * Passe à l'étape suivante
   */
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  /**
   * Retourne à l'étape précédente
   */
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  /**
   * Met à jour les données du formulaire
   */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  /**
   * Valide l'étape actuelle
   */
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.firstName && formData.lastName && formData.email;
      case 1:
        return formData.phone && formData.address;
      case 2:
        return true;
      default:
        return false;
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="md" style={{ marginTop: '100px' }}>
        <Paper elevation={3} style={{ padding: '40px', textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            ✓ {t('Demande envoyée')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('Votre demande d\'accès a été soumise avec succès.')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('Un administrateur examinera votre demande et vous contactera sous 2-3 jours ouvrables.')}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Demande d\'accès')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        {t('Remplissez ce formulaire pour demander un accès au site de la copropriété Delphinium')}
      </Typography>

      <Paper elevation={2} style={{ padding: '30px', marginTop: '20px' }}>
        <Stepper activeStep={activeStep} style={{ marginBottom: '30px' }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Étape 1: Informations personnelles */}
        {activeStep === 0 && (
          <Box>
            <TextField
              fullWidth
              label={t('Prénom')}
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('Nom')}
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('Email')}
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label={t('Type de demandeur')}
              value={formData.userType}
              onChange={(e) => handleChange('userType', e.target.value)}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="resident">{t('Résident')}</option>
              <option value="service">{t('Société de service')}</option>
            </TextField>
            {formData.userType === 'service' && (
              <TextField
                fullWidth
                label={t('Nom de la société')}
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                margin="normal"
              />
            )}
          </Box>
        )}

        {/* Étape 2: Coordonnées */}
        {activeStep === 1 && (
          <Box>
            <TextField
              fullWidth
              label={t('Téléphone')}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('Adresse')}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              margin="normal"
              required
            />
            {formData.userType === 'resident' && (
              <TextField
                fullWidth
                label={t('Numéro d\'appartement')}
                value={formData.apartmentNumber}
                onChange={(e) => handleChange('apartmentNumber', e.target.value)}
                margin="normal"
              />
            )}
            <TextField
              fullWidth
              label={t('Raison de la demande')}
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label={t('Message additionnel')}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              margin="normal"
              multiline
              rows={4}
            />
          </Box>
        )}

        {/* Étape 3: Confirmation */}
        {activeStep === 2 && (
          <Box>
            <Alert severity="info" style={{ marginBottom: '20px' }}>
              {t('Veuillez vérifier vos informations avant de soumettre votre demande.')}
            </Alert>
            <Typography variant="h6" gutterBottom>{t('Récapitulatif')}</Typography>
            <Typography><strong>{t('Nom complet')}:</strong> {formData.firstName} {formData.lastName}</Typography>
            <Typography><strong>{t('Email')}:</strong> {formData.email}</Typography>
            <Typography><strong>{t('Téléphone')}:</strong> {formData.phone}</Typography>
            <Typography><strong>{t('Adresse')}:</strong> {formData.address}</Typography>
            {formData.apartmentNumber && (
              <Typography><strong>{t('Appartement')}:</strong> {formData.apartmentNumber}</Typography>
            )}
            <Typography><strong>{t('Type')}:</strong> {formData.userType === 'resident' ? t('Résident') : t('Société de service')}</Typography>
            {formData.companyName && (
              <Typography><strong>{t('Société')}:</strong> {formData.companyName}</Typography>
            )}
          </Box>
        )}

        {/* Boutons de navigation */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            {t('Retour')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={!isStepValid()}
          >
            {activeStep === steps.length - 1 ? t('Soumettre') : t('Suivant')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default AccessRequest;
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Composant IncidentManagement - Gestion des incidents de la copropriété
 * RÉSERVÉ aux administrateurs et superadmins uniquement
 */
function IncidentManagement() {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open'
  });

  /**
   * Charge les incidents au montage du composant
   */
  useEffect(() => {
    loadIncidents();
  }, []);

  /**
   * Récupère tous les incidents depuis l'API
   */
  const loadIncidents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('YOUR_API_GATEWAY_URL/incidents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  /**
   * Crée un nouvel incident
   */
  const handleCreateIncident = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('YOUR_API_GATEWAY_URL/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIncident)
      });

      if (response.ok) {
        setNewIncident({ title: '', description: '', priority: 'medium', status: 'open' });
        setOpenDialog(false);
        loadIncidents();
      }
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  /**
   * Met à jour le statut d'un incident
   */
  const handleUpdateStatus = async (incidentId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`YOUR_API_GATEWAY_URL/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      loadIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  /**
   * Retourne la couleur du chip selon la priorité
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  /**
   * Retourne la couleur du chip selon le statut
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Gestion d\'incidents')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        {t('Section réservée aux administrateurs')}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        style={{ marginBottom: '20px' }}
      >
        {t('Créer un incident')}
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>{t('Titre')}</strong></TableCell>
              <TableCell><strong>{t('Description')}</strong></TableCell>
              <TableCell><strong>{t('Priorité')}</strong></TableCell>
              <TableCell><strong>{t('Statut')}</strong></TableCell>
              <TableCell><strong>{t('Date')}</strong></TableCell>
              <TableCell><strong>{t('Actions')}</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.incidentId}>
                <TableCell>{incident.title}</TableCell>
                <TableCell>{incident.description}</TableCell>
                <TableCell>
                  <Chip
                    label={t(incident.priority)}
                    color={getPriorityColor(incident.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(incident.status)}
                    color={getStatusColor(incident.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(incident.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Select
                    value={incident.status}
                    onChange={(e) => handleUpdateStatus(incident.incidentId, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="open">{t('Ouvert')}</MenuItem>
                    <MenuItem value="in_progress">{t('En cours')}</MenuItem>
                    <MenuItem value="resolved">{t('Résolu')}</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de création d'incident */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('Créer un nouvel incident')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('Titre')}
            value={newIncident.title}
            onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('Description')}
            value={newIncident.description}
            onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>{t('Priorité')}</InputLabel>
            <Select
              value={newIncident.priority}
              onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value })}
            >
              <MenuItem value="low">{t('Basse')}</MenuItem>
              <MenuItem value="medium">{t('Moyenne')}</MenuItem>
              <MenuItem value="high">{t('Haute')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('Annuler')}</Button>
          <Button onClick={handleCreateIncident} variant="contained" color="primary">
            {t('Créer')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default IncidentManagement;

