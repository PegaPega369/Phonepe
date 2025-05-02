import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PROFILE_COLORS, PROFILE_STYLES } from './theme';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    ...PROFILE_STYLES.sectionContainer,
  } as ViewStyle,
  sectionHeader: {
    ...PROFILE_STYLES.sectionHeader,
  } as ViewStyle,
  sectionHeaderText: {
    ...PROFILE_STYLES.sectionHeaderText,
  } as TextStyle,
  sectionContent: {
    // Content styling
  } as ViewStyle,
});

export default ProfileSection;