import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, 
  Alert, ScrollView 
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../services/supabase';
import { COLORS } from '../config/theme';
import { Ionicons } from '@expo/vector-icons';

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

  const handleOrdering = (option, action) => {
    const currentAns = answers[currentIndex] || [];
    
    if (action === 'add') {
      setAnswers(prev => ({ ...prev, [currentIndex]: [...currentAns, option] }));
    } else {
      const newAns = currentAns.filter(item => item !== option);
      setAnswers(prev => ({ ...prev, [currentIndex]: newAns }));
    }
  };

  const handleNext = async () => {
    const currentQ = currentQuestions[currentIndex];
    const userAns = answers[currentIndex];

    if (!userAns || (currentQ.type === 'ordering' && userAns.length !== currentQ.options.length)) {
      Alert.alert("Hold on!", "Please complete the answer before continuing.");
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
    
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {currentQuestions.length}
          </Text>
          
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>{q.question}</Text>

            <View style={styles.optionsContainer}>
              {q.type === 'ordering' ? (
                <>
                  <Text style={styles.instruction}>Tap options in the correct order:</Text>
                  
                  <View style={styles.orderBox}>
                     {(answers[currentIndex] || []).map((ans, i) => (
                       <TouchableOpacity key={i} onPress={() => handleOrdering(ans, 'remove')} style={styles.orderItem}>
                         <Text style={styles.orderText}>{i+1}. {ans}</Text>
                         <Ionicons name="close-circle" size={20} color="red" />
                       </TouchableOpacity>
                     ))}
                     {(!answers[currentIndex] || answers[currentIndex].length === 0) && 
                        <Text style={{color:'#999', fontStyle:'italic'}}>Tap options below to fill here...</Text>
                     }
                  </View>

                  <View style={styles.optionList}>
                    {q.options.map((opt, i) => {
                      const isSelected = (answers[currentIndex] || []).includes(opt);
                      if (isSelected) return null;
                      return (
                        <TouchableOpacity key={i} style={styles.optionButton} onPress={() => handleOrdering(opt, 'add')}>
                          <Text style={styles.optionText}>{opt}</Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                </>
              ) : (
                q.options.map((opt, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[
                      styles.optionButton, 
                      answers[currentIndex] === opt && styles.optionSelected
                    ]} 
                    onPress={() => handleSelectAnswer(q.id, opt)}
                  >
                    <Text style={[
                      styles.optionText,
                      answers[currentIndex] === opt && styles.optionTextSelected
                    ]}>{opt}</Text>
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
  instruction: { fontSize: 14, color: COLORS.primary, marginBottom: 10, fontStyle:'italic' },
  optionsContainer: { gap: 10 },
  optionButton: {
    padding: 15, borderRadius: 10, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd'
  },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 16, color: '#333' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  orderBox: { 
    minHeight: 50, backgroundColor: '#E3F6F5', borderRadius: 8, padding: 10, marginBottom: 20,
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed'
  },
  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 5, elevation: 1
  },
  orderText: { fontWeight: '600', color: COLORS.secondary },
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