import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  StatusBar,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';

interface RouteParams {
  uid: string;
}

const RoundOff: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as RouteParams;

  const [roundTo, setRoundTo] = useState(10);
  const savingType = "roundoff";
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleRoundupSelect = (amount: number, index: number) => {
    setRoundTo(amount);
    setSelectedIndex(index);
  };

  const handleProceed = async () => {
    try {
      await firestore().collection("users").doc(uid).update({
        roundTo,
        savingType,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error updating roundup savings:", error);
    }
  };

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
        <Text style={styles.headerText}>Round-up Savings</Text>
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
              name="cash-multiple" 
              size={40} 
              color="#FFFFFF" 
              style={styles.heroIcon} 
            />
            <Text style={styles.bannerTitle}>Smart Roundup</Text>
            <Text style={styles.bannerSubtitle}>
              Every transaction gets rounded up, and the difference goes straight into your investments
            </Text>
          </LinearGradient>
        </View>
        
        {/* Amount Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Roundup Amount</Text>
          
          <View style={styles.amountOptionsContainer}>
            {[10, 20, 50, 100].map((amount, index) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountOption,
                  roundTo === amount && styles.selectedAmountOption,
                ]}
                onPress={() => handleRoundupSelect(amount, index)}
              >
                <LinearGradient
                  colors={roundTo === amount 
                    ? ['#4B0082', '#231537'] 
                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.amountGradient}
                >
                  <Text style={styles.amountValue}>₹{amount}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Example Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Icon name="coffee-outline" size={20} color="#9D6DF9" />
              <Text style={styles.exampleTitle}>Coffee Purchase</Text>
            </View>
            
            <View style={styles.exampleContent}>
              <View style={styles.exampleRow}>
                <Text style={styles.exampleLabel}>Original Amount:</Text>
                <Text style={styles.exampleValue}>₹87</Text>
              </View>
              
              <View style={styles.exampleRow}>
                <Text style={styles.exampleLabel}>Rounded Amount:</Text>
                <Text style={styles.exampleHighlight}>₹{Math.ceil(87/roundTo)*roundTo}</Text>
              </View>
              
              <View style={styles.exampleRow}>
                <Text style={styles.exampleLabel}>You Save:</Text>
                <Text style={styles.savingsAmount}>₹{Math.ceil(87/roundTo)*roundTo - 87}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoContainer}>
            <Icon name="information-outline" size={20} color="#9D6DF9" />
            <Text style={styles.infoText}>
              Spare change will be collected throughout the day and automatically invested at 5 PM daily
            </Text>
          </View>
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
            <Text style={styles.proceedButtonText}>Activate Round-up Savings</Text>
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
  sectionContainer: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  amountOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  amountOption: {
    width: (width - 94) / 4,  
    marginHorizontal: 4,
    marginBottom: 8,
  },
  selectedAmountOption: {
    transform: [{ scale: 1.05 }],
  },
  amountGradient: {
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  exampleCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  exampleContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exampleLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  exampleValue: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  exampleHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  savingsAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9D6DF9',
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
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 16,
    flex: 1,
    textAlign: 'left',
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

export default RoundOff;