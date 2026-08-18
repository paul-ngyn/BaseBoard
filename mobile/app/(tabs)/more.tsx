import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignOut } from 'phosphor-react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors, fontFamily, radius } from '../../lib/theme';

export default function MoreScreen() {
  const { member, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{member?.name ?? 'Loading…'}</Text>
        <Text style={styles.role}>
          {member?.role ?? ''} {member?.access_level ? `· ${member.access_level}` : ''}
        </Text>
      </View>

      <Pressable style={styles.signOutBtn} onPress={signOut}>
        <SignOut size={16} color={colors.accent} weight="duotone" />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 14 },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: 16, borderWidth: 1, borderColor: colors.divider },
  name: { fontFamily: fontFamily.semibold, fontSize: 16, color: colors.text },
  role: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.dividerStrong,
    borderRadius: radius.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  signOutText: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 14 },
});
