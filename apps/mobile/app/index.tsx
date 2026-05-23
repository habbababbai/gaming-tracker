import {
  StyleSheet,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import { SearchInput } from '@/components/search/SearchInput';
import { SearchResultsList } from '@/components/search/SearchResultsList';

export default function SearchScreen() {
  function keyboardDismiss() {
    Keyboard.dismiss();
  }
  return (
    <TouchableWithoutFeedback onPress={keyboardDismiss}>
      <View style={styles.screen}>
        <SearchInput />
        <SearchResultsList />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
