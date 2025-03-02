import { useState } from "react";
import Example from "./delete_button.tsx";
import Button from "react-bootstrap/Button";

function ProfilePage() {
    const [showExample, setShowExample] = useState(false);

    return (
        <div className="text-center">
            <h1>Profile Page</h1>
            <Button variant="primary" onClick={() => setShowExample(true)}>
                Show Delete Option
            </Button>
            <h1></h1>
            {showExample && <Example />}

            <p>Stocks.</p>
        </div>
    );
}

export default ProfilePage;