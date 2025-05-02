import React from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SHADOWS } from '../../screens/theme';

interface BackButtonProps {
  onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.backButton} onPress={onPress}>
      <Icon name="chevron-left" size={24} color={COLORS.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
});

export default BackButton;