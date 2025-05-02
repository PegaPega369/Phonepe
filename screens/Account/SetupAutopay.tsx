import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  AppState
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../../components/ProfileComponents/theme';
import { 
  setupSubscription, 
  checkSubscriptionOrderStatus,
  saveSubscription,
  updateSubscriptionStatus,
  subscriptionFrequencyUtils
} from '../../utils/phonepeAutopay';

// Add these test URLs for PhonPe simulator
const PHONPE_SIM_URLS = [
  {
    name: "Basic Format",
    url: "ppesim://mandate"
  },
  {
    name: "PG Simulator Format",
    url: "ppesim://pg-simulator"
  },
  {
    name: "Intent Format",
    url: "ppesim://intent?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR"
  },
  {
    name: "Full Params",
    url: "ppesim://mandate?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR&tr=TEST12345"
  },
  {
    name: "Pay Format",
    url: "ppesim://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR"
  }
];

const { width } = Dimensions.get('window');

const SetupAutopay: React.FC = () => {
  const navigation = useNavigation();
  const [isAutopayEnabled, setIsAutopayEnabled] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [lastMerchantOrderId, setLastMerchantOrderId] = useState<string | null>(null);
  
  StatusBar.setBarStyle('light-content');

  // Reset amount selection when frequency changes
  useEffect(() => {
    setSelectedAmount('');
    setCustomAmount('');
    setShowCustomInput(false);
  }, [selectedFrequency]);

  // Add this function to explicitly check the subscription order status and navigate on success
  const checkOrderAndNavigate = async (merchantOrderId: string, merchantSubscriptionId: string) => {
    try {
      console.log(`Checking order status for: ${merchantOrderId}`);
      const orderStatus = await checkSubscriptionOrderStatus(merchantOrderId);
      
      if (orderStatus.success && orderStatus.state === 'COMPLETED') {
        console.log(`Order ${merchantOrderId} is COMPLETED - saving with ACTIVE status`);
        
        // Create subscription with ACTIVE status
        await saveSubscription({
          id: orderStatus.details.orderId,
          merchantSubscriptionId: merchantSubscriptionId,
          status: 'ACTIVE',
          amount: orderStatus.details.amount,
          frequency: orderStatus.details.paymentFlow.frequency,
          startDate: new Date().toISOString(),
          endDate: new Date(orderStatus.details.paymentFlow.expireAt).toISOString(),
          createdAt: new Date().toISOString()
        });
        
        // Show success message
        Alert.alert(
          'Success', 
          'Your autopay plan has been created successfully!',
          [
            {
              text: 'View My Plans',
              onPress: () => navigation.navigate('ManageAutopay' as never)
            }
          ]
        );
        
        // Clear the last order ID
        setLastMerchantOrderId(null);
      } else if (orderStatus.state === 'PENDING') {
        console.log(`Order ${merchantOrderId} is still PENDING`);
        Alert.alert('In Progress', 'Your autopay setup is still being processed. Please wait a moment.');
      } else {
        console.log(`Order ${merchantOrderId} failed or unknown status: ${orderStatus.state}`);
        Alert.alert('Status', `Order status: ${orderStatus.state || 'Unknown'}`);
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      Alert.alert('Error', 'Failed to check subscription status');
    }
  };

  // Update the effect to handle app state changes and subscription checking
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && lastMerchantOrderId) {
        console.log('App came to foreground, checking subscription status for order:', lastMerchantOrderId);
        
        // Wait a moment for the transaction to be processed
        setTimeout(async () => {
          if (lastMerchantOrderId) {
            try {
              const merchantSubscriptionId = lastMerchantOrderId.replace('MO', 'MS');
              await checkOrderAndNavigate(lastMerchantOrderId, merchantSubscriptionId);
            } catch (error) {
              console.error('Error in subscription check:', error);
            }
          }
        }, 2000); // Wait 2 seconds before checking
      }
    });

    return () => {
      subscription.remove();
    };
  }, [lastMerchantOrderId, navigation]);

  const frequencyOptions = [
    { id: 'daily', label: 'Daily', icon: 'calendar-today' },
    { id: 'weekly', label: 'Weekly', icon: 'calendar-week' },
    { id: 'monthly', label: 'Monthly', icon: 'calendar-month' }
  ];

  // Amount options based on selected frequency
  const getAmountOptions = () => {
    if (selectedFrequency === 'daily') {
      return [
        { id: '20', label: '₹20', isPopular: false },
        { id: '30', label: '₹30', isPopular: true },
        { id: '50', label: '₹50', isPopular: false },
        { id: '100', label: '₹100', isPopular: false },
        { id: 'custom', label: 'Custom', isCustom: true }
      ];
    } else if (selectedFrequency === 'weekly') {
      return [
        { id: '100', label: '₹100', isPopular: false },
        { id: '200', label: '₹200', isPopular: false },
        { id: '300', label: '₹300', isPopular: true },
        { id: '400', label: '₹400', isPopular: false }, 
        { id: 'custom', label: 'Custom', isCustom: true }
      ];
    } else if (selectedFrequency === 'monthly') {
      return [
        { id: '500', label: '₹500', isPopular: false },
        { id: '1000', label: '₹1,000', isPopular: false },
        { id: '2000', label: '₹2,000', isPopular: true },
        { id: '5000', label: '₹5,000', isPopular: false },
        { id: 'custom', label: 'Custom', isCustom: true }
      ];
    }
    return [];
  };

  const renderFrequencyOption = (id: string, label: string, icon: string) => {
    const isSelected = selectedFrequency === id;
    
    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.frequencyOption,
          isSelected && styles.selectedFrequencyOption
        ]}
        onPress={() => setSelectedFrequency(id)}
        disabled={!isAutopayEnabled}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isSelected ? COLORS.lightPurpleGradient : ['rgba(15,15,15,0.8)', 'rgba(10,10,10,0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.frequencyGradient,
            !isAutopayEnabled && styles.disabledOption
          ]}
        >
          <Icon 
            name={icon} 
            size={22} 
            color={isSelected ? COLORS.text : (isAutopayEnabled ? COLORS.primary : COLORS.textMuted)} 
          />
          <Text style={[
            styles.frequencyLabel,
            isSelected ? styles.selectedFrequencyLabel : null,
            !isAutopayEnabled && styles.disabledText
          ]}>
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Adjusted to use an option object parameter
  const renderAmountOption = (option: any) => {
    const { id, label, isPopular, isCustom } = option;
    const isSelected = selectedAmount === id;
    
    const handleAmountPress = () => {
      if (id === 'custom') {
        setSelectedAmount(id);
        setShowCustomInput(true);
      } else {
        setSelectedAmount(id);
        setShowCustomInput(false);
      }
    };
    
    return (
      <TouchableOpacity
        key={id}
        style={[
          styles.amountOption,
          isSelected && styles.selectedAmountOption,
          isCustom && styles.customOption
        ]}
        onPress={handleAmountPress}
        disabled={!isAutopayEnabled}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isSelected ? COLORS.purpleGradient : ['rgba(15,15,15,0.3)', 'rgba(10,10,10,0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.amountGradient,
            !isAutopayEnabled && styles.disabledOption
          ]}
        >
          {isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
          <Text style={[
            styles.amountLabel,
            isSelected ? styles.selectedAmountLabel : null,
            !isAutopayEnabled && styles.disabledText
          ]}>
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!selectedFrequency || !selectedAmount || (selectedAmount === 'custom' && !customAmount)) {
        Alert.alert('Error', 'Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Convert amount to paise
      let amountInPaise: number;
      if (selectedAmount === 'custom') {
        amountInPaise = Math.round(parseFloat(customAmount || '0') * 100);
      } else {
        amountInPaise = Math.round(parseFloat(selectedAmount) * 100);
      }
      
      // Generate a test UPI URL to check which apps can handle it
      const testUpiUrl = `upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR&tr=TEST${Date.now()}`;
      
      try {
        // Check if the URL can be opened and which apps can handle it
        console.log('Checking which apps can handle UPI intent...');
        
        // We can't directly detect installed apps in React Native, 
        // so we'll show predefined options with PhonePe Simulator as default
        
      Alert.alert(
          'Select Payment App',
          'Choose an app to complete setup:',
          [
            {
              text: 'PhonePe Simulator (Recommended)',
              onPress: async () => {
                try {
                  setLoading(true);
                  console.log('Starting PhonPe Simulator setup...');
      
                  // Call the setup subscription handler targeting PhonPe simulator
      const response = await setupSubscription(
        'user123', // User ID
        amountInPaise, // Amount in paise
        subscriptionFrequencyUtils.toApiValue(selectedFrequency), // API frequency value
        'FIXED', // Amount type
        amountInPaise, // Max amount
        'TRANSACTION', // Auth workflow type
                    'com.phonepe.app.preprod' // Target specifically PhonPe simulator app
      );

                  console.log('PhonPe simulator response:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Store the merchantOrderId for status checking
        setLastMerchantOrderId(response.merchantOrderId || null);
        
        // Save the subscription to AsyncStorage
        await saveSubscription({
          id: response.orderId,
          merchantSubscriptionId: response.merchantSubscriptionId,
          status: 'PENDING',
          amount: amountInPaise,
          frequency: selectedFrequency,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        });

                    // Try to open PhonPe simulator app with the provided URL
                    if (response.intentUrl) {
                      console.log('Opening PhonPe simulator with intent URL:', response.intentUrl);
                      try {
                        await Linking.openURL(response.intentUrl);
                      } catch (error) {
                        console.error('Failed to open intent URL, trying simulator directly:', error);
                        // Try direct simulator URLs as fallback
                        try {
                          await Linking.openURL('ppesim://pg-simulator');
                        } catch (simError) {
                          console.error('Failed to open simulator:', simError);
          Alert.alert(
                            'Cannot Open PhonPe Simulator',
                            'Please make sure the PhonPe simulator app is installed.',
            [
              {
                                text: 'Try Alternative Format',
                onPress: async () => {
                  try {
                    await Linking.openURL('ppesim://mandate');
                                  } catch (altErr) {
                                    Alert.alert('Error', 'PhonPe simulator app is not installed on your device.');
                                  }
                                }
                              },
                              {
                                text: 'OK',
                                style: 'cancel'
                              }
                            ]
                          );
                        }
                      }
                    } else {
                      // No intent URL provided, try direct simulator URL
                      console.log('No intent URL in response, trying direct simulator URL');
                      try {
                      await Linking.openURL('ppesim://pg-simulator');
                      } catch (error) {
                        console.error('Failed to open simulator:', error);
                      Alert.alert('Error', 'PhonPe simulator app is not installed on your device.');
                    }
                    }
                  } else {
                    Alert.alert('Error', 'Failed to setup subscription. Please try again.');
                  }
                } catch (error) {
                  console.error('PhonPe Setup Error:', error);
                  Alert.alert('Error', 'Failed to setup autopay plan with PhonPe simulator.');
                } finally {
                  setLoading(false);
                }
                }
              },
              {
              text: 'PhonePe',
              onPress: async () => {
                try {
                  setLoading(true);
                  console.log('Starting setup with PhonePe App...');
                  
                  // Call the setup subscription handler targeting PhonPe app
                  const response = await setupSubscription(
                    'user123', // User ID
                    amountInPaise, // Amount in paise
                    subscriptionFrequencyUtils.toApiValue(selectedFrequency), // API frequency value
                    'FIXED', // Amount type
                    amountInPaise, // Max amount
                    'TRANSACTION', // Auth workflow type
                    'com.phonepe.app' // Target specifically PhonPe app
                  );
                  
                  console.log('PhonPe app response:', JSON.stringify(response, null, 2));
                  
                  if (response.success) {
                    // Store the merchantOrderId for status checking
                    setLastMerchantOrderId(response.merchantOrderId || null);
                    
                    // Save the subscription to AsyncStorage
                    await saveSubscription({
                      id: response.orderId,
                      merchantSubscriptionId: response.merchantSubscriptionId,
                      status: 'PENDING',
                      amount: amountInPaise,
                      frequency: selectedFrequency,
                      startDate: new Date().toISOString(),
                      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString()
                    });
                    
                    // Try to open PhonePe app with the provided URL
                    if (response.intentUrl) {
                      try {
                        console.log('Opening PhonePe app with URL:', response.intentUrl);
                        await Linking.openURL(response.intentUrl);
                      } catch (error) {
                        console.error('Failed to open intent URL:', error);
                        
                        // Try direct PhonePe app as fallback
                        const txnRef = `TEST${Date.now()}`;
                        const directUrl = `phonepe://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`;
                        
                        try {
                          await Linking.openURL(directUrl);
                        } catch (directError) {
                          console.error('Failed to open direct PhonePe URL:', directError);
                          Alert.alert('Error', 'PhonePe app is not installed on your device.');
                        }
                      }
                    } else {
                      Alert.alert('Error', 'No intent URL received from the server.');
                    }
                  } else {
                    Alert.alert('Error', 'Failed to setup subscription. Please try again.');
                  }
                } catch (error) {
                  console.error('PhonePe Setup Error:', error);
                  Alert.alert('Error', 'Failed to setup autopay plan with PhonPe.');
                } finally {
                  setLoading(false);
                }
              }
            },
            {
              text: 'Google Pay',
              onPress: async () => {
                try {
                  setLoading(true);
                  console.log('Starting setup with Google Pay...');
                  
                  // Call the setup subscription with targetApp set to Google Pay
                  const response = await setupSubscription(
                    'user123', // User ID
                    amountInPaise, // Amount in paise
                    subscriptionFrequencyUtils.toApiValue(selectedFrequency), // API frequency value
                    'FIXED', // Amount type
                    amountInPaise, // Max amount
                    'TRANSACTION', // Auth workflow type
                    'com.google.android.apps.nbu.paisa.user' // Target Google Pay
                  );
                  
                  console.log('Google Pay response:', JSON.stringify(response, null, 2));
                  
                  if (response.success) {
                    // Store the merchantOrderId for status checking
                    setLastMerchantOrderId(response.merchantOrderId || null);
                    
                    // Save the subscription to AsyncStorage
                    await saveSubscription({
                      id: response.orderId,
                      merchantSubscriptionId: response.merchantSubscriptionId,
                      status: 'PENDING',
                      amount: amountInPaise,
                      frequency: selectedFrequency,
                      startDate: new Date().toISOString(),
                      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString()
                    });
                    
                    // Try to open Google Pay with the provided URL
                    if (response.intentUrl) {
                      console.log('Opening Google Pay with URL:', response.intentUrl);
                      try {
                        await Linking.openURL(response.intentUrl);
                      } catch (error) {
                        console.error('Failed to open Google Pay with intent URL:', error);
                        
                        // Try direct Google Pay URL as fallback
                        const txnRef = `TEST${Date.now()}`;
                        const directUrl = `tez://upi/pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`;
                        console.log('Trying direct Google Pay URL:', directUrl);
                        
                        try {
                          await Linking.openURL(directUrl);
                        } catch (directError) {
                          console.error('Failed to open direct Google Pay URL:', directError);
                          Alert.alert('Error', 'Google Pay app is not installed on your device.');
                        }
                      }
                    } else {
                      // No intent URL, use direct Google Pay URL
                      const txnRef = `TEST${Date.now()}`;
                      const directUrl = `tez://upi/pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`;
                      console.log('No intent URL provided, using direct Google Pay URL:', directUrl);
                      
                      try {
                        await Linking.openURL(directUrl);
                      } catch (error) {
                        console.error('Failed to open direct Google Pay URL:', error);
                        Alert.alert('Error', 'Google Pay app is not installed on your device.');
                      }
                    }
      } else {
        Alert.alert('Error', 'Failed to setup subscription. Please try again.');
                  }
                } catch (error) {
                  console.error('Google Pay Setup Error:', error);
                  Alert.alert('Error', 'Failed to setup autopay plan with Google Pay.');
                } finally {
                  setLoading(false);
                }
              }
            },
            {
              text: 'Paytm',
              onPress: async () => {
                try {
                  setLoading(true);
                  console.log('Starting setup with Paytm...');
                  
                  // Call the setup subscription with targetApp set to Paytm
                  const response = await setupSubscription(
                    'user123', // User ID
                    amountInPaise, // Amount in paise
                    subscriptionFrequencyUtils.toApiValue(selectedFrequency), // API frequency value
                    'FIXED', // Amount type
                    amountInPaise, // Max amount
                    'TRANSACTION', // Auth workflow type
                    'net.one97.paytm' // Target Paytm
                  );
                  
                  console.log('Paytm response:', JSON.stringify(response, null, 2));
                  
                  if (response.success) {
                    // Store the merchantOrderId for status checking
                    setLastMerchantOrderId(response.merchantOrderId || null);
                    
                    // Save the subscription to AsyncStorage
                    await saveSubscription({
                      id: response.orderId,
                      merchantSubscriptionId: response.merchantSubscriptionId,
                      status: 'PENDING',
                      amount: amountInPaise,
                      frequency: selectedFrequency,
                      startDate: new Date().toISOString(),
                      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString()
                    });
                    
                    // Try to open Paytm with the provided URL
                    if (response.intentUrl) {
                      console.log('Opening Paytm with URL:', response.intentUrl);
                      try {
                        await Linking.openURL(response.intentUrl);
                      } catch (error) {
                        console.error('Failed to open Paytm with intent URL:', error);
                        
                        // Try using generic UPI URL that Paytm might handle
                        const txnRef = `TEST${Date.now()}`;
                        const upiUrl = `upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`;
                        console.log('Trying generic UPI URL for Paytm:', upiUrl);
                        
                        try {
                          await Linking.openURL(upiUrl);
                        } catch (upiError) {
                          console.error('Failed to open UPI URL for Paytm:', upiError);
                          Alert.alert('Error', 'Paytm app is not installed or cannot handle UPI payments.');
                        }
                      }
                    } else {
                      // No intent URL, use generic UPI URL
                      const txnRef = `TEST${Date.now()}`;
                      const upiUrl = `upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`;
                      console.log('No intent URL provided, using generic UPI URL for Paytm:', upiUrl);
                      
                      try {
                        await Linking.openURL(upiUrl);
                      } catch (error) {
                        console.error('Failed to open UPI URL for Paytm:', error);
                        Alert.alert('Error', 'Paytm app is not installed or cannot handle UPI payments.');
                      }
                    }
                  } else {
                    Alert.alert('Error', 'Failed to setup subscription. Please try again.');
                  }
                } catch (error) {
                  console.error('Paytm Setup Error:', error);
                  Alert.alert('Error', 'Failed to setup autopay plan with Paytm.');
                } finally {
                  setLoading(false);
                }
              }
            },
            {
              text: 'Show All UPI Apps',
              onPress: async () => {
                try {
                  setLoading(true);
                  console.log('Starting setup with All UPI Apps...');
                  
                  // Call the setup subscription with "ALL" to allow intent to choose any UPI app
                  const response = await setupSubscription(
                    'user123', // User ID
                    amountInPaise, // Amount in paise
                    subscriptionFrequencyUtils.toApiValue(selectedFrequency), // API frequency value
                    'FIXED', // Amount type
                    amountInPaise, // Max amount
                    'TRANSACTION', // Auth workflow type
                    'ALL' // Allow all UPI apps for intent URL
                  );
                  
                  console.log('All UPI apps response:', JSON.stringify(response, null, 2));
                  
                  if (response.success) {
                    // Store the merchantOrderId for status checking
                    setLastMerchantOrderId(response.merchantOrderId || null);
                    
                    // Save the subscription to AsyncStorage
                    await saveSubscription({
                      id: response.orderId,
                      merchantSubscriptionId: response.merchantSubscriptionId,
                      status: 'PENDING',
                      amount: amountInPaise,
                      frequency: selectedFrequency,
                      startDate: new Date().toISOString(),
                      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString()
                    });
                    
                    // Open the intent URL which should trigger the UPI app selection
                    if (response.intentUrl) {
                      console.log('Opening UPI app selection with URL:', response.intentUrl);
                      try {
                        await Linking.openURL(response.intentUrl);
                      } catch (error) {
                        console.error('Failed to open UPI intent URL:', error);
                        
                        // Fallback to standard UPI intent
                        const txnRef = `TEST${Date.now()}`;
                        const fallbackUrl = `upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`;
                        console.log('Trying fallback UPI URL:', fallbackUrl);
                        
                        try {
                          await Linking.openURL(fallbackUrl);
                        } catch (fallbackError) {
                          console.error('Failed to open fallback UPI URL:', fallbackError);
                          Alert.alert('Error', 'No UPI apps available on your device.');
                        }
                      }
                    } else {
                      // No intent URL, use generic UPI intent
                      const txnRef = `TEST${Date.now()}`;
                      const genericUrl = `upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`;
                      console.log('No intent URL provided, using generic URL:', genericUrl);
                      
                      try {
                        await Linking.openURL(genericUrl);
                      } catch (error) {
                        console.error('Failed to open generic UPI URL:', error);
                        Alert.alert('Error', 'No UPI apps available on your device.');
                      }
                    }
                  } else {
                    Alert.alert('Error', 'Failed to setup subscription. Please try again.');
                  }
                } catch (error) {
                  console.error('UPI Setup Error:', error);
                  Alert.alert('Error', 'Failed to setup autopay plan with UPI apps.');
                } finally {
                  setLoading(false);
                }
              }
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setLoading(false)
            }
          ]
        );
      } catch (error) {
        console.error('Error detecting UPI apps:', error);
        setLoading(false);
        
        // Fallback to simpler dialog if app detection fails
        Alert.alert(
          'Select Payment Method',
          'Choose which app to use for autopay setup:',
          [
            {
              text: 'PhonPe Simulator (Recommended)',
              onPress: () => {
                // Handle PhonePe simulator selection
                handleSimulatorPayment(amountInPaise);
              }
            },
            {
              text: 'All UPI Apps',
              onPress: () => {
                // Handle all UPI apps selection
                handleAllUpiAppsPayment(amountInPaise);
              }
            },
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setLoading(false)
            }
          ]
        );
      }
    } catch (error) {
      console.error('Setup Error:', error);
      Alert.alert('Error', 'Failed to setup autopay plan. Please try again.');
      setLoading(false);
    }
  };
  
  // Helper function to handle PhonePe simulator payment
  const handleSimulatorPayment = async (amountInPaise: number) => {
    try {
      setLoading(true);
      console.log('Starting PhonPe Simulator setup...');
      
      // Call the setup subscription handler targeting PhonPe simulator
      const response = await setupSubscription(
        'user123', // User ID
        amountInPaise, // Amount in paise
        subscriptionFrequencyUtils.toApiValue(selectedFrequency), // API frequency value
        'FIXED', // Amount type
        amountInPaise, // Max amount
        'TRANSACTION', // Auth workflow type
        'com.phonepe.app.preprod' // Target specifically PhonPe simulator app
      );
      
      if (response.success) {
        // Store the merchantOrderId for status checking
        setLastMerchantOrderId(response.merchantOrderId || null);
        
        // Save the subscription to AsyncStorage
        await saveSubscription({
          id: response.orderId,
          merchantSubscriptionId: response.merchantSubscriptionId,
          status: 'PENDING',
          amount: amountInPaise,
          frequency: selectedFrequency,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        });
        
        // Try to open PhonPe simulator app with the provided URL
        if (response.intentUrl) {
          try {
            await Linking.openURL(response.intentUrl);
          } catch (error) {
            console.error('Failed to open intent URL:', error);
            
            // Try direct PhonPe simulator app as fallback
            try {
              await Linking.openURL('ppesim://pg-simulator');
            } catch (directError) {
              console.error('Failed to open PhonPe simulator:', directError);
              Alert.alert('Error', 'PhonPe simulator app is not installed on your device.');
            }
          }
        } else {
          try {
            await Linking.openURL('ppesim://pg-simulator');
          } catch (error) {
            console.error('Failed to open PhonPe simulator:', error);
            Alert.alert('Error', 'PhonPe simulator app is not installed on your device.');
          }
        }
      } else {
        Alert.alert('Error', 'Failed to setup subscription. Please try again.');
      }
    } catch (error) {
      console.error('PhonePe Setup Error:', error);
      Alert.alert('Error', 'Failed to setup autopay plan with PhonPe simulator.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to handle all UPI apps payment
  const handleAllUpiAppsPayment = async (amountInPaise: number) => {
    try {
      setLoading(true);
      
      // Call the setup subscription with "ALL" to allow intent to choose any UPI app
      const response = await setupSubscription(
        'user123',
        amountInPaise,
        subscriptionFrequencyUtils.toApiValue(selectedFrequency),
        'FIXED',
        amountInPaise,
        'TRANSACTION',
        'ALL'
      );
      
      if (response.success) {
        // Store the merchantOrderId for status checking
        setLastMerchantOrderId(response.merchantOrderId || null);
        
        // Save the subscription to AsyncStorage
        await saveSubscription({
          id: response.orderId,
          merchantSubscriptionId: response.merchantSubscriptionId,
          status: 'PENDING',
          amount: amountInPaise,
          frequency: selectedFrequency,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        });
        
        // Open the intent URL which should trigger the UPI app selection
        if (response.intentUrl) {
          await Linking.openURL(response.intentUrl);
        } else {
          // Fallback to standard UPI intent
          const txnRef = `TEST${Date.now()}`;
          await Linking.openURL(`upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=${amountInPaise/100}&cu=INR&tr=${txnRef}`);
        }
      } else {
        Alert.alert('Error', 'Failed to setup subscription. Please try again.');
      }
    } catch (error) {
      console.error('UPI Setup Error:', error);
      Alert.alert('Error', 'Failed to setup autopay plan with UPI apps.');
    } finally {
      setLoading(false);
    }
  };

  // Function to test all simulator URL formats
  const testSimulatorUrls = () => {
    Alert.alert(
      'Test PhonPe Simulator URLs',
      'Select a URL format to test:',
      PHONPE_SIM_URLS.map(item => ({
        text: item.name,
        onPress: async () => {
          try {
            console.log(`Testing URL format: ${item.url}`);
            await Linking.openURL(item.url);
            Alert.alert('Success', `Successfully opened URL format: ${item.name}`);
          } catch (err) {
            console.error(`Error with format ${item.name}:`, err);
            Alert.alert('Error', `Failed to open URL format: ${item.name}`);
          }
        }
      }))
    );
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      {/* PhonPe Simulator test button */}
      <TouchableOpacity 
        style={styles.simulatorButton}
        onPress={() => {
          Alert.alert(
            'Test PhonPe URLs', 
            'Select a URL format to test:',
            [
              {
                text: 'UPI Intent URL',
                onPress: async () => {
                  try {
                    const upiIntentUrl = `upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR&tr=TEST${Date.now()}`;
                    console.log('Testing UPI intent URL:', upiIntentUrl);
                    await Linking.openURL(upiIntentUrl);
                  } catch (err) {
                    Alert.alert('Error', 'Failed to open UPI intent URL');
                  }
                }
              },
              {
                text: 'PhonePe Direct',
                onPress: async () => {
                  try {
                    const phonepeUrl = `phonepe://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR&tr=TEST${Date.now()}`;
                    console.log('Testing PhonePe direct URL:', phonepeUrl);
                    await Linking.openURL(phonepeUrl);
                  } catch (err) {
                    Alert.alert('Error', 'Failed to open PhonePe app directly');
                  }
                }
              },
              {
                text: 'PhonePe Simulator',
                onPress: async () => {
                  try {
                    // This format matches the simulator's expected structure
                    const ppSimUrl = `ppesim://pg-simulator?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR&tr=TEST${Date.now()}`;
                    console.log('Testing PhonePe simulator URL:', ppSimUrl);
                    await Linking.openURL(ppSimUrl);
                  } catch (err) {
                    Alert.alert('Error', 'Failed to open PhonePe simulator');
                  }
                }
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
        }}
      >
        <Text style={styles.simulatorButtonText}>Test URL Formats</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Hero section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={COLORS.darkPurpleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Text style={styles.heroTitle}>Setup Autopay</Text>
              <Text style={styles.heroSubtitle}>Automate your investment journey and never miss an opportunity</Text>
              
              <View style={styles.securityBadge}>
                <Icon name="shield-lock" size={18} color={COLORS.primary} />
                <Text style={styles.securityText}>Secure payments</Text>
              </View>
            </LinearGradient>
          </View>
          
          {/* Main toggle section */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleHeader}>
              <View style={styles.toggleLeft}>
                <Icon name="autorenew" size={22} color={isAutopayEnabled ? COLORS.primary : COLORS.textMuted} />
                <Text style={styles.toggleLabel}>Enable Autopay</Text>
              </View>
              
              <Switch
                trackColor={{ 
                  false: PROFILE_COLORS.switchTrackInactive, 
                  true: PROFILE_COLORS.switchTrackActive 
                }}
                thumbColor={isAutopayEnabled ? PROFILE_COLORS.switchThumbActive : PROFILE_COLORS.switchThumbInactive}
                onValueChange={() => setIsAutopayEnabled(!isAutopayEnabled)}
                value={isAutopayEnabled}
                style={styles.switch}
              />
            </View>
            
            <Text style={styles.toggleDescription}>
              {isAutopayEnabled 
                ? "Autopay is enabled. Set up your preferred schedule below."
                : "Turn on Autopay to automate your investment in Digital Gold"}
            </Text>
          </View>
          
          {/* Frequency selection */}
          <View style={[styles.sectionCard, !isAutopayEnabled && styles.disabledCard]}>
            <Text style={styles.sectionTitle}>Investment Frequency</Text>
            <Text style={styles.sectionDescription}>
              How often would you like to invest in Digital Gold?
            </Text>
            
            <View style={styles.frequencyContainer}>
              {frequencyOptions.map(option => 
                renderFrequencyOption(option.id, option.label, option.icon)
              )}
            </View>
          </View>
          
          {/* Amount selection */}
          {selectedFrequency && (
            <View style={[styles.sectionCard, !isAutopayEnabled && styles.disabledCard]}>
              <Text style={styles.sectionTitle}>Investment Amount</Text>
              <Text style={styles.sectionDescription}>
                How much would you like to invest each time?
              </Text>
              
              <View style={styles.amountContainer}>
                {/* First Row - 2 items */}
                <View style={styles.amountRow}>
                  {getAmountOptions().slice(0, 2).map(option => 
                    renderAmountOption(option)
                  )}
                </View>
                
                {/* Second Row - 2 items */}
                <View style={styles.amountRow}>
                  {getAmountOptions().slice(2, 4).map(option => 
                    renderAmountOption(option)
                  )}
                </View>
                
                {/* Custom button centered */}
                <View style={styles.customRow}>
                  {renderAmountOption(getAmountOptions()[4])}
                </View>
              </View>
              
              {/* Custom amount input */}
              {showCustomInput && (
                <View style={styles.customAmountContainer}>
                  <Text style={styles.customAmountLabel}>Enter custom amount:</Text>
                  <View style={styles.customInputWrapper}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.customAmountInput}
                      value={customAmount}
                      onChangeText={setCustomAmount}
                      placeholder="Amount"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="numeric"
                      editable={isAutopayEnabled}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Action Button - Update to call our new function */}
      {isAutopayEnabled && (
        <View style={styles.bottomAction}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              disabled={!selectedFrequency || !selectedAmount || (selectedAmount === 'custom' && !customAmount)}
              activeOpacity={0.8}
              style={[
                styles.saveButton, 
                (!selectedFrequency || !selectedAmount || (selectedAmount === 'custom' && !customAmount)) && styles.disabledButton
              ]}
              onPress={handleSubmit}
            >
              <LinearGradient
                colors={COLORS.purpleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  Save Preferences
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  contentContainer: {
    padding: 16,
  },
  heroSection: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 21, 55, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    marginTop: 8,
  },
  securityText: {
    color: COLORS.primary,
    fontSize: 13,
    marginLeft: 6,
  },
  toggleCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.3)',
    ...SHADOWS.small,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  toggleDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 4,
    paddingLeft: 30,
  },
  sectionCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.2)',
    ...SHADOWS.small,
  },
  disabledCard: {
    opacity: 0.75,
    borderColor: 'rgba(106, 78, 156, 0.1)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 16,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  frequencyOption: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.15)',
  },
  selectedFrequencyOption: {
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  frequencyGradient: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDim,
    marginTop: 6,
  },
  selectedFrequencyLabel: {
    color: COLORS.text,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  amountOption: {
    width: '48%',
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.15)',
  },
  selectedAmountOption: {
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  amountGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDim,
  },
  selectedAmountLabel: {
    color: COLORS.text,
    fontWeight: '600',
  },
  disabledOption: {
    opacity: 0.7,
  },
  disabledText: {
    color: COLORS.textMuted,
  },
  customAmountContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(106, 78, 156, 0.1)',
  },
  customAmountLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDim,
    marginBottom: 10,
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 15, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    height: 40,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
    ...SHADOWS.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  customOption: {
    width: '48%',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderColor: 'rgba(106, 78, 156, 0.3)',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 11,
  },
  popularText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '700',
  },
  amountRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  simulatorButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  simulatorButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SetupAutopay;