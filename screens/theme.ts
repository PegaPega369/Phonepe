import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Consolidated colors from both themes
export const COLORS = {
  // Background colors
  background: '#000000',
  backgroundDark: '#050505',
  backgroundLight: '#121212',
  
  // Primary colors
  primary: '#A68BD7',
  primaryDark: '#231537',
  primaryLight: '#C9A1FF',
  primaryLighter: '#E9D5FF',
  
  // Secondary colors
  secondary: '#6A4E9C',
  
  // Text colors
  text: '#FFFFFF',
  textDim: '#E0E0E0',
  textMuted: '#9E9E9E',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',
  
  // Card colors
  cardDark: '#0A0A0A',
  cardLight: '#151515',
  
  // Gradients (array of colors)
  purpleGradient: ['#231537', '#4B0082'],
  darkPurpleGradient: ['#1A0E28', '#2A1A4A'],
  lightPurpleGradient: ['#A68BD7', '#C9A1FF'],
  investmentGradient: ['#231537', '#2A1A4A'],
};

// Profile-specific colors
export const PROFILE_COLORS = {
  ...COLORS,
  cardBackground: '#0F0F0F',
  cardBorder: 'rgba(166, 139, 215, 0.3)',
  iconBackground: 'rgba(166, 139, 215, 0.1)',
  switchTrackActive: '#231537',
  switchTrackInactive: '#1A1A1A',
  switchThumbActive: '#A68BD7',
  switchThumbInactive: '#8E8E8E',
  dangerBackground: '#3A1A22',
  dangerText: '#F44336',
  darkPurpleGradient: ['#2A1A4A', '#231537'],
  lightPurpleGradient: ['#A68BD7', '#E9D5FF'],
  textDim: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
};

// Shadow styles
export const SHADOWS = {
  small: {
    shadowColor: '#A68BD7',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#A68BD7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#A68BD7',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

type Styles = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const PROFILE_STYLES: Styles = {
  sectionContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: PROFILE_COLORS.cardBackground,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PROFILE_COLORS.cardBorder,
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(35, 21, 55, 0.5)',
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: '600',
    color: PROFILE_COLORS.primaryLighter,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: PROFILE_COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PROFILE_COLORS.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    color: PROFILE_COLORS.text,
  },
  linkText: {
    fontSize: 14,
    color: PROFILE_COLORS.primaryLight,
    fontWeight: '500',
  },
  gradientButton: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonText: {
    color: PROFILE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 16,
  },
};