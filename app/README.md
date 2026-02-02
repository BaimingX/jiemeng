# Dream Whisperer Mobile (Expo)

这是 Dream Whisperer 的移动端独立 App，基于 Expo 和 React Native 构建。

## 目录结构
- **app/**: 包含所有页面和路由 (Expo Router)。
- **components/**:虽然目前还没有，但后续组件会放在这里。
- **lib/**: Supabase 客户端配置。
- **context/**: 状态管理 (如 AuthContext)。

## 如何运行 (Verification)

### 1. 环境准备
确保你已经安装了 Node.js。
确保在 `app` 目录下：
```bash
cd d:\projects\dream-whisperer\app
```

### 2. 安装依赖
如果你是第一次运行，或者拉取了新代码：
```bash
npm install
```

### 3. 启动项目
运行开发服务器：
```bash
npx expo start
```
或者如果你想强制使用隧道（解决网络问题）：
```bash
npx expo start --tunnel
```

### 4. 在手机上预览
1. 在你的手机上下载 **Expo Go** 应用 (App Store 或 Google Play)。
2. 确保手机和电脑连接在**同一个 Wi-Fi** 下（如果使用 `--tunnel` 则不需要）。
3. 使用 Expo Go 扫描终端中显示的 **QR 码**。
   - iPhone: 使用系统相机扫描。
   - Android: 使用 Expo Go 应用内的扫描功能。

## 常见问题
- **Supabase 连接**: 确保 `.env` 文件中的 Supabase URL 和 Key 是正确的。
- **样式**: 本项目使用 NativeWind (Tailwind CSS)，如果样式不生效，尝试清除缓存重启: `npx expo start -c`。
