import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ReferralBoxProps {
  onPress: () => void;
}

const ReferralBox: React.FC<ReferralBoxProps> = ({ onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const loopGlow = () => {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ]).start(loopGlow);
    };

    loopGlow();

    return () => {
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      glowAnim.stopAnimation();
    };
  }, []);

  const glowShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headingText}>Refer and Earn</Text>
          <LinearGradient
            colors={['#9D6DF9', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headingUnderline}
          />
        </View>
    
      </View>
        <TouchableOpacity
          style={styles.touchable}
          activeOpacity={0.9}
          onPress={onPress}
        >
          <LinearGradient
            colors={['#231537', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🎁</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Invite & Earn Rewards</Text>
                <Text style={styles.description}>
                  Share with friends & earn 100 bonus points each!
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Invite</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginVertical: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headingUnderline: {
    height: 3,
    width: 40,
    borderRadius: 3,
  },
  shadowContainer: {
    borderRadius: 16,
    backgroundColor: '#231537',
    shadowColor: '#9D6DF9',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 10,
  },
  touchable: {
    width: '100%',
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 26,
  },
  textContainer: {
    flex: 1,
    paddingRight: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  buttonContainer: {
    marginLeft: 8,
  },
  button: {
    backgroundColor: 'rgba(157, 109, 249, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ReferralBox;
