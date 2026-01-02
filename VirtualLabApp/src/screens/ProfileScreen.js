import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { COLORS } from '../config/theme';
import { useFocusEffect } from '@react-navigation/native';

const TOPIC_NAMES = {
  1: "Engaging Your Audience",
  2: "Delivery Techniques",
  3: "Visual Aids & Body",
  4: "Handling Questions"
};

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [recentQuiz, setRecentQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  async function loadUserData() {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      console.log('Current User:', currentUser?.email);

      if (currentUser) {
        const { data: userAnswers, error: answersError } = await supabase
          .from('user_answers')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('id', { ascending: true });

        console.log('Answers Error:', answersError);
        console.log('Total User Answers:', userAnswers?.length);

        if (answersError) {
          console.error('Error fetching answers:', answersError);
          setTotalAttempts(0);
          setRecentQuiz(null);
          setLoading(false);
          return;
        }

        if (!userAnswers || userAnswers.length === 0) {
          console.log('No quiz data found');
          setTotalAttempts(0);
          setRecentQuiz(null);
          setLoading(false);
          return;
        }

        const questionIds = [...new Set(userAnswers.map(a => a.question_id))];
        const { data: questions, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('id, topic')
          .in('id', questionIds);

        console.log('Questions Error:', questionsError);
        console.log('Total Questions:', questions?.length);

        if (questionsError || !questions) {
          console.error('Error fetching questions:', questionsError);
          setTotalAttempts(0);
          setRecentQuiz(null);
          setLoading(false);
          return;
        }

        const questionTopicMap = {};
        questions.forEach(q => {
          questionTopicMap[q.id] = q.topic;
        });

        // Group answers by session (berdasarkan question_id yang berurutan)
        const sessions = [];
        let currentSession = [];
        let lastQuestionId = null;

        userAnswers.forEach((answer, index) => {
          const currentQuestionId = answer.question_id;
          const currentTopic = questionTopicMap[currentQuestionId];

          // Jika question_id tidak berurutan atau topic berbeda, anggap session baru
          if (lastQuestionId !== null &&
              (currentQuestionId <= lastQuestionId ||
               questionTopicMap[lastQuestionId] !== currentTopic)) {
            if (currentSession.length > 0) {
              sessions.push([...currentSession]);
              currentSession = [];
            }
          }

          currentSession.push(answer);
          lastQuestionId = currentQuestionId;

          // Session terakhir
          if (index === userAnswers.length - 1 && currentSession.length > 0) {
            sessions.push(currentSession);
          }
        });

        console.log('Total Quiz Sessions:', sessions.length);
        setTotalAttempts(sessions.length);

        // Get most recent quiz (session terakhir)
        if (sessions.length > 0) {
          const lastSession = sessions[sessions.length - 1];
          const lastQuestionId = lastSession[0].question_id;
          const lastTopic = questionTopicMap[lastQuestionId];

          const correctCount = lastSession.filter(a => a.is_correct).length;
          const totalQuestions = lastSession.length;
          const score = Math.round((correctCount / totalQuestions) * 100);

          setRecentQuiz({
            topicName: TOPIC_NAMES[lastTopic] || `Topic ${lastTopic}`,
            score: score
          });
          console.log('Most Recent Quiz:', { topic: lastTopic, score, totalQuestions, session: lastSession.length });
        } else {
          setRecentQuiz(null);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/images/profile.png')}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Quiz Statistics</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="list-outline" size={28} color="#9C27B0" />
              </View>
              <Text style={styles.infoCardTitle}>Total Quiz Attempts</Text>
            </View>
            <View style={styles.infoCardContent}>
              <Text style={styles.totalQuizNumber}>{totalAttempts}</Text>
              <Text style={styles.totalQuizLabel}>
                {totalAttempts === 1 ? 'Quiz Attempt' : 'Quiz Attempts'}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="time-outline" size={28} color="#2196F3" />
              </View>
              <Text style={styles.infoCardTitle}>Most Recent Quiz</Text>
            </View>
            {recentQuiz ? (
              <View style={styles.infoCardContent}>
                <Text style={styles.infoTopicName}>{recentQuiz.topicName}</Text>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreText}>Score: </Text>
                  <Text style={[styles.scoreValue, { color: recentQuiz.score >= 60 ? '#27AE60' : '#E74C3C' }]}>
                    {recentQuiz.score}%
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No quiz taken yet</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
    flex: 1,
  },
  infoCardContent: {
    paddingLeft: 10,
  },
  infoTopicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    color: '#666',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalQuizNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  totalQuizLabel: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    marginBottom: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
  },
});
