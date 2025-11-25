import React, { useState } from 'react';
import { filesAPI } from '../services/api';
import './FileUpload.css';

const FileUpload = ({ projectId, taskId, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        const response = await filesAPI.upload(file, projectId, taskId);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        return { success: true, file: file.name, data: response.data };
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        return { success: false, file: file.name, error: error.message };
      }
    });

    const results = await Promise.all(uploadPromises);
    setUploading(false);
    setFiles([]);
    
    if (onUploadSuccess) {
      onUploadSuccess(results);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-upload">
      <div className="file-upload-area">
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="file-upload-label">
          <span>📎</span>
          <span>Click to select files or drag and drop</span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="files-list">
          <h4>Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
              {uploadProgress[file.name] !== undefined && (
                <div className="upload-progress">
                  <div
                    className="progress-bar"
                    style={{ width: `${uploadProgress[file.name]}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

