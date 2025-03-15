import { useNavigate } from "react-router-dom";

const BackToFriendsButton: React.FC = () => {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigate("/friends")} style={buttonStyle}>
            Back to Friends
        </button>
    );
};

// Optional inline styles (or use CSS module)
const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px"
};

export default BackToFriendsButton;