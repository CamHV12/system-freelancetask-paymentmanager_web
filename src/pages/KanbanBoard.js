import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TaskDetail from '../components/TaskDetail';
import { projectsAPI, tasksAPI } from '../services/api';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'TODO', title: 'To Do', color: '#6c757d' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#007bff' },
    { id: 'REVIEW', title: 'Review', color: '#ffc107' },
    { id: 'DONE', title: 'Done', color: '#28a745' },
  ];

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadTasks();
    } else {
      loadAllTasks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await projectsAPI.getById(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setError(null);
      const response = await tasksAPI.getByProject(projectId);
      const payload = response.data;
      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload?.tasks)) {
        items = payload.tasks;
      } else if (Array.isArray(payload?.data)) {
        items = payload.data;
      }
      setTasks(items);
      console.log('Tasks loaded:', items);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadAllTasks = async () => {
    try {
      setError(null);
      const projectsResponse = await projectsAPI.getAll();
      let projectsList = [];
      if (Array.isArray(projectsResponse.data)) {
        projectsList = projectsResponse.data;
      } else if (Array.isArray(projectsResponse.data?.projects)) {
        projectsList = projectsResponse.data.projects;
      } else if (Array.isArray(projectsResponse.data?.data)) {
        projectsList = projectsResponse.data.data;
      }
      
      const allTasks = [];
      for (const project of projectsList) {
        try {
          const tasksResponse = await tasksAPI.getByProject(project.id);
          let tasksList = [];
          if (Array.isArray(tasksResponse.data)) {
            tasksList = tasksResponse.data;
          } else if (Array.isArray(tasksResponse.data?.tasks)) {
            tasksList = tasksResponse.data.tasks;
          } else if (Array.isArray(tasksResponse.data?.data)) {
            tasksList = tasksResponse.data.data;
          }
          
          if (tasksList.length > 0) {
            allTasks.push(...tasksList.map(task => ({
              ...task,
              projectName: project.name,
            })));
          }
        } catch (error) {
          console.error(`Error loading tasks for project ${project.id}:`, error);
        }
      }
      setTasks(allTasks);
      console.log('All tasks loaded:', allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    if (draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      await tasksAPI.update(
        draggedTask.id,
        { ...draggedTask, status: newStatus },
        draggedTask.projectId || projectId
      );
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status');
    } finally {
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      HIGH: '#dc3545',
      MEDIUM: '#ffc107',
      LOW: '#28a745',
    };
    return colors[priority] || '#6c757d';
  };

  if (loading) {
    return <div className="container"><p>Loading Kanban Board...</p></div>;
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container kanban-board">
      <div className="kanban-header">
        <h1>
          {project ? `Kanban Board - ${project.name}` : 'Kanban Board - All Projects'}
        </h1>
      </div>

      {tasks.length === 0 && (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
          <p>No tasks found. Create your first task to get started!</p>
        </div>
      )}

      <div className="kanban-container">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div
              key={column.id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="task-count">{columnTasks.length}</span>
              </div>
              <div className="column-content">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => setSelectedTask({
                      id: task.id,
                      projectId: task.projectId || projectId,
                    })}
                  >
                    <div className="card-header">
                      <h4>{task.title}</h4>
                      {task.projectName && (
                        <span className="project-badge">{task.projectName}</span>
                      )}
                    </div>
                    {task.description && (
                      <p className="card-description">{task.description}</p>
                    )}
                    <div className="card-footer">
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="due-date">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && (
                  <div className="empty-column">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetail
          taskId={selectedTask.id}
          projectId={selectedTask.projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadTasks}
        />
      )}
    </div>
  );
};

export default KanbanBoard;

