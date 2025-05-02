import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Global Colors
export const COLORS = {
  // Base backgrounds
  background: '#000000',
  backgroundDark: '#050505',
  backgroundLight: '#121212',

  // Primary tones
  primary: '#A68BD7',
  primaryDark: '#231537',
  primaryLight: '#C9A1FF',
  primaryLighter: '#E9D5FF',

  // Accent / secondary
  secondary: '#6A4E9C',

  // Text colors
  text: '#FFFFFF',
  textDim: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',

  // Status indicators
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FFC107',
  info: '#2196F3',

  // Cards / Surfaces
  cardDark: '#0A0A0A',
  cardLight: '#151515',

  // Gradients
  purpleGradient: ['#231537', '#4B0082'],
  darkPurpleGradient: ['#1A0E28', '#2A1A4A'],
  lightPurpleGradient: ['#A68BD7', '#C9A1FF'],
  investmentGradient: ['#231537', '#2A1A4A'],
};

// Profile-specific overrides
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
  dangerText: COLORS.error,
};

// Shadow presets
export const SHADOWS = {
  small: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Shared profile UI style presets
export const PROFILE_STYLES = {
  sectionContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: PROFILE_COLORS.cardBackground,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.cardBorder,
    ...SHADOWS.small,
  } as ViewStyle,

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(35, 21, 55, 0.5)',
  } as ViewStyle,

  sectionHeaderText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: PROFILE_COLORS.text,
  } as TextStyle,

  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: PROFILE_COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  } as ViewStyle,

  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PROFILE_COLORS.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  } as ViewStyle,

  optionText: {
    fontSize: 16,
    color: PROFILE_COLORS.text,
  } as TextStyle,

  linkText: {
    fontSize: 14,
    color: PROFILE_COLORS.primaryLight,
    fontWeight: '500' as const,
  } as TextStyle,

  gradientButton: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden' as const,
    ...SHADOWS.medium,
  } as ViewStyle,

  buttonText: {
    color: PROFILE_COLORS.text,
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    paddingVertical: 16,
  } as TextStyle,
};
