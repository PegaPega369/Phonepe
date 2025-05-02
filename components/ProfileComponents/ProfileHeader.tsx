import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from '../HomeComponents/theme';
import { PROFILE_STYLES } from './theme';

interface ProfileHeaderProps {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  age?: number;
  joinedDate?: string;
}

const { width } = Dimensions.get('window');

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  firstName,
  lastName = '',
  phoneNumber,
  age,
  joinedDate,
}) => {
  // Extract initials from name
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const displayName = lastName ? `${firstName} ${lastName}` : firstName;
  
  // Format additional info if available
  const additionalInfo = [
    age ? `Age ${age}` : null,
    joinedDate ? `Joined ${joinedDate}` : null
  ].filter(Boolean).join(' • ');

  return (
    <LinearGradient
      colors={COLORS.darkPurpleGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerContainer}
    >
      <LinearGradient
        colors={COLORS.darkPurpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileIconGradient}
      >
        <View style={styles.profileIcon}>
          <Text style={styles.profileInitials}>{initials}</Text>
        </View>
      </LinearGradient>
      
      <Text style={styles.profileName}>{displayName}</Text>
      <Text style={styles.profilePhone}>{phoneNumber}</Text>
      {additionalInfo && <Text style={styles.profileInfo}>{additionalInfo}</Text>}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...SHADOWS.medium,
  },
  profileIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primaryLighter,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 15,
  },
  profilePhone: {
    fontSize: 16,
    color: COLORS.textDim,
    marginTop: 5,
  },
  profileInfo: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 3,
  },
});

export default ProfileHeader;