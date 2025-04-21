import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown.tsx';
import Sitemark from '../SitemarkIcon';
import UserSearchBar from './UserSearchBar';
import type {} from '@mui/material/themeCssVarsAugmentation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // used for the generic user icon

import { API_BASE_URL } from "../../config";

const pages = ['Home', 'ViewStock', 'Portfolio', 'Profile', 'Search', 'Friends', 'Chat', 'Forum'];

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
    backdropFilter: 'blur(24px)',
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.divider,
    backgroundColor: theme.vars
        ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
        : alpha(theme.palette.background.default, 0.4),
    boxShadow: (theme.vars || theme).shadows[1],
    padding: '8px 12px',
}));

// Styled username display
const UsernameDisplay = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: '0.9rem',
    marginRight: '8px',
}));

const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data) {
                    setIsAuthenticated(true);
                    setUsername(response.data.username);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
                localStorage.removeItem('token');
            }
        };

        checkAuth();
    }, []);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUsername('');
        toast.success('Signed out successfully');
        navigate('/');
    };

    // Navigation for menu items
    async function handleMenuClick(pageName: string) {
        if (pageName === "Home") {
            window.location.href = `/`;
        } else if (pageName === "Portfolio") {
            window.location.href = `/portfolio`;
        } else if (pageName === "Profile") {
            window.location.href = `/profile`;
        } else if (pageName === "Login") {
            window.location.href = `/login`;
        } else if (pageName === "Search") {
            window.location.href = `/search`;
        } else if (pageName === "Friends") {
            window.location.href = `/friends`;
        } else if (pageName === "ViewStock") {
            window.location.href = `/stock`;
        } else if (pageName === "Forum") {
            window.location.href = `/forum`;
        } else if (pageName === "Chat") {
            window.location.href = `/chat`;
        } else if (pageName === "Help") {
            window.location.href = `/help`;
        }
        else {
            try {
                // TODO: Update once we have login working with database
            } catch {
                alert("Error!");
            }
        }
    };

    return (
        <AppBar
            position="fixed"
            enableColorOnDark
            sx={{
                boxShadow: 0,
                bgcolor: 'transparent',
                backgroundImage: 'none',
                mt: 0,
                width: '100%',
            }}
        >
            <div style={{ height: '15px' }} /> {/* adds white space */}
            <Container maxWidth="xl">
                <StyledToolbar variant="dense" disableGutters>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
                        <Sitemark />
                        <UserSearchBar />
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            {pages.map((page) => (
                                <Button
                                    variant="text"
                                    color="info"
                                    size="small"
                                    key={page}
                                    onClick={() => handleMenuClick(page)}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            gap: 1,
                            alignItems: 'center',
                            ml: 'auto',
                        }}
                    >
                        {isAuthenticated ? (
                            <>
                                <UsernameDisplay>
                                    <AccountCircleIcon fontSize="small" />
                                    <Typography variant="body2">{username}</Typography>
                                </UsernameDisplay>
                                <Button color="primary" variant="contained" size="small"
                                        onClick={handleSignOut}
                                >
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="primary" variant="text" size="small"
                                        onClick={() => handleMenuClick("Login")}
                                >
                                    Sign in
                                </Button>
                                <Button color="primary" variant="contained" size="small"
                                        onClick={() => handleMenuClick("Login")}
                                >
                                    Sign up
                                </Button>
                            </>
                        )}
                        <ColorModeIconDropdown />
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
                        <ColorModeIconDropdown size="medium" />
                        <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            anchor="top"
                            open={open}
                            onClose={toggleDrawer(false)}
                            PaperProps={{
                                sx: {
                                    top: 0,
                                },
                            }}
                        >
                            <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton onClick={toggleDrawer(false)}>
                                        <CloseRoundedIcon />
                                    </IconButton>
                                </Box>

                                {pages.map((page) => (
                                    <MenuItem
                                        key={page}
                                        onClick={() => handleMenuClick(page)}
                                    >
                                        {page}
                                    </MenuItem>
                                ))}

                                <Divider sx={{ my: 3 }} />
                                {isAuthenticated ? (
                                    <>
                                        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AccountCircleIcon color="primary" />
                                            <Typography variant="body1" fontWeight="bold" color="primary">
                                                {username}
                                            </Typography>
                                        </Box>
                                        <MenuItem>
                                            <Button
                                                color="primary" variant="contained" fullWidth
                                                onClick={handleSignOut}
                                            >
                                                Sign out
                                            </Button>
                                        </MenuItem>
                                    </>
                                ) : (
                                    <>
                                        <MenuItem>
                                            <Button
                                                color="primary" variant="contained" fullWidth
                                                onClick={() => handleMenuClick("Login")}
                                            >
                                                Sign up
                                            </Button>
                                        </MenuItem>
                                        <MenuItem>
                                            <Button
                                                color="primary" variant="outlined" fullWidth
                                                onClick={() => handleMenuClick("Login")}
                                            >
                                                Sign in
                                            </Button>
                                        </MenuItem>
                                    </>
                                )}
                            </Box>
                        </Drawer>
                    </Box>
                </StyledToolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;