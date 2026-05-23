import type { IgdbGame } from '@repo/types';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontSizes, fontWeights } from '@/constants/fonts';
import { layout } from '@/constants/layout';

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
    padding: layout.screenPadding,
    gap: layout.sectionGap,
    backgroundColor: colors.background,
  },
  cover: {
    width: '100%',
    aspectRatio: layout.cover.aspectRatio,
    borderRadius: layout.cover.borderRadius,
    backgroundColor: colors.placeholder,
  },
  coverPlaceholder: {},
  name: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  year: {
    fontSize: fontSizes.base,
    color: colors.textMuted,
  },
});
