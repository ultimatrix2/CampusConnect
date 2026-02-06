import React, { useState, useEffect } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../Components/DashboardLayout";
import { FaHeart, FaComment, FaShare, FaSmile, FaImage, FaVideo, FaTrash, FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaReply, FaChevronDown, FaChevronUp, FaBold, FaItalic, FaList, FaCode } from "react-icons/fa";
import socket from "../socket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../Components/ui/alert-dialog";
import { Skeleton } from "../Components/ui/skeleton";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Search, Filter, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import RatingBadge from '../Components/RatingBadge';






const Community = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = localStorage.getItem("user");
  const currentUserId = currentUser ? JSON.parse(currentUser)._id : null;
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState({});
  const [filter, setFilter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingReply, setEditingReply] = useState(null);

  const [editReplyText, setEditReplyText] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // latest, oldest, popular
  const [newPostsQueue, setNewPostsQueue] = useState([]); // ⚡ Real-time queue
  const [trendingTags, setTrendingTags] = useState([]); // 📈 Backend Tags
  const [linkPreview, setLinkPreview] = useState(null); // 🔗 URL Preview Data
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  // Alert Dialog State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    action: null,
  });


  const filteredPosts = posts
    .filter((post) => {
      // 1. Tag Filter (existing)
      if (filter && !post.content?.toLowerCase().includes(filter.toLowerCase())) return false;

      // 2. Search Filter
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesContent = post.content?.toLowerCase().includes(lowerSearch);
        const matchesAuthor = post.postedBy?.name?.toLowerCase().includes(lowerSearch);
        return matchesContent || matchesAuthor;
      }
      return true;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortBy === "popular") {
        return (b.likes?.length || 0) - (a.likes?.length || 0);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else {
        // Default: Latest
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const renderContent = (content) => {
    return (
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-800 rounded px-1 py-0.5 text-sm font-mono text-pink-400" {...props}>
                {children}
              </code>
            );
          },
          // Explicit mapping for standard markdown elements
          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-gray-300" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-300" {...props} />,
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-400 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-400 my-2" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mt-3 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white mt-2 mb-1" {...props} />,
        }}
      />
    );
  };

  const getTagCount = (tag) => {
    return posts.filter(post => post.content && post.content.toLowerCase().includes(tag.toLowerCase())).length;
  };



  // ================= DELETE POST =================



  const handleDeletePost = (postId) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Post",
      description: "Are you sure you want to delete this post? This action cannot be undone.",
      action: async () => {
        try {
          await axios.delete(
            `http://localhost:5001/api/community/delete/${postId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          // Refresh feed
          fetchPosts();
          toast.success("Post deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("You can not delete other Post");
        }
      }
    });
  };



  const [totalUsers, setTotalUsers] = useState(0);

  const getTotalUsers = async () => {
    try {
      const res = await fetch(
        "http://localhost:5001/api/users/count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setTotalUsers(data.totalUsers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    getTotalUsers();   // ✅ ADD THIS
  }, []);
  const handleCommentClick = (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      socket.emit("join-post", postId);

    } else {
      setActiveCommentPostId(postId);
      fetchComments(postId);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/comments/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments((prev) => ({
        ...prev,
        [postId]: res.data,
      }));
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };
  const handleEditReply = async (commentId, replyId) => {
    if (!editReplyText.trim()) return;

    try {
      await axios.put(
        `http://localhost:5001/api/comments/${commentId}/reply/${replyId}`,
        { text: editReplyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Reply updated");
      setEditingReply(null);
      fetchComments(activeCommentPostId);
    } catch (err) {
      toast.error("Edit reply failed");
    }
  };

  const handleDeleteReply = (commentId, replyId) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Reply",
      description: "Are you sure you want to delete this reply?",
      action: async () => {
        try {
          await axios.delete(
            `http://localhost:5001/api/comments/${commentId}/reply/${replyId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Reply deleted");
          fetchComments(activeCommentPostId);
        } catch (err) {
          toast.error("Delete reply failed");
        }
      }
    });
  };

  const handleAddComment = async (postId, parentId = null) => {
    const text = parentId ? replyText : commentText;
    if (!text.trim()) return;

    try {
      setCommentLoading(true);

      await axios.post(
        `http://localhost:5001/api/comments/${postId}`,
        { text, parentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(parentId ? "Reply added" : "Comment added");
      if (parentId) {
        setReplyText("");
        setReplyingTo(null);
        setShowReplies(prev => ({ ...prev, [parentId]: true }));
      } else {
        setCommentText("");
      }
      fetchComments(postId);
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = (commentId, postId) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Comment",
      description: "Are you sure you want to delete this comment?",
      action: async () => {
        try {
          await axios.delete(
            `http://localhost:5001/api/comments/delete/${commentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          toast.success("Comment deleted");
          fetchComments(postId);
        } catch (err) {
          toast.error("Delete failed");
        }
      }
    });
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;


    try {
      setEditLoading(true);

      const res = await axios.put(
        `http://localhost:5001/api/comments/edit/${commentId}`,
        { text: editText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedComment = res.data;

      // update UI instantly without refetch
      setComments((prev) => ({
        ...prev,
        [activeCommentPostId]: prev[activeCommentPostId].map((c) =>
          c._id === commentId ? updatedComment : c
        ),
      }));

      cancelEdit();
      toast.success("Comment updated");
    } catch (err) {
      toast.error("Edit failed");
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !file) {
      toast.error("Please add some content to post!");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("isAnonymous", isAnonymous);
    if (file) {
      formData.append("file", file);
    }
    // Append Link Preview if exists
    if (linkPreview) {
      formData.append("linkPreview", JSON.stringify(linkPreview));
    }

    try {
      const res = await axios.post(
        "http://localhost:5001/api/community/create",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Post created successfully!");
        setContent("");
        setFile(null);
        setLinkPreview(null);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.code === "CONTENT_BLOCK") {
        setAlertConfig({
          isOpen: true,
          title: "Post Blocked 🚫",
          description: err.response.data.message,
          action: null
        });
      } else {
        toast.error(err.response?.data?.message || "Failed to create post");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:5001/api/community/like/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { liked } = res.data;

      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== postId) return post;

          const safeLikes = Array.isArray(post.likes) ? post.likes : [];

          return {
            ...post,
            likes: liked
              ? [...safeLikes, currentUserId]
              : safeLikes.filter((id) => id !== currentUserId),
          };
        })
      );
      toast.success(liked ? "Post liked" : "Like removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to like post");
    }
  };



  socket.on("postLiked", ({ postId, likesCount }) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likesCount } : p
      )
    );
  });
  const getFileLabel = (url) => {
    const lower = url.toLowerCase();

    if (lower.includes(".pdf")) return "📄 View PDF";
    if (lower.includes(".doc") || lower.includes(".docx")) return "📝 View Document";
    if (lower.includes(".xls") || lower.includes(".xlsx")) return "📊 View Excel";
    if (lower.includes(".ppt")) return "📽 View Presentation";

    return "📁 Download File";
  };

  // ================= FETCH POSTS =================
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);

      const res = await axios.get(
        "http://localhost:5001/api/community/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPosts(res.data.posts || []);
      setTotalLikes(res.data.totalLikes || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load community posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  // ⚡ Socket & Initial Load
  useEffect(() => {
    fetchPosts();
    fetchTrendingTags(); // 📈 Fetch tags from backend

    // Listen for new posts
    socket.on("new-post", (post) => {
      console.log("🔥 New Post Received via Socket:", post);
      // Don't auto-insert if user is mine (already added optimistically)
      if (post.postedBy._id !== currentUserId) {
        setNewPostsQueue((prev) => [post, ...prev]);
        toast.info("New post available! 🚀");
      }
    });

    socket.on("connect", () => {
      console.log("🟢 Socket Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket Disconnected");
    });

    return () => {
      socket.off("new-post");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const fetchTrendingTags = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/api/community/trending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTrendingTags(res.data.tags);
      }
    } catch (err) {
      console.error("Failed to fetch trending tags", err);
    }
  };

  const handleNewPostsClick = () => {
    setPosts((prev) => [...newPostsQueue, ...prev]);
    setNewPostsQueue([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const insertMarkdown = (type) => {
    const textarea = document.getElementById("post-content-textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    let newText = "";
    let insertion = "";

    switch (type) {
      case "bold":
        insertion = "**Bold Text**";
        break;
      case "italic":
        insertion = "*Italic Text*";
        break;
      case "list":
        insertion = "\n- List Item";
        break;
      case "code":
        insertion = "\n```javascript\n// Your code here\n```\n";
        break;
      default:
        return;
    }

    if (start !== end) {
      // If text is selected, wrap it
      const selected = text.substring(start, end);
      switch (type) {
        case "bold":
          newText = text.substring(0, start) + `**${selected}**` + text.substring(end);
          break;
        case "italic":
          newText = text.substring(0, start) + `*${selected}*` + text.substring(end);
          break;
        case "code":
          newText = text.substring(0, start) + `\n\`\`\`javascript\n${selected}\n\`\`\`\n` + text.substring(end);
          break;
        default:
          newText = text.substring(0, start) + insertion + text.substring(end);
      }
    } else {
      newText = text.substring(0, start) + insertion + text.substring(end);
    }

    setContent(newText);
    textarea.focus();
  };






  // Header Content for DashboardLayout
  const headerContent = (
    <div className="flex items-center gap-3 w-full max-w-md ml-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search posts or authors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-slate-950 border-slate-800 focus:ring-violet-500/20 text-white"
        />
      </div>
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none pr-8 cursor-pointer hover:bg-slate-900"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Popular</option>
        </select>
        <Filter className="absolute right-2.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <DashboardLayout
      headerContent={headerContent}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
      {/* Alert Dialog Component */}
      <AlertDialog open={alertConfig.isOpen} onOpenChange={(open) => {
        if (!open) setAlertConfig(prev => ({ ...prev, isOpen: false }));
      }}>
        <AlertDialogContent className="bg-slate-900 border border-slate-700 text-slate-200 z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (alertConfig.action) alertConfig.action();
                setAlertConfig(prev => ({ ...prev, isOpen: false }));
              }}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="relative">
        {/* Comment Drawer */}
        {activeCommentPostId && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setActiveCommentPostId(null)}
            />

            <div className={`fixed top-0 right-0 h-full w-96 bg-gray-900 z-50 transition-transform flex flex-col min-h-0 ${activeCommentPostId ? "translate-x-0" : "translate-x-full"
              }`}>
              <div className="p-4 border-b border-gray-700 flex justify-between">
                <h3 className="text-lg font-bold">Comments</h3>
                <button onClick={() => setActiveCommentPostId(null)}>✕</button>
              </div>

              {/* Comment List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {comments[activeCommentPostId]?.length > 0 ? (
                  comments[activeCommentPostId].map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-gray-800 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {comments.userId?.profileImage ? (
                            <img
                              src={`http://localhost:5001/${comment.profileImage}`}
                              alt="profile"
                              className="w-8 h-8 rounded-full object-cover"
                            />

                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center font-bold text-black text-sm">
                              {comment.username?.charAt(0) || "U"}
                            </div>
                          )}
                          <p className="font-semibold">{comment.username}</p>
                        </div>
                        {comment.userId === currentUserId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(comment)}
                              className="text-blue-400 text-xs"
                            >
                              Edit
                            </button>
                            <FaTrash
                              className="cursor-pointer text-red-400"
                              onClick={() =>
                                handleDeleteComment(
                                  comment._id,
                                  activeCommentPostId
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                      {editingCommentId === comment._id ? (
                        <>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-gray-700 text-white p-2 rounded mt-2"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEditComment(comment._id)}
                              disabled={editLoading}
                              className="bg-green-500 px-3 py-1 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm mt-1">{renderContent(comment.text)}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            if (replyingTo === comment._id) {
                              setReplyingTo(null);
                              setReplyText("");
                            } else {
                              setReplyingTo(comment._id);
                              setReplyText("");
                            }
                          }}
                          className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1"
                        >
                          <FaReply className="text-xs" />
                          Reply
                        </button>
                      </div>
                      {replyingTo === comment._id && (
                        <div className="mt-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(activeCommentPostId, comment._id);
                              }
                            }}
                            className="w-full bg-gray-700 text-white p-2 rounded placeholder-gray-400"
                            placeholder="Write a reply..."
                            rows={2}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAddComment(activeCommentPostId, comment._id)}
                              disabled={commentLoading}
                              className="bg-green-500 px-3 py-1 rounded text-sm"
                            >
                              Reply
                            </button>
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              className="bg-gray-500 px-3 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2">
                          {!showReplies[comment._id] ? (
                            <button
                              onClick={() => setShowReplies(prev => ({ ...prev, [comment._id]: true }))}
                              className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1"
                            >
                              <FaChevronDown className="text-xs" />
                              Show {comment.replies.length} replies
                            </button>
                          ) : (
                            <>
                              <div className="mt-3 ml-6 space-y-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply._id} className="bg-gray-700 p-2 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-sm">
                                          {reply.userId?.username}
                                        </p>
                                      </div>

                                      {reply.userId === currentUserId && (
                                        <div className="flex gap-2 text-xs">
                                          <button
                                            onClick={() => {
                                              setEditingReply(reply._id);
                                              setEditReplyText(reply.text);
                                            }}
                                            className="text-blue-400"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteReply(comment._id, reply._id)
                                            }
                                            className="text-red-400"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {editingReply === reply._id ? (
                                      <>
                                        <textarea
                                          value={editReplyText}
                                          onChange={(e) => setEditReplyText(e.target.value)}
                                          className="w-full bg-gray-600 text-white p-1 rounded mt-1"
                                        />
                                        <button
                                          onClick={() =>
                                            handleEditReply(comment._id, reply._id)
                                          }
                                          className="bg-green-500 px-2 py-1 text-xs rounded mt-1"
                                        >
                                          Save
                                        </button>
                                      </>
                                    ) : (
                                      <p className="text-sm mt-1">{renderContent(reply.text)}</p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(reply.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                ))}

                              </div>
                              <button
                                onClick={() => setShowReplies(prev => ({ ...prev, [comment._id]: false }))}
                                className="text-blue-400 text-xs hover:text-blue-300 mt-2 flex items-center gap-1"
                              >
                                <FaChevronUp className="text-xs" />
                                Hide replies
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No comments yet 💬</p>
                )}

              </div>


              {/* Add Comment */}
              <div className="p-4 border-t border-gray-700 bg-gray-900">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment(activeCommentPostId);
                    }
                  }}
                  className="w-full bg-gray-800 text-white p-2 rounded placeholder-gray-400"
                  placeholder="Write a comment..."
                  rows={3}
                />
                <button
                  onClick={() => handleAddComment(activeCommentPostId)}
                  disabled={commentLoading}
                  className="w-full mt-2 bg-blue-500 py-2 rounded"
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </>
        )}



        {/* Main Content - Two Column Layout */}
        <div className="flex gap-6 max-w-7xl mx-auto w-full items-start">
          {/* Left Column - Create Post & Feed */}
          <div className="flex-1">
            {/* NEW POSTS ALERT */}
            {newPostsQueue.length > 0 && (
              <button
                onClick={handleNewPostsClick}
                className="w-full mb-4 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all animate-bounce"
              >
                <RefreshCw className="h-5 w-5" />
                Show {newPostsQueue.length} new posts
              </button>
            )}

            {/* CREATE POST SECTION */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 mb-6 hover:border-green-400 transition-all duration-300">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center font-bold text-black">
                  You
                </div>
                <div className="flex-1">
                  {/* Markdown Toolbar */}
                  <div className="flex gap-2 mb-2 bg-gray-700/50 p-2 rounded-lg w-max">
                    <button onClick={() => insertMarkdown('bold')} className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white" title="Bold">
                      <FaBold />
                    </button>
                    <button onClick={() => insertMarkdown('italic')} className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white" title="Italic">
                      <FaItalic />
                    </button>
                    <button onClick={() => insertMarkdown('list')} className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white" title="List">
                      <FaList />
                    </button>
                    <button onClick={() => insertMarkdown('code')} className="p-1 hover:bg-gray-600 rounded text-gray-300 hover:text-white" title="Code Block">
                      <FaCode />
                    </button>
                  </div>
                  <textarea
                    id="post-content-textarea"
                    placeholder="What's on your mind? 🤔"
                    className="w-full bg-gray-700 text-white p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 transition-all font-mono"
                    rows="3"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>

              {/* File Preview */}
              {file && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg border border-green-600/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaPaperclip className="text-green-400 text-lg" />
                    <div>
                      <p className="text-sm font-semibold text-gray-300">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 text-sm hover:bg-red-400/10 px-3 py-1 rounded-lg transition"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* 🔗 Link Preview (Create Mode) */}
              {isFetchingPreview && (
                <div className="max-w-md mt-2 flex items-center gap-2 text-gray-400 text-sm animate-pulse">
                  <Loader2 className="animate-spin h-3 w-3" /> Fetching preview...
                </div>
              )}
              {linkPreview && (
                <div className="mt-4 max-w-md rounded-xl border border-gray-700 bg-black/40 overflow-hidden relative group">
                  <button
                    onClick={() => setLinkPreview(null)}
                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition opacity-0 group-hover:opacity-100"
                  >
                    <FaTrash size={12} />
                  </button>
                  {linkPreview.image && (
                    <img src={linkPreview.image} alt="prev" className="w-full h-32 object-cover" />
                  )}
                  <div className="p-3">
                    <p className="font-bold text-sm text-gray-200 truncate">{linkPreview.title}</p>
                    <p className="text-xs text-gray-500 uppercase mt-1">{linkPreview.domain}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 border-t border-gray-700/50 pt-4">
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 group" title="Upload Image">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <FaImage className="text-green-400 text-lg group-hover:scale-110 transition" />
                    <span className="text-xs text-gray-300">Image</span>
                  </label>
                  <label className="cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 group" title="Upload Video">
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <FaVideo className="text-cyan-400 text-lg group-hover:scale-110 transition" />
                    <span className="text-xs text-gray-300">Video</span>
                  </label>
                  <label className="cursor-pointer p-3 hover:bg-gray-700 rounded-lg transition flex items-center gap-2 group" title="Upload File">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <FaPaperclip className="text-yellow-400 text-lg group-hover:scale-110 transition" />
                    <span className="text-xs text-gray-300">File</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-3 py-2 rounded-lg transition">
                    <input
                      type="checkbox"
                      className="accent-green-400"
                      checked={isAnonymous}
                      onChange={() => setIsAnonymous(!isAnonymous)}
                    />
                    <span className="text-sm">Anonymous</span>
                  </label>

                  <button
                    onClick={handlePost}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>

            {/* POSTS FEED */}
            <div className="space-y-5">
              {loadingPosts && (
                <div className="space-y-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32 bg-gray-700" />
                          <Skeleton className="h-3 w-20 bg-gray-700" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full bg-gray-700" />
                      <Skeleton className="h-4 w-3/4 bg-gray-700" />
                      <Skeleton className="h-64 w-full rounded-xl bg-gray-700" />
                    </div>
                  ))}
                </div>
              )}

              {!loadingPosts && filteredPosts.length === 0 && (
                <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-lg flex flex-col items-center gap-2">
                    <span className="text-4xl">🔍</span>
                    {filter || searchTerm
                      ? "No results found. Try adjusting your search or filters."
                      : "No posts yet. Be the first to share! 🚀"}
                  </p>
                </div>
              )}

              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-lg border border-gray-700 overflow-hidden hover:border-green-400 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-400/20"
                >
                  {/* Post Header */}
                  <div className="p-5 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {post.postedBy?.profileImage ? (
                          <img
                            src={post.postedBy.profileImage}
                            alt="profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center font-bold text-black text-lg">
                            {post.postedBy?.name?.charAt(0) || "A"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">
                            {post.postedBy?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {post.isAnonymous && (
                          <span className="text-xs bg-purple-600 px-3 py-1 rounded-full">
                            Anonymous
                          </span>
                        )}

                        {token && post.isMine && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                            title="Delete post"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        )}

                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-5">
                    {post.content && (
                      <div className="text-gray-200 leading-relaxed text-base prose prose-invert max-w-none">
                        {renderContent(post.content)}
                      </div>
                    )}

                    {/* 🔗 Link Preview Display */}
                    {post.linkPreview?.title && (
                      <a
                        href={post.linkPreview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-4 rounded-xl border border-gray-700 bg-gray-900/50 overflow-hidden hover:bg-gray-800 transition group"
                      >
                        {post.linkPreview.image && (
                          <img
                            src={post.linkPreview.image}
                            alt="preview"
                            className="w-full h-48 object-cover group-hover:opacity-90 transition"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-bold text-gray-200 group-hover:text-blue-400 transition">{post.linkPreview.title}</h4>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{post.linkPreview.description}</p>
                          <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider">{post.linkPreview.domain}</p>
                        </div>
                      </a>
                    )}

                    {/* Media */}
                    {post.media?.url && (
                      <div className="mt-4 rounded-xl overflow-hidden bg-gray-900 p-3">

                        {/* IMAGE */}
                        {post.media.type === "image" && (
                          <img
                            src={post.media.url}
                            alt="post"
                            className="w-full h-auto max-h-80 object-contain mx-auto hover:scale-[1.01] transition-transform duration-300 cursor-pointer rounded-lg bg-black/20"
                            onClick={() => {
                              setSelectedImage(post.media.url);
                              setShowModal(true);
                            }}
                          />
                        )}

                        {/* VIDEO */}
                        {post.media.type === "video" && (
                          <video
                            src={post.media.url}
                            controls
                            className="w-full h-auto max-h-80 mx-auto rounded-xl bg-black/20"
                          />
                        )}

                        {/* FILE */}
                        {post.media.type === "file" && (
                          <a
                            href={post.media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition text-white"
                          >
                            <span className="text-xl">📎</span>
                            <span className="font-medium">
                              {getFileLabel(post.media.url)}
                            </span>
                          </a>
                        )}

                      </div>
                    )}

                  </div>

                  {/* Post Footer - Interactions */}
                  <div className="p-4 border-t border-gray-700 flex justify-around items-center bg-gray-900/50">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 transition group ${post.likes?.includes(currentUserId)
                        ? "text-red-400"
                        : "text-gray-400 hover:text-red-400"
                        }`}
                    >
                      <FaHeart className="group-hover:scale-110 transition" />
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </button>


                    <button
                      onClick={() => handleCommentClick(post._id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition group"
                    >
                      <FaComment className="group-hover:scale-110 transition" />
                      <span className="text-sm">Comment ({comments[post._id]?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => navigate('/chat', { state: { sharedPostId: post._id } })}
                      className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition group"
                    >
                      <FaShare className="group-hover:scale-110 transition" />
                      <span className="text-sm">Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Sidebar - Trending & Stats */}
          <div className="w-80 flex-shrink-0 hidden lg:block space-y-5">
            {/* Stats Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Community Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Posts</span>
                  <span className="font-bold text-green-400">{posts.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Users</span>
                  <span className="font-bold text-cyan-400">{totalUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Engagement</span>
                  <span className="font-bold text-purple-400">{totalLikes}</span>
                </div>
              </div>
            </div>

            {/* Trending Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl"></span> Trending
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => setFilter(null)}
                  className={`w-full p-3 mb-3 rounded-lg cursor-pointer transition ${!filter ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <p className="font-semibold text-sm">All Posts</p>
                </button>

                {trendingTags.length > 0 ? (
                  trendingTags.map((trend, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFilter(trend.tag)}
                      className={`p-3 rounded-lg cursor-pointer transition flex justify-between items-center ${filter === trend.tag ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <span className="font-semibold text-sm">#{trend.tag}</span>
                      <span className="bg-gray-900 text-xs px-2 py-1 rounded-full text-gray-400">{trend.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center">No trending topics yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Image Modal */}
      {
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <img src={selectedImage} alt="Full view" className="max-w-full max-h-full object-contain" />
          </div>
        )
      }
    </DashboardLayout >
  );
};

export default Community;
