import { randomNormal, randomUniform } from 'd3-random';

export function genNumNorm(length: number, mean: number, stdDev: number, precision: number = 2): number[] {
  const randNorm = randomNormal(mean, stdDev);
  return Array.from({ length }, () => parseFloat(randNorm().toFixed(precision)));
}

export function genNumUniform(length: number, min: number, max: number, precision: number = 2): number[] {
  const randNorm = randomUniform(min, max);
  return Array.from({ length }, () => parseFloat(randNorm().toFixed(precision)));
}

export function genBools(length: number): boolean[] {
  return Array.from({ length }, () => Math.random() < 0.5);
}