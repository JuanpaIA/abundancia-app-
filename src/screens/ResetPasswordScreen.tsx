import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { Colors, Spacing, Radius } from '../constants/theme'
import { ScreenBackground } from '../components/ui/ScreenBackground'
import { GradientButton } from '../components/ui/GradientButton'
import { supabase } from '../services/supabase'

interface Props {
  onComplete: () => void
}

export function ResetPasswordScreen({ onComplete }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  async function handleReset() {
    if (!password || !confirm) return Alert.alert('Completa todos los campos')
    if (password.length < 6)   return Alert.alert('Mínimo 6 caracteres', 'Tu contraseña debe tener al menos 6 caracteres.')
    if (password !== confirm)  return Alert.alert('No coinciden', 'Las contraseñas no son iguales. Verifica e intenta de nuevo.')

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) return Alert.alert('Error', error.message)

    setDone(true)
    await supabase.auth.signOut()
    setTimeout(onComplete, 1800)
  }

  if (done) {
    return (
      <View style={[styles.container, styles.doneCenter]}>
        <Text style={styles.doneIcon}>✦</Text>
        <Text style={styles.doneTitle}>¡Contraseña actualizada!</Text>
        <Text style={styles.doneSubtitle}>Ya puedes iniciar sesión con tu nueva contraseña.</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenBackground />
      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>
          Elige una contraseña segura para proteger tu plan de manifestación.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textDisabled}
              autoFocus
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={styles.input}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              placeholder="Repite tu contraseña"
              placeholderTextColor={Colors.textDisabled}
            />
          </View>

          <GradientButton
            title="Guardar nueva contraseña ✦"
            onPress={handleReset}
            loading={loading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: Spacing.lg, paddingTop: 100, justifyContent: 'center' },

  icon:     { fontSize: 48, marginBottom: Spacing.md },
  title:    { fontSize: 28, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.xl },

  form:         { gap: Spacing.md },
  inputWrapper: { gap: Spacing.xs },
  label:        { fontSize: 14, color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.input,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  doneCenter:   { justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  doneIcon:     { fontSize: 52, color: Colors.gold, marginBottom: Spacing.lg },
  doneTitle:    { fontSize: 24, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
  doneSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})
