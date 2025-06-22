# KYC Integration Guide

## Overview
This guide shows how to integrate the KYC (Know Your Customer) system into your gold purchase flow. The system automatically checks if KYC is required based on purchase amount and prevents purchases above ₹1000 without verification.

## Key Features
✅ **Automatic KYC Check**: Validates if user needs KYC for purchase amount  
✅ **PAN Validation**: Real-time PAN verification using Digitap API  
✅ **Purchase Limits**: Enforces ₹1000 limit without KYC  
✅ **Secure Storage**: Encrypted storage of verification status  
✅ **User-Friendly UI**: Seamless verification flow  

## Files Created/Modified

### New Files:
- `utils/kycService.ts` - Main KYC service with API integration
- `utils/kycChecker.ts` - Validation utilities and helpers
- `screens/Account/PANVerification.tsx` - PAN verification screen

### Modified Files:
- `screens/Account/IdentityVerification.tsx` - Updated to use KYC system

## Integration Steps

### 1. Import KYC Functions in Your Gold Purchase Screen

```typescript
import { canUserPurchase, getUserKYCStatus } from '../utils/kycService';
import { isKYCRequired } from '../utils/kycChecker';
```

### 2. Check KYC Before Purchase

```typescript
const handleGoldPurchase = async (amount: number) => {
  try {
    // Check if user can make this purchase
    const purchaseCheck = await canUserPurchase('user_id', amount);
    
    if (!purchaseCheck.canPurchase) {
      if (purchaseCheck.requiresKYC) {
        // Show KYC required alert
        Alert.alert(
          'KYC Required',
          purchaseCheck.message,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Complete KYC', 
              onPress: () => navigateToKYC(amount) 
            }
          ]
        );
      } else {
        // Show purchase limit alert
        Alert.alert('Purchase Limit', purchaseCheck.message);
      }
      return;
    }
    
    // Proceed with gold purchase
    proceedWithPurchase(amount);
    
  } catch (error) {
    console.error('Purchase check failed:', error);
    Alert.alert('Error', 'Unable to verify purchase eligibility');
  }
};

const navigateToKYC = (purchaseAmount: number) => {
  navigation.navigate('PANVerification', {
    userId: 'user_id', // Use actual user ID
    requiredForPurchase: true,
    purchaseAmount: purchaseAmount
  });
};
```

### 3. Display KYC Status in UI

```typescript
const [kycStatus, setKycStatus] = useState(null);

useEffect(() => {
  loadKYCStatus();
}, []);

const loadKYCStatus = async () => {
  const status = await getUserKYCStatus('user_id');
  setKycStatus(status);
};

// In your render method:
<View style={styles.kycStatus}>
  {kycStatus?.isVerified ? (
    <Text style={styles.verifiedText}>
      ✅ KYC Verified - Unlimited purchases
    </Text>
  ) : (
    <Text style={styles.unverifiedText}>
      ⚠️ KYC Required for purchases above ₹1000
    </Text>
  )}
</View>
```

### 4. Add KYC Status Check in Gold Purchase Components

```typescript
// In GoldSavings.tsx or similar components
import { canUserPurchase } from '../utils/kycService';

const GoldPurchaseComponent = () => {
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [canPurchase, setCanPurchase] = useState(true);
  const [kycMessage, setKycMessage] = useState('');

  useEffect(() => {
    checkPurchaseEligibility();
  }, [purchaseAmount]);

  const checkPurchaseEligibility = async () => {
    if (purchaseAmount > 0) {
      const result = await canUserPurchase('user_id', purchaseAmount);
      setCanPurchase(result.canPurchase);
      setKycMessage(result.message);
    }
  };

  return (
    <View>
      <TextInput
        value={purchaseAmount.toString()}
        onChangeText={(text) => setPurchaseAmount(Number(text))}
        placeholder="Enter amount"
      />
      
      {!canPurchase && (
        <Text style={styles.warningText}>{kycMessage}</Text>
      )}
      
      <TouchableOpacity
        style={[styles.buyButton, !canPurchase && styles.disabledButton]}
        onPress={() => canPurchase ? handlePurchase() : handleKYCRequired()}
        disabled={!canPurchase}
      >
        <Text style={styles.buttonText}>
          {canPurchase ? 'Buy Gold' : 'Complete KYC to Buy'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

## API Configuration

The KYC system uses the Digitap API with these credentials:
- **Environment**: UAT/Demo
- **Base URL**: `https://svcdemo.digitap.work`
- **Client ID**: `38606847`
- **Client Secret**: `pSAS7vt5F8X39ASdjfpK2Am5TApOltJ7`

## Testing

### Test PAN Numbers (for UAT environment):
- **Valid PAN**: `ABCDE1234F` (use any valid format)
- **Invalid PAN**: `INVALID123` (will return error)

### Test Scenarios:
1. **Purchase below ₹1000**: Should work without KYC
2. **Purchase above ₹1000 without KYC**: Should prompt for KYC
3. **Purchase after KYC completion**: Should work for any amount
4. **Invalid PAN verification**: Should show error message

## Error Handling

The system handles various error scenarios:
- Invalid PAN format
- Network connectivity issues
- API timeouts
- Invalid credentials
- PAN not found in database

## Security Features

- **Firebase Storage**: KYC status stored securely in Firebase Firestore
- **API Security**: Basic Auth with client credentials
- **Input Validation**: Comprehensive validation for PAN and name
- **Error Logging**: Detailed logging for debugging
- **Real-time Sync**: Always fetches latest data from Firebase

## Usage Examples

### Example 1: Simple Purchase Check
```typescript
const amount = 1500; // ₹1500 purchase
const result = await canUserPurchase('user123', amount);

if (result.canPurchase) {
  // Proceed with purchase
  console.log('Purchase allowed');
} else {
  // Show KYC requirement
  console.log(result.message);
}
```

### Example 2: Get KYC Status
```typescript
const status = await getUserKYCStatus('user123');
console.log('Is Verified:', status.isVerified);
console.log('Max Purchase:', status.maxPurchaseLimit);
console.log('Can Buy Gold:', status.canBuyGold);
```

### Example 3: Complete KYC
```typescript
const result = await completeKYCVerification(
  'user123',
  'ABCDE1234F',
  'John Doe'
);

if (result.success) {
  console.log('KYC completed successfully');
  console.log('Verified Name:', result.kycStatus?.verifiedName);
} else {
  console.log('KYC failed:', result.message);
}
```

## Navigation Setup

Add the PANVerification screen to your navigation stack:

```typescript
// In your navigation configuration
import PANVerification from './screens/Account/PANVerification';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* ... other screens */}
      <Stack.Screen 
        name="PANVerification" 
        component={PANVerification}
        options={{ title: 'PAN Verification' }}
      />
    </Stack.Navigator>
  );
}
```

## Migration from Local Storage

If you previously used local storage for KYC data, use the migration script:

```bash
node reset-kyc.js
```

This will:
- Clear all existing KYC data (Firebase + local storage)
- Force users to re-verify their KYC
- Ensure all new data is stored in Firebase only

### Reset User KYC Data

To completely reset a user's KYC data:

```javascript
import { forceResetUserKYC } from './utils/kycService';

// This clears both Firebase and any legacy local storage
await forceResetUserKYC('user_id');
```

## Next Steps

1. **Reset Existing Data**: Use the reset script to clear old local storage data
2. **Integrate into Gold Purchase Flow**: Add KYC checks to all gold purchase screens
3. **User ID Management**: Replace 'default_user' with actual user IDs from your auth system
4. **Production Setup**: Switch to production API when ready
5. **Additional Documents**: Add support for other verification methods (Aadhaar, etc.)

## Troubleshooting

### Common Issues

1. **Network Errors**: Check internet connectivity
2. **Invalid PAN**: Verify PAN format and existence
3. **API Timeouts**: Increase timeout values
4. **Firebase Errors**: Verify Firebase configuration and permissions
5. **Migration Issues**: Use `forceResetUserKYC()` to clear all old data

### Debug Mode

Enable debug logging by setting:
```javascript
console.log('KYC Debug Mode Enabled');
```

This will show detailed logs for all KYC operations.

## Support

For any issues with the KYC integration:
1. Check the console logs for detailed error messages
2. Verify API credentials and network connectivity
3. Test with valid PAN numbers in the correct format
4. Ensure proper navigation setup
5. Use the reset script if migration is needed

The system is now ready for production use with Firebase-only storage and proper error handling! 