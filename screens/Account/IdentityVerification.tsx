import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, PROFILE_COLORS, SHADOWS, PROFILE_STYLES } from '../../components/ProfileComponents/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserKYCStatus, getUserKYCStatusFromFirebase, UserKYCStatus } from '../../utils/kycService';

const { width } = Dimensions.get('window');

interface RouteParams {
  uid?: string;
}

const IdentityVerification: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const uid = params?.uid;
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<boolean>(true);
  const [kycStatus, setKycStatus] = useState<UserKYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Early return if no user ID is provided
  if (!uid) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.errorContainer}>
          <Icon name="account-alert" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Authentication Required</Text>
          <Text style={styles.errorMessage}>
            User authentication is required to access identity verification. Please log in again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Check KYC status on component mount
  useEffect(() => {
    checkKYCStatus();
  }, []);
  
  // Reset show actions when method changes
  useEffect(() => {
    if (selectedMethod) {
      setShowActions(true);
    }
  }, [selectedMethod]);

  const checkKYCStatus = async () => {
    try {
      console.log('🔍 Checking KYC status in Identity Verification for user:', uid);
      
      // Always check Firebase first for the most up-to-date status
      let status: UserKYCStatus;
      try {
        console.log('🔥 Checking Firebase for latest KYC status...');
        status = await getUserKYCStatusFromFirebase(uid);
        console.log('✅ Firebase KYC status:', status);
      } catch (firebaseError) {
        console.log('❌ Firebase failed, using fallback:', firebaseError);
        status = await getUserKYCStatus(uid);
        console.log('💾 Fallback KYC status:', status);
      }
      
      setKycStatus(status);
      
      // Don't automatically navigate - let user see the verification methods
      // Navigation will happen when they select PAN and click Continue
    } catch (error) {
      console.error('Error checking KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedMethod) return;

    if (selectedMethod === 'pan') {
      // Check if KYC is already verified
      if (kycStatus?.isVerified) {
        // Navigate to KYC Details screen to show verified information
        (navigation as any).navigate('KYCDetails', { uid });
      } else {
        // Navigate to PAN verification screen for new verification
        (navigation as any).navigate('PANVerification', {
          userId: uid, // Use actual user ID
          requiredForPurchase: false
        });
      }
    } else if (selectedMethod === 'aadhaar') {
      // Show coming soon alert for Aadhaar
      Alert.alert(
        'Coming Soon',
        'Aadhaar verification will be available in the next update. Please use PAN verification for now.',
        [{ text: 'OK' }]
      );
    }
  };
  
  StatusBar.setBarStyle('light-content');

  const renderMethod = (title: string, description: string, iconName: string, id: string) => {
    const isSelected = selectedMethod === id;
    const isVerified = id === 'pan' && kycStatus?.isVerified;
    
    return (
      <TouchableOpacity
        style={[
          styles.verificationMethod,
          isSelected && styles.selectedMethod
        ]}
        onPress={() => setSelectedMethod(id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={isSelected ? COLORS.lightPurpleGradient : ['rgba(15,15,15,0.5)', 'rgba(10,10,10,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.methodGradient}
        >
          <View style={styles.methodIcon}>
            <Icon name={iconName} size={28} color={isSelected ? COLORS.text : COLORS.primary} />
          </View>
          <View style={styles.methodContent}>
            <Text style={styles.methodTitle}>{title}</Text>
            <Text style={styles.methodDescription}>
              {isVerified ? 'Already verified - View details' : description}
            </Text>
          </View>
          <View style={styles.checkContainer}>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
              </View>
            ) : (
              <View style={[styles.checkCircle, isSelected && styles.selectedCheckCircle]}>
                {isSelected && <Icon name="check" size={16} color={COLORS.text} />}
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Hero section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={COLORS.darkPurpleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Text style={styles.heroTitle}>Identity Verification</Text>
              <Text style={styles.heroSubtitle}>Secure your account and unlock premium features</Text>
              
              <View style={styles.securityBadge}>
                <Icon name="shield-check" size={18} color={COLORS.primary} />
                <Text style={styles.securityText}>End-to-end encrypted</Text>
              </View>
            </LinearGradient>
          </View>
          
          {/* Information section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Select Verification Method</Text>
            <Text style={styles.infoText}>
              To comply with regulations and ensure the security of your account,
              please verify your identity using one of the following methods.
            </Text>
            
            {/* Verification methods */}
            <View style={styles.methodsContainer}>
              {renderMethod(
                "Aadhaar Verification", 
                "Verify your identity using your Aadhaar card details", 
                "card-account-details-outline",
                "aadhaar"
              )}
              
              {renderMethod(
                "PAN Verification", 
                "Verify using your Permanent Account Number (PAN) card", 
                "file-document-outline",
                "pan"
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Action Button */}
      {showActions && (
        <View style={styles.bottomAction}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              disabled={!selectedMethod}
              activeOpacity={0.8}
              style={[styles.continueButton, !selectedMethod && styles.disabledButton]}
              onPress={handleContinue}
            >
              <LinearGradient
                colors={selectedMethod ? COLORS.purpleGradient : ['#333', '#222']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>
                  {selectedMethod === 'pan' && kycStatus?.isVerified ? 'View Details' : 'Continue'}
                </Text>
                {selectedMethod && (
                  <Icon name="arrow-right" size={20} color={COLORS.text} />
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => setShowActions(false)}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    width: '100%',
    zIndex: 100,
  },
  headerGradient: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  contentContainer: {
    padding: 16,
  },
  heroSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroGradient: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(166, 139, 215, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  securityText: {
    color: COLORS.primary,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textDim,
    marginBottom: 16,
  },
  methodsContainer: {
    marginTop: 0,
  },
  verificationMethod: {
    marginBottom: 12,
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedMethod: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(166, 139, 215, 0.1)',
    borderWidth: 2,
  },
  methodGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  methodIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(166, 139, 215, 0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: COLORS.textDim,
    lineHeight: 18,
  },
  checkContainer: {
    marginLeft: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckCircle: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContainer: {
    gap: 8,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 6,
  },
  continueText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    padding: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IdentityVerification;