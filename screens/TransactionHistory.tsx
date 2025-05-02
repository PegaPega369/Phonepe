import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Navbar from '../components/Navbar';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../components/ProfileComponents/theme';

interface RouteParams {
  uid?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sample transaction data
const transactions = [
  {
    id: '1',
    title: 'Starbucks Coffee',
    category: 'Food & Dining',
    amount: 350,
    date: '16 Mar, 2025',
    time: '10:30 AM',
    type: 'expense',
    icon: 'food'
  },
  {
    id: '2',
    title: 'March Salary',
    category: 'Income',
    amount: 85000,
    date: '15 Mar, 2025',
    time: '9:00 AM',
    type: 'income',
    icon: 'cash-plus'
  },
  {
    id: '3',
    title: 'Uber Ride',
    category: 'Transportation',
    amount: 250,
    date: '14 Mar, 2025',
    time: '7:45 PM',
    type: 'expense',
    icon: 'car'
  },
  {
    id: '4',
    title: 'Amazon Purchase',
    category: 'Shopping',
    amount: 2499,
    date: '12 Mar, 2025',
    time: '3:20 PM',
    type: 'expense',
    icon: 'shopping'
  },
  {
    id: '5',
    title: 'Netflix Subscription',
    category: 'Entertainment',
    amount: 649,
    date: '10 Mar, 2025',
    time: '12:00 AM',
    type: 'expense',
    icon: 'movie-open'
  },
  {
    id: '6',
    title: 'Freelance Project',
    category: 'Income',
    amount: 15000,
    date: '8 Mar, 2025',
    time: '4:30 PM',
    type: 'income',
    icon: 'cash-plus'
  },
  {
    id: '7',
    title: 'Electricity Bill',
    category: 'Utilities',
    amount: 1850,
    date: '5 Mar, 2025',
    time: '11:15 AM',
    type: 'expense',
    icon: 'flash'
  },
  {
    id: '8',
    title: 'Gold Investment',
    category: 'Investment',
    amount: 5000,
    date: '3 Mar, 2025',
    time: '2:40 PM',
    type: 'expense',
    icon: 'gold'
  }
];

const TransactionItem = ({ transaction, index, animatedValue }) => {
  const categoryColors = {
    'Food & Dining': '#FF6B6B',
    'Income': '#2ED573',
    'Transportation': '#4CC2FF',
    'Shopping': '#FFA94D',
    'Entertainment': '#A367DC',
    'Utilities': '#54A0FF',
    'Investment': '#FFDA79'
  };
  
  const color = categoryColors[transaction.category] || COLORS.primary;
  const iconBgColor = `${color}20`;
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0]
  });
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  return (
    <Animated.View 
      style={[
        styles.transactionItem,
        { 
          transform: [{ translateY }],
          opacity
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        <Icon name={transaction.icon} size={20} color={color} />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{transaction.title}</Text>
        <Text style={styles.transactionCategory}>{transaction.category}</Text>
        <Text style={styles.transactionTime}>
          {transaction.date} • {transaction.time}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text 
          style={[
            styles.transactionAmount, 
            transaction.type === 'income' ? styles.incomeText : styles.expenseText
          ]}
        >
          {transaction.type === 'income' ? '+' : '-'} ₹{transaction.amount.toLocaleString()}
        </Text>
      </View>
    </Animated.View>
  );
};

const FilterChip = ({ label, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.activeFilterChip]}
      onPress={onPress}
    >
      <Text 
        style={[styles.filterChipText, isActive && styles.activeFilterChipText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const TransactionHistory: React.FC = () => {
  const route = useRoute();
  const { uid } = route.params as RouteParams;
  const navigation = useNavigation();
  
  // Animation values
  const headerOpacity = useState(new Animated.Value(0))[0];
  const [animatedValues] = useState(() => 
    transactions.map(() => new Animated.Value(0))
  );
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState('All');
  const filterOptions = ['All', 'Income', 'Expense', 'Investments'];
  
  // Start animations when component mounts
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Header animation
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
    
    // Transaction list animations with staggered effect
    Animated.stagger(
      100,
      animatedValues.map(animValue =>
        Animated.timing(animValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      )
    ).start();
  }, []);
  
  // Filter transactions based on active filter
  const getFilteredTransactions = () => {
    if (activeFilter === 'All') return transactions;
    if (activeFilter === 'Income') return transactions.filter(t => t.type === 'income');
    if (activeFilter === 'Expense') return transactions.filter(t => t.type === 'expense');
    if (activeFilter === 'Investments') return transactions.filter(t => t.category === 'Investment');
    return transactions;
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  return (
    <SafeAreaView style={styles.background}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View 
          style={[styles.headerContainer, { opacity: headerOpacity }]}
        >
          <Text style={styles.headerTitle}>Transaction History</Text>
          <Text style={styles.headerSubtitle}>
            View and track all your financial activities
          </Text>
          
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, styles.incomeText]}>
                +₹100,000
              </Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, styles.expenseText]}>
                -₹11,098
              </Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Filter chips */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {filterOptions.map((filter, index) => (
              <FilterChip
                key={index}
                label={filter}
                isActive={activeFilter === filter}
                onPress={() => setActiveFilter(filter)}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Transaction list */}
        <View style={styles.transactionListContainer}>
          <View style={styles.transactionListHeader}>
            <Text style={styles.transactionListTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {filteredTransactions.map((transaction, index) => (
            <TransactionItem 
              key={transaction.id}
              transaction={transaction}
              index={index}
              animatedValue={animatedValues[index]}
            />
          ))}
          
          {filteredTransactions.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="cards-outline" size={60} color={COLORS.textDim} />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          )}
        </View>
        
        {/* Add new transaction button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton}>
            <LinearGradient
              colors={COLORS.purpleGradient}
              style={styles.addButtonGradient}
            >
              <Icon name="plus" size={24} color="#FFF" />
              <Text style={styles.addButtonText}>Add Transaction</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <Navbar uid={uid} />
    </SafeAreaView>
  );
};

export default TransactionHistory;

const styles = StyleSheet.create({
  background: {
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
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 80,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.medium,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#2ED573',
  },
  expenseText: {
    color: '#FF6B6B',
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(35, 35, 45, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  activeFilterChipText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  transactionListContainer: {
    paddingHorizontal: 20,
  },
  transactionListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 13,
    color: COLORS.textDim,
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  amountContainer: {
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textDim,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom:20,
    ...SHADOWS.medium,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});