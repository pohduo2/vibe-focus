#!/usr/bin/env bash
# 一条命令发布 Vibe Focus：建仓库 → 推代码 → 打 tag → 上传安装包 → 触发 macOS 构建
# 用法：bash scripts/publish.sh [版本号] [仓库名]
set -euo pipefail

VERSION="${1:-v1.0.0}"
REPO_NAME="${2:-vibe-focus}"
DIST_DIR="${DIST_DIR:-../release-packages}"

say() { printf "\033[1;36m▸ %s\033[0m\n" "$1"; }
die() { printf "\033[1;31m✗ %s\033[0m\n" "$1" >&2; exit 1; }

command -v gh >/dev/null 2>&1 || die "未安装 GitHub CLI，请先安装：https://cli.github.com"
gh auth status >/dev/null 2>&1 || die "未登录 GitHub，请先执行：gh auth login"

# 1. 初始化仓库
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  say "初始化 Git 仓库"
  git init -b main >/dev/null
fi

git add -A
git -c user.name="Vibe Focus" -c user.email="dev@vibefocus.local" \
    commit -m "feat: Vibe Focus 桌宠番茄钟 ${VERSION}" >/dev/null 2>&1 || true

# 2. 创建远程仓库并推送
if ! git remote get-url origin >/dev/null 2>&1; then
  say "创建公开仓库 ${REPO_NAME} 并推送"
  gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
else
  say "推送代码到已有远程仓库"
  git push -u origin HEAD
fi

# 3. 打 tag（触发 macOS CI 构建）
say "推送 tag ${VERSION}，触发 macOS 构建"
git tag -f "$VERSION" >/dev/null
git push -f origin "$VERSION"

# 4. 上传本地已构建好的安装包，让下载页立刻可用
if [ -d "$DIST_DIR" ]; then
  FILES=()
  for f in "$DIST_DIR"/*.exe "$DIST_DIR"/*.apk "$DIST_DIR"/*.AppImage; do
    [ -f "$f" ] && FILES+=("$f")
  done
  if [ ${#FILES[@]} -gt 0 ]; then
    say "上传 ${#FILES[@]} 个安装包到 Release"
    if gh release view "$VERSION" >/dev/null 2>&1; then
      gh release upload "$VERSION" "${FILES[@]}" --clobber
    else
      gh release create "$VERSION" "${FILES[@]}" \
        --title "Vibe Focus ${VERSION}" \
        --notes "桌宠番茄钟 + 情绪打卡。Windows / Android / Linux 安装包，macOS 由 CI 构建后自动追加。"
    fi
  fi
else
  say "未找到本地安装包目录 ${DIST_DIR}，全部平台将由 GitHub Actions 构建（约 5-8 分钟）"
fi

USER_LOGIN="$(gh api user -q .login)"
cat <<EOF

✅ 完成

  下载页：https://github.com/${USER_LOGIN}/${REPO_NAME}/releases/tag/${VERSION}
  构建页：https://github.com/${USER_LOGIN}/${REPO_NAME}/actions
  仓库：  https://github.com/${USER_LOGIN}/${REPO_NAME}

macOS 的 dmg 由 GitHub Actions 在 3-6 分钟内构建完成后自动挂到同一个下载页。
EOF
