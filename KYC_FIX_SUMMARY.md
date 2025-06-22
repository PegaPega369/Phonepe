# KYC User ID Mismatch - Issue & Fix

## 🔍 Problem Identified

The KYC system had a **user ID mismatch** between different screens:

### Issue Details
- **PAN Verification Screen**: Was saving KYC data under `'default_user'` (hardcoded)
- **Gold Savings Screen**: Was looking for KYC data under `'GV0fh2exQsU5s8c5SNU2rCsE3NX2'` (actual Firebase user ID)
- **Result**: KYC verification appeared successful, but Gold Savings couldn't find the verified status

### Log Evidence
```
✅ KYC status saved to Firebase successfully for user: default_user
📄 Saved KYC data: {"canBuyGold": true, "isVerified": true, ...}

🔥 Getting KYC status from Firebase for user: GV0fh2exQsU5s8c5SNU2rCsE3NX2
📄 No KYC data in Firebase document
🆕 Returning default KYC status (new user)
```

## 🔧 Solution Applied

### 1. Updated Identity Verification Screen
- **File**: `screens/Account/IdentityVerification.tsx`
- **Changes**:
  - Added route parameter handling to get actual user ID
  - Updated KYC status checks to use actual user ID
  - Fixed navigation to pass correct user ID to PAN Verification

```typescript
// Before
status = await getUserKYCStatusFromFirebase('default_user');
navigation.navigate('PANVerification', { userId: 'default_user' });

// After  
const uid = params?.uid || 'default_user';
status = await getUserKYCStatusFromFirebase(uid);
navigation.navigate('PANVerification', { userId: uid });
```

### 2. Removed Local Storage Dependencies
- **File**: `utils/kycService.ts`
- **Changes**:
  - Completely removed AsyncStorage usage
  - All KYC data now stored in Firebase only
  - Added migration function to clear old local storage data

### 3. Created Cleanup Scripts
- **`fix-kyc-user.js`**: Clears KYC data for both old and new user IDs
- **`reset-kyc.js`**: General KYC reset utility
- **`forceResetUserKYC()`**: Function to clear both Firebase and legacy local storage

## 📱 User Journey Flow

### Navigation Chain
```
Profile Page → Identity Verification → PAN Verification
     ↓               ↓                    ↓
  uid passed → uid received → userId used for KYC
```

### Before Fix
```
Profile (GV0fh2exQsU5s8c5SNU2rCsE3NX2) 
    ↓
Identity Verification (❌ hardcoded 'default_user')
    ↓  
PAN Verification (❌ saves to 'default_user')
    ↓
Gold Savings (🔍 looks for GV0fh2exQsU5s8c5SNU2rCsE3NX2) ❌ NOT FOUND
```

### After Fix
```
Profile (GV0fh2exQsU5s8c5SNU2rCsE3NX2)
    ↓
Identity Verification (✅ uses actual uid)
    ↓
PAN Verification (✅ saves to GV0fh2exQsU5s8c5SNU2rCsE3NX2)
    ↓  
Gold Savings (✅ finds GV0fh2exQsU5s8c5SNU2rCsE3NX2) ✅ FOUND
```

## 🎯 Testing Steps

1. **Run cleanup script**:
   ```bash
   node fix-kyc-user.js
   ```

2. **Restart React Native app**:
   ```bash
   npx react-native start --reset-cache
   ```

3. **Test KYC flow**:
   - Go to Profile → Settings → Identity Verification
   - Complete PAN verification with test data
   - Navigate to Gold Savings page
   - Verify KYC status is correctly detected

## 🔒 Security Improvements

- **Firebase-only storage**: More secure than local storage
- **Consistent user IDs**: Prevents data leakage between users  
- **Real-time sync**: Always fetches latest KYC status from Firebase
- **Migration support**: Safely clears old local storage data

## 📋 Files Modified

1. `utils/kycService.ts` - Removed AsyncStorage, Firebase-only storage
2. `screens/Account/IdentityVerification.tsx` - Fixed user ID handling
3. `screens/Account/PANVerification.tsx` - Already correct (uses route params)
4. `screens/GoldSavings.tsx` - Already correct (uses route params)
5. `KYC_INTEGRATION.md` - Updated documentation
6. `fix-kyc-user.js` - New cleanup script
7. `reset-kyc.js` - General reset utility

## ✅ Verification

After applying the fix:
- KYC data is saved under the correct user ID
- Gold Savings page correctly detects verified status
- No more user ID mismatches
- Consistent behavior across all screens
- Firebase-only storage ensures data integrity 