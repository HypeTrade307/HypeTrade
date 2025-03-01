import Example from "./delete_button.tsx";
import Home_page_button from "./Home_page_button.tsx";

function Profile_page(){
    return (
        <div>
            <Home_page_button />
            <h1>Profile_page</h1>
            <Example />
            <p>stocks.</p>
        </div>
    );
}

export default Profile_page;