#!/usr/bin/env node

/**
 * Replace {baseDir} in SKILL.md files with actual absolute paths.
 * Run once after cloning: node setup.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(__dirname, 'skills');
const skills = ['init', 'ingest', 'query', 'lint', 'update'];

for (const skill of skills) {
    const file = resolve(skillsDir, skill, 'SKILL.md');
    const baseDir = resolve(skillsDir, skill);

    if (!existsSync(file)) {
        console.log(`✗ ${skill}/SKILL.md not found`);
        continue;
    }

    const content = readFileSync(file, 'utf-8');
    if (!content.includes('{baseDir}')) {
        console.log(`- ${skill}/SKILL.md — already resolved`);
        continue;
    }

    const replaced = content.replace(/\{baseDir\}/g, baseDir);
    writeFileSync(file, replaced, 'utf-8');
    console.log(`✓ ${skill}/SKILL.md`);
}

console.log('\nDone.');
