import CssBaseline from "@mui/material/CssBaseline";
import '../App.css'
import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import reactLogo from "../assets/react.svg";

export default function About(props: {disableCustomTheme?: boolean }) {
    return (

        <>
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Navbar />
        <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
            {/* Header Section and temp logo */}

            <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
            <header className="text-center py-10">
    <h1 className="text-4xl font-bold text-blue-600">About </h1>
    <p className="mt-2 text-lg text-gray-600">Learn more about our project and team.</p>
    </header>

    {/* Mission Section */}
    <section className="max-w-3xl mx-auto text-center my-10">
    <h2 className="text-2xl font-semibold text-gray-700">Our Purpose</h2>
    <p className="mt-4 text-gray-600">
        we are dedicated to revolutionizing stock market analysis by integrating real-time sentiment insights into the
        decision-making process of traders, investors, and financial analysts. Our platform leverages advanced
        Language Processing (NLP) and machine learning models like FinBERT to analyze discussions from Reddit and other
        potential sources, capturing the pulse of the market from retail traders and investors.<br />

        Unlike traditional analysis tools that focus solely on price movements and financial statements, we provide
        quantitative sentiment metrics that reveal the underlying psychological and social drivers influencing stock
        trends. By monitoring sentiment shifts in real time, we empower intraday traders, swing traders, and
        institutional investors to identify opportunities early and react swiftly to market dynamics.<br />

        Our customizable dashboard offers sentiment scores, historical trends, and real-time alerts on drastic sentiment
        changes. Additionally, portfolio tracking helps users understand how sentiment impacts their holdings, while our
        community feature fosters collaboration and shared market insights.<br />

        By bridging the gap between social sentiment and stock performance, our mission is to provide traders with
        actionable insights that enhance decision-making. As we continue refining our sentiment analysis accuracy and
        expanding our platform, we aim to become an essential tool for navigating today’s fast-paced financial <br />
    </p>
    </section>

    {/* Team Section */}
    <section className="max-w-4xl mx-auto text-center my-10">
    <h2 className="text-2xl font-semibold text-gray-700">Meet the Team</h2>
    <div className="flex flex-wrap justify-center gap-6 mt-6">
        {/* Team Member */}
        <div className="bg-white p-6 rounded-lg shadow-md w-64">


        </div>

        <div className="bg-white p-6 rounded-lg shadow-md w-64">

    <h3 className="text-lg font-bold mt-4">Aditya Gandhi, Michael Carrillo, Ramazan Kaan Cetin, Jackson Mehling, Owen Metzger, Parker Higgins</h3>
    <p className="text-gray-500">Lead Developers</p>
    </div>
    </div>
    </section>
    </div>
        </AppTheme>
        </>
);
}
