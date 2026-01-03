# 自动刷屏工具

一个基于 Electron 的桌面应用，用于在淘宝、抖音等直播间的输入框中自动刷屏。

## 功能特点

- 🎯 简单易用的界面
- ⚡ 可自定义刷屏内容和次数
- ⏱️ 可设置时间间隔
- 📊 实时显示刷屏进度
- 🛑 支持随时停止
- 🖥️ 跨平台支持 (macOS & Windows)

## 技术方案

本项目使用 **Native Addon** 实现精确的键盘输入控制，**跨平台支持**：

- **macOS**: 使用 Quartz Event Services (CGEvent)
- **Windows**: 使用 SendInput API

相比 robotjs 有以下优势：

✅ **精确控制**：直接使用系统原生 API，精确控制 keydown/keyup 时序  
✅ **避免连击**：可控延迟（10ms），避免系统 key repeat 导致的 `666666` 问题  
✅ **稳定可靠**：不依赖第三方库，兼容性更好  
✅ **维护活跃**：基于官方 API，长期稳定  
✅ **跨平台**：同时支持 macOS 和 Windows

### 为什么不用 robotjs？

- 项目多年无人维护，Electron 新版本经常编译失败
- 输入精度不够，容易出现连击问题
- macOS 新系统兼容性差
- 键盘节奏固定，容易被识别

## 安装步骤

### 1. 前置要求

- Node.js (推荐 v16+)
- npm 或 yarn
- **macOS 或 Windows 系统**（当前支持 macOS 和 Windows）

#### macOS 要求：
- Xcode Command Line Tools（用于编译 Native Addon）

安装 Xcode Command Line Tools：
```bash
xcode-select --install
```

#### Windows 要求：
- Visual Studio Build Tools 或 Visual Studio（用于编译 Native Addon）
- Windows SDK

安装 Visual Studio Build Tools：
- 下载并安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
- 或安装完整版 Visual Studio（勾选 "使用 C++ 的桌面开发" 工作负载）

### 2. 安装依赖并编译

```bash
npm install
```

这会自动编译 Native Addon（使用 electron-rebuild）。如果编译失败，可以手动运行：
```bash
npm run rebuild
```

> 💡 **提示**：首次安装或更新 Electron 版本后，需要重新编译 Native Addon。`npm install` 会自动处理，但如有问题请查看 [INSTALL.md](INSTALL.md) 获取详细故障排查指南。

### 3. 权限设置（重要！）

#### macOS 权限设置：

在使用前，需要在 macOS 系统设置中授予辅助功能权限：

1. 打开 **系统偏好设置** > **安全性与隐私** > **隐私**
2. 选择左侧的 **辅助功能**
3. 点击左下角的锁图标解锁
4. 找到 Terminal 或你使用的终端应用，勾选它
5. 如果是首次运行，应用启动时会提示权限，点击 **打开系统偏好设置** 并授予权限

#### Windows 权限设置：

Windows 上使用 SendInput API 通常**不需要管理员权限**即可工作。但某些安全软件可能会阻止模拟输入。

如果输入无效：
1. 尝试以管理员身份运行应用
2. 检查是否被安全软件阻止
3. 确认在正确的输入框中

### 4. 运行应用

```bash
npm start
```

## 使用方法

1. 在 **输入内容** 框中输入要刷屏的内容（例如：666）
2. 在 **设置次数** 框中输入要刷屏的次数（例如：1000）
3. 在 **时间间隔** 框中输入每次刷屏的间隔，单位是毫秒（例如：1000 表示 1 秒）
4. 点击 **开始** 按钮
5. **重要**：在 5 秒倒计时内，切换到目标窗口（淘宝/抖音直播间），并**点击输入框**
6. 应用会自动开始刷屏，完成后自动停止

## 快捷键

- `Command+Shift+S` (macOS) 或 `Ctrl+Shift+S` (Windows/Linux)：停止刷屏

## 注意事项

⚠️ **使用提示**：
- 请确保在点击"开始"后的 5 秒内切换到目标窗口并点击输入框
- 刷屏过程中可以通过点击"停止"按钮或使用快捷键来停止
- 时间间隔建议设置为至少 100 毫秒，避免输入过快导致的问题
- 本工具仅供学习交流使用，请遵守平台规则，合理使用

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **Node.js** - JavaScript 运行时
- **Native Addon (C++)** - 使用 macOS Quartz Event Services / Windows SendInput 实现精确键盘控制
- **node-gyp** - Native Addon 构建工具

## 项目结构

```
lucky-draw1/
├── main.js              # Electron 主进程
├── preload.js           # 预加载脚本
├── index.html           # 应用界面
├── renderer.js          # 渲染进程逻辑
├── package.json         # 项目配置
├── binding.gyp          # Native Addon 构建配置
├── native/
│   ├── keyboard.cc      # macOS 键盘控制实现（Quartz Event Services）
│   └── keyboard_win.cc  # Windows 键盘控制实现（SendInput API）
├── build/               # 编译输出目录（自动生成）
└── README.md            # 说明文档
```

## 常见问题

### Q: 提示"请先授予辅助功能权限"
A: 需要在系统设置中授予辅助功能权限，详见上面的安装步骤。

### Q: 输入没有反应
A: 请确保：
1. 已授予辅助功能权限（macOS）或尝试管理员权限（Windows）
2. 在倒计时结束前点击了目标输入框
3. 输入框处于可输入状态

### Q: Native Addon 编译失败

**macOS:**
1. 确认已安装 Xcode Command Line Tools: `xcode-select --install`
2. 检查安装: `xcode-select -p` 应该返回路径
3. 清理后重新编译: `rm -rf build node_modules && npm install`

**Windows:**
1. 确认已安装 Visual Studio Build Tools 或 Visual Studio
2. 确保安装了 "使用 C++ 的桌面开发" 工作负载
3. 清理后重新编译: `rmdir /s /q build node_modules && npm install`
4. 如果使用 PowerShell: `Remove-Item -Recurse -Force build,node_modules && npm install`

### Q: 是否支持 Linux？
A: 当前实现支持 **macOS 和 Windows**。如需 Linux 支持，需要：
1. 在 `native/` 目录中添加 `keyboard_linux.cc`（使用 X11 API）
2. 在 `binding.gyp` 中添加 Linux 配置
3. 修改 `main.js` 中的平台判断逻辑

### Q: 为什么输入会有延迟？
A: Native Addon 在每个字符之间设置了 10ms 延迟，这是为了：
- 避免系统 key repeat 机制触发
- 模拟更自然的输入节奏
- 确保每个按键事件都被正确处理

这个延迟非常小（10ms），不会影响使用体验，但能有效避免 `666666` 这样的连击问题。

