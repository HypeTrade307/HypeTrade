import Navbar from "../components/NavbarSection/Navbar.tsx";
import AppTheme from '../components/shared-theme/AppTheme';
import CssBaseline from "@mui/material/CssBaseline";
function Page_Not_found(props: {disableCustomTheme?: boolean }){
  return (

      <>
          <AppTheme {...props}>
              <CssBaseline enableColorScheme />
        <Navbar />

        <div>
          <h1>PageNotfound</h1>
          <p>pray.</p>

        </div>
      </AppTheme>
      </>
  );
}

export default Page_Not_found;