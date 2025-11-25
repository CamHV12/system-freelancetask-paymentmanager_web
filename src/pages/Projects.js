import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'HOURLY',
    status: 'IN_PROGRESS',
    budget: '',
    totalValue: '',
    currency: 'USD',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        totalValue: formData.totalValue ? parseFloat(formData.totalValue) : null,
      };
      await projectsAPI.create(projectData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        type: 'HOURLY',
        status: 'IN_PROGRESS',
        budget: '',
        totalValue: '',
        currency: 'USD',
      });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PLANNING: 'badge badge-info',
      IN_PROGRESS: 'badge badge-success',
      ON_HOLD: 'badge badge-warning',
      COMPLETED: 'badge badge-success',
      CANCELLED: 'badge badge-danger',
    };
    return badges[status] || 'badge';
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Project
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="HOURLY">Hourly</option>
                  <option value="FIXED_PRICE">Fixed Price</option>
                </select>
              </div>
              {formData.type === 'HOURLY' && (
                <div className="form-group">
                  <label>Budget</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              )}
              {formData.type === 'FIXED_PRICE' && (
                <div className="form-group">
                  <label>Total Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="VND">VND</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Client</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  No projects found. Create your first project!
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.type}</td>
                  <td>
                    <span className={getStatusBadge(project.status)}>
                      {project.status}
                    </span>
                  </td>
                  <td>{project.client?.name || 'N/A'}</td>
                  <td>
                    {project.totalValue
                      ? `$${project.totalValue.toFixed(2)}`
                      : project.budget
                      ? `$${project.budget.toFixed(2)}`
                      : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/projects/${project.id}`)}
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
    </div>
  );
};

export default Projects;

