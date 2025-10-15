import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Composant Calendar - Affichage des événements mensuels de la copropriété
 * Calendrier interactif montrant les événements importants
 */
function Calendar() {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  /**
   * Charge les événements au montage du composant
   */
  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  /**
   * Récupère les événements depuis l'API
   */
  const loadEvents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const response = await fetch(`YOUR_API_GATEWAY_URL/calendar/events?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  /**
   * Génère les jours du mois pour le calendrier
   */
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Jours vides avant le début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  /**
   * Vérifie si un jour a des événements
   */
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.eventDate === dateStr);
  };

  const monthNames = [
    t('Janvier'), t('Février'), t('Mars'), t('Avril'), t('Mai'), t('Juin'),
    t('Juillet'), t('Août'), t('Septembre'), t('Octobre'), t('Novembre'), t('Décembre')
  ];

  const dayNames = [t('Dim'), t('Lun'), t('Mar'), t('Mer'), t('Jeu'), t('Ven'), t('Sam')];

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Calendrier')}
      </Typography>

      <Paper elevation={2} style={{ padding: '20px' }}>
        {/* En-tête du calendrier */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Typography variant="h5">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Typography>
          <Box>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              style={{ marginRight: '10px', padding: '5px 15px' }}
            >
              ←
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              style={{ marginRight: '10px', padding: '5px 15px' }}
            >
              {t('Aujourd\'hui')}
            </button>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              style={{ padding: '5px 15px' }}
            >
              →
            </button>
          </Box>
        </Box>

        {/* Grille du calendrier */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
          {/* En-têtes des jours */}
          {dayNames.map(day => (
            <div key={day} style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
              {day}
            </div>
          ))}

          {/* Jours du mois */}
          {generateCalendarDays().map((day, index) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={index}
                style={{
                  padding: '10px',
                  minHeight: '80px',
                  border: '1px solid #ddd',
                  backgroundColor: day ? '#fff' : '#f9f9f9',
                  position: 'relative'
                }}
              >
                {day && (
                  <>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{day}</div>
                    {dayEvents.map((event, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '11px',
                          padding: '2px 5px',
                          marginBottom: '2px',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          borderRadius: '3px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Liste des événements du mois */}
        <Box style={{ marginTop: '30px' }}>
          <Typography variant="h6" gutterBottom>
            {t('Événements du mois')}
          </Typography>
          {events.length > 0 ? (
            events.map((event, idx) => (
              <Paper key={idx} elevation={1} style={{ padding: '15px', marginBottom: '10px' }}>
                <Typography variant="h6">{event.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(event.eventDate).toLocaleDateString()} - {event.time}
                </Typography>
                <Typography variant="body1">{event.description}</Typography>
              </Paper>
            ))
          ) : (
            <Typography color="textSecondary">{t('Aucun événement ce mois-ci')}</Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Calendar;
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Avatar,
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Composant Newsgroup - Forum de discussion pour tous les résidents
 * Permet de créer des threads et d'y répondre
 */
function Newsgroup() {
  const { t } = useTranslation();
  const [threads, setThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  /**
   * Charge les threads du forum au montage du composant
   */
  useEffect(() => {
    loadThreads();
  }, []);

  /**
   * Récupère tous les threads depuis l'API
   */
  const loadThreads = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('YOUR_API_GATEWAY_URL/newsgroup/threads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  };

  /**
   * Crée un nouveau thread de discussion
   */
  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('YOUR_API_GATEWAY_URL/newsgroup/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newThreadTitle,
          content: newThreadContent
        })
      });

      if (response.ok) {
        setNewThreadTitle('');
        setNewThreadContent('');
        loadThreads();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  /**
   * Ajoute une réponse à un thread existant
   */
  const handleReply = async (threadId) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`YOUR_API_GATEWAY_URL/newsgroup/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyContent
        })
      });

      setReplyContent('');
      loadThreads();
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Newsgroup')}
      </Typography>

      {/* Formulaire de création de thread */}
      <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          {t('Créer un nouveau sujet')}
        </Typography>
        <Box component="form" onSubmit={handleCreateThread}>
          <TextField
            fullWidth
            label={t('Titre')}
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('Message')}
            value={newThreadContent}
            onChange={(e) => setNewThreadContent(e.target.value)}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '10px' }}>
            {t('Publier')}
          </Button>
        </Box>
      </Paper>

      {/* Liste des threads */}
      <Paper elevation={2} style={{ padding: '20px' }}>
        <Typography variant="h6" gutterBottom>
          {t('Discussions récentes')}
        </Typography>
        <List>
          {threads.map((thread, index) => (
            <React.Fragment key={thread.threadId}>
              <ListItem alignItems="flex-start" button onClick={() => setSelectedThread(thread)}>
                <Avatar style={{ marginRight: '10px' }}>{thread.author?.charAt(0)}</Avatar>
                <ListItemText
                  primary={thread.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="textPrimary">
                        {thread.author}
                      </Typography>
                      {` — ${thread.content?.substring(0, 100)}...`}
                      <br />
                      <Chip label={`${thread.replies?.length || 0} ${t('réponses')}`} size="small" style={{ marginTop: '5px' }} />
                    </>
                  }
                />
              </ListItem>
              {index < threads.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Affichage du thread sélectionné */}
      {selectedThread && (
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <Typography variant="h5" gutterBottom>
            {selectedThread.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedThread.content}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {t('Par')} {selectedThread.author} - {new Date(selectedThread.timestamp).toLocaleString()}
          </Typography>

          <Divider style={{ margin: '20px 0' }} />

          {/* Réponses */}
          <Typography variant="h6" gutterBottom>
            {t('Réponses')}
          </Typography>
          {selectedThread.replies?.map((reply, idx) => (
            <Box key={idx} style={{ marginBottom: '15px', paddingLeft: '20px', borderLeft: '3px solid #ddd' }}>
              <Typography variant="body2">{reply.content}</Typography>
              <Typography variant="caption" color="textSecondary">
                {reply.author} - {new Date(reply.timestamp).toLocaleString()}
              </Typography>
            </Box>
          ))}

          {/* Formulaire de réponse */}
          <Box style={{ marginTop: '20px' }}>
            <TextField
              fullWidth
              label={t('Votre réponse')}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              multiline
              rows={3}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleReply(selectedThread.threadId)}
              style={{ marginTop: '10px' }}
            >
              {t('Répondre')}
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}

export default Newsgroup;

