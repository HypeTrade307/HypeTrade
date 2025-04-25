// src/pages/PostViewer.tsx
//@ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/NavbarSection/Navbar";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "../components/shared-theme/AppTheme";
import {
//@ts-ignore
  Button
//@ts-ignore
} from "@mui/material";
//@ts-ignore
import { Box, Paper } from "@mui/material";
import "./Post.css";
import { API_BASE_URL } from '../config';
import FlagButton from "./FlagButton";

// Define interfaces
interface Comment {
    comment_id: number;
    content: string;
    author_id: number;
    created_at: string;
    author?: {
        username: string;
    };
    // liked_by removed from UI, but kept here if your API still returns it
    liked_by?: { user_id: number }[];
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
    const { threadId, postId } = useParams<{ threadId: string; postId: string }>();
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
        { title: "Interacting", description: "You can like the post and add your own comments." },
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

    // Check authentication
    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          navigate("/login");
          return;
        }
    
        try {
          const response = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
    
          if (response.data && response.data.user_id) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            navigate("/login");
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          setIsAuthenticated(false);
          navigate("/login");
        } finally {
          setLoading(false);
        }
      };
    
      checkAuth();
    }, [navigate]);

    // Fetch post details
    useEffect(() => {
        async function fetchPost() {
            if (!postId) return;
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get<Post>(`${API_BASE_URL}/post/${postId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });
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
                const response = await axios.get<Comment[]>(`${API_BASE_URL}/post/${postId}/comments`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined
                });
                setComments(response.data);
            } catch (err: any) {
                console.error("Error fetching comments:", err);
                // comments are non‐critical, so we just log
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

    // Like/unlike the post
    const handleLikePost = async () => {
      if (!post) return;   // guard
      const token = localStorage.getItem("token");
      if (!token) { setError("Not authenticated"); return; }
    
      const already = post.liked_by?.some(l => l.user_id === userId);
      try {
        await axios.post(
          `${API_BASE_URL}/post/${post.post_id}/${already ? "unlike" : "like"}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // re-fetch to pick up the new liked_by list:
        const { data } = await axios.get<Post>(
          `${API_BASE_URL}/post/${post.post_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPost(data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.detail || "Failed to update like status");
      }
    };

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
            // refresh comments
            const response = await axios.get<Comment[]>(`${API_BASE_URL}/post/${postId}/comments`, {
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

    // Handle post deletion
    const handleDeletePost = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not authenticated");
                return;
            }
            await axios.delete(`${API_BASE_URL}/post/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/thread/${threadId}`);
        } catch (err: any) {
            console.error("Error deleting post:", err);
            setError(err.response?.data?.detail || "Failed to delete post");
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
                  <div className="post-header-flag-wrapper">
                    <FlagButton flag_type="post" target_id={post.post_id} />
                  </div>
      
                  <div className="navigation-links">
                    <button
                      onClick={() => navigate(`/thread/${threadId}`)}
                      className="back-button"
                    >
                      ← Back to Thread
                    </button>
                    {post.thread?.stock_ref && (
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
                  <div className="post-content-main">{post.content}</div>
                  <div className="post-actions">
                    <button
                      className={`like-button ${
                        post.liked_by?.some((like) => like.user_id === userId)
                          ? "liked" : ""
                      }`}
                      onClick={handleLikePost}
                    >
                      {post.liked_by?.length || 0} Likes
                    </button>
                    <button
                      className="comment-button"
                      onClick={() => setShowCommentForm(!showCommentForm)}
                    >
                      Add Comment
                    </button>
                    <button className="delete-button" onClick={handleDeletePost}>
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
                  <h2 className="comments-header">Comments ({comments.length})</h2>
      
                  {comments.length > 0 ? (
                    <div className="comments-list">
                      {comments.map((comment) => (
                        <div key={comment.comment_id} className="comment-item">
                          <FlagButton flag_type="comment" target_id={comment.comment_id} />
                          <div className="comment-content">{comment.content}</div>
                          <div className="comment-footer">
                            <div className="comment-meta">
                              <span className="comment-author">{comment.author?.username}</span>
                              <span className="comment-date">{formatDate(comment.created_at)}</span>
                            </div>
                            {/* no comment-like-button */}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-comments">No comments yet. Be the first to comment!</div>
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
                position: "fixed",
                top: 100,
                left: 40,
                zIndex: 1301,
                pointerEvents: "auto",
              }}
            >
              <Paper elevation={3} sx={{ p: 2, width: 300 }}>
                <h2 style={{ margin: 0 }}>{tutorialSteps[step].title}</h2>
                <p>{tutorialSteps[step].description}</p>
                <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={nextStep}>
                  {step < tutorialSteps.length - 1 ? "Next" : "Finish"}
                </Button>
              </Paper>
            </Box>
          )}
        </AppTheme>
    );
}

export default PostViewer;
