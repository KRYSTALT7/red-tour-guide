// frontend/js/config.example.js
// 复制为 config.js 后填写自己的参数。不要把真正的 AI API Key 写进前端。
// 高德地图 Web Key 可放前端，但建议在高德控制台绑定域名白名单。
// DeepSeek / 通义千问等 AI Key 必须放后端环境变量。
window.APP_CONFIG = {
  PROJECT_NAME: "红土客韵・数字陆河",
  HOME_URL: "https://krystalt7.github.io/red-tour-guide/",
  AMAP_KEY: "请填写你的高德 Web JS Key",
  AMAP_SECURITY_CODE: "请填写你的高德安全密钥",
  API_BASE_URL: "" // 本地开发可填 http://localhost:3000；部署 Vercel 后填你的后端地址
};
