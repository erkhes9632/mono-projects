import { describe, it, expect } from '@jest/globals';
import { faker } from '@faker-js/faker';
import { divide } from '../src/app/utils/divide';

describe('divide', () => {
  it('divides two positive integers correctly', () => {
    const a = faker.number.int({ min: 1, max: 500 });
    const b = faker.number.int({ min: 1, max: 500 });

    expect(divide(a, b)).toBe(a / b);
  });

  it('divides two negative integers correctly', () => {
    const a = faker.number.int({ min: -500, max: -1 });
    const b = faker.number.int({ min: -500, max: -1 });

    expect(divide(a, b)).toBe(a / b);
  });

  it('divides a positive and a negative integer correctly', () => {
    const positive = faker.number.int({ min: 1, max: 1000 });
    const negative = faker.number.int({ min: -1000, max: -1 });

    expect(divide(positive, negative)).toBe(positive / negative);
  });

  it('divides zero by a non-zero number correctly', () => {
    const num = faker.number.int({ min: 1, max: 1000 });

    expect(divide(0, num)).toBe(0);
  });

  it('handles division by zero properly', () => {
    const num = faker.number.int({ min: 1, max: 1000 });

    expect(divide(num, 0)).toBe(Infinity);
  });

  it('divides float numbers correctly', () => {
    const a = faker.number.float({ min: 0.01, max: 100, fractionDigits: 2 });
    const b = faker.number.float({ min: 0.01, max: 100, fractionDigits: 2 });

    expect(divide(a, b)).toBeCloseTo(a / b);
  });
});
