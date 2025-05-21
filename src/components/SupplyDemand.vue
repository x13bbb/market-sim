<template>
  <svg ref="sndRef" :width="width" :height="height"></svg>
</template>

<script lang="ts">
import { defineComponent, ref, watch, nextTick } from 'vue';
import * as d3 from 'd3';
import { genBools, genNumNorm, genNumUniform } from '@/utils/rand';
import type { UserOrder } from '@/models/orderbook';

interface DataPoint {
  price: number;
  qty: number;
}

export default defineComponent({
  name: 'SupplyDemand',
  setup() {
    const width = 500;
    const height = 300;
    const sndRef = ref<SVGSVGElement | null>(null);

    function genOrders(length: number, priceMean: number, priceStdDev: number, qtyMin: number, qtyMax: number): UserOrder[] {
      const prices = genNumNorm(length, priceMean, priceStdDev, 2);
      // Uniform volume dist
      const quantities = genNumUniform(length, 0, qtyMax, 0);
      const sides = genBools(length);

      return prices.map((price, i) => ({
        price: price,
        quantity: quantities[i],
        side: sides[i] ? 'buy' : 'sell',
      }));
    }

    function aggOrders(orders: UserOrder[]): DataPoint[] {
      // Aggregate by price
      const map = new Map<number, number>();
      orders.forEach(order => {
        map.set(order.price, (map.get(order.price) || 0) + order.quantity);
      });
      // Convert back to array
      return Array.from(map, ([price, qty]) => ({ price, qty }));
    }

    const length = 1000;
    const priceMean = 100;
    const priceSD = 5;
    const qtyMin = 0;
    const qtyMax = 50;

    const allOrders = genOrders(length, priceMean, priceSD, qtyMin, qtyMax);

    // Buyers: descending price with aggregation
    const buyerData = ref<DataPoint[]>(
      aggOrders(allOrders.filter(o => o.side === 'buy'))
        .sort((a, b) => b.price - a.price)
    );

    // Sellers: ascending price with aggregation
    const sellerData = ref<DataPoint[]>(
      aggOrders(allOrders.filter(o => o.side === 'sell'))
        .sort((a, b) => a.price - b.price)
    );

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    function getSteppedData(dataArr: DataPoint[]) {
      const steppedData: DataPoint[] = [{ price: dataArr[0].price, qty: 0 }];
      for (let i = 0; i < dataArr.length; i++) {
        const currentQtySum = steppedData[i].qty + dataArr[i].qty;
        if (i + 1 < dataArr.length) {
          steppedData.push({ price: dataArr[i + 1].price, qty: currentQtySum });
        } else {
          steppedData.push({ price: dataArr[i].price, qty: currentQtySum });
        }
      }
      return steppedData;
    }

    function findEquilibrium(
      buyers: DataPoint[],
      sellers: DataPoint[]
    ): DataPoint | null {
      // 1) build stepped arrays and sort ascending by price
      const sup = getSteppedData(sellers)
        .sort((a, b) => a.price - b.price);
      const dem = getSteppedData(buyers)
        .sort((a, b) => a.price - b.price);

      // 2) collect all unique prices
      const prices = Array.from(
        new Set([...sup.map(d => d.price), ...dem.map(d => d.price)])
      ).sort((a, b) => a - b);

      // 3) walk both stepped arrays to sample supplyQty & demandQty at each price
      let si = 0, di = 0;
      const mins: { price: number; qty: number }[] = [];
      for (const p of prices) {
        while (si + 1 < sup.length && sup[si + 1].price <= p) si++;
        while (di + 1 < dem.length && dem[di + 1].price <= p) di++;

        const sQ = sup[si].qty;
        const dQ = dem[di].qty;
        mins.push({ price: p, qty: Math.min(sQ, dQ) });
      }

      // 4) find the maximum matched volume
      const maxFill = d3.max(mins, d => d.qty) ?? 0;
      const candidates = mins.filter(d => d.qty === maxFill).map(d => d.price);
      if (candidates.length === 0) return null;

      // 5) if multiple prices tie, return their midpoint
      const lo = candidates[0];
      const hi = candidates[candidates.length - 1];
      return {price: (lo + hi) / 2, qty: maxFill};
    }
    
    function drawChart() {
      if (!sndRef.value) return;
      const svg = d3.select(sndRef.value);
      svg.selectAll('*').remove(); // Clear SVG before redraw

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Find total qty and price bounds for axis scaling
      const allData = [...buyerData.value, ...sellerData.value];
      const qtyMax = d3.sum(buyerData.value, d => d.qty); // Assumes same sum for both

      const xPadding = qtyMax * 0.1; // 10% padding
      const xScale = d3.scaleLinear()
        .domain([0 - xPadding, qtyMax + xPadding])
        .nice()
        .range([0, innerWidth]);

      const prices = allData.map(d => d.price);
      const yExtent = d3.extent(prices) as [number, number];
      const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

      const yScale = d3.scaleLinear()
        .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
        .nice()
        .range([innerHeight, 0]);

      // Margin group
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Draw sellers line (red)
      g.append('path')
        .datum(getSteppedData(sellerData.value))
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', d3.line<DataPoint>()
          .x(d => xScale(d.qty))
          .y(d => yScale(d.price))
          .curve(d3.curveStepAfter)
        );

      // Draw buyers line (green)
      g.append('path')
        .datum(getSteppedData(buyerData.value))
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('d', d3.line<DataPoint>()
          .x(d => xScale(d.qty))
          .y(d => yScale(d.price))
          .curve(d3.curveStepAfter)
        );

      const eq = findEquilibrium(buyerData.value, sellerData.value);

      if (eq) {
        // horizontal line capped at equilibrium quantity on x-axis
        g.append('line')
          .attr('x1', 0).attr('x2', xScale(eq.qty))
          .attr('y1', yScale(eq.price)).attr('y2', yScale(eq.price))
          .attr('stroke', 'white').attr('stroke-dasharray', '4 2');

        // vertical line capped at equilibrium price on y-axis
        g.append('line')
          .attr('x1', xScale(eq.qty)).attr('x2', xScale(eq.qty))
          .attr('y1', yScale.range()[0]) // bottom of chart (max y)
          .attr('y2', yScale(eq.price))  // equilibrium price level
          .attr('stroke', 'white').attr('stroke-dasharray', '4 2');
      }

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale));

      g.append('g')
        .call(d3.axisLeft(yScale));
    }

    watch([buyerData, sellerData], () => {
      nextTick(() => {
        drawChart();
      });
    }, { immediate: true, deep: true });

    return {
      sndRef,
      width,
      height
    }
  }
});
</script>

<style scoped>
/* Add your styles here */
</style>