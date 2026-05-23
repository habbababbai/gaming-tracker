import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
  size?: 'small' | 'large';
}

export function Loader({ size = 'large' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} />
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
