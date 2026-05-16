# klw

LLM Wiki 知识库管理技能集，为 AI 编程助手提供结构化知识管理能力。

## 功能

| 技能 | 触发词 | 说明 |
|------|--------|------|
| `klw-ingest` | 摄入、ingest、添加到知识库 | 将来源（URL/文件/文本）整合进知识库 |
| `klw-query` | 查询、问知识库、查一下 | 搜索知识库并综合回答 |
| `klw-lint` | 巡检、检查知识库、lint | 健康检查，发现矛盾/过时/孤立页面 |

## 支持工具

- [OpenCode](https://opencode.ai) — 终端 AI 编程助手
- [Claude Code](https://docs.anthropic.com/claude-code) — Anthropic 官方 CLI

## 安装

```bash
npx github:54uso/klw
```

或手动安装：

```bash
git clone https://github.com/54uso/klw.git klw
cd klw
node setup.js
```

安装向导会询问：
1. 知识库路径（默认 `~/知识库`）
2. 安装目标：OpenCode / Claude Code / 全部

## 使用

安装后在 AI 助手中直接使用触发词即可：

### 摄入来源

```
帮我摄入这个文档 https://example.com/article
摄入这个来源 /path/to/file.md
添加到知识库：这是一段粘贴的文本...
```

支持的来源类型：
- URL → 自动抓取转为 markdown（飞书地址优先使用飞书 MCP）
- 本地文件路径 → 读取文件
- 粘贴文本 → 直接处理

### 查询知识

```
查一下关于 XXX 的知识
问知识库：YYY 和 ZZZ 的区别是什么
```

### 健康检查

```
巡检知识库
检查知识库
lint wiki
```

检查内容：
- 矛盾检测：页面间信息不一致
- 过时检测：长期未更新的页面
- 孤立检测：缺少交叉引用的页面
- 索引完整性：索引与实际页面是否匹配

## 知识库结构

```
~/知识库/
├── schema.md          — 目录结构说明
├── raw/               — 原始文档
│   ├── assets/        — 附件
│   └── archive/       — 归档旧版
└── wiki/              — 知识库页面
    ├── index.md       — 内容索引
    ├── log.md         — 操作日志
    ├── overview.md    — 总览
    ├── sources/       — 来源摘要
    ├── entities/      — 实体页面
    └── concepts/      — 概念页面
```

### 页面类型

| 类型 | 路径 | 说明 |
|------|------|------|
| 来源摘要 | `wiki/sources/` | 原始文档的核心要点提取 |
| 实体页面 | `wiki/entities/` | 人物、组织、产品等实体信息 |
| 概念页面 | `wiki/concepts/` | 技术概念、方法论等抽象知识 |

## 卸载

```bash
# 卸载技能（会询问是否删除知识库）
node setup.js --uninstall

# 卸载技能但保留知识库
node setup.js --uninstall-keep-kb
```

## 许可

MIT
