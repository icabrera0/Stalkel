import { test, expect, describe } from 'bun:test';
import { createI18n, STRINGS } from '../js/i18n.js';

test('all ES keys resolve without missing marker', () => {
  const t = createI18n('es');
  for (const key of Object.keys(STRINGS.es)) {
    const result = t(key);
    expect(result).not.toMatch(/^\[missing:/);
  }
});
test('all EN keys resolve without missing marker', () => {
  const t = createI18n('en');
  for (const key of Object.keys(STRINGS.en)) {
    const result = t(key);
    expect(result).not.toMatch(/^\[missing:/);
  }
});
test('ES and EN have identical key sets', () => {
  const esKeys = Object.keys(STRINGS.es).sort();
  const enKeys = Object.keys(STRINGS.en).sort();
  expect(esKeys).toEqual(enKeys);
});
test('template substitution replaces {var} placeholders', () => {
  const t = createI18n('es');
  const result = t('intro.msg2', { name: 'Carlos' });
  expect(result).toContain('Carlos');
  expect(result).not.toContain('{name}');
});
test('missing key returns [missing:key]', () => {
  const t = createI18n('es');
  expect(t('nonexistent.key')).toBe('[missing:nonexistent.key]');
});
