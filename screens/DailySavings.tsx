import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';

interface RouteParams {
  uid: string;
}

const DailySavings: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as RouteParams;

  const [constantSavings, setConstantSavings] = useState('30');
  const [selectedAmount, setSelectedAmount] = useState('30');
  const savingType = "Daily";

  const handleAmountChange = (amount: string) => {
    setConstantSavings(amount);
    setSelectedAmount(amount);
  };

  const handleOptionClick = (amount: string) => {
    setConstantSavings(amount);
    setSelectedAmount(amount);
  };

  const handleProceed = async () => {
    try {
      await firestore().collection("users").doc(uid).update({
        constantSavings,
        savingType,
      });
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  const calculateSavings = (dailyAmount: number) => {
    return Math.round((dailyAmount * 1896) / 10);
  };

  const estimatedSavings = calculateSavings(parseInt(constantSavings) || 0);

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
        <Text style={styles.headerText}>Daily Savings</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#231537', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBanner}
          >
            <Icon 
              name="calendar-clock" 
              size={40} 
              color="#FFFFFF" 
              style={styles.heroIcon} 
            />
            <Text style={styles.bannerTitle}>Daily Auto-Save</Text>
            <Text style={styles.bannerSubtitle}>
              Set aside a fixed amount every day to build your investment portfolio consistently
            </Text>
          </LinearGradient>
        </View>
        
        {/* Amount Input Section */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Choose Daily Amount</Text>
          
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.amountInputContainer}
          >
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={constantSavings}
              onChangeText={handleAmountChange}
              selectionColor="#8A2BE2"
            />
            <Text style={styles.perDayText}>/ day</Text>
          </LinearGradient>
          
          <View style={styles.estimatedContainer}>
            <Text style={styles.estimatedLabel}>Estimated savings in 6 months</Text>
            <Text style={styles.estimatedValue}>₹{estimatedSavings}</Text>
          </View>
        </View>
        
        {/* Quick Options */}
        <View style={styles.quickOptionsSection}>
          <Text style={styles.quickOptionsLabel}>Quick Select</Text>
          
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              {['20', '30', '50'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.optionButton,
                    selectedAmount === amount && styles.selectedOptionButton,
                  ]}
                  onPress={() => handleOptionClick(amount)}
                >
                  <LinearGradient
                    colors={selectedAmount === amount 
                      ? ['#4B0082', '#231537'] 
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionGradient}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAmount === amount && styles.selectedOptionText
                    ]}>₹{amount}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.optionsRowCentered}>
              {['100', '200'].map((amount, index) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.optionButton,
                    styles.largeOptionButton,
                    selectedAmount === amount && styles.selectedOptionButton,
                  ]}
                  onPress={() => handleOptionClick(amount)}
                >
                  <LinearGradient
                    colors={selectedAmount === amount 
                      ? ['#4B0082', '#231537'] 
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.optionGradient}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAmount === amount && styles.selectedOptionText
                    ]}>₹{amount}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Icon name="information-outline" size={20} color="#9D6DF9" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            The selected amount will be automatically invested daily from your linked bank account
          </Text>
        </View>
      </ScrollView>
      
      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['#231537', '#4B0082']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity 
            style={styles.proceedButton}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>Activate ₹{constantSavings} Daily Savings</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  gradientBanner: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  bannerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  amountSection: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
  },
  amountInput: {
    width: 80,
    height: 40,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 0,
  },
  perDayText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  estimatedContainer: {
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  estimatedLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  estimatedValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#9D6DF9',
  },
  quickOptionsSection: {
    padding: 16,
  },
  quickOptionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  optionsContainer: {
    marginHorizontal: -4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionsRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionButton: {
    width: (width - 48) / 3 - 4,
    marginHorizontal: 2,
    marginBottom: 8,
  },
  largeOptionButton: {
    width: (width - 48) / 3 - 4,
    marginHorizontal: 6,
  },
  selectedOptionButton: {
    transform: [{ scale: 1.05 }],
  },
  optionGradient: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
    lineHeight: 18,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  gradientButton: {
    borderRadius: 12,
  },
  proceedButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default DailySavings;