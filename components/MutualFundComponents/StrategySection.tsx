import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../screens/theme';

interface StrategyPoint {
  icon: string;
  text: string;
}

interface StrategySectionProps {
  title: string;
  description: string;
  points: StrategyPoint[];
}

const StrategySection: React.FC<StrategySectionProps> = ({ title, description, points }) => {
  return (
    <View style={styles.strategySection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.strategyCard}>
        <Text style={styles.strategyText}>{description}</Text>
        <View style={styles.strategyPoints}>
          {points.map((point, index) => (
            <View key={index} style={styles.strategyPoint}>
              <Icon name={point.icon} size={18} color={COLORS.success} style={styles.pointIcon} />
              <Text style={styles.pointText}>{point.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  strategySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  strategyCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  strategyText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textDim,
    marginBottom: 16,
  },
  strategyPoints: {
    gap: 12,
  },
  strategyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointIcon: {
    marginRight: 12,
  },
  pointText: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default StrategySection;