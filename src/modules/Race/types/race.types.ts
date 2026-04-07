import type { Horse } from '@/modules/Horse/types/horse.types'

export enum GameStatus {
  IDLE = 'IDLE',
  READY = 'READY',
  RACING = 'RACING',
  PAUSED = 'PAUSED',
  ROUND_FINISHED = 'ROUND_FINISHED',
  FINISHED = 'FINISHED',
}

export interface RoundConfig {
  roundNumber: number
  distance: number
}

export interface RaceEntry {
  horse: Horse
  lane: number
}

export interface RoundSchedule {
  config: RoundConfig
  entries: RaceEntry[]
}

export interface RaceResult {
  position: number
  horse: Horse
  finishTimeMs: number
}

export interface RoundResult {
  roundNumber: number
  results: RaceResult[]
}
