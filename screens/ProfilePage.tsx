import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Navbar from '../components/Navbar';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  PROFILE_COLORS,
  SHADOWS,
  COLORS,
} from '../components/ProfileComponents/theme';
import ProfileHeader from '../components/ProfileComponents/ProfileHeader';
import ProfileOption from '../components/ProfileComponents/ProfileOption';
import ProfileSection from '../components/ProfileComponents/ProfileSection';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Define TypeScript interfaces
interface RouteParams {
  uid: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age?: number;
  createdAt?: firestore.Timestamp;
}

const ProfilePage: React.FC = () => {
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const uid = params?.uid || 'defaultUser';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // State variables for user data
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [joinedDate, setJoinedDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Account status state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDeactivated, setIsDeactivated] = useState<boolean>(false);

  // Animation values for button presses
  const [buttonScale] = useState<Animated.Value>(new Animated.Value(1));
  const [optionScale] = useState<Animated.Value>(new Animated.Value(1));

  const togglePauseAccount = (): void => setIsPaused(previousState => !previousState);
  const toggleDeactivateAccount = (): void =>
    setIsDeactivated(previousState => !previousState);

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const userDoc = await firestore().collection('users').doc(uid).get();
        if (userDoc.exists) {
          const firestoreData = userDoc.data() as UserData | undefined;
          
          if (firestoreData) {
            // Set user information from Firestore
            setUserData({
              firstName: firestoreData.firstName || '',
              lastName: firestoreData.lastName || '',
              phoneNumber: firestoreData.phoneNumber || '',
              age: firestoreData.age,
            });
            
            // Format the joined date if available
            if (firestoreData.createdAt) {
              const joinDate = firestoreData.createdAt.toDate();
              const month = joinDate.toLocaleString('default', { month: 'short' });
              const year = joinDate.getFullYear();
              setJoinedDate(`${month} ${year}`);
            } else {
              setJoinedDate('N/A');
            }
          }
        } else {
          setError('User data not found');
        }
      } catch (error) {
        console.log('Error fetching user data: ', error);
        setError('Error loading profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid]);

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

  const removeToken = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('userToken');
      console.log('Token removed successfully');
    } catch (error) {
      console.error('Error removing token: ', error);
    }
  };
  
  const handleSignOut = async (): Promise<void> => {
    try {
      await removeToken(); // Call the removeToken function before signing out
      await auth().signOut();
      // Navigate to login screen or any other appropriate screen after sign out
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PROFILE_COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color={PROFILE_COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.replace('Profile', {uid})}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Header - Now with dynamic data */}
        <ProfileHeader
          firstName={userData.firstName}
          lastName={userData.lastName}
          phoneNumber={userData.phoneNumber || 'No phone number'}
          age={userData.age || 0}
          joinedDate={joinedDate}
        />

        {/* Profile Settings Section */}
        <ProfileSection title="Profile Settings">
          <ProfileOption
            icon="person-circle"
            label="Account Details"
            onPress={() => navigation.navigate('AccountDetails', {uid})}
            scale={optionScale}
            isFirst
          />
          <ProfileOption
            icon="shield-checkmark"
            label="Identity Verification"
            onPress={() => navigation.navigate('IdentityVerification', {uid})}
            rightElement={<Text style={styles.linkText}>Verify Now</Text>}
            scale={optionScale}
            isLast
          />
        </ProfileSection>

        {/* Payment Settings Section */}
        <ProfileSection title="Payment Settings">
          <ProfileOption
            icon="card"
            label="Payment Methods"
            onPress={() => navigation.navigate('PaymentMethods', {uid})}
            scale={optionScale}
            isFirst
          />
          <ProfileOption
            icon="repeat"
            label="Setup Autopay"
            onPress={() => navigation.navigate('SetupAutopay', {uid})}
            scale={optionScale}
          />
          <ProfileOption
            icon="sync-circle"
            label="Manage Autopay"
            onPress={() => navigation.navigate('ManageAutopay', {uid})}
            scale={optionScale}
          />
          <ProfileOption
            icon="pricetag"
            label="Save on Every Spend"
            onPress={() => navigation.navigate('SaveOnEverySpend', {uid})}
            scale={optionScale}
            isLast
          />
        </ProfileSection>

        {/* Security Settings Section */}
        <ProfileSection title="Security Settings">
          <ProfileOption
            icon="lock-closed"
            label="Permissions"
            onPress={() => navigation.navigate('Permissions', {uid})}
            scale={optionScale}
            isFirst
          />
          <ProfileOption
            icon="finger-print"
            label="Biometric Lock"
            onPress={() => navigation.navigate('BiometricLock', {uid})}
            scale={optionScale}
            isLast
          />
        </ProfileSection>

        {/* Support Section */}
        <ProfileSection title="Support">
          <ProfileOption
            icon="help-circle"
            label="Help and Support"
            onPress={() => navigation.navigate('HelpAndSupport', {uid})}
            scale={optionScale}
            isFirst
            isLast
          />
        </ProfileSection>

        {/* Account Controls Section */}
        <ProfileSection title="Account Controls">
          <ProfileOption
            icon="pause-circle"
            label="Pause Account"
            onPress={() => togglePauseAccount()}
            scale={optionScale}
            isFirst
            rightElement={
              <Switch
                trackColor={{
                  false: PROFILE_COLORS.switchTrackInactive,
                  true: PROFILE_COLORS.switchTrackActive,
                }}
                thumbColor={
                  isPaused
                    ? PROFILE_COLORS.warning
                    : PROFILE_COLORS.switchThumbInactive
                }
                ios_backgroundColor={PROFILE_COLORS.cardLight}
                onValueChange={togglePauseAccount}
                value={isPaused}
              />
            }
          />

          <ProfileOption
            icon="close-circle"
            label="Deactivate Account"
            onPress={() => toggleDeactivateAccount()}
            scale={optionScale}
            isLast
            rightElement={
              <Switch
                trackColor={{
                  false: PROFILE_COLORS.switchTrackInactive,
                  true: PROFILE_COLORS.dangerBackground,
                }}
                thumbColor={
                  isDeactivated
                    ? PROFILE_COLORS.error
                    : PROFILE_COLORS.switchThumbInactive
                }
                ios_backgroundColor={PROFILE_COLORS.cardLight}
                onValueChange={toggleDeactivateAccount}
                value={isDeactivated}
              />
            }
          />
        </ProfileSection>


        {/* Sign Out button with animation */}
        <TouchableOpacity
          onPress={handleSignOut}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <Animated.View
            style={[styles.signOutButton, {transform: [{scale: buttonScale}]}]}>
            <LinearGradient
              colors={['#231537', '#4B0082']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.signOutGradient}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.appVersion}>App Version 1.0.0</Text>
      </ScrollView>
      <Navbar uid={uid} />
    </SafeAreaView>
  );
};

// Define styles with TypeScript interfaces
interface StyleProps {
  background: object;
  container: object;
  scrollContent: object;
  linkText: object;
  accountControls: object;
  switchOption: object;
  optionLeft: object;
  iconContainer: object;
  optionText: object;
  signOutButton: object;
  signOutGradient: object;
  signOutText: object;
  appVersion: object;
  loadingContainer: object;
  loadingText: object;
  errorContainer: object;
  errorText: object;
  retryButton: object;
  retryButtonText: object;
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.primaryLight,
    fontWeight: '500',
  },
  accountControls: {
    marginHorizontal: 16,
  marginTop: 20,
  marginBottom: 10,
  backgroundColor: COLORS.cardDark,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(157, 109, 249, 0.2)', // soft border like silver
  overflow: 'hidden',
  ...SHADOWS.small,
  },
  switchOption: {
    flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderBottomWidth: 1, // Add this to create the line between options
  borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#B84FCE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  signOutGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  appVersion: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: PROFILE_COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfilePage;