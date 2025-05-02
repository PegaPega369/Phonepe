import { getAuthToken } from './phonepeAutopay';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';

const PHONEPE_BASE_URL = process.env.PHONEPE_API_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';

/**
 * Validate a UPI VPA (Virtual Payment Address)
 * @param vpa UPI ID to validate (e.g., "user@upi")
 * @returns Validation result with user name if valid
 */
export const validateUpiVpa = async (
  vpa: string
): Promise<{
  success: boolean;
  valid: boolean;
  name?: string;
  error?: any;
}> => {
  try {
    // Get auth token
    const token = await getAuthToken();

    // Prepare validation request payload
    const payload = {
      type: "VPA",
      vpa: vpa
    };

    console.log('Validating UPI VPA:', vpa);

    // Make API call
    const response = await axios.post(
      `${PHONEPE_BASE_URL}/v2/validate/upi`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${token}`
        }
      }
    );

    console.log('UPI Validation Response:', response.data);

    return {
      success: true,
      valid: response.data.valid,
      name: response.data.name
    };
  } catch (error) {
    console.error('Error validating UPI VPA:', error);
    return {
      success: false,
      valid: false,
      error
    };
  }
};

/**
 * Save validated UPI ID to AsyncStorage
 * @param userId User's unique identifier
 * @param upiData UPI data to save
 */
export const saveUpiToStorage = async (
  userId: string,
  upiData: {
    vpa: string;
    name: string;
    validatedAt: number;
  }
): Promise<{
  success: boolean;
  error?: any;
}> => {
  try {
    const storageKey = `user_${userId}_upi`;
    await AsyncStorage.setItem(storageKey, JSON.stringify({
      ...upiData,
      updatedAt: Date.now()
    }));

    return { success: true };
  } catch (error) {
    console.error('Error saving UPI to storage:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Get user's saved UPI ID from AsyncStorage
 * @param userId User's unique identifier
 */
export const getSavedUpiVpa = async (
  userId: string
): Promise<{
  success: boolean;
  data?: {
    vpa: string;
    name: string;
    validatedAt: number;
  };
  error?: any;
}> => {
  try {
    const storageKey = `user_${userId}_upi`;
    const upiData = await AsyncStorage.getItem(storageKey);

    if (upiData) {
      return {
        success: true,
        data: JSON.parse(upiData)
      };
    }

    return {
      success: false,
      error: 'No UPI data found'
    };
  } catch (error) {
    console.error('Error getting UPI from storage:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * UPI App information
 */
export interface UpiApp {
  packageName: string;
  appName: string;
  icon?: string;
  priority: number;
}

/**
 * List of common UPI apps with their package names
 */
export const COMMON_UPI_APPS: UpiApp[] = [
  { packageName: 'com.phonepe.app.preprod', appName: 'PhonePe Simulator', priority: 1 },
  { packageName: 'com.phonepe.app', appName: 'PhonePe', priority: 2 },
  { packageName: 'net.one97.paytm', appName: 'Paytm', priority: 3 },
  { packageName: 'com.google.android.apps.nbu.paisa.user', appName: 'Google Pay', priority: 4 },
  { packageName: 'in.org.npci.upiapp', appName: 'BHIM', priority: 5 },
  { packageName: 'com.amazon.mShop.android.shopping', appName: 'Amazon Pay', priority: 6 },
  { packageName: 'com.whatsapp', appName: 'WhatsApp Pay', priority: 7 },
  { packageName: 'com.bankofbaroda.upi', appName: 'BoB UPI', priority: 8 },
  { packageName: 'com.axis.mobile', appName: 'Axis Mobile', priority: 9 },
  { packageName: 'com.sbi.upi', appName: 'SBI Pay', priority: 10 },
  { packageName: 'com.icicibank.pockets', appName: 'ICICI Pockets', priority: 11 },
  { packageName: 'com.csam.icici.bank.imobile', appName: 'iMobile Pay', priority: 12 },
  { packageName: 'com.freecharge.android', appName: 'Freecharge', priority: 13 },
  { packageName: 'com.mobikwik_new', appName: 'MobiKwik', priority: 14 },
  { packageName: 'com.dreamplug.androidapp', appName: 'CRED', priority: 15 },
];

/**
 * Detect installed UPI apps on the device
 * @returns Promise with list of installed UPI apps
 */
export const detectInstalledUpiApps = async (): Promise<UpiApp[]> => {
  try {
    console.log('Detecting installed UPI apps...');
    const installedApps: UpiApp[] = [];
    
    // Generate a test UPI URL
    const testUpiUrl = `upi://pay?pa=PHONEPEPGUAT@ybl&pn=TestPayment&am=1.00&cu=INR&tr=TEST${Date.now()}`;
    
    // For each UPI app, check if it can handle the UPI intent
    for (const app of COMMON_UPI_APPS) {
      try {
        // On Android, we can check if an app can handle a specific URL
        if (Platform.OS === 'android') {
          const canOpen = await Linking.canOpenURL(`${app.packageName}://`);
          if (canOpen) {
            console.log(`Found installed UPI app: ${app.appName}`);
            installedApps.push(app);
          }
        } else {
          // On iOS, we can't check specific apps, so we'll just include all
          // This is a limitation of iOS, but we'll handle it gracefully
          installedApps.push(app);
        }
      } catch (error) {
        // If there's an error checking this app, just continue to the next one
        console.log(`Error checking ${app.appName}:`, error);
      }
    }
    
    // Always include PhonePe Simulator for testing
    if (!installedApps.some(app => app.packageName === 'com.phonepe.app.preprod')) {
      installedApps.push(COMMON_UPI_APPS[0]);
    }
    
    // Sort by priority
    installedApps.sort((a, b) => a.priority - b.priority);
    
    console.log(`Detected ${installedApps.length} UPI apps`);
    return installedApps;
  } catch (error) {
    console.error('Error detecting UPI apps:', error);
    // Return at least PhonePe Simulator as fallback
    return [COMMON_UPI_APPS[0]];
  }
};

/**
 * Save selected UPI app to AsyncStorage
 * @param userId User's unique identifier
 * @param app UPI app to save
 */
export const saveSelectedUpiApp = async (
  userId: string,
  app: UpiApp
): Promise<{
  success: boolean;
  error?: any;
}> => {
  try {
    const storageKey = `user_${userId}_selected_upi_app`;
    await AsyncStorage.setItem(storageKey, JSON.stringify({
      ...app,
      selectedAt: Date.now()
    }));

    return { success: true };
  } catch (error) {
    console.error('Error saving selected UPI app to storage:', error);
    return {
      success: false,
      error
    };
  }
};

/**
 * Get user's saved UPI app from AsyncStorage
 * @param userId User's unique identifier
 */
export const getSavedUpiApp = async (
  userId: string
): Promise<{
  success: boolean;
  data?: UpiApp & { selectedAt: number };
  error?: any;
}> => {
  try {
    const storageKey = `user_${userId}_selected_upi_app`;
    const appData = await AsyncStorage.getItem(storageKey);

    if (appData) {
      return {
        success: true,
        data: JSON.parse(appData)
      };
    }

    return {
      success: false,
      error: 'No UPI app data found'
    };
  } catch (error) {
    console.error('Error getting UPI app from storage:', error);
    return {
      success: false,
      error
    };
  }
};