import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RouteParams {
  goalId: string;
  uid: string;
  targetAmount: number;
  currentAmount: number;
}

const AddContribution = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Goal Contribution');
  const [loading, setLoading] = useState(false);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState('');

  // Animation values
  const headerAnimation = useState(new Animated.Value(0))[0];
  const summaryAnimation = useState(new Animated.Value(0))[0];
  const inputAnimation = useState(new Animated.Value(0))[0];
  const buttonAnimation = useState(new Animated.Value(0))[0];
  
  // Shimmer animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { goalId, uid, targetAmount, currentAmount } = route.params as RouteParams;

  // Start animations
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    Animated.sequence([
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(summaryAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
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

  const handleQuickAmountSelect = (value: string) => {
    setAmount(value);
    setSelectedQuickAmount(value);
  };
  
  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value !== selectedQuickAmount) {
      setSelectedQuickAmount('');
    }
  };

  const handleAddTransaction = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      // Add transaction
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('goals')
        .doc(goalId)
        .collection('transactions')
        .add({
          amount: numAmount,
          description,
          date: firestore.FieldValue.serverTimestamp()
        });

      // Update goal's current amount
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('goals')
        .doc(goalId)
        .update({
          currentAmount: firestore.FieldValue.increment(numAmount)
        });

      navigation.navigate('BudgetGoals', { uid });
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", "Could not add the contribution. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage complete
  const percentComplete = targetAmount > 0 
    ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) 
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header with animation */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerAnimation,
            transform: [
              {
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Contribution</Text>
        <View style={styles.placeholder} />
      </Animated.View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card with Animation */}
          <Animated.View
            style={[
              styles.summaryContainer,
              {
                opacity: summaryAnimation,
                transform: [
                  {
                    scale: summaryAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1]
                    })
                  }
                ]
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
              
              <Text style={styles.summaryTitle}>Goal Progress</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentComplete}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{percentComplete}% Completed</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Current</Text>
                  <View style={styles.amountRow}>
                    <Text style={styles.rupeesSymbol}>₹</Text>
                    <Text style={styles.summaryValue}>{currentAmount?.toLocaleString() || '0'}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Target</Text>
                  <View style={styles.amountRow}>
                    <Text style={styles.rupeesSymbol}>₹</Text>
                    <Text style={styles.summaryValue}>{targetAmount?.toLocaleString() || '0'}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* Amount Input with Animation */}
          <Animated.View
            style={[
              styles.inputSection,
              {
                opacity: inputAnimation,
                transform: [
                  {
                    translateY: inputAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.inputLabel}>CONTRIBUTION AMOUNT</Text>
            
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.amountInputContainer}
            >
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                selectionColor="#8A2BE2"
              />
            </LinearGradient>
            
            <Text style={styles.quickSelectLabel}>Quick Select</Text>
            <View style={styles.quickAmountsGrid}>
              {['100', '500', '1000', '5000'].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.quickAmountButton,
                    selectedQuickAmount === value && styles.selectedQuickAmount
                  ]}
                  onPress={() => handleQuickAmountSelect(value)}
                >
                  <LinearGradient
                    colors={selectedQuickAmount === value 
                      ? ['#8A2BE2', '#4B0082'] 
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quickAmountGradient}
                  >
                    <Text style={[
                      styles.quickAmountText,
                      selectedQuickAmount === value && styles.selectedQuickAmountText
                    ]}>₹{value}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
          
          {/* Description Input with Animation */}
          <Animated.View
            style={[
              styles.inputSection,
              {
                opacity: inputAnimation,
                transform: [
                  {
                    translateY: inputAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.inputLabel}>DESCRIPTION (OPTIONAL)</Text>
            
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.descriptionInputContainer}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                style={styles.descriptionInput}
                placeholder="Enter a description for this contribution"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                selectionColor="#8A2BE2"
              />
            </LinearGradient>
          </Animated.View>
          
          {/* Note with Animation */}
          <Animated.View
            style={[
              styles.noteContainer,
              {
                opacity: inputAnimation,
                transform: [
                  {
                    translateY: inputAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <Icon name="information-outline" size={20} color="#8A2BE2" />
            <Text style={styles.noteText}>
              Your contribution will be immediately added to your goal progress.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Add Button with Animation */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: buttonAnimation,
            transform: [
              {
                translateY: buttonAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['#8A2BE2', '#4B0082']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <TouchableOpacity
            style={[
              styles.button,
              (!amount || loading) && styles.disabledButton
            ]}
            onPress={handleAddTransaction}
            disabled={loading || !amount}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Add Contribution</Text>
                <Icon name="arrow-right" size={18} color="#FFFFFF" style={{marginLeft: 8}} />
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: {
    flex: 1,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    position: 'relative',
    zIndex: 2,
  },
  progressBarContainer: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 2,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rupeesSymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: 16,
  },
  quickSelectLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  quickAmountButton: {
    width: '23%',
    marginHorizontal: '1%',
    marginBottom: 8,
  },
  selectedQuickAmount: {
    transform: [{ scale: 1.05 }],
  },
  quickAmountGradient: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedQuickAmountText: {
    color: '#FFFFFF',
  },
  descriptionInputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  descriptionInput: {
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
    lineHeight: 20,
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
  buttonGradient: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddContribution;