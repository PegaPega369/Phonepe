import React from 'react';
import { StyleSheet, View, Text, Platform, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SHADOWS } from '../../screens/theme';
import { formatPercentage, getRiskColor } from '../../screens/MutualFunds';

interface FundHeaderProps {
  fund: {
    name: string;
    company: string;
    nav: number;
    returns: {
      oneYear: number;
    };
    risk: 'Low' | 'Moderate' | 'High';
  };
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  iconName: string;
}

const FundHeader: React.FC<FundHeaderProps> = ({ fund, fadeAnim, slideAnim, iconName }) => {
  return (
    <Animated.View 
      style={[
        styles.fundHeader, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.headerGradient}>
        <View style={styles.fundIcon}>
          <Icon name={iconName} size={36} color={COLORS.primary} />
        </View>
        
        <Text style={styles.fundName}>{fund.name}</Text>
        <Text style={styles.fundCompany}>{fund.company}</Text>
        
        <View style={styles.fundQuickInfo}>
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>NAV</Text>
            <Text style={styles.quickInfoValue}>₹{fund.nav.toFixed(2)}</Text>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>1Y Returns</Text>
            <View style={styles.quickInfoValueContainer}>
              {formatPercentage(fund.returns.oneYear)}
            </View>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.quickInfoItem}>
            <Text style={styles.quickInfoLabel}>Risk</Text>
            <View style={[
              styles.riskPill, 
              { backgroundColor: getRiskColor(fund.risk) }
            ]}>
              <Text style={styles.riskText}>{fund.risk}</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fundHeader: {
    height: 280,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 70 : 60,
  },
  fundIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `rgba(${parseInt(COLORS.primary.slice(1, 3), 16)}, ${parseInt(COLORS.primary.slice(3, 5), 16)}, ${parseInt(COLORS.primary.slice(5, 7), 16)}, 0.15)`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop:10,
  },
  fundName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  fundCompany: {
    fontSize: 16,
    color: COLORS.textDim,
    marginBottom: 24,
  },
  fundQuickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16, 
  },
  quickInfoItem: {
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickInfoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoSeparator: {
    height: 30,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  riskPill: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
});

export default FundHeader;