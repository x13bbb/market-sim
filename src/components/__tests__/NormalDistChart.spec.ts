import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import NormalDistributionChart, { generateRandomNumbers } from '@/components/NormalDistChart.vue';

describe('generateRandomNumbers', () => {
  it('should generate an array of 1000 random numbers', () => {
    const length = 1000;
    const randomNumbers = generateRandomNumbers(length);

    expect(randomNumbers).toHaveLength(length);

    randomNumbers.forEach(num => {
      expect(typeof num).toBe('number');
    });
  });
});

vi.mock('chart.js/auto', async () => {
  const actual = await vi.importActual<typeof import('chart.js/auto')>('chart.js/auto');

  return {
    ...actual,
    default: vi.fn().mockImplementation((ctx, config) => {
      return {
        config,
        destroy: vi.fn(),
      };
    }),
  };
});

import Chart from 'chart.js/auto';

describe('NormalDistributionChart', () => {
  it('should configure the chart as a bar chart + normal dist line', async () => {
    mount(NormalDistributionChart);

    await new Promise(setImmediate);

    const instance = Chart.mock.results[0].value;
    expect(instance).toBeDefined();
    expect(instance.config.options.indexAxis).toBe('y');
    expect(instance.config.data.datasets).toHaveLength(2);

    const lineDataset = instance.config.data.datasets.find(dataset => dataset.type === 'line');
    expect(lineDataset).toBeDefined();
  });
});