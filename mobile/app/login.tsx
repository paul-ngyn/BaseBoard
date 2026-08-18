import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { colors, fontFamily } from '../lib/theme';
import { BrandMark } from '../components/BrandMark';

export default function LoginScreen() {
  const { session, loading: sessionLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!sessionLoading && session) return <Redirect href="/(tabs)" />;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.brandRow}>
          <BrandMark />
          <View>
            <Text style={styles.brandName}>Baseboard</Text>
            <Text style={styles.brandSub}>FLOORING PM</Text>
          </View>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 360, backgroundColor: colors.bg, borderRadius: 16, padding: 24, gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  brandName: { fontFamily: fontFamily.semibold, fontSize: 19, color: colors.text },
  brandSub: { fontSize: 10, letterSpacing: 1.2, color: colors.textMuted, marginTop: 2 },
  label: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.dividerStrong,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.text,
    marginTop: -6,
  },
  error: { color: '#b3261e', fontSize: 13, fontFamily: fontFamily.regular },
  button: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: colors.bg, fontFamily: fontFamily.semibold, fontSize: 14 },
});
