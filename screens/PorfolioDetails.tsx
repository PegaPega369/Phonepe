
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
//import Svg, { Path } from 'react-native-svg';

interface RouteParams {
  uid?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PortfolioDetails: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const uid = params?.uid || 'default-uid';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // State for active tab
  const [activeTab, setActiveTab] = useState('overview');
  
  // Calculate shimmer position for premium effect
  const shimmerPosition = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 1.5]
  });

  // Sample portfolio data
  const portfolioData = {
    balance: '₹78,432',
    growth: '+15.2%',
    investments: [
      { 
        id: '1', 
        name: 'Digital Gold', 
        amount: '₹32,540', 
        growth: '+8.4%', 
        isUp: true,
        lastTransaction: '2 days ago',
        icon: 'gold',
        gradientColors: ['rgba(255, 215, 0, 0.6)', 'rgba(184, 134, 11, 0.7)']
      },
      { 
        id: '2', 
        name: 'Digital Silver', 
        amount: '₹24,860', 
        growth: '+22.7%', 
        isUp: true,
        lastTransaction: '1 month ago',
        icon: 'gold',
        gradientColors: ['rgba(192, 192, 192, 0.6)', 'rgba(169, 169, 169, 0.7)']
      },
      { 
        id: '3', 
        name: 'Mutual Fund', 
        amount: '₹21,032', 
        growth: '+7.3%', 
        isUp: true,
        lastTransaction: '3 weeks ago',
        icon: 'chart-line',
        gradientColors: ['rgba(138, 43, 226, 0.3)', 'rgba(106, 13, 173, 0.4)']
      },
    ],
    transactions: [
      { id: '1', type: 'Investment', asset: 'Digital Gold', amount: '₹5,000', date: '10 Jan 2025', status: 'Completed', isCredit: false },
      { id: '2', type: 'Return', asset: 'P2P Lending', amount: '₹800', date: '05 Jan 2025', status: 'Completed', isCredit: true },
      { id: '3', type: 'Investment', asset: 'SBI Bluechip Fund', amount: '₹10,000', date: '28 Dec 2024', status: 'Completed', isCredit: false },
      { id: '4', type: 'Withdrawal', asset: 'Digital Gold', amount: '₹2,000', date: '15 Dec 2024', status: 'Completed', isCredit: true },
    ]
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Sequence of animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer animation loop
    const runShimmer = () => {
      shimmerValue.setValue(0);
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 2800, // Slower shimmer animation
        useNativeDriver: false,
      }).start(() => {
        setTimeout(runShimmer, 2000); // Longer pause between animations
      });
    };
    
    // Pulse animation for highlights
    const runPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start(() => runPulse());
    };
    
    runShimmer();
    runPulse();
  }, []);

  // Tab content components
  const renderOverview = () => (
    <>
      {/* Portfolio Value Card */}
      <Animated.View 
        style={[
          styles.valueCard, 
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
        <LinearGradient
          colors={['#231537', '#4B0082']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientCard}
        >
          <View style={styles.shineOverlay}>
            <Animated.View 
              style={[
                styles.shimmerEffect,
                {
                  transform: [{ translateX: shimmerPosition }]
                }
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
          
          <Text style={styles.cardLabel}>Total Portfolio Value</Text>
          <Text style={styles.cardValue}>{portfolioData.balance}</Text>
          
          <View style={styles.growthBadge}>
            <Icon name="arrow-up-bold" size={14} color="#4AFF8C" />
            <Text style={styles.growthText}>{portfolioData.growth}</Text>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardActionButton}>
              <Icon name="cash-plus" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Add Money</Text>
            </TouchableOpacity>
            
            <View style={styles.actionDivider} />
            
            <TouchableOpacity style={styles.cardActionButton}>
              <Icon name="cash-minus" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Investment Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Investments</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevron-right" size={16} color="#9D6DF9" />
        </TouchableOpacity>
      </View>
      
      {portfolioData.investments.map((investment, index) => (
        <Animated.View
          key={investment.id}
          style={[
            styles.investmentCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={styles.investmentCardContent}
            activeOpacity={0.8}
          >
            <View style={styles.categoryCardStyle}>
              <View style={[
                styles.categoryIcon, 
                { backgroundColor: investment.name === 'Digital Gold' 
                    ? 'rgba(255, 215, 0, 0.15)' 
                    : investment.name === 'Digital Silver' 
                      ? 'rgba(192, 192, 192, 0.15)' 
                      : 'rgba(157, 109, 249, 0.15)' 
                }
              ]}>
                <Icon 
                  name={investment.icon} 
                  size={20} 
                  color={investment.name === 'Digital Gold' 
                    ? '#FFD700' 
                    : investment.name === 'Digital Silver' 
                      ? '#C0C0C0' 
                      : '#9D6DF9'
                  } 
                />
              </View>
              
              <View style={styles.investmentDetails}>
                <Text style={styles.investmentName}>{investment.name}</Text>
                <Text style={styles.lastTransactionText}>Last transaction: {investment.lastTransaction}</Text>
              </View>
              
              <View style={styles.investmentValues}>
                <Text style={styles.investmentAmount}>{investment.amount}</Text>
                <View style={styles.growthContainer}>
                  <Icon 
                    name={investment.isUp ? "arrow-up-bold" : "arrow-down-bold"} 
                    size={12} 
                    color={investment.isUp ? "#4AFF8C" : "#FF4A4A"} 
                  />
                  <Text 
                    style={[
                      styles.investmentGrowth, 
                      { color: investment.isUp ? "#4AFF8C" : "#FF4A4A" }
                    ]}
                  >
                    {investment.growth}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ))}
      
      {/* Analytics Section */}
      <Animated.View
        style={[
          styles.analyticsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Investment Distribution</Text>
        
        {/* Bar Chart for Asset Distribution */}
        <View style={styles.barChartContainer}>
          {/* Digital Gold Bar */}
          <View style={styles.barGroup}>
            <View style={styles.barLabelContainer}>
              <View style={[styles.barIndicator, { backgroundColor: '#FFD700' }]} />
              <Text style={styles.barLabel}>Digital Gold</Text>
            </View>
            <View style={styles.barRowContainer}>
              <View style={styles.barWrapper}>
                <LinearGradient
                  colors={['#FFD700', '#B8860B']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.bar, { width: '42%' }]}
                />
              </View>
              <Text style={styles.barPercentageInline}>42%</Text>
            </View>
          </View>
          
          {/* Digital Silver Bar */}
          <View style={styles.barGroup}>
            <View style={styles.barLabelContainer}>
              <View style={[styles.barIndicator, { backgroundColor: '#C0C0C0' }]} />
              <Text style={styles.barLabel}>Digital Silver</Text>
            </View>
            <View style={styles.barRowContainer}>
              <View style={styles.barWrapper}>
                <LinearGradient
                  colors={['#C0C0C0', '#A9A9A9']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.bar, { width: '31%' }]}
                />
              </View>
              <Text style={styles.barPercentageInline}>31%</Text>
            </View>
          </View>
          
          {/* Mutual Fund Bar */}
          <View style={styles.barGroup}>
            <View style={styles.barLabelContainer}>
              <View style={[styles.barIndicator, { backgroundColor: '#9D6DF9' }]} />
              <Text style={styles.barLabel}>Mutual Fund</Text>
            </View>
            <View style={styles.barRowContainer}>
              <View style={styles.barWrapper}>
                <LinearGradient
                  colors={['#9C27B0', '#6A0DAD']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.bar, { width: '27%' }]}
                />
              </View>
              <Text style={styles.barPercentageInline}>27%</Text>
            </View>
          </View>
        </View>
        
        {/* Performance Trend Title - outside graph */}
        <Text style={[styles.sectionTitle, {marginTop: 30, marginBottom: 12}]}>Performance Trend</Text>
        
        {/* Performance Graph */}
        <View style={styles.graphContainer}>
          
          <View style={styles.graph}>
            {/* Graph grid lines */}
            <View style={[styles.gridLine, { top: '20%' }]} />
            <View style={[styles.gridLine, { top: '40%' }]} />
            <View style={[styles.gridLine, { top: '60%' }]} />
            <View style={[styles.gridLine, { top: '80%' }]} />
            
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.yLabel}>20%</Text>
              <Text style={styles.yLabel}>15%</Text>
              <Text style={styles.yLabel}>10%</Text>
              <Text style={styles.yLabel}>5%</Text>
              <Text style={styles.yLabel}>0%</Text>
            </View>
            
            {/* Portfolio curve - using View instead of SVG */}
            <View style={styles.portfolioCurve} />
            
            {/* Market curve - using View instead of SVG */}
            <View style={styles.marketCurve} />
            
            {/* Data points - Portfolio */}
            <View style={[styles.dataPoint, styles.portfolioPoint, { bottom: '30%', left: '10%' }]} />
            <View style={[styles.dataPoint, styles.portfolioPoint, { bottom: '45%', left: '30%' }]} />
            <View style={[styles.dataPoint, styles.portfolioPoint, { bottom: '50%', left: '50%' }]} />
            <View style={[styles.dataPoint, styles.portfolioPoint, { bottom: '62%', left: '70%' }]} />
            <View style={[styles.dataPoint, styles.portfolioPoint, { bottom: '70%', left: '90%' }]} />
            
            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
              <Text style={styles.xLabel}>Dec</Text>
              <Text style={styles.xLabel}>Jan</Text>
              <Text style={styles.xLabel}>Feb</Text>
              <Text style={styles.xLabel}>Mar</Text>
              <Text style={styles.xLabel}>Apr</Text>
            </View>
          </View>
          
          <View style={styles.graphLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: '#4AFF8C', height: 3 }]} />
              <Text style={styles.legendText}>Portfolio</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: 'rgba(157, 109, 249, 0.6)', height: 3 }]} />
              <Text style={styles.legendText}>Market Index</Text>
            </View>
          </View>
          
          <View style={styles.performanceMetrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>+15.2%</Text>
              <Text style={styles.metricLabel}>Portfolio YTD</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>+9.8%</Text>
              <Text style={styles.metricLabel}>Market YTD</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
  
  const renderTransactions = () => (
    <>
      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={18} color="#9D6DF9" />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.sortButton}>
          <Icon name="sort" size={18} color="#9D6DF9" />
          <Text style={styles.filterText}>Sort</Text>
        </TouchableOpacity>
      </View>
      
      {portfolioData.transactions.map((transaction, index) => (
        <Animated.View
          key={transaction.id}
          style={[
            styles.transactionCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: Animated.multiply(slideAnim, new Animated.Value(index + 1)) }
              ]
            }
          ]}
        >
          <View style={styles.transactionIconContainer}>
            <LinearGradient
              colors={transaction.isCredit ? ['#4CAF50', '#2E7D32'] : ['#673AB7', '#4B0082']}
              style={styles.transactionIcon}
            >
              <Icon 
                name={transaction.isCredit ? "cash-plus" : "cash-minus"} 
                size={18} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </View>
          
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionType}>{transaction.type}</Text>
            <Text style={styles.transactionAsset}>{transaction.asset}</Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
          </View>
          
          <View style={styles.transactionAmount}>
            <Text 
              style={[
                styles.transactionAmountText,
                { color: transaction.isCredit ? '#4AFF8C' : '#FFFFFF' }
              ]}
            >
              {transaction.isCredit ? '+' : '-'}{transaction.amount}
            </Text>
            <View 
              style={[
                styles.transactionStatus,
                { backgroundColor: transaction.status === 'Completed' ? 'rgba(74, 255, 140, 0.2)' : 'rgba(255, 204, 0, 0.2)' }
              ]}
            >
              <Text 
                style={[
                  styles.transactionStatusText,
                  { color: transaction.status === 'Completed' ? '#4AFF8C' : '#FFCC00' }
                ]}
              >
                {transaction.status}
              </Text>
            </View>
          </View>
        </Animated.View>
      ))}
      
      <TouchableOpacity style={styles.downloadButton}>
        <LinearGradient
          colors={['rgba(35, 21, 55, 0.7)', 'rgba(75, 0, 130, 0.4)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.downloadButtonGradient}
        >
          <Icon name="file-download-outline" size={20} color="#FFFFFF" />
          <Text style={styles.downloadButtonText}>Download Statement</Text>
        </LinearGradient>
      </TouchableOpacity>
    </>
  );

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
        
        <Text style={styles.headerTitle}>Portfolio</Text>
        
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="dots-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
          {activeTab === 'overview' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'transactions' && styles.activeTabButton]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            Transactions
          </Text>
          {activeTab === 'transactions' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' ? renderOverview() : renderTransactions()}
      </ScrollView>
      
      {/* Bottom Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton}>
          <LinearGradient
            colors={['#231537', '#4B0082']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.floatingButtonGradient}
          >
            <Icon name="plus" size={24} color="#FFFFFF" />
            <Text style={styles.floatingButtonText}>Invest More</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  blurCircle: {
    position: 'absolute',
    borderRadius: 300,
    opacity: 0.2,
  },
  blurCircle1: {
    width: 300,
    height: 300,
    backgroundColor: '#4B0082',
    top: -100,
    right: -50,
  },
  blurCircle2: {
    width: 250,
    height: 250,
    backgroundColor: '#8A2BE2',
    bottom: -50,
    left: -100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    paddingVertical: 12,
    marginRight: 24,
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#8A2BE2',
    borderRadius: 1.5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  valueCard: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  gradientCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
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
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 255, 140, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  growthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4AFF8C',
    marginLeft: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 15,
  },
  cardActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#9D6DF9',
  },
  investmentCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  investmentCardContent: {
    borderRadius: 16,
  },
  investmentCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  categoryCardStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(25, 15, 40, 0.4)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  investmentIconContainer: {
    marginRight: 16,
  },
  investmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  investmentDetails: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  lastTransactionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  investmentValues: {
    alignItems: 'flex-end',
  },
  investmentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  investmentGrowth: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 2,
  },
  analyticsContainer: {
    marginTop: 32,
    marginBottom: 24,
  },

  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 109, 249, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 109, 249, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    color: '#9D6DF9',
    marginLeft: 6,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 15, 40, 0.4)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionIconContainer: {
    marginRight: 16,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  transactionAsset: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  transactionStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  downloadButton: {
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  floatingButton: {
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
        elevation: 6,
      },
    }),
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  
  // Bar chart styles
  barChartContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  barGroup: {
    marginBottom: 16,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  barLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  barRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barWrapper: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    flex: 1,
    marginRight: 10,
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  barPercentage: { // Keep for backwards compatibility
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  barPercentageInline: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    width: 40,
    textAlign: 'right',
  },
  
  // Graph styles
  graphContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  graph: {
    height: 220,
    position: 'relative',
    marginBottom: 20,
    paddingTop: 10,
    paddingRight: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  portfolioLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '40%',
    height: 2,
    backgroundColor: '#4AFF8C',
    borderRadius: 1,
  },
  portfolioCurve: {
    position: 'absolute',
    width: '100%',
    borderRadius: 1,
    borderColor: '#4AFF8C',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 20,
    bottom: '20%',
    height: '50%',
  },
  benchmarkLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '30%',
    height: 2,
    backgroundColor: 'rgba(157, 109, 249, 0.6)',
    borderRadius: 1,
    borderStyle: 'dashed',
  },
  marketCurve: {
    position: 'absolute',
    width: '100%',
    borderRadius: 1,
    borderColor: 'rgba(157, 109, 249, 0.6)',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 50,
    bottom: '15%',
    height: '35%',
    opacity: 0.7,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4AFF8C',
    marginLeft: -4,
    marginBottom: -4,
  },
  portfolioPoint: {
    backgroundColor: '#4AFF8C',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  chartSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  yAxisLabels: {
    position: 'absolute',
    top: 0,
    left: -30,
    bottom: 0,
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  yLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -20,
  },
  xLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  graphLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendIndicator: {
    width: 12,
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4AFF8C',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default PortfolioDetails;