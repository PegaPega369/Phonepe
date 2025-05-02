// components/Header.tsx
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS} from '../../screens/theme';

interface HeaderProps {
  firstName: string;
  LastName: string;
  onProfilePress: () => void;
}

const Header: React.FC<HeaderProps> = ({firstName, LastName, onProfilePress}) => {
  return (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Hey,</Text>
        <Text style={styles.title2}>{firstName}</Text>
      </View>
      <TouchableOpacity style={styles.profilePicContainer} onPress={onProfilePress}>
        <Text style={styles.profileText}>
          {firstName.charAt(0)}
          {LastName.charAt(0)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '400',
    marginTop: 0,
  },
  title2: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '600',
    marginTop: 0,
  },
  profilePicContainer: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 50,
    borderColor: COLORS.text,
    overflow: 'hidden',
    borderWidth: 1,
  },
  profileText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Header;