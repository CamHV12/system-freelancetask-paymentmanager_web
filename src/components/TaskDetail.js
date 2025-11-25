import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import TimeTracking from './TimeTracking';
import TaskComments from './TaskComments';
import FileUpload from './FileUpload';
import FileList from './FileList';
import './TaskDetail.css';

const TaskDetail = ({ taskId, projectId, onClose, onUpdate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fileReloadKey, setFileReloadKey] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
  });

  useEffect(() => {
    if (taskId && projectId) {
      loadTask();
    }
  }, [taskId, projectId]);

  const loadTask = async () => {
    try {
      const response = await tasksAPI.getById(taskId, projectId);
      const taskData = response.data;
      setTask(taskData);
      setFormData({
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.update(taskId, formData, projectId);
      setEditing(false);
      loadTask();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task');
    }
  };

  if (loading) {
    return (
      <div className="task-detail-modal">
        <div className="task-detail-content">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-modal">
        <div className="task-detail-content">
          <div>Task not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-detail-modal" onClick={onClose}>
      <div className="task-detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="task-detail-header">
          <h2>Task Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {!editing ? (
          <>
            <div className="task-detail-info">
              <div className="task-field">
                <label>Title:</label>
                <p>{task.title}</p>
              </div>
              {task.description && (
                <div className="task-field">
                  <label>Description:</label>
                  <p>{task.description}</p>
                </div>
              )}
              <div className="task-field">
                <label>Status:</label>
                <span className={`badge badge-${task.status === 'DONE' ? 'success' : 'info'}`}>
                  {task.status}
                </span>
              </div>
              <div className="task-field">
                <label>Priority:</label>
                <span className="badge badge-primary">{task.priority}</span>
              </div>
              {task.dueDate && (
                <div className="task-field">
                  <label>Due Date:</label>
                  <p>{new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="task-detail-actions">
              <button className="btn btn-primary" onClick={() => setEditing(true)}>
                Edit Task
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        )}

        <div className="task-time-tracking">
          <TimeTracking taskId={taskId} projectId={projectId} />
        </div>

        <div className="task-comments-section">
          <TaskComments taskId={taskId} projectId={projectId} />
        </div>

        <div className="task-files-section">
          <FileUpload
            projectId={projectId}
            taskId={taskId}
            onUploadSuccess={() => {
              setFileReloadKey(prev => prev + 1);
            }}
          />
          <FileList key={fileReloadKey} projectId={projectId} taskId={taskId} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;

