# Vibe Focus · 桌宠番茄钟

一只住在桌面右下角的小番茄。它替你计时，陪你专注，结束后问你一句"刚才感觉怎么样"。

Electron + 原生 HTML/CSS/JS，零框架、零构建工具、零外部资源（白噪音由 WebAudio 实时合成）。

## 下载安装

| 平台 | 文件 | 说明 |
| --- | --- | --- |
| Windows 10/11 x64 | `VibeFocus-1.0.0-Setup-x64.exe` | 双击安装，可选目录，自动建快捷方式 |
| macOS（Intel / Apple Silicon） | `VibeFocus-1.0.0-x64.dmg` / `-arm64.dmg` | 由 GitHub Actions 构建；未公证，首次右键「打开」 |
| Android 7.0+ | `VibeFocus-1.0.0-release.apk` | 允许「未知来源」后安装 |
| Linux x64 | `VibeFocus-1.0.0-x86_64.AppImage` | `chmod +x` 后直接运行 |

安装包见本仓库 **Releases** 页面。iOS 的 `.ipa` 必须由 macOS + Xcode + Apple 开发者账号签名，故不提供。

## 本地开发

```bash
npm install
npm start
```

国内网络若 Electron 下载慢：

```bash
# Windows
set ELECTRON_MIRROR=https://cdn.npmmirror.com/binaries/electron/
# macOS / Linux
export ELECTRON_MIRROR=https://cdn.npmmirror.com/binaries/electron/
npm install
```

## 打包

```bash
npm run dist:win     # Windows NSIS 安装程序
npm run dist:mac     # macOS dmg（需在 macOS 上执行）
npm run dist:linux   # Linux AppImage
```

## 发布（拿到公开下载链接）

```bash
bash scripts/publish.sh v1.0.0
```

脚本会：初始化仓库 → 创建公开仓库 → 推代码 → 打 tag → 上传本地安装包 → 触发 macOS CI。
完成后打印 Releases 下载页地址。`macOS` 的 dmg 由 `.github/workflows/build.yml`
在 macos-latest runner 上构建并自动追加到同一 Release。

前置条件：安装 [GitHub CLI](https://cli.github.com) 并执行 `gh auth login`。

## 功能

- **番茄钟**：25/5/15 三模式，时长可调（1 分钟步进），开始/暂停/重置/跳过；每 4 个番茄自动转长休
- **时间戳计时**：以 `endAt - Date.now()` 驱动，切后台、休眠唤醒都不漂移
- **四种氛围**：雨夜 / 咖啡馆 / 深夜键盘 / 森林，各有专属粒子动画与实时合成白噪音（雨滴、杯碟、机械键盘、鸟鸣）
- **情绪打卡**：番茄结束弹出 6 种心情 + 一句话备注
- **本地持久化**：每次打卡与设置写入 `localStorage`（带版本号与容错），重启不丢
- **统计**：今日番茄数 / 专注分钟、连续天数、近 7 天柱状图、心情分布、最近记录
- **桌宠形态**：点「—」窗口缩为 132×158，只剩小番茄与倒计时气泡；可按住拖到屏幕任意位置；空闲 45 秒打瞌睡冒 zzz；完成番茄时跳跃撒花
- **桌面能力**：透明无边框、置顶、不占任务栏、托盘常驻、开机自启、位置记忆、单实例锁
- **快捷键**：`Ctrl/Cmd+Shift+Space` 开始/暂停，`Ctrl/Cmd+Shift+F` 唤出/收起，`空格` 开始/暂停，`R` 重置，`1-4` 切氛围

## 结构

```
.
├── package.json          # 依赖、脚本、electron-builder 配置
├── main.js               # 主进程：窗口、托盘、快捷键、IPC、尺寸自适应
├── index.html            # 渲染层：样式 + 结构 + 全部逻辑（单文件）
├── build/                # 应用图标（ico / png）
├── scripts/publish.sh    # 一键发布
└── .github/workflows/    # 三平台 CI
```

## 安全说明

为满足"三个文件即可运行"的约束，渲染进程使用 `nodeIntegration: true` 且不设 preload，
但只加载本地 `index.html`，不加载任何远程内容、不执行外部脚本，攻击面仅为本地文件。

## License

MIT
