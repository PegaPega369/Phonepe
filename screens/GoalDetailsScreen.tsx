import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../components/ProfileComponents/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface RouteParams {
  goalId: string;
  uid: string;
}

interface GoalProps {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  duration: string;
  dueDate: string;
  icon: string;
  color: string;
  riskLevel?: number;
  inflation?: boolean;
  createdAt?: Date | null;
}

interface Transaction {
  id: string;
  amount: number;
  date: Date | null;
  description: string;
}

const GoalDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const {goalId, uid} = (route.params as RouteParams) || {};

  const [goal, setGoal] = useState<GoalProps | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Animation values
  const headerAnimation = useState(new Animated.Value(0))[0];
  const progressAnimation = useState(new Animated.Value(0))[0];
  const transactionsAnimation = useState(new Animated.Value(0))[0];

  // Safe date conversion function
  const safeDateConversion = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    try {
      return timestamp.toDate();
    } catch (e) {
      console.error('Date conversion error:', e);
      return null;
    }
  };

  useEffect(() => {
    const fetchGoalData = async () => {
      try {
        console.log('Route params:', {goalId, uid});

        // Verify that both parameters exist
        if (!goalId || !uid) {
          console.error('Missing required parameters', {goalId, uid});
          setError('Missing required parameters');
          setLoading(false);
          return;
        }

        // Fetch goal details
        const goalDoc = await firestore()
          .collection('users')
          .doc(uid)
          .collection('goals')
          .doc(goalId)
          .get();

        console.log('Goal doc exists:', goalDoc.exists);

        if (!goalDoc.exists) {
          setError('Goal not found');
          setLoading(false);
          return;
        }

        const goalData = goalDoc.data() as GoalProps;
        console.log('Goal data retrieved:', goalData ? 'Yes' : 'No');
        console.log(goalData)

        if (!goalData) {
          setError('Invalid goal data');
          setLoading(false);
          return;
        }

        setGoal({
          ...goalData,
          id: goalDoc.id,
          createdAt: safeDateConversion(goalData.createdAt),
        });

        // Fetch transactions for this goal
        const transactionsSnapshot = await firestore()
          .collection('users')
          .doc(uid)
          .collection('goals')
          .doc(goalId)
          .collection('transactions')
          .orderBy('date', 'desc')
          .get();

        console.log('Transactions count:', transactionsSnapshot.docs.length);

        const transactionsData = transactionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            amount: Number(data.amount) || 0,
            date: safeDateConversion(data.date),
            description: data.description || 'Goal Contribution',
          };
        }) as Transaction[];

        setTransactions(transactionsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching goal data:', err);
        setError(`Failed to load goal data: ${err.message || 'Unknown error'}`);
        setLoading(false);

        // Alert for debugging in development
        if (__DEV__) {
          Alert.alert('Debug Error', JSON.stringify(err));
        }
      }
    };

    fetchGoalData();
  }, [goalId, uid]);

  // Start animations when component mounts
  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    Animated.sequence([
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(transactionsAnimation, {
        toValue: 1,
        duration: 600, 
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Function to render progress bar
  const renderProgressBar = (current: number, target: number) => {
    const percent =
      target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${percent}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{percent}% Complete</Text>
      </View>
    );
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'No date';
    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Format date error:', e);
      return 'Invalid date';
    }
  };

  const addTransaction = () => {
    // Validate required parameters before navigating
    if (!goalId || !uid) {
      Alert.alert('Error', 'Missing parameters required to add transaction');
      return;
    }

    navigation.navigate('AddTransaction', {
      goalId,
      uid,
      currentAmount: goal?.currentAmount || 0,
      targetAmount: goal?.targetAmount || 0,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading goal details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Icon
          name="alert-circle-outline"
          size={50}
          color="#FF6B6B"
          style={{marginBottom: 16}}
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Goal information could not be loaded
        </Text>
        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
    

        {/* Progress Section */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: progressAnimation,
              transform: [
                {
                  translateY: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }
              ]
            },
          ]}>
          <Text style={styles.sectionTitle}>Progress</Text>

          <View style={styles.progressCard}>
            <View style={styles.amountContainer}>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Current</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.rupeesSymbol}>₹</Text>
                  <Text style={styles.amountValue}>
                    {(goal?.currentAmount || 0).toLocaleString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.amountSeparator} />
              
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Remaining</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.rupeesSymbol}>₹</Text>
                  <Text style={styles.amountValue}>
                    {((goal?.targetAmount || 0) - (goal?.currentAmount || 0)).toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {renderProgressBar(goal.currentAmount, goal.targetAmount)}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Target Date</Text>
                <Text style={styles.statValue}>{goal.dueDate || 'Not set'}</Text>
              </View>
              
              <View style={styles.statSeparator} />
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Risk Level</Text>
                <Text style={styles.statValue}>
                  {goal.riskLevel === 0 ? 'Low' : goal.riskLevel === 1 ? 'Medium' : 'High'}
                </Text>
              </View>
              
              <View style={styles.statSeparator} />
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Created On</Text>
                <Text style={styles.statValue}>{formatDate(goal.createdAt)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Transactions Section */}
        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: transactionsAnimation,
              transform: [
                {
                  translateY: transactionsAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0]
                  })
                }
              ]
            },
          ]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addTransaction}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {transactions && transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <Animated.View
                key={transaction.id}
                style={[
                  styles.transactionCard,
                  {
                    opacity: transactionsAnimation,
                    transform: [
                      {
                        scale: transactionsAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1]
                        })
                      }
                    ]
                  }
                ]}
              >
                <View style={styles.transactionCardContent}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.iconCircle}>
                      <Icon name="cash-plus" size={20} color={COLORS.primary} />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description || 'Goal Contribution'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.date)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.transactionAmount}>
                    +₹{transaction.amount.toLocaleString()}
                  </Text>
                </View>
              </Animated.View>
            ))
          ) : (
            <Animated.View
              style={[
                styles.emptyState,
                {
                  opacity: transactionsAnimation,
                  transform: [
                    {
                      scale: transactionsAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1]
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={styles.emptyStateContent}>
                <Icon
                  name="wallet-outline"
                  size={48}
                  color="rgba(255, 255, 255, 0.5)"
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Add your first contribution
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

     {/* Add Contribution Button */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['#231537', '#4B0082']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton} 
        >
          <TouchableOpacity
            style={styles.addContributionButton}
            onPress={addTransaction}
            activeOpacity={0.8}
          >
            <Text style={styles.addContributionText}>Add Contribution</Text>
            <Icon name="plus" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  backButton: {
    padding: 8,
  },
  gradientButton: {
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorBackButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 24,
  },
  goalInfoCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalTitleContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionContainer: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: `${COLORS.primary}20`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  progressCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  amountItem: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rupeesSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 2,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  amountSeparator: {
    height: 40,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  statSeparator: {
    height: 30,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionCardContent: {
    backgroundColor: COLORS.cardDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    marginBottom: 16,
  },
  emptyStateContent: {
    backgroundColor: COLORS.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addContributionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    
  },
  addContributionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default GoalDetailScreen;