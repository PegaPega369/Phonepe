import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../components/ProfileComponents/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExpenseTrackerProps {
  uid?: string;
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ uid }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const routeUid = uid || (route.params as { uid?: string })?.uid;
  
  // Animation values
  const headerAnimation = useState(new Animated.Value(0))[0];
  const chartAnimation = useState(new Animated.Value(0))[0];
  const cardsAnimation = useState(new Animated.Value(0))[0];
  
  // Time periods for expense data
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const periods = ['1M', '3M', '6M', '1Y'];
  
  // Months data based on selected period
  const getMonthsData = () => {
    switch(selectedPeriod) {
      case '1M':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [1200, 950, 1400, 1100],
          average: 1163
        };
      case '3M':
        return {
          labels: ['APR', 'MAY', 'JUN', 'JUL'],
          data: [1642, 1280, 2100, 1500],
          average: 1631
        };
      case '6M':
        return {
          labels: ['FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'],
          data: [1450, 1600, 1642, 1280, 2100, 1500],
          average: 1595
        };
      case '1Y':
        return {
          labels: ['AUG', 'OCT', 'DEC', 'FEB', 'APR', 'JUN'],
          data: [1300, 1550, 1870, 1450, 1642, 1500],
          average: 1552
        };
      default:
        return {
          labels: ['APR', 'MAY', 'JUN', 'JUL'],
          data: [1642, 1280, 2100, 1500],
          average: 1631
        };
    }
  };
  
  const monthsData = getMonthsData();
  
  // Categories with highest expenses
  const categories = [
    { name: 'Food & Dining', amount: 7850, icon: 'food', color: '#FF6B6B' },
    { name: 'Transportation', amount: 4250, icon: 'car', color: '#4CC2FF' },
    { name: 'Shopping', amount: 3600, icon: 'shopping', color: '#FFA94D' }
  ];
  
  // Start animations when component mounts
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    Animated.sequence([
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(chartAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(cardsAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  // Create chart data object
  const chartData = {
    labels: monthsData.labels,
    datasets: [
      {
        data: monthsData.data,
        color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`, // Purple color
        strokeWidth: 2.5,
      }
    ]
  };
  
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: COLORS.cardDark,
    backgroundGradientTo: COLORS.cardDark,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
    propsForBackgroundLines: {
      strokeWidth: 0, // Remove grid lines completely
    },
    fillShadowGradient: COLORS.primary,
    fillShadowGradientOpacity: 0.3,
    fromZero: true,
  };
  
  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Animation */}
        <Animated.View 
          style={[
            styles.headerContainer, 
            {
              opacity: headerAnimation,
              transform: [
                {
                  scale: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Expense Tracker</Text>
          <Text style={styles.headerSubtitle}>Track and analyze your spending</Text>
          
          <Animated.View style={[
            styles.expenseSummary,
            {
              opacity: headerAnimation,
              transform: [
                {
                  scale: headerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.94, 1]
                  })
                }
              ]
            }
          ]}>
            <View style={styles.expenseTotal}>
              <Text style={styles.expenseTotalLabel}>Total Expenses</Text>
              <View style={styles.expenseTotalAmount}>
                <Text style={styles.rupeesSymbol}>₹</Text>
                <Text style={styles.expenseTotalValue}>
                  {monthsData.data.reduce((sum, current) => sum + current, 0).toLocaleString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.expenseAverage}>
              <Text style={styles.expenseAverageLabel}>Monthly Average</Text>
              <Text style={styles.expenseAverageValue}>
                ₹{monthsData.average.toLocaleString()}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
        
        {/* Chart Section with Animation */}
        <Animated.View 
          style={[
            styles.chartSection, 
            {
              opacity: chartAnimation,
              transform: [
                {
                  translateY: chartAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Spending Trend</Text>
            
            <View style={styles.periodSelector}>
              {periods.map(period => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodOption,
                    selectedPeriod === period && styles.selectedPeriod
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text
                    style={[
                      styles.periodText,
                      selectedPeriod === period && styles.selectedPeriodText
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Animated.View style={[
            styles.chartContainer,
            {
              opacity: chartAnimation,
              transform: [
                {
                  scale: chartAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1]
                  })
                }
              ]
            }
          ]}>
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              withInnerLines={false}
              withOuterLines={false}
              withDots={true}
              withShadow={false}
              style={styles.chart}
              formatYLabel={(value) => `₹${parseInt(value).toLocaleString()}`}
            />
          </Animated.View>
        </Animated.View>
        
        {/* Categories Section with Animation */}
        <Animated.View 
          style={[
            styles.categoriesSection, 
            {
              opacity: cardsAnimation,
              transform: [
                {
                  translateY: cardsAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Top Spending Categories</Text>
          
          {categories.map((category, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.categoryCard,
                {
                  opacity: cardsAnimation,
                  transform: [
                    {
                      scale: cardsAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1]
                      })
                    }
                  ]
                }
              ]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <Icon name={category.icon} size={24} color={category.color} />
              </View>
              
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryBar}>
                  <View 
                    style={[
                      styles.categoryBarFill, 
                      { 
                        width: `${(category.amount / 10000) * 100}%`,
                        backgroundColor: category.color
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <Text style={styles.categoryAmount}>₹{category.amount}</Text>
            </Animated.View>
          ))}
        </Animated.View>
        
        {/* Action Cards with Animation */}
        
        <Animated.View 
          style={[
            styles.actionCards, 
            {
              opacity: cardsAnimation,
              transform: [
                {
                  translateY: cardsAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Others</Text>
          <Animated.View
            style={[
              styles.actionCard,
              {
                opacity: cardsAnimation,
                transform: [
                  {
                    scale: cardsAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity 
              style={{flex: 1}}
              onPress={() => navigation.navigate('Transactions', { uid: routeUid })}
            >
              
              <Text style={styles.cardTitle}>Transaction History</Text>
              <View style={styles.actionCardRow}>
                <Icon name="history" size={24} color={COLORS.primary} />
                <Text style={styles.cardDescription}>View all your past transactions</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.actionCard,
              {
                opacity: cardsAnimation,
                transform: [
                  {
                    scale: cardsAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1]
                    })
                  }
                ]
              }
            ]}
          >
           <TouchableOpacity 
              style={{ flex: 1 }}
              onPress={() => navigation.navigate('ExpenseAnalysis', { uid: routeUid })}
            >
              <Text style={styles.cardTitle}>Expense Analysis</Text>
              <View style={styles.actionCardRow}>
                <Icon name="chart-pie" size={24} color="#4CC2FF" />
                <Text style={styles.cardDescription}>Detailed breakdown of your spending</Text>
              </View>
          </TouchableOpacity>
          </Animated.View>
          
          {/* <Animated.View
            style={[
              styles.actionCard,
              {
                opacity: cardsAnimation,
                transform: [
                  {
                    scale: cardsAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => navigation.navigate('BudgetGoals', { uid: routeUid })}
              >
                <Text style={styles.cardTitle}>Budget Goals</Text>
                <View style={styles.actionCardRow}>
                  <Icon name="target" size={24} color="#2ED573" />
                  <Text style={styles.cardDescription}>Set and track your budget targets</Text>
                </View>
            </TouchableOpacity>
          </Animated.View> */}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textDim,
    marginBottom: 24,
  },
  expenseSummary: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.medium,
  },
  expenseTotal: {
    marginBottom: 16,
  },
  expenseTotalLabel: {
    fontSize: 15,
    color: COLORS.textDim,
    marginBottom: 6,
  },
  expenseTotalAmount: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rupeesSymbol: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 2,
    paddingBottom: 3,
  },
  expenseTotalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  expenseAverage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  expenseAverageLabel: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  expenseAverageValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chartSection: {
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 25, 35, 0.6)',
    borderRadius: 8,
    padding: 2,
  },
  periodOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedPeriod: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 12,
    color: COLORS.textDim,
  },
  selectedPeriodText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.02)',
    ...SHADOWS.medium,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    marginLeft:2,
    marginRight:2,
  },
  categoriesSection: {
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  categoryBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 16,
  },
  actionCards: {
    paddingHorizontal: 24,
  },
  actionCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.medium,
  },
  cardGradient: {
    width: '100%',
    borderRadius: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    paddingLeft: 16,
    paddingTop: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    flex: 1,
    marginLeft: 12,
  },
  actionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default ExpenseTracker;