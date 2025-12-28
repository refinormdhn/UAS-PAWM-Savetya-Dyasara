import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import Konfigurasi
import { supabase } from './src/services/supabase';
import { COLORS } from './src/config/theme';

// Import Components
import CustomSplashScreen from './src/components/CustomSplashScreen';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import QuizScreen from './src/screens/QuizScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator untuk authenticated users
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          elevation: 8,
          borderTopWidth: 0,
          backgroundColor: '#fff',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 5,
          marginBottom: 3,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'LearnTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'QuizTab') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="LearnTab"
        component={LearnScreen}
        options={{ tabBarLabel: 'Learn' }}
      />
      <Tab.Screen
        name="QuizTab"
        component={QuizScreen}
        options={{ tabBarLabel: 'Quiz' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glitchAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Initialize session and hide splash after minimum display time
    const initializeApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);

      // Show splash for 2.5 seconds normally
      setTimeout(() => {
        // Start very soft, slow glitch effect - logo and text together
        Animated.sequence([
          // Glitch 1: very slow gentle fade
          Animated.timing(glitchAnim, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true
          }),
          Animated.timing(glitchAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          }),

          // Long pause
          Animated.delay(500),

          // Glitch 2: medium soft fade
          Animated.timing(glitchAnim, {
            toValue: 0.15,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(glitchAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),

          // Long pause
          Animated.delay(600),

          // Glitch 3: very gentle fade
          Animated.timing(glitchAnim, {
            toValue: 0.5,
            duration: 550,
            useNativeDriver: true
          }),
          Animated.timing(glitchAnim, {
            toValue: 1,
            duration: 550,
            useNativeDriver: true
          }),

          // Pause
          Animated.delay(400),

          // Glitch 4: final very soft fade
          Animated.timing(glitchAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(glitchAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),

          // Short pause before final fade out
          Animated.delay(300),

          // Final smooth fade out
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true
          }),
        ]).start(() => {
          setShowSplash(false);
        });
      }, 2500);
    };

    initializeApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show custom splash screen
  if (showSplash) {
    return <CustomSplashScreen fadeAnim={fadeAnim} glitchAnim={glitchAnim} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session && session.user ? (
            // === AUTHENTICATED - Show Bottom Tabs ===
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            // === NOT AUTHENTICATED - Show Login ===
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}