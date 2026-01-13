# Real-time Collaboration Whiteboard

## 简介
这是一个基于 **WebSocket** 技术构建的实时在线协作白板应用。它允许用户创建房间，邀请他人加入，并同时在一个无限画布上进行绘画、标注和协作。
项目采用前后端分离架构，专为华为云 ECS 云主机环境设计，展示了全栈开发能力和对网络协议（Socket.io）的运用。

## 技术栈
- **前端**: React.js, Vite, Vanilla CSS (Glassmorphism UI)
- **后端**: Node.js, Express
- **实时通信**: Socket.io
- **部署环境**: Huawei Cloud ECS

## 功能特性
1.  **房间管理**: 一键创建独立房间，生成唯一邀请链接。
2.  **实时同步**: 毫秒级延迟的笔迹同步，支持多人同时绘画。
3.  **用户列表**: 实时显示当前在线用户。
4.  **绘图工具**: 多种画笔颜色、粗细调节、橡皮擦（白色画笔）、一键清屏。
5.  **历史回放**: 新用户加入时自动加载之前的绘画记录。

## 本地运行 (Development)

1. **安装依赖**
   ```bash
   npm run install-all
   ```

2. **启动项目**
   ```bash
   npm start
   ```
   
   - 前端地址: http://localhost:5173
   - 后端端口: 3001

## 部署指南 (Huawei Cloud ECS)

1. 购买华为云 ECS 实例 (Ubuntu/CentOS)。
2. 安装 Node.js环境 (v16+)。
3. 上传代码到服务器。
4. 在 `server` 目录运行 `npm install` 和 `node index.js` (建议使用 pm2 托管)。
5. 在 `client` 目录修改 `http://localhost:3001` 为服务器公网 IP，运行 `npm run build`。
6. 使用 Nginx 托管构建后的 `dist` 静态文件，并配置反向代理指向后端端口。

---
*Created for Huawei Cloud Developer Space Application.*
