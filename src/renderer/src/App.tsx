import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Test IPC communication
    window.electronAPI?.ping().then(setMessage);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Electron App
          </Typography>
          <IconButton color="inherit">
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Welcome to Electron + React + MUI
                </Typography>
                <Typography variant="body1" paragraph>
                  This is a modern Electron application built with:
                </Typography>
                <ul>
                  <li>React 18 with TypeScript</li>
                  <li>Vite for fast development</li>
                  <li>Material-UI for beautiful components</li>
                  <li>Electron for desktop integration</li>
                </ul>
                <Typography variant="body2" color="text.secondary">
                  IPC Test Result: {message}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Quick Actions
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" startIcon={<HomeIcon />}>
                    Home
                  </Button>
                  <Button variant="outlined" startIcon={<SettingsIcon />}>
                    Settings
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;
