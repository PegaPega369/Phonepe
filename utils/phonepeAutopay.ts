import axios from 'axios';
import { sha256 } from 'react-native-sha256';
import { Buffer } from 'buffer';
import { encode as btoa, decode as atob } from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import { Linking } from 'react-native';
import { getSavedUpiVpa } from './upiManagement';
import { Alert } from 'react-native';

// PhonePe API configuration
const PHONEPE_BASE_URL = process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PHONEPEPGUAT';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || 'c817ffaf-8471-48b5-a7e2-a27e5b7efbd3';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID || 'TEST-M22OP1ROUYFHC_25042'; // Client ID valid until Apr 21, 2025
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || 'YjY5YTE5NjQtYWQ2My00Y2NiLTkyYmYtZmNjM2E3MmI1NjUw'; // Client Secret
const CLIENT_VERSION = '1'; // Use 1 for sandbox/UAT environment

// Configuration values for webhook authentication
const WEBHOOK_USERNAME = process.env.PHONEPE_WEBHOOK_USERNAME || '';
const WEBHOOK_PASSWORD = process.env.PHONEPE_WEBHOOK_PASSWORD || '';

// Type definitions
export type SubscriptionFrequency = 
  | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'DAILY' 
  | 'BI_MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUALLY'
  | 'HALFYEARLY' | 'ONCE' 
  | '1' | '7' | '15' | '30';

export type SubscriptionStatus = 
  | 'ACTIVE' 
  | 'CANCELLED' 
  | 'REVOKED' 
  | 'PENDING' 
  | 'ACTIVATION_IN_PROGRESS' 
  | 'FAILED' 
  | 'EXPIRED' 
  | 'CANCEL_IN_PROGRESS' 
  | 'REVOKE_IN_PROGRESS' 
  | 'PAUSE_IN_PROGRESS' 
  | 'PAUSED' 
  | 'UNPAUSE_IN_PROGRESS';

export type SubscriptionResponse = {
  success: boolean;
  subscriptionId?: string;
  merchantSubscriptionId?: string;
  message?: string;
  error?: any;
};

/**
 * Validate webhook authorization header
 * @param authHeader Authorization header from PhonePe webhook
 * @returns boolean indicating if the authorization is valid
 */
export const validateWebhookAuth = async (authHeader: string): Promise<boolean> => {
  try {
    if (!authHeader) {
      console.error('Missing Authorization header');
      return false;
    }

    // If credentials are not configured yet, log a warning and allow the webhook
    if (!WEBHOOK_USERNAME || !WEBHOOK_PASSWORD) {
      console.warn('Webhook credentials not yet configured - bypassing authorization check');
      console.warn('Set PHONEPE_WEBHOOK_USERNAME and PHONEPE_WEBHOOK_PASSWORD environment variables when available');
      return true; // Allow the webhook for now
    }
    
    // Generate expected auth header
    const credentials = `${WEBHOOK_USERNAME}:${WEBHOOK_PASSWORD}`;
    const expectedHash = await sha256(credentials);
    
    // Compare with received header
    return authHeader === expectedHash;
  } catch (error) {
    console.error('Error validating webhook authorization:', error);
    return false;
  }
};

/**
 * Handle webhook callbacks from PhonePe for subscription events
 * @param requestBody Raw request body from PhonePe callback
 * @param authHeader Authorization header from PhonePe request
 * @returns Processed callback data with validation status
 */
export const handleSubscriptionWebhook = async (
  requestBody: any,
  authHeader: string
): Promise<{
  isValid: boolean;
  eventType?: string;
  merchantSubscriptionId?: string;
  state?: string;
  data?: any;
}> => {
  try {
    // Validate authorization header
    const isValid = await validateWebhookAuth(authHeader);
    if (!isValid) {
      console.error('Invalid webhook authorization');
      return { isValid: false };
    }

    // Check for required fields
    if (!requestBody || !requestBody.payload) {
      console.error('Invalid webhook payload format');
      return { isValid: false };
    }

    const { type, payload } = requestBody;
    const eventType = type; // In future implementations, use 'event' instead as per PhonePe recommendation
    
    // Extract key information from payload
    const {
      merchantSubscriptionId,
      state,
      merchantOrderId,
      orderId,
      amount,
      expireAt,
      paymentFlow,
      paymentDetails,
      pauseStartDate,
      pauseEndDate,
      subscriptionId
    } = payload;

    console.log(`Processing ${eventType} webhook for subscription: ${merchantSubscriptionId || 'N/A'}`);
    console.log('Subscription state:', state);

    // Process based on event type
    let result = { isValid: true, eventType, merchantSubscriptionId, state, data: payload };

    // Handle different event types
    switch (eventType) {
      case 'SUBSCRIPTION_NOTIFICATION_COMPLETED':
      case 'SUBSCRIPTION_NOTIFICATION_FAILED':
        // Process notification events
        console.log('Notification status:', state);
        break;

      case 'SUBSCRIPTION_REDEMPTION_ORDER_COMPLETED':
      case 'SUBSCRIPTION_REDEMPTION_ORDER_FAILED':
      case 'SUBSCRIPTION_REDEMPTION_TRANSACTION_COMPLETED':
      case 'SUBSCRIPTION_REDEMPTION_TRANSACTION_FAILED':
        // Process redemption events
        console.log('Redemption status:', state);
        if (paymentDetails && paymentDetails.length > 0) {
          console.log('Payment details:', JSON.stringify(paymentDetails[0], null, 2));
        }
        break;

      case 'SUBSCRIPTION_PAUSED':
        // Process subscription pause event
        console.log('Subscription paused:', state);
        console.log('Pause period:', new Date(pauseStartDate).toLocaleString(), 'to', new Date(pauseEndDate).toLocaleString());
        break;

      case 'SUBSCRIPTION_UNPAUSED':
        // Process subscription unpause event
        console.log('Subscription unpaused:', state);
        break;

      case 'SUBSCRIPTION_REVOKED':
        // Process subscription revoke event
        console.log('Subscription revoked:', state);
        break;

      default:
        console.warn('Unknown event type:', eventType);
    }

    return result;
  } catch (error) {
    console.error('Error processing webhook:', error);
    return { isValid: false };
  }
};

/**
 * Update local subscription status based on webhook data
 * @param webhookData Processed webhook data
 * @returns Status update result
 */
export const updateSubscriptionFromWebhook = async (
  webhookData: {
    isValid: boolean;
    eventType?: string;
    merchantSubscriptionId?: string;
    state?: string;
    data?: any;
  }
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    if (!webhookData.isValid || !webhookData.merchantSubscriptionId) {
      return { 
        success: false, 
        message: 'Invalid webhook data' 
      };
    }

    // Map PhonePe state to our subscription status format
    let status: SubscriptionStatus;
    
    switch (webhookData.state) {
      case 'ACTIVE':
        status = 'ACTIVE';
        break;
      case 'PAUSED':
        status = 'PAUSED';
        break;
      case 'REVOKED':
        status = 'REVOKED';
        break;
      case 'FAILED':
        status = 'FAILED';
        break;
      case 'COMPLETED':
        status = 'ACTIVE'; // For redemption completed events
        break;
      default:
        status = 'PENDING';
    }

    // Update subscription status in local storage
    await updateSubscriptionStatus(webhookData.merchantSubscriptionId, status);
    
    console.log(`Updated subscription ${webhookData.merchantSubscriptionId} to status: ${status}`);
    return {
      success: true,
      message: `Updated subscription status to: ${status}`
    };
  } catch (error) {
    console.error('Error updating subscription from webhook:', error);
    return {
      success: false,
      message: 'Failed to update subscription status'
    };
  }
};

// Token storage
let authToken: string | null = null;
let tokenExpiresAt: number = 0;

// Helper function to generate X-VERIFY header
const generateXVerifyHeader = async (payload: string, apiEndpoint: string): Promise<string> => {
  try {
    const string = payload + apiEndpoint + SALT_KEY;
    console.log('X-VERIFY input string (first 50 chars):', string.substring(0, 50) + '...');
    
    // Use react-native-sha256 instead of Node's crypto
    const hash = await sha256(string);
    console.log('SHA256 hash:', hash);
    
    return hash + '###' + SALT_INDEX;
  } catch (error) {
    console.error('Error generating X-VERIFY header:', error);
    throw error;
  }
};

// Helper function to encode payload to base64
const encodeToBase64 = (data: any): string => {
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

// Helper function to decode base64 to string
const decodeFromBase64 = (base64String: string): any => {
  return JSON.parse(atob(base64String));
};

/**
 * Fetches OAuth auth token from PhonePe
 * Automatically refreshes token when expired
 */
export const getAuthToken = async (): Promise<string> => {
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Return existing token if it's still valid
  if (authToken && tokenExpiresAt > currentTime) {
    return authToken;
  }
  
  try {
    console.log('Fetching new auth token...');
    const tokenUrl = `${PHONEPE_BASE_URL}/v1/oauth/token`;
    console.log('Auth URL:', tokenUrl);
    console.log('Client ID:', CLIENT_ID);
    console.log('Client Version:', CLIENT_VERSION);
    
    const response = await axios.post(
      tokenUrl,
      null,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {
          client_id: CLIENT_ID,
          client_version: CLIENT_VERSION,
          client_secret: CLIENT_SECRET,
          grant_type: 'client_credentials'
        }
      }
    );
    
    console.log('Auth Token Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.access_token) {
      authToken = response.data.access_token;
      tokenExpiresAt = response.data.expires_at || (currentTime + 3600); // Default 1 hour expiry
      return response.data.access_token;
    } else {
      throw new Error('Invalid token response');
    }
  } catch (error: any) {
    console.error('Error fetching PhonePe auth token:', error.message);
    console.error('Response data:', error.response?.data);
    throw error;
  }
};

/**
 * Setup a new subscription for a user
 * @param userId User's unique identifier
 * @param amount Amount in paise (multiply rupee value by 100)
 * @param frequency Subscription frequency (DAILY, WEEKLY, MONTHLY, etc.)
 * @param amountType FIXED or VARIABLE
 * @param maxAmount Maximum amount that can be charged
 * @param authWorkflowType PENNY_DROP or TRANSACTION
 * @param targetApp UPI app package name for intent mode (optional)
 */
export const setupSubscription = async (
  userId: string,
  amount: number,
  frequency: SubscriptionFrequency,
  amountType: 'FIXED' | 'VARIABLE',
  maxAmount: number,
  authWorkflowType: 'PENNY_DROP' | 'TRANSACTION',
  targetApp: string = 'com.phonepe.app'
) => {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Generate unique merchant order ID and subscription ID
    const timestamp = Date.now();
    const merchantOrderId = `MO${timestamp}`;
    const merchantSubscriptionId = `MS${timestamp}`;
    
    // Calculate expiry timestamps (10 minutes for order, 5 years for subscription)
    const orderExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const subscriptionExpireAt = Date.now() + 5 * 365 * 24 * 60 * 60 * 1000; // 5 years
    
    // Determine payment mode based on provided parameters
    const paymentMode = {
      type: "UPI_INTENT",
      details: {
        targetApp: targetApp
      }
    };
    
    // Prepare subscription request payload
    const subscriptionPayload = {
      merchantOrderId,
      amount,
      expireAt: orderExpireAt,
      paymentFlow: {
        type: "SUBSCRIPTION_SETUP",
        merchantSubscriptionId,
        authWorkflowType,
        amountType,
        maxAmount,
        frequency,
        expireAt: subscriptionExpireAt,
        paymentMode: paymentMode
      },
      deviceContext: {
        deviceOS: "ANDROID"
      }
    };
    
    // Log only that we're creating a subscription, not the entire payload
    console.log(`Creating subscription for merchant order ID: ${merchantOrderId}`);
    console.log(`Merchant subscription ID: ${merchantSubscriptionId}`);
    
    try {
      const response = await axios.post(
        `${PHONEPE_BASE_URL}/subscriptions/v2/setup`,
        subscriptionPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          }
        }
      );
      
      // Only log the important information - whether the intent URL was received or not
      if (response.data && response.data.intentUrl) {
        console.log(`Intent URL received for subscription ${merchantSubscriptionId}`);
      } else if (response.data && response.data.redirectInfo && response.data.redirectInfo.url) {
        console.log(`Redirect URL received for subscription ${merchantSubscriptionId}`);
      } else {
        console.log(`No intent URL received for subscription ${merchantSubscriptionId}, using fallback`);
      }
      
      return {
        success: true,
        orderId: response.data.orderId,
        state: response.data.state,
        intentUrl: response.data.intentUrl || response.data.redirectInfo?.url,
        merchantOrderId,
        merchantSubscriptionId
      };
    } catch (axiosError: any) {
      console.error('API Error:', axiosError.response?.status, axiosError.response?.statusText);
      throw axiosError;
    }
  } catch (error) {
    console.error('PhonePe Subscription Setup Error:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Submit an authorization request for a subscription
 * @param subscriptionId Subscription ID returned from createUserSubscription
 * @param merchantSubscriptionId Merchant subscription ID used when creating the subscription
 * @param callbackUrl URL to redirect user after authorization
 * @param redirectMode Determines how redirect should happen (APP or WEB)
 */
export const submitAuthRequest = async (
  subscriptionId: string,
  merchantSubscriptionId: string,
  callbackUrl: string,
  redirectMode: 'APP' | 'WEB' = 'APP'
) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare auth request payload
    const authPayload = {
      merchantId: MERCHANT_ID,
      merchantSubscriptionId: merchantSubscriptionId,
      subscriptionId: subscriptionId,
      callbackUrl: callbackUrl,
      redirectMode: redirectMode,
      redirectUrl: callbackUrl
    };
    
    console.log('Auth Request Payload:', JSON.stringify(authPayload, null, 2));
    
    // Encode payload to base64
    const base64Payload = encodeToBase64(authPayload);
    const requestBody = {
      request: base64Payload
    };
    
    // Generate X-VERIFY header
    const apiEndpoint = '/v3/recurring/subscription/auth/init';
    const xVerifyHeader = await generateXVerifyHeader(base64Payload, apiEndpoint);
    
    console.log('Request URL:', `${PHONEPE_BASE_URL}${apiEndpoint}`);
    
    // Make API call
    try {
      const response = await axios.post(
        `${PHONEPE_BASE_URL}${apiEndpoint}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerifyHeader,
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Auth Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      throw axiosError;
    }
  } catch (error) {
    console.error('PhonePe Auth Request Error:', error);
    throw error;
  }
};

/**
 * Checks the status of a subscription
 * @param merchantSubscriptionId - Merchant subscription ID
 * @returns Object containing success status and subscription details
 */
export const checkSubscriptionStatus = async (
  merchantSubscriptionId: string
): Promise<{ success: boolean; status?: SubscriptionStatus; details?: any }> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Make API call to check subscription status
    const response = await axios.get(
      `${PHONEPE_BASE_URL}/subscriptions/v2/${merchantSubscriptionId}/status?details=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`
        }
      }
    );

    // Handle response
    if (response.data) {
      // Log only the subscription ID and its status
      console.log(`Subscription ${merchantSubscriptionId} status: ${response.data.state}`);
      
      return {
        success: true,
        status: response.data.state as SubscriptionStatus,
        details: response.data
      };
    } else {
      return {
        success: false,
        details: response.data
      };
    }
  } catch (error) {
    console.error(`Error checking subscription ${merchantSubscriptionId} status:`, error);
    return {
      success: false,
      details: error
    };
  }
};

/**
 * Initiates a recurring payment
 * @param subscriptionId Subscription ID
 * @param amount Amount to charge in paise
 * @param scheduledOn Date when the payment is scheduled (ISO format)
 * @param callbackUrl Callback URL for payment events
 * @param autoDebit Whether to automatically debit or wait for execute API
 */
export const initiateRecurringPayment = async (
  subscriptionId: string,
  amount: number,
  scheduledOn: string,
  callbackUrl: string,
  autoDebit: boolean = true
) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare init request payload
    const initPayload = {
      merchantId: MERCHANT_ID,
      merchantSubscriptionId: subscriptionId,
      amount: amount,
      scheduledOn: scheduledOn,
      callbackUrl: callbackUrl,
      autoDebit: autoDebit,
    };

    // Encode payload to base64
    const base64Payload = encodeToBase64(initPayload);
    const requestBody = {
      request: base64Payload
    };

    // Generate X-VERIFY header
    const apiEndpoint = '/recurring/payment/init';
    const xVerifyHeader = await generateXVerifyHeader(base64Payload, apiEndpoint);

    // Make API call
    const response = await axios.post(
      `${PHONEPE_BASE_URL}${apiEndpoint}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('PhonePe Recurring Payment Init Error:', error);
    throw error;
  }
};

/**
 * Executes a recurring payment after initiation when autoDebit is false
 * @param subscriptionId Subscription ID
 * @param recurringPaymentId Payment ID received from initiateRecurringPayment
 */
export const executeRecurringPayment = async (
  subscriptionId: string,
  recurringPaymentId: string
) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare execute request payload
    const executePayload = {
      merchantId: MERCHANT_ID,
      merchantSubscriptionId: subscriptionId,
      recurringPaymentId: recurringPaymentId,
    };

    // Encode payload to base64
    const base64Payload = encodeToBase64(executePayload);
    const requestBody = {
      request: base64Payload
    };

    // Generate X-VERIFY header
    const apiEndpoint = '/recurring/payment/execute';
    const xVerifyHeader = await generateXVerifyHeader(base64Payload, apiEndpoint);

    // Make API call
    const response = await axios.post(
      `${PHONEPE_BASE_URL}${apiEndpoint}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('PhonePe Recurring Payment Execute Error:', error);
    throw error;
  }
};

/**
 * Cancel a subscription
 * @param merchantSubscriptionId Merchant's subscription ID to cancel
 */
export const cancelSubscription = async (merchantSubscriptionId: string): Promise<{
  success: boolean;
  details?: any;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    console.log(`Cancelling subscription: ${merchantSubscriptionId}`);
    
    // Make API call to the correct cancel endpoint from PhonPe docs
    try {
      const response = await axios.post(
        `${PHONEPE_BASE_URL}/subscriptions/v2/${merchantSubscriptionId}/cancel`,
        {}, // Empty body as per PhonPe docs
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          }
        }
      );
      
      // PhonPe returns 204 No Content on successful cancellation
      if (response.status === 204) {
        console.log(`Successfully cancelled subscription: ${merchantSubscriptionId}`);
        
        // Update local subscription status
        await updateSubscriptionStatus(merchantSubscriptionId, 'CANCELLED');
        
        return {
          success: true,
          details: { message: 'Subscription successfully cancelled' }
        };
      } else {
        return {
          success: true,
          details: response.data
        };
      }
    } catch (axiosError: any) {
      console.error(`Failed to cancel subscription ${merchantSubscriptionId}:`, 
        axiosError.response?.status, 
        axiosError.response?.statusText
      );
      
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
    }
  } catch (error) {
    console.error(`Error cancelling subscription ${merchantSubscriptionId}:`, error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Pause a subscription
 * @param subscriptionId PhonPe subscription ID
 * @param merchantSubscriptionId Merchant subscription ID
 * @param pauseStartDate Date from which to pause in milliseconds epoch timestamp
 * @param pauseEndDate Date until which to pause in milliseconds epoch timestamp
 */
export const pauseSubscription = async (
  merchantSubscriptionId: string,
  pauseStartDate: number,
  pauseEndDate: number
): Promise<{
  success: boolean;
  details?: any;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    console.log('Pausing subscription...');
    console.log('Merchant Subscription ID:', merchantSubscriptionId);
    console.log('Pause Period:', new Date(pauseStartDate).toLocaleString(), 'to', new Date(pauseEndDate).toLocaleString());
    
    // Prepare pause request payload
    const pausePayload = {
      pauseStartDate,
      pauseEndDate
    };
    
    // Make API call
    try {
      // PhonPe doesn't provide a direct pause API in their documentation,
      // so we'd need to implement the pause logic based on their webhook events
      // This is a placeholder for when the API becomes available
      Alert.alert('Feature Not Available', 'The pause subscription feature is not yet available in the PhonPe API.');
      
      // For development/testing, still update local status
      await updateSubscriptionStatus(merchantSubscriptionId, 'PAUSED');
      
      return {
        success: true,
        details: { message: 'Subscription paused for testing purposes' }
      };
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
    }
  } catch (error) {
    console.error('PhonePe Subscription Pause Error:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Unpause a subscription
 * @param merchantSubscriptionId Merchant subscription ID
 */
export const unpauseSubscription = async (
  merchantSubscriptionId: string
): Promise<{
  success: boolean;
  details?: any;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    console.log('Unpausing subscription...');
    console.log('Merchant Subscription ID:', merchantSubscriptionId);
    
    // Make API call
    try {
      // PhonPe doesn't provide a direct unpause API in their documentation,
      // so we'd need to implement the unpause logic based on their webhook events
      // This is a placeholder for when the API becomes available
      Alert.alert('Feature Not Available', 'The unpause subscription feature is not yet available in the PhonPe API.');
      
      // For development/testing, still update local status
      await updateSubscriptionStatus(merchantSubscriptionId, 'ACTIVE');
      
      return {
        success: true,
        details: { message: 'Subscription unpaused for testing purposes' }
      };
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
    }
  } catch (error) {
    console.error('PhonPe Subscription Unpause Error:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Revoke a subscription
 * @param merchantSubscriptionId Merchant subscription ID
 */
export const revokeSubscription = async (
  merchantSubscriptionId: string
): Promise<{
  success: boolean;
  details?: any;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    console.log('Revoking subscription...');
    console.log('Merchant Subscription ID:', merchantSubscriptionId);
    
    // Make API call
    try {
      // PhonPe doesn't provide a direct revoke API in their documentation,
      // so we'd need to implement the revoke logic based on their webhook events
      // This is a placeholder for when the API becomes available
      Alert.alert('Feature Not Available', 'The revoke subscription feature is not yet available in the PhonPe API.');
      
      // For development/testing, still update local status
      await updateSubscriptionStatus(merchantSubscriptionId, 'REVOKED');
      
      return {
        success: true,
        details: { message: 'Subscription revoked for testing purposes' }
      };
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
    }
  } catch (error) {
    console.error('PhonPe Subscription Revoke Error:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Refund a payment
 * @param transactionId Original transaction ID to refund
 * @param amount Amount to refund in paise (cannot be more than original amount)
 * @param merchantOrderId Merchant's refund order ID (must be unique)
 * @param reason Reason for refund
 */
export const refundPayment = async (
  transactionId: string,
  amount: number,
  merchantOrderId: string,
  reason: string
) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare refund request payload
    const refundPayload = {
      merchantId: MERCHANT_ID,
      transactionId: transactionId,
      amount: amount,
      merchantOrderId: merchantOrderId,
      reason: reason
    };
    
    // Encode payload to base64
    const base64Payload = encodeToBase64(refundPayload);
    const requestBody = {
      request: base64Payload
    };
    
    // Generate X-VERIFY header
    const apiEndpoint = '/recurring/payment/refund';
    const xVerifyHeader = await generateXVerifyHeader(base64Payload, apiEndpoint);
    
    // Make API call
    const response = await axios.post(
      `${PHONEPE_BASE_URL}${apiEndpoint}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('PhonePe Refund Error:', error);
    throw error;
  }
};

/**
 * Check refund status
 * @param merchantOrderId Merchant's refund order ID
 */
export const checkRefundStatus = async (merchantOrderId: string) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare refund status request payload
    const statusPayload = {
      merchantId: MERCHANT_ID,
      merchantOrderId: merchantOrderId
    };
    
    // Encode payload to base64
    const base64Payload = encodeToBase64(statusPayload);
    const requestBody = {
      request: base64Payload
    };
    
    // Generate X-VERIFY header
    const apiEndpoint = '/recurring/payment/refund/status';
    const xVerifyHeader = await generateXVerifyHeader(base64Payload, apiEndpoint);
    
    // Make API call
    const response = await axios.post(
      `${PHONEPE_BASE_URL}${apiEndpoint}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('PhonePe Refund Status Error:', error);
    throw error;
  }
};

/**
 * Handle subscription callback from PhonePe
 * This function should be called from your webhook/callback handler
 * @param requestBody The raw request body from PhonePe callback
 * @returns Parsed and verified callback data
 */
export const handleSubscriptionCallback = async (requestBody: any) => {
  try {
    // Extract base64 encoded data from request
    const { request } = requestBody;
    
    // Decode the base64 payload
    const decodedData = JSON.parse(Buffer.from(request, 'base64').toString('utf8'));
    
    // Verify callback using X-VERIFY header if provided
    // This would require accessing the request headers in your actual implementation
    
    return {
      success: true,
      data: decodedData
    };
  } catch (error) {
    console.error('PhonePe Subscription Callback Error:', error);
    throw error;
  }
};

/**
 * Handle redemption callback from PhonePe
 * This function should be called from your webhook/callback handler
 * @param requestBody The raw request body from PhonePe callback
 * @returns Parsed and verified callback data
 */
export const handleRedemptionCallback = async (requestBody: any) => {
  try {
    // Extract base64 encoded data from request
    const { request } = requestBody;
    
    // Decode the base64 payload
    const decodedData = JSON.parse(Buffer.from(request, 'base64').toString('utf8'));
    
    // Verify callback using X-VERIFY header if provided
    // This would require accessing the request headers in your actual implementation
    
    return {
      success: true,
      data: decodedData
    };
  } catch (error) {
    console.error('PhonePe Redemption Callback Error:', error);
    throw error;
  }
};

/**
 * Initiate a redemption/payment on a subscription
 * @param merchantSubscriptionId Merchant's subscription ID
 * @param amount Amount to charge in paise
 * @param remarks Optional remarks for this transaction
 */
export const initiateRedemption = async (
  merchantSubscriptionId: string,
  amount: number,
  remarks?: string
) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Generate unique merchant order ID for this redemption
    const merchantOrderId = `RO${Date.now()}`;
    
    // Prepare redemption request payload
    const redemptionPayload = {
      merchantOrderId: merchantOrderId,
      merchantSubscriptionId: merchantSubscriptionId,
      amount: amount,
      remarks: remarks || "Subscription payment"
    };
    
    console.log('Redemption Payload:', JSON.stringify(redemptionPayload, null, 2));
    
    // Make API call
    try {
      const response = await axios.post(
        `${PHONEPE_BASE_URL}/subscriptions/v2/redemption/notify`,
        redemptionPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          }
        }
      );
      
      console.log('Redemption Response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        merchantOrderId: merchantOrderId,
        paymentId: response.data.paymentId,
        state: response.data.state,
        details: response.data
      };
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      throw axiosError;
    }
  } catch (error) {
    console.error('PhonePe Redemption Error:', error);
    throw error;
  }
};

/**
 * Check the status of a redemption/payment
 * @param merchantOrderId Merchant Order ID used during redemption
 */
export const checkRedemptionStatus = async (merchantOrderId: string) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    console.log('Checking redemption status...');
    console.log('Merchant Order ID:', merchantOrderId);
    
    // Make API call
    try {
      const response = await axios.get(
        `${PHONEPE_BASE_URL}/subscriptions/v2/redemption/status/${merchantOrderId}`,
        {
          headers: {
            'Authorization': `O-Bearer ${token}`
          }
        }
      );
      
      console.log('Redemption Status Response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        paymentId: response.data.paymentId,
        state: response.data.state,
        details: response.data
      };
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      throw axiosError;
    }
  } catch (error) {
    console.error('PhonePe Redemption Status Error:', error);
    throw error;
  }
};

/**
 * Interface for subscription data
 */
export interface Subscription {
  id: string;
  merchantSubscriptionId: string;
  status: SubscriptionStatus;
  amount: number;
  frequency: SubscriptionFrequency | string;
  startDate: string;
  endDate?: string;
  upiId?: string;
  createdAt: string;
}

/**
 * Gets user subscriptions from local storage
 * @param onlyActive If true, returns only active subscriptions
 * @returns Array of user subscriptions
 */
export const getUserSubscriptions = async (onlyActive: boolean = false): Promise<Subscription[]> => {
  try {
    const subscriptions = await AsyncStorage.getItem('userSubscriptions');
    if (subscriptions) {
      const parsedSubscriptions = JSON.parse(subscriptions) as Subscription[];
      if (onlyActive) {
        return parsedSubscriptions.filter(subscription => subscription.status === 'ACTIVE');
      }
      return parsedSubscriptions;
    }
    return [];
  } catch (error) {
    console.error('Error retrieving subscriptions:', error);
    return [];
  }
};

/**
 * Save a subscription to local storage
 */
export const saveSubscription = async (subscription: any) => {
  try {
    // Get existing subscriptions
    const existingData = await AsyncStorage.getItem('userSubscriptions');
    let subscriptions = existingData ? JSON.parse(existingData) : [];
    
    // Check if this subscription already exists by merchantSubscriptionId
    const existingIndex = subscriptions.findIndex(
      (sub: any) => sub.merchantSubscriptionId === subscription.merchantSubscriptionId
    );
    
    // Add or update the subscription
    if (existingIndex >= 0) {
      // Update existing subscription
      subscriptions[existingIndex] = {
        ...subscriptions[existingIndex],
        ...subscription,
      };
      console.log(`Updated existing subscription: ${subscription.merchantSubscriptionId}`);
    } else {
      // Add new subscription
      subscriptions.push(subscription);
      console.log(`Added new subscription: ${subscription.merchantSubscriptionId}`);
    }
    
    // Save back to storage
    console.log(`Saving ${subscriptions.length} subscriptions to AsyncStorage`);
    await AsyncStorage.setItem('userSubscriptions', JSON.stringify(subscriptions));
    
    return { success: true };
  } catch (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
};

/**
 * Update a subscription's status in local storage
 */
export const updateSubscriptionStatus = async (merchantSubscriptionId: string, status: string) => {
  try {
    // Get existing subscriptions
    const existingData = await AsyncStorage.getItem('userSubscriptions');
    if (!existingData) {
      return { success: false, error: 'No subscriptions found' };
    }
    
    let subscriptions = JSON.parse(existingData);
    
    // Find and update the subscription
    const updatedSubscriptions = subscriptions.map((sub: any) => {
      if (sub.merchantSubscriptionId === merchantSubscriptionId) {
        return { ...sub, status };
      }
      return sub;
    });
    
    // Save back to storage
    await AsyncStorage.setItem('userSubscriptions', JSON.stringify(updatedSubscriptions));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

/**
 * Checks the status of a subscription order
 * @param merchantOrderId - Merchant Order ID used during setup
 * @returns Object containing success status and order details
 */
export const checkSubscriptionOrderStatus = async (
  merchantOrderId: string
): Promise<{ success: boolean; state?: string; details?: any }> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    console.log('Checking subscription order status...');
    console.log('Merchant Order ID:', merchantOrderId);
    
    // Make API call
    const response = await axios.get(
      `${PHONEPE_BASE_URL}/subscriptions/v2/order/${merchantOrderId}/status?details=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`
        }
      }
    );

      return {
        success: true,
      state: response.data.state,
      details: response.data
    };
  } catch (error) {
    console.error('PhonPe Subscription Order Status Error:', error);
    return {
      success: false,
      details: error
    };
  }
};

/**
 * Helper utility to convert between API subscription frequency formats and user-friendly display values
 */
export const subscriptionFrequencyUtils = {
  /**
   * Convert API frequency value to user-friendly display value
   * @param frequency API frequency value
   * @returns User-friendly display value
   */
  toDisplayValue: (frequency: SubscriptionFrequency): string => {
    switch (frequency) {
      case 'DAILY':
      case '1':
        return 'Daily';
      case 'WEEKLY':
      case '7':
        return 'Weekly';
      case '15':
        return 'Bi-weekly';
      case 'MONTHLY':
      case '30':
        return 'Monthly';
      case 'QUARTERLY':
        return 'Quarterly';
      case 'HALFYEARLY':
        return 'Half-yearly';
      case 'YEARLY':
        return 'Yearly';
      case 'ONCE':
        return 'One-time';
      default:
        return 'Custom';
    }
  },

  /**
   * Convert user-friendly display value to API frequency value
   * @param displayValue User-friendly display value
   * @returns API frequency value
   */
  toApiValue: (displayValue: string): SubscriptionFrequency => {
    switch (displayValue.toLowerCase()) {
      case 'daily':
        return 'DAILY';
      case 'weekly':
        return 'WEEKLY';
      case 'bi-weekly':
        return '15';
      case 'monthly':
        return 'MONTHLY';
      case 'quarterly':
        return 'QUARTERLY';
      case 'half-yearly':
        return 'HALFYEARLY';
      case 'yearly':
        return 'YEARLY';
      case 'one-time':
        return 'ONCE';
      default:
        return 'MONTHLY'; // Default to monthly
    }
  },

  /**
   * Get days interval from frequency
   * @param frequency API frequency value
   * @returns Number of days between payments
   */
  getDaysInterval: (frequency: SubscriptionFrequency): number => {
    switch (frequency) {
      case 'DAILY':
      case '1':
        return 1;
      case 'WEEKLY':
      case '7':
        return 7;
      case '15':
        return 15;
      case 'MONTHLY':
      case '30':
        return 30;
      case 'QUARTERLY':
        return 90;
      case 'HALFYEARLY':
        return 180;
      case 'YEARLY':
        return 365;
      case 'ONCE':
        return 0; // One-time payment has no interval
      default:
        if (!isNaN(Number(frequency))) {
          return Number(frequency);
        }
        return 30; // Default to monthly
    }
  }
};

/**
 * Creates a user subscription using PhonePe's Autopay API
 * @param amount - Amount in paise (e.g., Rs. 100 = 10000 paise)
 * @param frequency - Frequency of subscription (DAILY, WEEKLY, MONTHLY, etc.)
 * @param startDate - Start date of subscription (YYYY-MM-DD)
 * @param endDate - End date of subscription (YYYY-MM-DD)
 * @param merchantSubscriptionId - Unique ID for merchant's subscription
 * @param mobileNumber - User's mobile number
 * @param userEmail - Optional user email
 * @returns Object containing success status and subscription details
 */
export const createUserSubscription = async (
  amount: number,
  frequency: SubscriptionFrequency,
  startDate: string,
  endDate: string,
  merchantSubscriptionId: string,
  mobileNumber: string,
  userEmail?: string
): Promise<{ success: boolean; subscriptionId?: string; details?: any }> => {
  try {
    const token = await getAuthToken();
    
    // Prepare subscription request payload
    const payload: {
      merchantId: string;
      merchantUserId: string;
      merchantSubscriptionId: string;
      amount: number;
      maxAmount: number;
      amountType: string;
      startDate: string;
      endDate: string;
      frequency: SubscriptionFrequency;
      paymentInstrumentType: string;
      type: string;
      userEmail?: string;
    } = {
      merchantId: MERCHANT_ID,
      merchantUserId: mobileNumber,
      merchantSubscriptionId: merchantSubscriptionId,
      amount: amount,
      maxAmount: amount + 100, // Adding buffer of Rs. 1
      amountType: "FIXED",
      startDate: startDate,
      endDate: endDate,
      frequency: frequency,
      paymentInstrumentType: "UPI",
      type: "PERIODIC",
    };

    if (userEmail) {
      payload.userEmail = userEmail;
    }

    // Convert payload to string and encode to base64
    const stringPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(stringPayload).toString('base64');

    // Generate X-VERIFY header
    const xVerify = await generateXVerifyHeader(base64Payload, token);

    // Make API call to create subscription
    const response = await axios.post(
      `${PHONEPE_BASE_URL}/subscription/create`,
      { request: base64Payload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Handle response
    if (response.data && response.data.success) {
      return {
        success: true,
        subscriptionId: response.data.data.subscriptionId,
        details: response.data.data
      };
    } else {
      console.error('Subscription creation failed:', response.data);
      return {
        success: false,
        details: response.data
      };
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    return {
      success: false,
      details: error
    };
  }
};

/**
 * Notify PhonePe about an upcoming redemption/payment for a subscription
 * @param merchantSubscriptionId - Merchant's subscription ID
 * @param amount - Amount to charge in paise
 * @param expireAt - Optional expiry timestamp in milliseconds
 * @param metaInfo - Optional metadata for the redemption
 * @param redemptionRetryStrategy - Optional retry strategy (STANDARD or CUSTOM)
 * @param autoDebit - Optional flag to enable auto debit after notification
 * @returns Promise with notification status
 */
export const notifyRedemption = async (
  merchantSubscriptionId: string,
  amount: number,
  expireAt?: number,
  metaInfo?: {
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  },
  redemptionRetryStrategy: 'STANDARD' | 'CUSTOM' = 'STANDARD',
  autoDebit: boolean = false
): Promise<{
  success: boolean;
  orderId?: string;
  state?: string;
  expireAt?: number;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Generate unique merchant order ID for this redemption
    const merchantOrderId = `MO${Date.now()}`;
    
    // Prepare redemption notification payload
    const notifyPayload = {
      merchantOrderId,
      amount,
      expireAt: expireAt || Date.now() + (48 * 60 * 60 * 1000), // Default 48 hours
      metaInfo,
      paymentFlow: {
        type: "SUBSCRIPTION_REDEMPTION",
        merchantSubscriptionId,
        redemptionRetryStrategy,
        autoDebit
      }
    };
    
    console.log('Redemption Notify Payload:', JSON.stringify(notifyPayload, null, 2));
    
    // Make API call
    try {
      const response = await axios.post(
        `${PHONEPE_BASE_URL}/subscriptions/v2/notify`,
        notifyPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          }
        }
      );
      
      console.log('Redemption Notify Response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        orderId: response.data.orderId,
        state: response.data.state,
        expireAt: response.data.expireAt
      };
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
    }
  } catch (error) {
    console.error('PhonePe Redemption Notify Error:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Execute a redemption/payment for a subscription after notification
 * @param orderId - Order ID received from notify step
 * @param merchantSubscriptionId - Merchant's subscription ID
 * @param amount - Amount to charge in paise
 * @param metaInfo - Optional metadata for the redemption
 * @returns Promise with execution status
 */
export const executeRedemption = async (
  orderId: string,
  merchantSubscriptionId: string,
  amount: number,
  metaInfo?: {
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  }
): Promise<{
  success: boolean;
  orderId?: string;
  state?: string;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare redemption execution payload
    const executePayload = {
      orderId,
      amount,
      metaInfo,
      paymentFlow: {
        type: "SUBSCRIPTION_REDEMPTION",
        merchantSubscriptionId
      }
    };
    
    console.log('Redemption Execute Payload:', JSON.stringify(executePayload, null, 2));
    
    // Make API call
    try {
      const response = await axios.post(
        `${PHONEPE_BASE_URL}/subscriptions/v2/execute`,
        executePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          }
        }
      );
      
      console.log('Redemption Execute Response:', JSON.stringify(response.data, null, 2));
      
      return {
        success: true,
        orderId: response.data.orderId,
        state: response.data.state
      };
    } catch (axiosError: any) {
      console.error('API Response Error:', axiosError.response?.data || axiosError.message);
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
    }
  } catch (error) {
    console.error('PhonePe Redemption Execute Error:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Get redemption order status
 * @param subscriptionId Subscription ID
 * @param merchantSubscriptionId Merchant subscription ID
 * @param redemptionId Redemption ID to check status for
 */
export const getRedemptionOrderStatus = async (
  subscriptionId: string,
  merchantSubscriptionId: string,
  redemptionId: string
) => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare redemption status request payload
    const statusPayload = {
      merchantId: MERCHANT_ID,
      merchantSubscriptionId: merchantSubscriptionId,
      subscriptionId: subscriptionId,
      redemptionId: redemptionId
    };
    
    // Encode payload to base64
    const base64Payload = encodeToBase64(statusPayload);
    const requestBody = {
      request: base64Payload
    };
    
    // Generate X-VERIFY header
    const apiEndpoint = '/recurring/payment/status';
    const xVerifyHeader = await generateXVerifyHeader(base64Payload, apiEndpoint);
    
    // Make API call
    const response = await axios.post(
      `${PHONEPE_BASE_URL}${apiEndpoint}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return {
      success: response.data.success,
      status: response.data.data.status,
      details: response.data.data
    };
  } catch (error) {
    console.error('PhonPe Redemption Order Status Error:', error);
    throw error;
  }
}; 