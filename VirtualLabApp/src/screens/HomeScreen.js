import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config/theme';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* === 1. HEADER === */}
        <View style={styles.navContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* === 2. HERO SECTION === */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Elevate your voice, <Text style={styles.highlight}>master</Text> the art of presentation
          </Text>

          <Text style={styles.creator}>by Savetya Dyasara</Text>

          <Text style={styles.heroDescription}>
            Master the art of presentation and public speaking.
            Savetya Dyasara helps you build confidence, sharpen your communication skills,
            and deliver impactful messages that truly connect with your audience.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('LearnTab')}
          >
            <Text style={styles.ctaButtonText}>Start Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: COLORS.secondary, marginTop: -15 }]}
            onPress={() => navigation.navigate('QuizTab')}
          >
            <Text style={styles.ctaButtonText}>Take a Quiz</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/home.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* === 3. FOOTER === */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Master your presentation skills with Savetya Dyasara
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  navContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoImage: {
    width: 150,
    height: 50,
  },
  heroSection: {
    padding: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  highlight: {
    color: COLORS.primary,
  },
  creator: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  heroDescription: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    elevation: 3,
    marginBottom: 30,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
  },
  footer: {
    marginTop: 'auto',
    padding: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
});
