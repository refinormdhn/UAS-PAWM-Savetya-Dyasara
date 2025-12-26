import React, { useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  FlatList, Linking, TextInput 
} from 'react-native'; // ❌ Hapus SafeAreaView dari sini

// ✅ Import SafeAreaView dari library yang benar
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../config/theme';
import { Ionicons } from '@expo/vector-icons'; 

// === DATA MATERI ===
const materialsData = [
  {
    id: 1,
    title: "Engaging Your Audience & Drafting Openers",
    type: "pdf",
    category: "Foundation",
    image: require('../../assets/images/home.png'), 
    description: "Learn how to hook your audience from the very first second.",
    // 👇 Ganti link ini dengan Link PDF Publik dari Supabase Storage Anda nanti
    link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", 
  },
  {
    id: 2,
    title: "Delivery Techniques",
    type: "video",
    category: "Delivery",
    image: require('../../assets/images/home.png'),
    description: "Mastering voice, tone, and pacing for impactful speech.",
    link: "https://www.youtube.com/watch?v=Unzc731iCUY", 
  },
  {
    id: 3,
    title: "Visual Aids & Drafting Body",
    type: "pdf",
    category: "Visuals",
    image: require('../../assets/images/home.png'),
    description: "How to create slides that support, not distract.",
    // 👇 Contoh Link PDF placeholder
    link: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: 4,
    title: "Handling Questions",
    type: "video",
    category: "Q&A",
    image: require('../../assets/images/home.png'),
    description: "Strategies to handle tough questions with confidence.",
    link: "https://www.youtube.com/watch?v=ad79nYk2keg", 
  },
];

export default function LearnScreen() {
  const [filter, setFilter] = useState('All'); 
  const [search, setSearch] = useState('');    

  const filteredMaterials = materialsData.filter(item => {
    const matchType = filter === 'All' || item.type.toLowerCase() === filter.toLowerCase();
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Fungsi Buka Materi (Universal: Video & PDF Online)
  const handleOpenMaterial = async (item) => {
    if (item.link) {
      // Cek apakah link bisa dibuka
      const supported = await Linking.canOpenURL(item.link);
      
      if (supported) {
        // Membuka Browser / Youtube / PDF Viewer bawaan HP
        await Linking.openURL(item.link);
      } else {
        alert(`Tidak dapat membuka link: ${item.link}`);
      }
    } else {
      alert("Link materi belum tersedia.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
      
      <View style={styles.cardContent}>
        <View style={styles.badgeContainer}>
          <Text style={[styles.badge, item.type === 'video' ? styles.badgeVideo : styles.badgePdf]}>
            {item.type.toUpperCase()}
          </Text>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

        <TouchableOpacity 
          style={styles.readButton}
          onPress={() => handleOpenMaterial(item)}
        >
          <Text style={styles.readButtonText}>
            {item.type === 'video' ? 'Watch Video' : 'Read Module'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Center</Text>
        <Text style={styles.headerSubtitle}>Upgrade your skills today</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={{marginRight: 10}} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search topics..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        {['All', 'Video', 'PDF'].map((type) => (
          <TouchableOpacity 
            key={type}
            style={[styles.filterChip, filter === type && styles.activeChip]}
            onPress={() => setFilter(type)}
          >
            <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMaterials}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{color: '#888'}}>No materials found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: '#666',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgeVideo: { backgroundColor: '#FFE5E5', color: '#D93025' },
  badgePdf: { backgroundColor: '#E3F2FD', color: '#1976D2' },
  categoryText: {
    fontSize: 12,
    color: '#888',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  readButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  readButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    marginRight: 5,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  }
});