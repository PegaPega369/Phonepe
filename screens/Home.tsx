import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Text,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Navbar from '../components/Navbar';
import Header from '../components/HomeComponents/Header';
import Balance from '../components/HomeComponents/Balance';
import InvestmentOptions from '../components/HomeComponents/InvestmentOptions';
import QuickServices from '../components/HomeComponents/QuickServices';
import AutomaticSavings from '../components/HomeComponents/AutomaticSavings';
import ReferralBox from '../components/HomeComponents/ReferralBox';

// Define interfaces for better TypeScript support
interface RouteParams {
  uid?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
}

const HomePage: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
  });
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;

  const route = useRoute();
  const params = route.params as RouteParams | undefined;

  // Start animations when component mounts
  useEffect(() => {
    startLoadingAnimations();
  }, []);

  // Start loading animations
  const startLoadingAnimations = () => {
    // Fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Spinner animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Progress bar animation
    Animated.timing(loadingProgress, {
      toValue: 100,
      duration: 3000,
      easing: Easing.bezier(0.3, 0.1, 0.3, 1),
      useNativeDriver: false,
    }).start();
  };

  
  // Loading effect for UID
  useEffect(() => {
    const getUid = async () => {
      try {
        // Check AsyncStorage for uid
        const storedUid = await AsyncStorage.getItem('userToken');
        if (storedUid) {
          setUid(storedUid);
        } else if (params?.uid) {
          setUid(params.uid); // If not found in AsyncStorage, use params uid
        } else {
          // No UID found anywhere
          setLoadingError('User session not found. Please login again.');
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching UID from AsyncStorage: ', error);
        setLoadingError('Error loading user session. Please try again.');
        setLoading(false);
      }
    };

    getUid();
  }, [params]);

  // Loading effect for user data
  useEffect(() => {
    if (!uid) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await firestore().collection('users').doc(uid).get();
        if (userDoc.exists) {
          const firestoreData = userDoc.data();
          setUserData({
            firstName: firestoreData?.firstName || '',
            lastName: firestoreData?.lastName || '',
          });
        } else {
          setLoadingError('User profile not found. Please contact support.');
        }
      } catch (error) {
        console.log('Error fetching user data: ', error);
        setLoadingError('Error loading user data. Please try again later.');
      } finally {
        // Delay hiding the loading screen slightly to ensure smooth transition
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    fetchUserData();
  }, [uid]);

  const handleLogOut = async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem('userToken'); // Clear stored uid on logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Create the spin interpolation for the spinner
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Create width interpolation for the progress bar
  const progressWidth = loadingProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // Render loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.loadingContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}>
          <Animated.View
            style={[
              styles.spinner,
              {
                transform: [{ rotate: spin }],
              },
            ]}>
            <LinearGradient
              colors={['#8A2BE2', '#4B0082']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.spinnerGradient}
            />
          </Animated.View>
          
          <Text style={styles.loadingText}>Loading your dashboard</Text>
          
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          
          <Text style={styles.loadingSubText}>
            Please wait while we fetch your data...
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }
  // Render error screen
  if (loadingError) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Animated.View
          style={[
            styles.errorContent,
            {
              opacity: fadeAnim,
            },
          ]}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{loadingError}</Text>
          <LinearGradient
            colors={['#8A2BE2', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.retryButton}>
            <Text
              style={styles.retryButtonText}
              onPress={async () => {
                setLoading(true);
                setLoadingError(null);
                // Retry loading the data - navigate back to login or refresh
                if (!uid) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                } else {
                  navigation.replace('Home', { uid });
                }
              }}>
              Try Again
            </Text>
          </LinearGradient>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // No UID case
  if (!uid) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Session Expired</Text>
          <Text style={styles.errorMessage}>
            Your session has expired or is invalid. Please login again.
          </Text>
          <LinearGradient
            colors={['#8A2BE2', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.retryButton}>
            <Text
              style={styles.retryButtonText}
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              }>
              Back to Login
            </Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  // Main content render
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header
          firstName={userData.firstName}
          LastName={userData.lastName}
          onProfilePress={() => navigation.navigate('Profile', { uid })}
        />
        <Balance 
        onDetailsPress={() => navigation.navigate('PortfolioDetails',{uid})}
        onSavePress={()=>navigation.navigate('Save',{uid})}
        onWithdrawPress={()=>navigation.navigate('Withdraw',{uid})}
        />
        <InvestmentOptions
          onGoldPress={() => navigation.navigate('Gold', { uid })}
          onSilverPress={() => navigation.navigate('Silver',{uid})}
          onMutualFundPress={() => navigation.navigate('MutualFund', { uid })}
        />
        <QuickServices
          onExpensesPress={() => navigation.navigate('Expenses', { uid })}
          onGoalSavingsPress={() => navigation.navigate('BudgetGoals', { uid })}
          onSIPCalculatorPress={() => navigation.navigate('SIP', { uid })}
        />
        <AutomaticSavings
          onRoundOffPress={() => navigation.navigate('RoundOff', { uid })}
          onDailySavingsPress={() => navigation.navigate('DailySavings', { uid })}
          onWeeklySavingsPress={() => navigation.navigate('WeeklySavings', { uid })}
          onMonthlySavingsPress={() => navigation.navigate('MonthlySavings', { uid })}
        />
        <ReferralBox 
          onPress={() => navigation.navigate('ReferralPage', { uid })}
        />
        <View style={styles.footer}></View>
      </ScrollView>
      <Navbar uid={uid} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  footer: {
    height: 80, // Space for navbar
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  spinner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  spinnerGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 15,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8A2BE2',
  },
  // Error styles
  errorContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorIconText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'red',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default HomePage;