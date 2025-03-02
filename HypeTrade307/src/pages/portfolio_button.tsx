import '../index.css';
import { useNavigate } from 'react-router-dom';
function Portfolio_button({ friendName }: { friendName: string }) {
    const navigate = useNavigate()

    return (
      <button onClick={() => navigate(`/portfolio/${friendName}`)}>
      Portfolio
    </button>
  );
}

export default Portfolio_button; // Default export