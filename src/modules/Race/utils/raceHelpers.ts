import { ROUND_COLORS } from '@/modules/Race/utils/raceConfig'

export function getHeaderClass(
  index: number,
  currentRoundIndex: number,
  activeClass: string,
): string {
  const base = index === currentRoundIndex ? `${activeClass} ` : ''
  return `${base}bg-${ROUND_COLORS[index] ?? 'grey-6'} text-white`
}

export function getMedalColor(position: number): string {
  if (position === 1) return 'amber-8'
  if (position === 2) return 'blue-grey-4'
  if (position === 3) return 'deep-orange-4'
  return 'grey-5'
}
