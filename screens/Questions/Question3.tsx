import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

const Question2: React.FC = () => {
  const [manual, setmanual] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as { uid: string };

  const options = [
    { id: 1, text: '10' },
    { id: 2, text: '20' },
    { id: 3, text: '30' },
    { id: 4, text: '50' },
  ];

  const progress = 100;

  const handleOptionPress = (text: string) => {
    setmanual(text);
  };

  const saveDetails = async () => {
    try {
      await firestore().collection('users').doc(uid).update({ manual });
      navigation.navigate('UPI', { uid });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.heading}>Setting up account</Text>
        <View style={styles.progressBar}>
          <View style={{ width: `${progress}%`, ...styles.progress }} />
        </View>
        <Text style={styles.progressText}>Question 2/2</Text>
        <Text style={styles.question}>How much would you like to save per day?</Text>

        {options.map(option => (
          <View key={option.id} style={styles.optionContainer}>
            <CheckBox
              checked={manual === option.text}
              onPress={() => handleOptionPress(option.text)}
              checkedColor="#9D6DF9"
              containerStyle={styles.checkbox}
            />
            <TouchableOpacity
              style={[
                styles.option,
                manual === option.text && styles.selectedOption,
              ]}
              onPress={() => handleOptionPress(option.text)}
            >
              <Text
                style={[
                  styles.optionText,
                  manual === option.text && styles.optionTextSelected,
                ]}
              >
                ₹ {option.text}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={saveDetails}>
          <Text style={styles.nextText}>Next</Text>
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
  button: {
    width: '100%',
    backgroundColor: '#4B0082',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Question2;
