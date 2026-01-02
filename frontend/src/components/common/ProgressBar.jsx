import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  total = 0,
  current = 0,
  successful = 0,
  failed = 0,
  status = 'idle',
  currentRecipient = null,
  estimatedTimeRemaining = 0,
  elapsedTime = 0,
  errorMessage = '',
  recentLogs = []
}) => {
  const progressPercent = total > 0 ? Math.round((current / total) * 100) : 0;
  const inProgress = current - successful - failed;

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusIcon = () => {
    return null;
  };

  const getStatusText = () => {
    if (status === 'complete') {
      return 'All certificates processed!';
    }
    if (status === 'error') {
      return 'Process stopped due to error';
    }
    if (status === 'processing' && currentRecipient) {
      return `Sending to ${currentRecipient.name} (${currentRecipient.email})`;
    }
    return 'Ready to start';
  };

  return (
    <div className={`progress-bar-container ${status}`}>
      <div className="progress-header">
        <div className="progress-title">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>
        {status === 'processing' && (
          <div className="progress-time">
            <span className="time-elapsed">Elapsed: {formatTime(elapsedTime)}</span>
            {estimatedTimeRemaining > 0 && (
              <span className="time-remaining">ETA: {formatTime(estimatedTimeRemaining)}</span>
            )}
          </div>
        )}
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="progress-percent">{progressPercent}%</span>
          </div>
        </div>
        <div className="progress-count">
          {current} / {total}
        </div>
      </div>

      <div className="progress-stats">
        <div className="stat-item success">
          <div className="stat-info">
            <div className="stat-value">{successful}</div>
            <div className="stat-label">Successful</div>
          </div>
        </div>

        <div className="stat-item in-progress">
          <div className="stat-info">
            <div className="stat-value">{inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="stat-item failed">
          <div className="stat-info">
            <div className="stat-value">{failed}</div>
            <div className="stat-label">Failed</div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="error-banner">
          <span className="error-text">{errorMessage}</span>
        </div>
      )}

      {recentLogs.length > 0 && (
        <div className="progress-logs">
          <div className="logs-header">Recent Activity</div>
          <div className="logs-container">
            {recentLogs.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
