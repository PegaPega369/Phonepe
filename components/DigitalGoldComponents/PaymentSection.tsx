import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Modal,
  ScrollView
} from 'react-native';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, cardShadow } from './theme';

interface PaymentSectionProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (method: string) => void;
  manualGold: number;
  goldData: {
    currentPrice: number;
  };
  confirmPayment: () => void;
  loading: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ 
  modalVisible, 
  setModalVisible,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  manualGold,
  goldData,
  confirmPayment,
  loading
}) => {
  return (
    <>
      {/* Proceed Button */}
      <View style={styles.proceedButtonContainer}>
        <LinearGradient
          colors={COLORS.purpleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.proceedGradient}
        >
          <TouchableOpacity 
            style={styles.proceedButton} 
            onPress={() => setModalVisible(true)}
            disabled={loading}
          >
            <Text style={styles.proceedButtonText}>
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </Text>
            {!loading && (
              <Icon name="arrow-forward" type="ionicon" size={20} color={COLORS.text} />
            )}
          </TouchableOpacity>
        </LinearGradient>
        <Text style={styles.securePaymentText}>
          <Icon name="lock-closed" type="ionicon" size={12} color={COLORS.textSecondary} />
          {" "}Secure Payments | 100% Insured
        </Text>
      </View>

      {/* Payment Method Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Choose Payment Method</Text>
            </View>
            
            {/* Amount Summary */}
            <View style={styles.amountSummary}>
              <View>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryAmount}>₹{manualGold}</Text>
              </View>
              <View style={styles.goldQuantity}>
                <Icon name="trending-up" type="ionicon" size={14} color={COLORS.success} />
                <Text style={styles.goldQuantityText}>
                  ≈ {(manualGold / goldData.currentPrice).toFixed(3)}g gold
                </Text>
              </View>
            </View>

            {/* Payment Methods */}
            <ScrollView style={styles.paymentMethodsContainer}>
              {[
                { id: 'PhonePe', name: 'PhonePe', icon: 'mobile1', iconType: 'antdesign', color: '#5F259F' },
                { id: 'Google Pay', name: 'Google Pay', icon: 'google', iconType: 'font-awesome', color: '#4285F4' },
                { id: 'Paytm', name: 'Paytm', icon: 'wallet', iconType: 'entypo', color: '#00BAF2' },
                { id: 'Credit Card', name: 'Credit/Debit Card', icon: 'credit-card', iconType: 'font-awesome', color: '#1A1A1A' },
                { id: 'Net Banking', name: 'Net Banking', icon: 'bank', iconType: 'font-awesome', color: '#2C3E50' },
              ].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodItem,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <View style={[styles.methodIconContainer, { backgroundColor: method.color }]}>
                    <Icon
                      name={method.icon}
                      type={method.iconType}
                      size={18}
                      color="white"
                    />
                  </View>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <View style={styles.radioContainer}>
                    <View style={styles.radioOuter}>
                      {selectedPaymentMethod === method.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Information Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>
                <Icon name="information-circle" type="ionicon" size={16} color={COLORS.primary} />
                {" "}Important Information
              </Text>
              <Text style={styles.infoBoxText}>
                • Gold price is live and can change at the time of payment{"\n"}
                • Your investment is 100% secure and insured{"\n"}
                • You can sell your gold anytime through the app
              </Text>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmPayment}
              disabled={loading}
            >
              <LinearGradient
                colors={COLORS.purpleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  proceedButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  proceedGradient: {
    borderRadius: 16,
    ...cardShadow,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  securePaymentText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxHeight: '80%',
    borderWidth: 1, // Light border for a better look
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  amountSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(106, 13, 173, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  goldQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goldQuantityText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  paymentMethodsContainer: {
    maxHeight: 250,
    marginBottom: 20,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    backgroundColor: 'rgba(106, 13, 173, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  methodIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  radioContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  infoBox: {
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...cardShadow,
  },
  confirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default PaymentSection;