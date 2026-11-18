import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = name => readFileSync(new URL(`./${name}.jsx`, import.meta.url), 'utf8');
test('audit object metadata formats as renderable text', () => {
  const body = source('Activity').match(/function formatAuditDetails\(details\) \{([\s\S]*?)\n\}/)[1];
  const format = new Function('details', body);
  assert.equal(format({status: 'diproses'}), '{"status":"diproses"}');
  assert.equal(format(null), '-');
  assert.equal(format('status changed'), 'status changed');
  assert.ok(source('Activity').includes('{formatAuditDetails(log.details)}'));
});
test('select options and descriptions use real newline separators', () => {
  assert.ok(source('CreateForm').includes("field.opsi.join('\\n')"));
  assert.ok(source('CreateForm').includes("e.target.value.split('\\n')"));
  assert.ok(!source('CreateForm').includes("'\\\\n'"));
  assert.ok(!source('Forms').includes("'\\\\n'"));
});
test('role management includes guest profiles and protects self changes', () => {
  const settings = source('Settings');
  assert.ok(settings.includes('authAPI.setRole'));
  assert.ok(settings.includes('disabled={busy || admin.id === user?.id}'));
  assert.ok(settings.includes('value="guest"'));
  assert.ok(!settings.includes('res.data.filter'));
});
