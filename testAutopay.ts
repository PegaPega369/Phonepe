import { testPhonePeAutopay, testIndividualComponents, testWebhookHandling } from './utils/phonepeAutopayTest';

const runTests = async () => {
  try {
    console.log('=== Starting PhonePe Autopay Tests ===\n');

    // Test 1: Individual Component Tests
    console.log('Running Individual Component Tests...\n');

    // Test VPA Validation
    console.log('1. Testing VPA Validation');
    await testIndividualComponents.testVpaValidation('test@upi');

    // Test Eligibility
    console.log('\n2. Testing Autopay Eligibility');
    await testIndividualComponents.testEligibility('9999999999');

    // Test Subscription Setup
    console.log('\n3. Testing Subscription Setup');
    const setupResult = await testIndividualComponents.testSubscriptionSetup(
      10000, // Rs. 100
      'MONTHLY',
      'test@upi'
    );

    // Test Redemption Flow if subscription setup was successful
    if (setupResult.success && setupResult.merchantSubscriptionId) {
      console.log('\n4. Testing Redemption Flow');
      await testIndividualComponents.testRedemptionFlow(
        setupResult.merchantSubscriptionId,
        10000 // Rs. 100
      );
    }

    console.log('\n=== Individual Component Tests Completed ===\n');

    // Test 2: Complete Flow Test
    console.log('Running Complete Flow Test...\n');
    const completeFlowResult = await testPhonePeAutopay();
    
    // Test 3: Webhook Handling Test
    console.log('\n=== Testing Webhook Handling ===\n');
    const webhookTestResult = await testWebhookHandling();
    
    if (completeFlowResult && webhookTestResult) {
      console.log('\n✅ All tests completed successfully!');
    } else {
      console.log('\n❌ Some tests failed. Check the logs above for details.');
    }

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  }
};

// Run the tests
runTests().then(() => {
  console.log('\nTest execution completed.');
}).catch((error) => {
  console.error('Error running tests:', error);
}); 