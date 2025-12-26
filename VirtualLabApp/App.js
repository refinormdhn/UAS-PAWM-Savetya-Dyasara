import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

// Import Konfigurasi
import { supabase } from './src/services/supabase';
import { COLORS } from './src/config/theme';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import QuizScreen from './src/screens/QuizScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {session && session.user ? (
          // === JIKA SUDAH LOGIN ===
          // Gunakan Fragment (<>...</>) untuk mengelompokkan beberapa layar
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            
            {/* Layar Learn (Materi) */}
            <Stack.Screen 
              name="Learn" 
              component={LearnScreen} 
              options={{ 
                headerShown: true, // Kita butuh header agar ada tombol "Back"
                title: 'Learning Materials',
                headerTintColor: COLORS.secondary,
            }} 
            />
            <Stack.Screen 
            name="Quiz" 
            component={QuizScreen} 
            options={{ 
                headerShown: true, 
                title: 'Quiz Challenge',
                headerTintColor: COLORS.secondary 
            }} 
            />
          </>
        ) : (
          // === JIKA BELUM LOGIN ===
          <Stack.Screen name="Login" component={LoginScreen} />
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}