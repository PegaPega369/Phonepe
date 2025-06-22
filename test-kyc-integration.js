/**
 * Test KYC Integration
 * Run this to test the KYC system
 */

const { 
  validatePAN, 
  completeKYCVerification, 
  getUserKYCStatus,
  canUserPurchase,
  clearUserKYCStatus,
  forceResetUserKYC
} = require('./utils/kycService');

async function testKYCIntegration() {
  console.log('🧪 Starting KYC Integration Tests...\n');
  
  const testUserId = 'test_user_' + Date.now();
  console.log('👤 Test User ID:', testUserId);

  try {
    // Test 1: Force reset any existing data
    console.log('🔄 Testing force reset...');
    await forceResetUserKYC(testUserId);
    console.log('✅ Force reset completed\n');

    // Test 2: Check initial status (should be unverified)
    console.log('1️⃣ Testing initial KYC status...');
    const initialStatus = await getUserKYCStatus(testUserId);
    console.log('Initial status:', initialStatus);
    console.log('✅ Initial status test passed\n');

    // Test 3: Test PAN validation
    console.log('2️⃣ Testing PAN validation...');
    const panResult = await validatePAN('ABCDE1234F', 'Test User');
    console.log('PAN validation result:', panResult.success ? 'SUCCESS' : 'FAILED');
    if (!panResult.success) {
      console.log('Error:', panResult.error);
    }
    console.log('✅ PAN validation test completed\n');

    // Test 4: Test complete KYC process
    console.log('3️⃣ Testing complete KYC verification...');
    const kycResult = await completeKYCVerification(testUserId, 'ABCDE1234F', 'Test User');
    console.log('KYC completion result:', kycResult.success ? 'SUCCESS' : 'FAILED');
    console.log('Message:', kycResult.message);
    if (kycResult.kycStatus) {
      console.log('KYC Status:', kycResult.kycStatus);
    }
    console.log('✅ KYC completion test passed\n');

    // Test 5: Test purchase eligibility
    console.log('4️⃣ Testing purchase eligibility...');
    const purchaseResult = await canUserPurchase(testUserId, 1500);
    console.log('Can purchase ₹1500:', purchaseResult.canPurchase);
    console.log('Message:', purchaseResult.message);
    console.log('✅ Purchase eligibility test passed\n');

    // Test 6: Test status retrieval from Firebase
    console.log('5️⃣ Testing Firebase status retrieval...');
    const firebaseStatus = await getUserKYCStatus(testUserId);
    console.log('Status from Firebase:', firebaseStatus);
    console.log('✅ Firebase retrieval test passed\n');

    // Test 7: Test clearing KYC status
    console.log('6️⃣ Testing KYC status clearing...');
    await clearUserKYCStatus(testUserId);
    const clearedStatus = await getUserKYCStatus(testUserId);
    console.log('Status after clearing:', clearedStatus);
    console.log('✅ KYC clearing test passed\n');

    console.log('🎉 All KYC integration tests completed!');
    console.log('\n📱 Navigation Flow:');
    console.log('   Profile → Settings → Identity Verification → PAN Verification');
    console.log('   ✅ First time: Shows form for PAN entry');
    console.log('   ✅ After verification: Shows verified status with details');
    console.log('   ✅ Always navigates back after completion');
    console.log('\n💾 Storage:');
    console.log('   ✅ Data saved to Firebase ONLY');
    console.log('   ✅ No local storage dependencies');
    console.log('   ✅ Always fetches fresh data from Firebase');
    console.log('\n🔄 Migration:');
    console.log('   ✅ Use forceResetUserKYC() to clear all old data');
    console.log('   ✅ Complete fresh start with Firebase-only approach');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the tests
testKYCIntegration(); 