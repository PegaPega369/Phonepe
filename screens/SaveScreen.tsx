import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { Svg, Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, RadialGradient, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define interface for asset data
interface AssetInfo {
  name: string;
  currentPrice: string;
  return: string;
  icon: string;
  colors: string[];
  hintText: string;
}

interface AssetDataType {
  [key: string]: AssetInfo;
}

const SaveScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [investmentType, setInvestmentType] = useState('gold');
  
  // Quick amount selection
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<string | null>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const saveButtonAnim = useRef(new Animated.Value(0)).current;

  // Asset data
  const assetData: AssetDataType = {
    gold: {
      name: 'Digital Gold',
      currentPrice: '₹6,242/gram',
      return: '+18.5% (1Y)',
      icon: 'circle',
      colors: ['#FFD700', '#F1C232'],
      hintText: 'Gold has historically been a stable investment during market uncertainty, providing a hedge against inflation.'
    },
    silver: {
      name: 'Digital Silver',
      currentPrice: '₹78/gram',
      return: '+12.3% (1Y)',
      icon: 'disc',
      colors: ['#C0C0C0', '#A7A7AD'],
      hintText: 'Silver has both investment value and industrial applications, making it a versatile addition to your portfolio.'
    },
    mutual: {
      name: 'Mutual Fund',
      currentPrice: 'NAV ₹42.35',
      return: '+15.7% (1Y)',
      icon: 'bar-chart-2',
      colors: ['#4C91F9', '#1557B0'],
      hintText: 'Mutual funds offer diversification and professional management, suitable for long-term wealth creation.'
    }
  };

  // Quick amounts
  const quickAmounts = ['1,000', '5,000', '10,000', '25,000'];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer animation loop
    const runShimmer = () => {
      shimmerAnim.setValue(0);
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start(() => {
        setTimeout(runShimmer, 3000);
      });
    };
    
    runShimmer();

    // Save button animation when amount is entered
    Animated.timing(saveButtonAnim, {
      toValue: amount ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, []);

  // Update save button animation when amount changes
  useEffect(() => {
    Animated.timing(saveButtonAnim, {
      toValue: amount ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [amount]);

  const shimmerPosition = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 1.5],
  });

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleQuickAmountPress = (amount: string) => {
    setSelectedQuickAmount(amount);
    setAmount(amount.replace(/,/g, ''));
  };
  
  // Calculate estimated savings based on daily amount
  const calculateEstimatedSavings = () => {
    const amountValue = parseFloat(amount.replace(/,/g, '')) || 0;
    // 6 months = approximately 180 days
    const estimatedTotal = amountValue * 180;
    return formatAmount(estimatedTotal.toString());
  };
  
  // Handle quick amount selection
  const handleQuickAmountSelection = (value: string) => {
    setSelectedQuickAmount(value);
    setAmount(value);
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid investment amount');
      return;
    }
    
    setSaving(true);
    // Button press animation
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.95,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    setTimeout(() => {
      setSaving(false);
      navigation.navigate('SaveScreen2', { 
        amount: amount,
        investmentType: investmentType,
        note: note
      });
    }, 800);
  };

  const formatAmount = (value: string) => {
    // Format amount with commas for thousands
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    
    // Format with Indian numbering system (lakhs, crores)
    const number = parseInt(numericValue);
    return number.toLocaleString('en-IN');
  };

  // Interpolate background colors for save button
  const buttonBackground = saveButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(100, 100, 100, 0.6)', 'rgba(157, 109, 249, 1)']
  });

  const buttonTextOpacity = saveButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1]
  });

  // Render asset cards
  const renderAssetCards = () => {
    return Object.keys(assetData).map((type) => {
      // Get the primary color for the asset type
      const primaryColor = assetData[type].colors[0];
      
      return (
        <TouchableOpacity 
          key={type}
          style={[
            styles.optionButton,
            investmentType === type && styles.selectedOptionButton,
            // Add colored border when selected
            investmentType === type && {
              borderWidth: 2,
              borderColor: primaryColor,
              borderRadius: 16,
            }
          ]}
          onPress={() => setInvestmentType(type)}
          activeOpacity={0.8}
        >
          <View style={[
            styles.optionGradient,
            { backgroundColor: 'rgba(255, 255, 255, 0.03)' }
          ]}>
            <View style={styles.assetCardContent}>
              {renderAssetIcon(type)}
              <Text style={styles.optionText}>{assetData[type].name}</Text>
              <Text style={styles.assetPrice}>{assetData[type].currentPrice}</Text>
              <View style={[
                styles.assetReturnBadge,
                {backgroundColor: `${primaryColor}20`} // 20 is hex for 12% opacity
              ]}>
                <Text style={[
                  styles.returnText,
                  {color: primaryColor}
                ]}>{assetData[type].return}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    });
  };

  // Render quick amount buttons
  const renderQuickAmountButtons = () => {
    return quickAmounts.map((amount, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.quickAmountButton,
          selectedQuickAmount === amount && styles.selectedQuickAmountButton
        ]}
        onPress={() => handleQuickAmountPress(amount)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={selectedQuickAmount === amount 
            ? ['#9D6DF9', '#6A0DAD'] 
            : ['rgba(50, 50, 50, 0.5)', 'rgba(30, 30, 30, 0.5)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.quickAmountGradient}
        >
          <Text style={[
            styles.quickAmountText,
            selectedQuickAmount === amount && styles.selectedQuickAmountText
          ]}>₹{amount}</Text>
        </LinearGradient>
      </TouchableOpacity>
    ));
  };

  // Render asset icon based on type
  const renderAssetIcon = (type: string) => {
    const asset = assetData[type];
    const isSelected = investmentType === type;
    
    return (
      <View style={styles.iconContainer}>
        <Svg width="60" height="60" viewBox="0 0 60 60">
          {/* Glow effect for selected icons */}
          {isSelected && (
            <RadialGradient 
              id={`glow-${type}`} 
              cx="30" 
              cy="30" 
              rx="30" 
              ry="30" 
              fx="30" 
              fy="30" 
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={asset.colors[0]} stopOpacity="0.7" />
              <Stop offset="1" stopColor={asset.colors[0]} stopOpacity="0" />
            </RadialGradient>
          )}
          
          {/* Icon gradient */}
          <SvgLinearGradient id={`iconGradient-${type}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={asset.colors[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={asset.colors[1]} stopOpacity="1" />
          </SvgLinearGradient>
          
          {/* Glow background circle for selected item */}
          {isSelected && <Circle cx="30" cy="30" r="30" fill={`url(#glow-${type})`} />}
          
          {/* Gold Icon - Gold coin stack */}
          {type === 'gold' && (
            <>
              <Circle cx="30" cy="30" r="22" fill="#000000" opacity="0.3" />
              {/* First coin */}
              <Circle cx="30" cy="38" r="10" fill={`url(#iconGradient-${type})`} />
              {/* Second coin */}
              <Circle cx="30" cy="30" r="10" fill={`url(#iconGradient-${type})`} />
              {/* Top coin */}
              <Circle cx="30" cy="22" r="10" fill={`url(#iconGradient-${type})`} />
              {/* Coin details */}
              <Circle cx="30" cy="22" r="7" fill="#000000" opacity="0.1" />
              <Path 
                d="M27,22H33 M30,19V25" 
                stroke="#FFFFFF" 
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8" 
              />
              {/* Shine effect */}
              <Path 
                d="M25,22A5,3 0 0,0 35,22" 
                stroke="#FFFFFF" 
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7" 
              />
            </>
          )}
          
          {/* Silver Icon - Silver bar with sparkle */}
          {type === 'silver' && (
            <>
              <Circle cx="30" cy="30" r="22" fill="#000000" opacity="0.3" />
              {/* Silver bar */}
              <Rect 
                x="18" y="26" 
                width="24" height="12" 
                rx="2" ry="2"
                fill={`url(#iconGradient-${type})`} 
              />
              {/* Silver bar details */}
              <Rect 
                x="20" y="28" 
                width="20" height="2" 
                fill="#000000" opacity="0.15" 
              />
              <Rect 
                x="20" y="32" 
                width="20" height="2" 
                fill="#000000" opacity="0.15" 
              />
              {/* Sparkle effect */}
              <Path 
                d="M42,24L45,21M42,24L39,21M42,24L42,18M42,24L42,30M42,24L45,27M42,24L39,27" 
                stroke="#FFFFFF" 
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.9"
              />
              <Circle cx="42" cy="24" r="1.5" fill="#FFFFFF" opacity="0.9" />
            </>
          )}
          
          {/* Mutual Fund Icon - Pie chart and growth */}
          {type === 'mutual' && (
            <>
              <Circle cx="30" cy="30" r="22" fill="#000000" opacity="0.3" />
              {/* Pie chart */}
              <Path 
                d="M30,18 A12,12 0 1,1 18,30 L30,30 Z" 
                fill={`url(#iconGradient-${type})`} 
              />
              <Path 
                d="M30,18 A12,12 0 0,1 42,30 L30,30 Z" 
                fill={asset.colors[0]}
                opacity="0.8"
              />
              <Path 
                d="M30,30 A12,12 0 0,1 18,30 A12,12 0 0,1 30,42 Z" 
                fill={asset.colors[1]}
                opacity="0.6"
              />
              {/* Growth arrow */}
              <Path 
                d="M48,25L48,15L38,15" 
                stroke={asset.colors[0]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path 
                d="M48,15L40,23" 
                stroke={asset.colors[0]}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </>
          )}
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Background Container */}
      <View style={styles.backgroundGradient}>
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }] 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Investment</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="info" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <Animated.View
            style={[
              styles.balanceCard,
              { 
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: cardScale }
                ] 
              }
            ]}
          >
            <LinearGradient
              colors={['#231537', '#4B0082']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.balanceGradient}
            >
              <View style={styles.shineOverlay}>
                <Animated.View 
                  style={[
                    styles.shimmerEffect,
                    { transform: [{ translateX: shimmerPosition }] }
                  ]}
                >
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0)',
                      'rgba(255,255,255,0.05)',
                      'rgba(255,255,255,0.1)',
                      'rgba(255,255,255,0.05)',
                      'rgba(255,255,255,0)'
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.shimmerGradient}
                  />
                </Animated.View>
              </View>
              
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <View style={[styles.secureIndicator, {backgroundColor: 'rgba(255, 255, 255, 0.1)'}]}>
                  <Icon name="shield" size={14} color="#FFFFFF" />
                  <Text style={[styles.secureText, {color: '#FFFFFF'}]}>Secure</Text>
                </View>
              </View>
              
              <Text style={styles.balanceAmount}>
                ₹78,432
              </Text>
              
              <View style={styles.balanceFooter}>
                <View style={styles.growthBadge}>
                  <Icon name="trending-up" size={14} color="#4AFF8C" />
                  <Text style={styles.growthText}>+15.2% this month</Text>
                </View>
                
                <TouchableOpacity style={styles.portfolioLink}>
                  <Text style={[styles.portfolioText, {color: '#FFFFFF'}]}>View Portfolio</Text>
                  <Icon name="chevron-right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Asset Selection */}
          <Animated.View
            style={[
              styles.sectionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Select Asset</Text>
              <TouchableOpacity style={[styles.compareButton, {backgroundColor: 'rgba(255, 255, 255, 0.05)'}]}>
                <Icon name="bar-chart-2" size={14} color="#FFFFFF" style={styles.compareIcon} />
                <Text style={[styles.compareButtonText, {color: '#FFFFFF'}]}>Compare Returns</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.assetCardsContainer}>
              {renderAssetCards()}
            </View>
          </Animated.View>

          {/* Amount Input */}
          <Animated.View 
            style={[
              styles.sectionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            
            {/* Amount Input Section */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>
              Amount you want to invest in {assetData[investmentType].name}
            </Text>
            
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
                value={formatAmount(amount)}
                onChangeText={(value) => {
                  // Remove commas before storing
                  setAmount(value.replace(/,/g, ''));
                }}
                selectionColor="#8A2BE2"
              />
            </LinearGradient>
          </View>
          
          {/* Quick Options */}
          <View style={styles.quickOptionsSection}>
            <Text style={styles.quickOptionsLabel}>Quick Select</Text>
            
            <View style={styles.optionsContainer}>
              <View style={styles.optionsRow}>
                {['20', '30', '50'].map((amount) => {
                  const isSelected = amount === selectedQuickAmount;
                  
                  return (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.optionButton,
                        isSelected && styles.selectedOptionButton,
                      ]}
                      onPress={() => handleQuickAmountSelection(amount)}
                    >
                      <LinearGradient
                        colors={isSelected 
                          ? ['#4B0082', '#231537'] 
                          : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.optionGradientButton,
                          isSelected && { borderColor: '#4B0082' }
                        ]}
                      >
                        <Text style={styles.optionText}>₹{amount}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <View style={styles.optionsRowCentered}>
                {['100', '200'].map((amount) => {
                  const isSelected = amount === selectedQuickAmount;
                  
                  return (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.optionButton,
                        styles.largeOptionButton,
                        isSelected && styles.selectedOptionButton,
                      ]}
                      onPress={() => handleQuickAmountSelection(amount)}
                    >
                      <LinearGradient
                        colors={isSelected 
                          ? ['#4B0082', '#231537'] 
                          : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.optionGradientButton,
                          isSelected && { borderColor: '#4B0082' }
                        ]}
                      >
                        <Text style={styles.optionText}>₹{amount}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

            {/* Asset Info Box */}
            <View style={styles.assetInfoBox}>
              <View style={styles.assetInfoIcon}>
                <Icon name="info" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.assetInfoText}>
                {assetData[investmentType].hintText}
              </Text>
            </View>

            {/* Notes Input */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes (Optional)</Text>
              <View style={styles.notesInputContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note about this investment..."
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          </Animated.View>
          
          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button - Fixed at Bottom */}
      <View style={styles.saveButtonContainer}>
        <LinearGradient
          colors={['#231537', '#4B0082']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 12 }}
        >
          <TouchableOpacity 
            style={styles.proceedButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.proceedButtonText}>
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#000000',
    zIndex: 10,
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
  infoButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4B0082',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  balanceGradient: {
    padding: 20,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmerEffect: {
    width: SCREEN_WIDTH * 2, 
    height: '100%',
    position: 'absolute',
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secureIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  secureText: {
    fontSize: 12,
    color: '#9D6DF9',
    marginLeft: 4,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 12,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 255, 140, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 12,
    color: '#4AFF8C',
    marginLeft: 4,
    fontWeight: '500',
  },
  portfolioLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioText: {
    fontSize: 14,
    color: '#9D6DF9',
    marginRight: 4,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  inputDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compareIcon: {
    marginRight: 4,
  },
  compareButtonText: {
    fontSize: 12,
    color: '#9D6DF9',
    fontWeight: '500',
  },
  assetCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  optionButton: {
    width: (SCREEN_WIDTH - 48) / 3,
    marginHorizontal: 2,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedOptionButton: {
    transform: [{ scale: 1.05 }],
  },
  optionGradient: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  assetCardContent: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  assetPrice: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 6,
  },
  assetReturnBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  returnText: {
    color: '#4AFF8C',
    fontSize: 11,
    fontWeight: '600',
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
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 0,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  quickAmountButton: {
    width: (SCREEN_WIDTH - 48) / 4 - 4,
    marginHorizontal: 2,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedQuickAmountButton: {
    transform: [{ scale: 1.05 }],
  },
  quickAmountGradient: {
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedQuickAmountText: {
    color: '#FFFFFF',
  },
  amountSection: {
    marginBottom: 24,
  },
  perDayText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  estimatedContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  estimatedLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  estimatedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4AFF8C',
  },
  quickOptionsSection: {
    marginBottom: 24,
  },
  quickOptionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionsRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  largeOptionButton: {
    width: (SCREEN_WIDTH - 48) / 2 - 8,
    marginHorizontal: 4,
  },
  optionGradientButton: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  assetInfoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  assetInfoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  assetInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
    lineHeight: 18,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  notesInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  notesInput: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  bottomSpacer: {
    height: 100,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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

export default SaveScreen;