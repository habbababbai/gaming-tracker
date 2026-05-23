import type { IgdbGame } from '@repo/types';
import { StyleSheet, Text, View } from 'react-native';

const PLACEHOLDER_GAMES: IgdbGame[] = [
  { id: 1, name: 'Elden Ring', coverUrl: null, releaseYear: 2022 },
  { id: 2, name: 'Hollow Knight', coverUrl: null, releaseYear: 2017 },
  { id: 3, name: 'Celeste', coverUrl: null, releaseYear: 2018 },
];

export function SearchResultsList() {
  return (
    <View style={styles.container}>
      {PLACEHOLDER_GAMES.map((game) => (
        <Text key={game.id} style={styles.row}>
          {game.name}
          {game.releaseYear != null ? ` (${game.releaseYear})` : ''}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
  },
  row: {
    fontSize: 16,
    color: '#111827',
  },
});
