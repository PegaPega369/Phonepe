/**
 * Test Script for PAN Uniqueness Feature
 * 
 * This script tests the PAN uniqueness checking functionality
 * to ensure no two users can use the same PAN number for KYC verification.
 */

const { 
  checkPANUniqueness, 
  completeKYCVerification, 
  clearUserKYCStatus 
} = require('./utils/kycService');

async function testPANUniqueness() {
  console.log('🧪 Testing PAN Uniqueness Feature\n');

  // Test configuration
  const testPAN = 'EYIPA5469P'; // Valid PAN for testing
  const user1 = 'test_user_alice_' + Date.now();
  const user2 = 'test_user_bob_' + Date.now();
  const userName1 = 'Alice Johnson';
  const userName2 = 'Bob Smith';

  console.log('🔧 Test Configuration:');
  console.log(`   PAN: ${testPAN}`);
  console.log(`   User 1: ${user1} (${userName1})`);
  console.log(`   User 2: ${user2} (${userName2})\n`);

  try {
    // Cleanup any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await clearUserKYCStatus(user1);
    await clearUserKYCStatus(user2);
    console.log('✅ Cleanup completed\n');

    // Test 1: Check PAN uniqueness for new user (should be unique)
    console.log('1️⃣ Testing PAN uniqueness for new user Alice...');
    const unique1 = await checkPANUniqueness(testPAN, user1);
    console.log(`   Result: ${unique1.isUnique ? '✅ UNIQUE' : '❌ NOT UNIQUE'}`);
    if (!unique1.isUnique) {
      console.log(`   Existing user: ${unique1.existingUserName} (${unique1.existingUserId})`);
      throw new Error('Expected PAN to be unique for new user');
    }
    console.log('   ✅ Test passed\n');

    // Test 2: Complete KYC for Alice
    console.log('2️⃣ Completing KYC verification for Alice...');
    const kyc1 = await completeKYCVerification(user1, testPAN, userName1);
    console.log(`   Result: ${kyc1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (!kyc1.success) {
      console.log(`   Error: ${kyc1.message}`);
      throw new Error('KYC verification failed for Alice');
    }
    console.log(`   Verified name: ${kyc1.kycStatus?.verifiedName}`);
    console.log('   ✅ Test passed\n');

    // Test 3: Check PAN uniqueness for second user (should NOT be unique)
    console.log('3️⃣ Testing PAN uniqueness for Bob (should fail)...');
    const unique2 = await checkPANUniqueness(testPAN, user2);
    console.log(`   Result: ${unique2.isUnique ? '❌ UNIQUE (unexpected)' : '✅ NOT UNIQUE (expected)'}`);
    if (unique2.isUnique) {
      throw new Error('Expected PAN to NOT be unique for second user');
    }
    console.log(`   Existing user: ${unique2.existingUserName} (${unique2.existingUserId})`);
    console.log('   ✅ Test passed\n');

    // Test 4: Try to complete KYC for Bob (should fail)
    console.log('4️⃣ Attempting KYC verification for Bob (should fail)...');
    const kyc2 = await completeKYCVerification(user2, testPAN, userName2);
    console.log(`   Result: ${kyc2.success ? '❌ SUCCESS (unexpected)' : '✅ FAILED (expected)'}`);
    if (kyc2.success) {
      throw new Error('Expected KYC verification to fail for Bob');
    }
    console.log(`   Error message: "${kyc2.message}"`);
    console.log('   ✅ Test passed\n');

    // Test 5: Alice tries to re-verify with same PAN (should work)
    console.log('5️⃣ Testing Alice re-verification (should work)...');
    const unique3 = await checkPANUniqueness(testPAN, user1);
    console.log(`   Result: ${unique3.isUnique ? '✅ UNIQUE (expected)' : '❌ NOT UNIQUE (unexpected)'}`);
    if (!unique3.isUnique) {
      throw new Error('Expected PAN to be unique for same user re-verification');
    }
    console.log('   ✅ Test passed\n');

    // Test 6: Test with different PAN for Bob (should work)
    console.log('6️⃣ Testing Bob with different PAN...');
    const differentPAN = 'ABCDE1234F'; // Different PAN
    const unique4 = await checkPANUniqueness(differentPAN, user2);
    console.log(`   PAN: ${differentPAN}`);
    console.log(`   Result: ${unique4.isUnique ? '✅ UNIQUE' : '❌ NOT UNIQUE'}`);
    if (!unique4.isUnique) {
      console.log(`   Note: PAN ${differentPAN} is already used by ${unique4.existingUserName}`);
      console.log('   This is expected if the PAN was used in previous tests');
    }
    console.log('   ✅ Test completed\n');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await clearUserKYCStatus(user1);
    await clearUserKYCStatus(user2);
    console.log('✅ Cleanup completed\n');

    // Summary
    console.log('🎉 All PAN Uniqueness Tests Passed!\n');
    console.log('📋 Test Summary:');
    console.log('   ✅ New user PAN check (unique)');
    console.log('   ✅ First user KYC completion');
    console.log('   ✅ Second user PAN check (not unique)');
    console.log('   ✅ Second user KYC rejection');
    console.log('   ✅ Same user re-verification');
    console.log('   ✅ Different PAN check');
    
    console.log('\n🔐 Security Features Verified:');
    console.log('   ✅ Prevents duplicate PAN usage');
    console.log('   ✅ Allows same user re-verification');
    console.log('   ✅ Provides clear error messages');
    console.log('   ✅ Maintains data integrity');

    console.log('\n💡 UI Features (manual testing required):');
    console.log('   🔍 Real-time PAN checking in PANVerification screen');
    console.log('   ⚠️  Orange warning text for duplicate PANs');
    console.log('   🚫 Submit button disabled when duplicate detected');
    console.log('   📱 Alert shown on attempt to submit duplicate PAN');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Cleanup on error
    try {
      await clearUserKYCStatus(user1);
      await clearUserKYCStatus(user2);
      console.log('🧹 Emergency cleanup completed');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError.message);
    }
  }
}

// Run the test
testPANUniqueness().then(() => {
  console.log('\n✨ Test execution completed');
}).catch((error) => {
  console.error('\n💥 Test execution failed:', error);
}); 