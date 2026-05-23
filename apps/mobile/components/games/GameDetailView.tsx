import type { IgdbGame } from '@repo/types';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

interface GameDetailViewProps {
  game: IgdbGame;
}

export function GameDetailView({ game }: GameDetailViewProps) {
  return (
    <View style={styles.container}>
      {game.coverUrl ? (
        <Image
          source={{ uri: game.coverUrl }}
          style={styles.cover}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]} />
      )}
      <Text style={styles.name}>{game.name}</Text>
      {game.releaseYear != null && (
        <Text style={styles.year}>{game.releaseYear}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  cover: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  coverPlaceholder: {},
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  year: {
    fontSize: 16,
    color: '#6b7280',
  },
  error: {
    fontSize: 15,
    color: '#dc2626',
    textAlign: 'center',
  },
});
