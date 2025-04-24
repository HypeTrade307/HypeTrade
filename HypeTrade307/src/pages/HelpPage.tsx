//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { CssBaseline, Container, Typography, Switch, FormControlLabel, Box, Paper } from '@mui/material';
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import "./HelpPage.css"; // Import CSS file

const HelpPage = () => {
  const [tutorialMode, setTutorialMode] = useState<boolean>(
    JSON.parse(localStorage.getItem('tutorialMode') || 'false')
  );

  useEffect(() => {
    localStorage.setItem('tutorialMode', JSON.stringify(tutorialMode));
  }, [tutorialMode]);

  const handleToggle = () => {
    setTutorialMode((prev) => !prev);
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Navbar />
      <Box sx={{ mt: 4, px: 2 }}>
        <Typography variant="h3" className="help-header" gutterBottom>
          Help & Getting Started
        </Typography>
      </Box>
      <Container maxWidth="md" className="help-container">
        <Paper elevation={3} className="help-box">
          <Typography variant="body1" paragraph>
            Welcome to <strong>HypeTrade</strong>! This platform uses sentiment analysis from stock discussions
            to evaluate market sentiment and help predict stock movements. By analyzing
            large-scale social media and news data, HypeTrade provides insights into whether
            a stock may rise or fall based on public perception.
          </Typography>
          <Typography variant="body1" paragraph>
            To use HypeTrade effectively:
          </Typography>
          <ul className="help-list">
            <li>Search for a stock to view sentiment analysis.</li>
            <li>Analyze the sentiment trend over time.</li>
            <li>Use insights to complement your research and make informed investment decisions.</li>
          </ul>

          <Box className="toggle-section">
            <FormControlLabel
              control={<Switch checked={tutorialMode} onChange={handleToggle} />}
              label="Enable Tutorial Mode"
            />
          </Box>

          <Typography variant="caption" className="disclaimer">
            Disclaimer: HypeTrade provides sentiment-based insights and does not constitute financial advice.
            We are not responsible for any trading losses incurred while using this software.
          </Typography>
        </Paper>
      </Container>
    </AppTheme>
  );
};

export default HelpPage;
