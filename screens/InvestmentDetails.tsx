import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const InvestmentDetail: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params || { uid: 'default-uid' };
  
  const [showDetails, setShowDetails] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState(50000);
  const [expandedHeight] = useState(new Animated.Value(0));
  const [selectedYear, setSelectedYear] = useState(1);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleDetails = () => {
    if (showDetails) {
      Animated.timing(expandedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setShowDetails(false));
    } else {
      setShowDetails(true);
      Animated.timing(expandedHeight, {
        toValue: 280,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const calculateReturns = (years: number) => {
    // Sample return rates based on the year selection
    const returnRates = { 1: 0.10, 3: 0.25, 5: 0.50 };
    const rate = returnRates[years] || 0.10;
    return investmentAmount * (1 + rate);
  };

  const estimatedReturns = calculateReturns(selectedYear);

  return (
    <View style={styles.background}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Navi Nifty 50 Index Fund</Text>
        </View>
        
        {/* Fund Info Card */}
        <Animated.View 
          style={[
            styles.cardShadow,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}>
          <LinearGradient
            colors={['rgba(35, 28, 56, 0.95)', 'rgba(29, 17, 50, 0.98)']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.fundInfo}>
            <Text style={styles.fundType}>Equity • Index • Growth</Text>
            
            <View style={styles.fundDetailsRow}>
              <View style={styles.fundDetailItem}>
                <LinearGradient
                  colors={['rgba(106, 90, 205, 0.3)', 'rgba(72, 61, 139, 0.2)']}
                  style={styles.detailIconBg}>
                  <Icon name="attach-money" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.detailTitle}>Min Investment</Text>
                <Text style={styles.detailValue}>₹10</Text>
              </View>
              
              <View style={styles.fundDetailItem}>
                <LinearGradient
                  colors={['rgba(147, 112, 219, 0.3)', 'rgba(123, 104, 238, 0.2)']}
                  style={styles.detailIconBg}>
                  <Icon name="lock-clock" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.detailTitle}>Lock-in</Text>
                <Text style={styles.detailValue}>None</Text>
              </View>
              
              <View style={styles.fundDetailItem}>
                <LinearGradient
                  colors={['rgba(186, 85, 211, 0.3)', 'rgba(153, 50, 204, 0.2)']}
                  style={styles.detailIconBg}>
                  <Icon name="trending-up" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.detailTitle}>3Y Returns</Text>
                <Text style={styles.detailValue}>21.7%</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.showMoreButton}
              onPress={toggleDetails}
              activeOpacity={0.8}>
              <Text style={styles.showMoreText}>
                Show more details {showDetails ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            
            <Animated.View 
              style={[
                styles.moreDetails, 
                { height: expandedHeight }
              ]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.fundDetailRow}>
                  <Text style={styles.detailRowTitle}>Current NAV (06 Jun 24)</Text>
                  <Text style={styles.detailRowValue}>₹14.6357</Text>
                </View>
                <View style={styles.fundDetailRow}>
                  <Text style={styles.detailRowTitle}>Expense Ratio</Text>
                  <Text style={styles.detailRowValue}>0.26%</Text>
                </View>
                <View style={styles.fundDetailRow}>
                  <Text style={styles.detailRowTitle}>Exit Load</Text>
                  <Text style={styles.detailRowValue}>0.00%</Text>
                </View>
                <View style={styles.fundDetailRow}>
                  <Text style={styles.detailRowTitle}>Fund Size</Text>
                  <Text style={styles.detailRowValue}>₹1846.80 Cr</Text>
                </View>
                <View style={styles.fundDetailRow}>
                  <Text style={styles.detailRowTitle}>Risk</Text>
                  <Text style={[styles.detailRowValue, styles.highRisk]}>Very High</Text>
                </View>
                <View style={styles.fundDetailRow}>
                  <Text style={styles.detailRowTitle}>Fund Manager</Text>
                  <Text style={styles.detailRowValue}>Aditya Mulki</Text>
                </View>
                <View style={styles.fundDetailRow}>
                  <Text style={styles.detailRowTitle}>Fund Age</Text>
                  <Text style={styles.detailRowValue}>2.5 years</Text>
                </View>
              </ScrollView>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
        
        {/* Performance Card */}
        <Animated.View 
          style={[
            styles.cardShadow,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}>
          <LinearGradient
            colors={['rgba(35, 28, 56, 0.95)', 'rgba(29, 17, 50, 0.98)']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.performance}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="insights" size={22} color="#C9A1FF" />
              <Text style={styles.sectionTitle}>Performance</Text>
            </View>
            
            <View style={styles.investmentInputContainer}>
              <Text style={styles.investmentLabel}>If you had invested</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={investmentAmount.toString()}
                  onChangeText={(value) => setInvestmentAmount(Number(value))}
                />
              </View>
            </View>
            
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={1000}
                maximumValue={1000000}
                step={1000}
                value={investmentAmount}
                onValueChange={setInvestmentAmount}
                minimumTrackTintColor="#8A2BE2"
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor="#C9A1FF"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>₹1,000</Text>
                <Text style={styles.sliderLabel}>₹1,000,000</Text>
              </View>
            </View>
            
            <View style={styles.yearSelector}>
              {[1, 3, 5].map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearButton,
                    selectedYear === year && styles.selectedYearButton,
                  ]}
                  onPress={() => setSelectedYear(year)}>
                  <Text
                    style={[
                      styles.yearButtonText,
                      selectedYear === year && styles.selectedYearButtonText,
                    ]}>
                    {year} {year === 1 ? 'yr ago' : 'yrs ago'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <LinearGradient
              colors={['rgba(138, 43, 226, 0.15)', 'rgba(106, 13, 173, 0.05)']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.estimatedContainer}>
              <Text style={styles.estimatedLabel}>Current Value</Text>
              <Text style={styles.estimatedValue}>
                ₹{estimatedReturns.toLocaleString()}
              </Text>
              <Text style={styles.estimatedNote}>
                Based on historical returns
              </Text>
            </LinearGradient>
          </LinearGradient>
        </Animated.View>
        
        {/* FAQ Section */}
        <Animated.View 
          style={[
            styles.cardShadow,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}>
          <LinearGradient
            colors={['rgba(35, 28, 56, 0.95)', 'rgba(29, 17, 50, 0.98)']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.faqContainer}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="help-outline" size={22} color="#C9A1FF" />
              <Text style={styles.sectionTitle}>FAQs</Text>
            </View>
            
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqText}>Why should I invest in Mutual Funds?</Text>
              <Icon name="chevron-right" size={24} color="#8A2BE2" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqText}>How do I track the status of my Mutual Fund investments?</Text>
              <Icon name="chevron-right" size={24} color="#8A2BE2" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqText}>What are the tax implications of mutual fund investments?</Text>
              <Icon name="chevron-right" size={24} color="#8A2BE2" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.continueButtonContainer}
            activeOpacity={0.9}>
            <LinearGradient
              colors={['#8A2BE2', '#6A0DAD']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Icon name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.changeFundButton}>
            <Text style={styles.changeFundText}>Change Fund</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000000', // Pure black background
  },
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 20,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardShadow: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  fundInfo: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  fundType: {
    color: '#FFFFFF', // Changed to white
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  fundDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fundDetailItem: {
    alignItems: 'center',
  },
  detailIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailTitle: {
    color: '#A68BD7', // Changed from gray to light purple
    fontSize: 13,
    marginBottom: 5,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showMoreButton: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
  },
  showMoreText: {
    color: '#C9A1FF',
    textAlign: 'center',
    fontWeight: '600',
  },
  moreDetails: {
    overflow: 'hidden',
    marginTop: 15,
  },
  fundDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRowTitle: {
    color: '#A68BD7', // Changed from gray to light purple
    fontSize: 14,
  },
  detailRowValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  highRisk: {
    color: '#FF6B6B',
  },
  performance: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  investmentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  investmentLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 15,
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.5)',
  },
  currencySymbol: {
    color: '#C9A1FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: 50,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    color: '#FFFFFF', // Changed to white
    fontSize: 12,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  yearButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.2)',
  },
  selectedYearButton: {
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    borderColor: 'rgba(138, 43, 226, 0.8)',
  },
  yearButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  selectedYearButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  estimatedContainer: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  estimatedLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  estimatedValue: {
    color: '#8A2BE2',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(138, 43, 226, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  estimatedNote: {
    color: '#A68BD7', // Changed from gray to light purple
    fontSize: 12,
  },
  faqContainer: {
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  faqText: {
    color: '#FFFFFF',
    fontSize: 15,
    flex: 1,
    paddingRight: 10,
  },
  actionButtonsContainer: {
    padding: 16,
    marginTop: 10,
  },
  continueButtonContainer: {
    borderRadius: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    paddingVertical: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  changeFundButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  changeFundText: {
    color: '#C9A1FF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default InvestmentDetail;