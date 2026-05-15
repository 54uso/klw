---
name: init
description: |
  初始化一个新的 LLM Wiki 知识库。创建目录结构、schema、index.md、log.md、overview.md，并记录知识库路径到配置。
  使用场景："初始化知识库"、"创建知识库"、"init wiki"、"klw init"。
---

# /klw:init — 初始化知识库

创建一个完整的 LLM Wiki 知识库结构，并将路径写入插件配置。

## 流程

### Step 1: 检查是否已初始化

读取 `{baseDir}/../../klw.json` 中的 `knowledgeBase` 字段（`{baseDir}` 为本 SKILL.md 所在目录，插件根目录即 `{baseDir}/../..`）。
- 如果已有值，提示用户："知识库已初始化，路径为 {knowledgeBase}。如需重新初始化，请先清空配置。" 然后终止流程。
- 如果为空，继续下一步。

### Step 2: 确认知识库路径

询问用户知识库要放在哪里。默认为当前目录下的 `知识库/`（即 `./知识库`）。

用户可以输入：
- 直接回车 → 使用默认路径 `./知识库`
- 相对路径 → 如 `./my-wiki`
- 绝对路径 → 如 `E:\文档\知识库`

将用户选择的路径解析为绝对路径，后续记为 `$KB`。

### Step 3: 创建目录结构

检查 `$KB` 是否已存在。如果已存在，询问用户是覆盖还是换路径。

创建以下结构：

```
$KB/
├── schema.md
├── raw/
│   ├── assets/
│   └── archive/
└── wiki/
    ├── index.md
    ├── log.md
    ├── overview.md
    ├── sources/
    ├── entities/
    └── concepts/
```

### Step 4: 创建核心文件

**schema.md** — 定义 wiki 的结构和工作流，包含：
- 目录结构说明
- 命名约定
- 页面模板（来源摘要、实体、概念）
- 工作流定义（摄入、查询、更新、巡检）
- 日志格式
- 重要原则

**wiki/index.md** — 内容索引，按类别（来源摘要、实体、概念）组织

**wiki/log.md** — 时间线日志，记录初始化操作

**wiki/overview.md** — 知识库总览

### Step 5: 写入配置

读取 `{baseDir}/../../klw.json`，将 `knowledgeBase` 字段更新为 `$KB` 的绝对路径。

```json
{
  "knowledgeBase": "E:\\文档\\知识库"
}
```

### Step 6: 完成报告

输出创建的文件列表，提示用户可以开始使用：
- 往 `raw/` 放源文档，然后 `/klw:ingest`
- 对知识库提问用 `/klw:query`
- 更新来源用 `/klw:update`
- 健康检查用 `/klw:lint`
