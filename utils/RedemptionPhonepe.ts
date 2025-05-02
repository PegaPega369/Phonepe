import axios from 'axios';
import { getAuthToken, checkSubscriptionStatus } from './phonepeAutopay';

// PhonePe API configuration
const PHONEPE_BASE_URL = process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';

/**
 * Interface for redemption notification response
 */
export interface RedemptionNotifyResponse {
  orderId: string;
  state: string;
  expireAt: number;
}

/**
 * Interface for redemption execution response
 */
export interface RedemptionExecuteResponse {
  state: string;
  transactionId: string;
}

/**
 * Interface for redemption order status response
 */
export interface RedemptionOrderStatusResponse {
  merchantId: string;
  merchantOrderId: string;
  orderId: string;
  state: string;
  amount: number;
  expireAt: number;
  metaInfo?: {
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
  };
  paymentFlow: {
    type: string;
    merchantSubscriptionId: string;
    redemptionRetryStrategy: string;
    autoDebit: boolean;
    validAfter?: number;
    validUpto?: number;
    notifiedAt?: number;
  };
  errorCode?: string;
  detailedErrorCode?: string;
  paymentDetails: Array<{
    amount: number;
    paymentMode: string;
    timestamp: number;
    transactionId: string;
    state: string;
    rail?: {
      type: string;
      utr?: string;
      vpa?: string;
      umn?: string;
    };
    instrument?: {
      type: string;
      maskedAccountNumber?: string;
      ifsc?: string;
      accountHolderName?: string;
      accountType?: string;
    };
    errorCode?: string;
    detailedErrorCode?: string;
  }>;
}

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
  merchantOrderId?: string;  // Adding this to return value
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
      merchantOrderId,  // This is what we'll need to use in execute
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
      
      // Return both PhonePe orderId and our merchantOrderId
      return {
        success: true,
        orderId: response.data.orderId,
        merchantOrderId: merchantOrderId,  // Important: We need this for execute
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
 * @param merchantOrderId - The merchantOrderId we generated and passed in notify request
 * @param merchantSubscriptionId - Merchant Subscription ID for status check
 * @returns Promise with execution status
 */
export const executeRedemption = async (
  merchantOrderId: string,
  merchantSubscriptionId: string
): Promise<{
  success: boolean;
  state?: string;
  transactionId?: string;
  error?: any;
}> => {
  try {
    // First check subscription status
    console.log('Checking subscription status before execution...');
    const statusResponse = await checkSubscriptionStatus(merchantSubscriptionId);
    
    if (!statusResponse.success || statusResponse.status !== 'ACTIVE') {
      console.error('Subscription is not active:', statusResponse);
      return {
        success: false,
        error: 'Subscription must be active to execute redemption'
      };
    }
    
    console.log('Subscription is active, proceeding with execution...');
    
    // In sandbox/simulator, check if order is already processing/completed
    if (PHONEPE_BASE_URL.includes('sandbox')) {
      console.log('Sandbox environment detected, checking order status first...');
      const statusCheck = await checkRedemptionOrderStatus(merchantOrderId);
      if (statusCheck.success && statusCheck.data) {
        // If order is already in a terminal state, return that status
        if (['COMPLETED', 'FAILED'].includes(statusCheck.data.state)) {
          console.log(`Order already in ${statusCheck.data.state} state`);
          const transactionId = statusCheck.data.paymentDetails?.[0]?.transactionId;
          return {
            success: true,
            state: statusCheck.data.state,
            transactionId
          };
        }
      }
      
      // Add delay only if order isn't already completed
      console.log('Waiting 2 seconds before execute...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Get auth token
    const token = await getAuthToken();
    
    // Prepare redemption execution payload
    const executePayload = {
      merchantOrderId
    };
    
    console.log('Redemption Execute Payload:', JSON.stringify(executePayload, null, 2));
    
    // Make API call
    const response = await axios.post(
      `${PHONEPE_BASE_URL}/subscriptions/v2/redeem`,
      executePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`
        }
      }
    );
    
    // Log the complete response for debugging
    console.log('Redemption Execute Response:', JSON.stringify(response.data, null, 2));
    
    // Handle successful response
    if (response.data) {
      return {
        success: true,
        state: response.data.state,
        transactionId: response.data.transactionId
      };
    }
    
    // If we get here with no data but no error, check status
    console.log('No response data, checking order status...');
    const finalStatus = await checkRedemptionOrderStatus(merchantOrderId);
    if (finalStatus.success && finalStatus.data) {
      const transactionId = finalStatus.data.paymentDetails?.[0]?.transactionId;
      return {
        success: true,
        state: finalStatus.data.state,
        transactionId
      };
    }
    
    return {
      success: true,
      state: 'PENDING'
    };
      
  } catch (error: any) {
    // If we get ORDER_NOT_FOUND in sandbox, check status before failing
    if (PHONEPE_BASE_URL.includes('sandbox') && 
        error.response?.data?.code === 'ORDER_NOT_FOUND') {
      console.log('Got ORDER_NOT_FOUND in sandbox - checking current status...');
      const statusCheck = await checkRedemptionOrderStatus(merchantOrderId);
      if (statusCheck.success && statusCheck.data) {
        const transactionId = statusCheck.data.paymentDetails?.[0]?.transactionId;
        return {
          success: true,
          state: statusCheck.data.state,
          transactionId,
          message: 'Order found in completed state'
        };
      }
    }

    console.error('PhonePe Redemption Execute Error:', error.response?.data || error);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

/**
 * Check the status of a redemption order
 * @param merchantOrderId - The original merchantOrderId we generated and used in notify request
 * @returns Promise with order status
 */
export const checkRedemptionOrderStatus = async (
  merchantOrderId: string
): Promise<{
  success: boolean;
  data?: RedemptionOrderStatusResponse;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();
    
    console.log('Checking redemption order status...');
    console.log('Merchant Order ID:', merchantOrderId);
    
    // Make API call using GET method and correct URL structure
    try {
      const response = await axios.get(
        `${PHONEPE_BASE_URL}/subscriptions/v2/order/${merchantOrderId}/status?details=true`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `O-Bearer ${token}`
          }
        }
      );
      
      if (response.data) {
        console.log('Redemption Order Status Response:', JSON.stringify(response.data, null, 2));
        return {
          success: true,
          data: response.data
        };
      } else {
        console.error('Empty response from status API');
        return {
          success: false,
          error: 'Empty response from status API'
        };
      }
    } catch (axiosError: any) {
      console.error('API Error Response:', axiosError.response?.data);
      console.error('API Error Status:', axiosError.response?.status);
      return {
        success: false,
        error: axiosError.response?.data || axiosError.message
      };
    }
  } catch (error) {
    console.error('PhonePe Redemption Order Status Error:', error);
    return {
      success: false,
      error
    };
  }
};