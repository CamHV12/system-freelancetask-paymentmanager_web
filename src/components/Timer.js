import React, { useState, useEffect, useRef } from 'react';
import { timeEntriesAPI } from '../services/api';
import './Timer.css';

const Timer = ({ taskId, onTimerStop }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTimeEntry, setCurrentTimeEntry] = useState(null);
  const [description, setDescription] = useState('');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    // Check if there's an active timer for this task
    checkActiveTimer();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [taskId]);

  const checkActiveTimer = async () => {
    try {
      const response = await timeEntriesAPI.getByTask(taskId);
      const activeEntry = response.data.find(entry => !entry.duration);
      if (activeEntry) {
        setCurrentTimeEntry(activeEntry);
        setIsRunning(true);
        // Calculate elapsed time from start time
        const startTime = new Date(activeEntry.startTime);
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
        startTimer();
      }
    } catch (error) {
      console.error('Error checking active timer:', error);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startTimeRef.current = Date.now() - elapsedTime * 1000;
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const handleStart = async () => {
    try {
      const response = await timeEntriesAPI.startTimer(taskId);
      setCurrentTimeEntry(response.data);
      setIsRunning(true);
      setElapsedTime(0);
      startTimeRef.current = Date.now();
      startTimer();
    } catch (error) {
      console.error('Error starting timer:', error);
      alert('Error starting timer');
    }
  };

  const handleStop = async () => {
    if (!currentTimeEntry) return;
    
    try {
      await timeEntriesAPI.stopTimer(currentTimeEntry.id);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsRunning(false);
      setCurrentTimeEntry(null);
      setElapsedTime(0);
      if (onTimerStop) {
        onTimerStop();
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      alert('Error stopping timer');
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="timer-container">
      <div className="timer-display">
        <div className="timer-time">{formatTime(elapsedTime)}</div>
        <div className="timer-status">
          {isRunning ? (
            <span className="timer-running">● Running</span>
          ) : (
            <span className="timer-stopped">○ Stopped</span>
          )}
        </div>
      </div>
      
      {isRunning && (
        <div className="timer-description">
          <input
            type="text"
            placeholder="What are you working on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="timer-input"
          />
        </div>
      )}

      <div className="timer-controls">
        {!isRunning ? (
          <button className="btn btn-success timer-btn" onClick={handleStart}>
            ▶ Start Timer
          </button>
        ) : (
          <button className="btn btn-danger timer-btn" onClick={handleStop}>
            ⏹ Stop Timer
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;

