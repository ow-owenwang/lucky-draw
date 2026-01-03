# 针对 Electron 重新编译 Native Addon

Electron 使用自己的 Node.js 版本，所以需要针对 Electron 的 Node.js 版本重新编译 Native Addon。

## 问题

如果看到错误：
```
was compiled against a different Node.js version using
NODE_MODULE_VERSION 127. This version of Node.js requires
NODE_MODULE_VERSION 119.
```

说明 Native Addon 是用系统 Node.js 编译的，需要重新编译。

## 解决方案

### 方法 1：使用 electron-rebuild（推荐，但需要解决 Python 问题）

如果 electron-rebuild 因为 Python distutils 问题失败，先安装 setuptools：

```bash
python3 -m pip install --user setuptools
```

然后运行：

```bash
npm run rebuild-electron
```

### 方法 2：手动使用 node-gyp 针对 Electron 编译

```bash
# 查看 Electron 版本
npx electron -v

# 查看 Electron 使用的 Node.js 版本
npx electron -p "process.versions.node"

# 手动编译（替换 <electron-version> 为实际版本，如 28.3.3）
npx node-gyp rebuild --target=<electron-version> --arch=x64 --disturl=https://electronjs.org/headers
```

例如，如果 Electron 版本是 28.3.3：

```bash
npx node-gyp rebuild --target=28.3.3 --arch=x64 --disturl=https://electronjs.org/headers
```

### 方法 3：使用更简单的方式

Electron 28 通常使用 Node.js 20.x，所以可以：

```bash
# 清理旧的编译文件
rm -rf build

# 使用 node-gyp 针对 Electron 编译
npx node-gyp rebuild --target=$(npx electron -v | sed 's/v//') --arch=x64 --disturl=https://electronjs.org/headers --module_path=.
```

## 验证

编译成功后，运行应用：

```bash
npm start
```

应该不再有版本不匹配的错误。

