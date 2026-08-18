import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Icon } from 'phosphor-react-native';
import { colors, fontFamily } from '../lib/theme';

export function PlaceholderScreen({ title, subtitle, Icon }: { title: string; subtitle: string; Icon: Icon }) {
  return (
    <SafeAreaView style={styles.screen}>
      <Icon size={32} color={colors.textMuted} weight="duotone" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  title: { fontFamily: fontFamily.semibold, fontSize: 18, color: colors.text },
  subtitle: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary, textAlign: 'center' },
});
