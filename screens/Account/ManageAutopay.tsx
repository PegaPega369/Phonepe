import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  AppState,
  Linking
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../../components/ProfileComponents/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  cancelSubscription, 
  getUserSubscriptions, 
  updateSubscriptionStatus,
  checkSubscriptionStatus,
  subscriptionFrequencyUtils,
  saveSubscription,
  Subscription,
  SubscriptionStatus,
  checkSubscriptionOrderStatus,
  setupSubscription,
  pauseSubscription,
  unpauseSubscription,
  revokeSubscription
} from '../../utils/phonepeAutopay';

// Define navigation params type
type RootStackParamList = {
  SetupAutopay: undefined;
  ManageAutopay: undefined;
  ProcessRedemption: { merchantSubscriptionIds: string[] };
};

const ManageAutopay: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<Subscription[]>([]);
  const [cancelledSubscriptions, setCancelledSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastMerchantOrderId, setLastMerchantOrderId] = useState<string | null>(null);
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [pauseStartDate, setPauseStartDate] = useState<Date>(new Date());
  const [pauseEndDate, setPauseEndDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default 7 days
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Add debounce logic to prevent excessive status checks
  const DEBOUNCE_TIME = 5000; // 5 seconds
  let lastStatusCheck = 0;

  const checkSubscriptionStatuses = async () => {
    // Prevent excessive checks
    const now = Date.now();
    if (now - lastStatusCheck < DEBOUNCE_TIME) {
      return;
    }
    lastStatusCheck = now;
    
    setLoading(true);
    try {
      // Get all subscriptions
      const subs = await getUserSubscriptions();
      
      // Check status for each subscription (limiting concurrency)
      const maxConcurrentChecks = 2;
      const chunks = [];
      
      // Split into chunks to limit concurrent requests
      for (let i = 0; i < subs.length; i += maxConcurrentChecks) {
        chunks.push(subs.slice(i, i + maxConcurrentChecks));
      }
      
      // Process each chunk sequentially
      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (subscription) => {
            if (subscription.merchantSubscriptionId) {
              const response = await checkSubscriptionStatus(subscription.merchantSubscriptionId);
              if (response.success && response.status) {
                await updateSubscriptionStatus(subscription.merchantSubscriptionId, response.status);
              }
            }
          })
        );
      }
      
      // Load updated subscriptions
      fetchSubscriptions();
    } catch (error) {
      console.error('Error checking subscription statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscriptions whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [])
  );

  const dumpSubscriptions = async () => {
    try {
      const data = await AsyncStorage.getItem('userSubscriptions');
      console.log('DEBUG: Current subscriptions in AsyncStorage:', data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Error dumping subscriptions:', error);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      // Dump current AsyncStorage for debugging
      await dumpSubscriptions();
      
      // Get all subscriptions without logging
      const allSubscriptions = await getUserSubscriptions();
      console.log(`Fetched ${allSubscriptions.length} subscriptions from storage`);
      
      // Just update state without logging all the subscription details
      categorizeSubscriptions(allSubscriptions);
      
      // Force a state change to trigger rerender if needed
      setLastUpdate(Date.now());
    } catch (error) {
      // Only log errors
      console.error('Error fetching subscriptions:', error);
      // Show an error to the user
      Alert.alert('Error', 'Could not load autopay plans. Please try again.');
    } finally {
      // Always clear the loading state when done, whether successful or not
      setLoading(false);
    }
  };

  const categorizeSubscriptions = (allSubscriptions: Subscription[]) => {
    const active: Subscription[] = [];
    const pending: Subscription[] = [];
    const cancelled: Subscription[] = [];

    allSubscriptions.forEach(sub => {
      // Handle different subscription states based on PhonePe's documentation
      const status = sub.status;
      
      if (status === 'ACTIVE') {
        active.push(sub);
      } else if (
        status === 'PENDING' || 
        status === 'ACTIVATION_IN_PROGRESS' ||
        status === 'PAUSE_IN_PROGRESS' || 
        status === 'UNPAUSE_IN_PROGRESS'
      ) {
        pending.push(sub);
      } else if (
        status === 'CANCELLED' || 
        status === 'CANCEL_IN_PROGRESS' || 
        status === 'REVOKED' || 
        status === 'REVOKE_IN_PROGRESS' ||
        status === 'FAILED' ||
        status === 'EXPIRED' ||
        status === 'PAUSED'
      ) {
        cancelled.push(sub);
      } else {
        // Default to pending for any unknown status
        pending.push(sub);
      }
    });

    setSubscriptions(active);
    setPendingSubscriptions(pending);
    setCancelledSubscriptions(cancelled);
  };

  // Add a function to check a specific subscription by ID
  const checkSpecificSubscription = async (merchantSubId: string) => {
    if (!merchantSubId) {
      Alert.alert('Error', 'No subscription ID provided');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Checking status for subscription: ${merchantSubId}`);
      
      const response = await checkSubscriptionStatus(merchantSubId);
      
      if (response.success) {
        // Log the result
        console.log(`Status for ${merchantSubId}: ${response.status}`);
        
        // Get detailed information from the API response
        const details = response.details || {};
        
        // Update the status in local storage
        await updateSubscriptionStatus(merchantSubId, response.status || 'UNKNOWN');
        
        // Refresh the UI
        fetchSubscriptions();
        
        // Show the detailed status to the user with all API response data
        Alert.alert(
          'Subscription Status', 
          `Status: ${response.status || 'Unknown'}\n` +
          `Subscription ID: ${details.subscriptionId || 'N/A'}\n` +
          `Amount Type: ${details.amountType || 'N/A'}\n` +
          `Max Amount: ₹${(details.maxAmount/100) || 'N/A'}\n` +
          `Frequency: ${details.frequency || 'N/A'}\n` +
          `Auth Type: ${details.authWorkflowType || 'N/A'}\n` +
          `${details.pauseStartDate ? `Pause Period: ${new Date(details.pauseStartDate).toLocaleDateString()} to ${new Date(details.pauseEndDate).toLocaleDateString()}` : ''}`
        );
      } else {
        Alert.alert('Error', 'Failed to check subscription status');
      }
    } catch (error) {
      console.error('Error checking specific subscription:', error);
      Alert.alert('Error', 'Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  };

  // Update the handleCancelSubscription function to reduce logging
  const handleCancelSubscription = async (subscription: Subscription) => {
    Alert.alert(
      'Cancel Autopay',
      'Are you sure you want to cancel this automatic payment plan?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
              setLoading(true);
            try {
              // Only log essential information about the action
              console.log(`Cancelling subscription: ${subscription.merchantSubscriptionId}`);
              
              const response = await cancelSubscription(subscription.merchantSubscriptionId);
              
              if (response.success) {
                console.log(`Successfully cancelled subscription: ${subscription.merchantSubscriptionId}`);
                
                // Update subscription status in local storage
                await updateSubscriptionStatus(subscription.merchantSubscriptionId, 'CANCELLED');
                
                // Refresh subscriptions to update UI
                fetchSubscriptions();
                
                Alert.alert('Success', 'Your autopay plan has been cancelled');
              } else {
                console.error('Cancel subscription failed with error:', response.error);
                Alert.alert('Error', 'Failed to cancel autopay plan');
              }
            } catch (error) {
              console.error('Cancel subscription error:', error);
              Alert.alert('Error', 'An error occurred while cancelling your autopay plan');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle pause subscription
  const handlePauseSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    // Set default pause start date to today
    setPauseStartDate(new Date());
    // Set default pause end date to 7 days from now
    setPauseEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setShowPauseModal(true);
  };

  // Update the pause subscription function to reduce logging
  const submitPauseSubscription = async () => {
    setLoading(true);
    try {
      if (!selectedSubscription) {
        Alert.alert('Error', 'No subscription selected for pausing');
        setLoading(false);
        return;
      }
      
      // Only log essential information
      console.log(`Pausing subscription: ${selectedSubscription.merchantSubscriptionId}`);
      console.log(`Pause period: ${pauseStartDate.toLocaleDateString()} to ${pauseEndDate.toLocaleDateString()}`);
      
      const response = await pauseSubscription(
        selectedSubscription.merchantSubscriptionId,
        pauseStartDate.getTime(),
        pauseEndDate.getTime()
      );
      
      if (response.success) {
        console.log(`Successfully paused subscription: ${selectedSubscription.merchantSubscriptionId}`);
        
        // Update subscription status and refresh list
        await updateSubscriptionStatus(selectedSubscription.merchantSubscriptionId, 'PAUSED');
        fetchSubscriptions();
        
        Alert.alert('Success', 'Your autopay plan has been paused');
        setShowPauseModal(false);
      } else {
        console.error('Pause subscription failed with error:', response.error);
        Alert.alert('Error', 'Failed to pause autopay plan');
      }
    } catch (error) {
      console.error('Pause subscription error:', error);
      Alert.alert('Error', 'An error occurred while pausing your autopay plan');
    } finally {
      setLoading(false);
    }
  };

  // Handle unpause subscription
  const handleUnpauseSubscription = async (merchantSubscriptionId: string) => {
    Alert.alert(
      'Resume Autopay',
      'Are you sure you want to resume this automatic payment plan?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Resume',
          onPress: async () => {
            try {
              setLoading(true);
              // Call PhonePe API to unpause subscription
              const response = await unpauseSubscription(merchantSubscriptionId);
              
              if (response && response.success) {
                // Update subscription status in local storage
                await updateSubscriptionStatus(merchantSubscriptionId, 'ACTIVE');
                
                // Find the subscription
                const subscription = cancelledSubscriptions.find(
                  sub => sub.merchantSubscriptionId === merchantSubscriptionId && sub.status === 'PAUSED'
                );
                
                if (subscription) {
                  // Move from cancelled to active
                  const updatedSubscription = { ...subscription, status: 'ACTIVE' as SubscriptionStatus };
                  setSubscriptions([...subscriptions, updatedSubscription]);
                  
                  // Remove from cancelled
                  setCancelledSubscriptions(cancelledSubscriptions.filter(
                    sub => !(sub.merchantSubscriptionId === merchantSubscriptionId && sub.status === 'PAUSED')
                  ));
                  
                  Alert.alert('Success', 'Your autopay plan has been resumed');
                }
              } else {
                Alert.alert('Error', 'Failed to resume autopay plan');
              }
            } catch (error) {
              console.error('Unpause Subscription Error:', error);
              Alert.alert('Error', 'An error occurred while resuming your autopay plan');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle revoke subscription
  const handleRevokeSubscription = async (merchantSubscriptionId: string) => {
    Alert.alert(
      'Revoke Autopay',
      'Are you sure you want to permanently revoke this automatic payment plan? This action cannot be undone.',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes, Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Call PhonPe API to revoke subscription
              const response = await revokeSubscription(merchantSubscriptionId);
              
          if (response && response.success) {
            // Update subscription status in local storage
                await updateSubscriptionStatus(merchantSubscriptionId, 'REVOKED');
                
                // Find the subscription to update (could be in any list)
                let foundSubscription: Subscription | undefined;
                let listType: 'active' | 'pending' | 'cancelled' = 'active';
                
                foundSubscription = subscriptions.find(sub => sub.merchantSubscriptionId === merchantSubscriptionId);
                if (!foundSubscription) {
                  foundSubscription = pendingSubscriptions.find(sub => sub.merchantSubscriptionId === merchantSubscriptionId);
                  if (foundSubscription) listType = 'pending';
                  else {
                    foundSubscription = cancelledSubscriptions.find(sub => sub.merchantSubscriptionId === merchantSubscriptionId);
                    if (foundSubscription) listType = 'cancelled';
                  }
                }
                
                if (foundSubscription) {
                  // Move to cancelled with revoked status
                  const updatedSubscription = { ...foundSubscription, status: 'REVOKED' as SubscriptionStatus };
                  
                  // Remove from original list and add to cancelled
                  if (listType === 'active') {
                    setSubscriptions(subscriptions.filter(sub => sub.merchantSubscriptionId !== merchantSubscriptionId));
                  } else if (listType === 'pending') {
                    setPendingSubscriptions(pendingSubscriptions.filter(sub => sub.merchantSubscriptionId !== merchantSubscriptionId));
                  } else {
                    // If already in cancelled, just update the status
                    setCancelledSubscriptions(cancelledSubscriptions.map(sub => 
                      sub.merchantSubscriptionId === merchantSubscriptionId ? updatedSubscription : sub
                    ));
                    Alert.alert('Success', 'Your autopay plan has been revoked');
                    setLoading(false);
                    return;
                  }
                  
                  // Add to cancelled list
                  setCancelledSubscriptions([updatedSubscription, ...cancelledSubscriptions]);
                  Alert.alert('Success', 'Your autopay plan has been revoked');
                }
              } else {
                Alert.alert('Error', 'Failed to revoke autopay plan');
          }
        } catch (error) {
              console.error('Revoke Subscription Error:', error);
              Alert.alert('Error', 'An error occurred while revoking your autopay plan');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Modify the checkAndUpdateSubscriptionStatus function to reduce logs
  const checkAndUpdateSubscriptionStatus = async (merchantSubscriptionId: string) => {
    setLoading(true);
    try {
      // Only log the action for the specific subscription being checked
      console.log(`Checking status for subscription: ${merchantSubscriptionId}`);
      
      const response = await checkSubscriptionStatus(merchantSubscriptionId);
      
      if (response.success) {
        // Log the result
        console.log(`Status for ${merchantSubscriptionId}: ${response.status}`);
        
        // Update the status
        await updateSubscriptionStatus(merchantSubscriptionId, response.status || 'PENDING');
        
        // Refresh the subscriptions
      fetchSubscriptions();
        
        return response.status;
      } else {
        console.error(`Failed to check status for ${merchantSubscriptionId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error checking status for ${merchantSubscriptionId}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Modify the checkAllSubscriptionsStatus function to reduce logging
  const checkAllSubscriptionsStatus = async () => {
    // Just log that we're refreshing, not every detail
    console.log('Refreshing subscription statuses...');
    setLoading(true);
    
    try {
      // Get all subscriptions
      const allSubs = await getUserSubscriptions();
      
      // Check status for active/pending subscriptions without excessive logging
      const pendingOrActive = allSubs.filter(
        sub => sub.status === 'PENDING' || sub.status === 'ACTIVE'
      );
      
      if (pendingOrActive.length > 0) {
        // Only log how many we're checking, not each one
        console.log(`Checking status for ${pendingOrActive.length} active/pending subscriptions`);
        
        // Process them sequentially to avoid overwhelming logs
        for (const sub of pendingOrActive) {
          await checkAndUpdateSubscriptionStatus(sub.merchantSubscriptionId);
        }
      }
      
      // Refresh subscriptions without logging details
      fetchSubscriptions();
    } catch (error) {
      console.error('Error checking subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFrequency = (frequency: string): string => {
    return subscriptionFrequencyUtils.toDisplayValue(frequency as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amountInPaise: number) => {
    const amountInRupees = amountInPaise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amountInRupees);
  };

  const getStatusDisplayText = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'PENDING':
        return 'Pending Activation';
      case 'ACTIVATION_IN_PROGRESS':
        return 'Activation in Progress';
      case 'PAUSE_IN_PROGRESS':
        return 'Pausing in Progress';
      case 'UNPAUSE_IN_PROGRESS':
        return 'Resuming in Progress';
      case 'CANCELLED':
        return 'Cancelled';
      case 'CANCEL_IN_PROGRESS':
        return 'Cancellation in Progress';
      case 'REVOKED':
        return 'Revoked';
      case 'REVOKE_IN_PROGRESS':
        return 'Revocation in Progress';
      case 'FAILED':
        return 'Failed';
      case 'EXPIRED':
        return 'Expired';
      case 'PAUSED':
        return 'Paused';
      default:
        return status;
    }
  };

  const renderSubscriptionCard = (subscription: Subscription, isCancelled: boolean = false, isPending: boolean = false) => (
    <View key={subscription.merchantSubscriptionId} style={[styles.subscriptionCard, isCancelled && styles.cancelledCard, isPending && styles.pendingCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.leftHeader}>
          <View 
            style={[
              styles.statusIndicator,
              subscription.status === 'ACTIVE' && styles.activeIndicator,
              subscription.status === 'CANCELLED' && styles.cancelledIndicator,
              subscription.status === 'PAUSED' && styles.pausedIndicator,
              subscription.status === 'PENDING' && styles.pendingIndicator,
            ]}
          />
          <Text style={styles.frequencyText}>
            {formatFrequency(subscription.frequency)}
          </Text>
        </View>
        
        <Text style={styles.statusText}>
          {getStatusDisplayText(subscription.status)}
        </Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amountValue}>
          {formatAmount(subscription.amount)}
        </Text>
        <Text style={styles.perText}>
          per {subscription.frequency.toLowerCase()}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Subscription ID:</Text>
        <Text style={styles.detailValue}>{subscription.merchantSubscriptionId}</Text>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Created: {formatDate(subscription.createdAt)}
        </Text>
        
        {/* Check Status Button */}
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => checkSpecificSubscription(subscription.merchantSubscriptionId)}
        >
          <Text style={styles.checkButtonText}>Check Status</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {!isCancelled && !isPending && (
        <View style={styles.actionButtons}>
          {subscription.status !== 'PAUSED' && (
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => handlePauseSubscription(subscription)}
            >
              <Text style={styles.pauseButtonText}>
                Pause
              </Text>
            </TouchableOpacity>
          )}
          
          {subscription.status === 'PAUSED' && (
            <TouchableOpacity
              style={styles.unpauseButton}
              onPress={() => handleUnpauseSubscription(subscription.merchantSubscriptionId)}
            >
              <Text style={styles.unpauseButtonText}>
                Resume
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Always show cancel button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelSubscription(subscription)}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && lastMerchantOrderId) {
        // App came to foreground, check subscription status
        try {
          setLoading(true);
          console.log('App came to foreground, checking order status:', lastMerchantOrderId);
          
          // Show checking status message
          Alert.alert('Checking Status', 'Verifying your autopay setup with PhonPe...');
          
          const orderStatus = await checkSubscriptionOrderStatus(lastMerchantOrderId);
          console.log('Order Status:', orderStatus);
          
          if (orderStatus.success) {
            if (orderStatus.state === 'COMPLETED') {
              Alert.alert('Success', 'Your autopay plan has been created successfully!');
              // Clear the last order ID
              setLastMerchantOrderId(null);
              // Refresh subscriptions
              fetchSubscriptions();
            } else if (orderStatus.state === 'FAILED') {
              Alert.alert('Failed', 'Failed to create autopay plan. Please try again.');
              setLastMerchantOrderId(null);
            } else if (orderStatus.state === 'PENDING') {
              Alert.alert(
                'Pending', 
                'Your autopay plan is being processed. Would you like to check again?',
                [
                  { 
                    text: 'Check Again',
                    onPress: () => checkAndUpdateSubscriptionStatus(lastMerchantOrderId)
                  },
                  {
                    text: 'OK',
                    style: 'cancel' 
                  }
                ]
              );
            }
          } else {
            Alert.alert('Error', 'Failed to check subscription status. Please try again.');
          }
        } catch (error) {
          console.error('Error checking order status:', error);
          Alert.alert('Error', 'Failed to check subscription status. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [lastMerchantOrderId]);

  // Handle setup subscription
  const handleSetupSubscription = () => {
    navigation.navigate('SetupAutopay');
  };

  // Add a useEffect hook to properly load subscriptions when the component mounts
  useEffect(() => {
    // Load subscriptions when component mounts
    console.log('ManageAutopay screen mounted - loading subscriptions');
    fetchSubscriptions();
    
    // Set up a focus listener to reload when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('ManageAutopay screen focused - reloading subscriptions');
      fetchSubscriptions();
    });
    
    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, [navigation]);

  // Add a debug useEffect to log when loading state changes
  useEffect(() => {
    console.log('Loading state changed:', loading);
  }, [loading]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => fetchSubscriptions()}
          style={{ marginRight: 15 }}
        >
          <Icon name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, fetchSubscriptions]);

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
        <Text style={styles.headerTitle}>Manage Autopay</Text>
      </LinearGradient>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchSubscriptions}
        >
          <Icon name="refresh" size={16} color={COLORS.textDim} />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.redemptionButton, subscriptions.length === 0 && styles.disabledButton]}
          onPress={() => {
            if (subscriptions.length > 0) {
              navigation.navigate('ProcessRedemption', { 
                merchantSubscriptionIds: subscriptions.map(s => s.merchantSubscriptionId)
              });
            } else {
              Alert.alert('No Active Subscriptions', 'You need an active subscription to process a redemption.');
            }
          }}
        >
          <Icon name="cash-multiple" size={16} color={COLORS.textDim} />
          <Text style={styles.refreshText}>
            Process Redemption ({subscriptions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading your autopay plans...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {subscriptions.length === 0 && pendingSubscriptions.length === 0 && cancelledSubscriptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="cash-remove" size={60} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>
                You don't have any autopay plans.
              </Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={handleSetupSubscription}
              >
                <LinearGradient
                  colors={COLORS.purpleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.setupButtonGradient}
                >
                  <Text style={styles.setupButtonText}>
                    Set Up Autopay
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Active Subscriptions */}
              {subscriptions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    Active Autopay Plans
                  </Text>
                  
                  {subscriptions.map(subscription => renderSubscriptionCard(subscription))}
                </>
              )}
              
              {/* Pending Subscriptions */}
              {pendingSubscriptions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    Pending Autopay Plans
                  </Text>
                  
                  {pendingSubscriptions.map(subscription => renderSubscriptionCard(subscription, false, true))}
                </>
              )}
              
              {/* Cancelled Subscriptions */}
              {cancelledSubscriptions.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    Cancelled/Expired Autopay Plans
                  </Text>
                  
                  {cancelledSubscriptions.map(subscription => 
                    renderSubscriptionCard(subscription, true)
                  )}
                </>
              )}
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleSetupSubscription}
              >
                <LinearGradient
                  colors={COLORS.lightPurpleGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButtonGradient}
                >
                  <Icon name="plus" size={20} color={COLORS.text} />
                  <Text style={styles.addButtonText}>
                    Add Another Autopay Plan
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
      
      {/* Pause Modal */}
      <Modal
        visible={showPauseModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPauseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Pause Autopay Plan</Text>
            
            <Text style={styles.modalLabel}>Pause Start Date:</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // In a real app, you would use a DatePicker here
                // For this example, we're just using the default dates
                Alert.alert('Start Date', 'In a complete implementation, a date picker would open here');
              }}
            >
              <Text style={styles.dateText}>
                {pauseStartDate.toLocaleDateString('en-IN')}
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.modalLabel}>Pause End Date:</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // In a real app, you would use a DatePicker here
                Alert.alert('End Date', 'In a complete implementation, a date picker would open here');
              }}
            >
              <Text style={styles.dateText}>
                {pauseEndDate.toLocaleDateString('en-IN')}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPauseModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={submitPauseSubscription}
              >
                <Text style={styles.modalSubmitText}>Pause</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  redemptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  refreshText: {
    color: COLORS.textDim,
    fontSize: 14,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textDim,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  setupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  setupButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  activeIndicator: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  pausedIndicator: {
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
  },
  pendingIndicator: {
    backgroundColor: 'rgba(255, 255, 0, 0.2)',
  },
  cancelledIndicator: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  frequencyText: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  perText: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  checkButton: {
    backgroundColor: 'rgba(106, 78, 156, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  checkButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  pauseButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  pauseButtonText: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
  },
  unpauseButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  unpauseButtonText: {
    fontSize: 14,
    color: '#00FF00',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#FF4D4D',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardDark,
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF4D4D',
  },
  modalSubmitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: COLORS.primary,
  },
  modalSubmitText: {
    fontSize: 16,
    color: COLORS.background,
    fontWeight: '600',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  addButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  pendingCard: {
    backgroundColor: 'rgba(255, 255, 0, 0.05)',
  },
  cancelledCard: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ManageAutopay;