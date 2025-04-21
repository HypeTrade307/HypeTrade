//@ts-nocheck
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
    Button,
    Box,
    Paper
} from "@mui/material";
import FlagButton from "./FlagButton";
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

export default function ThreadViewer() {
    const { threadId } = useParams<{ threadId: string }>();
    const navigate = useNavigate();
    const [thread, setThread] = useState<Thread | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create post modal state
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
        if (step < tutorialSteps.length - 1) setStep(step + 1);
        else setTutorialOpen(false);
    };

    // Fetch thread details
    useEffect(() => {
        if (!threadId) return;
        const token = localStorage.getItem("token");
        axios.get(`${API_BASE_URL}/threads/${threadId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setThread(res.data))
            .catch(err => setError(err.response?.data?.detail || "Failed to load thread"));
    }, [threadId]);

    // Fetch posts
    useEffect(() => {
        if (!threadId) return;
        const token = localStorage.getItem("token");
        axios.get(`${API_BASE_URL}/threads/${threadId}/posts`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setPosts(res.data))
            .catch(err => setError(err.response?.data?.detail || "Failed to load posts"))
            .finally(() => setLoading(false));
    }, [threadId]);

    // Tutorial on load
    useEffect(() => {
        if (JSON.parse(localStorage.getItem("tutorialMode") || "false")) {
            setTutorialOpen(true);
        }
    }, []);

    // Create post handler
    const handleCreatePost = async () => {
        if (!title || !content) return;
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `${API_BASE_URL}/threads/${threadId}/posts`,
                { title, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowCreateModal(false);
            setTitle(""); setContent("");
            // refresh
            const res = await axios.get(`${API_BASE_URL}/threads/${threadId}/posts`, { headers: { Authorization: `Bearer ${token}` } });
            setPosts(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to create post");
        }
    };

    // Close modal
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setTitle(""); setContent("");
    };

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Navbar />
            <div className="thread-container">
                {/* Back button */}
                <button
                    className="back-to-forum-button"
                    onClick={() => navigate("/forum")}
                >
                    ← Back to Forum
                </button>

                {/* Thread Header + Flag */}
                {thread && (
                    <div className="thread-header">
                        <h1>{thread.title}</h1>
                        <div className="button-group">
                            <FlagButton flag_type="thread" target_id={thread.thread_id} />    
                            <button 
                                onClick={() => setShowCreateModal(true)} 
                                className="create-post-button"
                            >
                                Create Post
                            </button>
                        </div>  
                    </div>                  
                )}

                {/* Posts List */}
                <div className="post-list">
                    {loading ? (
                        <div className="loading-indicator">Loading posts...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : posts.length > 0 ? (
                        posts.map(post => (
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
                                <div className="post-content">{post.content}</div>
                                <div className="post-footer">
                                    {post.author && <span>Posted by {post.author.username}</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">No posts yet.</div>
                    )}
                </div>

                {/* Create Post Modal */}
                {showCreateModal && (
                    <div className="modal-overlay" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <DialogTitle>Create New Post</DialogTitle>
                            <DialogContent>
                                <input
                                    placeholder="Title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="post-title-input"
                                />
                                <textarea
                                    placeholder="Content"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    className="post-content-input"
                                />
                                <Button fullWidth variant="contained" onClick={handleCreatePost}>
                                    Submit
                                </Button>
                            </DialogContent>
                        </div>
                    </div>
                )}

                {/* Tutorial Dialog */}
                {tutorialOpen && (
                    <Box sx={{ position: 'fixed', top: 100, left: 40, zIndex: 1301 }}>
                        <Paper elevation={3} sx={{ p: 2, width: 300 }}>
                            <h2>{tutorialSteps[step].title}</h2>
                            <p>{tutorialSteps[step].description}</p>
                            <Button fullWidth variant="contained" onClick={nextStep}>
                                {step < tutorialSteps.length - 1 ? 'Next' : 'Finish'}
                            </Button>
                        </Paper>
                    </Box>
                )}
            </div>
        </AppTheme>
    );
}