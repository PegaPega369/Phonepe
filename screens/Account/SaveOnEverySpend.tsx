import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../../components/ProfileComponents/theme';

const SaveOnEverySpend: React.FC = () => {
  const navigation = useNavigation();
  const [isRoundUpEnabled, setIsRoundUpEnabled] = useState(false);
  
  StatusBar.setBarStyle('light-content');

  // Animation values
  const [animationVisible, setAnimationVisible] = useState(false);
  const animatedValues = {
    spend: new Animated.Value(0),
    arrow: new Animated.Value(0),
    save: new Animated.Value(0)
  };
  
  // Example round-up options
  const roundUpOptions = [
    { label: 'Nearest ₹10', value: 10 },
    { label: 'Nearest ₹20', value: 20 },
    { label: 'Nearest ₹50', value: 50 },
    { label: 'Nearest ₹100', value: 100 }
  ];
  
  const [selectedRoundUpOption, setSelectedRoundUpOption] = useState(10);
  
  // Example transactions that would be rounded up (Indian context)
  const exampleTransactions = [
    { merchant: 'Chai Tapri', amount: '₹12', roundUp: '₹8', icon: 'tea' },
    { merchant: 'Swiggy Order', amount: '₹378', roundUp: '₹22', icon: 'food' },
    { merchant: 'Reliance Fresh', amount: '₹582', roundUp: '₹18', icon: 'cart' },
    { merchant: 'Ola Ride', amount: '₹149', roundUp: '₹51', icon: 'car-side' }
  ];
  
  // Animation sequence for the example animation
  useEffect(() => {
    if (animationVisible) {
      // Reset animation values
      Object.values(animatedValues).forEach(value => value.setValue(0));
      
      // Sequence the animations
      Animated.sequence([
        // Fade in spend
        Animated.timing(animatedValues.spend, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        // Pause
        Animated.delay(500),
        // Arrow animation
        Animated.timing(animatedValues.arrow, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true
        }),
        // Fade in save
        Animated.timing(animatedValues.save, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        // Delay before repeating
        Animated.delay(2000)
      ]).start(() => {
        // If component is still mounted, play animation again
        setAnimationVisible(false);
        setTimeout(() => setAnimationVisible(true), 500);
      });
    }
  }, [animationVisible]);
  
  // Start animation when component mounts
  useEffect(() => {
    setAnimationVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={COLORS.darkPurpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Round-Up Savings</Text>
              <Text style={styles.heroSubtitle}>
                Turn spare change from everyday purchases into investment gold
              </Text>
            </View>
            <View style={styles.coinImages}>
              <View style={[styles.coinCircle, styles.coinLarge]}>
                <Icon name="chart-line-variant" size={34} color={COLORS.primary} />
              </View>
              <View style={[styles.coinCircle, styles.coinSmall, styles.coinOverlap]}>
                <Icon name="currency-inr" size={18} color={COLORS.primary} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main toggle card */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleHeader}>
            <View style={styles.toggleLeft}>
              <Icon name="currency-inr" size={22} color={isRoundUpEnabled ? COLORS.primary : COLORS.textMuted} />
              <Text style={styles.toggleLabel}>Round-Up Spare Change</Text>
            </View>

            <Switch
              trackColor={{ 
                false: PROFILE_COLORS.switchTrackInactive, 
                true: PROFILE_COLORS.switchTrackActive 
              }}
              thumbColor={isRoundUpEnabled ? PROFILE_COLORS.switchThumbActive : PROFILE_COLORS.switchThumbInactive}
              onValueChange={() => setIsRoundUpEnabled(!isRoundUpEnabled)}
              value={isRoundUpEnabled}
              style={styles.switch}
            />
          </View>
          
          <Text style={styles.toggleDescription}>
            {isRoundUpEnabled 
              ? "We'll round up your transactions to the nearest rupee and invest the difference."
              : "Enable to automatically invest spare change from your transactions."}
          </Text>
        </View>

        {/* How it works section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.workingSteps}>
            <View style={styles.step}>
              <View style={styles.stepIconContainer}>
                <Icon name="shopping" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Make a purchase</Text>
                <Text style={styles.stepDescription}>Use your linked payment methods for everyday spending</Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.step}>
              <View style={styles.stepIconContainer}>
                <Icon name="cash-multiple" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>We round up to the nearest ₹</Text>
                <Text style={styles.stepDescription}>The difference is calculated automatically</Text>
              </View>
            </View>

            <View style={styles.stepDivider} />

            <View style={styles.step}>
              <View style={styles.stepIconContainer}>
                <Icon name="gold" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Spare change is invested</Text>
                <Text style={styles.stepDescription}>Automatically converted to digital gold in your account</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Example transactions */}
        {isRoundUpEnabled && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Example Round-Ups</Text>
            <Text style={styles.sectionDescription}>Here's how your transactions would be rounded</Text>
            
            <View style={styles.transactionList}>
              {exampleTransactions.map((transaction, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      <Icon name={transaction.icon} size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.merchantName}>{transaction.merchant}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>{transaction.amount}</Text>
                    <View style={styles.roundUpBadge}>
                      <Text style={styles.roundUpText}>+{transaction.roundUp}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Animation demo */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>See How It Works</Text>
          
          <View style={styles.animationContainer}>
            {animationVisible && (
              <>
                <Animated.View 
                  style={[
                    styles.animationItem, 
                    { 
                      opacity: animatedValues.spend,
                      transform: [{ translateY: animatedValues.spend.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })}]
                    }
                  ]}
                >
                  <View style={styles.animationIconContainer}>
                    <Icon name="tea" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.animationContent}>
                    <Text style={styles.animationTitle}>Spend ₹12 on chai</Text>
                  </View>
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.animationArrow,
                    {
                      opacity: animatedValues.arrow,
                      transform: [
                        { translateY: animatedValues.arrow.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 10, 0]
                        })}
                      ]
                    }
                  ]}
                >
                  <Icon name="arrow-down" size={28} color={COLORS.primary} />
                </Animated.View>
                
                <Animated.View 
                  style={[
                    styles.animationItem, 
                    { 
                      opacity: animatedValues.save,
                      transform: [{ translateY: animatedValues.save.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })}]
                    }
                  ]}
                >
                  <View style={[styles.animationIconContainer, styles.saveIconContainer]}>
                    <Icon name="plus" size={12} color={COLORS.text} />
                    <Icon name="gold" size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.animationContent}>
                    <Text style={styles.animationTitle}>Save ₹8 in Gold</Text>
                    <Text style={styles.animationSubtitle}>Rounded up to ₹20</Text>
                  </View>
                </Animated.View>
              </>
            )}
          </View>
        </View>
        
        {/* Round-up options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Round-up Options</Text>
          <Text style={styles.sectionDescription}>Choose how you want to round up your purchases</Text>
          
          <View style={styles.roundUpOptionsContainer}>
            {roundUpOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.roundUpOption,
                  selectedRoundUpOption === option.value && styles.selectedRoundUpOption
                ]}
                onPress={() => setSelectedRoundUpOption(option.value)}
                disabled={!isRoundUpEnabled}
              >
                <LinearGradient
                  colors={selectedRoundUpOption === option.value ? 
                    COLORS.purpleGradient : 
                    ['rgba(35, 21, 55, 0.2)', 'rgba(35, 21, 55, 0.1)']}
                  style={styles.roundUpOptionGradient}
                >
                  <Text 
                    style={[
                      styles.roundUpOptionText,
                      selectedRoundUpOption === option.value && styles.selectedRoundUpOptionText,
                      !isRoundUpEnabled && styles.disabledOptionText
                    ]}
                  >
                    {option.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.bottomAction}>
        <View style={styles.savingsPreview}>
          <Text style={styles.savingsTitle}>Potential yearly savings</Text>
          <Text style={styles.savingsAmount}>~ ₹2,500</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={COLORS.purpleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isRoundUpEnabled ? 'Update Settings' : 'Get Started'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 160,
  },
  heroSection: {
    marginBottom: 24,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  heroGradient: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroContent: {
    flex: 2,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textDim,
    lineHeight: 22,
  },
  coinImages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  coinCircle: {
    backgroundColor: 'rgba(35, 21, 55, 0.8)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  coinLarge: {
    width: 70,
    height: 70,
  },
  coinSmall: {
    width: 40,
    height: 40,
  },
  coinOverlap: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  toggleCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.3)',
    ...SHADOWS.small,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  toggleDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    marginTop: 4,
    paddingLeft: 30,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.2)',
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    marginBottom: 16,
  },
  workingSteps: {
    marginTop: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(35, 21, 55, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
  },
  stepDivider: {
    height: 20,
    width: 1,
    backgroundColor: 'rgba(106, 78, 156, 0.3)',
    marginLeft: 20,
    marginBottom: 16,
  },
  transactionList: {
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 78, 156, 0.1)',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(35, 21, 55, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDim,
    marginBottom: 4,
  },
  roundUpBadge: {
    backgroundColor: 'rgba(106, 78, 156, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roundUpText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Animation styles
  animationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  animationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(35, 21, 55, 0.4)',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    marginBottom: 10,
    ...SHADOWS.small,
  },
  animationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(35, 21, 55, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.5)',
  },
  saveIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationContent: {
    flex: 1,
  },
  animationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  animationSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  animationArrow: {
    marginVertical: 5,
    padding: 8,
  },
  // Round-up options styles
  roundUpOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roundUpOption: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.15)',
  },
  selectedRoundUpOption: {
    borderColor: COLORS.primary,
    ...SHADOWS.small,
  },
  roundUpOptionGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10, 
  },
  roundUpOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textDim,
  },
  selectedRoundUpOptionText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  disabledOptionText: {
    color: COLORS.textMuted,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  savingsPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  savingsTitle: {
    fontSize: 15,
    color: COLORS.textDim,
  },
  savingsAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SaveOnEverySpend;