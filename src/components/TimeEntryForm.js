import React, { useState } from 'react';
import { timeEntriesAPI } from '../services/api';
import './TimeEntryForm.css';

const TimeEntryForm = ({ taskId, projectId, onEntryCreated }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    minutes: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalMinutes = (parseFloat(formData.hours) || 0) * 60 + (parseFloat(formData.minutes) || 0);
      if (totalMinutes <= 0) {
        alert('Please enter a valid time duration');
        setLoading(false);
        return;
      }

      const entryData = {
        taskId: taskId,
        projectId: projectId,
        date: formData.date,
        duration: {
          seconds: totalMinutes * 60,
        },
        description: formData.description,
      };

      await timeEntriesAPI.createManual(entryData);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        minutes: '',
        description: '',
      });

      if (onEntryCreated) {
        onEntryCreated();
      }
    } catch (error) {
      console.error('Error creating time entry:', error);
      alert('Error creating time entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="time-entry-form">
      <h3>Add Manual Time Entry</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="time-input-group">
          <div className="form-group">
            <label>Hours</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              value={formData.minutes}
              onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            placeholder="What did you work on?"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Time Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimeEntryForm;

