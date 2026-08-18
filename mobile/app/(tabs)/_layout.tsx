import { Redirect, Tabs } from 'expo-router';
import { CalendarBlank, Table, MapPin, List } from 'phosphor-react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../lib/theme';

export default function TabLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.sidebar, borderTopColor: colors.divider },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <CalendarBlank size={19} color={String(color)} weight="duotone" />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{ title: 'Jobs', tabBarIcon: ({ color }) => <Table size={19} color={String(color)} weight="duotone" /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ color }) => <MapPin size={19} color={String(color)} weight="duotone" /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'More', tabBarIcon: ({ color }) => <List size={19} color={String(color)} weight="duotone" /> }}
      />
    </Tabs>
  );
}
