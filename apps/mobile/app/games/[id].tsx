import { GameDetailView } from '@/components/games/GameDetailView';
import { IgdbGame } from '@repo/types';

const PLACEHOLDER_GAME: IgdbGame = {
  id: 1,
  name: 'Elden Ring',
  coverUrl: null,
  releaseYear: 2022,
};

export default function GameDetailScreen() {
  return <GameDetailView game={PLACEHOLDER_GAME} />;
}
