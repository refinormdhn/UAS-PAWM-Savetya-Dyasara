import React, { useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  FlatList, Linking, TextInput, Modal, ImageBackground 
} from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../config/theme';
import { Ionicons } from '@expo/vector-icons'; 
import YoutubePlayer from "react-native-youtube-iframe";

const getYoutubeId = (url) => {
  if (!url) return null;
  const regex = /(?:embed\/|v=|youtu\.be\/)([^&?]*)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const materialsData = [
  {
    id: 1,
    title: "Engaging Your Audience & Drafting Openers",
    category: "Foundation",
    image: require('../../assets/images/audience_engagement.jpg'), 
    description: "Learn how to hook your audience from the very first second.",
    videoUrls: ["https://www.youtube.com/embed/oTe4f-bBEKg"], 
    pdfUrl: "https://zvkelfhmrjfvveembihp.supabase.co/storage/v1/object/public/materi/Engaging-Your-Audience-and-Drafting-Openers.pdf", 
  },
  {
    id: 2,
    title: "Delivery Techniques",
    category: "Delivery",
    image: require('../../assets/images/presentation_delivery.jpg'),
    description: "Mastering voice, tone, and pacing for impactful speech.",
    videoUrls: ["https://www.youtube.com/embed/NiKtZgImdlY"],
    pdfUrl: "https://zvkelfhmrjfvveembihp.supabase.co/storage/v1/object/public/materi/Delivery-Techniques--Drafting-Conclusion-and-Writing-a-Process.pdf", 
  },
  {
    id: 3,
    title: "Visual Aids & Drafting Body",
    category: "Visuals",
    image: require('../../assets/images/visual_aids.jpg'),
    description: "How to create slides that support, not distract.",
    videoUrls: [
      "https://www.youtube.com/embed/V8eLdbKXGzk", 
      "https://www.youtube.com/embed/Y1qDNTG9lg0"
    ],
    pdfUrl: "https://zvkelfhmrjfvveembihp.supabase.co/storage/v1/object/public/materi/Visual-Aids-and-Drafting-Body-of-Presentation.pdf",
  },
  {
    id: 4,
    title: "Handling Questions",
    category: "Q&A",
    image: require('../../assets/images/handling_questions.jpg'),
    description: "Strategies to handle tough questions with confidence.",
    videoUrls: [], 
    pdfUrl: "https://zvkelfhmrjfvveembihp.supabase.co/storage/v1/object/public/materi/Handling-Questions-and-Body-Language.pdf",
  },
];

export default function LearnScreen() {
  const [filter, setFilter] = useState('All'); 
  const [search, setSearch] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState(null);

  const filteredMaterials = materialsData.filter(item => {
    let matchType = true;
    if (filter === 'Video') matchType = item.videoUrls.length > 0;
    if (filter === 'Document') matchType = !!item.pdfUrl;
    
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleOpenPdf = async (url) => {
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else alert(`Tidak dapat membuka link: ${url}`);
    } else {
      alert("PDF belum tersedia.");
    }
  };

  const handleWatchVideo = (url) => {
    const videoId = getYoutubeId(url);
    if (videoId) {
      setPlayingVideoId(videoId);
      setModalVisible(true);
    } else {
      alert("Link video rusak atau tidak dikenali.");
    }
  };

  const renderHeader = () => (
    <View>
      <View style={styles.introSection}>
        <ImageBackground
          source={require('../../assets/images/learning-center.jpg')} 
          style={styles.introImage}
          resizeMode="cover"
        >
          <View style={styles.introOverlay}>
            <Text style={styles.introTitle}>Expand Your</Text>
            <Text style={styles.introSubtitle}>Knowledge Base</Text>
            <Text style={styles.introDescription}>
              Access curated videos, modules, and materials to master public speaking and presentation skills.
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6d6a6aff" style={{marginRight: 10}} />
        
        <TextInput 
          style={styles.searchInput}
          placeholder="Search topics..."
          placeholderTextColor="#6d6a6aff" 
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        {['All', 'Video', 'Document'].map((type) => (
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
    </View>
  );

  const renderItem = ({ item }) => {
    const showVideo = (filter === 'All' || filter === 'Video') && item.videoUrls.length > 0;
    
    const showPdf = (filter === 'All' || filter === 'Document') && item.pdfUrl;

    return (
      <View style={styles.card}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
        
        <View style={styles.cardContent}>
          <View style={styles.badgeContainer}>
            <Text style={styles.categoryBadge}>{item.category}</Text>
          </View>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.actionRow}>
            {showVideo && item.videoUrls.map((url, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.actionButton, styles.btnVideo]}
                onPress={() => handleWatchVideo(url)}
              >
                <Ionicons name="play-circle" size={18} color="white" style={{marginRight:5}} />
                <Text style={styles.btnText}>
                  {item.videoUrls.length > 1 ? `Watch Part ${index + 1}` : 'Watch'}
                </Text>
              </TouchableOpacity>
            ))}

            {showPdf && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.btnPdf]}
                onPress={() => handleOpenPdf(item.pdfUrl)}
              >
                <Ionicons name="document-text" size={18} color="white" style={{marginRight:5}} />
                <Text style={styles.btnText}>Read Document</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Now Playing</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <YoutubePlayer
              height={220}
              play={true}
              videoId={playingVideoId}
              onChangeState={(event) => {
                if (event === "ended") setModalVisible(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredMaterials}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  introSection: {
    height: 250,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff', 
    elevation: 5,
  },
  introImage: {
    width: '100%',
    height: '100%',
  },
  introOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 105, 141, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  introSubtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  introDescription: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  searchContainer: {
    flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: 20,
    marginTop: 0, padding: 10, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: '#eee',
    elevation: 2,
  },
  searchInput: { flex: 1, color: '#333' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 20 },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20,
    backgroundColor: '#fff', marginRight: 10, borderWidth: 1, borderColor: '#ddd',
  },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: '#666', fontWeight: '600' },
  activeFilterText: { color: '#fff' },

  listContent: { paddingBottom: 40 }, 
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 20,
    marginHorizontal: 20, 
    overflow: 'hidden', elevation: 3, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardImage: { width: '100%', height: 150 },
  cardContent: { padding: 15 },
  badgeContainer: { marginBottom: 10 },
  categoryBadge: { 
    alignSelf: 'flex-start', backgroundColor: '#E3F6F5', color: COLORS.primary,
    fontSize: 12, fontWeight: 'bold', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 15, lineHeight: 20 },
  actionRow: { 
    flexDirection: 'row', gap: 8, flexWrap: 'wrap' 
  },
  actionButton: {
    flexGrow: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, minWidth: '30%'
  },
  btnVideo: { backgroundColor: '#FF4D4D' },
  btnPdf: { backgroundColor: COLORS.primary },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    width: '90%', backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', paddingBottom: 10
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee'
  },
  modalTitle: { fontWeight: 'bold', fontSize: 16 },
});