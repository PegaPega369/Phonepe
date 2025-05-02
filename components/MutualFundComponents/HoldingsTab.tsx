import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../../screens/theme';

interface Holding {
  name: string;
  percentage: number;
}

interface HoldingsTabProps {
  holdings: Holding[];
  sectors?: { name: string; percentage: number }[];
  additionalSection?: React.ReactNode;
}

const HoldingsTab: React.FC<HoldingsTabProps> = ({ 
  holdings, 
  sectors, 
  additionalSection 
}) => {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.holdingsTitle}>Top Holdings</Text>
      <View style={styles.holdingsList}>
        {holdings.map((holding, index) => (
          <View key={index} style={styles.holdingItem}>
            <Text style={styles.holdingName}>{holding.name}</Text>
            <View style={styles.holdingPercentageContainer}>
              <View style={[
                styles.holdingPercentageBar,
                { width: `${holding.percentage * 3}%` }
              ]} />
              <Text style={styles.holdingPercentageValue}>{holding.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>

      {sectors && sectors.length > 0 && (
        <View style={styles.sectorAllocation}>
          <Text style={styles.holdingsTitle}>Sector Allocation</Text>
          <View style={styles.sectorList}>
            {sectors.map((sector, index) => (
              <View key={index} style={styles.sectorItem}>
                <Text style={styles.sectorName}>{sector.name}</Text>
                <View style={styles.sectorPercentageContainer}>
                  <View style={[
                    styles.sectorPercentageBar,
                    { width: `${sector.percentage * 2.5}%` }
                  ]} />
                  <Text style={styles.sectorPercentageValue}>{sector.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {additionalSection}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    padding: 24,
  },
  holdingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  holdingsList: {
    gap: 8,
    marginBottom: 24,
  },
  holdingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  holdingName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    width: 120,
  },
  holdingPercentageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  holdingPercentageBar: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  holdingPercentageValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    width: 40,
    textAlign: 'right',
  },
  sectorAllocation: {
    marginBottom: 24,
  },
  sectorList: {
    gap: 8,
  },
  sectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.cardLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectorName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    width: 120,
  },
  sectorPercentageContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectorPercentageBar: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  sectorPercentageValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    width: 40,
    textAlign: 'right',
  },
});

export default HoldingsTab;