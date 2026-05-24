import {
  StyleSheet,
  View,
} from 'react-native';

import { SearchInput } from '@/components/search/SearchInput';
import { SearchResultsList } from '@/components/search/SearchResultsList';
import { colors } from '@/constants/colors';

export default function SearchScreen() {
  return (
      <View style={styles.screen}>
        <SearchInput />
        <SearchResultsList />
      </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
