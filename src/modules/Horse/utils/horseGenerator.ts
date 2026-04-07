import type { Horse } from '@/modules/Horse/types/horse.types'

const HORSE_NAMES: readonly string[] = [
  'Thunder Bolt',
  'Silver Arrow',
  'Midnight Star',
  'Golden Spirit',
  'Wild Fire',
  'Shadow Dancer',
  'Storm Chaser',
  'Iron Will',
  'Desert Rose',
  'Ocean Breeze',
  'Lightning Strike',
  'Crimson Fury',
  'Noble Knight',
  'Mystic Dream',
  'Brave Heart',
  'Rapid Wind',
  'Diamond Dust',
  'Blazing Trail',
  'Arctic Fox',
  'Royal Flush',
]

const HORSE_COLORS: readonly string[] = [
  '#E53935', // Red
  '#1E88E5', // Blue
  '#43A047', // Green
  '#FB8C00', // Orange
  '#8E24AA', // Purple
  '#00ACC1', // Cyan
  '#F4511E', // Deep Orange
  '#3949AB', // Indigo
  '#7CB342', // Light Green
  '#FFB300', // Amber
  '#D81B60', // Pink
  '#00897B', // Teal
  '#6D4C41', // Brown
  '#546E7A', // Blue Grey
  '#C0CA33', // Lime
  '#5E35B1', // Deep Purple
  '#039BE5', // Light Blue
  '#E91E63', // Hot Pink
  '#2E7D32', // Dark Green
  '#FF6F00', // Dark Amber
]

function getRandomCondition(): number {
  return Math.floor(Math.random() * 100) + 1
}

export function generateHorses(): Horse[] {
  return HORSE_NAMES.map((name, index) => ({
    id: index + 1,
    name,
    color: HORSE_COLORS[index],
    condition: getRandomCondition(),
  }))
}
