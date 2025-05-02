import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from '../../screens/theme';

interface ActionButtonsProps {
  primaryText?: string;
  secondaryText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  primaryText = 'Invest Now', 
  secondaryText = 'Add to Watchlist',
  onPrimaryPress,
  onSecondaryPress
}) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.primaryButton} onPress={onPrimaryPress}>
        <LinearGradient
          colors={['#231537', '#4B0082']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.primaryButtonText}>{primaryText}</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryPress}>
        <Text style={styles.secondaryButtonText}>{secondaryText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: `rgba(${parseInt(COLORS.primary.slice(1, 3), 16)}, ${parseInt(COLORS.primary.slice(3, 5), 16)}, ${parseInt(COLORS.primary.slice(5, 7), 16)}, 0.1)`,
    borderWidth: 1,
    borderColor: `rgba(${parseInt(COLORS.primary.slice(1, 3), 16)}, ${parseInt(COLORS.primary.slice(3, 5), 16)}, ${parseInt(COLORS.primary.slice(5, 7), 16)}, 0.2)`,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ActionButtons;