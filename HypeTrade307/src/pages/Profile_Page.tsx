import Example from "./delete_button.tsx";
import Home_page_button from "./Home_page_button.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme.tsx";

function Profile_page(props: {disableCustomTheme?: boolean }){
    return (

        <>
            <AppTheme {...props}>
                <CssBaseline enableColorScheme />
                <Navbar />
                <div>
                    <Home_page_button />
                    <h1>Profile_page</h1>
                    <Example />
                    <p>Stocks.</p>
                </div>
                </AppTheme>
        </>
    );
}

export default Profile_page;