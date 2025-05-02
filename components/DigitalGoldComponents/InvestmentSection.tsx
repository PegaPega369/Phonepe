import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  StyleSheet 
} from 'react-native';
import { Icon } from 'react-native-elements';
import { COLORS, cardShadow } from './theme';

interface InvestmentSectionProps {
  manualGold: number;
  setManualGold: (amount: number) => void;
}

const InvestmentSection: React.FC<InvestmentSectionProps> = ({ 
  manualGold, 
  setManualGold 
}) => {
  const handleRoundupSelect = (amount: number) => {
    setManualGold(amount);
  };

  return (
    <View style={styles.investmentCard}>
      <Text style={styles.cardTitle}>Buy Digital Gold</Text>
      
      {/* Investment Amount Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Enter Investment Amount</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.currencyContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
          </View>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={manualGold.toString()}
            onChangeText={(text) => setManualGold(Number(text) || 0)}
            placeholder="Amount"
            placeholderTextColor={COLORS.textLight}
          />
        </View>
        <Text style={styles.purityText}>
          <Icon name="shield-checkmark" type="ionicon" size={14} color={COLORS.success} />
          {" "}99.9% Pure 24K Gold
        </Text>
      </View>

      {/* Quick Amount Selection */}
      <View style={styles.quickSelectContainer}>
        <Text style={styles.quickSelectTitle}>Quick Select</Text>
        <View style={styles.amountOptions}>
          {[100, 200, 300, 400, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountButton,
                manualGold === amount && styles.selectedAmountButton
              ]}
              onPress={() => handleRoundupSelect(amount)}
            >
              <Text
                style={[
                  styles.amountButtonText,
                  manualGold === amount && styles.selectedAmountButtonText
                ]}
              >
                ₹{amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.recommendationContainer}>
          <Icon name="lightbulb-outline" type="material" size={18} color={COLORS.primary} />
          <Text style={styles.recommendationText}>
            Based on your spending pattern, we recommend ₹{manualGold}
          </Text>
        </View>
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>Benefits</Text>
        
        <View style={styles.benefitRow}>
          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, {backgroundColor: 'rgba(52, 152, 219, 0.2)'}]}>
              <Icon name="shield-checkmark" type="ionicon" size={18} color={COLORS.shield} />
            </View>
            <Text style={styles.benefitTitle}>Secure</Text>
            <Text style={styles.benefitText}>100% Insured</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, {backgroundColor: 'rgba(76, 175, 80, 0.2)'}]}>
              <Icon name="trending-up" type="ionicon" size={18} color={COLORS.success} />
            </View>
            <Text style={styles.benefitTitle}>Returns</Text>
            <Text style={styles.benefitText}>8-10% Yearly</Text>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={[styles.benefitIcon, {backgroundColor: 'rgba(255, 152, 0, 0.2)'}]}>
              <Icon name="wallet" type="ionicon" size={18} color={COLORS.warning} />
            </View>
            <Text style={styles.benefitTitle}>Liquidity</Text>
            <Text style={styles.benefitText}>Sell Anytime</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  investmentCard: {
    margin: 20,
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    ...cardShadow,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  currencyContainer: {
    width: 54,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 18,
    color: COLORS.text,
  },
  purityText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
  },
  quickSelectContainer: {
    marginBottom: 24,
  },
  quickSelectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  amountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountButton: {
    width: '19%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  selectedAmountButton: {
    backgroundColor: COLORS.primary,
  },
  amountButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  selectedAmountButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  recommendationContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    alignItems: 'center',
  },
  recommendationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  benefitsSection: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benefitItem: {
    alignItems: 'center',
    width: '30%',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default InvestmentSection;