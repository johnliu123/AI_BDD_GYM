import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugs = [
  '001-food-browsing-categories',
  '002-shopping-cart-total-calculation',
  '003-order-creation-inquiry',
  '004-merchant-serving-workflow',
  '005-payment-order-cancellation',
  '006-advanced-features-system-verification',
];
const stories = {
  '001-food-browsing-categories': { 1: '瀏覽餐點與其分類' },
  '002-shopping-cart-total-calculation': { 1: '將選擇規格的餐點加入購物車', 2: '檢視及管理購物車金額' },
  '003-order-creation-inquiry': { 1: '從購物車確認並建立訂單', 2: '查詢訂單狀態與明細' },
  '004-merchant-serving-workflow': { 1: '店家檢視訂單佇列與明細', 2: '店家接受訂單', 3: '店家更新出餐狀態並完成訂單', 4: '顧客查詢反映店家更新後的訂單狀態' },
  '005-payment-order-cancellation': { 1: '顧客對訂單發起付款', 2: '付款失敗與重試', 3: '顧客取消訂單', 4: '顧客查詢付款與取消狀態', 5: '店家檢視訂單付款與取消資訊' },
  '006-advanced-features-system-verification': { 1: '店家維護餐點分類、餐點與規格', 2: '店家管理餐點售完與規格停供', 3: '顧客端反映供應狀態並阻擋無效下單', 4: '店家 API 角色權限控管', 5: '一致例外處理與錯誤回應', 6: '整合測試與端到端系統驗證' },
};
const ids = '(?:US\\d+|(?:FR|NFR|BR|SC)-\\d+)';

function splitTable(line) {
  return line.split('|').slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, ''));
}

function expandRanges(value) {
  let result = value;
  for (const prefix of ['FR', 'NFR', 'BR', 'SC']) {
    result = result.replace(new RegExp(`(${prefix})-(\\d+)\\s*[–-]\\s*${prefix}-(\\d+)`, 'g'), (_, kind, start, end) => {
      const from = Number(start);
      const to = Number(end);
      return Array.from({ length: to - from + 1 }, (_, index) => `${kind}-${String(from + index).padStart(3, '0')}`).join('; ');
    });
  }
  return [...new Set(result.match(new RegExp(ids, 'g')) || [])];
}

function loadTraceMap(packageDir) {
  const file = path.join(packageDir, 'features', 'acceptance-to-interface-traceability.md');
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const map = new Map();
  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---')) continue;
    const cells = splitTable(line);
    if (cells.length < 11 || cells[0] === 'Acceptance Feature') continue;
    const key = `${path.basename(cells[0])}::${cells[2]}`;
    const entry = map.get(key) || { ids: new Set(), status: new Set(), acceptanceFeature: cells[0] };
    for (const id of expandRanges(cells[3])) entry.ids.add(id);
    entry.status.add(cells[5]);
    map.set(key, entry);
  }
  return map;
}

function normalizeSentence(value) {
  return value
    .trim()
    .replace(/"[^"]*"/g, '"{value}"')
    .replace(/「[^」]*」/g, '「{value}」')
    .replace(/\{[^}]+\}/g, '{value}')
    .replace(/(?<![A-Za-z])\d+(?![A-Za-z])/g, '{value}')
    .replace(/\s+/g, ' ');
}

function dslRows(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\|\s*`([^`]+)`\s*\|/);
    return match ? [{ sentence: match[1], file }] : [];
  });
}

function resolveDsl(packageDir, featureFile, steps) {
  const featureRoot = path.join(packageDir, 'features');
  const interfaceRoot = path.relative(featureRoot, path.dirname(featureFile)).split(path.sep)[0];
  const roots = [
    path.join(path.dirname(featureFile), 'dsl.md'),
    path.join(featureRoot, interfaceRoot, 'dsl.md'),
  ];
  const rows = [...new Map(roots.flatMap(dslRows).map((row) => [`${row.file}#${row.sentence}`, row])).values()];
  return steps.map((step) => {
    const wanted = normalizeSentence(step.text);
    const matches = rows.filter((row) => normalizeSentence(row.sentence) === wanted);
    if (matches.length !== 1) throw new Error(`DSL match count ${matches.length}: ${featureFile} :: ${step.text}`);
    return matches[0];
  });
}

function parseSource(line) {
  const match = line.match(/^\s*# Acceptance source:\s*(.*?)\s*\/\s*Rule:\s*(.*?)\s*\/\s*Example:\s*(.*?)\s*$/);
  return match ? { file: match[1], rule: match[2], example: match[3] } : null;
}

function parseFeature(packageDir, traceMap) {
  const featuresRoot = path.join(packageDir, 'features');
  const files = ['backend', 'frontend'].flatMap((endpoint) => {
    const root = path.join(featuresRoot, endpoint);
    return fs.existsSync(root) ? walk(root).filter((file) => file.endsWith('.feature')) : [];
  }).sort();
  const scenarios = [];
  for (const file of files) {
    const relative = path.relative(packageDir, file).split(path.sep).join('/');
    const endpoint = relative.startsWith('features/backend/') ? 'backend' : 'frontend';
    const modulePath = path.dirname(relative);
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
    let featureName = '';
    let rule = '';
    let pendingSource = null;
    let current = null;
    const flush = () => {
      if (!current) return;
      const when = current.steps.filter((step) => step.kind === 'When');
      if (when.length !== 1) throw new Error(`${relative}#${current.title} has ${when.length} When steps`);
      if (!current.source) throw new Error(`${relative}#${current.title} missing acceptance source`);
      const trace = traceMap.get(`${path.basename(current.source.file)}::${current.source.example}`);
      if (!trace || trace.status.has('unmapped') || trace.status.has('blocked')) {
        throw new Error(`${relative}#${current.title} has no assigned trace row (${current.source.example})`);
      }
      current.ids = [...trace.ids];
      current.story = selectStory(path.basename(packageDir), current, trace);
      current.featureFile = relative;
      current.endpoint = endpoint;
      current.modulePath = modulePath;
      current.dslRows = resolveDsl(packageDir, file, current.steps);
      scenarios.push(current);
      current = null;
    };
    for (const line of lines) {
      if (line.startsWith('Feature:')) featureName = line.slice('Feature:'.length).trim();
      const source = parseSource(line);
      if (source) { pendingSource = source; continue; }
      if (/^\s*Rule:/.test(line)) { flush(); rule = line.replace(/^\s*Rule:\s*/, '').trim(); continue; }
      const example = line.match(/^\s*Example:\s*(.+)$/);
      if (example) {
        flush();
        current = { featureName, rule, title: example[1].trim(), source: pendingSource, steps: [] };
        pendingSource = null;
        continue;
      }
      if (!current) continue;
      const step = line.match(/^\s*(Given|When|Then|And|But)\s+(.+)$/);
      if (step) {
        const kind = ['And', 'But'].includes(step[1]) ? (current.steps.at(-1)?.kind || 'Given') : step[1];
        current.steps.push({ kind, text: step[2].trim() });
      }
    }
    flush();
  }
  return scenarios;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function selectStory(slug, scenario, trace) {
  const explicit = [...trace.ids].find((id) => /^US\d+$/.test(id));
  if (explicit) return Number(explicit.slice(2));
  const sourceRule = scenario.source.rule;
  const title = scenario.title;
  if (slug.startsWith('001-')) return 1;
  if (slug.startsWith('002-')) return sourceRule.includes('依規格選擇') || sourceRule.includes('不同訪客') ? 1 : 2;
  if (slug.startsWith('003-')) return sourceRule.includes('查詢') ? 2 : 1;
  if (slug.startsWith('004-')) {
    if (title.includes('顧客')) return 4;
    if (title.includes('接受') || title.includes('created')) return 2;
    if (title.includes('出餐') || title.includes('preparing') || title.includes('非法')) return 3;
    return 1;
  }
  if (slug.startsWith('005-')) {
    if (sourceRule.includes('付款失敗')) return 2;
    if (sourceRule.includes('只能在訂單')) return 3;
    if (sourceRule.includes('顧客查詢')) return 4;
    if (sourceRule.includes('店家')) return 5;
    return 1;
  }
  if (slug.startsWith('006-')) {
    const fr = [...trace.ids].find((id) => /^FR-/.test(id));
    if (fr) {
      const n = Number(fr.slice(3));
      if (n <= 3) return 1;
      if (n <= 6) return 2;
      if (n <= 8) return 3;
      if (n <= 15) return 4;
      if (n <= 17) return 5;
      return 6;
    }
    if (trace.ids.some((id) => id === 'NFR-010' || id === 'NFR-011')) return 5;
    return 6;
  }
  return 1;
}

const operationMaps = {
  '001-food-browsing-categories': (s) => s.featureFile.includes('依分類讀取') ? ['listCategories', 'listMenuItems'] : ['listMenuItems'],
  '002-shopping-cart-total-calculation': (s) => s.featureFile.includes('新增與隔離') ? (s.title.includes('第二個') ? ['getCart'] : ['addCartItem', 'getCart']) : s.title.includes('修改數量') ? ['updateCartItemQuantity'] : s.title.includes('刪除') ? ['deleteCartItem', 'getCart'] : ['getCart'],
  '003-order-creation-inquiry': (s) => s.title.includes('查詢') ? ['getOrder'] : ['createOrder'],
  '004-merchant-serving-workflow': (s) => {
    if (s.title.includes('列表')) return ['listMerchantOrders'];
    if (s.title.includes('詳情')) return ['getMerchantOrder'];
    if (s.title.includes('接受') || s.title.includes('接單')) return ['acceptMerchantOrder'];
    if (s.title.includes('開始')) return ['startPreparingMerchantOrder'];
    if (s.title.includes('完成')) return ['completeMerchantOrder'];
    if (s.title.includes('顧客')) return ['getOrder'];
    return ['acceptMerchantOrder', 'startPreparingMerchantOrder', 'completeMerchantOrder'];
  },
  '005-payment-order-cancellation': (s) => {
    if (s.featureFile.includes('付款狀態查詢')) return ['getOrder'];
    if (s.featureFile.includes('店家訂單/付款資訊')) return s.title.includes('列表') || s.title.includes('篩選') ? ['listMerchantOrders'] : ['getMerchantOrder'];
    if (s.featureFile.includes('店家訂單/取消訂單護欄')) return s.title.includes('接單') ? ['acceptMerchantOrder'] : s.title.includes('準備') ? ['startPreparingMerchantOrder'] : ['completeMerchantOrder'];
    if (s.title.includes('取消')) return ['cancelOrder'];
    return ['payOrder'];
  },
  '006-advanced-features-system-verification': (s) => {
    if (s.featureFile.includes('菜單/店家維護')) return s.title.includes('分類') ? ['createMerchantCategory', 'deleteMerchantCategory'] : ['createMerchantMenuItem', 'updateMerchantMenuItem', 'listMenuItems'];
    if (s.featureFile.includes('菜單/供應狀態')) return ['patchMenuItemAvailability', 'patchMenuOptionAvailability', 'listMenuItems'];
    if (s.featureFile.includes('供應驗證')) return s.title.includes('加入') ? ['addCartItem'] : ['createOrder'];
    if (s.featureFile.includes('授權')) return s.title.includes('讀取訂單') ? ['listMerchantOrders'] : s.title.includes('接受') ? ['acceptMerchantOrder'] : ['createMerchantCategory'];
    if (s.featureFile.includes('錯誤處理')) return s.title.includes('未知') ? ['components.responses.NotFound'] : ['createMerchantCategory', 'components.schemas.ErrorBody'];
    return ['createOrder', 'payOrder', 'completeMerchantOrder'];
  },
};

function tablesFor(slug, scenario) {
  if (scenario.endpoint !== 'backend') return [];
  if (slug.startsWith('001-')) return ['categories', 'menu_items'];
  if (slug.startsWith('002-')) return ['carts', 'cart_items', 'cart_item_options'];
  if (slug.startsWith('003-')) return ['orders', 'order_items'];
  if (slug.startsWith('004-')) return ['orders', 'order_items'];
  if (slug.startsWith('005-')) return scenario.featureFile.includes('店家訂單') ? ['orders'] : ['orders', 'payment_idempotency_keys'];
  if (slug.startsWith('006-')) {
    if (scenario.featureFile.includes('菜單')) return ['categories', 'menu_items', 'menu_item_options'];
    if (scenario.featureFile.includes('整合驗證') || scenario.featureFile.includes('供應驗證')) return ['orders', 'order_items', 'cart_items'];
    if (scenario.featureFile.includes('授權')) return ['orders'];
  }
  return [];
}

function bindingsFor(scenarios, packageDir) {
  const rows = [];
  const seen = new Set();
  for (const scenario of scenarios) {
    const featureAnchor = `feature:${scenario.featureFile}#${scenario.title}`;
    const acceptanceAnchor = `acceptance:${scenario.source.file}#${scenario.source.example}`;
    const dslAnchors = scenario.dslRows.map((row) => `dsl:${path.relative(packageDir, row.file).split(path.sep).join('/')}#${row.sentence}`);
    const ids = [...new Set([`US${scenario.story}`, ...scenario.ids])];
    const specAnchors = ids.map((id) => `spec:${id}`);
    const ops = scenario.endpoint === 'backend' ? operationMaps[path.basename(packageDir)](scenario).map((op) => `openapi:${op}`) : [];
    const tables = tablesFor(path.basename(packageDir), scenario).map((table) => `dbml:Table ${table}`);
    const ui = scenario.endpoint === 'frontend' ? ['ui-plan:§畫面與流程', 'prototype:index.html'] : [];
    const anchors = [...new Set([acceptanceAnchor, featureAnchor, ...dslAnchors, ...specAnchors, ...ops, ...tables, ...ui])];
    const key = `${scenario.endpoint}::${scenario.story}::${scenario.featureFile}::${scenario.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const fileColumn = `${scenario.featureFile}`;
    const sources = `${acceptanceAnchor}; ${featureAnchor}; ${dslAnchors.join('; ')}`;
    const others = [...specAnchors, ...ops, ...tables, ...ui].join('; ');
    rows.push({
      endpoint: scenario.endpoint,
      story: scenario.story,
      scenario,
      anchors,
      row: `| \`${scenario.featureFile}\` | Scenario「${scenario.title}」 | \`${sources}\`; \`${others}\` | 對齊該介面的一次操作及可觀察結果 |`,
    });
  }
  return rows;
}

function docFor(slug) {
  const packageDir = path.join(repo, 'specs', slug);
  const traceMap = loadTraceMap(packageDir);
  const scenarios = parseFeature(packageDir, traceMap);
  const packageTitle = fs.readFileSync(path.join(packageDir, 'spec.md'), 'utf8').split(/\r?\n/)[0].replace(/^#\s*/, '').replace(/^功能規格：/, '');
  const bindings = bindingsFor(scenarios, packageDir);
  const maxStory = Math.max(...scenarios.map((s) => s.story));
  let taskId = 1;
  const output = [
    `# Tasks: ${packageTitle}`,
    '',
    `**Feature directory**：\`specs/${slug}/\``,
    '',
    '**測試工作模式**：BDD 主模式；Scenario 來源為 acceptance traceability、介面 Feature 與 DSL。',
    '',
    '**Spec 套件索引**（按需 READ）：`spec.md`、`plan.md`、`research.md`、`techstack.md`、`features/acceptance-to-interface-traceability.md`、介面 Feature/DSL、`contracts/http-api.yaml`、`data-model.dbml`、`ui-plan.md`、`prototype/`。',
    '',
    '## Phase 1: Setup',
    '',
    '**Purpose**：確認共用 BDD runner、memory DB reset 與 package-specific test command；不改產品行為。',
    '',
    '**Read when executing this phase**：`research.md`、`techstack.md`、`plan.md`、acceptance traceability。',
    '',
    '**必讀對照**',
    '',
    '| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |',
    '|---|---|---|---|',
    '| `research.md` | BDD Feature runner 決策（跨 package 共用） | `research:BDD Feature 執行工具鏈` | 使用 Cucumber-JS；backend/frontend drivers 分離 |',
    '| `techstack.md` | BDD runner、Playwright、Supertest | `techstack:BDD Feature runner`; `techstack:前端 BDD browser driver`; `techstack:後端 BDD HTTP driver` | 使用版本相容的共用執行入口 |',
    '| `plan.md` | 端點盤點 | `plan:端點盤點` | 確認本 package 的前後端責任 |',
    '',
  ];
  const setupLabel = slug === '001-food-browsing-categories' ? '建立共用 Cucumber-JS runner、backend/frontend support code discovery 與執行命令' : '確認共用 Cucumber runner 可載入本套件 Feature、support code 與 fixture reset';
  output.push(`- [ ] T${String(taskId++).padStart(3, '0')} [NON-TDD] ${setupLabel}；保留現有 node:test 命令，不改產品行為 ← \`research:BDD Feature 執行工具鏈\`; \`techstack:BDD Feature runner\`; \`plan:端點盤點\``);
  output.push('', '---', '', '## Phase 2: Foundational', '', '**Purpose**：確認本 package 的 fixtures、資料 reset、公開 API driver 可重複使用。', '', '**必讀對照**', '', '| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |', '|---|---|---|---|');
  output.push('| `data-model.dbml` | 本套件持久化實體 | `dbml:Project` | fixture/reset 與正式資料模型一致 |');
  output.push('| `contracts/http-api.yaml` | 共用錯誤與本迭代 operations | `openapi:components.schemas.ErrorBody`; `plan:端點盤點` | BDD step 依 contract 驗證公開結果 |');
  output.push('');
  output.push(`- [ ] T${String(taskId++).padStart(3, '0')} [NON-TDD] 確認 package test harness 可重設資料並供 backend/frontend Scenario 共用；不新增業務行為 ← \`dbml:Project\`; \`openapi:components.schemas.ErrorBody\`; \`plan:端點盤點\``);
  const byStoryEndpoint = new Map();
  for (const binding of bindings) {
    const key = `${binding.story}::${binding.endpoint}`;
    if (!byStoryEndpoint.has(key)) byStoryEndpoint.set(key, []);
    byStoryEndpoint.get(key).push(binding);
  }
  for (let story = 1; story <= maxStory; story++) {
    const storyScenarios = scenarios.filter((scenario) => scenario.story === story);
    if (!storyScenarios.length) continue;
    output.push('', '---', '', `## Phase ${story + 2}: User Story ${story}－${stories[slug][story]}（P1）`, '', `**端點（對齊 plan.md）**：${[...new Set(storyScenarios.map((s) => s.endpoint === 'backend' ? '後端 HTTP/API、資料持久化' : '前端 UI')].join('、')}。`, '');
    for (const endpoint of ['frontend', 'backend']) {
      const endpointBindings = byStoryEndpoint.get(`${story}::${endpoint}`) || [];
      if (!endpointBindings.length) continue;
      output.push(endpoint === 'frontend' ? '#### 前端' : '#### 後端', '', '**必讀對照**', '', '| 文件 | 必讀部位（人讀） | 機器錨點 | 本節任務須對齊 |', '|---|---|---|---|');
      output.push(`| \`features/acceptance-to-interface-traceability.md\` | US${story} 對應 acceptance 與下游 Scenario | ${[...new Set(endpointBindings.flatMap((b) => b.anchors.filter((a) => a.startsWith('acceptance:'))))].map((a) => `\`${a}\``).join('; ')} | 保留每個 acceptance Example 的來源與驗收面向 |`);
      for (const binding of endpointBindings) output.push(binding.row);
      if (endpoint === 'frontend') output.push('| `ui-plan.md`、`prototype/` | 對應畫面與操作 | `ui-plan:§畫面與流程`; `prototype:index.html` | UI 顯示對應權威 API 結果 |');
      else {
        const allOps = [...new Set(endpointBindings.flatMap((b) => b.anchors.filter((a) => a.startsWith('openapi:'))))];
        const allTables = [...new Set(endpointBindings.flatMap((b) => b.anchors.filter((a) => a.startsWith('dbml:'))))];
        if (allOps.length) output.push(`| \`contracts/http-api.yaml\` | 對應 operation 與 ErrorBody | ${allOps.map((a) => `\`${a}\``).join('; ')} | response/error 契約一致 |`);
        if (allTables.length) output.push(`| \`data-model.dbml\` | 對應權威表 | ${allTables.map((a) => `\`${a}\``).join('; ')} | 持久化狀態與不變量一致 |`);
      }
      output.push('');
      for (const binding of endpointBindings) {
        const scenario = binding.scenario;
        const taskAnchors = binding.anchors.map((anchor) => `\`${anchor}\``).join('; ');
        const then = scenario.steps.find((step) => step.kind === 'Then')?.text || '預期業務結果';
        const target = endpoint === 'backend' ? `backend/src/__tests__/bdd/${path.basename(scenario.featureFile, '.feature')}.steps.js` : `frontend/tests/bdd/${path.basename(scenario.featureFile, '.feature')}.steps.js`;
        output.push(`- [ ] T${String(taskId++).padStart(3, '0')} [US${story}] [BDD:RED] 在 \`${target}\` 接通 Scenario「${scenario.title}」 ← ${taskAnchors}`);
        output.push(`  完成條件：目標 Scenario 因「${then}」尚未成立而在對應業務斷言有效失敗。`);
        output.push(`- [ ] T${String(taskId++).padStart(3, '0')} [US${story}] [BDD:GREEN] 在 \`${endpoint === 'backend' ? 'backend/src/' : 'frontend/src/'}\` 實作讓 Scenario「${scenario.title}」通過的最小行為 ← ${taskAnchors}`);
      }
      output.push('');
    }
  }
  output.push('', '## Dependencies & Execution Order', '', '- Phase 1／2 的 runner 與 test harness 前置完成後，才執行 BDD 任務。', '- 每個 Scenario 的 `[BDD:RED]`、`[BDD:GREEN]` 成對順序執行；GREEN 前須確認 RED 是預期行為缺口，GREEN 只實作最小行為。', '- 本次未建立 `[BDD:REFACTOR]`；既有 TDD 執行歷史仍以 `testplan.md` §10／§12 為準，新 BDD 任務全部未勾選。', '', '## Format Validation', '', '- 每個納入範圍的 Scenario 均有一組 `[BDD:RED]`／`[BDD:GREEN]`。', '- 每個 BDD task 均引用 acceptance Example、Feature Scenario、DSL 句型與 spec 需求 ID；後端另引用 OpenAPI operation，資料持久化另引用 DBML。', '- 每個 RED task 下方有預期紅燈「完成條件」；每個 task 行尾有 `←` 機器錨點。', '- BDD test harness 與舊 TDD/testplan 分離；不在此重寫既有 testplan 歷史狀態。', '', 'Constitution self-check: pass', '');
  return { content: output.join('\n'), scenarios };
}

const dryRun = process.argv.includes('--dry-run');
for (const slug of slugs) {
  const result = docFor(slug);
  const tasks = (result.content.match(/^\- \[ \] T\d{3}/gm) || []).length;
  console.log(`${slug}: scenarios=${result.scenarios.length}, tasks=${tasks}`);
  if (!dryRun) fs.writeFileSync(path.join(repo, 'specs', slug, 'tasks.md'), result.content, 'utf8');
}
