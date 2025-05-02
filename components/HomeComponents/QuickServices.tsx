import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface QuickServicesProps {
  onExpensesPress: () => void;
  onGoalSavingsPress: () => void;
  onSIPCalculatorPress: () => void;
}

const QuickServices: React.FC<QuickServicesProps> = ({
  onExpensesPress,
  onGoalSavingsPress,
  onSIPCalculatorPress
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headingText}>Quick Services</Text>
          <LinearGradient
            colors={['#9D6DF9', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headingUnderline}
          />
        </View>
    
      </View>
      
      <View style={styles.servicesContainer}>
        {/* Expense Tracker Card */}
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={onExpensesPress}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.leftSection}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 87, 51, 0.08)' }]}>
                <Icon name="chart-pie" size={18} color="#FF5733" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.serviceTitle}>Expense Tracker</Text>
                <Text style={styles.serviceDescription}>Monitor your spending patterns</Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Icon name="long-arrow-alt-right" size={16} color="rgba(255, 255, 255, 0.5)" />
            </View>
          </View>
          
          {/* Accent line */}
          <View style={[styles.accentLine, { backgroundColor: '#FF5733' }]} />
        </TouchableOpacity>
        
        {/* Goal Savings Card */}
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={onGoalSavingsPress}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.leftSection}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(138, 43, 226, 0.08)' }]}>
                <Icon name="bullseye" size={18} color="#8A2BE2" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.serviceTitle}>Goal Savings</Text>
                <Text style={styles.serviceDescription}>Track progress toward your goals</Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Icon name="long-arrow-alt-right" size={16} color="rgba(255, 255, 255, 0.5)" />
            </View>
          </View>
          
          {/* Accent line */}
          <View style={[styles.accentLine, { backgroundColor: '#8A2BE2' }]} />
        </TouchableOpacity>
        
        {/* SIP Calculator Card */}
        <TouchableOpacity
          style={styles.serviceCard}
          onPress={onSIPCalculatorPress}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <View style={styles.leftSection}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(32, 178, 170, 0.08)' }]}>
                <Icon name="calculator" size={18} color="#20B2AA" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.serviceTitle}>SIP Calculator</Text>
                <Text style={styles.serviceDescription}>Plan your investment strategy</Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Icon name="long-arrow-alt-right" size={16} color="rgba(255, 255, 255, 0.5)" />
            </View>
          </View>
          
          {/* Accent line */}
          <View style={[styles.accentLine, { backgroundColor: '#20B2AA' }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headingUnderline: {
    height: 3,
    width: 40,
    borderRadius: 3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#8A2BE2',
    fontSize: 12,
    fontWeight: '600',
  },
  servicesContainer: {
    flexDirection: 'column',
    gap: 14,
  },
  serviceCard: {
    width: '100%',
    height: 76,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flexDirection: 'column',
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: '100%',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  }
});

export default QuickServices;