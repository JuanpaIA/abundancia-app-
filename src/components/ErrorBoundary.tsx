import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { supabase } from '../services/supabase'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: null }

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : String(error)
    return { hasError: true, errorMessage: msg }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const msg = error instanceof Error ? error.message : String(error)
    supabase.from('error_reports').insert({
      user_id: null,
      section: 'error_boundary',
      error_message: msg,
      error_details: info.componentStack ?? undefined,
      app_context: { platform: Platform.OS },
    }).then(() => {})
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <View style={styles.container}>
        <Text style={styles.icon}>✦</Text>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.body}>
          La app encontró un error inesperado. Tu progreso está guardado en la nube — puedes reintentar sin perder nada.
        </Text>
        <TouchableOpacity style={styles.button} onPress={this.handleRetry} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E8EC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 36,
    color: '#d4a843',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2A1B22',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    color: '#6B5A62',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#8C5A6E',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
})
