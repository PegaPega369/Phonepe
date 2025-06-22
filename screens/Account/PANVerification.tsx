import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { completeKYCVerification, getUserKYCStatus, UserKYCStatus } from '../../utils/kycService';
import { validateKYCForm, formatPAN, formatName } from '../../utils/kycChecker';

interface PANVerificationProps {
  route?: {
    params?: {
      userId?: string;
      requiredForPurchase?: boolean;
      purchaseAmount?: number;
    };
  };
}

const PANVerification: React.FC<PANVerificationProps> = ({ route }) => {
  const navigation = useNavigation();
  const [panNumber, setPanNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [currentKYCStatus, setCurrentKYCStatus] = useState<UserKYCStatus | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get parameters
  const userId = route?.params?.userId || 'default_user';
  const requiredForPurchase = route?.params?.requiredForPurchase || false;
  const purchaseAmount = route?.params?.purchaseAmount || 0;

  useEffect(() => {
    checkCurrentKYCStatus();
  }, []);

  const checkCurrentKYCStatus = async () => {
    try {
      const status = await getUserKYCStatus(userId);
      setCurrentKYCStatus(status);

      // No need to show alert anymore, the UI will handle verified state
    } catch (error) {
      console.error('Error checking KYC status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handlePANChange = (text: string) => {
    const formatted = formatPAN(text);
    setPanNumber(formatted);
    
    // Clear PAN error when user starts typing
    if (errors.panNumber) {
      setErrors(prev => ({ ...prev, panNumber: '' }));
    }
  };

  const handleNameChange = (text: string) => {
    const formatted = formatName(text);
    setHolderName(formatted);
    
    // Clear name error when user starts typing
    if (errors.holderName) {
      setErrors(prev => ({ ...prev, holderName: '' }));
    }
  };

  const handleVerifyPAN = async () => {
    // Validate form
    const validation = validateKYCForm({
      panNumber,
      holderName
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await completeKYCVerification(userId, panNumber, holderName);

      if (result.success) {
        Alert.alert(
          '🎉 KYC Verification Successful!',
          `✅ Your PAN has been verified and saved successfully!\n\n📋 PAN: ${panNumber}\n👤 Verified Name: ${result.kycStatus?.verifiedName}\n💰 You can now purchase gold without any limits!\n\n🔒 Your information is securely stored in our system.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Always navigate back to previous screen
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'KYC Verification Failed',
          result.message,
          [{ text: 'Try Again' }]
        );
      }
    } catch (error) {
      console.error('KYC Verification Error:', error);
      Alert.alert(
        'Verification Error',
        'Something went wrong during verification. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Checking KYC Status...</Text>
      </View>
    );
  }

  // Show verified status if already verified
  if (currentKYCStatus?.isVerified) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.verifiedContainer}>
          <View style={styles.verifiedHeader}>
            <Text style={styles.verifiedIcon}>✅</Text>
            <Text style={styles.verifiedTitle}>KYC Verified</Text>
            <Text style={styles.verifiedSubtitle}>Your identity has been successfully verified</Text>
          </View>

          <View style={styles.verifiedDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PAN Number:</Text>
              <Text style={styles.detailValue}>{currentKYCStatus.panNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Verified Name:</Text>
              <Text style={styles.detailValue}>{currentKYCStatus.verifiedName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Verification Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(currentKYCStatus.verificationDate || '').toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            <Text style={styles.benefitText}>• Unlimited gold purchases</Text>
            <Text style={styles.benefitText}>• No purchase limits</Text>
            <Text style={styles.benefitText}>• Secure transactions</Text>
            <Text style={styles.benefitText}>• One-time verification</Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>KYC Verification</Text>
          <Text style={styles.subtitle}>
            Complete your KYC to purchase gold above ₹1000
          </Text>
          
          {requiredForPurchase && (
            <View style={styles.requirementBanner}>
              <Text style={styles.requirementText}>
                ⚠️ KYC Required for ₹{purchaseAmount} purchase
              </Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAN Number *</Text>
            <TextInput
              style={[styles.input, errors.panNumber ? styles.inputError : null]}
              value={panNumber}
              onChangeText={handlePANChange}
              placeholder="Enter your PAN number (e.g., ABCDE1234F)"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              maxLength={10}
            />
            {errors.panNumber && (
              <Text style={styles.errorText}>{errors.panNumber}</Text>
            )}
            <Text style={styles.helperText}>
              Enter your 10-digit PAN number as printed on your PAN card
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.holderName ? styles.inputError : null]}
              value={holderName}
              onChangeText={handleNameChange}
              placeholder="Enter name as per PAN card"
              placeholderTextColor="#999"
              autoCapitalize="words"
              maxLength={85}
            />
            {errors.holderName && (
              <Text style={styles.errorText}>{errors.holderName}</Text>
            )}
            <Text style={styles.helperText}>
              Enter your full name exactly as printed on your PAN card
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerifyPAN}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify PAN</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why KYC is Required?</Text>
          <Text style={styles.infoText}>
            • KYC is mandatory for gold purchases above ₹1000 as per RBI guidelines
          </Text>
          <Text style={styles.infoText}>
            • Your information is secure and encrypted
          </Text>
          <Text style={styles.infoText}>
            • One-time verification for unlimited purchases
          </Text>
          <Text style={styles.infoText}>
            • Verification usually takes less than 30 seconds
          </Text>
        </View>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>
            🔒 Your PAN and personal information are encrypted and stored securely. 
            We comply with all data protection regulations.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#E0E0E0',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#000000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 20,
    lineHeight: 24,
  },
  requirementBanner: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  requirementText: {
    color: '#FFC107',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#FFFFFF',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  helperText: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  verifyButton: {
    backgroundColor: '#A68BD7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: 'rgba(166, 139, 215, 0.3)',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 8,
    lineHeight: 20,
  },
  securityNote: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  securityText: {
    color: '#4CAF50',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Verified status styles
  verifiedContainer: {
    flex: 1,
    padding: 20,
  },
  verifiedHeader: {
    backgroundColor: '#FFF',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  verifiedIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  verifiedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  verifiedSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  verifiedDetails: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  benefitsSection: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 5,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PANVerification; 