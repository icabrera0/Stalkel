import { test, expect } from 'bun:test';
import { createRNG } from '../js/rng.js';

test('same seed same sequence', () => {
  const a = createRNG(42), b = createRNG(42);
  expect(a.next()).toBe(b.next());
  expect(a.next()).toBe(b.next());
});
test('different seeds different values', () => {
  expect(createRNG(1).next()).not.toBe(createRNG(2).next());
});
test('nextInt in range', () => {
  const rng = createRNG(99);
  for (let i = 0; i < 100; i++) {
    const v = rng.nextInt(1, 6);
    expect(v).toBeGreaterThanOrEqual(1);
    expect(v).toBeLessThanOrEqual(6);
  }
});
test('pick returns element from array', () => {
  const arr = ['a','b','c'];
  const v = createRNG(7).pick(arr);
  expect(arr).toContain(v);
});
test('shuffle returns same elements', () => {
  const arr = [1,2,3,4,5];
  const shuffled = createRNG(3).shuffle(arr);
  expect(shuffled.sort()).toEqual([1,2,3,4,5]);
});
