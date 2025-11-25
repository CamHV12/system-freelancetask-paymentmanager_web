import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './TaskComments.css';

const TaskComments = ({ taskId, projectId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getByTask(taskId);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsAPI.create({
        taskId,
        projectId,
        content: newComment,
      });
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Error creating comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.delete(commentId);
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment');
    }
  };

  if (loading) {
    return <div className="task-comments-loading">Loading comments...</div>;
  }

  return (
    <div className="task-comments">
      <h3>Comments ({comments.length})</h3>

      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">No comments yet. Start the conversation!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <strong>{comment.author?.firstName} {comment.author?.lastName}</strong>
                  <span className="comment-time">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                {user && comment.author?.id === user.id && (
                  <button
                    className="delete-comment-btn"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows="3"
          className="comment-input"
        />
        <button type="submit" className="btn btn-primary">
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default TaskComments;

