import { describe, it, expect } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { minus } from '../src/app/utils/minus';

describe('minus', () => {
  it('subtracts two positive integers correctly', () => {
    const a = faker.number.int({ min: 1, max: 500 });
    const b = faker.number.int({ min: 1, max: 500 });

    expect(minus(a, b)).toBe(a - b);
  });

  it('subtracts two negative integers correctly', () => {
    const a = faker.number.int({ min: -500, max: -1 });
    const b = faker.number.int({ min: -500, max: -1 });

    expect(minus(a, b)).toBe(a - b);
  });

  it('subtracts a positive and a negative integer correctly', () => {
    const positive = faker.number.int({ min: 1, max: 1000 });
    const negative = faker.number.int({ min: -1000, max: -1 });

    expect(minus(positive, negative)).toBe(positive - negative);
  });

  it('subtracts zero correctly', () => {
    const num = faker.number.int({ min: -1000, max: 1000 });

    expect(minus(num, 0)).toBe(num);
    expect(minus(0, num)).toBe(-num);
  });

  it('subtracts float numbers correctly', () => {
    const a = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
    const b = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });

    expect(minus(a, b)).toBeCloseTo(a - b);
  });

  it('subtracts the same number to equal zero', () => {
    const num = faker.number.int({ min: -1000, max: 1000 });
    expect(minus(num, num)).toBe(0);
  });

  it('subtracts zero from zero correctly', () => {
    expect(minus(0, 0)).toBe(0);
  });
});
