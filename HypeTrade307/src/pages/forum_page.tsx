import { useState, useEffect } from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import '../App.css';

import type {} from '@mui/x-date-pickers/themeAugmentation';
import type {} from '@mui/x-charts/themeAugmentation';
import type {} from '@mui/x-data-grid-pro/themeAugmentation';
import type {} from '@mui/x-tree-view/themeAugmentation';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Navbar from "../components/NavbarSection/Navbar.tsx";
import MainGrid from '../components/MainGrid';
import AppTheme from '../components/shared-theme/AppTheme';
import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
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
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        { title: "Forum Page", description: "This is where you can engage with the community and discuss your thoughts on stocks." },
        { title: "Data Safety", description: "Discussions on these forums are not used for the sentiment analysis of stocks." },
        { title: "Forum info", description: "Every forum is centered around a stock and topics about that stock (listed under content)." },
        { title: "Posting a Topic", description: "You can create new topics and join conversations with others." },
        { title: "You're All Set!", description: "You're now ready to engage in the forum. Enjoy!" },
    ];

    const nextStep = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        } else {
            setTutorialOpen(false); // Close tutorial when finished
        }
    };

    // Check if tutorial should be displayed from local storage
    useEffect(() => {
        const tutorialMode = JSON.parse(localStorage.getItem("tutorialMode") || "false");
        if (tutorialMode) {
            setTutorialOpen(true); // Show tutorial if enabled
        }
    }, []);

    return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <CssBaseline enableColorScheme />
            <Box sx={{ display: 'flex' }}>
                {/* // TODO: fix sidebar styling */}
                {/* <SideMenu /> */}
                <Navbar />
                {/* Main content */}
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
                        {/* <Header /> */}
                        <MainGrid />
                    </Stack>
                </Box>
            </Box>

            {/* Tutorial Popup */}
            <Dialog
                open={tutorialOpen}
                onClose={() => {}} // Prevents clicking outside from closing
                sx={{
                    position: "fixed",
                    left: "5%",
                    top: "50%",
                    transform: "translateY(-50%)",
                    maxWidth: "300px"
                }}
                disableEscapeKeyDown
                hideBackdrop
            >
                <DialogTitle>{tutorialSteps[step].title}</DialogTitle>
                <DialogContent>
                    <p>{tutorialSteps[step].description}</p>
                    <Button onClick={nextStep}>{step < tutorialSteps.length - 1 ? "Next" : "Finish"}</Button>
                </DialogContent>
            </Dialog>
        </AppTheme>
    );
}

export default Forum;