import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface NavbarProps {
  uid: string;
  notificationCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ uid, notificationCount = 0 }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();

  const isActive = (tabName: string) => route.name === tabName;

  // SVG icons with consistent style
  const renderIcon = (name: string, isActive: boolean) => {
    const activeColor = '#9D6DF9'; // Purple highlight
    const inactiveColor = 'rgba(255, 255, 255, 0.6)';
    const color = isActive ? activeColor : inactiveColor;

    switch (name) {
      case 'home':
        return (
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive ? 'rgba(157, 109, 249, 0.1)' : 'transparent'}
            />
            <Path
              d="M9 22V12H15V22"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'investments':
        return (
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21L16 19L14 21L12 19L10 21L8 19L5 21Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive ? 'rgba(157, 109, 249, 0.1)' : 'transparent'}
            />
            <Path
              d="M10 8H14"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M10 12H14"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'settings':
        return (
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive ? 'rgba(157, 109, 249, 0.1)' : 'transparent'}
            />
            <Path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'profile':
        return (
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive ? 'rgba(157, 109, 249, 0.1)' : 'transparent'}
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Premium Curved Navbar Background */}
      <Svg width={width} height="80" viewBox={`0 0 ${width} 80`} style={styles.navbarBackground}>
        <Defs>
          <LinearGradient id="navbarGradient" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="#1A1A1E" stopOpacity="0.95" />
            <Stop offset="1" stopColor="#0A0A0D" stopOpacity="0.98" />
          </LinearGradient>
        </Defs>
        
        {/* Curved background with premium gradient */}
        <Path
          fill="url(#navbarGradient)"
          d={`
            M0,20 Q${width / 2 - 80},0 ${width / 2},0
            Q${width / 2 + 80},0 ${width},20
            V80 H0 Z
          `}
        />
        
        {/* Subtle top highlight for premium glass effect */}
        <Path
          d={`
            M2,20 Q${width / 2 - 80},1 ${width / 2},1
            Q${width / 2 + 80},1 ${width - 2},20
          `}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
          fill="none"
        />
      </Svg>

      {/* Navigation Items */}
      <View style={styles.navItems}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Home', { uid })}
          activeOpacity={0.7}
        >
          {renderIcon('home', isActive('Home'))}
          <Text style={[styles.navLabel, isActive('Home') && styles.activeLabel]}>
            Home
          </Text>
          {isActive('Home') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Streak', { uid })}
          activeOpacity={0.7}
        >
          {renderIcon('investments', isActive('Streak'))}
          <Text style={[styles.navLabel, isActive('Streak') && styles.activeLabel]}>
            Streak
          </Text>
          {isActive('Streak') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Profile', { uid })}
          activeOpacity={0.7}
        >
          {renderIcon('settings', isActive('Profile'))}
          <Text style={[styles.navLabel, isActive('Profile') && styles.activeLabel]}>
            Settings
          </Text>
          {isActive('Profile') && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('AccountDetails', { uid })}
          activeOpacity={0.7}
        >
          {renderIcon('profile', isActive('AccountDetails'))}
          <Text style={[styles.navLabel, isActive('AccountDetails') && styles.activeLabel]}>
            Account
          </Text>
          {isActive('AccountDetails') && <View style={styles.activeIndicator} />}
          
          {/* Notification indicator if needed */}
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 75,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navbarBackground: {
    position: 'absolute',
    bottom: 0,
  },
  navItems: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    width: 70,
    borderRadius: 12,
    position: 'relative',
  },
  navLabel: {
    fontSize: 11,
    marginTop: 5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeLabel: {
    color: '#9D6DF9',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    height: 3,
    backgroundColor: '#9D6DF9',
    borderRadius: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 10,
    backgroundColor: '#FF3B30',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#0A0A0D',
  },
  notificationText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default Navbar;