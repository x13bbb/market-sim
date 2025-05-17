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

export default defineComponent({
  name: 'NormalDistributionChart',
  setup() {
    onMounted(() => {
      const ctx: HTMLCanvasElement | null = document.getElementById('myChart');

      const randomNumbers = generateRandomNumbers(1000);

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

      console.log("instantiate Chart")
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

</style>