<template>
  <canvas id="myChart"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { randomNormal } from 'd3-random';

export function generateRandomNumbers(length: number) {
  const randomNormalDist = randomNormal(0, 1);
  return Array.from({ length }, randomNormalDist);
}

// New function to bin data for histogram
function binData(data: number[], numBins: number) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;
  const bins = Array(numBins).fill(0);
  const binLabels = Array(numBins).map((_, i) => min + i * binWidth);

  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
    bins[binIndex]++;
  });

  return { bins, binLabels };
}

// New function for smooth normal distribution
function gaussian(x: number, mean: number, stdDev: number) {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}

export default defineComponent({
  name: 'NormalDistributionChart',
  setup() {
    onMounted(() => {
      const ctx: HTMLCanvasElement | null = document.getElementById('myChart');
      const randomNumbers = generateRandomNumbers(1000);

      // Bin the data for the histogram
      const numBins = 50;
      const { bins, binLabels } = binData(randomNumbers, numBins);

      // Generate smooth normal distribution data
      const smoothData = binLabels.map(x => gaussian(x, 0, 1) * randomNumbers.length * (binLabels[1] - binLabels[0]));

      const chartData = {
        labels: binLabels,
        datasets: [
          {
            label: 'Histogram',
            type: 'bar', // Bar chart for histogram
            data: bins,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            barPercentage: 1.0,
            categoryPercentage: 1.0,
          },
          {
            label: 'Normal Distribution',
            type: 'line', // Line chart for smooth curve
            data: smoothData,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4, // Smooth the line
            yAxisID: 'y1', // Use secondary y-axis for the line
          },
        ],
      };

      console.log("instantiate Chart")
      new Chart(ctx, {
        type: 'line',
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
            },
            y1: { // Secondary y-axis for the smooth line
              position: 'right',
              display: false, // Hide it to avoid clutter
              grid: { drawOnChartArea: false },
            },
          },
        },
      });
    });
  },
});
</script>

<style scoped>

</style>