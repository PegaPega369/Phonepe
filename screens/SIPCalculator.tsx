import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { PieChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RouteParams {
  uid: string;
}

// Types for SIP calculation steps
interface Step {
  title: string;
  description: string;
  formula: string;
  result: string;
}

const SIPCalculator: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as RouteParams;
  
  // Form values
  const [monthlyInvestment, setMonthlyInvestment] = useState<string>('5000');
  const [returnRate, setReturnRate] = useState<string>('12');
  const [timePeriod, setTimePeriod] = useState<string>('10');
  
  // Step-by-step calculation visibility
  const [showSteps, setShowSteps] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("SIP");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // Shimmer effect
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const shimmerPosition = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, SCREEN_WIDTH + 350]
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Shimmer animation loop
    const runShimmer = () => {
      shimmerValue.setValue(0);
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 3500, // Slower shimmer animation
        useNativeDriver: false,
      }).start(() => {
        setTimeout(runShimmer, 2000); // Longer pause between animations
      });
    };
    
    runShimmer();
  }, []);
  
  // Calculation functions with precise math
  const calculateSIP = () => {
    const monthly = parseFloat(monthlyInvestment) || 0;
    const rate = parseFloat(returnRate) || 0;
    const years = parseFloat(timePeriod) || 0;
    
    const totalMonths = years * 12;
    const monthlyRate = rate / 100 / 12;
    const investedAmount = monthly * totalMonths;
    
    // Using the compound interest formula for SIP
    const futureValue = monthly * 
      (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * 
      (1 + monthlyRate));
    
    const estimatedReturns = futureValue - investedAmount;
    const totalValue = investedAmount + estimatedReturns;
    
    // CAGR calculation for verification
    const cagr = (Math.pow(totalValue / investedAmount, 1 / years) - 1) * 100;
    
    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      totalValue: Math.round(totalValue),
      cagr: cagr.toFixed(2)
    };
  };
  
  // Generate calculation steps for educational purposes
  const generateSteps = () => {
    const monthly = parseFloat(monthlyInvestment) || 0;
    const rate = parseFloat(returnRate) || 0;
    const years = parseFloat(timePeriod) || 0;
    
    const totalMonths = years * 12;
    const monthlyRate = rate / 100 / 12;
    const investedAmount = monthly * totalMonths;
    
    const steps: Step[] = [
      {
        title: "Step 1: Calculate Invested Amount",
        description: "Multiply monthly investment by total months",
        formula: `₹${monthly.toLocaleString()} × ${totalMonths} months`,
        result: `₹${investedAmount.toLocaleString()}`
      },
      {
        title: "Step 2: Calculate Monthly Growth Rate",
        description: "Convert annual rate to monthly rate",
        formula: `${rate}% ÷ 12 months = ${(monthlyRate * 100).toFixed(4)}% per month`,
        result: `Monthly rate: ${(monthlyRate * 100).toFixed(4)}%`
      },
      {
        title: "Step 3: Apply SIP Formula",
        description: "Calculate final amount using compound interest formula",
        formula: `P × ((1 + r)ⁿ - 1) / r × (1 + r)`,
        result: `Future value: ₹${Math.round(calculateSIP().totalValue).toLocaleString()}`
      },
      {
        title: "Step 4: Calculate Returns",
        description: "Subtract invested amount from total value",
        formula: `₹${Math.round(calculateSIP().totalValue).toLocaleString()} - ₹${investedAmount.toLocaleString()}`,
        result: `Returns: ₹${Math.round(calculateSIP().estimatedReturns).toLocaleString()}`
      }
    ];
    
    return steps;
  };
  
  // Format large numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };
  
  const { investedAmount, estimatedReturns, totalValue, cagr } = calculateSIP();
  const steps = generateSteps();
  
  // Prepare data for pie chart
  const chartData = [
    {
      name: 'Invested',
      population: investedAmount,
      color: '#673AB7',
      legendFontColor: '#fff',
      legendFontSize: 12,
    },
    {
      name: 'Returns',
      population: estimatedReturns,
      color: '#8A2BE2',
      legendFontColor: '#fff',
      legendFontSize: 12,
    },
  ];
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#000',
    backgroundGradientTo: '#000',
    color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };
  
  // Calculate inflation-adjusted value
  const calculateInflationAdjustedValue = () => {
    const inflationRate = 6; // Default inflation rate (India average)
    const years = parseFloat(timePeriod) || 10;
    const futureValue = totalValue;
    
    // Inflation adjustment formula: PV = FV / (1 + inflation)^years
    const inflationAdjustedValue = futureValue / Math.pow(1 + (inflationRate / 100), years);
    
    return Math.round(inflationAdjustedValue);
  };
  
  const inflationAdjustedValue = calculateInflationAdjustedValue();
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Investment Calculator</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => console.log('hi')}
        >
          <Icon 
            name={showSteps ? "calculator-off" : "calculator"} 
            size={22} 
            color="#9D6DF9"
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#231537', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBanner}
          >
            <Icon 
              name="calculator-variant" 
              size={40} 
              color="#FFFFFF" 
              style={styles.heroIcon} 
            />
            <Text style={styles.bannerTitle}>SIP Calculator</Text>
            <Text style={styles.bannerSubtitle}>
              Plan your wealth creation journey with systematic investment plans
            </Text>
          </LinearGradient>
        </View>
        
        {/* Form Inputs */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Input Details</Text>
          
          {/* Monthly Investment */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Monthly Investment <Text style={styles.currency}>(₹)</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={monthlyInvestment}
                  onChangeText={setMonthlyInvestment}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  selectionColor="#9D6DF9"
                />
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1000}
                maximumValue={100000}
                step={1000}
                value={parseFloat(monthlyInvestment) || 5000}
                onValueChange={(value) => setMonthlyInvestment(value.toString())}
                minimumTrackTintColor="#9D6DF9"
                maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                thumbTintColor="#9D6DF9"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinLabel}>₹1,000</Text>
                <Text style={styles.sliderMaxLabel}>₹1,00,000</Text>
              </View>
            </View>

            {/* Return Rate */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected Return Rate (%)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={returnRate}
                  onChangeText={setReturnRate}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  selectionColor="#9D6DF9"
                />
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={30}
                step={0.5}
                value={parseFloat(returnRate) || 12}
                onValueChange={(value) => setReturnRate(value.toString())}
                minimumTrackTintColor="#9D6DF9"
                maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                thumbTintColor="#9D6DF9"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinLabel}>1%</Text>
                <Text style={styles.sliderMaxLabel}>30%</Text>
              </View>
            </View>

            {/* Time Period */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time Period (Years)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={timePeriod}
                  onChangeText={setTimePeriod}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  selectionColor="#9D6DF9"
                />
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={30}
                step={1}
                value={parseFloat(timePeriod) || 10}
                onValueChange={(value) => setTimePeriod(value.toString())}
                minimumTrackTintColor="#9D6DF9"
                maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                thumbTintColor="#9D6DF9"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMinLabel}>1 year</Text>
                <Text style={styles.sliderMaxLabel}>30 years</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Results Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Results</Text>
          
          <View style={styles.card}>
            {/* Results Summary */}
            <View style={styles.resultsContainer}>
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Invested Amount</Text>
                <Text style={styles.resultValue}>₹{formatNumber(investedAmount)}</Text>
              </View>
              
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Estimated Returns</Text>
                <Text style={[styles.resultValue, styles.highlightValue]}>
                  ₹{formatNumber(estimatedReturns)}
                </Text>
              </View>
              
              <View style={styles.resultRow}>
                <View style={styles.resultTotalLabel}>
                  <Text style={styles.totalLabel}>Total Value</Text>
                  <Text style={styles.cagrLabel}>(CAGR: {cagr}%)</Text>
                </View>
                <Text style={styles.totalValue}>₹{formatNumber(totalValue)}</Text>
              </View>
            </View>
            
            {/* Pie Chart */}
            <View style={styles.chartContainer}>
              <PieChart
                data={chartData}
                width={SCREEN_WIDTH - 80}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute
                hasLegend={true}
                center={[0, 0]}
              />
            </View>
          </View>
          
          {/* Inflation Adjustment */}
          <View style={styles.infoContainer}>
            <Icon name="information-outline" size={20} color="#9D6DF9" />
            <Text style={styles.infoText}>
              Inflation-adjusted value: <Text style={styles.infoHighlight}>₹{formatNumber(inflationAdjustedValue)}</Text> (assuming 6% inflation rate)
            </Text>
          </View>
        </View>
        
        {/* Calculation Steps (Visible when showSteps is true) */}
        {showSteps && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Calculation Method</Text>
            
            <View style={styles.card}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  <View style={styles.formulaContainer}>
                    <Text style={styles.formulaText}>{step.formula}</Text>
                    <Text style={styles.resultText}>{step.result}</Text>
                  </View>
                  {index < steps.length - 1 && <View style={styles.stepDivider} />}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  infoButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  gradientBanner: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(157, 109, 249, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  currency: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  slider: {
    height: 40,
    marginHorizontal: -5,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  resultsContainer: {
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  highlightValue: {
    color: '#9D6DF9',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultTotalLabel: {
    flexDirection: 'column',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cagrLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  infoHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  formulaContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  formulaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 15,
    color: '#9D6DF9',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  stepDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 16,
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
  gradientButton: {
    borderRadius: 12,
  },
  proceedButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SIPCalculator;