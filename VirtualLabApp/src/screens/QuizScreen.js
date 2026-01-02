import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, ScrollView, Image, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { COLORS } from '../config/theme';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView, GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const TOPIC_NAMES = {
  1: "Engaging Your Audience",
  2: "Delivery Techniques",
  3: "Visual Aids & Body",
  4: "Handling Questions"
};
const TOPIC_IMAGES = {
  1: require('../../assets/images/audience_engagement.jpg'),
  2: require('../../assets/images/presentation_delivery.jpg'),
  3: require('../../assets/images/visual_aids.jpg'),
  4: require('../../assets/images/handling_questions.jpg')
};
const getScoreMessage = (score) => {
  if (score === 0) {
    return "Feel free to revise the material again to improve your score!";
  } else if (score < 40) {
    return "Don't give up, try again!";
  } else if (score < 60) {
    return "A bit more practice and you'll do great!";
  } else if (score < 80) {
    return "You're doing great, keep it up!";
  } else if (score < 100) {
    return "Excellent work! You've mastered most of the material!";
  } else {
    return "Congratulations on your perfect score!!";
  }
};

const getScoreColor = (score) => {
  if (score < 40) return '#E74C3C';
  if (score < 60) return '#F39C12';
  if (score < 80) return '#F1C40F';
  return '#27AE60';
};

const DraggableOption = ({ item, onDrop, dropZoneLayout }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      isDragging.value = false;

      if (
        dropZoneLayout &&
        event.absoluteX >= dropZoneLayout.pageX &&
        event.absoluteX <= dropZoneLayout.pageX + dropZoneLayout.width &&
        event.absoluteY >= dropZoneLayout.pageY &&
        event.absoluteY <= dropZoneLayout.pageY + dropZoneLayout.height
      ) {
        runOnJS(onDrop)(item);
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withSpring(isDragging.value ? 1.05 : 1) },
      ],
      zIndex: isDragging.value ? 9999 : 1,
      elevation: isDragging.value ? 10 : 0,
      opacity: isDragging.value ? 0.9 : 1,
    };
  });

  return (
    <View style={{ zIndex: 1 }}> 
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.availableOptionItem, animatedStyle]}>
          <View style={styles.orderItemContent}>
            <Ionicons name="apps-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.availableOptionText}>{item}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
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

  const dropZoneRef = useRef(null);
  const [dropZoneLayout, setDropZoneLayout] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, []);

  useEffect(() => {
    if (currentTopicId) {
      const q = currentQuestions[currentIndex];
      if (q && q.type === 'ordering' && !answers[currentIndex]) {
        setAnswers(prev => ({...prev, [currentIndex]: q.options}));
      }
    }
  }, [currentIndex, currentTopicId]);

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

  const handleDragAnswer = (item) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: item }));
  };

  const measureDropZone = () => {
    if (dropZoneRef.current) {
      dropZoneRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropZoneLayout({ x, y, width, height, pageX, pageY });
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = async () => {
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
          user_answer: userAns ? (typeof userAns === 'object' ? JSON.stringify(userAns) : userAns) : null,
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
    const scoreColor = getScoreColor(scoreResult.score);
    const scoreMessage = getScoreMessage(scoreResult.score);

    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.resultCard}>
          <AnimatedCircularProgress
            size={220}
            width={20}
            fill={scoreResult.score}
            tintColor={scoreColor}
            backgroundColor="#E8E8E8"
            rotation={0}
            lineCap="round"
            duration={1500}
          >
            {() => (
              <View style={styles.scoreCircleContent}>
                <Text style={[styles.scorePercentage, { color: scoreColor }]}>
                  {scoreResult.score}%
                </Text>
                <Text style={styles.scoreLabel}>Your Score</Text>
              </View>
            )}
          </AnimatedCircularProgress>
          <Text style={styles.resultMessage}>{scoreMessage}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#D4EDDA' }]}>
                <Ionicons name="checkmark-circle" size={32} color="#27AE60" />
              </View>
              <Text style={styles.statNumber}>{scoreResult.correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBox, { backgroundColor: '#F8D7DA' }]}>
                <Ionicons name="close-circle" size={32} color="#E74C3C" />
              </View>
              <Text style={styles.statNumber}>{scoreResult.total - scoreResult.correct}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
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
    const selectedAnswer = answers[currentIndex];

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
          <View style={{ flex: 1, padding: 20 }}>
            <Text style={styles.progressText}>
              Question {currentIndex + 1} of {currentQuestions.length}
            </Text>

            <View style={[styles.questionCard, { flex: 1 }]}>
              <Text style={styles.questionText}>{q.question}</Text>

              {q.type === 'ordering' ? (
                <DraggableFlatList
                  data={answers[currentIndex] || []}
                  onDragEnd={({ data }) => setAnswers(prev => ({...prev, [currentIndex]: data}))}
                  keyExtractor={(item) => item}
                  renderItem={({ item, drag, isActive }) => (
                    <ScaleDecorator>
                      <TouchableOpacity onLongPress={drag} style={[styles.orderItem, { backgroundColor: isActive ? '#E3F6F5' : '#fff' }]}>
                        <Ionicons name="reorder-three" size={24} color="#999" style={{marginRight: 10}} />
                        <Text style={styles.orderText}>{item}</Text>
                      </TouchableOpacity>
                    </ScaleDecorator>
                  )}
                />
              ) : (
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropZoneTitle}>Drag your answer and Drop them here: </Text>
                  <View
                    ref={dropZoneRef}
                    onLayout={measureDropZone}
                    style={styles.dropZone}
                  >
                    {selectedAnswer ? (
                      <TouchableOpacity onPress={() => handleDragAnswer(null)} style={styles.droppedItem}>
                        <Text style={styles.droppedItemText}>{selectedAnswer}</Text>
                        <Ionicons name="close-circle" size={24} color="#E74C3C" />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.emptyDropZone}>
                        <Text style={styles.dropZonePlaceholder}>Drag one option here</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1, marginTop: 20, zIndex: 9999, elevation: 10 }}>
                    <Text style={styles.availableOptionsTitle}>Select one of these options:</Text>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ overflow: 'visible' }} contentContainerStyle={{ paddingBottom: 50 }}>
                      {q.options.filter(opt => opt !== selectedAnswer).map((item) => (
                        <DraggableOption
                          key={item}
                          item={item}
                          onDrop={handleDragAnswer}
                          dropZoneLayout={dropZoneLayout}
                        />
                      ))}
                    </ScrollView>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.navigationButtons}>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.btnSecondary, { flex: 1 }]}
                  onPress={handlePrevious}
                >
                  <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                  <Text style={styles.btnSecondaryText}>Previous</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.btnPrimary, { flex: 1 }]}
                onPress={handleNext}
              >
                <Text style={styles.btnText}>
                  {currentIndex === currentQuestions.length - 1 ? 'Submit Quiz' : 'Next Question'}
                </Text>
                {currentIndex < currentQuestions.length - 1 && (
                  <Ionicons name="chevron-forward" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
      );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introSection}>
          <Image
            source={require('../../assets/images/dive_into_quiz.png')}
            style={styles.introImage}
            resizeMode="cover"
          />
          <View style={styles.introOverlay}>
            <Text style={styles.introTitle}>Dive into a World of</Text>
            <Text style={styles.introSubtitle}>Endless Trivia Fun</Text>
            <Text style={styles.introDescription}>
              Get ready to challenge yourself by filling out these quizzes and find out how well you master each topic!
            </Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Let's Start the Game!</Text>
        {availableTopics.map((topicId) => (
          <TouchableOpacity
            key={topicId}
            style={styles.topicCard}
            onPress={() => startQuiz(topicId)}
          >
            <Image
              source={TOPIC_IMAGES[topicId]}
              style={styles.topicImage}
              resizeMode="cover"
            />
            <View style={styles.topicOverlay}>
              <View style={styles.topicContent}>
                <Text style={styles.topicTitle}>{TOPIC_NAMES[topicId] || `Topic ${topicId}`}</Text>
                <Text style={styles.topicSubtitle}>{quizData[topicId].length} Questions</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
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
  scrollContent: { paddingBottom: 20 },
  quizScrollContent: { padding: 20 },
  introSection: {
    height: 250,
    marginBottom: 20,
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
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

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
    paddingHorizontal: 20,
  },

  topicCard: {
    height: 140,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topicImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topicOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  topicSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
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
  optionsScrollContainer: {
    maxHeight: 300,
  },
  optionsContainer: {
    gap: 10,
    paddingBottom: 10,
  },
  optionButton: {
    padding: 15, borderRadius: 10, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ddd'
  },
  optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 16, color: '#333', flex: 1, marginLeft: 8 },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
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
  navigationButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    gap: 8,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  btnSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold'
  },
  resultCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  scoreCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  resultMessage: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    minWidth: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  dragDropContainer: {
  },
  dropZoneWrapper: {
    marginBottom: 10,
  },
  dropZoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
  },
  dropZone: {
    minHeight: 80,
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  emptyDropZone: {
    alignItems: 'center',
  },
  dropZonePlaceholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  droppedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F6F5',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  droppedItemText: {
    fontSize: 15,
    color: '#2C698D',
    fontWeight: '600',
  },
  removeButton: {
    marginLeft: 10,
  },
  availableOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C698D',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  availableOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },
  orderText: {
    fontWeight: '600',
    color: '#2C698D',
  },
  dragOptionButton: {
    borderRadius: 10,
    backgroundColor: '#2C698D',
    borderWidth: 1,
    borderColor: '#2C698D',
    marginBottom: 10,
  },
  dragOptionTouchable: {
    padding: 15,
    width: '100%',
  },
  dragOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragOptionDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
    opacity: 0.5,
  },
  dragOptionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  dragOptionTextDisabled: {
    color: '#999',
  },
});