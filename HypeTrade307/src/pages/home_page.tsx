//@ts-nocheck
import { useState } from 'react'

import '../App.css'

import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
// import Divider from '@mui/material/Divider';
import AppTheme from '../components/shared-theme/AppTheme';
// import AppAppBar from './components/AppAppBar';
// import Hero from './components/Hero';
// import LogoCollection from './components/LogoCollection';
// import Highlights from './components/Highlights';
// import Pricing from './components/Pricing';
// import Features from './components/Features';
// import Testimonials from './components/Testimonials';
// import FAQ from './components/FAQ';
// import Footer from './components/Footer';
import HeatMap from "../assets/heatmap_Graph.tsx";

import ButtonToPortfolio from "./button_to_Portfolio_Creation.tsx";
import ThemeToggle from '../assets/theme_handler.tsx';

function Home(props: {disableCustomTheme?: boolean }) {
    const [count, setCount] = useState(0)

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />

                <Navbar />
               
                <div style={{ height: '20px' }} /> {/* adds white space */}
                <h1 color='black' >HYPETRADE</h1>
                <h1 color='black'> Mainpage</h1>
                <p >________________________________________________________________________________________________________________________________________________________________________</p>
                      

                <HeatMap/>
            </AppTheme>
        </>
    )
}

export default Home
