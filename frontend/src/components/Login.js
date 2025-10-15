import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Composant Login - Gestion de l'authentification des utilisateurs
 * Permet la connexion avec userid et mot de passe via AWS Cognito
 */
function Login({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Gère la soumission du formulaire de connexion
   * Appelle l'API backend (Lambda) pour authentifier l'utilisateur
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Remplacer par l'URL de votre API Gateway AWS
      const response = await fetch('YOUR_API_GATEWAY_URL/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Stockage du token d'authentification
        localStorage.setItem('authToken', data.body.AccessToken);
        localStorage.setItem('idToken', data.body.IdToken);
        localStorage.setItem('refreshToken', data.body.RefreshToken);

        // Décodage du token pour récupérer le rôle de l'utilisateur
        const decodedToken = parseJwt(data.body.IdToken);
        const userRole = decodedToken['cognito:groups'] ? decodedToken['cognito:groups'][0] : 'user';
        localStorage.setItem('userRole', userRole);

        // Callback de succès
        onLoginSuccess({ userid, role: userRole });
      } else {
        setError(t('Identifiants incorrects'));
      }
    } catch (err) {
      setError(t('Erreur de connexion'));
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Décode un token JWT pour extraire les informations utilisateur
   */
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return {};
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px' }}>
      <Paper elevation={3} style={{ padding: '40px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t('Connexion')}
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" gutterBottom>
          {t('Copropriété Delphinium')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label={t('Identifiant')}
            variant="outlined"
            margin="normal"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            required
            autoFocus
          />
          <TextField
            fullWidth
            label={t('Mot de passe')}
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? t('Connexion en cours...') : t('Se connecter')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;

