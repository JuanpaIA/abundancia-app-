import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'
import { supabase } from '../services/supabase'
import { PlanType } from '../types'

interface Props {
  selectedPlan: PlanType
  onAuthSuccess: () => void
  loginOnly?: boolean
}

export function AuthScreen({ selectedPlan, onAuthSuccess, loginOnly }: Props) {
  const [mode, setMode] = useState<'register' | 'login'>(loginOnly ? 'login' : 'register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [lastResetAt, setLastResetAt] = useState(0)

  function showError(msg: string) { setErrorMsg(msg); setSuccessMsg('') }
  function showSuccess(msg: string) { setSuccessMsg(msg); setErrorMsg('') }

  async function handleRegister() {
    setErrorMsg(''); setSuccessMsg('')
    if (!email || !password) return showError('Completa todos los campos.')
    if (password.length < 6) return showError('La contraseña debe tener al menos 6 caracteres.')

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { plan_type: selectedPlan } },
    })
    setLoading(false)

    if (error) return showError(error.message)
    if (data.session) {
      onAuthSuccess()
    } else {
      showSuccess('Te enviamos un enlace de confirmación. Revisa tu email y vuelve a iniciar sesión.')
      setMode('login')
    }
  }

  async function handleLogin() {
    setErrorMsg(''); setSuccessMsg('')
    if (!email || !password) return showError('Completa todos los campos.')

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('user not found')) {
        return showError('El email no tiene una cuenta creada o la contraseña no es correcta.')
      }
      if (msg.includes('email not confirmed')) {
        return showError('Confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.')
      }
      void supabase.from('error_reports').insert({
        user_id: null,
        section: 'auth',
        error_message: error.message,
        app_context: { action: 'login' },
      })
      return showError('No se pudo iniciar sesión. Verifica tus datos e intenta de nuevo.')
    }
    onAuthSuccess()
  }

  async function handleForgotPassword() {
    setErrorMsg(''); setSuccessMsg('')
    if (!email.trim()) return showError('Escribe tu email arriba y toca "¿Olvidaste tu contraseña?" de nuevo.')

    const now = Date.now()
    const secondsSinceLast = (now - lastResetAt) / 1000
    if (lastResetAt && secondsSinceLast < 60) {
      return showError(`Espera ${Math.ceil(60 - secondsSinceLast)} segundos antes de solicitar otro enlace.`)
    }

    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://luumina.pro',
    })
    setLoading(false)
    if (error) return showError(error.message)
    setLastResetAt(now)
    showSuccess(`Si existe una cuenta con ${email.trim()}, recibirás un enlace para restablecer tu contraseña.`)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          {mode === 'register' ? 'Crea tu cuenta' : 'Inicia sesión'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'register'
            ? `Plan ${selectedPlan === 'weekly' ? 'semanal $6.99' : 'mensual $14.99'} seleccionado`
            : 'Bienvenida de vuelta'
          }
        </Text>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textDisabled}
              placeholder="tu@email.com"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={Colors.textDisabled}
              placeholder="Mínimo 6 caracteres"
            />
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {errorMsg}</Text>
            </View>
          ) : null}
          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ {successMsg}</Text>
            </View>
          ) : null}

          <GradientButton
            title={mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
            onPress={mode === 'register' ? handleRegister : handleLogin}
            loading={loading}
          />
        </View>

        <TouchableOpacity onPress={() => setMode(mode === 'register' ? 'login' : 'register')}>
          <Text style={styles.toggle}>
            {mode === 'register'
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'
            }
          </Text>
        </TouchableOpacity>

        {mode === 'login' && (
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotWrapper}>
            <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg, paddingTop: 80, justifyContent: 'center' },
  title: { fontSize: 28, color: Colors.textPrimary, fontFamily: Fonts.heading, marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, color: Colors.gold, fontFamily: Fonts.bodyMedium, marginBottom: Spacing.xl },
  form: { gap: Spacing.md, marginBottom: Spacing.lg },
  inputWrapper: { gap: Spacing.xs },
  label: { fontSize: 14, color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.input,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggle: { color: Colors.gold, textAlign: 'center', fontSize: 14 },
  forgotWrapper: { marginTop: Spacing.md, alignItems: 'center' },
  forgot: { color: Colors.textSecondary, fontSize: 13 },
  errorBox: {
    backgroundColor: 'rgba(220,53,69,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(220,53,69,0.4)',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: { color: '#FF6B6B', fontSize: 14, lineHeight: 20 },
  successBox: {
    backgroundColor: 'rgba(76,175,130,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(76,175,130,0.4)',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  successText: { color: '#4CAF82', fontSize: 14, lineHeight: 20 },
})
