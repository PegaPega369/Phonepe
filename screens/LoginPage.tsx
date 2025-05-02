import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define TypeScript interfaces
interface RootStackParamList {
  MobileVerification: { phoneNumber: string };
  Home: { uid: string };
}

interface AuthContextType {
  setConfirmation: (confirmation: any) => void;
}

const { width, height } = Dimensions.get('window');

const LoginPage: React.FC = () => {
  // Navigation and context setup
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // State variables with TypeScript typing
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showReferralInput, setShowReferralInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonScale] = useState<Animated.Value>(new Animated.Value(1));
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [referralInputFocused, setReferralInputFocused] = useState<boolean>(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;

  // Run animations on mount
  useEffect(() => {
    // Fade in and slide up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // Shimmer animation loop
    const runShimmer = () => {
      shimmerValue.setValue(0);
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(runShimmer, 1000);
      });
    };
    
    runShimmer();
  }, [fadeAnim, slideAnim, shimmerValue]);
  
  // Calculate shimmer position for premium effect
  const shimmerPosition = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width * 1.5]
  });

  // Button animation handlers
  const handlePressIn = (): void => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Phone number validation
  const isValidPhoneNumber = (): boolean => {
    return phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
  };

  // Handle OTP request
  const handleGetOTP = async (): Promise<void> => {
    if (!isValidPhoneNumber()) {
      Alert.alert('Invalid Input', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      // First check if the user exists in Firestore
      const userSnapshot = await firestore()
        .collection('users')
        .where('phoneNumber', '==', phoneNumber)
        .get();
      
      // If a referral code was entered, store it in AsyncStorage for later use
      if (referralCode.trim()) {
        await AsyncStorage.setItem('pendingReferralCode', referralCode.trim().toUpperCase());
      }
      
      // Send OTP via Firebase Auth
      const confirmation = await auth().signInWithPhoneNumber(`+91${phoneNumber}`);
      
      // Store the verification ID for verification in the next step
      await AsyncStorage.setItem('verificationId', confirmation.verificationId);
      
      // Navigate to verification page with phone number
      navigation.navigate('MobileVerification', { phoneNumber });
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      Alert.alert(
        'Authentication Failed', 
        error.message || 'Failed to send OTP. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render the component
  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={styles.background}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Blurred background decorations */}
        <View style={styles.decorationContainer}>
          <View style={[styles.blurCircle, styles.blurCircle1]} />
          <View style={[styles.blurCircle, styles.blurCircle2]} />
        </View>
        
        {/* Header */}
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            {/* Text with shimmer specifically for the text */}
            <View style={styles.logoTextWrapper}>
              <Text style={styles.logoText}>
                <Text style={styles.logoHighlight}>Fin</Text>Craft
              </Text>
              
              {/* Shimmer effect on logo text only */}
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
            
            {/* Underline below the text */}
            <View style={styles.logoUnderline} />
          </View>
        </Animated.View>
        
        {/* Main content */}
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login / Signup</Text>
            <Text style={styles.subtitle}>
              Enter your mobile number to continue
            </Text>
            
            {/* Phone number input */}
            <View style={styles.inputContainer}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                placeholder="Mobile Number"
                style={[
                  styles.input,
                  inputFocused && styles.inputFocused
                ]}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </View>
            
            {/* Referral code toggle */}
            <TouchableOpacity 
              style={styles.referralToggle}
              onPress={() => setShowReferralInput(!showReferralInput)}
            >
              <Icon 
                name={showReferralInput ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#9D6DF9" 
              />
              <Text style={styles.referralToggleText}>
                {showReferralInput ? "Hide referral code" : "Have a referral code?"}
              </Text>
            </TouchableOpacity>
            
            {/* Referral code input (conditionally rendered) */}
            {showReferralInput && (
              <View style={styles.referralInputContainer}>
                <TextInput
                  placeholder="Enter referral code"
                  style={[
                    styles.referralInput,
                    referralInputFocused && styles.inputFocused
                  ]}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={referralCode}
                  onChangeText={(text) => setReferralCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={6}
                  onFocus={() => setReferralInputFocused(true)}
                  onBlur={() => setReferralInputFocused(false)}
                />
              </View>
            )}
            
            {/* Login button with animation */}
            <LinearGradient
              colors={['#231537', '#4B0082']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleGetOTP}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading || !phoneNumber}
                style={styles.proceedButton}
              >
                <Animated.View
                  style={[
                    styles.buttonContainer,
                    { transform: [{ scale: buttonScale }] },
                    !phoneNumber && styles.buttonDisabled
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Get OTP</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </LinearGradient>
            
            {/* Information container */}
            <View style={styles.infoContainer}>
              <Icon name="information-outline" size={16} color="#9D6DF9" />
              <Text style={styles.infoText}>
                By continuing, you agree to our{' '}
                <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Subtle dots for decoration */}
        <View style={[styles.subtleDot, { top: height * 0.2, left: width * 0.1 }]} />
        <View style={[styles.subtleDot, { top: height * 0.3, right: width * 0.15 }]} />
        <View style={[styles.subtleDot, { bottom: height * 0.15, left: width * 0.2 }]} />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    paddingTop: 70,
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  blurCircle: {
    position: 'absolute',
    borderRadius: 300,
    opacity: 0.2,
  },
  blurCircle1: {
    width: 300,
    height: 300,
    backgroundColor: '#4B0082',
    top: -100,
    right: -50,
    filter: 'blur(120px)',
  },
  blurCircle2: {
    width: 250,
    height: 250,
    backgroundColor: '#8A2BE2',
    bottom: -50,
    left: -100,
    filter: 'blur(120px)',
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoTextWrapper: {
    position: 'relative',
    overflow: 'hidden', // Contain the shimmer effect within the text wrapper
  },
  logoText: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 5,
    textShadowColor: 'rgba(138, 43, 226, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  logoHighlight: {
    color: '#9D6DF9',
  },
  logoUnderline: {
    width: 80,
    height: 3,
    backgroundColor: '#9D6DF9',
    borderRadius: 2,
    marginTop: 5,
    shadowColor: '#9D6DF9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  shimmerGradient: {
    width: '200%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  countryCode: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  countryCodeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputFocused: {
    borderColor: '#9D6DF9',
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
  },
  referralToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  referralToggleText: {
    color: '#9D6DF9',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  referralInputContainer: {
    marginBottom: 24,
    width: '100%',
  },
  referralInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  gradientButton: {
    borderRadius: 12,
    marginBottom: 20,
  },
  proceedButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  linkText: {
    color: '#9D6DF9',
    fontWeight: '600',
  },
  // Subtle decoration
  subtleDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(157, 109, 249, 0.6)',
    shadowColor: '#9D6DF9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});

export default LoginPage;