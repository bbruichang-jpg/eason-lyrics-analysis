# 🚀 部署指南

## 快速部署（推荐）

### 步骤 1: 在 GitHub 创建仓库

1. 访问 [GitHub](https://github.com/new)
2. 创建新仓库，例如：`eason-lyrics-analysis`
3. **不要**勾选 "Add a README file"（已有 README）

### 步骤 2: 推送代码到 GitHub

```bash
# 进入项目目录
cd /workspace/projects

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/eason-lyrics-analysis.git

# 推送代码
git push -u origin main
```

### 步骤 3: 在 Vercel 部署

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign Up" 或 "Log In"（可用 GitHub 账号登录）
3. 点击 "Add New..." → "Project"
4. 选择你的 GitHub 仓库 `eason-lyrics-analysis`
5. 点击 "Deploy"
6. 等待 2-3 分钟部署完成

### 步骤 4: 访问你的网站

部署完成后，你会获得一个永久地址：
```
https://eason-lyrics-analysis.vercel.app
```

---

## 绑定自定义域名（可选）

1. 在 Vercel 项目页面点击 "Settings"
2. 点击 "Domains"
3. 添加你的域名，例如：`eason.yourdomain.com`
4. 按提示在域名服务商处添加 DNS 记录

---

## 自动部署

配置完成后，每次你执行：

```bash
git add .
git commit -m "更新内容"
git push
```

Vercel 会自动重新部署，无需手动操作！

---

## 项目信息

- **框架**: Next.js 16
- **构建命令**: `pnpm run build`
- **启动命令**: `pnpm start`
- **Node 版本**: 18+

---

## 故障排查

### 部署失败

1. 检查 `pnpm-lock.yaml` 是否存在
2. 检查 Node.js 版本是否 >= 18
3. 查看 Vercel 部署日志

### 页面空白

1. 检查浏览器控制台是否有错误
2. 确认 API 路由是否正常工作

---

需要帮助？请查看 [Next.js 文档](https://nextjs.org/docs) 或 [Vercel 文档](https://vercel.com/docs)
