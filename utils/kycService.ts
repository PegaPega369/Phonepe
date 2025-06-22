import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import { encode as btoa } from 'base-64';

// KYC API Configuration
const KYC_BASE_URL = 'https://svcdemo.digitap.work'; // UAT Environment
const KYC_CLIENT_ID = '38606847';
const KYC_CLIENT_SECRET = 'pSAS7vt5F8X39ASdjfpK2Am5TApOltJ7';

// Types
export interface KYCRequest {
  client_ref_num: string;
  pan: string;
  name?: string;
  name_match_method?: 'fuzzy' | 'exact' | 'dg_name_match';
}

export interface KYCResponse {
  http_response_code: number;
  result_code: number;
  message: string;
  result?: {
    status: string;
    name: string;
    name_match?: boolean;
    name_match_score?: number;
  };
}

export interface UserKYCStatus {
  isVerified: boolean;
  panNumber?: string;
  verifiedName?: string;
  verificationDate?: string;
  canBuyGold: boolean;
  maxPurchaseLimit: number; // in rupees
}

/**
 * Generate KYC API authorization header
 */
const getKYCAuthHeader = (): string => {
  const credentials = `${KYC_CLIENT_ID}:${KYC_CLIENT_SECRET}`;
  return `Basic ${btoa(credentials)}`;
};

/**
 * Validate PAN using Digitap KYC API
 */
export const validatePAN = async (
  panNumber: string,
  holderName?: string,
  nameMatchMethod: 'fuzzy' | 'exact' | 'dg_name_match' = 'dg_name_match'
): Promise<{
  success: boolean;
  data?: KYCResponse;
  error?: string;
}> => {
  try {
    // Generate unique client reference number
    const clientRefNum = `KYC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const requestBody: KYCRequest = {
      client_ref_num: clientRefNum,
      pan: panNumber.toUpperCase(),
      name_match_method: nameMatchMethod
    };

    // Add name if provided
    if (holderName && holderName.trim()) {
      requestBody.name = holderName.trim();
    }

    const response = await axios.post(
      `${KYC_BASE_URL}/validation/kyc/v1/pan_basic`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getKYCAuthHeader()
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    return {
      success: true,
      data: response.data
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'KYC validation failed'
    };
  }
};

/**
 * Check if user needs KYC based on purchase amount
 */
export const checkKYCRequirement = (purchaseAmount: number): boolean => {
  const KYC_THRESHOLD = 1000; // ₹1000
  return purchaseAmount >= KYC_THRESHOLD;
};

/**
 * Get user's KYC status from Firebase ONLY
 */
export const getUserKYCStatus = async (userId: string): Promise<UserKYCStatus> => {
  try {
    const userDoc = await firestore().collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const kycData = userData?.kycStatus;
      
      if (kycData && kycData.isVerified) {
        console.log('✅ KYC verified user found');
        return {
          isVerified: true,
          panNumber: kycData.panNumber,
          verifiedName: kycData.verifiedName,
          verificationDate: kycData.verificationDate,
          canBuyGold: true,
          maxPurchaseLimit: Infinity
        };
      }
    }

    // Return default status for new/unverified users
    console.log('❌ No KYC verification found');
    return {
      isVerified: false,
      canBuyGold: false,
      maxPurchaseLimit: 999 // ₹999 max without KYC
    };

  } catch (error) {
    console.error('Firebase KYC fetch failed:', error);
    throw error;
  }
};

/**
 * Get user's KYC status from Firebase ONLY (alias for backward compatibility)
 */
export const getUserKYCStatusFromFirebase = getUserKYCStatus;

/**
 * Save user's KYC status to Firebase ONLY
 */
export const saveUserKYCStatus = async (
  userId: string,
  kycStatus: Partial<UserKYCStatus>
): Promise<boolean> => {
  try {
    const currentStatus = await getUserKYCStatus(userId);
    const updatedStatus = {
      ...currentStatus,
      ...kycStatus,
      verificationDate: kycStatus.isVerified ? new Date().toISOString() : currentStatus.verificationDate
    };

    // Save to Firebase ONLY
    await firestore().collection('users').doc(userId).set({
      kycStatus: updatedStatus,
      lastUpdated: firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('✅ KYC saved to Firebase');
    return true;

  } catch (error) {
    console.error('❌ KYC save failed:', error);
    return false;
  }
};

/**
 * Complete KYC verification process
 */
export const completeKYCVerification = async (
  userId: string,
  panNumber: string,
  holderName?: string
): Promise<{
  success: boolean;
  message: string;
  kycStatus?: UserKYCStatus;
}> => {
  try {
    // Step 1: Validate PAN
    const validation = await validatePAN(panNumber, holderName);
    
    if (!validation.success) {
      return {
        success: false,
        message: validation.error || 'PAN validation failed'
      };
    }

    const kycResponse = validation.data!;
    
    // Check if PAN is valid
    if (kycResponse.result_code !== 101 || kycResponse.result?.status !== 'VALID') {
      return {
        success: false,
        message: kycResponse.message || 'Invalid PAN number'
      };
    }

    // Step 2: Save verified KYC status
    const kycStatus: UserKYCStatus = {
      isVerified: true,
      panNumber: panNumber.toUpperCase(),
      verifiedName: kycResponse.result.name,
      verificationDate: new Date().toISOString(),
      canBuyGold: true,
      maxPurchaseLimit: Infinity
    };

    const saved = await saveUserKYCStatus(userId, kycStatus);
    
    if (!saved) {
      return {
        success: false,
        message: 'Failed to save KYC status'
      };
    }

    return {
      success: true,
      message: 'KYC verification completed successfully',
      kycStatus
    };

  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'KYC verification failed'
    };
  }
};

/**
 * Check if user can make a purchase
 */
export const canUserPurchase = async (
  userId: string,
  purchaseAmount: number
): Promise<{
  canPurchase: boolean;
  requiresKYC: boolean;
  message: string;
  kycStatus: UserKYCStatus;
}> => {
  try {
    const kycStatus = await getUserKYCStatus(userId);
    const requiresKYC = checkKYCRequirement(purchaseAmount);

    // If KYC is not required for this amount
    if (!requiresKYC) {
      console.log(`💰 Purchase ₹${purchaseAmount} - No KYC needed`);
      return {
        canPurchase: true,
        requiresKYC: false,
        message: 'Purchase allowed without KYC',
        kycStatus
      };
    }

    // If KYC is required but user is not verified
    if (requiresKYC && !kycStatus.isVerified) {
      console.log(`💰 Purchase ₹${purchaseAmount} - KYC required`);
      return {
        canPurchase: false,
        requiresKYC: true,
        message: 'KYC verification required for this purchase amount',
        kycStatus
      };
    }

    // If user is KYC verified
    if (kycStatus.isVerified) {
      console.log(`💰 Purchase ₹${purchaseAmount} - KYC verified, allowed`);
      return {
        canPurchase: true,
        requiresKYC: false,
        message: 'Purchase allowed - KYC verified',
        kycStatus
      };
    }

    // Check purchase limit
    if (purchaseAmount > kycStatus.maxPurchaseLimit) {
      return {
        canPurchase: false,
        requiresKYC: true,
        message: `Purchase amount exceeds limit of ₹${kycStatus.maxPurchaseLimit}`,
        kycStatus
      };
    }

    return {
      canPurchase: true,
      requiresKYC: false,
      message: 'Purchase allowed',
      kycStatus
    };

  } catch (error: any) {
    console.error('Purchase check failed:', error);
    
    // Return safe defaults on error
    return {
      canPurchase: false,
      requiresKYC: true,
      message: 'Error checking KYC status',
      kycStatus: {
        isVerified: false,
        canBuyGold: false,
        maxPurchaseLimit: 999
      }
    };
  }
};

/**
 * Clear user's KYC status from Firebase (for testing/reset purposes)
 */
export const clearUserKYCStatus = async (userId: string): Promise<boolean> => {
  try {
    await firestore().collection('users').doc(userId).update({
      kycStatus: firestore.FieldValue.delete(),
      lastUpdated: firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Force clear all KYC data for a user (Firebase only)
 * Use this when migrating from local storage to Firebase-only
 */
export const forceResetUserKYC = async (userId: string): Promise<boolean> => {
  try {
    // Clear Firebase data
    const cleared = await clearUserKYCStatus(userId);
    return cleared;
  } catch (error) {
    return false;
  }
}; 