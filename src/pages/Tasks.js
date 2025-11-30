import { useCallback, useEffect, useState } from 'react';
import TaskDetail from '../components/TaskDetail';
import { projectsAPI, tasksAPI } from '../services/api';
import './Projects.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      const payload = response.data;
      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload.projects)) {
        items = payload.projects;
      } else if (Array.isArray(payload.data)) {
        items = payload.data;
      } else {
        items = [];
      }
      setProjects(items);
      if (items.length > 0) {
        setSelectedProject(items[0].id.toString());
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = useCallback(async () => {
    try {
      const response = await tasksAPI.getByProject(selectedProject);
      const payload = response.data;
      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload.tasks)) {
        items = payload.tasks;
      } else if (Array.isArray(payload.data)) {
        items = payload.data;
      } else {
        items = [];
      }
      setTasks(items);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    } else {
      setTasks([]);
    }
  }, [selectedProject, loadTasks]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Tasks</h1>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group">
          <label>Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject && (
        <div className="card">
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
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No tasks found for this project.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
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
                        onClick={() => setSelectedTask({ id: task.id, projectId: selectedProject })}
                      >
                        View
                      </button>
                    </td>
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
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Tasks;

