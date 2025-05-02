import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../../components/ProfileComponents/theme';

const PermissionItem = ({ 
  icon, 
  title, 
  description, 
  isEnabled, 
  onToggle,
  iconBackground
}) => {
  // Animation for toggle effect
  const scaleAnim = useState(new Animated.Value(1))[0];
  
  const handleToggle = () => {
    // Play scale animation when toggled
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
    
    onToggle(!isEnabled);
  };
  
  return (
    <Animated.View 
      style={[
        styles.permissionCard,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.permissionContent}
        activeOpacity={0.7}
        onPress={handleToggle}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconBackground }]}>
          <Icon name={icon} size={24} color={COLORS.text} />
        </View>
        
        <View style={styles.permissionDetails}>
          <Text style={styles.permissionTitle}>{title}</Text>
          <Text style={styles.permissionDescription}>{description}</Text>
        </View>
        
        <Switch
          trackColor={{ 
            false: PROFILE_COLORS.switchTrackInactive, 
            true: PROFILE_COLORS.switchTrackActive 
          }}
          thumbColor={isEnabled ? PROFILE_COLORS.switchThumbActive : PROFILE_COLORS.switchThumbInactive}
          onValueChange={handleToggle}
          value={isEnabled}
          style={styles.switch}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Permissions: React.FC = () => {
  const navigation = useNavigation();
  
  // Permission states
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  const [isContactsEnabled, setIsContactsEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  
  // Header animation
  const headerOpacity = useState(new Animated.Value(0))[0];
  const headerTranslateY = useState(new Animated.Value(-20))[0];
  
  React.useEffect(() => {
    // Animate header when component mounts
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
  
  StatusBar.setBarStyle('light-content');
  
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
          <Text style={styles.header}>Permissions</Text>
          <Text style={styles.subheader}>
            Control which features can access your device
          </Text>
        </Animated.View>
        
        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          <PermissionItem 
            icon="map-marker"
            title="Location Access"
            description="Allow app to access your current location for nearest services"
            isEnabled={isLocationEnabled}
            onToggle={setIsLocationEnabled}
            iconBackground="rgba(232, 93, 117, 0.2)"
          />
          
          <PermissionItem 
            icon="bell"
            title="Push Notifications"
            description="Receive alerts about price changes and investment opportunities"
            isEnabled={isNotificationsEnabled}
            onToggle={setIsNotificationsEnabled}
            iconBackground="rgba(138, 43, 226, 0.2)"
          />
          
          <PermissionItem 
            icon="fingerprint"
            title="Biometric Authentication"
            description="Use fingerprint or face ID to secure your account"
            isEnabled={isBiometricsEnabled}
            onToggle={setIsBiometricsEnabled}
            iconBackground="rgba(66, 165, 245, 0.2)"
          />
          
          <PermissionItem 
            icon="contacts"
            title="Contact Access"
            description="Access your contacts to easily send and receive money"
            isEnabled={isContactsEnabled}
            onToggle={setIsContactsEnabled}
            iconBackground="rgba(76, 175, 80, 0.2)"
          />
          
          <PermissionItem 
            icon="camera"
            title="Camera Access"
            description="Use your camera to scan QR codes and documents"
            isEnabled={isCameraEnabled}
            onToggle={setIsCameraEnabled}
            iconBackground="rgba(255, 179, 0, 0.2)"
          />
        </View>
        
        {/* Privacy Policy Section */}
        <View style={styles.policyContainer}>
          <View style={styles.divider} />
          <Text style={styles.policyTitle}>Privacy Matters</Text>
          <Text style={styles.policyText}>
            We respect your privacy and only use permissions to provide specific features.
            Your data is securely encrypted and never shared with third parties without your consent.
          </Text>
          <TouchableOpacity style={styles.policyLink}>
            <Text style={styles.policyLinkText}>Read Our Privacy Policy</Text>
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
              Save Preferences
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
    marginBottom: 24,
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
  permissionsContainer: {
    paddingHorizontal: 16,
  },
  permissionCard: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.2)',
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionDetails: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 13,
    color: COLORS.textDim,
    lineHeight: 18,
    paddingRight: 8,
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  policyContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(106, 78, 156, 0.3)',
    borderRadius: 2,
    marginBottom: 24,
  },
  policyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  policyText: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  policyLink: {
    paddingVertical: 8,
  },
  policyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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

export default Permissions;