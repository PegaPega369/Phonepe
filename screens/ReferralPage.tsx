import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Share,
  Dimensions,
  Clipboard,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  generateReferralCode, 
  saveReferralCode, 
  applyReferralCode, 
  getReferralStats 
} from '../utils/referral';

// Get device dimensions
const { width, height } = Dimensions.get('window');

interface RouteParams {
  uid: string;
}

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  referralBonus: number;
  referrals: any[];
}

const ReferralPage: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as RouteParams;
  
  // State variables
  const [loading, setLoading] = useState<boolean>(true);
  const [applyLoading, setApplyLoading] = useState<boolean>(false);
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    referralCode: '',
    referralCount: 0,
    referralBonus: 0,
    referrals: [],
  });
  const [inputCode, setInputCode] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate shimmer position for premium effect
  const shimmerPosition = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.5, width * 1.5]
  });
  
  // Calculate rotation for confetti animation
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Load referral stats on mount
  useEffect(() => {
    const loadReferralStats = async () => {
      try {
        if (!params?.uid) {
          navigation.replace('Login');
          return;
        }
        
        const stats = await getReferralStats(params.uid);
        setReferralStats(stats);
      } catch (error) {
        console.error('Error loading referral stats:', error);
        Alert.alert('Error', 'Failed to load referral information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadReferralStats();
  }, [params, navigation]);
  
  // Start animations on mount
  useEffect(() => {
    // Fade and scale in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    // Shimmer animation loop
    const runShimmer = () => {
      shimmerValue.setValue(0);
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(runShimmer, 1000);
      });
    };
    
    runShimmer();
  }, [fadeAnim, scaleAnim, shimmerValue]);
  
  // Confetti animation in success modal
  useEffect(() => {
    if (showSuccessModal) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [showSuccessModal, rotateAnim]);
  
  // Handle share referral code
  // const handleShareCode = async () => {
  //   try {
  //     const shareMessage = `Join FinCraft with my referral code: ${referralStats.referralCode} and get 50 bonus points! Download the app now.`;
      
  //     const result = await Share.share({
  //       message: shareMessage,
  //       title: 'Share FinCraft Referral Code',
  //     });
      
  //   } catch (error) {
  //     console.error('Error sharing referral code:', error);
  //     Alert.alert('Error', 'Could not share referral code. Please try again.');
  //   }
  // };

  const handleShareCode = async () => {
    try {
      const shareLink ="https://google.com"
      const shareMessage = `Join FinCraft with my referral code: ${referralStats.referralCode} and get 50 bonus points! Download the app now ${shareLink}.`;
      
      const result = await Share.share({
        message: shareMessage,
        title: 'Share FinCraft Referral Code',
      });
      
    } catch (error) {
      console.error('Error sharing referral code:', error);
      Alert.alert('Error', 'Could not share referral code. Please try again.');
    }
  };
  
  // Handle copy referral code to clipboard
  const handleCopyCode = () => {
    Clipboard.setString(referralStats.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard.');
  };
  
  // Handle apply referral code
  const handleApplyCode = async () => {
    if (!inputCode) {
      Alert.alert('Error', 'Please enter a referral code.');
      return;
    }
    
    setApplyLoading(true);
    
    try {
      const result = await applyReferralCode(params.uid, inputCode.trim().toUpperCase());
      
      if (result.success) {
        setSuccessMessage(result.message);
        setShowSuccessModal(true);
        
        // Refresh referral stats
        const stats = await getReferralStats(params.uid);
        setReferralStats(stats);
        
        // Clear input
        setInputCode('');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      Alert.alert('Error', 'Failed to apply referral code. Please try again later.');
    } finally {
      setApplyLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9D6DF9" />
        <Text style={styles.loadingText}>Loading referral information...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Referral code card */}
          <View style={styles.referralCodeCard}>
            <View style={styles.referralCodeHeader}>
              <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
            </View>
            
            <View style={styles.codeContainer}>
              <View style={styles.codeWrapper}>
                <Text style={styles.codeText}>{referralStats.referralCode}</Text>
                
                {/* Shimmer effect on code */}
                <Animated.View 
                  style={[
                    styles.shimmerEffect,
                    {
                      transform: [{ translateX: shimmerPosition }]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.shimmerGradient}
                  />
                </Animated.View>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleCopyCode}
                >
                  <Icon name="content-copy" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Copy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleShareCode}
                >
                  <Icon name="share-variant" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Stats cards */}
          <View style={styles.statsRow}>
            <View style={styles.statsCard}>
              <Icon name="account-group" size={24} color="#9D6DF9" />
              <Text style={styles.statsNumber}>{referralStats.referralCount}</Text>
              <Text style={styles.statsLabel}>Friends Referred</Text>
            </View>
            
            <View style={styles.statsCard}>
              <Icon name="star" size={24} color="#9D6DF9" />
              <Text style={styles.statsNumber}>{referralStats.referralBonus}</Text>
              <Text style={styles.statsLabel}>Bonus Points</Text>
            </View>
          </View>
          
          {/* How it works */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>How it Works</Text>
            
            <View style={styles.stepContainer}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Your Code</Text>
                <Text style={styles.stepDescription}>Share your unique referral code with friends and family</Text>
              </View>
            </View>
            
            <View style={styles.stepContainer}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>They Sign Up</Text>
                <Text style={styles.stepDescription}>When they sign up using your code, they get 50 bonus points</Text>
              </View>
            </View>
            
            <View style={styles.stepContainer}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>You Earn Rewards</Text>
                <Text style={styles.stepDescription}>You get 100 bonus points for each successful referral</Text>
              </View>
            </View>
          </View>
          
          {/* Apply referral code */}
          <View style={styles.applyCodeContainer}>
            <Text style={styles.applyCodeTitle}>Have a Referral Code?</Text>
            
            <View style={styles.applyCodeInputContainer}>
              <TextInput
                style={styles.applyCodeInput}
                placeholder="Enter referral code"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={inputCode}
                onChangeText={setInputCode}
                autoCapitalize="characters"
                maxLength={6}
              />
              
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { opacity: applyLoading ? 0.7 : 1 }
                ]}
                onPress={handleApplyCode}
                disabled={applyLoading || !inputCode}
              >
                {applyLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.applyButtonText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Terms and conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By participating in our referral program, you agree to our{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text>.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            {/* Confetti animation */}
            <Animated.View 
              style={[
                styles.confettiContainer,
                {
                  transform: [{ rotate: rotation }]
                }
              ]}
            >
              {Array.from({ length: 20 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.confetti,
                    {
                      backgroundColor: index % 3 === 0 ? '#9D6DF9' : index % 3 === 1 ? '#4B0082' : '#FFC107',
                      top: Math.random() * 400,
                      left: Math.random() * 400,
                      width: 8 + Math.random() * 12,
                      height: 8 + Math.random() * 12,
                      transform: [{ rotate: `${Math.random() * 360}deg` }]
                    }
                  ]}
                />
              ))}
            </Animated.View>
            
            <View style={styles.successIconContainer}>
              <Icon name="check-circle-outline" size={60} color="#4CAF50" />
            </View>
            
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
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
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  referralCodeCard: {
    backgroundColor: 'rgba(35, 21, 55, 0.8)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  referralCodeHeader: {
    backgroundColor: 'rgba(75, 0, 130, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(157, 109, 249, 0.3)',
  },
  referralCodeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  codeContainer: {
    padding: 20,
    alignItems: 'center',
  },
  codeWrapper: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 180,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    width: '200%',
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(157, 109, 249, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    backgroundColor: 'rgba(35, 21, 55, 0.8)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  statsNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: 'rgba(35, 21, 55, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9D6DF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  applyCodeContainer: {
    backgroundColor: 'rgba(35, 21, 55, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  applyCodeTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  applyCodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applyCodeInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  applyButton: {
    backgroundColor: '#9D6DF9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#9D6DF9',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  confettiContainer: {
    position: 'absolute',
    width: 400,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#9D6DF9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReferralPage;