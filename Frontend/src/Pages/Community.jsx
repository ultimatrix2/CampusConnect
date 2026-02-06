import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../Components/DashboardLayout";
import { FaHeart, FaComment, FaShare, FaSmile, FaImage, FaVideo, FaTrash, FaPaperclip, FaFilePdf, FaFileWord, FaFileExcel, FaReply, FaChevronDown, FaChevronUp } from "react-icons/fa";
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

  // Alert Dialog State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    action: null,
  });


  const filteredPosts = filter ? posts.filter(post => post.content && post.content.toLowerCase().includes(filter.toLowerCase())) : posts;

  const renderContent = (content) => {
    if (!content) return null;
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return <span key={index} className="text-blue-400 font-semibold">{word}</span>;
      }
      return word + ' ';
    });
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

  // ================= CREATE POST =================
  const handlePost = async () => {
    console.log("\n========= HANDLE POST CALLED =========");
    console.log("📝 Content:", content);
    console.log("📎 File object:", file);

    if (!content && !file) {
      toast.warning("Please write something or upload a file");
      return;
    }

    setAlertConfig({
      isOpen: true,
      title: "Confirm Post",
      description: "Once posted, you cannot edit this post. Are you sure you want to post?",
      action: async () => {
        const formData = new FormData();
        formData.append("content", content);
        formData.append("isAnonymous", isAnonymous);

        if (file) {
          console.log("📂 Appending file:", file.name, file.type, file.size);
          formData.append("file", file);
        }

        // 🔥 VERY IMPORTANT DEBUG — see what is inside FormData
        for (let pair of formData.entries()) {
          console.log("📦 FormData:", pair[0], pair[1]);
        }

        try {
          setLoading(true);
          console.log("🚀 Sending request to backend...");

          const response = await axios.post(
            "http://localhost:5001/api/community/create",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
              }
            }
          );

          console.log("✅ Backend response:", response.data);

          // Reset fields
          setContent("");
          setFile(null);
          setIsAnonymous(false);

          console.log("🔄 Refreshing posts...");
          fetchPosts();

        } catch (err) {
          console.log("❌ ERROR FROM BACKEND:", err.response?.data || err.message);

          if (err.response?.data?.code === "AI_BLOCK") {
            toast.error(err.response.data.message);
          } else {
            toast.error("Failed to create post");
          }

        } finally {
          setLoading(false);
          console.log("========= HANDLE POST END =========\n");
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
      setEditLoading(false);
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

  useEffect(() => {
    fetchPosts();
  }, []);





  return (
    <DashboardLayout >
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
            {/* CREATE POST SECTION */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700 mb-6 hover:border-green-400 transition-all duration-300">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center font-bold text-black">
                  You
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="What's on your mind? 🤔"
                    className="w-full bg-gray-700 text-white p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 transition-all"
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

              {/* File Upload & Options */}
              <div className="flex items-center justify-between gap-3">
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
                <div className="text-center py-12">
                  <div className="inline-block animate-spin">
                    <div className="w-12 h-12 border-4 border-gray-600 border-t-green-400 rounded-full"></div>
                  </div>
                  <p className="text-gray-400 mt-4">Loading community posts...</p>
                </div>
              )}

              {!loadingPosts && filteredPosts.length === 0 && (
                <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-lg">
                    {filter ? `No posts with ${filter}. Try another filter!` : "No posts yet. Be the first to share! 🚀"}
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

                        {token && (
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
                      <p className="text-gray-200 leading-relaxed text-base">
                        {renderContent(post.content)}
                      </p>
                    )}

                    {/* Media */}
                    {post.media?.url && (
                      <div className="mt-4 rounded-xl overflow-hidden bg-gray-900 p-3">

                        {/* IMAGE */}
                        {post.media.type === "image" && (
                          <img
                            src={post.media.url}
                            alt="post"
                            className="w-full h-auto max-h-96 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
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
                            className="w-full max-h-96 rounded-xl"
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
            {/* Trending Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔥</span> Trending
              </h2>
              <button
                onClick={() => setFilter(null)}
                className={`w-full p-3 mb-3 rounded-lg cursor-pointer transition ${!filter ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <p className="font-semibold text-sm">All Posts ({posts.length})</p>
              </button>
              <div className="space-y-3">
                {[
                  { label: "Campus Life", tag: "#Campus" },
                  { label: "Study Tips", tag: "#Study" },
                  { label: "Projects", tag: "#Project" },
                  { label: "Events", tag: "#Event" },
                  { label: "News", tag: "#News" }
                ].map(
                  (trend, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFilter(trend.tag)}
                      className={`p-3 rounded-lg cursor-pointer transition ${filter === trend.tag ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      <p className="font-semibold text-sm">{trend.label} ({getTagCount(trend.tag)})</p>
                      <p className="text-xs text-gray-400">Trending Now</p>
                    </div>
                  )
                )}
              </div>
            </div>

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
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <img src={selectedImage} alt="Full view" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Community;
