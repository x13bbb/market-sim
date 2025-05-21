<template>
  <canvas id="myChart"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import type { ChartData } from 'chart.js';
import { randomNormal } from 'd3-random';
import type { UserOrder } from '@/models/orderbook';

export function generateRandomNumbers(length: number, mean: number, stdDev: number, precision: number = 2): number[] {
  const randNorm = randomNormal(mean, stdDev);
  return Array.from({ length }, () => parseFloat(randNorm().toFixed(precision)));
}

function generateRandomBools(length: number): boolean[] {
  return Array.from({ length }, () => Math.random() < 0.5);
}

function binData(data: number[], numBins: number) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;
  const bins = Array(numBins).fill(0);
  const binLabels = Array.from({ length: numBins }, (_, i) =>
    parseFloat((min + i * binWidth).toFixed(2))
  );

  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
    bins[binIndex]++;
  });

  return { bins, binLabels };
}

function gaussian(x: number, mean: number, stdDev: number) {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}

function generateRandomOrders(length: number, priceMean: number, priceStdDev: number, qtyMean: number, qtyStdDev: number): UserOrder[] {
  const prices = generateRandomNumbers(length, priceMean, priceStdDev);
  const quantities = generateRandomNumbers(length, qtyMean, qtyStdDev, 0);
  const sides = generateRandomBools(length);

  return prices.map((price, index) => ({
    price,
    quantity: quantities[index],
    side: sides[index] ? 'buy' : 'sell',
  }));
}

export default defineComponent({
  name: 'NormalDistributionChart',
  setup() {
    onMounted(() => {
      const price_mean = 100;
      const price_sd = 5;

      const qty_mean = 50;
      const qty_sd = 2;

      const randomOrders: UserOrder[] = generateRandomOrders(1000, price_mean, price_sd, qty_mean, qty_sd);
      const buyPrices = randomOrders
        .filter(order => order.side === 'buy')
        .map(order => order.price);
        
      // Bin the data for the histogram
      const numBins = 16;
      const { bins, binLabels } = binData(buyPrices, numBins);
      
      // Generate smooth normal distribution data
      const smoothData = binLabels.map(x => gaussian(x, price_mean, price_sd) * buyPrices.length * (binLabels[1] - binLabels[0]));
      
      const chartData: ChartData<'bar' | 'line'> = {
        labels: binLabels,
        datasets: [
          {
            label: 'Histogram',
            type: 'bar',
            data: bins,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
          },
          {
            label: 'Normal Distribution',
            type: 'line',
            data: smoothData,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      };

      const ctx = document.getElementById('myChart') as HTMLCanvasElement | null;
      if (!ctx) return;

      new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          indexAxis: 'y', // Make bars horizontal
          scales: {
            x: {
              display: true,
              title: { display: true, text: 'Frequency' },
            },
            y: {
              display: true,
              title: { display: true, text: 'Value' },
              reverse: true,
            },
            y1: { // Secondary y-axis for the smooth line
              position: 'right',
              display: false, // Hide it to avoid clutter
              grid: { drawOnChartArea: false },
              reverse: true,
            },
          },
        },
      });
    });
  },
});
</script>

<style scoped>
#myChart {
  max-width: 400px;
  max-height: 300px;
  width: 100%;
  height: auto;
}
</style>