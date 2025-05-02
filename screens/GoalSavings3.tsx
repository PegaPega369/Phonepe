import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from '../components/ProfileComponents/theme';

interface RouteParams {
  uid: string;
  purpose?: string;
  duration?: number;
}

const GoalPage3: React.FC = () => {
  const [riskLevel, setRiskLevel] = useState(1);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid, purpose, duration } = route.params as RouteParams;
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(1))[0]; // Start visible to prevent flash
  const slideAnim = useState(new Animated.Value(0))[0]; // Start in position to prevent movement
  const gaugeAnim = useState(new Animated.Value(1))[0]; // Start filled to prevent empty gauge showing
  
  // Risk descriptions and colors based on level
  const riskDescriptions = [
    "I prefer safe investments with low returns",
    "I can take some risk to get good returns but still want safety",
    "I am comfortable with high risk for high returns"
  ];
  
  const riskColors = ['#2ED573', '#FFA94D', '#FF6B6B'];
  
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
      }),
      Animated.timing(gaugeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false
      })
    ]).start();
  }, []);
  
  // Update risk level
  const handleRiskChange = (value: number) => {
    setRiskLevel(value);
  };
  
  // Go to next screen
  const handleNext = () => {
    console.log(riskLevel)
    navigation.navigate('GoalSavings4', { 
      uid, 
      purpose,
      duration,
      riskLevel
    });
  };
  
  // Calculate gauge fill width based on risk level
  const gaugeFillWidth = gaugeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${((riskLevel + 1) / 3) * 100}%`]
  });
  
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
            <Text style={styles.stepText}>3/4</Text>
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
          <Text style={styles.titleText}>How much risk can you take?</Text>
          
          {/* Risk Level Indicator */}
          <View style={styles.riskLevelContainer}>
            <Icon 
              name={riskLevel === 0 ? "shield-check" : riskLevel === 1 ? "chart-line" : "rocket-launch"} 
              size={60} 
              color={riskColors[riskLevel]} 
              style={styles.riskIcon}
            />
            <Text style={[styles.riskLevelText, { color: riskColors[riskLevel] }]}>
              {riskLevel === 0 ? "Low Risk" : riskLevel === 1 ? "Moderate Risk" : "High Risk"}
            </Text>
          </View>
          
          {/* Gauge */}
          <View style={styles.gaugeContainer}>
            <View style={styles.gauge}>
              <Animated.View 
                style={[
                  styles.gaugeFill,
                  { 
                    width: gaugeFillWidth,
                    backgroundColor: riskColors[riskLevel]
                  }
                ]} 
              />
            </View>
            
            <View style={styles.gaugeLabels}>
              <Text style={styles.gaugeLabel}>Conservative</Text>
              <Text style={styles.gaugeLabel}>Balanced</Text>
              <Text style={styles.gaugeLabel}>Aggressive</Text>
            </View>
          </View>
          
          {/* Slider Section */}
          <View style={styles.sliderSection}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={riskLevel}
              onValueChange={handleRiskChange}
              minimumTrackTintColor={riskColors[riskLevel]}
              maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
              thumbTintColor={riskColors[riskLevel]}
            />
            
            {/* Risk Description */}
            <View style={[styles.descriptionContainer, { borderColor: `${riskColors[riskLevel]}30` }]}>
              <Text style={styles.descriptionText}>
                {riskDescriptions[riskLevel]}
              </Text>
            </View>
            
            {/* Risk Details */}
            <View style={styles.riskDetails}>
              {riskLevel === 0 && (
                <Text style={styles.riskDetailText}>
                  • Lower returns with minimal risk{'\n'}
                  • Capital preservation focused{'\n'}
                  • Suitable for short-term goals
                </Text>
              )}
              
              {riskLevel === 1 && (
                <Text style={styles.riskDetailText}>
                  • Moderate returns with balanced risk{'\n'}
                  • Mix of stable and growth investments{'\n'}
                  • Good for medium-term goals (2-4 years)
                </Text>
              )}
              
              {riskLevel === 2 && (
                <Text style={styles.riskDetailText}>
                  • Higher potential returns with higher volatility{'\n'}
                  • Growth-focused portfolio{'\n'}
                  • Best for long-term goals (4+ years)
                </Text>
              )}
            </View>
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
  },
  titleText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  riskLevelContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  riskIcon: {
    marginBottom: 10,
  },
  riskLevelText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gaugeContainer: {
    marginBottom: 30,
  },
  gauge: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 5,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gaugeLabel: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  sliderSection: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  descriptionContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.05)',
    ...SHADOWS.small,
  },
  descriptionText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  riskDetails: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom:10,
  },
  riskDetailText: {
    color: COLORS.textDim,
    fontSize: 14,
    lineHeight: 24,
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

export default GoalPage3;