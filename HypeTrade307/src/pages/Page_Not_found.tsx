//@ts-nocheck
import AppTheme from "../components/shared-theme/AppTheme.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";
import '../index.css'
import './Page_Not_found.css';
import CssBaseline from "@mui/material/CssBaseline/CssBaseline";
import AreaGraph from "../assets/area_Graph.tsx";

import ProfileDownloader from "../assets/dowload_profile_test.tsx";
import HeatMap from "../assets/heatmap_Graph.tsx";
import HeatMapend from "../assets/heat_backend.tsx";
function Page_Not_found(props: {disableCustomTheme?: boolean }){
  return (
    <AppTheme {...props}>
      
      <CssBaseline enableColorScheme />
      <div >
        <Navbar />
        <div style={{ height: '15px' }} /> {/* adds white space */}
          <h1>PageNotfound<br /></h1>
          <p>A error has occured, please return to the main page<br /> <br /> </p>
      </div>
      </AppTheme>
  );
}

export default Page_Not_found;