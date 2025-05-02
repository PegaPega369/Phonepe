import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SHADOWS } from './theme';
import { mutualFunds, formatPercentage, MutualFundData } from './MutualFunds';
import FundBackground from '../components/MutualFundComponents/FundBackground';
import FundHeader from '../components/MutualFundComponents/FundHeader';
import FundTabsNavigation from '../components/MutualFundComponents/FundTabsNavigation';
import BackButton from '../components/MutualFundComponents/BackButton';
import FundInfoGrid from '../components/MutualFundComponents/FundInfoGrid';
import StrategySection from '../components/MutualFundComponents/StrategySection';
import PerformanceTab from '../components/MutualFundComponents/PerformanceTab';
import HoldingsTab from '../components/MutualFundComponents/HoldingsTab';
import ActionButtons from '../components/MutualFundComponents/ActionButtons';

interface RouteParams {
  fundId: string;
}

const MutualFund1Screen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { fundId } = route.params as RouteParams;
  
  // Get the fund data
  const fund = mutualFunds.find(f => f.id === '1')!;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('overview');

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
  }, [fadeAnim, slideAnim]);

  const renderOverviewTab = () => {
    const strategyPoints = [
      { icon: 'check-circle', text: 'Long-term wealth creation' },
      { icon: 'check-circle', text: 'Low portfolio turnover' },
      { icon: 'check-circle', text: 'Focus on company fundamentals' },
      { icon: 'check-circle', text: 'Disciplined investment process' }
    ];

    return (
      <View style={styles.tabContent}>
        <Text style={styles.fundDescription}>{fund.details}</Text>
        
        <FundInfoGrid fund={fund} />
        
        <StrategySection 
          title="Investment Strategy"
          description="Quantum Long Term Equity Value Fund follows a value-driven approach to identify fundamentally strong companies trading at reasonable valuations. The fund maintains a diversified portfolio across sectors with a focus on quality stocks."
          points={strategyPoints}
        />
        
        <ActionButtons 
          primaryText="Invest Now"
          secondaryText="Add to Watchlist"
          onPrimaryPress={() => console.log('Invest in Take the Leap')}
          onSecondaryPress={() => console.log('Add Take the Leap to watchlist')}
        />
      </View>
    );
  };

  const renderPerformanceTab = () => {
    const benchmarkSection = (
      <View style={styles.benchmarkSection}>
        <Text style={styles.sectionTitle}>Benchmark Comparison</Text>
        <View style={styles.benchmarkCard}>
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkLabel}>Fund</Text>
            <Text style={styles.benchmarkValue}>12.5%</Text>
          </View>
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkLabel}>Nifty 50</Text>
            <Text style={styles.benchmarkValue}>10.2%</Text>
          </View>
          <View style={styles.benchmarkRow}>
            <Text style={styles.benchmarkLabel}>Category Average</Text>
            <Text style={styles.benchmarkValue}>9.7%</Text>
          </View>
        </View>
      </View>
    );

    return <PerformanceTab returns={fund.returns} additionalSections={benchmarkSection} />;
  };

  const renderHoldingsTab = () => {
    const sectors = [
      { name: 'Financial Services', percentage: 32 },
      { name: 'Information Technology', percentage: 24 },
      { name: 'Consumer Goods', percentage: 16 },
      { name: 'Energy', percentage: 12 },
      { name: 'Others', percentage: 16 }
    ];

    return <HoldingsTab holdings={fund.holdings} sectors={sectors} />;
  };

  return (
    <FundBackground>
      <BackButton onPress={() => navigation.goBack()} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Fund Header */}
        <FundHeader 
          fund={fund} 
          fadeAnim={fadeAnim} 
          slideAnim={slideAnim} 
          iconName="bar-chart-2" 
        />
        
        {/* Tabs Navigation */}
        <FundTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'holdings' && renderHoldingsTab()}
      </ScrollView>
    </FundBackground>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  tabContent: {
    padding: 24,
  },
  fundDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textDim,
    marginBottom: 24,
  },
  benchmarkSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  benchmarkCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  benchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  benchmarkLabel: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  benchmarkValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.success,
  },
});

export default MutualFund1Screen;