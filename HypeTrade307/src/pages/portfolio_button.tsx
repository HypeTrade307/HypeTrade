//@ts-nocheck
import '../index.css';
import { useNavigate } from 'react-router-dom';
function Portfolio_button({ friendID }: { friendID: number }) {
    const navigate = useNavigate()

    return (
      <button onClick={() => navigate(`/PortView/${friendID}`)}>
      Portfolio
    </button>
  );
}

export default Portfolio_button; // Default export