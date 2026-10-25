import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const plansRoot = path.join(repoRoot, 'specs', 'plans');
const truthFeatures = path.join(repoRoot, 'specs', 'truth', 'features');

function read(p) {
  return fs.readFileSync(p, 'utf8');
}
function write(p, c) {
  fs.writeFileSync(p, c, 'utf8');
}

function parseTraceabilityMatrix(content) {
  const lines = content.split('\n');
  const start = lines.findIndex((l) => l.startsWith('| Acceptance Feature |'));
  if (start < 0) return [];
  const rows = [];
  for (let i = start + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;
    const cols = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cols.length < 11) continue;
    rows.push({
      acceptanceExample: cols[2].replace(/`/g, ''),
      assertion: cols[4],
      status: cols[5],
      iface: cols[6],
      module: cols[7],
      derived: cols[8].replace(/`/g, ''),
      derivedRule: cols[9],
    });
  }
  return rows;
}

function buildTraceabilitySummary(rows) {
  const byKey = new Map();
  for (const r of rows) {
    if (r.status === 'blocked' || r.iface === '-' || !r.iface) continue;
    const key = `${r.iface} / ${r.module}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(r);
  }

  let summary = '## 介面情境摘要（人 Review）\n\n> 覆蓋完整性以下方 Coverage Matrix 與機械稽核為準；人 Review 本節即可。\n\n';
  for (const [key, items] of byKey) {
    const shortIface = key.split('/')[0].trim();
    const colName =
      shortIface.includes('frontend') || shortIface === 'frontend'
        ? '前端驗什麼'
        : shortIface.includes('backend') || shortIface === 'backend'
          ? '後端驗什麼'
          : `${shortIface}驗什麼`;
    summary += `### ${key}\n\n| 驗收情境 | ${colName} | 來源 |\n| --- | --- | --- |\n`;
    const seen = new Set();
    for (const r of items) {
      const sig = `${r.acceptanceExample}|${r.assertion}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      summary += `| ${r.acceptanceExample} | ${r.assertion} | AC: ${r.acceptanceExample} |\n`;
    }
    summary += '\n';
  }
  return summary;
}

function injectTraceabilitySummary(content) {
  if (content.includes('## 介面情境摘要（人 Review）')) return content;
  const rows = parseTraceabilityMatrix(content);
  if (!rows.length) return content;
  const summary = buildTraceabilitySummary(rows);
  const matrixHeader = '## Coverage Matrix（AI 機械稽核 — 不要求使用者逐行 Review）';
  if (content.includes(matrixHeader)) {
    return content.replace(matrixHeader, `${summary}${matrixHeader}`);
  }
  return content.replace(
    '## Coverage Matrix',
    `${summary}${matrixHeader}`
  );
}

function buildScenarioIndex(planDir, planName) {
  const tracePath = path.join(planDir, 'traceability.md');
  if (!fs.existsSync(tracePath)) return null;
  const rows = parseTraceabilityMatrix(read(tracePath));
  const byExample = new Map();
  for (const r of rows) {
    if (!byExample.has(r.acceptanceExample)) byExample.set(r.acceptanceExample, []);
    byExample.get(r.acceptanceExample).push(r);
  }

  let md = `# 業務情境索引：${planName}\n\n> 人 Review 主入口；機械覆蓋見 \`traceability.md\` Coverage Matrix。\n\n`;
  let n = 1;
  for (const [example, items] of byExample) {
    md += `## 情境 ${n}：${example}\n\n**業務規則**：${items[0]?.assertion || '（見 acceptance Feature）'}\n\n`;
    md += '| 誰驗 | 驗什麼 | Feature 位置 |\n| --- | --- | --- |\n';
    for (const r of items) {
      if (r.status === 'blocked' || !r.derived || r.derived === '-') continue;
      const who = r.iface.includes('frontend') ? '前端' : r.iface.includes('backend') ? '後端' : r.iface;
      const rel = r.derived.replace(/^\.\.\/\.\.\/truth\/features\//, '').replace(/\\/g, '/');
      const anchor = r.derivedRule.split('/').pop()?.trim() || r.derivedRule;
      md += `| ${who} | ${r.assertion} | \`${rel}#${anchor}\` |\n`;
    }
    const gaps = items.filter((x) => x.status === 'blocked');
    md += `\n**缺口**：${gaps.length ? gaps.map((g) => g.assertion).join('；') : '無'}\n\n---\n\n`;
    n++;
  }
  return md;
}

function injectFeatureSummary(content) {
  if (content.includes('本 Feature 驗證：')) return content;
  const lines = content.split('\n');
  let fi = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('Feature:')) {
      fi = i;
      break;
    }
  }
  if (fi < 0) return content;
  const rules = [];
  for (const line of lines) {
    const m = line.match(/^\s*Rule:\s*(.+)/);
    if (m) rules.push(m[1].trim());
  }
  const title = lines[fi].replace('Feature:', '').trim();
  const summary =
    rules.length > 0
      ? `  本 Feature 驗證：${title} — ${rules.slice(0, 3).join('；')}${rules.length > 3 ? ' 等。' : '。'}`
      : `  本 Feature 驗證：${title} 相關介面行為與驗收契約。`;
  let insertAt = fi + 1;
  while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;
  if (insertAt < lines.length && !lines[insertAt].trim().startsWith('Rule:') && lines[insertAt].trim()) {
    insertAt++;
    while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;
  }
  lines.splice(insertAt, 0, '', summary);
  return lines.join('\n');
}

function injectDslBusinessLayer(content) {
  if (content.includes('## 業務 DSL（人 Review）')) return content;
  const lines = content.split('\n');
  let introEnd = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ') && !lines[i].includes('業務 DSL')) {
      introEnd = i;
      break;
    }
  }
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith('| `')) continue;
    const m = line.match(/^\|\s*`([^`]+)`\s*\|\s*([^|]*)\|/);
    if (m) {
      const sentence = m[1];
      let params = m[2].trim();
      if (params === '無' || !params) params = '無';
      else params = params.split('<br>')[0].slice(0, 40);
      rows.push({ sentence, params, meaning: sentence.length > 20 ? `${sentence.slice(0, 18)}…的契約` : `${sentence} 的驗證語意` });
    }
  }
  const uniq = [];
  const seen = new Set();
  for (const r of rows) {
    if (seen.has(r.sentence)) continue;
    seen.add(r.sentence);
    uniq.push(r);
  }
  let business = '## 業務 DSL（人 Review）\n\n| 句型 | 參數 | 意思 |\n| --- | --- | --- |\n';
  for (const r of uniq.slice(0, 40)) {
    business += `| \`${r.sentence}\` | ${r.params} | ${r.meaning} |\n`;
  }
  business += '\n## 技術 DSL（測試落地參考）\n\n';
  const rest = lines.slice(introEnd).join('\n');
  return lines.slice(0, introEnd).join('\n') + '\n\n' + business + rest;
}

function addAcceptanceResultComments(content) {
  content = content.replace(/\r\n/g, '\n');
  const lines = content.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*Example:/.test(line)) {
      out.push(line);
      continue;
    }
    const block = [line];
    i++;
    while (i < lines.length && !/^\s*(Example:|Rule:|Feature:)/.test(lines[i])) {
      if (!/^\s*#\s*驗收結果：/.test(lines[i])) block.push(lines[i]);
      i++;
    }
    i--;
    const indent = (block[0].match(/^(\s*)/) || ['', '      '])[1];
    const thenLines = block
      .filter((l) => /^\s+(Then|And)\s/.test(l))
      .slice(-2)
      .map((l) => l.trim().replace(/^(Then|And)\s+/, ''))
      .join('；')
      .slice(0, 100);
    block.push(`${indent}# 驗收結果：${thenLines || '可觀察業務結果與 Rule 一致'}`);
    out.push(...block);
  }
  const result = out.join('\n');
  return result.endsWith('\n') ? result : result + '\n';
}

function buildSituationMap(planDir, acceptancePath) {
  const base = path.basename(acceptancePath, '.feature');
  const content = read(acceptancePath);
  const examples = [...content.matchAll(/Example:\s*(.+)/g)].map((m) => m[1].trim());
  const rules = [...content.matchAll(/Rule:\s*(.+)/g)].map((m) => m[1].trim());
  const clarifications = (content.match(/# \[need clarification\]/g) || []).length;
  let md = `# 情境地圖：${base}\n\n> 對應：\`${path.relative(planDir, acceptancePath).replace(/\\/g, '/')}\`\n\n`;
  md += '## 核心旅程\n\n';
  for (const ex of examples.slice(0, 2)) md += `- ✅ ${ex}\n`;
  if (examples.length > 2) {
    md += '\n## 關鍵變體／邊界\n\n';
    for (const ex of examples.slice(2)) md += `- ✅ ${ex}\n`;
  }
  if (rules.length) {
    md += '\n## 規則面向\n\n';
    for (const r of rules) md += `- ✅ ${r}\n`;
  }
  md += `\n## 待澄清\n\n- ${clarifications ? `❓ 共 ${clarifications} 處 [need clarification]` : '✅ 無待澄清標籤'}\n`;
  return md;
}

function injectTasksProgress(tasksPath, scenarioIndexPath) {
  if (!fs.existsSync(tasksPath)) return;
  let content = read(tasksPath);
  if (content.includes('## 情境進度')) return;
  let rows = '| 業務情境 | 後端 RED | 後端 GREEN | 前端 RED | 前端 GREEN | 備註 |\n| --- | --- | --- | --- | --- | --- |\n';
  if (fs.existsSync(scenarioIndexPath)) {
    const si = read(scenarioIndexPath);
    const titles = [...si.matchAll(/^## 情境 \d+：(.+)$/gm)].map((m) => m[1].trim());
    for (const t of titles) {
      rows += `| ${t} | ⬜ | ⬜ | ⬜ | ⬜ | 執行 tasks 後填入 Tnnn |\n`;
    }
  } else {
    rows += '| （依 acceptance／scenario-index 填寫） | ⬜ | ⬜ | ⬜ | ⬜ | |\n';
  }
  const block = `\n## 情境進度（人 Review）\n\n${rows}\n`;
  const org = '**Organization**';
  if (content.includes(org)) {
    content = content.replace(org, `${block}${org}`);
  } else {
    content = block + content;
  }
  write(tasksPath, content);
}

// --- run ---
const planDirs = fs.readdirSync(plansRoot).filter((d) => fs.statSync(path.join(plansRoot, d)).isDirectory());

for (const planId of planDirs) {
  const planDir = path.join(plansRoot, planId);
  const tracePath = path.join(planDir, 'traceability.md');
  if (fs.existsSync(tracePath)) {
    write(tracePath, injectTraceabilitySummary(read(tracePath)));
    const scenario = buildScenarioIndex(planDir, planId);
    if (scenario) write(path.join(planDir, 'scenario-index.md'), scenario);
  }

  const accDir = path.join(planDir, 'features', 'acceptance');
  if (fs.existsSync(accDir)) {
    for (const f of fs.readdirSync(accDir).filter((x) => x.endsWith('.feature'))) {
      const fp = path.join(accDir, f);
      write(fp, addAcceptanceResultComments(read(fp)));
      const mapPath = path.join(accDir, '情境地圖.md');
      write(mapPath, buildSituationMap(planDir, fp));
    }
  }

  injectTasksProgress(path.join(planDir, 'tasks.md'), path.join(planDir, 'scenario-index.md'));
}

function walkFeatures(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFeatures(p);
    else if (ent.name.endsWith('.feature')) {
      write(p, injectFeatureSummary(read(p)));
    } else if (ent.name === 'dsl.md') {
      write(p, injectDslBusinessLayer(read(p)));
    }
  }
}
walkFeatures(truthFeatures);

console.log('Migration done:', { plans: planDirs.length, truthFeatures });
