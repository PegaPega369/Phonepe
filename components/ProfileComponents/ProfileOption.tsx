
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from './theme';

interface ProfileOptionProps {
  icon: string;
  label: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  scale?: Animated.Value;
}
const ProfileOption: React.FC<ProfileOptionProps> = ({
  icon,
  label,
  onPress,
  rightElement,
  scale = new Animated.Value(1)
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.optionContainer}
    >
      <View style={styles.optionLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={20} color={'#a18dce'} />
        </View>
        <Text style={styles.optionText}>{label}</Text>
      </View>
      {rightElement || (
        <Icon name="chevron-forward" size={20} color={COLORS.textDim} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: COLORS.cardDark,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(138, 43, 226, 0.1)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
});

export default ProfileOption;