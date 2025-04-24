//@ts-nocheck
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import '../index.css'
import './Page_Not_found.css';
import CssBaseline from "@mui/material/CssBaseline/CssBaseline";
import AreaGraph from "../assets/area_Graph.tsx";

import ProfileDownloader from "../assets/dowload_profile_test.tsx";
function Page_Not_found(props: {disableCustomTheme?: boolean }){
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <div >
        <Navbar />
        
          <h1>PageNotfound<br /></h1>
          <p>A error has occured, please return to the main page<br /> <br /> </p>
          <AreaGraph ticker="AAPL" />
         <ProfileDownloader/>
      </div>
      </AppTheme>
  );
}

export default Page_Not_found;