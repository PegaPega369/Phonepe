import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, PROFILE_COLORS, SHADOWS, PROFILE_STYLES } from '../../components/ProfileComponents/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const IdentityVerification: React.FC = () => {
  const navigation = useNavigation();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showActions, setShowActions] = useState<boolean>(true);
  
  // Reset show actions when method changes
  useEffect(() => {
    if (selectedMethod) {
      setShowActions(true);
    }
  }, [selectedMethod]);
  
  StatusBar.setBarStyle('light-content');

  const renderMethod = (title: string, description: string, iconName: string, id: string) => {
    const isSelected = selectedMethod === id;
    
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
            <Text style={styles.methodDescription}>{description}</Text>
          </View>
          <View style={styles.checkContainer}>
            <View style={[styles.checkCircle, isSelected && styles.selectedCheckCircle]}>
              {isSelected && <Icon name="check" size={16} color={COLORS.text} />}
            </View>
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
            >
              <LinearGradient
                colors={selectedMethod ? COLORS.purpleGradient : ['#333', '#222']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>
                  Continue
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
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
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
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
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
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 21, 55, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    marginTop: 8,
  },
  securityText: {
    color: COLORS.primary,
    fontSize: 13,
    marginLeft: 6,
  },
  infoSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textDim,
    marginBottom: 20,
  },
  methodsContainer: {
    marginTop: 8,
  },
  verificationMethod: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.3)',
    ...SHADOWS.small,
  },
  selectedMethod: {
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  methodGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  methodIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(35, 21, 55, 0.5)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: COLORS.textDim,
  },
  checkContainer: {
    marginLeft: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckCircle: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
    ...SHADOWS.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  continueText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    width: '100%',
    maxWidth: 320,
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});

export default IdentityVerification;