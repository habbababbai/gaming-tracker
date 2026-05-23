import type { IgdbGame } from '@repo/types';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontSizes } from '@/constants/fonts';
import { layout } from '@/constants/layout';

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
    padding: layout.list.padding,
    gap: layout.list.rowGap,
  },
  row: {
    fontSize: fontSizes.base,
    color: colors.text,
  },
});
