import { StyleSheet, TextInput, View } from 'react-native';

export function SearchInput() {
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder="Search games..."
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
});
