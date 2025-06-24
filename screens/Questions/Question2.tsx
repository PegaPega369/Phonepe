import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

const Question2: React.FC = () => {
  const [roundTo, setroundTo] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as { uid: string };

  const options = [
    { id: 1, text: '10', label: 'Nearest ₹10', description: 'Round up to the nearest 10 rupees' },
    { id: 2, text: '20', label: 'Nearest ₹20', description: 'Round up to the nearest 20 rupees' },
    { id: 3, text: '30', label: 'Nearest ₹30', description: 'Round up to the nearest 30 rupees' },
    { id: 4, text: '50', label: 'Nearest ₹50', description: 'Round up to the nearest 50 rupees' },
  ];

  const progress = 100;

  const handleOptionPress = (text: string) => {
    setroundTo(text);
  };

  const saveDetails = async () => {
    if (!roundTo) {
      Alert.alert('Please select an option', 'Choose a round-up amount before continuing.');
      return;
    }

    try {
      // Update the user document with round-up preference
      await firestore().collection('users').doc(uid).update({ roundTo });
      
      // Navigate to UPI setup
      navigation.navigate('UPI', { uid });
    } catch (error) {
      console.error('Error saving round-up preference:', error);
      Alert.alert('Error', 'Failed to save your preference. Please try again.');
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.heading}>Setting up account</Text>
        <View style={styles.progressBar}>
          <View style={{ width: `${progress}%`, ...styles.progress }} />
        </View>
        <Text style={styles.progressText}>Step 3 of 4</Text>
        <Text style={styles.question}>How would you like to round off to?</Text>

        {options.map(option => (
          <View key={option.id} style={styles.optionContainer}>
            <CheckBox
              checked={roundTo === option.text}
              onPress={() => handleOptionPress(option.text)}
              checkedColor="#9D6DF9"
              containerStyle={styles.checkbox}
            />
            <TouchableOpacity
              style={[
                styles.option,
                roundTo === option.text && styles.selectedOption,
              ]}
              onPress={() => handleOptionPress(option.text)}
            >
              <View>
                <Text
                  style={[
                    styles.optionText,
                    roundTo === option.text && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.optionDescription,
                    roundTo === option.text && styles.optionDescriptionSelected,
                  ]}
                >
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity 
          style={[
            styles.button,
            !roundTo && styles.buttonDisabled
          ]} 
          onPress={saveDetails}
          disabled={!roundTo}
        >
          <Text style={[
            styles.nextText,
            !roundTo && styles.nextTextDisabled
          ]}>
            {roundTo ? 'Next' : 'Select an option'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  container: {
    alignItems: 'center',
    padding: 20,
    width: '90%',
  },
  heading: {
    fontSize: 24,
    color: '#9D6DF9',
    fontWeight: '700',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#9D6DF9',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginRight: 10,
  },
  option: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOption: {
    backgroundColor: 'rgba(157, 109, 249, 0.2)',
    borderColor: '#9D6DF9',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionTextSelected: {
    color: '#9D6DF9',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  optionDescriptionSelected: {
    color: 'rgba(157, 109, 249, 0.8)',
  },
  button: {
    width: '100%',
    backgroundColor: '#4B0082',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(75, 75, 75, 0.5)',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default Question2;
