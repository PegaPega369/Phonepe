/**
 * KYC Validation Utilities
 */

import { getUserKYCStatus, UserKYCStatus } from './kycService';

/**
 * Validate PAN format
 */
export const validatePANFormat = (pan: string): { isValid: boolean; error?: string } => {
  if (!pan || typeof pan !== 'string') {
    return { isValid: false, error: 'PAN number is required' };
  }

  const panRegex = /^[A-Z]{3}[ABCFGHLJPTE]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/;
  const trimmedPan = pan.trim().toUpperCase();

  if (trimmedPan.length !== 10) {
    return { isValid: false, error: 'PAN must be exactly 10 characters' };
  }

  if (!panRegex.test(trimmedPan)) {
    return { isValid: false, error: 'Invalid PAN format. Format should be: ABCDE1234F' };
  }

  return { isValid: true };
};

/**
 * Validate name format
 */
export const validateNameFormat = (name: string): { isValid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 1) {
    return { isValid: false, error: 'Name cannot be empty' };
  }

  if (trimmedName.length > 85) {
    return { isValid: false, error: 'Name cannot exceed 85 characters' };
  }

  // Only English characters and specific special characters allowed
  const nameRegex = /^[a-zA-Z\s~^/\\\.&]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, error: 'Name can only contain English letters and these special characters: ~, ^, /, \\, ., &' };
  }

  return { isValid: true };
};

/**
 * Format PAN number (uppercase and remove spaces)
 */
export const formatPAN = (pan: string): string => {
  return pan.trim().toUpperCase().replace(/\s/g, '');
};

/**
 * Format name (trim and proper case)
 */
export const formatName = (name: string): string => {
  return name.trim().replace(/\s+/g, ' ');
};

/**
 * Check if KYC is required for purchase amount
 */
export const isKYCRequired = (amount: number): boolean => {
  return amount >= 1000; // ₹1000 threshold
};

/**
 * Get user-friendly KYC status message
 */
export const getKYCStatusMessage = (
  isVerified: boolean,
  purchaseAmount: number
): string => {
  if (isVerified) {
    return 'KYC Verified ✅ - You can purchase any amount';
  }

  if (isKYCRequired(purchaseAmount)) {
    return 'KYC Required ⚠️ - Complete KYC to purchase above ₹1000';
  }

  return 'KYC Not Required - Purchase amount is below ₹1000';
};

/**
 * Get purchase limit message
 */
export const getPurchaseLimitMessage = (
  isVerified: boolean,
  currentAmount: number
): string => {
  if (isVerified) {
    return 'No purchase limit';
  }

  const remaining = 999 - currentAmount;
  if (remaining > 0) {
    return `₹${remaining} remaining without KYC`;
  }

  return 'KYC required for further purchases';
};

/**
 * Validate KYC form data
 */
export interface KYCFormData {
  panNumber: string;
  holderName: string;
}

export const validateKYCForm = (data: KYCFormData): { 
  isValid: boolean; 
  errors: { [key: string]: string } 
} => {
  const errors: { [key: string]: string } = {};

  // Validate PAN
  const panValidation = validatePANFormat(data.panNumber);
  if (!panValidation.isValid) {
    errors.panNumber = panValidation.error!;
  }

  // Validate Name
  const nameValidation = validateNameFormat(data.holderName);
  if (!nameValidation.isValid) {
    errors.holderName = nameValidation.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Cache for KYC status to avoid excessive Firebase calls
const kycCache = new Map<string, { status: UserKYCStatus; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get KYC status with caching to reduce Firebase calls
 */
export const getCachedKYCStatus = async (userId: string): Promise<UserKYCStatus> => {
  const now = Date.now();
  const cached = kycCache.get(userId);
  
  // Return cached status if it's still valid
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.status;
  }
  
  // Fetch fresh status from Firebase
  try {
    const status = await getUserKYCStatus(userId);
    
    // Cache the result
    kycCache.set(userId, {
      status,
      timestamp: now
    });
    
    return status;
  } catch (error) {
    // If we have cached data, return it even if expired
    if (cached) {
      return cached.status;
    }
    throw error;
  }
};

/**
 * Clear KYC cache for a specific user (call after KYC update)
 */
export const clearKYCCache = (userId: string): void => {
  kycCache.delete(userId);
};

/**
 * Clear all KYC cache
 */
export const clearAllKYCCache = (): void => {
  kycCache.clear();
}; 