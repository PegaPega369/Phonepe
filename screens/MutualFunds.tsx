import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOWS } from './theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RouteParams {
  uid: string;
}

export interface MutualFundData {
  id: string;
  name: string;
  shortName: string;
  company: string;
  type: string;
  risk: 'Low' | 'Moderate' | 'High';
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
  };
  nav: number;
  aum: number;
  expenseRatio: number;
  minInvestment: number;
  holdings: { name: string; percentage: number }[];
  details: string;
  established: string;
}


// Export mutual funds data for reuse in detail screens
export const mutualFunds: MutualFundData[] = [
  {
    id: '1',
    name: 'Quantum Long Term Equity Value Fund',
    shortName: 'Take the Leap',
    company: 'Quantum Mutual Fund',
    type: 'Equity - Large Cap',
    risk: 'Moderate',
    returns: {
      oneYear: 12.5,
      threeYear: 15.8,
      fiveYear: 11.2
    },
    nav: 87.42,
    aum: 1250,
    expenseRatio: 0.68,
    minInvestment: 5000,
    holdings: [
      { name: 'HDFC Bank', percentage: 8.5 },
      { name: 'Infosys', percentage: 7.2 },
      { name: 'Reliance Industries', percentage: 6.8 },
      { name: 'TCS', percentage: 5.4 },
      { name: 'ITC Ltd', percentage: 4.9 }
    ],
    details: 'A value-oriented fund that invests in fundamentally strong companies with a long-term perspective. The fund maintains a diversified portfolio across sectors with a focus on quality stocks trading at reasonable valuations.',
    established: '2006'
  },
  {
    id: '2',
    name: 'Axis Bluechip Fund',
    shortName: 'Blue Horizon',
    company: 'Axis Mutual Fund',
    type: 'Equity - Bluechip',
    risk: 'Moderate',
    returns: {
      oneYear: 14.3,
      threeYear: 16.7,
      fiveYear: 13.5
    },
    nav: 43.26,
    aum: 2875,
    expenseRatio: 0.54,
    minInvestment: 1000,
    holdings: [
      { name: 'ICICI Bank', percentage: 9.1 },
      { name: 'HDFC Bank', percentage: 8.7 },
      { name: 'Reliance Industries', percentage: 7.5 },
      { name: 'Infosys', percentage: 6.8 },
      { name: 'Bajaj Finance', percentage: 5.2 }
    ],
    details: 'A high-quality large-cap fund that invests in top 100 companies by market capitalization. The fund follows a growth-oriented approach with a focus on companies with strong competitive advantages and sustainable business models.',
    established: '2009'
  },
  {
    id: '3',
    name: 'SBI Small Cap Fund',
    shortName: 'Growth Accelerator',
    company: 'SBI Mutual Fund',
    type: 'Equity - Small Cap',
    risk: 'High',
    returns: {
      oneYear: 18.9,
      threeYear: 21.4,
      fiveYear: 16.8
    },
    nav: 107.83,
    aum: 1590,
    expenseRatio: 0.78,
    minInvestment: 5000,
    holdings: [
      { name: 'Dixon Technologies', percentage: 4.8 },
      { name: 'V-Guard Industries', percentage: 4.2 },
      { name: 'KNR Constructions', percentage: 3.9 },
      { name: 'JK Paper', percentage: 3.6 },
      { name: 'Navin Fluorine', percentage: 3.4 }
    ],
    details: 'An aggressive small-cap fund that invests in companies ranked between 251-500 by market capitalization. The fund aims to identify future winners with scalable business models, strong management and reasonable valuations.',
    established: '2013'
  }
];

// Helper functions for formatting
export const formatNumber = (num: number, prefix = '') => prefix + num.toLocaleString('en-IN');

export const formatPercentage = (num: number) => {
  const isPositive = num >= 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Icon
        name={isPositive ? 'arrow-up' : 'arrow-down'}
        size={14}
        color={isPositive ? COLORS.success : COLORS.error}
        style={{ marginRight: 4 }}
      />
      <Text style={[styles.percentageText, { color: isPositive ? COLORS.success : COLORS.error }]}> 
        {Math.abs(num).toFixed(1)}%
      </Text>
    </View>
  );
};

export const getRiskColor = (risk: 'Low' | 'Moderate' | 'High') => {
  switch (risk) {
    case 'Low': return COLORS.success;
    case 'Moderate': return COLORS.warning;
    case 'High': return COLORS.error;
    default: return COLORS.warning;
  }
};

const MutualFundScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as RouteParams;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    StatusBar.setBarStyle('light-content');

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const navigateToFundDetail = (fundId: string) => {
    navigation.navigate(`MutualFund${fundId}`, { fundId });
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </Pressable>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
          <Text style={styles.headerTitle}>Curated Mutual Funds</Text>
          <Text style={styles.headerSubtitle}>Handpicked mutual funds with strong track records</Text>
        </Animated.View>

        <Animated.View style={[styles.fundsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {mutualFunds.map((fund) => (
            <Pressable
              key={fund.id}
              onPress={() => navigateToFundDetail(fund.id)}
              style={({ pressed }) => [
                styles.fundCard,
                pressed && { backgroundColor: COLORS.cardDark } // No press color override
              ]}
            >
              <View style={styles.fundHeader}>
                <View style={styles.fundIcon}>
                  <Icon
                    name={fund.id === '1' ? 'bar-chart-2' : fund.id === '2' ? 'trending-up' : 'activity'}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.fundTitleSection}>
                  <Text style={styles.fundName} numberOfLines={1}>{fund.shortName}</Text>
                  <View style={styles.fundSubtitle}>
                    <Text style={styles.fundCompany}>{fund.company}</Text>
                  </View>
                </View>

                <View style={styles.expandButton}>
                  <Icon name="chevron-right" size={24} color={COLORS.textDim} />
                </View>
              </View>

              <View style={styles.fundHighlights}>
                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>1Y Returns</Text>
                  <View style={styles.highlightValue}>{formatPercentage(fund.returns.oneYear)}</View>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>NAV</Text>
                  <Text style={styles.highlightValueText}>₹{fund.nav.toFixed(2)}</Text>
                </View>

                <View style={styles.highlightItem}>
                  <Text style={styles.highlightLabel}>Risk</Text>
                  <View style={[styles.riskPill, { backgroundColor: getRiskColor(fund.risk) }]}> 
                    <Text style={styles.riskText}>{fund.risk}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
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
    top: Platform.OS === 'ios' ? 50 : 16,
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
    paddingTop: Platform.OS === 'ios' ? 100 : 70,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textDim,
  },
  fundsContainer: {
    paddingHorizontal: 24,
    gap: 20,
  },
  fundCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.medium,
  },
  fundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  fundIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  fundTitleSection: {
    flex: 1,
  },
  fundName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  fundSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fundCompany: {
    fontSize: 14,
    color: COLORS.textDim,
    marginRight: 12,
    position: 'relative',
  },
  expandButton: {
    padding: 8,
  },
  fundHighlights: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  highlightItem: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  highlightValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightValueText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  riskPill: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  riskText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});

export default MutualFundScreen;
