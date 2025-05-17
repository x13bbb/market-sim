<template>
  <canvas id="myChart"></canvas>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { randomNormal } from 'd3-random';

export function generateRandomNumbers(length: number) {
  const randomNormalDist = randomNormal(0, 1); // Mean 0, standard deviation 1
  // Generate random numbers based on normal distribution
  return Array.from({ length }, randomNormalDist);
}

export default defineComponent({
  name: 'NormalDistributionChart',
  setup() {
    onMounted(() => {
      const ctx: HTMLCanvasElement | null = document.getElementById('myChart');

      // Use the refactored function
      const randomNumbers = generateRandomNumbers(1000);

      // Create chart data
      const chartData = {
        labels: randomNumbers.map((_, index) => index),
        datasets: [
          {
            label: 'Normal Distribution',
            data: randomNumbers,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
          },
        ],
      };

      // Create the chart
      new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            x: { display: false },
            y: { beginAtZero: true },
          },
        },
      });
    });
  },
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>