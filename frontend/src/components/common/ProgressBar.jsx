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
  const inProgress = Math.max(0, current - successful - failed);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusText = () => {
    if (status === 'complete') {
      return 'All certificates processed!';
    }
    if (status === 'error') {
      return 'Process stopped due to error';
    }
    if (status === 'processing' && currentRecipient) {
      return `Processing: ${currentRecipient.name}`;
    }
    return 'Ready to start';
  };

  return (
    <div className="progress-container">
      <div className="progress-card">
        <div className="progress-status">
          <h3 className="status-title">{getStatusText()}</h3>
        </div>

        <div className="progress-bar-section">
          <div className="progress-track">
            <div 
              className={`progress-fill ${status}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="progress-info">
            <span className="progress-text">{current} / {total}</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-success">
            <div className="stat-number">{successful}</div>
            <div className="stat-label">SUCCESSFUL</div>
          </div>
          
          <div className="stat-card stat-progress">
            <div className="stat-number">{inProgress}</div>
            <div className="stat-label">IN PROGRESS</div>
          </div>
          
          <div className="stat-card stat-failed">
            <div className="stat-number">{failed}</div>
            <div className="stat-label">FAILED</div>
          </div>
        </div>

        {status === 'processing' && (
          <div className="time-info">
            <span>Elapsed: {formatTime(elapsedTime)}</span>
            {estimatedTimeRemaining > 0 && (
              <span>ETA: {formatTime(estimatedTimeRemaining)}</span>
            )}
          </div>
        )}

        {recentLogs.length > 0 && (
          <div className="activity-section">
            <h4 className="activity-title">Recent Activity</h4>
            <div className="activity-list">
              {recentLogs.map((log, index) => (
                <div key={index} className={`activity-item activity-${log.type}`}>
                  <span className="activity-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="activity-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
