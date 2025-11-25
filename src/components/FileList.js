import React, { useState, useEffect } from 'react';
import { filesAPI } from '../services/api';
import './FileList.css';

const FileList = ({ projectId, taskId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [projectId, taskId]);

  const loadFiles = async () => {
    try {
      let response;
      if (taskId) {
        response = await filesAPI.getByTask(taskId);
      } else if (projectId) {
        response = await filesAPI.getByProject(projectId);
      } else {
        return;
      }
      setFiles(response.data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await filesAPI.download(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await filesAPI.delete(fileId);
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦',
    };
    return icons[ext] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="file-list-loading">Loading files...</div>;
  }

  return (
    <div className="file-list">
      <h3>Files ({files.length})</h3>
      {files.length === 0 ? (
        <div className="no-files">No files uploaded yet</div>
      ) : (
        <div className="files-grid">
          {files.map((file) => (
            <div key={file.id} className="file-card">
              <div className="file-icon">{getFileIcon(file.fileName)}</div>
              <div className="file-info">
                <div className="file-name" title={file.fileName}>
                  {file.fileName}
                </div>
                <div className="file-meta">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="file-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleDownload(file.id, file.fileName)}
                  title="Download"
                >
                  ⬇️
                </button>
                <button
                  className="btn-icon"
                  onClick={() => handleDelete(file.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;

