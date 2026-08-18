import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass } from 'phosphor-react-native';
import { useTodayJobs } from '../../hooks/useTodayJobs';
import { colors, fontFamily, radius } from '../../lib/theme';

function openDirections(address: string, city: string) {
  const destination = encodeURIComponent(`${address}, ${city}`);
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
}

export default function TodayScreen() {
  const { jobs, loading, stats } = useTodayJobs();
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.dateLabel}>{dateLabel}</Text>
        <Text style={styles.title}>Today's schedule</Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statValue}>{stats.stops}</Text>
            <Text style={styles.statLabel}>stops</Text>
          </View>
          <View>
            <Text style={styles.statValue}>
              {stats.milesToDrive}
              <Text style={styles.statUnit}> mi</Text>
            </Text>
            <Text style={styles.statLabel}>to drive</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{stats.crewCount}</Text>
            <Text style={styles.statLabel}>crew</Text>
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.accent} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {jobs.length === 0 && <Text style={styles.empty}>No jobs scheduled for today.</Text>}
          {jobs.map((j) => (
            <View key={j.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.time}>{j.time}</Text>
                <View style={[styles.pill, { backgroundColor: j.pillBg }]}>
                  <Text style={[styles.pillText, { color: j.pillFg }]}>{j.stage}</Text>
                </View>
              </View>
              <Text style={styles.addr}>{j.addr}</Text>
              <Text style={styles.meta}>
                {j.city} · {j.client}
              </Text>
              <View style={styles.cardBottom}>
                <Text style={styles.footNote}>
                  {j.crew} · {j.note}
                </Text>
                <Pressable style={styles.directionsBtn} onPress={() => openDirections(j.addr, j.city)}>
                  <Compass size={13} color={colors.bg} weight="duotone" />
                  <Text style={styles.directionsText}>Directions</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.accent, paddingHorizontal: 22, paddingBottom: 22 },
  dateLabel: { color: colors.bg, opacity: 0.8, fontSize: 12, letterSpacing: 1.2, fontFamily: fontFamily.regular, marginTop: 8 },
  title: { color: colors.bg, fontSize: 26, fontFamily: fontFamily.semibold, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 16 },
  statValue: { color: colors.bg, fontFamily: fontFamily.semibold, fontSize: 22 },
  statUnit: { fontSize: 13 },
  statLabel: { color: colors.bg, opacity: 0.8, fontSize: 11, fontFamily: fontFamily.regular },
  list: { padding: 16, gap: 14 },
  empty: { color: colors.textMuted, fontFamily: fontFamily.regular, textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: colors.surface, borderRadius: radius.cardLg, borderWidth: 1, borderColor: colors.divider, padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { color: colors.accent, fontFamily: fontFamily.semibold, fontSize: 13 },
  pill: { paddingHorizontal: 11, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontSize: 10.5, fontFamily: fontFamily.semibold },
  addr: { fontFamily: fontFamily.semibold, fontSize: 16, color: colors.text, marginTop: 8 },
  meta: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondaryAlt, marginTop: 2 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footNote: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondaryAlt, flexShrink: 1, marginRight: 8 },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  directionsText: { color: colors.bg, fontSize: 12, fontFamily: fontFamily.semibold },
});
