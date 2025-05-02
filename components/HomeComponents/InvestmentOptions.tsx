import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import {
  Svg,
  Path,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  RadialGradient,
} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from './theme';

const {width} = Dimensions.get('window');

// Keep all your existing interfaces exactly the same
interface InvestmentOptionsProps {
  onGoldPress: () => void;
  onMutualFundPress: () => void;
  onSilverPress: () => void;
}

interface InvestmentCardProps {
  title: string;
  description: string;
  roi: string;
  iconType: 'gold' | 'silver' | 'funds';
  gradientColors: string[];
  borderStartColor: string;
  borderEndColor: string;
  glowColor: string;
  onPress: () => void;
}

const PremiumInvestmentOptions: React.FC<InvestmentOptionsProps> = ({
  onGoldPress,
  onMutualFundPress,
  onSilverPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headingText}>Investment Options</Text>
          <LinearGradient
            colors={['#9D6DF9', '#4B0082']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.headingUnderline}
          />
        </View>
      </View>

      <View style={styles.cardsContainer}>
        <InvestmentCard
          title="Gold"
          description="Physical Gold ETF"
          roi="+12.4%"
          iconType="gold"
          gradientColors={['#261E0D', '#4A3A14', '#6B5019']}
          borderStartColor="rgba(255, 215, 0, 0.8)"
          borderEndColor="rgba(255, 215, 0, 0.2)"
          glowColor="rgba(255, 215, 0, 0.3)"
          onPress={onGoldPress}
        />

        <InvestmentCard
          title="Silver"
          description="Silver Commodity"
          roi="+8.7%"
          iconType="silver"
          gradientColors={['#2A2A2A', '#444444', '#5E5E5E']}
          borderStartColor="rgba(192, 192, 192, 0.8)"
          borderEndColor="rgba(192, 192, 192, 0.2)"
          glowColor="rgba(192, 192, 192, 0.3)"
          onPress={onSilverPress}
        />

        <InvestmentCard
          title="Funds"
          description="Mutual Fund Index"
          roi="+16.8%"
          iconType="funds"
          gradientColors={['#0A1F4D', '#102E74', '#1A3D8F']}
          borderStartColor="rgba(100, 149, 237, 0.8)"
          borderEndColor="rgba(100, 149, 237, 0.2)"
          glowColor="rgba(100, 149, 237, 0.3)"
          onPress={onMutualFundPress}
        />
      </View>
    </View>
  );
};

const InvestmentCard: React.FC<InvestmentCardProps> = React.memo(
  ({
    title,
    description,
    roi,
    iconType,
    gradientColors,
    borderStartColor,
    borderEndColor,
    glowColor,
    onPress,
  }) => {
    // Keep all your existing hooks and animations exactly the same
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const [isPressing, setIsPressing] = useState(false);

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, []);

    const handlePressIn = () => {
      setIsPressing(true);
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
      onPress();
    };

    const handlePressOut = () => {
      setIsPressing(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
      onPress();
    };

    const glowOpacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.8],
    });

    // Keep your existing renderIcon function exactly the same
    const renderIcon = () => {
      switch (iconType) {
        case 'gold':
          return (
            <View style={styles.iconContainer}>
              <Svg width="40" height="40" viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient
                    id="goldGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1">
                    <Stop offset="0" stopColor="#FFD700" stopOpacity="1" />
                    <Stop offset="1" stopColor="#FFA500" stopOpacity="1" />
                  </SvgLinearGradient>
                  <RadialGradient
                    id="goldGlow"
                    cx="12"
                    cy="12"
                    rx="12"
                    ry="12"
                    fx="12"
                    fy="12"
                    gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={glowColor} stopOpacity="0.8" />
                    <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="12" cy="12" r="12" fill="url(#goldGlow)" />
                <Path
                  d="M7,9H17L12,4L7,9Z M7,15H17L12,20L7,15Z M17,11H7V13H17V11Z"
                  fill="url(#goldGradient)"
                />
              </Svg>
            </View>
          );
        case 'silver':
          return (
            <View style={styles.iconContainer}>
              <Svg width="40" height="40" viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient
                    id="silverGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1">
                    <Stop offset="0" stopColor="#C0C0C0" stopOpacity="1" />
                    <Stop offset="1" stopColor="#A9A9A9" stopOpacity="1" />
                  </SvgLinearGradient>
                  <RadialGradient
                    id="silverGlow"
                    cx="12"
                    cy="12"
                    rx="12"
                    ry="12"
                    fx="12"
                    fy="12"
                    gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={glowColor} stopOpacity="0.8" />
                    <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="12" cy="12" r="12" fill="url(#silverGlow)" />
                <Path
                  d="M19,5H5V19H19V5M17,17H7V7H17V17Z M16,8H8V16H16V8Z"
                  fill="url(#silverGradient)"
                />
              </Svg>
            </View>
          );
        case 'funds':
          return (
            <View style={styles.iconContainer}>
              <Svg width="40" height="40" viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient
                    id="fundsGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1">
                    <Stop offset="0" stopColor="#4B9CFF" stopOpacity="1" />
                    <Stop offset="1" stopColor="#2563EB" stopOpacity="1" />
                  </SvgLinearGradient>
                  <RadialGradient
                    id="fundsGlow"
                    cx="12"
                    cy="12"
                    rx="12"
                    ry="12"
                    fx="12"
                    fy="12"
                    gradientUnits="userSpaceOnUse">
                    <Stop offset="0" stopColor={glowColor} stopOpacity="0.8" />
                    <Stop offset="1" stopColor={glowColor} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="12" cy="12" r="12" fill="url(#fundsGlow)" />
                <Path
                  d="M21,18H3V6H21M21,4H3C1.89,4 1,4.89 1,6V18C1,19.11 1.9,20 3,20H21C22.11,20 23,19.11 23,18V6C23,4.89 22.1,4 21,4M11,7H13V9H11M9,11H15V13H9M7,15H17V17H7"
                  fill="url(#fundsGradient)"
                />
              </Svg>
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            shadowColor: glowColor,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <LinearGradient
          colors={gradientColors}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.cardContainer,
            {
              borderColor: isPressing ? borderStartColor : 'transparent',
            },
          ]}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPress()}
            activeOpacity={0.8}
            accessibilityLabel={`Invest in ${title}`}>
            {renderIcon()}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  },
);

// Keep all your existing styles exactly the same
const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 16,
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
    paddingHorizontal: 16,
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
  viewAllButton: {
    padding: 6,
  },
  viewAllText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: width * 0.28,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.6,
        shadowRadius: 15,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  cardContainer: {
    borderRadius: 16,
    height: '100%',
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  card: {
    height: '100%',
    padding: 12,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  contentContainer: {
    marginBottom: 8,
  },
  title: {
    color: COLORS.text || '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'center',
  },
  roiContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  roiText: {
    color: '#4CD964',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roiLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
  },
});

export default PremiumInvestmentOptions;
