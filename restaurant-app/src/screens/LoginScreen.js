import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRef = useRef(null);
  const { login } = useAuth();

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const usuario = await login(email.trim(), password);

      // Redirigir según el rol
      if (usuario.rol === 'administrador') {
        navigation.replace('AdminDashboard');
      } else if (usuario.rol === 'cocina') {
        navigation.replace('Cocina');
      } else if (usuario.rol === 'mesero') {
        navigation.replace('Mesero');
      }
    } catch (error) {
      setError(error.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  }, [email, password, login, navigation]);

  const handleEmailSubmit = () => {
    passwordRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          <View style={styles.formContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Restaurante</Text>
              <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                  error && styles.inputError,
                ]}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={handleEmailSubmit}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                ref={passwordRef}
                style={[
                  styles.input,
                  passwordFocused && styles.inputFocused,
                  error && styles.inputError,
                ]}
                placeholder="••••••••"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                editable={!loading}
              />
            </View>

            {/* Login Button */}
            <Pressable
              style={({ pressed, hovered }) => [
                styles.btnLogin,
                loading && styles.btnLoginDisabled,
                Platform.OS === 'web' && hovered && !loading && styles.btnLoginHovered,
                pressed && !loading && styles.btnLoginPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.btnLoginText}>Iniciar Sesión</Text>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Client Button */}
            <Pressable
              style={({ pressed, hovered }) => [
                styles.btnCliente,
                Platform.OS === 'web' && hovered && styles.btnClienteHovered,
                pressed && styles.btnClientePressed,
              ]}
              onPress={() => navigation.navigate('QRScanner')}
              disabled={loading}
            >
              <Text style={styles.btnClienteText}>Soy Cliente</Text>
              <Text style={styles.btnClienteSubtext}>Escanear código QR</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  centerWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        transition: 'all 0.2s ease',
      },
    }),
  },
  inputFocused: {
    borderColor: '#3b82f6',
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    }),
  },
  inputError: {
    borderColor: '#dc2626',
  },
  btnLogin: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  btnLoginHovered: {
    backgroundColor: '#2563eb',
    ...Platform.select({
      web: {
        transform: [{ translateY: -1 }],
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
    }),
  },
  btnLoginPressed: {
    opacity: 0.9,
    ...Platform.select({
      web: {
        transform: [{ translateY: 0 }],
      },
    }),
  },
  btnLoginDisabled: {
    backgroundColor: '#9ca3af',
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  btnLoginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    color: '#9ca3af',
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  btnCliente: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: 52,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  btnClienteHovered: {
    backgroundColor: '#f3f4f6',
    borderColor: '#3b82f6',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
      },
    }),
  },
  btnClientePressed: {
    backgroundColor: '#e5e7eb',
  },
  btnClienteText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  btnClienteSubtext: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '400',
  },
});
