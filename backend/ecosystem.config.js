module.exports = {
  apps: [{
    name: 'certigen-backend',
    script: './server.js',
    instances: 2, // Run 2 instances for load balancing
    exec_mode: 'cluster', // Enable cluster mode
    max_memory_restart: '500M', // Restart if memory exceeds 500MB
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
