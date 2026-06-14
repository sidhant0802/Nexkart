module.exports = {
  apps: [{
    name:       "nexkart-api",
    script:     "src/index.js",
    instances:  "max",           // Use ALL CPU cores
    exec_mode:  "cluster",       // Cluster mode (load balanced)
    watch:      false,
    max_memory_restart: "500M",  // Restart if uses > 500MB

    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
      PORT:     8080,
    },

    // Logging
    error_file:        "./logs/err.log",
    out_file:          "./logs/out.log",
    log_date_format:   "YYYY-MM-DD HH:mm:ss",
    merge_logs:        true,

    // Auto-restart settings
    autorestart:       true,
    max_restarts:      5,
    min_uptime:        "10s",
  }],
};