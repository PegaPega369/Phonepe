import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import RiskWarningSection from '../components/MutualFundComponents/RiskWarningSection';

interface RouteParams {
  fundId: string;
}

const MutualFund3Screen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { fundId } = route.params as RouteParams;
  
  // Get the fund data
  const fund = mutualFunds.find(f => f.id === '3')!;
  
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
      { icon: 'check-circle', text: 'Concentrated portfolio of high-conviction stocks' },
      { icon: 'check-circle', text: 'Focus on emerging sectors and disruptive companies' },
      { icon: 'check-circle', text: 'Tactical asset allocation for maximum growth' },
      { icon: 'check-circle', text: 'Active trading strategy' }
    ];

    return (
      <View style={styles.tabContent}>
        <Text style={styles.fundDescription}>{fund.details}</Text>
        
        <RiskWarningSection 
          warningText="This fund has a high-risk profile and is suitable for investors with a high risk tolerance and a long-term investment horizon. The fund invests primarily in emerging technologies and sectors that may experience significant volatility." 
        />
        
        <FundInfoGrid fund={fund} />
        
        <StrategySection 
          title="Investment Strategy"
          description="Growth Accelerator Fund pursues maximum capital appreciation through aggressive investment strategies. The fund focuses on emerging sectors, innovative companies, and disruptive technologies with high growth potential."
          points={strategyPoints}
        />
        
        <ActionButtons 
          primaryText="Invest Now"
          secondaryText="Add to Watchlist"
          onPrimaryPress={() => console.log('Invest in Growth Accelerator')}
          onSecondaryPress={() => console.log('Add Growth Accelerator to watchlist')}
        />
      </View>
    );
  };

  const renderPerformanceTab = () => {
    const volatilitySection = (
      <View style={styles.volatilitySection}>
        <Text style={styles.sectionTitle}>Volatility Analysis</Text>
        <View style={styles.volatilityCard}>
          <Text style={styles.volatilityText}>
            This fund exhibits higher volatility compared to benchmark indices and category averages, reflecting its aggressive investment strategy. While this can lead to higher returns, it also presents increased risk.
          </Text>
          <View style={styles.volatilityMetrics}>
            <View style={styles.volatilityMetric}>
              <Text style={styles.volatilityLabel}>Standard Deviation</Text>
              <Text style={styles.volatilityValue}>22.8%</Text>
            </View>
            <View style={styles.volatilityMetric}>
              <Text style={styles.volatilityLabel}>Beta</Text>
              <Text style={styles.volatilityValue}>1.38</Text>
            </View>
            <View style={styles.volatilityMetric}>
              <Text style={styles.volatilityLabel}>Sharpe Ratio</Text>
              <Text style={styles.volatilityValue}>0.92</Text>
            </View>
          </View>
        </View>
      </View>
    );

    return <PerformanceTab returns={fund.returns} additionalSections={volatilitySection} />;
  };

  const renderHoldingsTab = () => {
    const sectors = [
      { name: 'Information Technology', percentage: 35 },
      { name: 'Healthcare', percentage: 22 },
      { name: 'Communication', percentage: 16 },
      { name: 'Consumer Discretionary', percentage: 14 },
      { name: 'Financials', percentage: 8 },
      { name: 'Others', percentage: 5 }
    ];

    const marketCapSection = (
      <View style={styles.marketCapSection}>
        <Text style={styles.holdingsTitle}>Market Cap Distribution</Text>
        <View style={styles.marketCapCard}>
          <View style={styles.marketCapDistribution}>
            <View style={styles.marketCapItem}>
              <View style={styles.marketCapPercentage}>
                <View style={[styles.marketCapCircle, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.marketCapValue}>28%</Text>
              </View>
              <Text style={styles.marketCapLabel}>Large Cap</Text>
            </View>
            
            <View style={styles.marketCapItem}>
              <View style={styles.marketCapPercentage}>
                <View style={[styles.marketCapCircle, { backgroundColor: COLORS.primaryLight }]} />
                <Text style={styles.marketCapValue}>42%</Text>
              </View>
              <Text style={styles.marketCapLabel}>Mid Cap</Text>
            </View>
            
            <View style={styles.marketCapItem}>
              <View style={styles.marketCapPercentage}>
                <View style={[styles.marketCapCircle, { backgroundColor: COLORS.secondary }]} />
                <Text style={styles.marketCapValue}>30%</Text>
              </View>
              <Text style={styles.marketCapLabel}>Small Cap</Text>
            </View>
          </View>
          <Text style={styles.marketCapDescription}>
            The fund has a higher allocation towards mid and small-cap stocks, reflecting its focus on high-growth potential companies.
          </Text>
        </View>
      </View>
    );

    return <HoldingsTab holdings={fund.holdings} sectors={sectors} additionalSection={marketCapSection} />;
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
          iconName="activity" 
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
  volatilitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  volatilityCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  volatilityText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textDim,
    marginBottom: 20,
  },
  volatilityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  volatilityMetric: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.05)',
  },
  volatilityLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  volatilityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  holdingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  marketCapSection: {
    marginTop: 8,
  },
  marketCapCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  marketCapDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  marketCapItem: {
    alignItems: 'center',
  },
  marketCapPercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketCapCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  marketCapValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  marketCapLabel: {
    fontSize: 12,
    color: COLORS.textDim,
  },
  marketCapDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textDim,
    textAlign: 'center',
  },
});

export default MutualFund3Screen;