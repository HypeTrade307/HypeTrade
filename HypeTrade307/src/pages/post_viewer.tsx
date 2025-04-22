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
import { Box, Paper } from "@mui/material";
import "./Post.css";
import { API_BASE_URL } from '../config';

// Define interfaces
interface Comment {
    comment_id: number;
    content: string;
    author_id: number;
    created_at: string;
    author?: {
        username: string;
    };
    liked_by?: {
        user_id: number
    }[];
}

interface Post {
    post_id: number;
    title: string;
    content: string;
    author_id: number;
    thread_id: number;
    created_at: string;
    updated_at: string;
    author?: {
        username: string;
    };
    liked_by?: { user_id: number }[];
    thread?: {
        title: string;
        stock_ref?: {
            ticker: string;
            stock_name: string;
        };
    };
}

function PostViewer() {
    const { threadId, postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userId, setUserId] = useState<number | null>(null);

    // Comment form state
    const [commentContent, setCommentContent] = useState("");
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Tutorial state
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [step, setStep] = useState(0);

  const tutorialSteps = [
    { title: "Welcome to the Post Page", description: "Here you can view a post and all its comments." },
    { title: "Interacting", description: "You can like posts and comments, and add your own." },
    { title: "Navigation", description: "Use the back button to return to the thread at any time." },
    { title: "You're Ready!", description: "Start exploring and engaging in discussions." }
  ];

    const nextStep = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      setTutorialOpen(false);
    }
  };

    // Fetch user ID from local storage
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setUserId(parsedUser.user_id);
            } catch (err) {
                console.error("Error parsing user data:", err);
            }
        }
    }, []);

    // Fetch post details
    useEffect(() => {
        async function fetchPost() {
            try {
                const token = localStorage.getItem("token");
                if (!postId) return;

                const response = await axios.get(`${API_BASE_URL}/post/${postId}`, {
                    headers: {
                        "Content-Type": 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                console.log("fetch_post_response", response);
                console.log("fetch_post_response.data", response.data);

                setPost(response.data);
            } catch (err: any) {
                console.error("Error fetching post:", err);
                setError(err.response?.data?.detail || "Failed to load post");
            }
        }

        fetchPost();
    }, [postId]);

    // Fetch comments for post
    useEffect(() => {
        async function fetchComments() {
            if (!postId) return;

            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(`${API_BASE_URL}/post/${postId}/comments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("recd Comments:", response);
                setComments(response.data);
            } catch (err: any) {
                console.error("Error fetching comments:", err);
                setError(err.response?.data?.detail || "Failed to load comments");
            } finally {
                setLoading(false);
            }
        }

        fetchComments();
    }, [postId]);

    // Tutorial trigger
    useEffect(() => {
    const tutorialMode = JSON.parse(localStorage.getItem("tutorialMode") || "false");
    if (tutorialMode) {
      setTutorialOpen(true);
    }
    }, []);

  // Create comment
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not authenticated");
                return;
            }

            await axios.post(
                `${API_BASE_URL}/post/${postId}/comments`,
                { content: commentContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("sent a comment:", commentContent);

            // Refresh comments
            const response = await axios.get(`${API_BASE_URL}/post/${postId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setComments(response.data);
            setCommentContent("");
            setShowCommentForm(false);
        } catch (err: any) {
            console.error("Error creating comment:", err);
            setError(err.response?.data?.detail || "Failed to create comment");
        } finally {
            setSubmitting(false);
        }
    };
    function myFunction() {
        handleDeletePost();
        navigate(`/thread/${threadId}`);
    }

    // Handle post deletion
    const handleDeletePost = async() => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not authenticated");
                return;
            }

            await axios.delete(
                `${API_BASE_URL}/post/${postId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("sent a comment:", commentContent);

            // delete
            await axios.get(`${API_BASE_URL}/post/${postId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/thread/${threadId}`);
        } catch (err: any) {
            console.error("Error creating comment:", err);
            setError(err.response?.data?.detail || "Failed to delete post");
        } finally {
            setSubmitting(false);
        }
    };

    // onClick={() => handleLikePost(
    //     post.post_id,
    //     post.liked_by?.some(like => like.user_id === userId) ? true : false
    // )}

    // Handle post like/unlike
    const handleLikePost = async (postId: number, isLiked: boolean) => {
    // const handleLikePost = async () => {
    //     console.log("inside handleLikePost");
    //
    //     console.log("post", post);
    //     console.log("userId", userId);

        // if (!post || !userId) return;

        try {
            const token = localStorage.getItem("token");

            console.log("postId:", postId);
            console.log("token:", token);
            console.log("isliked:", isLiked);

            if (!token) {
                setError("Not authenticated");
                return;
            }

            // const isLiked = post.liked_by?.some(like => like.user_id === userId);
            console.log("isLiked", isLiked);
            const endpoint = `${API_BASE_URL}/post/${postId}/${isLiked ? 'unlike' : 'like'}`;
            console.log("endpoint", endpoint);

            const post_response = await axios.post(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("post_response", post_response);
            console.log("post_response.data", post_response.data);

            // Update post with new like status
            const response = await axios.get(`${API_BASE_URL}/post/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("response", response);
            console.log("response.data", response.data);

            setPost(response.data);
        } catch (err: any) {
            console.error("Error updating like status:", err);
            setError(err.response?.data?.detail || "Failed to update like status");
        }
    };

    // Handle comment like/unlike
    const handleLikeComment = async (commentId: number, isLiked: boolean) => {
        try {
            const token = localStorage.getItem("token");

            console.log("commendId:", commentId);
            console.log("token:", token);
            console.log("isliked:", isLiked);

            if (!token) {
                setError("Not authenticated");
                return;
            }

            /*TODO:  Update this like the post-like function to account for a user's likes */
            const endpoint = `${API_BASE_URL}/comment/${commentId}/${isLiked ? 'unlike' : 'like'}`;

            const like_response = await axios.post(endpoint, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("post_response", like_response);
            console.log("post_response.data", like_response.data);

            // Refresh comments
            const response = await axios.get(`${API_BASE_URL}/post/${postId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("response", response);
            console.log("response.data", response.data);

            setComments(response.data);
        } catch (err: any) {
            console.error("Error updating comment like status:", err);
            setError(err.response?.data?.detail || "Failed to update comment like status");
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <Navbar />
            <div className="post-container">
                {loading ? (
                    <div className="loading-indicator">Loading post...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : post ? (
                    <>
                        {/* Post Header */}
                        <div className="post-header-section">
                            <div className="navigation-links">
                                <button onClick={() => navigate(`/thread/${threadId}`)} className="back-button">
                                    ← Back to Thread
                                </button>
                                {post.thread && post.thread.stock_ref && (
                                    <span className="stock-badge">
                                        {post.thread.stock_ref.ticker} - {post.thread.stock_ref.stock_name}
                                    </span>
                                )}
                            </div>
                            <h1 className="post-title-main">{post.title}</h1>
                            <div className="post-meta">
                                <span className="post-author-info">
                                    Posted by {post.author?.username} on {formatDate(post.created_at)}
                                </span>
                                {post.updated_at !== post.created_at && (
                                    <span className="post-edited-info">
                                        (edited on {formatDate(post.updated_at)})
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="post-content-section">
                            <div className="post-content-main">
                                {post.content}
                            </div>
                            <div className="post-actions">
                                <button
                                    className={
                                        `like-button ${
                                            post.liked_by?.some(like => like.user_id === userId) ? 'liked' : ''
                                        }`
                                    }
                                    onClick={() => handleLikePost(
                                        post.post_id,
                                        post.liked_by?.some(like => like.user_id === userId) ? true : false
                                    )}
                                >
                                    {post.liked_by?.length || 0} Likes
                                </button>

                                {/*<button*/}
                                {/*    // className="comment-like-button"*/}
                                {/*    className={*/}
                                {/*        `comment-like-button ${*/}
                                {/*            comment.liked_by?.some(like => like.user_id === userId) ? 'liked' : ''*/}
                                {/*        }`*/}
                                {/*    }*/}
                                {/*    onClick={() => handleLikeComment(*/}
                                {/*        comment.comment_id,*/}
                                {/*        // !!comment.liked_by?.some(like => like.user_id === userId)*/}
                                {/*        // !!comment.liked_by?.some(like => like.user_id === userId)*/}
                                {/*        comment.liked_by?.some(like => like.user_id === userId) ? true : false*/}
                                {/*    )}*/}
                                {/*>*/}
                                {/*    {comment.liked_by?.length || 0} Likes*/}
                                {/*</button>*/}

                                <button
                                    className="comment-button"
                                    onClick={() => setShowCommentForm(!showCommentForm)}
                                >
                                    Add Comment
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => myFunction()}
                                    >
                                    Delete Post
                                </button>
                            </div>
                        </div>

                        {/* Comment Form */}
                        {showCommentForm && (
                            <div className="comment-form-section">
                                <form onSubmit={handleCreateComment}>
                                    <div className="form-group">
                                        <label htmlFor="comment-content">Your Comment:</label>
                                        <textarea
                                            id="comment-content"
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            placeholder="Write your comment here..."
                                            className="comment-content-input"
                                            rows={4}
                                            disabled={submitting}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            onClick={() => setShowCommentForm(false)}
                                            className="cancel-button"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="submit-button"
                                            disabled={!commentContent.trim() || submitting}
                                        >
                                            {submitting ? "Submitting..." : "Submit Comment"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="comments-section">
                            <h2 className="comments-header">
                                Comments ({comments.length})
                            </h2>

                            {comments.length > 0 ? (
                                <div className="comments-list">
                                    {comments.map((comment) => (
                                        <div key={comment.comment_id} className="comment-item">
                                            <div className="comment-content">
                                                {comment.content}
                                            </div>
                                            <div className="comment-footer">
                                                <div className="comment-meta">
                                                    <span className="comment-author">
                                                        {comment.author?.username}
                                                    </span>
                                                    <span className="comment-date">
                                                        {formatDate(comment.created_at)}
                                                    </span>
                                                </div>
                                                <button
                                                    // className="comment-like-button"
                                                    className={
                                                        `comment-like-button ${
                                                            comment.liked_by?.some(like => like.user_id === userId) ? 'liked' : ''
                                                        }`
                                                    }
                                                    onClick={() => handleLikeComment(
                                                        comment.comment_id,
                                                        // !!comment.liked_by?.some(like => like.user_id === userId)
                                                        // !!comment.liked_by?.some(like => like.user_id === userId)
                                                        comment.liked_by?.some(like => like.user_id === userId) ? true : false
                                                    )}
                                                >
                                                    {comment.liked_by?.length || 0} Likes
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-comments">
                                    No comments yet. Be the first to comment!
                                </div>
                            )}

                            {!showCommentForm && (
                                <button
                                    className="add-comment-button"
                                    onClick={() => setShowCommentForm(true)}
                                >
                                    Add a Comment
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="not-found">Post not found</div>
                )}
            </div>
            {/* Tutorial Dialog */}
                  {tutorialOpen && (
              <Box
                sx={{
                  position: 'fixed',
                  top: 100,
                  left: 40,
                  zIndex: 1301,
                  pointerEvents: 'auto', // allow this box to be clickable
                }}
              >
                <Paper elevation={3} sx={{ p: 2, width: 300 }}>
                  <h2 style={{ margin: 0 }}>{tutorialSteps[step].title}</h2>
                  <p>{tutorialSteps[step].description}</p>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={nextStep}
                  >
                    {step < tutorialSteps.length - 1 ? "Next" : "Finish"}
                  </Button>
                </Paper>
              </Box>
            )}
        </AppTheme>
    );
}

export default PostViewer;