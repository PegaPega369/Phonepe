/**
 * Reset KYC Data Script
 * Use this to completely reset KYC data for a user
 */

const { forceResetUserKYC, getUserKYCStatus } = require('./utils/kycService');

async function resetUserKYC() {
  const userId = 'default_user'; // Change this to the actual user ID if different
  
  console.log('🔄 Resetting KYC data for user:', userId);
  console.log('⚠️  This will completely remove all KYC verification data!\n');
  
  try {
    // Check current status
    console.log('📋 Current KYC status:');
    try {
      const currentStatus = await getUserKYCStatus(userId);
      console.log(JSON.stringify(currentStatus, null, 2));
    } catch (error) {
      console.log('❌ Could not fetch current status:', error.message);
    }
    
    console.log('\n🗑️ Clearing all KYC data...');
    
    // Force reset all data
    const success = await forceResetUserKYC(userId);
    
    if (success) {
      console.log('✅ KYC data reset successfully!');
      
      // Verify reset
      console.log('\n📋 Status after reset:');
      const newStatus = await getUserKYCStatus(userId);
      console.log(JSON.stringify(newStatus, null, 2));
      
      console.log('\n🎯 Next steps:');
      console.log('1. Open the app');
      console.log('2. Go to Profile → Settings → Identity Verification');
      console.log('3. Complete KYC verification again');
      console.log('4. This time it will be saved to Firebase only');
      
    } else {
      console.log('❌ Failed to reset KYC data');
    }
    
  } catch (error) {
    console.error('❌ Error during reset:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the reset
resetUserKYC(); 