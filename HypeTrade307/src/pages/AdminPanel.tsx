// pages/AdminPanel.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css"; // optional styling

interface Flag {
    flag_id: number;
    user_id: number;
    flag_type: "user" | "post" | "comment" | "thread";
    target_id: number;
    reason?: string;
    created_at: string;
    thread_id?: number;
    post_id?: number;
}

interface FlaggedContent {
    content?: string;
    title?: string;
    author?: string;
    created_at?: string;
    flagReason?: string;
    flaggedAt?: string;
}

export default function AdminPanel() {
    const [flags, setFlags] = useState<Flag[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Not authenticated");
            navigate("/login");
            return;
        }
        axios.get("http://localhost:8080/flag/all", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => setFlags(res.data))
            .catch((err) => {
                console.error(err);
                toast.error("Failed to fetch flags");
            });
    }, []);

    const handleRemove = async (flag_id: number) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8080/flag/${flag_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Flag removed");
            setFlags(flags.filter(f => f.flag_id !== flag_id));
        } catch (error) {
            console.error(error);
            toast.error("Error removing flag");
        }
    };
    const handleRemoveContent = async (flag_id: number) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`http://localhost:8080/flag/${flag_id}/remove_with_content`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Content and flag removed");
            setFlags(flags.filter(f => f.flag_id !== flag_id));
        } catch (error) {
            console.error(error);
            toast.error("Error removing content");
        }
    };

    const handleReview = async (flag: Flag) => {
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            let flaggedContent: FlaggedContent = {};
            
            switch (flag.flag_type) {
                case "post":
                    try {
                        const response = await axios.get(
                            `http://localhost:8080/posts/${flag.thread_id}/${flag.target_id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        flaggedContent = {
                            title: response.data.title || 'No title',
                            content: response.data.content || 'No content',
                            author: response.data.author?.username || 'Unknown author',
                            created_at: response.data.created_at
                        };
                    } catch (error) {
                        flaggedContent = {
                            title: 'Post',
                            content: 'This post may have been deleted',
                            author: 'Unknown',
                            created_at: flag.created_at
                        };
                    }
                    break;

                case "comment":
                    try {
                        const response = await axios.get(
                            `http://localhost:8080/thread/${flag.thread_id}/posts/${flag.post_id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        flaggedContent = {
                            content: response.data.content || 'No content',
                            author: response.data.author?.username || 'Unknown author',
                            created_at: response.data.created_at
                        };
                    } catch (error) {
                        flaggedContent = {
                            content: 'This comment may have been deleted',
                            author: 'Unknown',
                            created_at: flag.created_at
                        };
                    }
                    break;

                case "thread":
                    try {
                        const response = await axios.get(
                            `http://localhost:8080/threads/${flag.target_id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        flaggedContent = {
                            title: response.data.title || 'No title',
                            author: response.data.creator?.username || 'Unknown author',
                            created_at: response.data.created_at
                        };
                    } catch (error) {
                        flaggedContent = {
                            title: 'Thread',
                            content: 'This thread may have been deleted',
                            author: 'Unknown',
                            created_at: flag.created_at
                        };
                    }
                    break;

                case "user":
                    try {
                        const response = await axios.get(
                            `http://localhost:8080/users/${flag.target_id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        flaggedContent = {
                            content: `Username: ${response.data.username}`,
                            created_at: response.data.created_at,
                            author: response.data.username
                        };
                    } catch (error) {
                        flaggedContent = {
                            content: 'This user account may have been deleted',
                            created_at: flag.created_at
                        };
                    }
                    break;
            }

            // Add flag information to the content
            flaggedContent.flagReason = flag.reason || 'No reason provided';
            flaggedContent.flaggedAt = flag.created_at;

            setSelectedContent(flaggedContent);
            setShowReviewModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (flag: Flag) => {
        switch (flag.flag_type) {
            case "post":
                if (flag.thread_id) {
                    navigate(`/thread/${flag.thread_id}/${flag.target_id}`);
                } else {
                    toast.error("Unable to navigate: missing thread information");
                }
                break;
            case "thread":
                navigate(`/thread/${flag.target_id}`);
                break;
            case "user":
                navigate(`/profile/${flag.target_id}`);
                break;
            case "comment":
                if (flag.thread_id && flag.post_id) {
                    navigate(`/thread/${flag.thread_id}/${flag.post_id}`);
                } else {
                    toast.error("Unable to navigate: missing thread/post information");
                }
                break;
        }
        setShowReviewModal(false);
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel - Flagged Content</h2>
            {flags.length === 0 ? (
                <p>No flagged content.</p>
            ) : (
                <table className="flag-table">
                    <thead>
                        <tr>
                            <th>Flag ID</th>
                            <th>Type</th>
                            <th>Target ID</th>
                            <th>Reason</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flags.map((flag) => (
                            <tr key={flag.flag_id}>
                                <td>{flag.flag_id}</td>
                                <td>{flag.flag_type}</td>
                                <td>{flag.target_id}</td>
                                <td>{flag.reason || "No reason"}</td>
                                <td>{new Date(flag.created_at).toLocaleString()}</td>
                                <td className="action-buttons">
                                    <button 
                                        className="review-button"
                                        onClick={() => handleReview(flag)}
                                    >
                                        Review
                                    </button>
                                    <button 
                                        className="keep-button"
                                        onClick={() => handleRemove(flag.flag_id)}
                                    >
                                        Keep
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => handleRemoveContent(flag.flag_id)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {/* Review Modal */}
            {showReviewModal && selectedContent && (
                <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="review-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="review-modal-header">
                            <h3>Flagged Content Review</h3>
                            <button 
                                className="close-button"
                                onClick={() => setShowReviewModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="review-modal-body">
                            {selectedContent.title && (
                                <div className="content-title">
                                    <strong>Title:</strong> {selectedContent.title}
                                </div>
                            )}
                            {selectedContent.content && (
                                <div className="content-body">
                                    <strong>Content:</strong> {selectedContent.content}
                                </div>
                            )}
                            {selectedContent.author && (
                                <div className="content-author">
                                    <strong>Author:</strong> {selectedContent.author}
                                </div>
                            )}
                            <div className="content-date">
                                <strong>Created:</strong> {new Date(selectedContent.created_at || '').toLocaleString()}
                            </div>
                            <div className="flag-info">
                                <strong>Flag Reason:</strong> {selectedContent.flagReason}
                                <br />
                                <strong>Flagged At:</strong> {new Date(selectedContent.flaggedAt || '').toLocaleString()}
                            </div>
                        </div>
                        <div className="review-modal-footer">
                            <button 
                                className="navigate-button"
                                onClick={() => handleNavigate(flags.find(f => 
                                    f.created_at === selectedContent.flaggedAt
                                )!)}
                            >
                                Go to Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}