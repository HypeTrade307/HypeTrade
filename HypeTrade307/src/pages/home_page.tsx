import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
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

import ButtonToPortfolio from "./button_to_Portfolio_Creation.tsx";

function Home(props: {disableCustomTheme?: boolean }) {
    const [count, setCount] = useState(0)

    return (
        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />

                <Navbar />
                {/*// <Hero />*/}
                <div>
                    {/*<LogoCollection />*/}
                    {/*<Features />*/}
                    {/*<Divider />*/}
                    {/*<Testimonials />*/}
                    {/*<Divider />*/}
                    {/*<Highlights />*/}
                    {/*<Divider />*/}
                    {/*<Pricing />*/}
                    {/*<Divider />*/}
                    {/*<FAQ />*/}
                    {/*<Divider />*/}
                    {/*<Footer />*/}
                </div>

                <div>
                    <a href="https://vite.dev" target="_blank">
                        <img src={viteLogo} className="logo" alt="Vite logo" />
                    </a>
                    <a href="https://react.dev" target="_blank">
                        <img src={reactLogo} className="logo react" alt="React logo" />
                    </a>
                </div>
                <h1>Vite + React</h1>
                <div className="card">
                    <ButtonToPortfolio></ButtonToPortfolio>
                    <button onClick={() => setCount((count) => count + 1)}>
                        count is {count}
                    </button>
                    <p>
                        Edit <code>src/App.tsx</code> and save to test HMR. this sources from repo
                    </p>
                </div>
                <p className="read-the-docs">
                    Click on the Vite || React logos to learn more
                </p>
            </AppTheme>

            {/*<div>*/}
            {/*    <a href="https://vite.dev" target="_blank">*/}
            {/*        <img src={viteLogo} className="logo" alt="Vite logo" />*/}
            {/*    </a>*/}
            {/*    <a href="https://react.dev" target="_blank">*/}
            {/*        <img src={reactLogo} className="logo react" alt="React logo" />*/}
            {/*    </a>*/}
            {/*</div>*/}
            {/*<h1>Vite + React</h1>*/}
            {/*<div className="card">*/}
            {/*    <ButtonToPortfolio></ButtonToPortfolio>*/}
            {/*    <button onClick={() => setCount((count) => count + 1)}>*/}
            {/*        count is {count}*/}
            {/*    </button>*/}
            {/*    <p>*/}
            {/*        Edit <code>src/App.tsx</code> and save to test HMR*/}
            {/*    </p>*/}
            {/*</div>*/}
            {/*<p className="read-the-docs">*/}
            {/*    Click on the Vite || React logos to learn more*/}
            {/*</p>*/}
        </>
    )
}

export default Home
