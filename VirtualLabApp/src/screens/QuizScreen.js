import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, 
  Alert, ScrollView 
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../services/supabase';
import { COLORS } from '../config/theme';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TOPIC_NAMES = {
  1: "Engaging Your Audience",
  2: "Delivery Techniques",
  3: "Visual Aids & Body",
  4: "Handling Questions"
};

export default function QuizScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState({});
  const [availableTopics, setAvailableTopics] = useState([]);
  
  const [currentTopicId, setCurrentTopicId] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [quizFinished, setQuizFinished] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, []);

  async function fetchQuizData() {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const grouped = {};
      data.forEach(q => {
        if (!grouped[q.topic]) grouped[q.topic] = [];
        grouped[q.topic].push(q);
      });

      setQuizData(grouped);
      setAvailableTopics(Object.keys(grouped));
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data kuis: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const startQuiz = (topicId) => {
    setCurrentTopicId(topicId);
    setCurrentQuestions(quizData[topicId]);
    setCurrentIndex(0);
    setAnswers({});
    setQuizFinished(false);
    setScoreResult(null);
  };

  const handleSelectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: answer }));
  };

  const handleOrdering = (data) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: data }));
  };

  const handleNext = async () => {
    const currentQ = currentQuestions[currentIndex];
    const userAns = answers[currentIndex];

    if (!userAns || (currentQ.type === 'ordering' && userAns.length !== currentQ.options.length)) {
      Alert.alert("Tunggu!", "Silakan lengkapi jawaban sebelum melanjutkan.");
      return;
    }

    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    let correctCount = 0;
    const dbAnswers = [];

    const { data: { user } } = await supabase.auth.getUser();

    currentQuestions.forEach((q, idx) => {
      const userAns = answers[idx];
      let isCorrect = false;

      if (q.type === 'ordering') {
        isCorrect = JSON.stringify(userAns) === JSON.stringify(q.correct_answer || q.order_sequence);
      } else {
        const correctKey = Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer;
        isCorrect = userAns === correctKey;
      }

      if (isCorrect) correctCount++;

      if (user) {
        dbAnswers.push({
          user_id: user.id,
          question_id: q.id,
          is_correct: isCorrect
        });
      }
    });

    if (dbAnswers.length > 0) {
      await supabase.from('user_answers').insert(dbAnswers);
    }

    const percentage = Math.round((correctCount / currentQuestions.length) * 100);
    setScoreResult({
      score: percentage,
      correct: correctCount,
      total: currentQuestions.length
    });
    setQuizFinished(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (quizFinished && scoreResult) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.resultCard}>
          <Text style={styles.emoji}>
            {scoreResult.score >= 80 ? '🌟' : scoreResult.score >= 60 ? '😊' : '💪'}
          </Text>
          <Text style={styles.scoreText}>{scoreResult.score}%</Text>
          <Text style={styles.resultMsg}>
            {scoreResult.score >= 80 ? 'Excellent!' : 'Good Job! Keep Learning.'}
          </Text>
          
          <View style={styles.statBox}>
             <Text>✅ Correct: {scoreResult.correct}</Text>
             <Text>❌ Wrong: {scoreResult.total - scoreResult.correct}</Text>
          </View>

          <TouchableOpacity 
            style={styles.btnPrimary} 
            onPress={() => {
              setQuizFinished(false);
              setCurrentTopicId(null);
            }}
          >
            <Text style={styles.btnText}>Back to Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentTopicId) {
    const q = currentQuestions[currentIndex];

    // Initialize answers for ordering question if not already set
    if (q.type === 'ordering' && !answers[currentIndex]) {
      setAnswers(prev => ({...prev, [currentIndex]: q.options}));
    }

    const renderItem = ({ item, drag, isActive }) => {
      return (
        <ScaleDecorator>
          <TouchableOpacity
            onLongPress={drag}
            disabled={isActive}
            style={[
              styles.orderItem,
              { 
                backgroundColor: isActive ? '#E3F6F5' : '#fff',
                elevation: isActive ? 4 : 2,
              }
            ]}
          >
            <View style={styles.orderItemContent}>
              <Ionicons name="reorder-three-outline" size={24} color="#999" style={{marginRight: 10}} />
              <Text style={styles.orderText}>{item}</Text>
            </View>
          </TouchableOpacity>
        </ScaleDecorator>
      );
    };

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.progressText}>
              Question {currentIndex + 1} of {currentQuestions.length}
            </Text>

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{q.question}</Text>

              <View style={styles.optionsContainer}>
                {q.type === 'ordering' ? (
                  <>
                    <Text style={styles.instruction}>
                      Drag dan drop untuk mengurutkan jawaban yang benar:
                    </Text>
                    
                    <DraggableFlatList
                      data={answers[currentIndex] || []}
                      onDragEnd={({ data }) => handleOrdering(data)}
                      keyExtractor={(item) => item}
                      renderItem={renderItem}
                      containerStyle={{ overflow: 'visible' }}
                    />
                  </>
                ) : (
                  q.options.map((opt, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.optionButton,
                        answers[currentIndex] === opt && styles.optionSelected,
                      ]}
                      onPress={() => handleSelectAnswer(q.id, opt)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          answers[currentIndex] === opt &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleNext}>
              <Text style={styles.btnText}>
                {currentIndex === currentQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Text>
            </TouchableOpacity>
          
          </ScrollView>
        </SafeAreaView>
      </GestureHandlerRootView>
      );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.headerTitle}>Select Quiz Topic</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {availableTopics.map((topicId) => (
          <TouchableOpacity 
            key={topicId} 
            style={styles.topicCard} 
            onPress={() => startQuiz(topicId)}
          >
            <View style={styles.iconBox}>
              <Ionicons name="school" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.topicTitle}>{TOPIC_NAMES[topicId] || `Topic ${topicId}`}</Text>
              <Text style={styles.topicSubtitle}>{quizData[topicId].length} Questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
        ))}
        {availableTopics.length === 0 && <Text>No quizzes available.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', margin: 20, color: COLORS.secondary },
  topicCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F6F5',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  topicTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.secondary },
  topicSubtitle: { color: '#888', fontSize: 12 },
  progressText: { textAlign: 'center', color: '#888', marginBottom: 10 },
  questionCard: {
    backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3, marginBottom: 20
  },
  questionText: { fontSize: 18, fontWeight: 'bold', color: COLORS.secondary, marginBottom: 20 },
  instruction: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 15,
    fontWeight: '600',
    textAlign: 'center'
  },
  optionsContainer: { gap: 10 },
  optionButton: {
    padding: 15, borderRadius: 10, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd'
  },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 16, color: '#333', flex: 1, marginLeft: 8 },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },

  // Ordering Question Styles (IMPROVED)
  orderBox: {
    minHeight: 120,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed'
  },
  orderBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderText: {
    fontWeight: '600',
    color: COLORS.secondary,
    flex: 1,
    fontSize: 15,
  },
  emptyOrderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyOrderText: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  availableOptionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  optionList: {
    gap: 10,
  },
  availableOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'solid',
  },
  allSelectedText: {
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
    paddingVertical: 10,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary, padding: 15, borderRadius: 50, alignItems: 'center', elevation: 3
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultCard: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30
  },
  emoji: { fontSize: 80, marginBottom: 20 },
  scoreText: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary },
  resultMsg: { fontSize: 20, color: COLORS.secondary, marginBottom: 30 },
  statBox: { marginBottom: 40, alignItems: 'center' }
});