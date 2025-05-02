import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { applyReferralCode } from '../utils/referral';

import { AuthContext } from '../AuthContext';

// Define TypeScript interfaces
interface RootStackParamList {
  Login: undefined;
  Home: { uid: string };
  DetailsPg: { uid: string };
}

interface RouteParams {
  phoneNumber: string;
}

interface AuthContextType {
  confirmation: any;
}

const { width, height } = Dimensions.get('window');

const MobileVerification: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { phoneNumber } = route.params as RouteParams;
  
  const authContext = useContext(AuthContext) as AuthContextType;
  const { confirmation } = authContext;

  // State variables with TypeScript typing
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [buttonScale] = useState<Animated.Value>(new Animated.Value(1));
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  
  // Create refs for OTP inputs
  const otpInputRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const timerAnimation = useRef(new Animated.Value(1)).current;
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

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0 && resendDisabled) {
      // Animate timer visually
      Animated.timing(timerAnimation, {
        toValue: resendTimer / 30, // Normalize to 0-1
        duration: 1000,
        useNativeDriver: false,
      }).start();
      
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (resendTimer === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendTimer, resendDisabled]);

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

  // OTP validation
  const isOtpComplete = (): boolean => {
    return otp.every((digit) => digit !== '');
  };

  // Handle OTP input changes
  const handleChangeText = (index: number, value: string): void => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input or previous input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      } else if (!value && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle paste functionality for OTP
  const handleOtpPaste = (text: string): void => {
    // Extract only digits and limit to 6 characters
    const pastedData = text.replace(/\D/g, '').substring(0, 6);
    
    if (pastedData.length > 0) {
      // Create an array from the pasted string
      const newOtp = Array(6).fill('');
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus on the last filled input or the next empty one
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (): Promise<void> => {
    if (!isOtpComplete()) {
      Alert.alert('Incomplete OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Get the confirmation result from Firebase Authentication
      const otpCode = otp.join('');
      
      // Get the current verification ID and verify OTP
      const credential = auth.PhoneAuthProvider.credential(
        await AsyncStorage.getItem('verificationId') || '', 
        otpCode
      );
      
      // Sign in with credential
      const userCredential = await auth().signInWithCredential(credential);
      const user = userCredential.user;
      
      // Check if user exists in Firestore, create if not
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (userDoc.exists) {
        // Save user token for persistent login
      await AsyncStorage.setItem('userToken', user.uid);
      
      // Navigate to home with user ID
      navigation.replace('Home', { uid: user.uid });
        
      } else {
        navigation.replace('DetailsPg', { uid: user.uid })
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert(
        'Verification Failed',
        'The OTP you entered is incorrect. Please check and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async (): Promise<void> => {
    if (!resendDisabled) {
      // Reset the timer and disable resend button
      setResendTimer(30);
      setResendDisabled(true);
      
      // Reset animation
      timerAnimation.setValue(1);
      
      try {
        // Resend OTP through Firebase
        const confirmation = await auth().signInWithPhoneNumber(`+91${phoneNumber}`);
        
        // Store the new verification ID
        await AsyncStorage.setItem('verificationId', confirmation.verificationId);
        
        Alert.alert('Success', 'A new OTP has been sent to your mobile number');
      } catch (error: any) {
        console.error('Failed to resend OTP:', error);
        Alert.alert(
          'Failed to Resend',
          'Could not send new OTP. Please try again later.'
        );
        // Reset the timer for retry
        setResendTimer(0);
        setResendDisabled(false);
      }
    }
  };
  
  // Calculate shimmer position for premium effect
  const shimmerPosition = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.5, width * 1.5]
  });

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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Verification</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Main content (animated) */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.iconWrapper}>
            <Icon name="shield-check" size={50} color="#FFFFFF" />
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
                    
          {/* Form container */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to your mobile number
            </Text>
            
            {/* OTP input fields */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpInputWrapper}>
                  <TextInput
                    ref={(ref) => {
                      otpInputRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(value) => handleChangeText(index, value)}
                    onFocus={() => setFocusedInput(index)}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="numeric"
                    maxLength={1}
                    style={[
                      styles.otpInput,
                      focusedInput === index && styles.otpInputFocused,
                      digit ? styles.otpInputFilled : null
                    ]}
                    onPaste={(e) => handleOtpPaste(e.nativeEvent.text)}
                  />
                </View>
              ))}
            </View>
            
            {/* Verify button with animation */}
            <LinearGradient
              colors={['#231537', '#4B0082']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleVerifyOtp}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isLoading || !isOtpComplete()}
                style={styles.proceedButton}
              >
                <Animated.View
                  style={[
                    styles.buttonContainer,
                    { transform: [{ scale: buttonScale }] },
                    !isOtpComplete() && styles.buttonDisabled
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            </LinearGradient>
            
            {/* Resend OTP option */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity 
                onPress={handleResendOtp}
                disabled={resendDisabled}
                style={styles.resendButton}
              >
                <Text style={[
                  styles.resendActionText,
                  resendDisabled && styles.resendDisabled
                ]}>
                  {resendDisabled ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </Text>
                {resendDisabled && (
                  <Animated.View 
                    style={[
                      styles.timerProgressBar,
                      {
                        width: timerAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]}
                  />
                )}
              </TouchableOpacity>
            </View>
            
            {/* Info section */}
            <View style={styles.infoContainer}>
              <Icon name="information-outline" size={16} color="#9D6DF9" />
              <Text style={styles.infoText}>
                Make sure to check your SMS inbox and spam folder for the OTP message
              </Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Subtle dots for decoration */}
        <View style={[styles.subtleDot, { top: height * 0.25, left: width * 0.1 }]} />
        <View style={[styles.subtleDot, { top: height * 0.35, right: width * 0.15 }]} />
        <View style={[styles.subtleDot, { bottom: height * 0.2, left: width * 0.2 }]} />
        <View style={[styles.subtleDot, { bottom: height * 0.25, right: width * 0.1 }]} />
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
  },
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: -1,
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
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 45,
    backgroundColor: 'rgba(35, 21, 55, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
    marginBottom: 20,
    marginTop: 10,
    overflow: 'hidden',
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
  formContainer: {
    width: '100%',
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
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInputWrapper: {
    position: 'relative',
  },
  otpInput: {
    width: 48,
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  otpInputFocused: {
    borderColor: '#9D6DF9',
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
  },
  otpInputFilled: {
    borderColor: 'rgba(157, 109, 249, 0.3)',
    backgroundColor: 'rgba(157, 109, 249, 0.05)',
  },
  gradientButton: {
    borderRadius: 12,
    marginBottom: 24,
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
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  resendButton: {
    position: 'relative',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  resendActionText: {
    color: '#9D6DF9',
    fontSize: 14,
    fontWeight: '600',
  },
  resendDisabled: {
    color: 'rgba(157, 109, 249, 0.5)',
  },
  timerProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: 'rgba(157, 109, 249, 0.3)',
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

export default MobileVerification;