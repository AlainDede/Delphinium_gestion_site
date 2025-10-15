import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Composant Blog - Affichage des dernières actualités de la copropriété
 * Accessible à tous les utilisateurs en lecture seule
 * Seuls les admins peuvent créer/modifier des posts (à implémenter)
 */
function Blog() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);

  /**
   * Charge les posts du blog au montage du composant
   */
  useEffect(() => {
    loadPosts();
  }, []);

  /**
   * Récupère tous les posts depuis l'API
   */
  const loadPosts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('YOUR_API_GATEWAY_URL/blog/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Blog')} - {t('Actualités')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        {t('Les dernières nouvelles de la copropriété Delphinium')}
      </Typography>

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} key={post.postId}>
            <Card elevation={2}>
              {post.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={post.imageUrl}
                  alt={post.title}
                />
              )}
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {post.title}
                </Typography>
                <Box style={{ marginBottom: '10px' }}>
                  <Chip label={post.category} size="small" color="primary" />
                  <Chip
                    label={new Date(post.createdAt).toLocaleDateString()}
                    size="small"
                    style={{ marginLeft: '5px' }}
                  />
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {post.summary}
                </Typography>
                <Typography variant="body1">
                  {post.content}
                </Typography>
                <Typography variant="caption" color="textSecondary" style={{ marginTop: '10px', display: 'block' }}>
                  {t('Publié par')} {post.author}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {posts.length === 0 && (
        <Paper elevation={1} style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
          <Typography variant="h6" color="textSecondary">
            {t('Aucune actualité pour le moment')}
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default Blog;

