import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, cardShadow } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GoldPriceSectionProps {
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  goldData: {
    currentPrice: number;
    change: string;
    isUp: boolean;
    highToday: number;
    lowToday: number;
  };
}

const GoldPriceSection: React.FC<GoldPriceSectionProps> = ({ 
  selectedTimeframe, 
  setSelectedTimeframe,
  goldData
}) => {
  // Animation values using React Native's Animated
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Orchestrate all animations with loading-style shimmer
  const startAnimations = () => {
    // Create a continuous flowing shimmer animation from left to right
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500, // Even faster for loading-style effect
        easing: Easing.linear, // Linear for consistent speed throughout
        useNativeDriver: true
      }),
      { iterations: -1, resetBeforeIteration: false } // Seamless loop with no resets
    );
    
    // Fade in animation for price display
    const fadeAnimation = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    });
    
    // Start all animations with a clean sequence
    shimmerAnimation.start();
    fadeAnimation.start();
  };
  
  // Run animations on component mount
  useEffect(() => {
    startAnimations();
  }, []);
  
  // Interpolate animations for loading-style shimmer effect
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH] // Full screen width sweep
  });
  
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg']
  });
  
  const translateY = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0]
  });

  // Chart data based on selected timeframe
  const getChartData = () => {
    switch(selectedTimeframe) {
      case 'Day':
        return {
          labels: ['9am', '11am', '1pm', '3pm', '5pm'],
          data: [7100, 7150, 7120, 7200, 7350],
        };
      case 'Week':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [7000, 7050, 7100, 7200, 7250, 7300, 7350],
        };
      case 'Month':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [7000, 7100, 7300, 7350],
        };
      case '6 Months':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [6900, 7000, 7200, 7150, 7300, 7350],
        };
      default:
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [7000, 7050, 7100, 7200, 7250, 7300, 7350],
        };
    }
  };

  const chartData = getChartData();

  return (
    <View style={styles.priceCard}>
      <Animated.View 
        style={[
          styles.headerContainer
          // Removed transform animations as requested
        ]}
      >
        <LinearGradient
          colors={['rgba(138, 43, 226, 0.95)', 'rgba(110, 25, 190, 0.98)', 'rgba(88, 15, 180, 0.90)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.gradientHeader}
        >
          {/* Floating orbs in background for premium feel */}
          <View style={styles.orb1} />
          <View style={styles.orb2} />
          <View style={styles.orb3} />
          
          {/* Full-width loading-style shimmer effect */}
          <View style={styles.shimmerContainer}>
            <View style={styles.shimmerLoadingEffect}>
              <Animated.View 
                style={[
                  styles.shimmerBar,
                  {
                    transform: [
                      { rotate: '25deg' }, 
                      { translateX: shimmerTranslate }
                    ]
                  }
                ]} 
              />
            </View>
          </View>
          
          {/* Subtle radial pattern for luxury effect */}
          <View style={styles.radialPattern} />
          
          {/* Main content with fade and slide animation */}
          <Animated.View 
            style={[
              styles.contentContainer, 
              {
                opacity: fadeAnim,
                transform: [{ translateY }]
              }
            ]}
          >
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>
                <Text style={styles.currentText}>Current</Text> Gold Price
              </Text>
              <Text style={styles.priceValue}>
                ₹{goldData.currentPrice}
                <Text style={styles.perGram}>/g</Text>
              </Text>
            </View>
            
            <View style={styles.changeSection}>
              {/* Premium change indicator - no box, minimalist */}
              <View style={styles.changeIndicator}>
                <Icon 
                  name={goldData.isUp ? "trending-up" : "trending-down"} 
                  type="ionicon" 
                  size={16} 
                  color={goldData.isUp ? "#4CAF50" : "#F44336"}
                />
                <Text style={[
                  styles.changeText, 
                  {color: goldData.isUp ? "#4CAF50" : "#F44336"}
                ]}>
                  {goldData.change}
                </Text>
              </View>
              <View style={styles.timePeriodContainer}>
                <Icon
                  name="time-outline"
                  type="ionicon"
                  size={12}
                  color="rgba(255, 255, 255, 0.6)"
                  style={{marginRight: 4}}
                />
                <Text style={styles.changeTimePeriod}>Today</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Gold Price Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{ data: chartData.data }],
          }}
          width={SCREEN_WIDTH - 60}
          height={200}
          yAxisLabel="₹"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: COLORS.background,
            backgroundGradientFrom: COLORS.background,
            backgroundGradientTo: COLORS.primaryDark,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
            labelColor: () => COLORS.textSecondary,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: COLORS.primary,
            },
            propsForBackgroundLines: {
              strokeDasharray: '5, 5',
              strokeWidth: 1,
              stroke: COLORS.border,
            },
            fillShadowGradient: COLORS.chartGradient[0],
            fillShadowGradientOpacity: 0.5,
          }}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={true}
        />
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {['Day', 'Week', 'Month', '6 Months'].map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeframeButton,
              selectedTimeframe === time && styles.selectedTimeframe
            ]}
            onPress={() => setSelectedTimeframe(time)}
          >
            <Text
              style={[
                styles.timeframeText,
                selectedTimeframe === time && styles.selectedTimeframeText
              ]}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* High/Low Indicators */}
      <View style={styles.highLowContainer}>
        <View style={styles.highLowItem}>
          <Text style={styles.highLowLabel}>Today's High</Text>
          <Text style={styles.highLowValue}>₹{goldData.highToday}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.highLowItem}>
          <Text style={styles.highLowLabel}>Today's Low</Text>
          <Text style={styles.highLowValue}>₹{goldData.lowToday}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  priceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    ...cardShadow,
    overflow: 'hidden',
  },
  headerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  gradientHeader: {
    height: 90, // Reduced from 135px to 110px
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 12, // Reduced vertical padding
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 }, // Reduced shadow
    shadowOpacity: 0.4, // Reduced shadow opacity 
    shadowRadius: 16,
    elevation: 20,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmerEffect: {
    position: 'absolute',
    height: 300,
    width: 120, // Wider shimmer for better visibility
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Slightly brighter for better visibility
    borderRadius: 100,
    transform: [{ rotate: '30deg' }],
  },
  shimmerLoadingEffect: {
    position: 'absolute',
    height: '100%',
    width: '100%', // Full width container
    // We'll use a linear gradient in React Native
    // But simulate it with a semi-transparent white bar
  },
  shimmerBar: {
    position: 'absolute',
    height: '200%', // Extra tall for a more dramatic wavy effect
    width: '80%', // Wider for a more visible effect
    // Create a very subtle base color
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    // Elegant curved shape with large radius
    borderRadius: 100,
    // Add a softer highlight in the middle
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.12)', 
    borderLeftColor: 'rgba(255, 255, 255, 0)',
    borderRightColor: 'rgba(255, 255, 255, 0)',
  },
  shimmerWave1: {
    top: -150,
    left: -100,
    width: 80,
    opacity: 0.6,
  },
  shimmerWave2: {
    top: -100,
    left: -80,
    width: 110,
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    opacity: 0.4,
  },
  shimmerWave3: {
    top: -50,
    left: -60,
    width: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    opacity: 0.3,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  priceSection: {
    flex: 1,
  },
  orb1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(160, 60, 255, 0.3)',
    opacity: 0.7,
  },
  orb2: {
    position: 'absolute',
    bottom: -10,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(110, 30, 210, 0.3)',
    opacity: 0.5,
  },
  orb3: {
    position: 'absolute',
    top: 40,
    right: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(190, 120, 255, 0.2)',
    opacity: 0.6,
  },
  radialPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.4,
    backgroundColor: 'transparent',
    // We can't use actual radial gradients in React Native without additional libraries
    // So we're creating an illusion with border radius
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 200,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: '500',
  },
  currentText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  perGram: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  changeSection: {
    alignItems: 'flex-end',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timePeriodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeTimePeriod: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  chartContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 5, // Add some spacing from the edges
    alignSelf: 'center', // Center the chart properly
    
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  timeframeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  selectedTimeframe: {
    backgroundColor: COLORS.primary,
  },
  timeframeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectedTimeframeText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  highLowContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 16,
  },
  highLowItem: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  highLowLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  highLowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default GoldPriceSection;