// ThreadViewer.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Page_Not_found from "./Page_Not_found";

interface Post {
  post_id: number;
  content: string;
  created_at: string;
  author: {
    username: string;
  };
}
interface StockBase {
    stock_id: number;
    ticker: string;
    stock_name: string;
  }
interface ThreadDetails {
  thread_id: number;
  title: string;
  stocks: StockBase[];
  posts: Post[];
}

export default function ThreadViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState<ThreadDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [availableStocks, setAvailableStocks] = useState<StockBase[]>([]);
  const [stockSearch, setStockSearch] = useState("");
  const [filteredStocks, setFilteredStocks] = useState<StockBase[]>([]);

  // one fetch thread
  useEffect(() => {
    async function fetchThread() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://127.0.0.1:8000/threads/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setThread(response.data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    fetchThread();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <Page_Not_found />;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back to Forum</button>
      <h2>{thread?.title}</h2>
      <h3>Discussion about: {thread?.stocks.ticker} - {thread?.stocks.stock_name}</h3>

      <div style={{ marginTop: "2rem" }}>
        <h4>Posts</h4>
        {thread?.posts.length ? (
          thread.posts.map(post => (
            <div key={post.post_id} style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ddd" }}>
              <p>{post.content}</p>
              <small>By {post.author.username} • {new Date(post.created_at).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No posts yet. Be the first to contribute!</p>
        )}
      </div>
    </div>
  );
}