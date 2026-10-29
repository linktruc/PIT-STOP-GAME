const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require(process.env.TS_PATH || '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const compiled = new Map();
function load(moduleName) {
  if (compiled.has(moduleName)) return compiled.get(moduleName).exports;
  const module = { exports: {} };
  compiled.set(moduleName, module);
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', 'src', moduleName + '.ts'), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
  }).outputText;
  const wrapper = new vm.Script('(function(require,module,exports){' + code + '\n})').runInThisContext();
  wrapper(p => load(p.replace('./', '')), module, module.exports);
  return module.exports;
}
const { createRound, earlyAction, reconcile, submitAction } = load('engine');
const crew = [{ id: 'first', nickname: 'First', role: 'FL_GUNNER', ready: true, joinedAt: 0 }];
function run(early, end) {
  const round = createRound(crew, 5000, 'v13-' + early);
  earlyAction(round, 'first', 'FL_GUN_LOOSEN', early, 'first');
  assert.equal(round.penalties.first.until, early + 2000);
  earlyAction(round, 'first', 'FL_GUN_LOOSEN', early + 10, 'first');
  assert.equal(round.penalties.first.until, early + 2000);
  reconcile(round, 5000);
  if (end < round.penalties.first.until) assert.throws(() => submitAction(round, 'first', 'FL_GUN_LOOSEN', end, 'late'), /lockout/);
  submitAction(round, 'first', 'FL_GUN_LOOSEN', Math.max(end, early + 2000), 'valid');
}
run(1000, 5001);
run(4500, 6000);
console.log('PASS: early countdown lockout starts at tap, expires after 2,000ms, remains idempotent.');
