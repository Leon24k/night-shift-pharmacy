import { useGame } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import {
  TitleScreen,
  OnboardingScreen,
  ShiftIntroScreen,
  ShiftSummaryScreen,
  GameOverScreen,
} from '@/components/Screens';

export default function App() {
  const phase = useGame((s) => s.phase);

  return (
    <div className="h-full w-full">
      {phase === 'TITLE' && <TitleScreen />}
      {phase === 'ONBOARDING' && <OnboardingScreen />}
      {phase === 'SHIFT_INTRO' && <ShiftIntroScreen />}
      {(phase === 'PLAYING' ||
        phase === 'FEEDBACK' ||
        phase === 'COMPOUNDING' ||
        phase === 'COPY_RESEP' ||
        phase === 'DISPENSING') && <GameLayout />}
      {phase === 'SHIFT_SUMMARY' && <ShiftSummaryScreen />}
      {phase === 'GAME_OVER' && <GameOverScreen />}
    </div>
  );
}
