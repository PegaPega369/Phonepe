import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../screens/theme';

interface RiskWarningSectionProps {
  warningText: string;
}

const RiskWarningSection: React.FC<RiskWarningSectionProps> = ({ warningText }) => {
  return (
    <View style={styles.riskWarningSection}>
      <View style={styles.riskWarningCard}>
        <View style={styles.riskWarningHeader}>
          <Icon name="alert-triangle" size={20} color={COLORS.warning} />
          <Text style={styles.riskWarningTitle}>High Risk Investment</Text>
        </View>
        <Text style={styles.riskWarningText}>{warningText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  riskWarningSection: {
    marginBottom: 24,
  },
  riskWarningCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  riskWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskWarningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.warning,
    marginLeft: 8,
  },
  riskWarningText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textDim,
  },
});

export default RiskWarningSection;