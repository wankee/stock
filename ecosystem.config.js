module.exports = {
  apps: [{
    name: "app1",
    script: "./build/app.js",
    watch: ["build"],
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    max_restarts: 10
  }]
}
