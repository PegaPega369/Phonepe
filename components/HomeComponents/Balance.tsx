// components/Balance.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5'; 
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

const {width} = Dimensions.get('window'); // Get the screen width
const containerWidth = width * 0.9; // 80% of the screen width


interface BalanceProps {
  onDetailsPress: () => void;
  onSavePress: () => void;
  onWithdrawPress: () => void;
}

const Balance: React.FC<BalanceProps> = ({onDetailsPress,onSavePress,onWithdrawPress}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <View style={styles.container}>
      {/* <Shadow
        distance={20}
        startColor="#AA00FF40"
        endColor="#AA00FF00"
        offset={[0, 0]}
        style={[styles.shadowContainer, {width: containerWidth}]}> */}
        <LinearGradient
          colors={['#000000', '#1F1F1F']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientContainer}>
          <LinearGradient
            colors={['#1C1C1E', '#2C2C2E']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.innerGlow}
          />
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Portfolio</Text>
                <View style={styles.growthContainer}>
                  <Icon name="arrow-up" size={10} color="#4CD964" />
                  <Text style={styles.growthText}>+2.4%</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={onDetailsPress}>
                <Text style={styles.detailsButtonText}>Details</Text>
                <Icon
                  name="chevron-right"
                  size={10}
                  color="#ffffff"
                  style={styles.buttonIcon}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.balance}>₹123.5</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={onSavePress}>
                <LinearGradient
                  colors={['#231537', '#4B0082']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.buttonGradient}>
                  <Icon name="bolt" size={14} color="gold" />
                  <Text style={styles.primaryButtonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={onWithdrawPress}>
                <Icon name="exchange-alt" size={14} color="#FFFFFF" />
                <Text style={styles.secondaryButtonText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      {/* </Shadow> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowContainer: {
    borderRadius: 16,
  },
  gradientContainer: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  contentContainer: {
    position: 'relative',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#F2F2F2',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  addMoneyButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  addMoneyButtonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 10,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 52, 59, 0.78)',
  },
  detailsButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  growthText: {
    color: '#4CD964',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  primaryButton: {
    width: '48%',
    height: 46,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    width: '48%',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default Balance;