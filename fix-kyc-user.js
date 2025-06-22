/**
 * Fix KYC User ID Mismatch
 * This script clears old KYC data and ensures consistent user IDs
 */

const { forceResetUserKYC, getUserKYCStatus } = require('./utils/kycService');

async function fixKYCUserMismatch() {
  console.log('🔧 Fixing KYC User ID Mismatch...\n');
  
  const defaultUser = 'default_user';
  const actualUser = 'GV0fh2exQsU5s8c5SNU2rCsE3NX2'; // From logs
  
  try {
    // Step 1: Check current status for both users
    console.log('📋 Checking current KYC status for both users...');
    
    try {
      const defaultStatus = await getUserKYCStatus(defaultUser);
      console.log(`📄 default_user status:`, defaultStatus);
    } catch (error) {
      console.log(`❌ default_user: No data or error -`, error.message);
    }
    
    try {
      const actualStatus = await getUserKYCStatus(actualUser);
      console.log(`📄 ${actualUser} status:`, actualStatus);
    } catch (error) {
      console.log(`❌ ${actualUser}: No data or error -`, error.message);
    }
    
    console.log('\n🗑️ Clearing all old KYC data...');
    
    // Step 2: Clear KYC data for both users
    await forceResetUserKYC(defaultUser);
    console.log('✅ Cleared KYC data for default_user');
    
    await forceResetUserKYC(actualUser);
    console.log('✅ Cleared KYC data for actual user');
    
    // Step 3: Verify cleanup
    console.log('\n📋 Verifying cleanup...');
    
    const cleanedDefaultStatus = await getUserKYCStatus(defaultUser);
    console.log(`📄 default_user after cleanup:`, cleanedDefaultStatus);
    
    const cleanedActualStatus = await getUserKYCStatus(actualUser);
    console.log(`📄 ${actualUser} after cleanup:`, cleanedActualStatus);
    
    console.log('\n✅ KYC User ID mismatch fixed!');
    console.log('\n🎯 Next steps:');
    console.log('1. Restart your React Native app');
    console.log('2. Go to Profile → Settings → Identity Verification');
    console.log('3. Complete KYC verification again');
    console.log('4. The KYC data will now be saved under the correct user ID');
    console.log('5. Gold Savings page will now correctly detect KYC status');
    
  } catch (error) {
    console.error('❌ Error during KYC fix:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the fix
fixKYCUserMismatch(); 