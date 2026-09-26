import { describe, it, expect } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { sum } from '../src/app/utils/sum';

describe('sum', () => {
  it('adds two positive integers correctly', () => {
    const a = faker.number.int({ min: 1, max: 500 });
    const b = faker.number.int({ min: 1, max: 500 });

    expect(sum(a, b)).toBe(a + b);
  });

  it('adds two negative integers correctly', () => {
    const a = faker.number.int({ min: -500, max: -1 });
    const b = faker.number.int({ min: -500, max: -1 });

    expect(sum(a, b)).toBe(a + b);
  });

  it('adds a positive and a negative integer correctly', () => {
    const positive = faker.number.int({ min: 1, max: 1000 });
    const negative = faker.number.int({ min: -1000, max: -1 });

    expect(sum(positive, negative)).toBe(positive + negative);
  });

  it('adds zero correctly', () => {
    const num = faker.number.int({ min: -1000, max: 1000 });

    expect(sum(num, 0)).toBe(num);
    expect(sum(0, num)).toBe(num);
  });

  it('adds float numbers correctly', () => {
    const a = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
    const b = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });

    expect(sum(a, b)).toBeCloseTo(a + b);
  });
});
