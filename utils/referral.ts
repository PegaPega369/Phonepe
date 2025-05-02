import firestore from '@react-native-firebase/firestore';

/**
 * Generate a random referral code of specified length
 */
export function generateReferralCode(length: number = 6): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like O, 0, 1, I
  let result = '';
  
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Save a user's referral code to Firestore
 */
export async function saveReferralCode(userId: string, referralCode: string): Promise<void> {
  try {
    await firestore()
      .collection('users')
      .doc(userId)
      .update({
        referralCode,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
    // Create a reference entry for quick lookups
    await firestore()
      .collection('referralCodes')
      .doc(referralCode)
      .set({
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      
    console.log(`Referral code ${referralCode} saved for user ${userId}`);
  } catch (error) {
    console.error('Error saving referral code:', error);
    throw error;
  }
}

/**
 * Apply a referral code when a new user signs up
 * Returns { success: boolean, message: string, reward: number }
 */
export async function applyReferralCode(
  newUserId: string,
  referrerCode: string
): Promise<{ success: boolean; message: string; reward?: number }> {
  try {
    // Check if code exists
    const codeRef = await firestore()
      .collection('referralCodes')
      .doc(referrerCode)
      .get();
      
    if (!codeRef.exists) {
      return { success: false, message: 'Invalid referral code' };
    }
    
    const referrerId = codeRef.data()?.userId;
    
    // Prevent self-referral
    if (referrerId === newUserId) {
      return { success: false, message: 'You cannot use your own referral code' };
    }
    
    // Check if this user has already used a referral code
    const userRef = await firestore()
      .collection('users')
      .doc(newUserId)
      .get();
      
    if (userRef.exists && userRef.data()?.referredBy) {
      return { success: false, message: 'You have already used a referral code' };
    }
    
    // Update the new user with referral info
    await firestore()
      .collection('users')
      .doc(newUserId)
      .update({
        referredBy: referrerId,
        referredByCode: referrerCode,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    
    // Add this user to the referrer's list of referrals
    const referralReward = 100; // Points or credits awarded
    
    await firestore()
      .collection('users')
      .doc(referrerId)
      .collection('referrals')
      .doc(newUserId)
      .set({
        userId: newUserId,
        referralBonus: referralReward,
        status: 'completed',
        completedAt: firestore.FieldValue.serverTimestamp(),
      });
    
    // Update the referrer's total bonus
    await firestore()
      .collection('users')
      .doc(referrerId)
      .update({
        referralBonus: firestore.FieldValue.increment(referralReward),
      });
    
    return {
      success: true,
      message: 'Referral code applied successfully!',
      reward: referralReward,
    };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { success: false, message: 'An error occurred while applying the referral code' };
  }
}

/**
 * Get a user's referral stats
 */
export async function getReferralStats(userId: string): Promise<{
  referralCode: string;
  referralCount: number;
  referralBonus: number;
  referrals: any[];
}> {
  try {
    // Get user data
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data() || {};
    
    // If the user doesn't have a referral code yet, generate one
    let referralCode = userData.referralCode;
    if (!referralCode) {
      referralCode = generateReferralCode();
      await saveReferralCode(userId, referralCode);
    }
    
    // Get all successful referrals
    const referralsSnapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('referrals')
      .where('status', '==', 'completed')
      .get();
    
    const referrals = referralsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return {
      referralCode: referralCode,
      referralCount: referrals.length,
      referralBonus: userData.referralBonus || 0,
      referrals,
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    // Return default values
    return {
      referralCode: '',
      referralCount: 0,
      referralBonus: 0,
      referrals: [],
    };
  }
}