import Home_page_button from "./Home_page_button.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";

function Page_Not_found(){
  return (

      <>
        <Navbar />
        <div>
          <h1>PageNotfound</h1>
          <p>pray.</p>
          <Home_page_button />
        </div>
      </>
  );
}

export default Page_Not_found;