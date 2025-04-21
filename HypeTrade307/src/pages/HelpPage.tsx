//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { CssBaseline, Container, Typography, Switch, FormControlLabel, Box } from '@mui/material';
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import "./HelpPage.css"; // Import CSS file

const HelpPage = () => {
  const [tutorialMode, setTutorialMode] = useState<boolean>(
    JSON.parse(localStorage.getItem('tutorialMode') || 'false')
  );

  useEffect(() => {
      console.log("useEffect ran!");
    localStorage.setItem('tutorialMode', JSON.stringify(tutorialMode));
    console.log("Tutorial Mode Updated:", tutorialMode); // Debugging log
  }, [tutorialMode]);

  const handleToggle = () => {
    setTutorialMode((prev) => !prev);
  };

  return (
    <AppTheme>
      <CssBaseline />
      <Navbar />
      <Box sx={{ mt: 2, px: 2 }}>
        <Typography variant="h4" className="help-header">
          Help & Getting Started
        </Typography>
      </Box>
      <Container maxWidth="md" className="help-container">
        <Typography variant="body1" paragraph>
          Welcome to HypeTrade! This platform uses sentiment analysis from stock discussions
          to evaluate market sentiment and help predict stock movements. By analyzing
          large-scale social media and news data, HypeTrade provides insights into whether
          a stock may rise or fall based on public perception.
        </Typography>
        <Typography variant="body1" paragraph>
          To use HypeTrade effectively:
        </Typography>
        <Box component="ul" className="help-list">
          <Box component="li">Search for a stock to view sentiment analysis.</Box>
          <Box component="li">Analyze the sentiment trend over time.</Box>
          <Box component="li">Use insights to complement your research and make informed investment decisions.</Box>
        </Box>
        <FormControlLabel
          control={<Switch checked={tutorialMode} onChange={handleToggle} />}
          label="Enable Tutorial Mode"
        />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 4 }}>
          Disclaimer: HypeTrade provides sentiment-based insights and does not constitute financial advice.
          We are not responsible for any trading losses incurred while using this software.
        </Typography>
      </Container>
    </AppTheme>
  );
};

export default HelpPage;