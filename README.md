# exia-framework-game
基于exia-framework框架游戏脚手架项目，快速开始游戏开发
# 项目说明

clone 项目后，到项目根目录，执行以下命令安装依赖：

```bash
npm i
```

重新用 Cocos Creator 3.8.8 打开项目。

---

## ESLint 配置

### 命令

| 命令 | 说明 |
|------|------|
| ``npm run lint`` | 检查 `assets/script` 下所有 `.ts` 文件 |
| `npm run lint:fix` | 检查并自动修复可修复的问题 |

### 编辑器配置（Cursor / VS Code）

**1. 安装 ESLint 插件**

在扩展市场搜索并安装：`dbaeumer.vscode-eslint`

**2. 项目已内置编辑器配置**

`.vscode/settings.json` 已配置好以下行为：
- 禁用内置 TypeScript 格式化器
- 按 `Cmd+S` 保存时自动运行 ESLint 修复

**3. 重启 ESLint 服务**

首次打开项目或修改配置后，按 `Cmd+Shift+P` 执行：

```
ESLint: Restart ESLint Server
```

### 相关文件

| 文件 | 说明 |
|------|------|
| `eslint.config.mjs` | ESLint 规则配置 |
| `tsconfig.eslint.json` | 专供 lint 使用的 TS 配置 |
| `.vscode/settings.json` | 编辑器集成配置 |
| `docs/eslint-rules.md` | 详细代码规范说明 |
