import { StyleSheet, TextInput, View } from 'react-native';

type SearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchInput() {
  return (
    <View style={styles.wrapper}>
      <TextInput
        //value={value}
        //onChangeText={onChangeText}
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
