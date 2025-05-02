import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from '../components/ProfileComponents/theme';

interface RouteParams {
  uid: string;
  purpose?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GoalPage2: React.FC = () => {
  const [investmentDuration, setInvestmentDuration] = useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid, purpose } = route.params as RouteParams;
  
  // Refs for animations
  const plantRef = useRef<LottieView>(null);
  const [previous, setPrevious] = useState(0);
  
  // Animation values - starting fully visible to prevent loading flash
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  
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
    
    // Initial plant animation setup
    if (plantRef?.current) {
      plantRef.current.play(0, 0);
    }
  }, []);
  
  // Handle slider value change and plant animation
  const handleValueChange = (value: number) => {
    setInvestmentDuration(value);
    const maxFrames = 88;
    const frame = (value / 5) * maxFrames;
    
    if (plantRef?.current) {
      plantRef.current.play(previous, frame);
    }
    
    setPrevious(frame);
  };
  
  // Go to next screen
  const handleNext = () => {
    navigation.navigate('GoalSavings3', { 
      uid, 
      purpose,
      duration: investmentDuration + 1 // Add 1 to get the proper year range (0-1 becomes 1 year)
    });
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
            <Text style={styles.stepText}>2/4</Text>
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
          <Text style={styles.titleText}>How long do you plan to invest?</Text>
          
          {/* Plant Animation - Made smaller */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={plantRef}
              style={styles.plantAnimation}
              source={require('../components/assets/Plant.json')}
              loop={false}
            />
          </View>
          
          {/* Slider Section - Moved below animation */}
          <View style={styles.sliderSection}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={4}
              step={1}
              value={investmentDuration}
              onValueChange={handleValueChange}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor={COLORS.primary}
            />
            
            {/* Slider Labels */}
            <View style={styles.sliderLabelsContainer}>
              {[0, 1, 2, 3, 4].map((value) => (
                <View key={value} style={styles.labelContainer}>
                  <View 
                    style={[
                      styles.labelMark,
                      investmentDuration >= value && styles.activeLabelMark
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.sliderLabel,
                      investmentDuration >= value && styles.activeSliderLabel
                    ]}
                  >
                    {value}-{value + 1}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Investment Duration Box - Moved below slider */}
          <View style={styles.durationTextContainer}>
            <Text style={styles.durationLabel}>Investment Duration</Text>
            <Text style={styles.durationText}>
              {investmentDuration}-{investmentDuration + 1} Years
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <LinearGradient
            colors={COLORS.purpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
    alignItems: 'center',
  },
  titleText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH * 0.5, // Made smaller from 0.4 to 0.35
    height: SCREEN_WIDTH * 0.5, // Made smaller from 0.4 to 0.35
    marginBottom: 30, // Added margin to create space before slider
    marginTop:30,
  },
  plantAnimation: {
    width: '100%',
    height: '100%',
  },
  sliderSection: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20, // Added margin to create space between slider and duration box
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginTop: -5,
  },
  labelContainer: {
    alignItems: 'center',
  },
  labelMark: {
    width: 4,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 6,
  },
  activeLabelMark: {
    backgroundColor: COLORS.primary,
  },
  sliderLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  activeSliderLabel: {
    color: COLORS.text,
    fontWeight: '600',
  },
  durationTextContainer: {
    alignItems: 'center',
    marginTop: 25,
    padding: 0,
  },
  durationLabel: {
    color: COLORS.textDim,
    fontSize: 14,
    marginBottom: 4,
  },
  durationText: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
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
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalPage2;