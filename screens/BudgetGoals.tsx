import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOWS } from '../components/ProfileComponents/theme';
import firestore from '@react-native-firebase/firestore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RouteParams {
  uid: string;
}

interface GoalProps {
  id: string;
  title: string;
  target: number;
  current: number;
  duration: string;
  dueDate: string;
  icon: string;
  color: string;
  createdAt?: Date;
  inflation?: boolean;
  riskLevel?: number;
}

const BudgetGoals: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as RouteParams;
  const routeUid = uid || (route.params as { uid?: string })?.uid;
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];
  
  // Shimmer animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  const [goals, setGoals] = useState<GoalProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [id,setId]=useState(1);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .collection('goals')
      .onSnapshot(snapshot => {
        const goalsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Calculate due date based on createdAt and duration
          const createdAt = data.createdAt?.toDate() || new Date();
          const durationMonths = data.duration || 0;
          const dueDate = new Date(createdAt);
          dueDate.setMonth(dueDate.getMonth() + durationMonths);
          
          return {
            id: doc.id,
            title: data.purpose || "Untitled Goal",
            target: data.targetAmount || 0,
            current: data.currentAmount || 0,
            duration: `${durationMonths} months`,
            dueDate: dueDate.toLocaleDateString(),
            icon: getIconByRiskLevel(data.riskLevel),
            color: getColorByRiskLevel(data.riskLevel),
            createdAt: createdAt,
            inflation: data.inflation || false,
            riskLevel: data.riskLevel || 1
          };
        });
        setGoals(goalsData);
        setLoading(false);
      }, error => {
        console.error("Error fetching goals:", error);
        setLoading(false);
      });
  
    return () => unsubscribe();
  }, [uid]);

  // Helper functions for risk level
  const getIconByRiskLevel = (riskLevel?: number) => {
    switch(riskLevel) {
      case 0: return "shield-check";
      case 1: return "chart-line";
      case 2: return "trending-up";
      default: return "target";
    }
  };

  const getColorByRiskLevel = (riskLevel?: number) => {
    switch(riskLevel) {
      case 0: return COLORS.success;
      case 1: return COLORS.warning;
      case 2: return COLORS.error;
      default: return COLORS.primary;
    }
  };

  // Start animations when component mounts
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
    
    // Start shimmer animation loop
    const runShimmer = () => {
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2800,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(runShimmer, 2000);
      });
    };
    
    runShimmer();
  }, []);

  // Interpolate shimmer animation position
  const shimmerPosition = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 1.5],
  });

  // Calculate total savings across all goals
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const percentComplete = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Function to render progress bar
  const renderProgressBar = (current: number, target: number) => {
    const percent = Math.min(100, Math.round((current / target) * 100));
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressText}>{percent}%</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.headerContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Budget Goals</Text>
          <Text style={styles.headerSubtitle}>Track your saving progress</Text>
        </Animated.View>

        {/* Overall summary card */}
        <Animated.View
          style={[
            styles.summaryCardContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#231537', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryCard}
          >
            {/* Shimmer effect overlay */}
            <View style={styles.shineOverlay}>
              <Animated.View 
                style={[
                  styles.shimmerEffect,
                  { transform: [{ translateX: shimmerPosition }] }
                ]}
              >
                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0)',
                    'rgba(255,255,255,0.03)',
                    'rgba(255,255,255,0.1)',
                    'rgba(255,255,255,0.15)',
                    'rgba(255,255,255,0.1)',
                    'rgba(255,255,255,0.03)',
                    'rgba(255,255,255,0)'
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.shimmerGradient}
                />
              </Animated.View>
            </View>
            
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle}>Overall Progress</Text>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryLabel}>Total Saved</Text>
                  <Text style={styles.summaryValue}>₹{totalSaved.toLocaleString()}</Text>
                </View>
                
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryLabel}>Goal Amount</Text>
                  <Text style={styles.summaryValue}>₹{totalTarget.toLocaleString()}</Text>
                </View>
              </View>
              
              <View style={styles.summaryProgressBarContainer}>
                <View style={styles.summaryProgressBar}>
                  <View 
                    style={[
                      styles.summaryProgressFill, 
                      { width: `${percentComplete}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.summaryProgressText}>{percentComplete}% Complete</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Goals List */}
        <Animated.View
          style={[
            styles.goalsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('GoalSavings1', { uid: routeUid })}
            >
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {goals.length > 0 ? (
            goals.map((goal) => (
              <TouchableOpacity 
                key={goal.id} 
                style={styles.goalCard}
                onPress={() => {console.log(goal.id);navigation.navigate('GoalDetails',{goalId:goal.id,uid});
                }}
              >
                <View style={[styles.goalIconContainer, { backgroundColor: `${goal.color}20` }]}>
                  <Icon name={goal.icon} size={24} color={goal.color} />
                </View>
                
                <View style={styles.goalInfo}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalAmount}>
                      <Text style={styles.goalCurrent}>₹{goal.current.toLocaleString()}</Text>
                      <Text style={styles.goalTarget}> / ₹{goal.target.toLocaleString()}</Text>
                    </Text>
                  </View>
                  
                  {renderProgressBar(goal.current, goal.target)}
                  
                  <View style={styles.goalFooter}>
                    <View style={styles.goalMetaItem}>
                      <Icon name="calendar-clock" size={14} color={COLORS.textDim} />
                      <Text style={styles.goalMetaText}>{goal.duration}</Text>
                    </View>
                    
                    <View style={styles.goalMetaItem}>
                      <Icon name="calendar-check" size={14} color={COLORS.textDim} />
                      <Text style={styles.goalMetaText}>Due: {goal.dueDate}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="wallet-outline" size={48} color={COLORS.textDim} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No goals yet</Text>
              <Text style={styles.emptySubtext}>Start by adding your first savings goal</Text>
            </View>
          )}
        </Animated.View>

        {/* Tips Section */}
        <Animated.View
          style={[
            styles.tipsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { marginBottom: 14 }]}>Tips to Reach Your Goals</Text>
          
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Icon name="lightbulb-on" size={24} color="#FFA94D" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Automate Your Savings</Text>
              <Text style={styles.tipDescription}>Set up automatic transfers to your goal accounts on payday.</Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Icon name="chart-line-variant" size={24} color="#4CC2FF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Track Your Progress</Text>
              <Text style={styles.tipDescription}>Review your goals weekly to stay motivated and on track.</Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Icon name="cash-multiple" size={24} color="#38D9A9" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Cut Unnecessary Expenses</Text>
              <Text style={styles.tipDescription}>Identify non-essential spending and redirect those funds toward your goals.</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textDim,
  },
  summaryCardContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
  },
  summaryContent: {
    padding: 20,
    position: 'relative',
    zIndex: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCol: {},
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryProgressBarContainer: {
    marginTop: 8,
  },
  summaryProgressBar: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 3,
  },
  summaryProgressText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  goalsSection: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  goalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  goalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  goalAmount: {
    fontSize: 14,
  },
  goalCurrent: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  goalTarget: {
    color: COLORS.textDim,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textDim,
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalMetaText: {
    fontSize: 12,
    color: COLORS.textDim,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: 24,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
  },
});

export default BudgetGoals;