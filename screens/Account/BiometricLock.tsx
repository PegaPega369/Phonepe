import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Image,
  Animated,
  Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../../components/ProfileComponents/theme';

interface SecurityMethodCardProps {
  title: string;
  icon: string;
  description: string;
  isActive: boolean;
  onToggle: (state: boolean) => void;
}

const SecurityMethodCard: React.FC<SecurityMethodCardProps> = ({ 
  title, 
  icon, 
  description, 
  isActive, 
  onToggle
}) => {
  const scaleAnim = useState(new Animated.Value(1))[0];
  const glowAnim = useState(new Animated.Value(0))[0];
  
  // Store animation references to properly clean up
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  useEffect(() => {
    if (isActive) {
      // Clear any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      // Create a new animation value each time to avoid mixing drivers
      const newGlowAnim = new Animated.Value(0);
      
      // Create and store the new animation using the new animation value
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(newGlowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          }),
          Animated.timing(newGlowAnim, {
            toValue: 0.3,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false
          })
        ])
      );
      
      // Add listener to update the shadow value
      const listener = newGlowAnim.addListener(({value}) => {
        shadowOpacityAnim.setValue(value);
      });
      
      // Start the animation
      animationRef.current.start();
    } else {
      // Stop any running animation
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      // Reset shadow opacity directly
      shadowOpacityAnim.setValue(0);
    }
    
    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isActive, glowAnim]);
  
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
    
    onToggle(!isActive);
  };
  
  // Create a separate animated value for shadow opacity that's JS-driven only
  const shadowOpacityAnim = useState(new Animated.Value(0))[0];
  
  // Update shadow opacity when glow value changes (using listener)
  useEffect(() => {
    const listener = glowAnim.addListener(({value}) => {
      shadowOpacityAnim.setValue(value);
    });
    
    return () => {
      glowAnim.removeListener(listener);
    };
  }, [glowAnim, shadowOpacityAnim]);
  
  const glowStyle = {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: shadowOpacityAnim,
    shadowRadius: 10
  };
  
  return (
    <Animated.View 
      style={[
        styles.securityCard, 
        isActive && styles.activeCard,
        glowStyle,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.securityCardContent}
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
          <Icon name={icon} size={30} color={isActive ? COLORS.text : COLORS.textDim} />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, isActive && styles.activeCardTitle]}>
            {title}
          </Text>
          <Text style={styles.cardDescription}>
            {description}
          </Text>
        </View>
        
        <View style={styles.switchContainer}>
          <Switch
            trackColor={{ 
              false: PROFILE_COLORS.switchTrackInactive, 
              true: PROFILE_COLORS.switchTrackActive 
            }}
            thumbColor={isActive ? PROFILE_COLORS.switchThumbActive : PROFILE_COLORS.switchThumbInactive}
            onValueChange={handlePress}
            value={isActive}
            style={styles.switch}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const BiometricLock: React.FC = () => {
  const navigation = useNavigation();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(true);
  const [isPatternEnabled, setIsPatternEnabled] = useState(false);
  
  // Animation for fingerprint
  const fingerprintPulse = useState(new Animated.Value(1))[0];
  const scanLineAnim = useState(new Animated.Value(0))[0];
  
  // Animation references for proper cleanup
  const pulseAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const scanAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  
  useEffect(() => {
    // Clean up any existing animations
    if (pulseAnimRef.current) {
      pulseAnimRef.current.stop();
    }
    if (scanAnimRef.current) {
      scanAnimRef.current.stop();
    }
    
    if (isBiometricEnabled) {
      // Create and store fingerprint pulse animation
      pulseAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(fingerprintPulse, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(fingerprintPulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      );
      
      // Create and store scan line animation
      scanAnimRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      );
      
      // Start animations
      pulseAnimRef.current.start();
      scanAnimRef.current.start();
    } else {
      // Reset animation values
      fingerprintPulse.setValue(1);
      scanLineAnim.setValue(0);
    }
    
    // Cleanup function
    return () => {
      if (pulseAnimRef.current) {
        pulseAnimRef.current.stop();
      }
      if (scanAnimRef.current) {
        scanAnimRef.current.stop();
      }
    };
  }, [isBiometricEnabled, fingerprintPulse, scanLineAnim]);
  
  StatusBar.setBarStyle('light-content');
  
  // Animation for header entrance
  const headerOpacity = useState(new Animated.Value(0))[0];
  const headerTranslateY = useState(new Animated.Value(-20))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
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
        {/* Heading */}
        <Animated.View style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}>
          <Text style={styles.header}>Biometric Lock</Text>
          <Text style={styles.subheader}>
            Secure your account with advanced authentication
          </Text>
        </Animated.View>
        
        {/* Fingerprint visual */}
        <View style={styles.fingerprintContainer}>
          <Animated.View 
            style={[
              styles.fingerprintBackground,
              { transform: [{ scale: fingerprintPulse }] }
            ]}
          >
            <LinearGradient
              colors={['rgba(138, 43, 226, 0.1)', 'rgba(138, 43, 226, 0.3)']}
              style={styles.fingerprintGradient}
            />
          </Animated.View>
          
          <View style={styles.fingerprintIconContainer}>
            <Icon 
              name="fingerprint" 
              size={80} 
              color={isBiometricEnabled ? COLORS.primary : 'rgba(255, 255, 255, 0.3)'} 
            />
            
            {isBiometricEnabled && (
              <Animated.View 
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      { translateY: scanLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-40, 40]
                      })}
                    ]
                  }
                ]}
              />
            )}
          </View>
        </View>
        
        {/* Authentication options */}
        <View style={styles.securityOptionsContainer}>
          <Text style={styles.sectionTitle}>Authentication Methods</Text>
          
          <SecurityMethodCard
            title="Biometric Authentication"
            icon="fingerprint"
            description="Use your fingerprint or face ID to secure your account"
            isActive={isBiometricEnabled}
            onToggle={setIsBiometricEnabled}
          />
          
          <SecurityMethodCard
            title="PIN Lock"
            icon="dialpad"
            description="Set a secure PIN to protect your account"
            isActive={isPinEnabled}
            onToggle={setIsPinEnabled}
          />
          
          <SecurityMethodCard
            title="Pattern Lock"
            icon="gesture"
            description="Draw a pattern to secure your account access"
            isActive={isPatternEnabled}
            onToggle={setIsPatternEnabled}
          />
        </View>
        
        {/* Security settings */}
        <View style={styles.securitySettings}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Auto-lock after inactivity</Text>
              <Text style={styles.settingDescription}>Automatically lock app after 5 minutes</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textDim} />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Failed attempt limit</Text>
              <Text style={styles.settingDescription}>Lock account after 5 failed attempts</Text>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textDim} />
          </View>
          
          <TouchableOpacity style={styles.resetContainer}>
            <Text style={styles.resetText}>Reset Security Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom Action Button */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={COLORS.purpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>
              Save Settings
            </Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: COLORS.textDim,
    lineHeight: 22,
  },
  fingerprintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 150,
  },
  fingerprintBackground: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  fingerprintGradient: {
    width: '100%',
    height: '100%',
  },
  fingerprintIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: 120,
    height: 2,
    backgroundColor: 'rgba(138, 43, 226, 0.7)',
  },
  securityOptionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  securityCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.2)',
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  activeCard: {
    borderColor: COLORS.primary,
  },
  securityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(35, 21, 55, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  activeCardTitle: {
    color: COLORS.primary,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textDim,
    lineHeight: 18,
  },
  switchContainer: {
    marginLeft: 8,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  securitySettings: {
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.2)',
    ...SHADOWS.small,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: COLORS.textDim,
  },
  resetContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ff6b6b',
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
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
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

export default BiometricLock;