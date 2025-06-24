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
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from '../../components/ProfileComponents/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserKYCStatus, UserKYCStatus } from '../../utils/kycService';

const { width } = Dimensions.get('window');

interface RouteParams {
  uid?: string;
}

const KYCDetailsScreen: React.FC = ({ route }: any) => {
  const navigation = useNavigation();
  const { uid } = (route?.params as RouteParams) || {};
  
  const [kycStatus, setKycStatus] = useState<UserKYCStatus | null>(null);
  const [showFullPAN, setShowFullPAN] = useState(false);
  const [loading, setLoading] = useState(true);

  // Early return if no user ID is provided
  if (!uid) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <LinearGradient
            colors={COLORS.purpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerText}>KYC Details</Text>
          </LinearGradient>
        </View>

        <View style={styles.emptyContainer}>
          <Icon name="account-alert" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Authentication Required</Text>
          <Text style={styles.emptySubtitle}>
            User authentication is required to view KYC details. Please log in again.
          </Text>
        </View>
      </View>
    );
  }

  useEffect(() => {
    loadKYCDetails();
  }, []);

  const loadKYCDetails = async () => {
    try {
      setLoading(true);
      const status = await getUserKYCStatus(uid);
      setKycStatus(status);
    } catch (error) {
      console.error('Error loading KYC details:', error);
      Alert.alert('Error', 'Failed to load KYC details');
    } finally {
      setLoading(false);
    }
  };

  const maskPAN = (pan: string) => {
    if (!pan || pan.length < 10) return pan;
    return `${pan.substring(0, 4)}*****${pan.substring(9)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading KYC details...</Text>
      </View>
    );
  }

  if (!kycStatus?.isVerified) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <LinearGradient
            colors={COLORS.purpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerText}>KYC Details</Text>
          </LinearGradient>
        </View>

        <View style={styles.emptyContainer}>
          <Icon name="account-alert" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No KYC Verification Found</Text>
          <Text style={styles.emptySubtitle}>
            Complete your KYC verification to view details here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <LinearGradient
          colors={COLORS.purpleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerText}>KYC Details</Text>
        </LinearGradient>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Verification Status */}
          <View style={styles.statusSection}>
            <View style={styles.statusHeader}>
              <Icon name="shield-check" size={32} color={COLORS.success} />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Verification Complete</Text>
                <Text style={styles.statusSubtitle}>Your identity has been verified</Text>
              </View>
            </View>
          </View>

          {/* KYC Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Verified Information</Text>
            
            {/* Full Name */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Icon name="account" size={20} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Full Name</Text>
                </View>
                <Text style={styles.infoValue}>{kycStatus.verifiedName}</Text>
              </View>
            </View>

            {/* PAN Number */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Icon name="card-account-details" size={20} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>PAN Number</Text>
                </View>
                <View style={styles.panContainer}>
                  <Text style={styles.infoValue}>
                    {showFullPAN ? kycStatus.panNumber : maskPAN(kycStatus.panNumber || '')}
                  </Text>
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowFullPAN(!showFullPAN)}
                  >
                    <Icon 
                      name={showFullPAN ? "eye-off" : "eye"} 
                      size={18} 
                      color={COLORS.primary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Verification Date */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Icon name="calendar-check" size={20} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Verified On</Text>
                </View>
                <Text style={styles.infoValue}>
                  {formatDate(kycStatus.verificationDate || '')}
                </Text>
              </View>
            </View>

            {/* Purchase Limit */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <Icon name="credit-card" size={20} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Purchase Limit</Text>
                </View>
                <Text style={styles.infoValue}>
                  {kycStatus.maxPurchaseLimit === Infinity ? 'Unlimited' : `₹${kycStatus.maxPurchaseLimit}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>KYC Benefits</Text>
            
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.benefitText}>Unlimited gold purchases</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.benefitText}>Faster transaction processing</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.benefitText}>Enhanced account security</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.benefitText}>Priority customer support</Text>
            </View>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Icon name="shield-lock" size={20} color={COLORS.info} />
            <Text style={styles.securityText}>
              Your personal information is encrypted and stored securely in compliance with data protection regulations.
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textDim,
    fontSize: 16,
  },
  header: {
    width: '100%',
    zIndex: 100,
  },
  headerGradient: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 50,
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
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusSection: {
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: COLORS.textDim,
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
  infoCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textDim,
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  panContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    marginLeft: 12,
    padding: 4,
  },
  benefitsSection: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.textDim,
    marginLeft: 12,
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
    alignItems: 'flex-start',
  },
  securityText: {
    fontSize: 12,
    color: COLORS.info,
    marginLeft: 12,
    lineHeight: 18,
    flex: 1,
  },
});

export default KYCDetailsScreen;
