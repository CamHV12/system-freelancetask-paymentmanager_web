import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tasksAPI, projectsAPI } from '../services/api';
import TaskDetail from '../components/TaskDetail';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const response = await tasksAPI.getByProject(projectId);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllTasks = async () => {
    try {
      const projectsResponse = await projectsAPI.getAll();
      const allTasks = [];
      for (const project of projectsResponse.data) {
        try {
          const tasksResponse = await tasksAPI.getByProject(project.id);
          if (tasksResponse.data) {
            allTasks.push(...tasksResponse.data.map(task => ({
              ...task,
              projectName: project.name,
            })));
          }
        } catch (error) {
          console.error(`Error loading tasks for project ${project.id}:`, error);
        }
      }
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
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
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container kanban-board">
      <div className="kanban-header">
        <h1>
          {project ? `Kanban Board - ${project.name}` : 'Kanban Board - All Projects'}
        </h1>
      </div>

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

