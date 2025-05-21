<template>
  <div>
    <svg ref="svgRef" :width="width" :height="height"></svg>
    <button @click="addDataPoint">Add Data Point</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from 'vue';
import * as d3 from 'd3';

interface DataPoint {
  date: Date;
  value: number;
}

export default defineComponent({
  name: 'LineChart',
  setup() {
    const width = 500;
    const height = 300;
    const svgRef = ref<SVGSVGElement | null>(null);

    // Reactive data array
    const data = ref<DataPoint[]>([
      { date: new Date(2021, 0, 1), value: 30 },
      { date: new Date(2021, 1, 1), value: 50 },
      { date: new Date(2021, 2, 1), value: 40 },
      { date: new Date(2021, 3, 1), value: 70 },
      { date: new Date(2021, 4, 1), value: 60 }
    ]);

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    function drawChart() {
      if (!svgRef.value) return;
      const svg = d3.select(svgRef.value);

      svg.selectAll('*').remove(); // Clear SVG before redraw

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const xScale = d3.scaleTime()
        .domain(d3.extent(data.value, d => d.date) as [Date, Date])
        .range([0, innerWidth]);

      const yMax = d3.max(data.value, d => d.value) ?? 0;
      const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .nice()
        .range([innerHeight, 0]);

      const line = d3.line<DataPoint>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value));

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5));

      g.append('g')
        .call(d3.axisLeft(yScale));

      g.append('path')
        .datum(data.value)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);
    }

    // Draw initial chart on mount
    watch(data, () => {
      nextTick(() => {
        drawChart();
      });
    // }, { immediate: true });
    }, { immediate: true, deep: true });
    
    // Add new data point with current date + value between 10 and 90
    function addDataPoint() {
      const lastDate = data.value[data.value.length - 1]?.date ?? new Date();
      // Add 1 month to last date
      const newDate = new Date(lastDate);
      newDate.setMonth(newDate.getMonth() + 1);

      const newValue = 10 + Math.floor(Math.random() * 80);

      data.value.push({ date: newDate, value: newValue });
      // data.value = [...data.value, { date: newDate, value: newValue }]; // This changes the ref and fires the watcher
    }

    return {
      svgRef,
      width,
      height,
      addDataPoint,
    };
  }
});
</script>

<style scoped>

</style>