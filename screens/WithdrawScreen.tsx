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
  Easing,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop, RadialGradient, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [assetType, setAssetType] = useState('gold'); // 'gold', 'silver', or 'mutual'
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [focusedAsset, setFocusedAsset] = useState(null);
  const [amountError, setAmountError] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const balanceCardScale = useRef(new Animated.Value(0.9)).current;
  const modalFade = useRef(new Animated.Value(0)).current;

  // Sample asset balances
  const assetBalances = {
    gold: { 
      balance: '₹12,450', 
      growth: '+8.4%',
      purchasePrice: '₹5,800/gram',
      currentPrice: '₹6,290/gram',
      quantity: '1.98 grams',
      lastUpdated: '2 hours ago'
    },
    silver: { 
      balance: '₹8,200', 
      growth: '+5.2%',
      purchasePrice: '₹68/gram',
      currentPrice: '₹72/gram',
      quantity: '113.88 grams',
      lastUpdated: '2 hours ago'
    },
    mutual: { 
      balance: '₹4,200', 
      growth: '+3.1%',
      purchasePrice: 'NAV ₹35.20',
      currentPrice: 'NAV ₹36.30',
      quantity: '115.70 units',
      lastUpdated: '24 hours ago'
    }
  };

  // Asset data with colors, etc.
  const assetData = {
    gold: {
      name: 'Digital Gold',
      colors: ['#FFD700', '#F1C232'],
      textColor: '#FFD700',
      hintText: 'Gold has historically been a stable investment during market uncertainty.'
    },
    silver: {
      name: 'Digital Silver',
      colors: ['#C0C0C0', '#A7A7AD'],
      textColor: '#C0C0C0',
      hintText: 'Silver has both investment value and industrial applications.'
    },
    mutual: {
      name: 'Mutual Fund',
      colors: ['#4C91F9', '#1557B0'],
      textColor: '#4C91F9',
      hintText: 'Mutual funds offer diversification and professional management.'
    }
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
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
  }, []);

  const shimmerPosition = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 1.5],
  });

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
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

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    
    setProcessing(true);
    
    // Button animation
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
      setProcessing(false);
      navigation.goBack();
    }, 1500);
  };

  const formatAmount = (value: string) => {
    // Format amount with commas for thousands
    if (!value) return '';
    const numericValue = value.replace(/,/g, '');
    
    // Format with Indian numbering system (lakhs, crores)
    const number = parseInt(numericValue);
    return number ? number.toLocaleString('en-IN') : '';
  };

  // Render asset icons
  const renderAssetIcon = (type: string) => {
    const isSelected = type === assetType;
    const colors = assetData[type].colors;
    
    return (
      <View style={styles.iconContainer}>
        <Svg width="50" height="50" viewBox="0 0 50 50">
          {/* Icon gradient */}
          <SvgLinearGradient id={`iconGradient-${type}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={colors[1]} stopOpacity="1" />
          </SvgLinearGradient>
          
          {/* Gold Icon - Gold coin stack */}
          {type === 'gold' && (
            <>
              <Circle cx="25" cy="25" r="18" fill="#000000" opacity="0.3" />
              {/* First coin */}
              <Circle cx="25" cy="31" r="8" fill={`url(#iconGradient-${type})`} />
              {/* Second coin */}
              <Circle cx="25" cy="25" r="8" fill={`url(#iconGradient-${type})`} />
              {/* Top coin */}
              <Circle cx="25" cy="19" r="8" fill={`url(#iconGradient-${type})`} />
              {/* Coin details */}
              <Circle cx="25" cy="19" r="6" fill="#000000" opacity="0.1" />
              <Path 
                d="M22,19H28 M25,16V22" 
                stroke="#FFFFFF" 
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8" 
              />
            </>
          )}
          
          {/* Silver Icon - Silver bar with sparkle */}
          {type === 'silver' && (
            <>
              <Circle cx="25" cy="25" r="18" fill="#000000" opacity="0.3" />
              {/* Silver bar */}
              <Rect 
                x="15" y="22" 
                width="20" height="10" 
                rx="2" ry="2"
                fill={`url(#iconGradient-${type})`} 
              />
              {/* Silver bar details */}
              <Rect 
                x="17" y="24" 
                width="16" height="1.5" 
                fill="#000000" opacity="0.15" 
              />
              <Rect 
                x="17" y="28" 
                width="16" height="1.5" 
                fill="#000000" opacity="0.15" 
              />
              {/* Sparkle effect */}
              <Path 
                d="M36,21L38,19M36,21L34,19M36,21L36,17M36,21L36,25M36,21L38,23M36,21L34,23" 
                stroke="#FFFFFF" 
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.9"
              />
            </>
          )}
          
          {/* Mutual Fund Icon - Pie chart and growth */}
          {type === 'mutual' && (
            <>
              <Circle cx="25" cy="25" r="18" fill="#000000" opacity="0.3" />
              {/* Pie chart */}
              <Path 
                d="M25,15 A10,10 0 1,1 15,25 L25,25 Z" 
                fill={`url(#iconGradient-${type})`} 
              />
              <Path 
                d="M25,15 A10,10 0 0,1 35,25 L25,25 Z" 
                fill={colors[0]}
                opacity="0.8"
              />
              <Path 
                d="M25,25 A10,10 0 0,1 15,25 A10,10 0 0,1 25,35 Z" 
                fill={colors[1]}
                opacity="0.6"
              />
              {/* Growth arrow */}
              <Path 
                d="M39,21L39,12L30,12" 
                stroke={colors[0]}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path 
                d="M39,12L32,19" 
                stroke={colors[0]}
                strokeWidth="2"
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <TouchableOpacity 
          style={styles.infoButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Icon name="info" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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
            <Text style={styles.inputLabel}>TAP AN ASSET TO SELECT</Text>
            
            <View style={styles.assetCards}>
              {['gold', 'silver', 'mutual'].map((type) => {
                const isSelected = type === assetType;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.assetCard,
                      isSelected && styles.selectedAssetCard,
                      isSelected && { borderColor: assetData[type].colors[0] }
                    ]}
                    onPress={() => {
                      setAssetType(type);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.assetCardContent}>
                      {renderAssetIcon(type)}
                      <Text style={styles.assetTitle}>{assetData[type].name}</Text>
                      <Text style={styles.assetBalance}>{assetBalances[type].balance}</Text>
                      <View style={[
                        styles.assetReturnBadge,
                        {backgroundColor: `${assetData[type].colors[0]}15`} // 15 is hex for 8% opacity
                      ]}>
                        <Text style={[
                          styles.returnText,
                          {color: assetData[type].colors[0]}
                        ]}>{assetBalances[type].growth}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => {
                setFocusedAsset(assetType);
                setShowBalanceModal(true);
                
                // Animate the modal
                Animated.timing(modalFade, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                
                Animated.spring(balanceCardScale, {
                  toValue: 1,
                  friction: 6,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <View style={styles.viewDetailsContent}>
                <Icon name="info" size={16} color="#9D6DF9" />
                <Text style={styles.viewDetailsText}>View Asset Details</Text>
              </View>
            </TouchableOpacity>
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
            <Text style={styles.inputLabel}>WITHDRAWAL AMOUNT</Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                value={amount}
                onChangeText={(value) => setAmount(value)}
                selectionColor="#8A2BE2"
              />
            </View>
            <View style={styles.inputDivider} />

            {/* Info message */}
            <View style={styles.infoMessageContainer}>
              <Icon name="alert-circle" size={16} color={assetData[assetType].colors[0]} />
              <Text style={[styles.infoMessage, {color: assetData[assetType].textColor}]}>
                Maximum withdrawal limit: {assetBalances[assetType].balance}
              </Text>
            </View>
          </Animated.View>

          {/* Note Input */}
          <Animated.View
            style={[
              styles.sectionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <Text style={styles.inputLabel}>NOTES (OPTIONAL)</Text>
            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note about this withdrawal..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
              />
            </View>
          </Animated.View>

          {/* Info Box */}
          <Animated.View
            style={[
              styles.sectionContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.infoBox}>
              <Icon name="info" size={18} color="#FFFFFF" style={styles.infoBoxIcon} />
              <Text style={styles.infoBoxText}>
                {assetData[assetType].hintText} Withdrawals typically process within 24 hours.
              </Text>
            </View>
          </Animated.View>
          
          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Withdraw Button - Fixed at Bottom */}
      <View style={styles.withdrawButtonContainer}>
        <TouchableOpacity
          onPress={handleWithdraw}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={processing || !amount}
          activeOpacity={0.8}
        >
          <Animated.View 
            style={[
              styles.withdrawButton,
              { 
                transform: [{ scale: buttonScale }],
                opacity: amount ? 1 : 0.6
              }
            ]}
          >
            <LinearGradient
              colors={['#9D6DF9', '#4B0082']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
            >
              {processing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Icon name="arrow-down-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.withdrawButtonText}>Withdraw Now</Text>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Balance Detail Modal */}
      <Modal
        transparent={true}
        visible={showBalanceModal}
        animationType="none"
        onRequestClose={() => {
          // Reset animation values
          modalFade.setValue(0);
          balanceCardScale.setValue(0.9);
          setShowBalanceModal(false);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            // Animate out
            Animated.parallel([
              Animated.timing(modalFade, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.spring(balanceCardScale, {
                toValue: 0.9,
                friction: 6,
                useNativeDriver: true,
              })
            ]).start(() => setShowBalanceModal(false));
          }}
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                opacity: modalFade,
                transform: [{ scale: balanceCardScale }],
              }
            ]}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {focusedAsset && (
                <LinearGradient
                  colors={['#231537', '#4B0082']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.balanceDetailCard}
                >
                  <View style={styles.balanceDetailHeader}>
                    <Text style={styles.balanceDetailTitle}>
                      {assetData[focusedAsset].name} Details
                    </Text>
                    <TouchableOpacity 
                      onPress={() => {
                        // Animate out
                        Animated.parallel([
                          Animated.timing(modalFade, {
                            toValue: 0,
                            duration: 250,
                            useNativeDriver: true,
                          }),
                          Animated.spring(balanceCardScale, {
                            toValue: 0.9,
                            friction: 6,
                            useNativeDriver: true,
                          })
                        ]).start(() => setShowBalanceModal(false));
                      }}
                      style={styles.closeButton}
                    >
                      <Icon name="x" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailIconContainer}>
                    {renderAssetIcon(focusedAsset)}
                  </View>

                  <View style={styles.balanceDetailLarge}>
                    <Text style={styles.balanceDetailLabel}>AVAILABLE BALANCE</Text>
                    <Text style={styles.balanceDetailAmount}>
                      {assetBalances[focusedAsset].balance}
                    </Text>
                    <View style={styles.growthBadge}>
                      <Icon name="trending-up" size={14} color="#4AFF8C" />
                      <Text style={styles.growthText}>{assetBalances[focusedAsset].growth}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRows}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Purchase Price</Text>
                      <Text style={styles.detailValue}>{assetBalances[focusedAsset].purchasePrice}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Current Price</Text>
                      <Text style={styles.detailValue}>{assetBalances[focusedAsset].currentPrice}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quantity</Text>
                      <Text style={styles.detailValue}>{assetBalances[focusedAsset].quantity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Last Updated</Text>
                      <Text style={styles.detailValue}>{assetBalances[focusedAsset].lastUpdated}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.withdrawNowButton}
                    onPress={() => {
                      // Close modal and set amount
                      const numericBalance = parseFloat(assetBalances[focusedAsset].balance.replace(/[^0-9.]/g, ''));
                      setAmount(numericBalance.toString());
                      setShowBalanceModal(false);
                    }}
                  >
                    <LinearGradient
                      colors={['#9D6DF9', '#4B0082']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.withdrawNowGradient}
                    >
                      <Text style={styles.withdrawNowText}>Withdraw Full Amount</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
  inputLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  assetCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  assetCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    height: 140,
  },
  selectedAssetCard: {
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ scale: 1.02 }],
  },
  assetCardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  assetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  assetBalance: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 6,
    textAlign: 'center',
  },
  assetReturnBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '500',
    color: '#FFFFFF',
    marginRight: 8,
  },
  infoButtonContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
  },
  infoIcon: {
    padding: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewDetailsButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.5)',
    backgroundColor: 'rgba(157, 109, 249, 0.08)',
  },
  viewDetailsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#9D6DF9',
    fontWeight: '500',
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 0,
  },
  inputDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 6,
    marginBottom: 16,
  },
  infoMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoMessage: {
    fontSize: 12,
    marginLeft: 6,
  },
  noteInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noteInput: {
    fontSize: 15,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    padding: 0,
    height: 80,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    alignItems: 'flex-start',
  },
  infoBoxIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bottomSpacer: {
    height: 100,
  },
  withdrawButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  withdrawButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#4B0082',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      }
    }),
  },
  balanceDetailCard: {
    padding: 24,
    borderRadius: 20,
  },
  balanceDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  detailIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceDetailLarge: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceDetailLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  balanceDetailAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  detailRows: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  withdrawNowButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  withdrawNowGradient: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  withdrawNowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default WithdrawScreen;