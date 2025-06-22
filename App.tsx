import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { AuthProvider } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginPage from './screens/LoginPage';
import SmsReq from './components/SmsReq';
import SplashScreen from './screens/SplashScreen';
import MobileVerification from './screens/MobileVerification';
import Question1 from './screens/Questions/Question1';
import Question2 from './screens/Questions/Question2';
import Question3 from './screens/Questions/Question3';
import BottomNavigator from './components/BottomNavigator';
import Details from './screens/Details';
import Upi from './screens/Upi';
import HomePage from './screens/Home';
import ProfilePage from './screens/ProfilePage';
import DailySavings from './screens/DailySavings';
import WeeklySavings from './screens/WeeklySavings';
import MonthlySavings from './screens/MonthlySavings';
import RoundupSavings from './screens/RoundOff';
import DigitalGold from './screens/GoldSavings';
import ExpenseTracker from './screens/Expenses';
import GoalPage1 from './screens/GoalSavings1';
import GoalPage2 from './screens/GoalSavings2';
import GoalPage4 from './screens/GoalSavings4';
import GoldPage3 from './screens/GoalSavings3';
import Settings from './screens/Settings';
import TransactionHistory from './screens/TransactionHistory';
import MutualFund from './screens/MutualFunds';
import MutualFund1Screen from './screens/MutualFund1';
import MutualFund2Screen from './screens/MutualFund2';
import MutualFund3Screen from './screens/MutualFund3';
import SIPCalculator from './screens/SIPCalculator';
import InvestmentDetail from './screens/InvestmentDetails';
import AccountDetails from './screens/Account/AccountDetails';
import IdentityVerification from './screens/Account/IdentityVerification';
import IdentityVerification1 from './screens/Account/IdentityVerification1';
import PANVerification from './screens/Account/PANVerification';
import PaymentMethods from './screens/Account/PaymentMethods';
import SetupAutopay from './screens/Account/SetupAutopay';
import ManageAutopay from './screens/Account/ManageAutopay';
import ProcessRedemption from './screens/Account/ProcessRedemption';
import SaveOnEverySpend from './screens/Account/SaveOnEverySpend';
import Permissions from './screens/Account/Permissions';
import BiometricLock from './screens/Account/BiometricLock';
import HelpAndSupport from './screens/Account/HelpAndSupport';
import ExpenseAnalysis from './screens/ExpenseAnalysis';
import BudgetGoals from './screens/BudgetGoals';
import PortfolioDetails from './screens/PorfolioDetails';
import ReferralPage from './screens/ReferralPage';
import SilverInvestment from './screens/Silver';
import StreakPage from './screens/StreakPage';
import UseNotification from './Src/Notifications/UseNotification';
import ChatInterface from './screens/ChatInterface';
import SaveScreen from './screens/SaveScreen';
import WithdrawScreen from './screens/WithdrawScreen';
import GoalDetailScreen from './screens/GoalDetailsScreen';
import AddContribution from './screens/AddContribution';



enableScreens();
const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  UseNotification();

  

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const uid = token;
          console.log(uid);
          setUserId(uid);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
        setIsLoggedIn(false);
      }
    };
  
    // Run both token check and splash timer in parallel
    checkLoginStatus();
    

    const splashTimer = setTimeout(() => {
      setIsSplash(false);
    }, 2000); 
  
    return () => clearTimeout(splashTimer);
  }, []);
  

  if (isSplash) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <NavigationContainer independent={true}>
        <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"}>
          <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
          <Stack.Screen name="MobileVerification" component={MobileVerification} options={{ headerShown: false }} />
          <Stack.Screen name="SmsReq" component={SmsReq} options={{ headerShown: false }} />
          <Stack.Screen name="DetailsPg" component={Details} options={{ headerShown: false }} />
          <Stack.Screen name="Question1" component={Question1} options={{ headerShown: false }} />
          <Stack.Screen name="Question2" component={Question2} options={{ headerShown: false }} />
          <Stack.Screen name="Question3" component={Question3} options={{ headerShown: false }} />
          <Stack.Screen name="UPI" component={Upi} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomePage} initialParams={{ userId }} options={{ headerShown: false }} />
          <Stack.Screen name="PortfolioDetails" component={PortfolioDetails} options={{ headerShown: false }} />
          <Stack.Screen name="Save" component={SaveScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Withdraw" component={WithdrawScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfilePage} options={{ headerShown: false }} />
          <Stack.Screen name="Expenses" component={ExpenseTracker} options={{ headerShown: false }} />
          <Stack.Screen name="BudgetGoals" component={BudgetGoals} options={{ headerShown: false }} />
          <Stack.Screen name="GoalDetails" component={GoalDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddTransaction" component={AddContribution} options={{ headerShown: false }} />
          <Stack.Screen name="GoalSavings1" component={GoalPage1} options={{ headerShown: false }} />
          <Stack.Screen name="GoalSavings2" component={GoalPage2} options={{ headerShown: false }} />
          <Stack.Screen name="GoalSavings3" component={GoldPage3} options={{ headerShown: false }} />
          <Stack.Screen name="GoalSavings4" component={GoalPage4} options={{ headerShown: false }} />
          <Stack.Screen name="Transactions" component={TransactionHistory} options={{ headerShown: false }} />
          <Stack.Screen name="ExpenseAnalysis" component={ExpenseAnalysis} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
          <Stack.Screen name="RoundOff" component={RoundupSavings} options={{ headerShown: false }} />
          <Stack.Screen name="DailySavings" component={DailySavings} options={{ headerShown: false }} />
          <Stack.Screen name="WeeklySavings" component={WeeklySavings} options={{ headerShown: false }} />
          <Stack.Screen name="MonthlySavings" component={MonthlySavings} options={{ headerShown: false }} />
          <Stack.Screen name="Gold" component={DigitalGold} options={{ headerShown: false }} />
          <Stack.Screen name="Silver" component={SilverInvestment} options={{ headerShown: false }} />
          <Stack.Screen name="MutualFund" component={MutualFund} options={{ headerShown: false }} />
          <Stack.Screen name="MutualFund1" component={MutualFund1Screen} options={{ headerShown: false }} />
          <Stack.Screen name="MutualFund2" component={MutualFund2Screen} options={{ headerShown: false }} />
          <Stack.Screen name="MutualFund3" component={MutualFund3Screen} options={{ headerShown: false }} />
          <Stack.Screen name="SIP" component={SIPCalculator} options={{ headerShown: false }} />
          <Stack.Screen name="ID" component={InvestmentDetail} options={{ headerShown: false }} />
          <Stack.Screen name="AccountDetails" component={AccountDetails} options={{ headerShown: false }} />
          <Stack.Screen name="IdentityVerification" component={IdentityVerification} options={{ headerShown: false }} />
          <Stack.Screen name="KYCDetails" component={IdentityVerification1} options={{ headerShown: false }} />
          <Stack.Screen name="PANVerification" component={PANVerification} options={{ headerShown: false }} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethods} options={{ headerShown: false }} />
          <Stack.Screen name="SetupAutopay" component={SetupAutopay} options={{ headerShown: false }} />
          <Stack.Screen name="ProcessRedemption" component={ProcessRedemption} options={{ headerShown: false }} />
          <Stack.Screen name="ManageAutopay" component={ManageAutopay} options={{ headerShown: false }} />
          <Stack.Screen name="SaveOnEverySpend" component={SaveOnEverySpend} options={{ headerShown: false }} />
          <Stack.Screen name="Permissions" component={Permissions} options={{ headerShown: false }} />
          <Stack.Screen name="BiometricLock" component={BiometricLock} options={{ headerShown: false }} />
          <Stack.Screen name="HelpAndSupport" component={HelpAndSupport} options={{ headerShown: false }} />
          <Stack.Screen name="ReferralPage" component={ReferralPage} options={{ headerShown: false }} />
          <Stack.Screen name="Streak" component={StreakPage} options={{ headerShown: false }} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;