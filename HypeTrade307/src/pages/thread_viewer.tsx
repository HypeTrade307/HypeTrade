import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button
} from "@mui/material";
import "./Thread.css";
import { API_BASE_URL } from '../config';

// Define interfaces
interface Post {
    post_id: number;
    title: string;
    content: string;
    author_id: number;
    created_at: string;
    author?: {
        username: string;
    };
}

interface Thread {
    thread_id: number;
    title: string;
    creator_id: number;
    stock_id: number;
    created_at: string;
    stock_ref?: {
        ticker: string;
        stock_name: string;
    };
}

function ThreadViewer() {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const [thread, setThread] = useState<Thread | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // Tutorial state
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [step, setStep] = useState(0);

    const tutorialSteps = [
        { title: "Welcome to the Thread", description: "Here you can see all posts in this thread." },
        { title: "Viewing Posts", description: "Click on any post to view or reply to it." },
        { title: "Posting", description: "Click 'Create Post' to contribute to the discussion." },
        { title: "You're Ready!", description: "That's it! Start participating in the conversation." }
    ];

    const nextStep = () => {
        if (step < tutorialSteps.length - 1) {
            setStep(step + 1);
        } else {
            setTutorialOpen(false);
        }
    };

    // Fetch thread details
    useEffect(() => {
        async function fetchThread() {
            try {
                const token = localStorage.getItem("token");
                // if (!token) {
                //     setError("Not authenticated");
                //     setLoading(false);
                //     return;
                // }
                console.log(`something something and my id is ${threadId}`);

                const response = await axios.get(`${API_BASE_URL}/threads/${threadId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Data sent to API:", { response });

                setThread(response.data);
            } catch (err: any) {
                    console.error("Full error response:", err.response?.data);
                    setError(JSON.stringify(err.response?.data, null, 2));  // Pretty print error
            }
        }

        fetchThread();
    }, [threadId]);

    // Fetch posts for thread
    useEffect(() => {
        async function fetchPosts() {
            if (!threadId) return;

            try {
                const token = localStorage.getItem("token");

                console.log(`creating post`);
                const response = await axios.get(`${API_BASE_URL}/threads/${threadId}/posts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(`created post`);

                setPosts(response.data);
            } catch (err: any) {
                console.error("Error fetching posts:", err);
                setError(err.response?.data?.detail || "Failed to load posts");
            } finally {
                setLoading(false);
            }
        }

        fetchPosts();
    }, [threadId]);

    // Show tutorial on page load if enabled
    useEffect(() => {
        const tutorialMode = JSON.parse(localStorage.getItem("tutorialMode") || "false");
        if (tutorialMode) {
            setTutorialOpen(true);
        }
    }, []);

    // Create post
    const handleCreatePost = async () => {
        if (!title || !content) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not authenticated");
                return;
            }

            await axios.post(
                `${API_BASE_URL}/threads/${threadId}/posts`,
                {
                    title: title,
                    content: content
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Clear form and refresh posts
            handleCloseModal();

            // Fetch updated posts
            const response = await axios.get(`${API_BASE_URL}/threads/${threadId}/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPosts(response.data);
        } catch (err: any) {
            console.error("Error creating post:", err);
            setError(err.response?.data?.detail || "Failed to create post");
        }
    };

    // Reset modal
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setTitle("");
        setContent("");
    };

    // Handle clicks outside the modal to close it
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).classList.contains("modal-overlay")) {
            handleCloseModal();
        }
    };

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Navbar />
            <div className="thread-container">
                {/* Thread Header */}
                {/* Back Button */}
            <div style={{ padding: "1rem 0" }}>
                <button
                    className="back-to-forum-button"
                    onClick={() => navigate("/forum")}
                    style={{
                        position: "fixed",
                        top: "80px",
                        left: "40px",
                        zIndex: 1300,
                        padding: "8px 16px",
                        backgroundColor: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 500,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                    }}
                >
                    ← Back to Forum
                </button>
            </div>
                {thread && (
                    <div className="thread-header">
                        <h1>{thread.title}</h1>
                        {thread.stock_ref && (
                            <div className="thread-stock-info">
                                <span className="stock-badge">
                                    {thread.stock_ref.ticker} - {thread.stock_ref.stock_name}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="create-post-button"
                        >
                            Create Post
                        </button>
                    </div>
                )}

                {/* Post List */}
                <div className="post-list">
                    {loading ? (
                        <div className="loading-indicator">Loading posts...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <div
                                key={post.post_id}
                                className="post-item"
                                onClick={() => navigate(`${post.post_id}`)}
                            >
                                <div className="post-header">
                                    <div className="post-title">{post.title}</div>
                                    <div className="post-date">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="post-content">
                                    {post.content}
                                </div>
                                {post.author && (
                                    <div className="post-author">
                                        Posted by: {post.author.username}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No posts available. Be the first to post!</div>
                    )}
                </div>

                {/* Create Post Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={handleOverlayClick}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Create New Post</h2>
                                <button className="close-button" onClick={handleCloseModal}>×</button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="post-title">Post Title:</label>
                                    <input
                                        id="post-title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter post title"
                                        className="post-title-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="post-content">Content:</label>
                                    <textarea
                                        id="post-content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write your post content here..."
                                        className="post-content-input"
                                        rows={6}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="create-button"
                                    onClick={handleCreatePost}
                                    disabled={!title || !content}
                                >
                                    Create Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tutorial Dialog */}
                <Dialog
                    open={tutorialOpen}
                    onClose={() => {}}
                    hideBackdrop
                    disableEscapeKeyDown
                    disableEnforceFocus
                    PaperProps={{
                        sx: {
                            position: 'absolute',
                            top: '50%',
                            left: '5%',
                            transform: 'translateY(-50%)',
                            maxWidth: 400,
                            padding: 2,
                            zIndex: 1301,
                            pointerEvents: 'auto',
                        },
                    }}
                    sx={{ pointerEvents: 'none' }}
                >
                    <DialogTitle>{tutorialSteps[step].title}</DialogTitle>
                    <DialogContent>
                        <p>{tutorialSteps[step].description}</p>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={nextStep}
                        >
                            {step < tutorialSteps.length - 1 ? "Next" : "Finish"}
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
        </AppTheme>
    );
}

export default ThreadViewer;