import { describe, it, expect } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { multiply } from '../src/app/utils/multiply';

describe('multiply', () => {
  it('multiplies two positive integers correctly', () => {
    const a = faker.number.int({ min: 1, max: 500 });
    const b = faker.number.int({ min: 1, max: 500 });

    expect(multiply(a, b)).toBe(a * b);
  });

  it('multiplies two negative integers correctly', () => {
    const a = faker.number.int({ min: -500, max: -1 });
    const b = faker.number.int({ min: -500, max: -1 });

    expect(multiply(a, b)).toBe(a * b);
  });

  it('multiplies a positive and a negative integer correctly', () => {
    const positive = faker.number.int({ min: 1, max: 1000 });
    const negative = faker.number.int({ min: -1000, max: -1 });

    expect(multiply(positive, negative)).toBe(positive * negative);
  });

  it('multiplies zero correctly', () => {
    const num = faker.number.int({ min: -1000, max: 1000 });

    expect(multiply(num, 0)).toBe(0);
    expect(multiply(0, num)).toBe(0);
  });

  it('multiplies float numbers correctly', () => {
    const a = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
    const b = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });

    expect(multiply(a, b)).toBeCloseTo(a * b);
  });

  it('multiplies by one correctly', () => {
    const num = faker.number.int({ min: -1000, max: 1000 });

    expect(multiply(num, 1)).toBe(num);
    expect(multiply(1, num)).toBe(num);
  });
});
