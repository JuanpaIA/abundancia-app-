import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useState } from 'react'
import { Colors, Spacing, Radius } from '../constants/theme'
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

  async function handleRegister() {
    if (!email || !password) return Alert.alert('Completa todos los campos')
    if (password.length < 6) return Alert.alert('La contraseña debe tener al menos 6 caracteres')

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { plan_type: selectedPlan } },
    })
    setLoading(false)

    if (error) return Alert.alert('Error', error.message)
    if (data.session) {
      onAuthSuccess()
    } else {
      Alert.alert('Revisa tu email', 'Te enviamos un enlace de confirmación. Confirma tu email y vuelve a iniciar sesión.')
      setMode('login')
    }
  }

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Completa todos los campos')

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        return Alert.alert('Datos incorrectos', 'El email o la contraseña no son correctos. Verifica e intenta de nuevo.')
      }
      if (msg.includes('email not confirmed')) {
        return Alert.alert('Email no confirmado', 'Revisa tu bandeja de entrada y confirma tu email antes de iniciar sesión.')
      }
      return Alert.alert('Error', error.message)
    }
    onAuthSuccess()
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      return Alert.alert('Ingresa tu email', 'Escribe tu email arriba y toca "¿Olvidaste tu contraseña?" de nuevo.')
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
    setLoading(false)
    if (error) return Alert.alert('Error', error.message)
    Alert.alert(
      'Revisa tu email ✦',
      `Si existe una cuenta con ${email.trim()}, recibirás un enlace para restablecer tu contraseña.`
    )
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
            ? `Plan ${selectedPlan === 'annual' ? 'anual $99' : 'mensual $14'} seleccionado`
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
  title: { fontSize: 28, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, color: Colors.gold, marginBottom: Spacing.xl },
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
})
