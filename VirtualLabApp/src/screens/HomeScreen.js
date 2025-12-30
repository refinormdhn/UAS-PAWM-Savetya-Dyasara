import React from 'react';
import { 
  View, Text, ImageBackground, TouchableOpacity, StyleSheet, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../config/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* === 1. HERO HEADER (Gaya Quiz Blue) === */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/home.png')}
            style={styles.heroBackground}
            imageStyle={styles.heroImageStyle}
          >
            {/* Overlay Biru Transparan */}
            <View style={styles.heroOverlay}>
              {/* Teks Putih Bersih & Rata Tengah */}
              <Text style={styles.heroTitle}>
                Elevate your voice, master the art of presentation
              </Text>
              <Text style={styles.heroSubtitle}>
                Build confidence and deliver impactful messages with Savetya Dyasara.
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* === 2. BODY CONTENT (Tombol Kartu) === */}
        <View style={styles.bodyContainer}>
          
          <Text style={styles.sectionTitle}>Let's Start!</Text>
          <Text style={styles.sectionSubtitle}>Choose your activity below</Text>

          {/* TOMBOL 1: LEARNING */}
          <TouchableOpacity 
            style={[styles.actionCard, styles.cardLearn]}
            onPress={() => navigation.navigate('LearnTab')}
            activeOpacity={0.9}
          >
            <View style={styles.cardIconBox}>
              <Ionicons name="book" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Start Learning</Text>
              <Text style={styles.cardDesc}>Access modules, videos & guides</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          {/* TOMBOL 2: QUIZ */}
          <TouchableOpacity 
            style={[styles.actionCard, styles.cardQuiz]}
            onPress={() => navigation.navigate('QuizTab')}
            activeOpacity={0.9}
          >
            <View style={[styles.cardIconBox, styles.iconBoxQuiz]}>
              <Ionicons name="trophy" size={32} color={COLORS.white} />
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, styles.textWhite]}>Take a Quiz</Text>
              <Text style={[styles.cardDesc, styles.textWhiteDesc]}>Test your skills & knowledge</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // === HEADER STYLES (Updated to Blue Quiz Style) ===
  headerContainer: {
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    backgroundColor: '#fff',
    height: 250,
  },
  heroBackground: {
    width: '100%',
    height: '100%', 
  },
  heroOverlay: {
    flex: 1,
    // 👇 INI KUNCINYA: Overlay Biru Transparan
    backgroundColor: 'rgba(20, 60, 120, 0.85)', 
    justifyContent: 'center', // Teks ke tengah vertikal
    alignItems: 'center',     // Teks ke tengah horizontal
    padding: 30,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff', // Putih bersih
    textAlign: 'center', // Rata tengah
    marginBottom: 15,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)', // Putih agak transparan dikit
    textAlign: 'center', // Rata tengah
    lineHeight: 22,
  },

  // === BODY STYLES ===
  bodyContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },

  // === CARD STYLES ===
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardLearn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardQuiz: {
    backgroundColor: COLORS.secondary,
  },
  cardIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F6F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconBoxQuiz: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
  },
  textWhite: {
    color: '#fff',
  },
  textWhiteDesc: {
    color: 'rgba(255,255,255,0.8)',
  },
});