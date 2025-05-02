import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../../screens/theme';

interface Returns {
  oneYear: number;
  threeYear: number;
  fiveYear: number;
}

interface PerformanceTabProps {
  returns: Returns;
  additionalSections?: React.ReactNode;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({ returns, additionalSections }) => {
  const maxReturn = Math.max(returns.oneYear, returns.threeYear, returns.fiveYear, 25);
  
  return (
    <View style={styles.tabContent}>
      <View style={styles.performanceChart}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Returns</Text>
        </View>
        <View style={styles.barChart}>
          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>1 Year</Text>
            <View style={styles.chartBarContainer}>
              <View style={[
                styles.chartBar,
                { width: `${(returns.oneYear / maxReturn) * 100}%` }
              ]} />
            </View>
            <Text style={[
              styles.percentageText,
              { color: returns.oneYear >= 0 ? COLORS.success : COLORS.error }
            ]}>
              {returns.oneYear >= 0 ? '+' : ''}{returns.oneYear.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>3 Years</Text>
            <View style={styles.chartBarContainer}>
              <View style={[
                styles.chartBar,
                { width: `${(returns.threeYear / maxReturn) * 100}%` }
              ]} />
            </View>
            <Text style={[
              styles.percentageText,
              { color: returns.threeYear >= 0 ? COLORS.success : COLORS.error }
            ]}>
              {returns.threeYear >= 0 ? '+' : ''}{returns.threeYear.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.chartRow}>
            <Text style={styles.chartLabel}>5 Years</Text>
            <View style={styles.chartBarContainer}>
              <View style={[
                styles.chartBar,
                { width: `${(returns.fiveYear / maxReturn) * 100}%` }
              ]} />
            </View>
            <Text style={[
              styles.percentageText,
              { color: returns.fiveYear >= 0 ? COLORS.success : COLORS.error }
            ]}>
              {returns.fiveYear >= 0 ? '+' : ''}{returns.fiveYear.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.performanceMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Alpha</Text>
          <Text style={styles.metricValue}>1.82</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Beta</Text>
          <Text style={styles.metricValue}>0.92</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Sharpe Ratio</Text>
          <Text style={styles.metricValue}>1.34</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Standard Dev</Text>
          <Text style={styles.metricValue}>18.2%</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Sortino Ratio</Text>
          <Text style={styles.metricValue}>1.76</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>R-Squared</Text>
          <Text style={styles.metricValue}>0.85</Text>
        </View>
      </View>

      {additionalSections}

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Past performance is not indicative of future returns. Investment value can go up and down. Read all scheme related documents carefully.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: 24,
  },
  performanceChart: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  chartHeader: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  barChart: {
    gap: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartLabel: {
    width: 80,
    fontSize: 13,
    color: COLORS.textDim,
  },
  chartBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  performanceMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  disclaimer: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '500',
    width: 80,
    textAlign: 'right',
  },
});

export default PerformanceTab;