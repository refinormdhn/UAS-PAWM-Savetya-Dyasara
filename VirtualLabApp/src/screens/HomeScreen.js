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
        
        {/* === HERO SECTION === */}
        {/* Tanpa Logo Header, langsung masuk ke konten */}
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
    // Tambahkan sedikit padding atas agar judul tidak terlalu mepet status bar
    paddingTop: 20, 
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
});