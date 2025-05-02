import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../../components/ProfileComponents/theme';
import { 
  checkSubscriptionStatus, 
  Subscription, 
  getUserSubscriptions 
} from '../../utils/phonepeAutopay';
import { 
  notifyRedemption, 
  executeRedemption, 
  checkRedemptionOrderStatus 
} from '../../utils/RedemptionPhonepe';

// Define route params type
type RootStackParamList = {
  ProcessRedemption: { merchantSubscriptionIds: string[] };
};

type ProcessRedemptionRouteProp = RouteProp<RootStackParamList, 'ProcessRedemption'>;

const ProcessRedemption: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ProcessRedemptionRouteProp>();
  const { merchantSubscriptionIds } = route.params;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [merchantOrderId, setMerchantOrderId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [orderState, setOrderState] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [metaInfo, setMetaInfo] = useState<{
    udf1: string;
    udf2: string;
  }>({ udf1: '', udf2: '' });

  // Fetch subscription details on component mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const allSubscriptions = await getUserSubscriptions(true); // Only get active subscriptions
        const activeSubscriptions = allSubscriptions.filter(sub => 
          merchantSubscriptionIds.includes(sub.merchantSubscriptionId)
        );
        
        if (activeSubscriptions.length === 0) {
          Alert.alert(
            'No Active Subscriptions', 
            'Could not find any active subscriptions.',
            [{ text: 'Go Back', onPress: () => navigation.goBack() }]
          );
          return;
        }
        
        setSubscriptions(activeSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        Alert.alert('Error', 'Failed to fetch subscription details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [merchantSubscriptionIds, navigation]);

  // Function to select a subscription
  const handleSubscriptionSelect = (merchantSubscriptionId: string) => {
    const subscription = subscriptions.find(s => s.merchantSubscriptionId === merchantSubscriptionId);
    if (subscription) {
      setSelectedSubscription(merchantSubscriptionId);
      setAmount((subscription.amount / 100).toString());
    }
  };

  // Handle redemption notification and execution
  const handleNotifyRedemption = async () => {
    if (!selectedSubscription) {
      Alert.alert('Error', 'Subscription details not available.');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    // Prevent duplicate orders - check if we already have a pending order
    if (merchantOrderId) {
      // Check current order status before creating new one
      const currentStatus = await checkRedemptionOrderStatus(merchantOrderId);
      if (currentStatus.success && currentStatus.data) {
        const state = currentStatus.data.state;
        if (!['FAILED', 'EXPIRED'].includes(state)) {
          Alert.alert(
            'Order In Progress',
            `Current order is in ${state} state. Please wait for it to complete or check its status.`
          );
          return;
        }
      }
    }
    
    setLoading(true);
    try {
      // Convert amount to paise
      const amountInPaise = Math.round(parseFloat(amount) * 100);
      
      // Prepare metadata
      const meta = {
        udf1: metaInfo.udf1 || 'Redemption payment',
        udf2: metaInfo.udf2 || new Date().toISOString()
      };

      console.log('Starting redemption process...');
      console.log('Subscription ID:', selectedSubscription);
      console.log('Amount (paise):', amountInPaise);
      console.log('Metadata:', meta);
      
      // Call notify API
      console.log('Calling notify API...');
      const notifyResponse = await notifyRedemption(
        selectedSubscription,
        amountInPaise,
        undefined, // Use default expiry
        meta,
        'STANDARD', // Use standard retry strategy
        true // Use auto-debit in sandbox
      );
      
      console.log('Notify API Response:', JSON.stringify(notifyResponse, null, 2));
      
      if (notifyResponse.success && notifyResponse.merchantOrderId) {
        // Store both PhonePe orderId and our merchantOrderId
        setOrderId(notifyResponse.orderId || '');
        setMerchantOrderId(notifyResponse.merchantOrderId);
        setOrderState(notifyResponse.state || 'NOTIFICATION_IN_PROGRESS');
        
        console.log('Notification successful, proceeding with execution...');
        console.log('Merchant Order ID:', notifyResponse.merchantOrderId);
        console.log('PhonePe Order ID:', notifyResponse.orderId);
        
        // Automatically execute redemption after successful notification
        console.log('Calling execute API...');
        const executeResponse = await executeRedemption(notifyResponse.merchantOrderId, selectedSubscription);
        
        console.log('Execute API Response:', JSON.stringify(executeResponse, null, 2));
        
        if (executeResponse.success) {
          // Update state with execution results
          setOrderState(executeResponse.state || 'PENDING');
          if (executeResponse.transactionId) {
            setTransactionId(executeResponse.transactionId);
          }
          
          // In sandbox, immediately check status since it might be already completed
          console.log('Checking final status...');
          const statusCheck = await checkRedemptionOrderStatus(notifyResponse.merchantOrderId);
          console.log('Status Check Response:', JSON.stringify(statusCheck, null, 2));
          
          if (statusCheck.success && statusCheck.data) {
            setOrderState(statusCheck.data.state);
            if (statusCheck.data.paymentDetails?.[0]?.transactionId) {
              setTransactionId(statusCheck.data.paymentDetails[0].transactionId);
            }
          }
          
          Alert.alert(
            'Redemption Processing', 
            'Notification and execution initiated successfully.\n\n' +
            `Merchant Order ID: ${notifyResponse.merchantOrderId}\n` +
            `PhonePe Order ID: ${notifyResponse.orderId}\n` +
            `Status: ${statusCheck?.data?.state || executeResponse.state || 'PENDING'}`
          );
        } else {
          console.error('Execute failed:', executeResponse.error);
          Alert.alert(
            'Execution Status', 
            executeResponse.error || 'Redemption initiated. Please check status.'
          );
        }
      } else {
        console.error('Notify failed:', notifyResponse.error);
        Alert.alert('Notification Failed', 'Failed to send redemption notification.');
      }
    } catch (error) {
      console.error('Error in redemption process:', error);
      Alert.alert('Error', 'An error occurred during the redemption process.');
    } finally {
      setLoading(false);
    }
  };

  // Handle redemption execution
  const handleExecuteRedemption = async () => {
    if (!orderId || !selectedSubscription) {
      Alert.alert('Error', 'Order ID and subscription details not available. Please complete notification step first.');
      return;
    }
    
    setLoading(true);
    try {
      // Call execute API with orderId from notify response
      const response = await executeRedemption(orderId, selectedSubscription);
      
      if (response.success) {
        // Store execution state and transaction ID if available
        setOrderState(response.state || 'PENDING');
        if (response.transactionId) {
          setTransactionId(response.transactionId);
        }
        
        Alert.alert(
          'Execution Successful', 
          'Redemption execution initiated successfully'
        );
        
        // Automatically check status after execution
        setTimeout(() => {
          checkRedemptionStatus();
        }, 2000);
      } else {
        Alert.alert(
          'Execution Failed', 
          response.error || 'Failed to execute redemption. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error in redemption execution:', error);
      Alert.alert('Error', 'An error occurred during redemption execution.');
    } finally {
      setLoading(false);
    }
  };

  // Check redemption status
  const checkRedemptionStatus = async () => {
    if (!merchantOrderId) {
      Alert.alert('Error', 'Merchant Order ID not available.');
      return;
    }
    
    setLoading(true);
    try {
      // Call status check API using our merchantOrderId
      const response = await checkRedemptionOrderStatus(merchantOrderId);
      
      if (response.success && response.data) {
        // Update state with latest status
        setOrderState(response.data.state);
        
        // If payment details are available, update transaction ID
        if (response.data.paymentDetails && response.data.paymentDetails.length > 0) {
          setTransactionId(response.data.paymentDetails[0].transactionId || '');
        }
        
        // Show detailed status
        Alert.alert(
          'Redemption Status', 
          `Status: ${response.data.state}\n` +
          `Merchant Order ID: ${response.data.merchantOrderId}\n` +
          `PhonePe Order ID: ${response.data.orderId}\n` +
          `Amount: ₹${response.data.amount / 100}\n` +
          (response.data.paymentDetails && response.data.paymentDetails.length > 0 
            ? `Transaction ID: ${response.data.paymentDetails[0].transactionId}\n` +
              `Payment Mode: ${response.data.paymentDetails[0].paymentMode}\n` +
              `Payment State: ${response.data.paymentDetails[0].state}`
            : 'No payment details available yet.')
        );
      } else {
        Alert.alert('Status Check Failed', response.error || 'Failed to check redemption status.');
      }
    } catch (error) {
      console.error('Error checking redemption status:', error);
      Alert.alert('Error', 'An error occurred while checking redemption status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={PROFILE_COLORS.darkPurpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Process Redemption</Text>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Processing...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Subscription Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Subscription</Text>
            {subscriptions.map((subscription) => (
              <TouchableOpacity
                key={subscription.merchantSubscriptionId}
                style={[
                  styles.subscriptionOption,
                  selectedSubscription === subscription.merchantSubscriptionId && styles.selectedOption
                ]}
                onPress={() => handleSubscriptionSelect(subscription.merchantSubscriptionId)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>
                    {subscription.merchantSubscriptionId}
                  </Text>
                  <Text style={styles.optionAmount}>
                    Amount: ₹{(subscription.amount / 100).toFixed(2)}
                  </Text>
                  <Text style={styles.optionFrequency}>
                    Frequency: {subscription.frequency}
                  </Text>
                </View>
                {selectedSubscription === subscription.merchantSubscriptionId && (
                  <Icon name="check-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Redemption Details */}
          {selectedSubscription && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Redemption Details</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="Enter amount in rupees"
                  placeholderTextColor={COLORS.textDim}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={metaInfo.udf1}
                  onChangeText={(text) => setMetaInfo({ ...metaInfo, udf1: text })}
                  placeholder="Enter payment description"
                  placeholderTextColor={COLORS.textDim}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reference (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={metaInfo.udf2}
                  onChangeText={(text) => setMetaInfo({ ...metaInfo, udf2: text })}
                  placeholder="Enter reference number"
                  placeholderTextColor={COLORS.textDim}
                />
              </View>
            </View>
          )}

          {/* Status Information */}
          {selectedSubscription && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Status Information</Text>
              
              {merchantOrderId && (
                <>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Order Status:</Text>
                    <Text style={styles.statusValue}>{orderState || 'Not Started'}</Text>
                  </View>
                  
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Order ID:</Text>
                    <Text style={styles.statusValue}>{orderId || merchantOrderId}</Text>
                  </View>
                  
                  {transactionId && (
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Transaction ID:</Text>
                      <Text style={styles.statusValue}>{transactionId}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {selectedSubscription && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNotifyRedemption}
                disabled={loading}
              >
                <LinearGradient
                  colors={PROFILE_COLORS.purpleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Icon name="cash" size={20} color={COLORS.text} />
                  <Text style={styles.actionButtonText}>Process Redemption</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, !orderId && styles.disabledButton]}
                onPress={checkRedemptionStatus}
                disabled={!orderId || loading}
              >
                <LinearGradient
                  colors={PROFILE_COLORS.purpleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionButtonGradient}
                >
                  <Icon name="refresh" size={20} color={COLORS.text} />
                  <Text style={styles.actionButtonText}>Check Status</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textDim,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  subscriptionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionAmount: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 2,
  },
  optionFrequency: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  statusLabel: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  statusValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ProcessRedemption;