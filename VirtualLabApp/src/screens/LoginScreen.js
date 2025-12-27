import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, Image, ActivityIndicator 
} from 'react-native';
import { supabase } from '../services/supabase'; // Sesuaikan path jika pakai src/lib
import { COLORS, SIZES } from '../config/theme';
import * as WebBrowser from 'expo-web-browser'; // Browser in-app
import { makeRedirectUri } from 'expo-auth-session'; // Helper URL

// Wajib untuk menangani redirect browser
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // === 1. LOGIN EMAIL BIASA ===
  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan Password harus diisi!');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);
    if (error) Alert.alert('Login Gagal', error.message);
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      console.log('🚀 Starting Google OAuth...');

      // ⚠️ GANTI BAGIAN INI DENGAN URL DARI TERMINAL ANDA ⚠️
      // Contoh: "exp://192.168.1.58:8081" (Tanpa /--/auth/callback)
      // JANGAN PAKAI localhost. Pakai angka IP.
      const redirectUrl = "exp://192.168.1.58:8081"; 

      console.log('👉 URL Redirect Manual:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl, 
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL generated');

      console.log('🌐 Opening auth session...');
      
      // Buka Browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl 
      );

      // Log hasil browser untuk debugging
      console.log('🔙 Result Browser:', result);

      if (result.type === 'success' && result.url) {
        const params = new URLSearchParams(result.url.split('#')[1] || result.url.split('?')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
          console.log('✅ Login successful!');
        }
      }
    } catch (err) {
      console.error('❌ Error:', err);
      Alert.alert('Login Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/login.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue to Virtual Lab</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* PEMBATAS "OR" */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* TOMBOL GOOGLE */}
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink}>
          <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666' },
  form: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: SIZES.borderRadius,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  label: { marginBottom: 5, color: COLORS.text, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  
  // Styles Tambahan untuk Google & Divider
  dividerContainer: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 20
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { marginHorizontal: 10, color: '#888', fontWeight: 'bold' },
  
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  
  footerLink: { marginTop: 20, alignItems: 'center' },
  linkText: { color: COLORS.primary, fontWeight: '500' },
});