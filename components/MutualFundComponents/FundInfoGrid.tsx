import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../screens/theme';
import { formatNumber } from '../../screens/MutualFunds';

interface FundInfoGridProps {
  fund: {
    aum: number;
    expenseRatio: number;
    minInvestment: number;
    established: string;
  };
}

const FundInfoGrid: React.FC<FundInfoGridProps> = ({ fund }) => {
  return (
    <View style={styles.fundInfoGrid}>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Icon name="bar-chart-2" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>AUM Size</Text>
            <Text style={styles.infoValue}>₹{formatNumber(fund.aum)} Cr</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Icon name="percent" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Expense Ratio</Text>
            <Text style={styles.infoValue}>{fund.expenseRatio}%</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Icon name="credit-card" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Min Investment</Text>
            <Text style={styles.infoValue}>₹{fund.minInvestment}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <View style={styles.infoIcon}>
            <Icon name="calendar" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Established</Text>
            <Text style={styles.infoValue}>{fund.established}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fundInfoGrid: {
    gap: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `rgba(${parseInt(COLORS.primary.slice(1, 3), 16)}, ${parseInt(COLORS.primary.slice(3, 5), 16)}, ${parseInt(COLORS.primary.slice(5, 7), 16)}, 0.1)`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
});

export default FundInfoGrid;