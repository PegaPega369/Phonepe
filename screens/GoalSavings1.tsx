import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from '../components/ProfileComponents/theme';

interface RouteParams {
  uid: string;
}

interface GoalCardProps {
  title: string;
  icon: any; // Image source
  onPress: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ title, icon, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.goalCardContainer}
    >
      <Animated.View
        style={[
          styles.goalCard,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Image source={icon} style={styles.suggestionIcon} />
        <Text style={styles.suggestionLabel}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const GoalPage1: React.FC = () => {
  const [purpose, setPurpose] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const params = route.params as RouteParams || { uid: '0' };
  const { uid } = params;
  
  // Animation values - starting fully visible to prevent loading flash
  const fadeAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  const goalCategories = [
    {
      label: 'Entertainment',
      icon: require('../components/assets/entertainment.png'),
    },
    {
      label: 'Travel',
      icon: require('../components/assets/travel.png')
    },
    {
      label: 'Emergency',
      icon: require('../components/assets/emer.png'),
    },
    {
      label: 'New Gadget',
      icon: require('../components/assets/gadget.png'),
    },
    {
      label: 'Jwellery',
      icon: require('../components/assets/Jwellery.png'),
    },
    {
      label: 'Shopping',
      icon: require('../components/assets/shopping.png'),
    },
  ];
  
  const handleSelectCategory = (category: string) => {
    setPurpose(category);
  };
  
  const handleNext = () => {
    if (purpose.trim() === '') {
      // Show error or prompt user to enter a purpose
      return;
    }
    navigation.navigate('GoalSavings2', { uid, purpose });
  };
  
  return (
    <View style={styles.background}>
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerText}>Goal Savings</Text>
          
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>1/4</Text>
          </View>
        </View>
        
        {/* Main Content */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.titleText}>What do you want to invest for?</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Eg. Laptop, iPhone, Vacation..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={purpose}
              onChangeText={setPurpose}
              selectionColor={COLORS.primary}
            />
            <Text style={styles.inputHintText}>
              This will be used as your investment goal's name
            </Text>
          </View>
          
          <View style={styles.suggestionsSection}>
            <Text style={styles.suggestionText}>Not able to decide?</Text>
            <Text style={styles.suggestionHintText}>
              Try these ideas to get started
            </Text>
            
            <View style={styles.suggestionsContainer}>
              {goalCategories.map((item, index) => (
                <GoalCard
                  key={index}
                  title={item.label}
                  icon={item.icon}
                  onPress={() => handleSelectCategory(item.label)}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          activeOpacity={0.8}
          onPress={handleNext}
        >
          <LinearGradient
            colors={COLORS.purpleGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerText: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  stepIndicator: {
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  stepText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  titleText: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardDark,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  
  },
  inputHintText: {
    color: COLORS.textDim,
    fontSize: 14,
    marginLeft: 4,
  },
  suggestionsSection: {
    marginTop: 16,
  },
  suggestionText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionHintText: {
    color: COLORS.textDim,
    fontSize: 16,
    marginBottom: 24,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  goalCardContainer: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionIcon: {
    width: 64,
    height: 64,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  suggestionLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalPage1;