import { describe, it, expect } from 'vitest';
import { generateRandomNumbers } from '@/components/NormalDistChart.vue';

describe('generateRandomNumbers', () => {
  it('should generate an array of 1000 random numbers', () => {
    const length = 1000;
    const randomNumbers = generateRandomNumbers(length);

    // Check the length of the array
    expect(randomNumbers).toHaveLength(length);

    // Check that all items in the array are numbers
    randomNumbers.forEach(num => {
      expect(typeof num).toBe('number');
    });
  });
});