import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  TextInput,
  Animated,
  StatusBar,
  PanResponder,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {LineChart} from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');

// Chart data for different timeframes
const chartData = {
  day: [62, 64, 63, 65, 67, 66, 68, 70, 69, 72, 73, 74],
  week: [64, 63, 65, 68, 67, 69, 72, 74, 73, 75, 78, 77],
  month: [62, 65, 64, 67, 70, 68, 72, 75, 74, 77, 80, 78],
  halfYear: [60, 62, 65, 68, 71, 70, 73, 75, 78, 80, 82, 85],
};

// Benefits data
const benefits = [
  {
    title: 'Tax Benefits',
    description:
      'Digital gold held for more than 36 months qualifies for long-term capital gains tax benefits.',
    icon: 'chart-line-variant',
  },
  {
    title: 'Inflation Hedge',
    description:
      'Gold traditionally retains value and protects against inflation over time.',
    icon: 'shield-outline',
  },
  {
    title: 'Portfolio Diversification',
    description:
      'Adding gold to your portfolio reduces overall risk due to its low correlation with stocks.',
    icon: 'chart-pie',
  },
  {
    title: 'High Liquidity',
    description:
      'Digital gold can be sold instantly at prevailing market prices with minimal effort.',
    icon: 'cash-fast',
  },
];

// Quick select amount options
const quickAmounts = [100, 200, 500, 1000, 5000];

// Define chart height
const CHART_HEIGHT = 180;

interface RouteParams {
  uid: string;
}

const GoldSavings: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const {uid} = route.params as RouteParams;

  const [timeframe, setTimeframe] = useState('day');
  const [amount, setAmount] = useState('');
  const [gramsEquivalent, setGramsEquivalent] = useState('0.00');
  const [selectedTab, setSelectedTab] = useState('invest');
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Calculate gold grams equivalent based on input amount
  const calculateGrams = (value: string) => {
    const numValue = parseFloat(value) || 0;
    // Assuming current gold price is ₹78.45 per gram
    const grams = (numValue / 78.45).toFixed(2);
    setGramsEquivalent(grams);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    calculateGrams(value);
  };

  const handleQuickAmountSelect = (value: number) => {
    setAmount(value.toString());
    calculateGrams(value.toString());
  };

  useEffect(() => {
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
  }, []);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderTimeframeButton = (value: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.timeframeButton,
        timeframe === value && styles.activeTimeframeButton,
      ]}
      onPress={() => setTimeframe(value)}>
      <Text
        style={[
          styles.timeframeButtonText,
          timeframe === value && styles.activeTimeframeButtonText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTabButton = (value: string, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === value && styles.activeTabButton,
      ]}
      onPress={() => setSelectedTab(value)}>
      <Icon
        name={icon}
        size={20}
        color={selectedTab === value ? '#FFF' : 'rgba(255, 255, 255, 0.6)'}
      />
      <Text
        style={[
          styles.tabButtonText,
          selectedTab === value && styles.activeTabButtonText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const [touchX, setTouchX] = useState<number | null>(null);
  const chartWidth = width - 32;
  const chartRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        setTouchX(null);
      },
    })
  ).current;

  const handleTouch = (x: number) => {
    // Ensure touch is within chart bounds
    if (x >= 0 && x <= chartWidth) {
      setTouchX(x);
    }
  };

  // Chart data mapping based on timeframe
  const getChartData = () => {
    let labels = ['23rd Mar', '', '', '', '', '', '22nd Apr'];
    let data;

    switch(timeframe) {
      case 'day':
        data = [77450, 77550, 77400, 77800, 78100, 78300, 78450];
        break;
      case 'week':
        data = [77800, 77950, 78100, 77900, 78300, 78380, 78450];
        break;
      case 'month':
        data = [70450, 72500, 73800, 74900, 76300, 77600, 78450];
        break;
      case 'halfYear':
        data = [65450, 67800, 70600, 72900, 75200, 77100, 78450];
        break;
      default:
        data = [70450, 72500, 73800, 74900, 76300, 77600, 78450];
    }

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(157, 109, 249, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#2A0F43',
    backgroundGradientTo: '#2A0F43',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#9D6DF9',
    },
    propsForBackgroundLines: {
      stroke: 'rgba(255,255,255,0.06)'
    },
    fillShadowGradient: 'rgba(157, 109, 249, 0.15)',
    fillShadowGradientOpacity: 0.3,
  };

  const renderChart = () => {
    const chartData = getChartData();
    
    return (
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={width - 48}
          height={250}
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
          withHorizontalLines={true}
          withVerticalLines={false}
          withDots={true}
          withShadow={false}
          withInnerLines={true}
          withOuterLines={false}
          formatYLabel={(value) => `₹${Number(value).toLocaleString('en-IN')}`}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header backdrop for scroll effect */}
      <Animated.View
        style={[styles.headerBackdrop, {opacity: headerOpacity}]}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Gold Investment</Text>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}>
        {/* Gold Price Card */}
        <View style={styles.priceCardContainer}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <LinearGradient
              colors={['#231537', '#4B0082']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.priceCard}>
              <View style={styles.priceCardHeader}>
                <View style={styles.silverBadge}>
                  <Icon name="gold" size={16} color="#FFFFFF" />
                  <Text style={styles.silverText}>Gold</Text>
                </View>
                <View style={styles.priceChange}>
                  <Icon name="arrow-up" size={12} color="#4CD964" />
                  <Text style={styles.priceChangeText}>+2.45%</Text>
                </View>
              </View>

              <View style={styles.priceDisplay}>
                <Text style={styles.currentPrice}>₹78,450</Text>
                <Text style={styles.perUnitText}>per kg</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>24h High</Text>
                  <Text style={styles.statValue}>₹78,690</Text>
                </View>
                <View style={styles.statSeparator} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>24h Low</Text>
                  <Text style={styles.statValue}>₹76,120</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Chart section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Price Trend</Text>

          <View style={styles.card}>
            <View style={styles.timeframeSelector}>
              {renderTimeframeButton('day', '1D')}
              {renderTimeframeButton('week', '1W')}
              {renderTimeframeButton('month', '1M')}
              {renderTimeframeButton('halfYear', '6M')}
            </View>

            {renderChart()}
          </View>
        </View>

        {/* Tabs for Invest/Benefits */}
        <View style={styles.sectionContainer}>
          <View style={styles.tabsContainer}>
            {renderTabButton('invest', 'Invest', 'cash-plus')}
            {renderTabButton('benefits', 'Benefits', 'star-outline')}
          </View>
        </View>

        {/* Tab content */}
        {selectedTab === 'invest' ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Buy Digital Gold</Text>

            <View style={styles.card}>
              <Text style={styles.inputLabel}>Enter Amount (₹)</Text>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.05)',
                  'rgba(255, 255, 255, 0.02)',
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  selectionColor="#8A2BE2"
                />
              </LinearGradient>

              <Text style={styles.gramsConversion}>
                ≈ {gramsEquivalent} grams of digital gold
              </Text>

              <Text style={styles.quickSelectLabel}>Quick Select</Text>
              <View style={styles.quickSelectContainer}>
                <View style={styles.quickSelectRow}>
                  {quickAmounts.slice(0, 3).map(value => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.quickSelectButton,
                        amount === value.toString() &&
                          styles.activeQuickSelectButton,
                      ]}
                      onPress={() => handleQuickAmountSelect(value)}>
                      <LinearGradient
                        colors={
                          amount === value.toString()
                            ? ['#4B0082', '#231537']
                            : [
                                'rgba(255, 255, 255, 0.05)',
                                'rgba(255, 255, 255, 0.02)',
                              ]
                        }
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.quickSelectGradient}>
                        <Text
                          style={[
                            styles.quickSelectText,
                            amount === value.toString() &&
                              styles.activeQuickSelectText,
                          ]}>
                          ₹{value}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.quickSelectRowCentered}>
                  {quickAmounts.slice(3, 5).map(value => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.quickSelectButton,
                        styles.largeQuickSelectButton,
                        amount === value.toString() &&
                          styles.activeQuickSelectButton,
                      ]}
                      onPress={() => handleQuickAmountSelect(value)}>
                      <LinearGradient
                        colors={
                          amount === value.toString()
                            ? ['#4B0082', '#231537']
                            : [
                                'rgba(255, 255, 255, 0.05)',
                                'rgba(255, 255, 255, 0.02)',
                              ]
                        }
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={styles.quickSelectGradient}>
                        <Text
                          style={[
                            styles.quickSelectText,
                            amount === value.toString() &&
                              styles.activeQuickSelectText,
                          ]}>
                          ₹{value}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Icon name="shield-check" size={20} color="#9D6DF9" />
              <Text style={styles.infoText}>
                Your digital gold is 100% backed by physical gold and securely
                stored in our vault.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Benefits of Gold Investment</Text>

            {benefits.map((benefit, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.benefitHeader}>
                  <Icon name={benefit.icon} size={24} color="#9D6DF9" />
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                </View>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['#231537', '#4B0082']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.gradientButton}>
          <TouchableOpacity
            style={styles.proceedButton}
            activeOpacity={0.8}
            disabled={!amount && selectedTab === 'invest'}>
            <Text style={styles.proceedButtonText}>
              {selectedTab === 'invest' ? 'Buy Now' : 'Start Investing'}
            </Text>
            {selectedTab === 'invest' && (
              <Icon
                name="arrow-right"
                size={18}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
            )}
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
  headerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
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
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  priceCardContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  priceCard: {
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#4B0082',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  priceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  silverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  silverText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CD964',
    marginLeft: 4,
  },
  priceDisplay: {
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  perUnitText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statSeparator: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timeframeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeframeButton: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
  },
  activeTimeframeButton: {
    backgroundColor: 'rgba(157, 109, 249, 0.2)',
  },
  timeframeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTimeframeButtonText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    height: 220,
    marginBottom: 8,
    paddingTop: 10,
    paddingBottom: 5,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  currentPriceIndicator: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 109, 249, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentPriceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9D6DF9',
    marginRight: 6,
  },
  currentPriceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dateLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  dateLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  touchDateText: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(157, 109, 249, 0.2)',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  activeTabButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 0,
  },
  gramsConversion: {
    fontSize: 14,
    color: '#9D6DF9',
    textAlign: 'right',
    marginBottom: 20,
  },
  quickSelectLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  quickSelectContainer: {
    marginHorizontal: -4,
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickSelectRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickSelectButton: {
    width: (width - 48) / 3 - 4,
    marginHorizontal: 2,
    marginBottom: 8,
  },
  largeQuickSelectButton: {
    width: (width - 48) / 3 - 4,
    marginHorizontal: 6,
  },
  activeQuickSelectButton: {
    transform: [{scale: 1.05}],
  },
  quickSelectGradient: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeQuickSelectText: {
    color: '#FFFFFF',
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
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
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
  gradientButton: {
    borderRadius: 12,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  chartTouchArea: {
    height: CHART_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  touchDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9D6DF9',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 3,
  },
  touchPriceIndicator: {
    position: 'absolute',
    backgroundColor: 'rgba(157, 109, 249, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  touchPriceText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default GoldSavings;