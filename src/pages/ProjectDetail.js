import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI, timeEntriesAPI, invoicesAPI } from '../services/api';
import TaskDetail from '../components/TaskDetail';
import TimeTracking from '../components/TimeTracking';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadProject();
    loadTasks();
    loadTimeEntries();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getByProject(id);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadTimeEntries = async () => {
    try {
      const response = await timeEntriesAPI.getByProject(id);
      setTimeEntries(response.data);
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await invoicesAPI.createFromProject(id);
      navigate(`/invoices/${response.data.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!project) {
    return <div className="container">Project not found</div>;
  }

  const totalHours = timeEntries
    .filter(te => te.duration)
    .reduce((sum, te) => sum + (te.duration.seconds / 3600), 0);

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            ← Back
          </button>
          <h1 style={{ display: 'inline', marginLeft: '20px' }}>{project.name}</h1>
        </div>
        {project.type === 'HOURLY' && (
          <button className="btn btn-primary" onClick={handleCreateInvoice}>
            Create Invoice
          </button>
        )}
      </div>

      <div className="card">
        <div className="project-info">
          <p><strong>Type:</strong> {project.type}</p>
          <p><strong>Status:</strong> {project.status}</p>
          <p><strong>Client:</strong> {project.client?.name || 'N/A'}</p>
          {project.type === 'HOURLY' && (
            <p><strong>Total Hours:</strong> {totalHours.toFixed(2)}</p>
          )}
          {project.type === 'FIXED_PRICE' && (
            <p><strong>Total Value:</strong> ${project.totalValue?.toFixed(2)}</p>
          )}
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'tasks' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button
          className={activeTab === 'time' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('time')}
        >
          Time Entries
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="card">
          <h2>Tasks</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>
                    <span className={`badge badge-${task.status === 'DONE' ? 'success' : 'info'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.priority}</td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setSelectedTask({ id: task.id, projectId: id })}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="card">
          <h2>Time Entries</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>Duration</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    No time entries found for this project.
                  </td>
                </tr>
              ) : (
                timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.date || entry.startTime).toLocaleDateString()}</td>
                    <td>{entry.task?.title || 'N/A'}</td>
                    <td>
                      {entry.duration
                        ? `${(entry.duration.seconds / 3600).toFixed(2)} hours`
                        : 'Running...'}
                    </td>
                    <td>{entry.description || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedTask && (
        <TaskDetail
          taskId={selectedTask.id}
          projectId={selectedTask.projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            loadTasks();
            loadTimeEntries();
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;

