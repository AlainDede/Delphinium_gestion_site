import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Newsgroup from './components/Newsgroup';
import Blog from './components/Blog';
import Calendar from './components/Calendar';
import IncidentManagement from './components/IncidentManagement';
import Documentation from './components/Documentation';
import AccessRequest from './components/AccessRequest';

/**
 * Composant principal de navigation
 */
function MainApp() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('userRole');
    if (authToken && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
    }
  }, []);

  const handleLangChange = (event) => {
    setLang(event.target.value);
    i18n.changeLanguage(event.target.value);
  };

  /**
   * Callback appelé après une connexion réussie
   * @param {Object} userData - Données de l'utilisateur (userid, role)
   */
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUserRole(userData.role);
    navigate('/newsgroup');
  };

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  /**
   * Détermine si une section doit être visible selon le rôle de l'utilisateur
   * @param {string} section - Nom de la section
   * @returns {boolean} - true si la section doit être affichée
   */
  const canAccessSection = (section) => {
    // Newsgroup, Blog, Calendrier sont accessibles à tous les utilisateurs connectés
    if (['Newsgroup', 'Blog', 'Calendrier', 'Documentation'].includes(section)) {
      return true;
    }
    // Gestion d'incidents uniquement pour admin et superadmin
    if (section === 'Gestion d\'incidents') {
      return userRole === 'admin' || userRole === 'superadmin';
    }
    // Demande d'accès visible par tous
    if (section === 'Demande d\'accès') {
      return true;
    }
    return false;
  };

  // Si l'utilisateur n'est pas connecté et n'est pas sur la page de demande d'accès
  if (!isAuthenticated && location.pathname !== '/access-request') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      {isAuthenticated && (
        <AppBar position="static">
          <Toolbar>
            <img src={logo} alt="logo" style={{ width: 40, marginRight: 16 }} />
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              {t('Copropriété Delphinium')}
            </Typography>
            {canAccessSection('Newsgroup') && (
              <Button color="inherit" onClick={() => navigate('/newsgroup')}>
                {t('Newsgroup')}
              </Button>
            )}
            {canAccessSection('Blog') && (
              <Button color="inherit" onClick={() => navigate('/blog')}>
                {t('Blog')}
              </Button>
            )}
            {canAccessSection('Calendrier') && (
              <Button color="inherit" onClick={() => navigate('/calendar')}>
                {t('Calendrier')}
              </Button>
            )}
            {canAccessSection('Demande d\'accès') && (
              <Button color="inherit" onClick={() => navigate('/access-request')}>
                {t('Demande d\'accès')}
              </Button>
            )}
            {canAccessSection('Gestion d\'incidents') && (
              <Button color="inherit" onClick={() => navigate('/incidents')}>
                {t('Gestion d\'incidents')}
              </Button>
            )}
            {canAccessSection('Documentation') && (
              <Button color="inherit" onClick={() => navigate('/documentation')}>
                {t('Documentation')}
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>{t('Déconnexion')}</Button>
            <Select
              value={lang}
              onChange={handleLangChange}
              style={{ marginLeft: 16, color: 'white' }}
            >
              <MenuItem value="fr">FR</MenuItem>
              <MenuItem value="nl">NL</MenuItem>
              <MenuItem value="en">EN</MenuItem>
            </Select>
          </Toolbar>
        </AppBar>
      )}

      {/* Routes pour les différentes sections */}
      <Routes>
        <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/newsgroup" element={<Newsgroup />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/access-request" element={<AccessRequest />} />
        <Route path="/incidents" element={
          (userRole === 'admin' || userRole === 'superadmin') ?
            <IncidentManagement /> :
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Typography variant="h5">{t('Accès refusé')}</Typography>
            </div>
        } />
        <Route path="/documentation" element={<Documentation />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

export default App;
