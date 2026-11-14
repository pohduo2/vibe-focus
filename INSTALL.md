# 安装说明 · Vibe Focus v1.0.0

> 下载页：<https://pohduo2.github.io/vibe-focus/>
> 所有安装包：<https://github.com/pohduo2/vibe-focus/releases/tag/v1.0.0>

## 下载对照表

| 平台 | 文件 | 大小 | 适用 |
| --- | --- | --- | --- |
| Windows | `VibeFocus-1.0.0-Setup-x64.exe` | 78 MB | Windows 10 / 11（64 位） |
| macOS Apple 芯片 | `VibeFocus-1.0.0-arm64.dmg` | 94 MB | M1 / M2 / M3 / M4 |
| macOS Intel | `VibeFocus-1.0.0-x64.dmg` | 98 MB | Intel 芯片 Mac |
| Android | `VibeFocus-1.0.0-release.apk` | 31 KB | Android 7.0+ |
| Linux | `VibeFocus-1.0.0-x86_64.AppImage` | 103 MB | 主流 x64 发行版 |

不知道 Mac 是什么芯片？左上角苹果菜单 →「关于本机」，看「芯片」一行：写 `Apple M...` 选 arm64，写 `Intel` 选 x64。

---

## Windows

1. 双击 `VibeFocus-1.0.0-Setup-x64.exe`
2. 选择安装目录（默认即可），一路下一步
3. 桌面与开始菜单出现「Vibe Focus」

**遇到 SmartScreen**：显示「Windows 已保护你的电脑」时，点 **更多信息** → **仍要运行**。原因是安装包未购买代码签名证书，与安全性无关。

**卸载**：设置 → 应用 → Vibe Focus → 卸载，或从安装目录运行 `Uninstall Vibe Focus.exe`。

---

## macOS

1. 根据芯片下载对应 dmg
2. 双击打开，把 **Vibe Focus** 拖进「应用程序」文件夹
3. **右键**点击应用图标 → **打开** → 在弹窗里再点 **打开**

第一次必须这样操作，之后双击即可正常启动。

**若提示「已损坏，无法打开」**，在终端执行：

```bash
xattr -dr com.apple.quarantine "/Applications/Vibe Focus.app"
```

**若提示「无法验证开发者」**：系统设置 → 隐私与安全性 → 页面底部点 **仍要打开**。

**注意**：应用不占 Dock 图标（`LSUIElement`），启动后请从菜单栏右侧的番茄图标操作。

---

## Android

1. 把 APK 传到手机：微信「文件传输助手」、QQ、数据线、网盘均可
2. 在文件管理器里点击 APK
3. 提示「禁止安装未知应用」时，点 **设置** → 允许该来源安装
4. 安装完成，桌面出现番茄图标

**关于证书**：APK 使用自签名证书（`vibefocus.jks`，密码 `vibefocus`）。后续版本升级必须用同一证书签名，否则需要先卸载旧版再装 —— 卸载会清空 localStorage，打卡记录会丢。升级前建议先截图留存统计。

**功能差异**：手机版有完整的计时、四种氛围、情绪打卡、本地统计；「透明悬浮于其他应用之上」是桌面系统能力，手机端没有。

---

## Linux

```bash
chmod +x VibeFocus-1.0.0-x86_64.AppImage
./VibeFocus-1.0.0-x86_64.AppImage
```

**报 FUSE 错误**（如 `dlopen(): error loading libfuse.so.2`）：安装 FUSE 或改用解包模式运行

```bash
# Debian / Ubuntu
sudo apt install libfuse2

# 或直接解包运行（不需要 FUSE）
./VibeFocus-1.0.0-x86_64.AppImage --appimage-extract-and-run
```

**Wayland 下窗口位置异常**：设置环境变量以 XWayland 运行

```bash
GDK_BACKEND=x11 ./VibeFocus-1.0.0-x86_64.AppImage
```

---

## 移动端与网页版

不想安装 App 的用户可以直接用浏览器打开网页版：

**<https://pohduo2.github.io/vibe-focus/web/>**

功能与桌面版一致（计时、氛围、打卡、统计），只是没有桌面悬浮能力。iOS 用户推荐用 Safari 打开后点分享 →「添加到主屏幕」，可获得全屏无地址栏的类 App 体验。

---

## 校验文件完整性

下载后可核对 SHA256，前 16 位如下：

| 文件 | SHA256（前 16 位） |
| --- | --- |
| `VibeFocus-1.0.0-Setup-x64.exe` | `f86dd53c7ea49261` |
| `VibeFocus-1.0.0-release.apk` | `b8445734f226c118` |
| `VibeFocus-1.0.0-x86_64.AppImage` | `323bf6b19be8e31c` |

完整校验：

```bash
# macOS / Linux
shasum -a 256 <文件名>
# Windows PowerShell
Get-FileHash <文件名> -Algorithm SHA256
```

---

## 常见问题

**Q：打卡记录会同步到云端吗？**
不会。所有数据只存在本机 localStorage，不发起任何网络请求。换设备或清除浏览器数据会丢失。

**Q：为什么关掉窗口后进程还在？**
设计如此。关窗口只是收进托盘，计时继续。彻底退出请右键托盘图标 → 退出。

**Q：能改番茄时长吗？**
可以。面板里点设置图标，三个模式分别可调，步进 1 分钟，范围 1–120。

**Q：白噪音需要联网吗？**
不需要。雨声、杯碟、键盘、鸟鸣全部由 WebAudio 实时合成，安装包里没有任何音频文件。

**Q：快捷键不起作用？**
可能被其他应用占用。全局快捷键为 `Ctrl/Cmd+Shift+Space`（开始/暂停）与 `Ctrl/Cmd+Shift+F`（唤出/收起）。
