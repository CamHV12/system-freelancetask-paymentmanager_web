import React, { useState, useEffect } from 'react';
import { timeEntriesAPI } from '../services/api';
import Timer from './Timer';
import TimeEntryForm from './TimeEntryForm';
import './TimeTracking.css';

const TimeTracking = ({ taskId, projectId }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);

  useEffect(() => {
    loadTimeEntries();
  }, [taskId]);

  const loadTimeEntries = async () => {
    if (!taskId) return;
    
    try {
      const response = await timeEntriesAPI.getByTask(taskId);
      setTimeEntries(response.data || []);
    } catch (error) {
      console.error('Error loading time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimerStop = () => {
    loadTimeEntries();
  };

  const handleEntryCreated = () => {
    loadTimeEntries();
    setShowManualForm(false);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      await timeEntriesAPI.delete(entryId);
      loadTimeEntries();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      alert('Error deleting time entry');
    }
  };

  const formatDuration = (duration) => {
    if (!duration || !duration.seconds) return '0:00';
    const hours = Math.floor(duration.seconds / 3600);
    const minutes = Math.floor((duration.seconds % 3600) / 60);
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  };

  const totalHours = timeEntries
    .filter(te => te.duration)
    .reduce((sum, te) => sum + (te.duration.seconds / 3600), 0);

  if (loading) {
    return <div>Loading time entries...</div>;
  }

  return (
    <div className="time-tracking">
      <div className="time-tracking-header">
        <h2>Time Tracking</h2>
        <div className="time-tracking-stats">
          <span className="total-hours">
            Total: <strong>{totalHours.toFixed(2)} hours</strong>
          </span>
        </div>
      </div>

      {taskId && (
        <>
          <Timer taskId={taskId} onTimerStop={handleTimerStop} />
          
          <div className="manual-entry-section">
            {!showManualForm ? (
              <button
                className="btn btn-secondary"
                onClick={() => setShowManualForm(true)}
              >
                + Add Manual Entry
              </button>
            ) : (
              <TimeEntryForm
                taskId={taskId}
                projectId={projectId}
                onEntryCreated={handleEntryCreated}
              />
            )}
          </div>
        </>
      )}

      <div className="time-entries-list">
        <h3>Time Entries</h3>
        {timeEntries.length === 0 ? (
          <p className="no-entries">No time entries yet. Start tracking your time!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.date || entry.startTime).toLocaleDateString()}</td>
                  <td>
                    {entry.duration ? (
                      formatDuration(entry.duration)
                    ) : (
                      <span className="badge badge-warning">Running...</span>
                    )}
                  </td>
                  <td>{entry.description || 'No description'}</td>
                  <td>
                    {entry.duration && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TimeTracking;

