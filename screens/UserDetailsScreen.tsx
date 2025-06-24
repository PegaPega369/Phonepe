import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UserDetails {
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
}

const UserDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as { uid: string };

  // Form state - phone number will be loaded from Firebase
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // This will be loaded from Firebase, not displayed
  const [loading, setLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();

    // Load existing user data if available
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.name) setName(userData.name);
        if (userData?.dateOfBirth || userData?.dob) setDateOfBirth(userData.dateOfBirth || userData.dob);
        if (userData?.phone) setPhoneNumber(userData.phone);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return false;
    }
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter a valid name with at least 2 characters.');
      return false;
    }
    if (!dateOfBirth.trim()) {
      Alert.alert('Missing Information', 'Please enter your date of birth.');
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number not found. Please try logging in again.');
      return false;
    }
    
    // Basic date validation (DD/MM/YYYY format)
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(dateOfBirth)) {
      Alert.alert('Invalid Date', 'Please enter date in DD/MM/YYYY format.');
      return false;
    }

    return true;
  };

  const saveUserDetails = async () => {
    if (!validateForm()) return;
    if (loading) return;

    setLoading(true);
    try {
      // Split name into first and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userDetails = {
        name: name.trim(),
        firstName,
        lastName,
        phone: phoneNumber.trim(),
        phoneNumber: phoneNumber.trim(),
        dob: dateOfBirth.trim(),
        dateOfBirth: dateOfBirth.trim(),
      };

      // Check if user document exists
      const userDoc = await firestore().collection('users').doc(uid).get();
      
      if (userDoc.exists) {
        // Update existing document
        await firestore().collection('users').doc(uid).update({
          ...userDetails,
          updatedAt: firestore.Timestamp.now(),
        });
      } else {
        // Create new document
        await firestore().collection('users').doc(uid).set({
          ...userDetails,
          uid,
          createdAt: firestore.Timestamp.now(),
          updatedAt: firestore.Timestamp.now(),
        });
      }

      console.log('User details saved successfully');
      
      // Navigate to questionnaire
      navigation.navigate('Question1', { uid });
      
    } catch (error) {
      console.error('Error saving user details:', error);
      Alert.alert('Error', 'Failed to save your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (text: string) => {
    // Auto-format date as user types
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length >= 5) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    
    setDateOfBirth(formatted);
  };

  const isFormValid = name.trim().length >= 2 && dateOfBirth.length === 10 && phoneNumber.trim().length > 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#06041A', '#0A0312', '#000000']}
        style={styles.backgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '50%']
                  })
                }
              ]}
            >
              <LinearGradient
                colors={['#8A2BE2', '#4B0082']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressGradient}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>Step 2 of 4</Text>
        </View>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Title Section */}
          <View style={styles.titleContainer}>
            <View style={styles.iconWrapper}>
              <Icon name="user" size={32} color="#9D6DF9" />
            </View>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>
              We need your name and date of birth to personalize your experience and ensure secure transactions.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Icon name="user" size={20} color="#9D6DF9" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Date of Birth Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.inputWrapper}>
                <Icon name="calendar" size={20} color="#9D6DF9" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={dateOfBirth}
                  onChangeText={handleDateChange}
                  keyboardType="numeric"
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <Animated.View 
        style={[
          styles.bottomContainer,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isFormValid || loading) && styles.continueButtonDisabled
          ]}
          onPress={saveUserDetails}
          disabled={!isFormValid || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isFormValid && !loading ? ['#8A2BE2', '#4B0082'] : ['#333333', '#222222']}
            style={styles.continueButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.continueButtonText}>Continue</Text>
                <Icon name="arrow-right" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressGradient: {
    height: '100%',
    width: '100%',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#8A2BE2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.3,
  },
});

export default UserDetailsScreen; 