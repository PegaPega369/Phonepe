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
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../components/ProfileComponents/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RouteParams {
  uid: string;
}

const ExpenseAnalysis: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as RouteParams;
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];
  
  // Start animations when component mounts
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  // Categories with expenses
  const expenseData = [
    { name: 'Food & Dining', amount: 7850, color: '#FF6B6B', legendFontColor: '#FFFFFF', legendFontSize: 12 },
    { name: 'Transportation', amount: 4250, color: '#4CC2FF', legendFontColor: '#FFFFFF', legendFontSize: 12 },
    { name: 'Shopping', amount: 3600, color: '#FFA94D', legendFontColor: '#FFFFFF', legendFontSize: 12 },
    { name: 'Entertainment', amount: 2200, color: '#9775FA', legendFontColor: '#FFFFFF', legendFontSize: 12 },
    { name: 'Utilities', amount: 1800, color: '#38D9A9', legendFontColor: '#FFFFFF', legendFontSize: 12 },
  ];
  
  // Monthly trend data
  const monthlyTrend = [
    { month: 'JAN', amount: 16500 },
    { month: 'FEB', amount: 15700 },
    { month: 'MAR', amount: 18200 },
    { month: 'APR', amount: 17400 },
    { month: 'MAY', amount: 19700 },
    { month: 'JUN', amount: 17700 },
  ];
  
  const totalExpense = expenseData.reduce((total, item) => total + item.amount, 0);
  
  // Chart configuration
  const chartConfig = {
    backgroundColor: COLORS.cardDark,
    backgroundGradientFrom: COLORS.cardDark,
    backgroundGradientTo: COLORS.cardDark,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
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
        {/* Header */}
        <Animated.View 
          style={[
            styles.headerContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Expense Analysis</Text>
          <Text style={styles.headerSubtitle}>Detailed breakdown of your spending</Text>
          
          <LinearGradient
            colors={['#231537', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.totalCard}
          >
            <View style={styles.totalCardContent}>
              <Text style={styles.totalCardLabel}>Total Expenses</Text>
              <Text style={styles.totalCardAmount}>₹{totalExpense.toLocaleString()}</Text>
              <Text style={styles.totalCardPeriod}>Past 6 months</Text>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* Pie Chart Section */}
        <Animated.View 
          style={[
            styles.chartSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Expense Categories</Text>
          
          <View style={styles.pieChartContainer}>
            <PieChart
              data={expenseData}
              width={SCREEN_WIDTH - 80}
              height={160}
              chartConfig={chartConfig}
              accessor={"amount"}
              backgroundColor={"transparent"}
              paddingLeft={"0"}
              center={[0, 0]}
              absolute
            />
          </View>
        </Animated.View>
        
        {/* Categories List */}
        <Animated.View
          style={[
            styles.categoriesSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Spending Breakdown</Text>
          
          {expenseData.map((category, index) => {
            const percentage = Math.round((category.amount / totalExpense) * 100);
            
            return (
              <View key={index} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <Icon
                    name={
                      category.name === 'Food & Dining' ? 'food' :
                      category.name === 'Transportation' ? 'car' :
                      category.name === 'Shopping' ? 'shopping' :
                      category.name === 'Entertainment' ? 'movie' : 'home'
                    }
                    size={24}
                    color={category.color}
                  />
                </View>
                
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryNameRow}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryPercentage}>{percentage}%</Text>
                  </View>
                  
                  <View style={styles.categoryBar}>
                    <View 
                      style={[
                        styles.categoryBarFill, 
                        { 
                          width: `${percentage}%`,
                          backgroundColor: category.color
                        }
                      ]} 
                    />
                  </View>
                  
                  <View style={styles.categoryAmountRow}>
                    <Text style={styles.categoryAmountPeriod}>Monthly Average</Text>
                    <Text style={styles.categoryAmount}>₹{Math.round(category.amount / 6).toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Animated.View>
        
        {/* Monthly Trend Section */}
        <Animated.View
          style={[
            styles.trendSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Monthly Trends</Text>
          
          <View style={styles.trendContainer}>
            {monthlyTrend.map((month, index) => {
              const maxAmount = Math.max(...monthlyTrend.map(m => m.amount));
              const heightPercentage = (month.amount / maxAmount) * 100;
              
              return (
                <View key={index} style={styles.trendColumn}>
                  <View style={styles.trendBarContainer}>
                    <LinearGradient
                      colors={['#4B0082', '#8A2BE2']}
                      style={[
                        styles.trendBar,
                        { height: `${heightPercentage}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.trendMonth}>{month.month}</Text>
                  <Text style={styles.trendAmount}>₹{(month.amount / 1000).toFixed(1)}k</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
        
        {/* Insights Section */}
        <Animated.View
          style={[
            styles.insightsSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Insights</Text>
          
          <View style={styles.insightCard}>
            <Icon name="trending-up" size={24} color="#FF6B6B" style={styles.insightIcon} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Food spending increased</Text>
              <Text style={styles.insightDescription}>Your food expenses are 15% higher compared to last month.</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Icon name="trending-down" size={24} color="#38D9A9" style={styles.insightIcon} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Transportation costs reduced</Text>
              <Text style={styles.insightDescription}>Your transportation expenses dropped by 8% compared to last month.</Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <Icon name="lightbulb-on" size={24} color="#FFA94D" style={styles.insightIcon} />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Suggestion</Text>
              <Text style={styles.insightDescription}>Setting a budget for entertainment could help save more.</Text>
            </View>
          </View>
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
  totalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  totalCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  totalCardLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  totalCardAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  totalCardPeriod: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  pieChartContainer: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.medium,
  },
  categoriesSection: {
    marginBottom: 30,
    paddingHorizontal: 24,
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
  categoryNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryPercentage: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  categoryBar: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryAmountPeriod: {
    fontSize: 12,
    color: COLORS.textDim,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  trendSection: {
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.15)',
    ...SHADOWS.medium,
    height: 240,
  },
  trendColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  trendBarContainer: {
    height: '70%',
    width: 16,
    justifyContent: 'flex-end',
  },
  trendBar: {
    width: '100%',
    borderRadius: 8,
  },
  trendMonth: {
    fontSize: 12,
    color: COLORS.textDim,
    marginTop: 8,
    marginBottom: 4,
  },
  trendAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  insightsSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  insightIcon: {
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
  },
});

export default ExpenseAnalysis;