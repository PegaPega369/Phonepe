import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface FundBackgroundProps {
  children: React.ReactNode;
}

const FundBackground: React.FC<FundBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Background Gradient that extends through the entire screen */}
      <LinearGradient
        colors={['rgba(35, 21, 55, 0.9)', 'rgba(10, 10, 10, 1)', 'rgba(10, 10, 10, 1)']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fallback background color
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: -1,
  },
});

export default FundBackground;