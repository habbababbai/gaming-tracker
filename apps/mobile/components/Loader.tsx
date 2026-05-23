import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';

interface Props {
  size?: 'small' | 'large';
}

export function Loader({ size = 'large' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
