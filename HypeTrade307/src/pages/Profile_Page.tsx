import Example from "./delete_button.tsx";
import Home_page_button from "./Home_page_button.tsx";
import Navbar from "../components/NavbarSection/Navbar.tsx";

function Profile_page(){
    return (

        <>
            <Navbar />
            <div>
                <Home_page_button />
                <h1>Profile_page</h1>
                <Example />
                <p>stocks.</p>
            </div>
        </>
    );
}

export default Profile_page;