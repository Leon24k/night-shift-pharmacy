import { create } from 'zustand';
import type {
  GamePhase,
  Judgement,
  Patient,
  RuleId,
  StampDecision,
} from '@/types';
import { generateShift } from '@/game/prescriptionGenerator';
import { verify } from '@/game/verification';
import { rulesForDay, MAX_DAY } from '@/game/dayRules';

const PATIENTS_PER_SHIFT = 5;
const STARTING_MONEY = 500_000;
const STARTING_REPUTATION = 100;

// ekonomi
const REWARD_CORRECT = 40_000;
const PENALTY_WRONG = 30_000;
const PENALTY_MYSTERY_FAIL = 250_000; // sidak lolos = fatal
const DAILY_BILL = 120_000; // tagihan harian

interface GameState {
  phase: GamePhase;
  day: number;
  activeRules: RuleId[];

  // shift
  queue: Patient[];
  currentIndex: number;
  currentPatient: Patient | null;

  // ekonomi & status
  money: number;
  reputation: number;
  warnings: number; // surat peringatan

  // hasil
  judgements: Judgement[];
  lastJudgement: Judgement | null;

  // actions
  startGame: () => void;
  setPhase: (phase: GamePhase) => void;
  beginShift: () => void;
  decide: (decision: StampDecision) => void;
  nextPatient: () => void;
  nextDay: () => void;
  resetGame: () => void;
}

function makeQueue(day: number): Patient[] {
  const rules = rulesForDay(day);
  // mystery shopper mulai muncul hari 2, di posisi acak (indeks 2..4)
  const mysteryIndex =
    day >= 2 ? 2 + Math.floor(Math.random() * (PATIENTS_PER_SHIFT - 2)) : -1;
  return generateShift({
    seed: (day * 1000 + Date.now()) >>> 0,
    count: PATIENTS_PER_SHIFT,
    activeRules: rules,
    mysteryShopperIndex: mysteryIndex,
  });
}

export const useGame = create<GameState>((set, get) => ({
  phase: 'TITLE',
  day: 1,
  activeRules: rulesForDay(1),
  queue: [],
  currentIndex: 0,
  currentPatient: null,
  money: STARTING_MONEY,
  reputation: STARTING_REPUTATION,
  warnings: 0,
  judgements: [],
  lastJudgement: null,

  startGame: () => {
    set({ phase: 'ONBOARDING' });
  },

  setPhase: (phase) => set({ phase }),

  beginShift: () => {
    const { day } = get();
    const rules = rulesForDay(day);
    const queue = makeQueue(day);
    set({
      phase: 'PLAYING',
      activeRules: rules,
      queue,
      currentIndex: 0,
      currentPatient: queue[0] ?? null,
      judgements: [],
      lastJudgement: null,
    });
  },

  decide: (decision) => {
    const state = get();
    const patient = state.currentPatient;
    if (!patient) return;

    const result = verify(patient, state.activeRules);
    const shouldAccept = !result.hasViolation;
    const playerAccepted = decision === 'ACCEPT';
    const correct = playerAccepted === shouldAccept;

    // hitung konsekuensi
    let moneyDelta = 0;
    let reputationDelta = 0;
    let reason = '';

    if (correct) {
      moneyDelta = REWARD_CORRECT;
      reputationDelta = 2;
      reason = shouldAccept
        ? 'Resep sah dan diterima dengan benar.'
        : 'Tepat! Resep bermasalah berhasil ditolak.';
    } else {
      // salah
      if (patient.isMysteryShopper && !shouldAccept && playerAccepted) {
        // meloloskan pelanggaran ke petugas sidak = fatal
        moneyDelta = -PENALTY_MYSTERY_FAIL;
        reputationDelta = -40;
        reason =
          'SIDAK DINKES! Anda meloloskan pelanggaran ke petugas menyamar. Denda berat & apotek terancam disegel.';
      } else if (!shouldAccept && playerAccepted) {
        moneyDelta = -PENALTY_WRONG;
        reputationDelta = -10;
        const v = result.violations[0];
        reason = `Salah terima. Pelanggaran ${v?.rule}: ${v?.title}. ${v?.detail ?? ''}`;
      } else {
        // menolak resep yang sebenarnya sah
        moneyDelta = -PENALTY_WRONG;
        reputationDelta = -8;
        reason =
          'Salah tolak. Resep ini sebenarnya sah — pasien dirugikan & reputasi turun.';
      }
    }

    const judgement: Judgement = {
      patientId: patient.id,
      decision,
      correct,
      reason,
      moneyDelta,
      reputationDelta,
      wasMysteryShopper: patient.isMysteryShopper,
    };

    const newWarnings =
      state.warnings + (!correct && !patient.isMysteryShopper ? 1 : 0);

    set({
      phase: 'FEEDBACK',
      money: state.money + moneyDelta,
      reputation: Math.max(0, Math.min(100, state.reputation + reputationDelta)),
      warnings: newWarnings,
      judgements: [...state.judgements, judgement],
      lastJudgement: judgement,
    });
  },

  nextPatient: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;

    // game over check: reputasi habis
    if (state.reputation <= 0) {
      set({ phase: 'GAME_OVER' });
      return;
    }

    if (nextIndex >= state.queue.length) {
      // shift selesai -> terapkan tagihan harian
      set({
        phase: 'SHIFT_SUMMARY',
        money: state.money - DAILY_BILL,
        currentPatient: null,
        lastJudgement: null,
      });
      return;
    }

    set({
      phase: 'PLAYING',
      currentIndex: nextIndex,
      currentPatient: state.queue[nextIndex],
      lastJudgement: null,
    });
  },

  nextDay: () => {
    const state = get();
    // kalah bila uang minus atau reputasi habis
    if (state.money < 0 || state.reputation <= 0) {
      set({ phase: 'GAME_OVER' });
      return;
    }
    // tamat prototipe setelah hari terakhir
    if (state.day >= MAX_DAY) {
      set({ phase: 'GAME_OVER' });
      return;
    }
    const newDay = state.day + 1;
    set({
      day: newDay,
      activeRules: rulesForDay(newDay),
      phase: 'SHIFT_INTRO',
    });
  },

  resetGame: () => {
    set({
      phase: 'TITLE',
      day: 1,
      activeRules: rulesForDay(1),
      queue: [],
      currentIndex: 0,
      currentPatient: null,
      money: STARTING_MONEY,
      reputation: STARTING_REPUTATION,
      warnings: 0,
      judgements: [],
      lastJudgement: null,
    });
  },
}));

export const GAME_CONSTANTS = {
  PATIENTS_PER_SHIFT,
  STARTING_MONEY,
  DAILY_BILL,
  MAX_DAY,
};
