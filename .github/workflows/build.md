

已创建 GitHub Actions 配置，可在 GitHub 上自动打包多个平台。使用说明如下：

## 使用方法

### 1. 推送代码到 GitHub
```bash
git add .
git commit -m "Add GitHub Actions for multi-platform build"
git push origin main
```

### 2. 触发自动构建

两种方式：

**方式 A：推送 Tag 触发构建并创建 Release**
```bash
git tag v1.0.0
git push origin v1.0.0
```
这会自动：
- 在 macOS 上构建 Mac (arm64 和 x64)
- 在 Windows 上构建 Windows (x64)
- 创建 GitHub Release 并上传所有构建产物

**方式 B：手动触发（在 GitHub 网页）**
1. 打开 GitHub 仓库页面
2. 点击 "Actions" 标签
3. 选择 "Build Multi-Platform" 工作流
4. 点击 "Run workflow"

### 3. 下载构建产物

构建完成后：
- 在 GitHub 仓库的 "Actions" 页面下载 Artifacts
- 如果推送了 Tag，会自动创建 Release，可在 Releases 页面下载

## 配置文件说明

我创建了两个工作流文件：

1. `.github/workflows/build.yml` - 使用矩阵策略（更灵活）
2. `.github/workflows/build-simple.yml` - 简单版本（更容易理解）

**推荐使用 `build-simple.yml`**，因为它：
- 更直观
- 在对应的平台上构建对应版本（Mac 构建 Mac，Windows 构建 Windows）
- 自动处理 Native Addon 编译

## 注意事项

1. **Native Addon 编译**：GitHub Actions 会自动在每个平台上重新编译 Native Addon
2. **构建时间**：大约 10-15 分钟（并行构建所有平台）
3. **免费额度**：GitHub Actions 对公开仓库免费，私有仓库有免费额度

将代码推送到 GitHub 后，即可自动构建多平台版本。



