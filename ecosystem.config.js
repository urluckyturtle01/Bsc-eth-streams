module.exports = {
  apps: [
    {
      name: 'next-app',
      script: 'npm',
      args: 'run dev',
      exec_mode: 'fork',
      env: {
        PORT: 6050,
        NODE_ENV: 'development'
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'kafka-bsc',
      script: './kafka-ws-server.js',
      exec_mode: 'fork',
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    },
    {
      name: 'kafka-eth',
      script: './kafka-ws-eth-server.js',
      exec_mode: 'fork',
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M'
    }
  ]
}
