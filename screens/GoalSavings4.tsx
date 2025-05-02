import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from '../components/ProfileComponents/theme';
import firestore from '@react-native-firebase/firestore';

interface RouteParams {
  uid: string;
  purpose?: string;
  duration?: number;
  riskLevel?: number;
}

const YearPicker = ({ selectedYear, onYearChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const years = ['2025', '2026', '2027', '2028', '2029', '2030'];
  
  return (
    <View style={styles.yearPickerContainer}>
      <TouchableOpacity
        style={styles.yearSelector}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.yearText}>{selectedYear}</Text>
        <Icon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={COLORS.textDim} 
        />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.yearDropdown}>
          {years.map((year) => (
            <TouchableOpacity
              key={year}
              style={[
                styles.yearOption, 
                year === selectedYear && styles.selectedYearOption
              ]}
              onPress={() => {
                onYearChange(year);
                setIsOpen(false);
              }}
            >
              <Text 
                style={[
                  styles.yearOptionText,
                  year === selectedYear && styles.selectedYearOptionText
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const GoalPage4: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid, purpose, duration, riskLevel } = route.params as RouteParams;
  
  const [targetAmount, setTargetAmount] = useState('');
  const [targetYear, setTargetYear] = useState('2025');
  const [inflation, setInflation] = useState(false);
  
  // Animation values - starting fully visible to prevent loading flash
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  const trophyAnim = useState(new Animated.Value(1))[0];
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Start the entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
    
    // Trophy animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(trophyAnim, {
          toValue: 0.95,
          duration: 1500,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  // Handle form submission
  const handleConfirm = async () => {
    console.log(riskLevel)
    const goalData = {
      purpose: purpose || "Investment Goal",
      duration: duration || 1,
      riskLevel: riskLevel,
      targetAmount: targetAmount ? Number(targetAmount) : 10000,
      targetYear,
      inflation,
      createdAt: firestore.FieldValue.serverTimestamp()
    };
  
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .collection('goals')
        .add(goalData);
  
      navigation.navigate('Home', { uid });
    } catch (error) {
      console.error('🔥 Error saving goal:', error);
    }
  };
  
  return (
    <View style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerText}>Goal Savings</Text>
          
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>4/4</Text>
          </View>
        </View>
        
        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.titleText}>Set a target to track your progress</Text>
          
          {/* Trophy Animation */}
          <Animated.View
            style={[
              styles.trophyContainer,
              { transform: [{ scale: trophyAnim }] }
            ]}
          >
            <Image 
              source={require('../components/assets/trophy.png')} 
              style={styles.trophyImage} 
            />
          </Animated.View>
          
          {/* Form Inputs */}
          <View style={styles.formContainer}>
            <View style={styles.inputRow}>
              <View style={styles.amountInputContainer}>
                <Text style={styles.inputLabel}>Target Amount</Text>
                <View style={styles.rupeesInputContainer}>
                  <Text style={styles.rupeesSymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="10,000"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    keyboardType="numeric"
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    selectionColor={COLORS.primary}
                  />
                </View>
              </View>
              
              <View style={styles.yearInputContainer}>
                <Text style={styles.inputLabel}>Target Year</Text>
                <YearPicker 
                  selectedYear={targetYear}
                  onYearChange={setTargetYear}
                />
              </View>
            </View>
            
            {/* Inflation Option */}
            <View style={styles.inflationContainer}>
              <View>
                <Text style={styles.inflationText}>
                  Add inflation to my target
                </Text>
                <Text style={styles.inflationDescription}>
                  Planning for inflation helps you keep up with increase in prices over time.
                </Text>
              </View>
              
              <Switch
                value={inflation}
                onValueChange={setInflation}
                trackColor={{ 
                  false: 'rgba(255, 255, 255, 0.1)', 
                  true: 'rgba(138, 43, 226, 0.5)' 
                }}
                thumbColor={inflation ? COLORS.primary : '#f4f3f4'}
                ios_backgroundColor="rgba(255, 255, 255, 0.1)"
              />
            </View>
          </View>
          
          {/* Goal Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Icon name="information-outline" size={20} color={COLORS.primary} />
              <Text style={styles.summaryTitle}>Goal Summary</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Purpose:</Text>
              <Text style={styles.summaryValue}>{purpose || "Investment Goal"}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{duration || 1} years</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Risk Level:</Text>
              <Text style={styles.summaryValue}>
                {riskLevel === 0 ? "Low" : riskLevel === 1 ? "Medium" : "High"}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Target Amount:</Text>
              <Text style={styles.summaryValue}>
                ₹{targetAmount ? parseInt(targetAmount).toLocaleString() : "10,000"}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.8}
          onPress={handleConfirm}
        >
          <LinearGradient
            colors={COLORS.purpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.confirmButtonText}>Create Goal</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerText: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  stepIndicator: {
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  stepText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  titleText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  trophyContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  trophyImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  formContainer: {
    marginTop: 10,
    
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    
  },
  amountInputContainer: {
    flex: 3,
    marginRight: 12,
    
  },
  yearInputContainer: {
    flex: 2,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 8,
  },
  rupeesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    ...SHADOWS.small,
  },
  rupeesSymbol: {
    fontSize: 18,
    color: COLORS.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 12,
    
  },
  yearPickerContainer: {
    position: 'relative',
    zIndex: 100,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  yearText: {
    fontSize: 16,
    color: COLORS.text,
  },
  yearDropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    ...SHADOWS.medium,
    zIndex: 100,
  },
  yearOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedYearOption: {
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
  },
  yearOptionText: {
    fontSize: 16,
    color: COLORS.textDim,
  },
  selectedYearOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  inflationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  inflationText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  inflationDescription: {
    fontSize: 12,
    color: COLORS.textDim,
    width: '70%', // Reduced width to prevent overflow
  },
  summaryContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },


  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '(255, 255, 255, 0.05)',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalPage4;