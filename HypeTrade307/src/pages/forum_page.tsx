import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../App.css'


// import * as React from 'react';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Navbar from "../components/NavbarSection/Navbar.tsx";
// import Header from '../components/Header';
import MainGrid from '../components/MainGrid';
// import SideMenu from '../components/SideMenu';
import AppTheme from '../components/shared-theme/AppTheme';
import {
    chartsCustomizations,
    dataGridCustomizations,
    datePickersCustomizations,
    treeViewCustomizations,
} from '../components/shared-theme/customizations';

const xThemeComponents = {
    ...chartsCustomizations,
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...treeViewCustomizations,
};

function Forum(props: { disableCustomTheme?: boolean }) {
    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Box sx={{
                display: 'flex',
                width: {
                    xs: 1, // theme.breakpoints.up('xs')
                    sm: 700, // theme.breakpoints.up('sm')
                    md: 800, // theme.breakpoints.up('md')
                    lg: 1000, // theme.breakpoints.up('lg')
                    xl: 1200, // theme.breakpoints.up('xl')
                },
            }}>
                <Navbar />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars
                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(theme.palette.background.default, 1),
                        overflow: 'auto',
                    })}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            alignItems: 'center',
                            mx: 3,
                            pb: 5,
                            mt: { xs: 8, md: 0 },
                        }}
                    >
                        <MainGrid />
                    </Stack>
                </Box>
            </Box>
        </AppTheme>
    );
}


export default Forum
