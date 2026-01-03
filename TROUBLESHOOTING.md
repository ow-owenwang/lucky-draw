# 故障排查指南

## Python 3.13 distutils 错误

如果你遇到 `ModuleNotFoundError: No module named 'distutils'` 错误，这是因为 Python 3.12+ 移除了 `distutils` 模块。

### 解决方案 1：安装 setuptools（推荐）

```bash
python3 -m pip install setuptools
```

然后重新运行：
```bash
npm run rebuild
```

### 解决方案 2：使用 Python 3.11

如果你有多个 Python 版本，可以指定使用 Python 3.11：

```bash
# 使用 pyenv 安装 Python 3.11（如果还没有）
pyenv install 3.11.10

# 在项目目录设置 Python 版本
pyenv local 3.11.10

# 重新安装依赖
rm -rf node_modules build
npm install
npm run rebuild
```

### 解决方案 3：手动编译 Native Addon

如果上述方法都不行，可以手动编译：

1. 首先安装依赖（不编译 Native Addon）：
```bash
npm install --ignore-scripts
```

2. 然后手动编译：
```bash
npm run rebuild
```

### 解决方案 4：使用系统 Python（macOS）

macOS 系统自带的 Python 3.9 或 3.10 通常可以工作：

```bash
# 查看系统 Python 版本
/usr/bin/python3 --version

# 如果版本合适，可以临时使用
export PYTHON=/usr/bin/python3
npm run rebuild
```

## 其他常见问题

### electron-rebuild 找不到模块

确保先安装依赖：
```bash
npm install
```

然后运行：
```bash
npm run rebuild
```

### 权限错误（macOS）

确保已授予辅助功能权限：
1. 系统偏好设置 > 安全性与隐私 > 隐私 > 辅助功能
2. 添加 Terminal 或你的终端应用

### 编译成功但运行时出错

1. 检查 `build/Release/keyboard.node` 文件是否存在
2. 确认使用正确的 Electron 版本
3. 尝试清理后重新编译：
```bash
rm -rf build node_modules
npm install
npm run rebuild
```

