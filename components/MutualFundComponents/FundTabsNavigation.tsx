import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../../screens/theme';

interface FundTabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const FundTabsNavigation: React.FC<FundTabsNavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabs}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
        onPress={() => setActiveTab('performance')}
      >
        <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>Performance</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'holdings' && styles.activeTab]}
        onPress={() => setActiveTab('holdings')}
      >
        <Text style={[styles.tabText, activeTab === 'holdings' && styles.activeTabText]}>Holdings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 32, // Increased margin to avoid overlapping with the fund info container
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default FundTabsNavigation;