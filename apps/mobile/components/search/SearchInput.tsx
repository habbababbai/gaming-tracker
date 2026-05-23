import { StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '@/constants/colors';
import { fontSizes } from '@/constants/fonts';
import { layout } from '@/constants/layout';

export function SearchInput() {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder={t('search.placeholder')}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: layout.screenPadding,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.input.borderRadius,
    paddingHorizontal: layout.input.paddingHorizontal,
    paddingVertical: layout.input.paddingVertical,
    fontSize: fontSizes.base,
    color: colors.text,
  },
});
