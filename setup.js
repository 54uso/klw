#!/usr/bin/env node

/**
 * klw 安装脚本
 *
 * 功能：
 * 1. 询问知识库路径，创建知识库目录结构
 * 2. 询问安装目标：OpenCode / Claude Code / 全部
 * 3. 将 skills 复制到目标工具目录，写入知识库路径
 *
 * 用法：
 *   node setup.js              — 交互式安装
 *   node setup.js opencode     — 仅安装 OpenCode
 *   node setup.js claude       — 仅安装 Claude Code
 *   node setup.js --uninstall  — 卸载技能（询问是否删除知识库）
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, cpSync, rmSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(__dirname, 'skills');
const defaultKBPath = join(homedir(), '知识库');

// ── 工具函数 ──

function getSkillNames() {
    return readdirSync(skillsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
}

function initKnowledgeBase(kbPath) {
    if (existsSync(join(kbPath, 'wiki', 'index.md'))) {
        console.log(`\n知识库已存在：${kbPath}`);
        return;
    }

    console.log(`\n初始化知识库：${kbPath}`);

    const dirs = [
        'raw/assets',
        'raw/archive',
        'wiki/sources',
        'wiki/entities',
        'wiki/concepts',
    ];

    for (const dir of dirs) {
        mkdirSync(join(kbPath, dir), { recursive: true });
    }

    const files = {
        'schema.md': `# LLM Wiki Schema

## 目录结构

\`\`\`
├── schema.md          — 本文件
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
\`\`\`

## 页面模板

每个页面包含 frontmatter：title、type、date、tags、related。

## 工作流

- **摄入**：获取来源 → 存入 raw/ → 创建摘要 → 更新实体/概念
- **查询**：搜索 wiki 页面 → 综合回答
- **巡检**：检查矛盾、过时、孤立页面
`,
        'wiki/index.md': `# 索引

## 来源摘要

## 实体

## 概念
`,
        'wiki/log.md': `# 操作日志

## [${new Date().toISOString().slice(0, 10)}] init

- 初始化知识库
`,
        'wiki/overview.md': `# 知识库总览

知识库已初始化，等待第一批来源摄入。
`,
    };

    for (const [file, content] of Object.entries(files)) {
        writeFileSync(join(kbPath, file), content, 'utf-8');
    }

    console.log('  ✓ 目录结构已创建');
    console.log('  ✓ 核心文件已生成');
}

function installSkills(tool, kbPath) {
    const names = getSkillNames();

    let destDir;
    if (tool === 'opencode') {
        destDir = join(homedir(), '.config', 'opencode', 'skills');
    } else {
        destDir = resolve(__dirname, '.claude', 'skills');
    }

    if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
    }

    console.log(`\n安装 ${tool === 'opencode' ? 'OpenCode' : 'Claude Code'} 技能...\n`);

    for (const name of names) {
        const skillDir = resolve(skillsDir, name);
        const skillFile = resolve(skillDir, 'SKILL.md');
        if (!existsSync(skillFile)) {
            console.log(`  ✗ ${name} — SKILL.md 不存在，跳过`);
            continue;
        }

        const dest = tool === 'opencode' ? join(destDir, `klw-${name}`) : join(destDir, name);
        try {
            cpSync(skillDir, dest, { recursive: true });
            // 写入知识库路径
            let content = readFileSync(join(dest, 'SKILL.md'), 'utf-8');
            content = content.replace(/\{knowledgeBase\}/g, kbPath);
            writeFileSync(join(dest, 'SKILL.md'), content, 'utf-8');
            console.log(`  ✓ ${dest}`);
        } catch (e) {
            console.log(`  ✗ ${name} — 复制失败: ${e.message}`);
        }
    }
}

function uninstallSkills(target) {
    console.log('\n卸载 klw 技能...\n');

    const targets = {
        opencode: join(homedir(), '.config', 'opencode', 'skills'),
        claude: resolve(__dirname, '.claude', 'skills'),
    };

    const tools = target === 'all' ? Object.keys(targets) : [target];

    for (const tool of tools) {
        const dir = targets[tool];
        if (!existsSync(dir)) {
            console.log(`  - ${tool}: 目录不存在，跳过`);
            continue;
        }

        const prefix = tool === 'opencode' ? 'klw-' : '';
        const entries = readdirSync(dir, { withFileTypes: true })
            .filter(d => d.isDirectory() && d.name.startsWith(prefix));

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            rmSync(fullPath, { recursive: true, force: true });
            console.log(`  ✓ 删除 ${fullPath}`);
        }
    }
}

function uninstall(kbPath, keepKb) {
    uninstallSkills('all');

    if (!keepKb && existsSync(kbPath)) {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        rl.question(`\n是否删除知识库目录 ${kbPath}？[y/N]: `, (answer) => {
            rl.close();
            if (answer.trim().toLowerCase() === 'y') {
                rmSync(kbPath, { recursive: true, force: true });
                console.log(`  ✓ 已删除知识库：${kbPath}`);
            } else {
                console.log('  - 保留知识库目录');
            }
            console.log('\n✓ 卸载完成');
        });
    } else {
        console.log('\n✓ 卸载完成');
    }
}

// ── 主流程 ──

function finish(tool, kbPath) {
    initKnowledgeBase(kbPath);
    installSkills(tool, kbPath);
    console.log(`\n✓ 安装完成。知识库路径：${kbPath}`);
}

const arg = process.argv[2];

if (arg === '--uninstall' || arg === '-u') {
    uninstall(defaultKBPath);
} else if (arg === '--uninstall-keep-kb') {
    uninstall(defaultKBPath, true);
} else if (arg === 'opencode' || arg === 'claude') {
    finish(arg, defaultKBPath);
} else if (!process.stdin.isTTY) {
    finish('all', defaultKBPath);
} else {
    console.log('╔══════════════════════════════════════╗');
    console.log('║        klw 技能安装向导              ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');

    const rl = createInterface({ input: process.stdin, output: process.stdout });

    rl.question(`知识库路径 [默认: ${defaultKBPath}]: `, (kbAnswer) => {
        const kbPath = kbAnswer.trim() || defaultKBPath;

        console.log('\n请选择安装目标:');
        console.log('  1) OpenCode    — 终端 AI 编程助手');
        console.log('  2) Claude Code — Anthropic 官方 CLI');
        console.log('  3) 全部安装');
        console.log('');

        rl.question('请输入选项 [1/2/3]: ', (toolAnswer) => {
            rl.close();
            const choice = toolAnswer.trim();

            if (choice === '1') finish('opencode', kbPath);
            else if (choice === '2') finish('claude', kbPath);
            else if (choice === '3') finish('all', kbPath);
            else {
                console.log('\n✗ 无效选项，请输入 1、2 或 3');
                process.exit(1);
            }
        });
    });
}
