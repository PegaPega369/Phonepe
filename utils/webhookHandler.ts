import { handleSubscriptionWebhook, updateSubscriptionFromWebhook } from './phonepeAutopay';

/**
 * Process PhonePe webhook
 * 
 * This function would be used in your Express/Next.js/etc. route handler
 * Example usage:
 * 
 * // In your Express route handler
 * app.post('/api/webhooks/phonepe', async (req, res) => {
 *   const result = await processPhonePeWebhook(req.body, req.headers.authorization);
 *   return res.status(result.statusCode).json(result.body);
 * });
 * 
 * Note: Until the integration team provides webhook credentials, authentication
 * will be temporarily bypassed with a warning. Once credentials are available,
 * set them using environment variables:
 * - PHONEPE_WEBHOOK_USERNAME
 * - PHONEPE_WEBHOOK_PASSWORD
 * 
 * @param requestBody The webhook request body
 * @param authHeader The Authorization header from the request
 * @returns Response object with status code and body
 */
export const processPhonePeWebhook = async (
  requestBody: any,
  authHeader: string
): Promise<{
  statusCode: number;
  body: {
    success: boolean;
    message: string;
    [key: string]: any;
  }
}> => {
  try {
    console.log('Received PhonePe webhook:', JSON.stringify(requestBody, null, 2).substring(0, 500) + '...');
    
    // Validate and process the webhook data
    const webhookData = await handleSubscriptionWebhook(requestBody, authHeader);
    
    if (!webhookData.isValid) {
      console.error('Invalid webhook data or authentication');
      return {
        statusCode: 401,
        body: {
          success: false,
          message: 'Invalid webhook data or authentication'
        }
      };
    }

    // Update local subscription data based on webhook
    const updateResult = await updateSubscriptionFromWebhook(webhookData);
    
    // Determine response based on webhook event type
    let responseMessage = 'Webhook processed successfully';
    let additionalData = {};
    
    if (webhookData.eventType) {
      switch (webhookData.eventType) {
        case 'SUBSCRIPTION_NOTIFICATION_COMPLETED':
          responseMessage = 'Notification completed successfully';
          break;
        case 'SUBSCRIPTION_NOTIFICATION_FAILED':
          responseMessage = 'Notification failed';
          break;
        case 'SUBSCRIPTION_REDEMPTION_ORDER_COMPLETED':
          responseMessage = 'Redemption order completed successfully';
          additionalData = {
            merchantSubscriptionId: webhookData.merchantSubscriptionId,
            state: webhookData.state,
            transactionDetails: webhookData.data?.paymentDetails?.[0] || {}
          };
          break;
        case 'SUBSCRIPTION_REDEMPTION_ORDER_FAILED':
          responseMessage = 'Redemption order failed';
          additionalData = {
            merchantSubscriptionId: webhookData.merchantSubscriptionId,
            state: webhookData.state,
            errorCode: webhookData.data?.errorCode,
            detailedErrorCode: webhookData.data?.detailedErrorCode
          };
          break;
        case 'SUBSCRIPTION_PAUSED':
          responseMessage = 'Subscription paused successfully';
          additionalData = {
            pauseStartDate: new Date(webhookData.data?.pauseStartDate).toISOString(),
            pauseEndDate: new Date(webhookData.data?.pauseEndDate).toISOString()
          };
          break;
        case 'SUBSCRIPTION_UNPAUSED':
          responseMessage = 'Subscription unpaused successfully';
          break;
        case 'SUBSCRIPTION_REVOKED':
          responseMessage = 'Subscription revoked by user';
          break;
        default:
          responseMessage = `Processed webhook event: ${webhookData.eventType}`;
      }
    }

    // Return successful response
    return {
      statusCode: 200,
      body: {
        success: true,
        message: responseMessage,
        merchantSubscriptionId: webhookData.merchantSubscriptionId,
        eventType: webhookData.eventType,
        state: webhookData.state,
        ...additionalData
      }
    };
  } catch (error) {
    console.error('Error processing PhonePe webhook:', error);
    return {
      statusCode: 500,
      body: {
        success: false,
        message: 'Failed to process webhook'
      }
    };
  }
};

/**
 * Example webhook request bodies for testing
 */
export const sampleWebhookPayloads = {
  notificationCompleted: {
    "type": "SUBSCRIPTION_NOTIFICATION_COMPLETED",
    "payload": {
      "merchantId": "MERCHANTID",
      "merchantOrderId": "MO1708797962855",
      "orderId": "OMO12344",
      "amount": 10000,
      "state": "NOTIFIED",
      "expireAt": 1620891733101,
      "paymentFlow": {
        "type": "SUBSCRIPTION_REDEMPTION",
        "merchantSubscriptionId": "MS121312",
        "redemptionRetryStrategy": "CUSTOM",
        "autoDebit": true,
        "validAfter": 1628229131000,
        "validUpto": 1628574731000,
        "notifiedAt": 1622539751586
      }
    }
  },
  
  redemptionCompleted: {
    "type": "SUBSCRIPTION_REDEMPTION_ORDER_COMPLETED",
    "payload": {
      "merchantId": "MERCHANTID",
      "merchantOrderId": "MO1708797962855",
      "orderId": "OMO12344",
      "state": "COMPLETED",
      "amount": 10000,
      "expireAt": 1620891733101,
      "paymentFlow": {
        "type": "SUBSCRIPTION_REDEMPTION",
        "merchantSubscriptionId": "MS121312",
        "redemptionRetryStrategy": "CUSTOM",
        "autoDebit": true,
        "validAfter": 1628229131000,
        "validUpto": 1628574731000,
        "notifiedAt": 1622539751586
      },
      "paymentDetails": [
        {
          "amount": 10000,
          "paymentMode": "UPI_AUTO_PAY",
          "timestamp": 1620891733101,
          "transactionId": "OM124",
          "state": "COMPLETED",
          "rail": {
            "type": "UPI",
            "utr": "2",
            "vpa": "abcd@ybl",
            "umn": "544fcc8819d04cb08e26faa1fb07eee7@ybl"
          },
          "instrument": {
            "type": "ACCOUNT",
            "maskedAccountNumber": "XXX2312",
            "ifsc": "VISA",
            "accountHolderName": "Test User",
            "accountType": "SAVINGS"
          }
        }
      ]
    }
  },
  
  redemptionFailed: {
    "type": "SUBSCRIPTION_REDEMPTION_ORDER_FAILED",
    "payload": {
      "merchantId": "MERCHANTID",
      "merchantOrderId": "MO1708797962855",
      "orderId": "OMO12344",
      "state": "FAILED",
      "amount": 10000,
      "expireAt": 1620891733101,
      "paymentFlow": {
        "type": "SUBSCRIPTION_REDEMPTION",
        "merchantSubscriptionId": "MS121312",
        "redemptionRetryStrategy": "CUSTOM",
        "autoDebit": true,
        "validAfter": 1628229131000,
        "validUpto": 1628574731000,
        "notifiedAt": 1622539751586
      },
      "errorCode": "PAYMENT_FAILED",
      "detailedErrorCode": "INSUFFICIENT_FUNDS",
      "paymentDetails": [
        {
          "amount": 10000,
          "paymentMode": "UPI_AUTO_PAY",
          "timestamp": 1620891733101,
          "transactionId": "OM124",
          "state": "FAILED",
          "rail": {
            "type": "UPI",
            "vpa": "abcd@ybl"
          },
          "errorCode": "PAYMENT_FAILED",
          "detailedErrorCode": "INSUFFICIENT_FUNDS"
        }
      ]
    }
  },
  
  subscriptionPaused: {
    "type": "SUBSCRIPTION_PAUSED",
    "payload": {
      "merchantSubscriptionId": "MS1708797962855",
      "subscriptionId": "OMS2402242336054995042603",
      "state": "PAUSED",
      "authWorkflowType": "TRANSACTION",
      "amountType": "FIXED",
      "maxAmount": 20000,
      "frequency": "ON_DEMAND",
      "expireAt": 1737278524000,
      "pauseStartDate": 1708798426196,
      "pauseEndDate": 1708885799000
    }
  },
  
  subscriptionUnpaused: {
    "type": "SUBSCRIPTION_UNPAUSED",
    "payload": {
      "merchantSubscriptionId": "MS1708797962855",
      "subscriptionId": "OMS2402242336054995042603",
      "state": "ACTIVE",
      "authWorkflowType": "TRANSACTION",
      "amountType": "FIXED",
      "maxAmount": 20000,
      "frequency": "ON_DEMAND",
      "expireAt": 1737278524000,
      "pauseStartDate": null,
      "pauseEndDate": null
    }
  },
  
  subscriptionRevoked: {
    "type": "SUBSCRIPTION_REVOKED",
    "payload": {
      "merchantSubscriptionId": "MS1708797962855",
      "subscriptionId": "OMS2402242336054995042603",
      "state": "REVOKED",
      "authWorkflowType": "TRANSACTION",
      "amountType": "FIXED",
      "maxAmount": 20000,
      "frequency": "ON_DEMAND",
      "expireAt": 1737278524000,
      "pauseStartDate": null,
      "pauseEndDate": null
    }
  }
}; 