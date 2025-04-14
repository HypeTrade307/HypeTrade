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
import { useNavigate } from 'react-router-dom';
import type {} from '@mui/material/themeCssVarsAugmentation';

const pages = ['Home', 'ViewStock', 'Portfolio', 'Profile', 'Search', 'Friends', 'Chat', 'Forum', 'Help'];

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

const Navbar = () => {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    const handleMenuClick = (pageName: string, openSignup = false) => {
        if (pageName === 'Home') {
            navigate('/');
        } else if (pageName === 'ViewStock') {
            navigate('/stock');
        } else if (pageName === 'Portfolio') {
            navigate('/portfolio/:friendID');
        } else if (pageName === 'Profile') {
            navigate('/profile');
        } else if (pageName === 'Login') {
            navigate('/login', { state: { openSignup } });
        } else if (pageName === 'Search') {
            navigate('/search');
        } else if (pageName === 'Friends') {
            navigate('/friends');
        } else if (pageName === 'Forum') {
            navigate('/forum');
        } else if (pageName === 'Chat') {
            navigate('/chat');
        } else if (pageName === 'Help') {
            navigate('/help');
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
                mt: 'calc(var(--template-frame-height, 0px) + 28px)',
            }}
        >
            <Container maxWidth="lg">
                <StyledToolbar variant="dense" disableGutters>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
                        <Sitemark />
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
                        }}
                    >
                        <Button
                            color="primary"
                            variant="text"
                            size="small"
                            onClick={() => handleMenuClick('Login')}
                        >
                            Log in
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            size="small"
                            onClick={() => handleMenuClick('Login', true)}
                        >
                            Sign up
                        </Button>
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
                                    top: 'var(--template-frame-height, 0px)',
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
                                <MenuItem>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        fullWidth
                                        onClick={() => handleMenuClick('Login', true)}
                                    >
                                        Sign up
                                    </Button>
                                </MenuItem>
                                <MenuItem>
                                    <Button
                                        color="primary"
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => handleMenuClick('Login')}
                                    >
                                        Sign in
                                    </Button>
                                </MenuItem>
                            </Box>
                        </Drawer>
                    </Box>
                </StyledToolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
