import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

const Question1: React.FC = () => {
  const [savingType, setsavingType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as { uid: string };

  const progress = 50;

  const options = [
    { 
      id: 'roundoff', 
      text: 'Roundup Savings',
      description: 'Automatically save spare change from your purchases'
    },
    { 
      id: 'manual', 
      text: 'Manual Savings',
      description: 'Set a fixed daily amount to save manually'
    },
  ];

  const handleOptionPress = (id: string) => {
    if (loading) return; // Prevent selection during loading
    console.log('Option selected:', id);
    setsavingType(id);
  };

  const saveDetails = async () => {
    console.log('saveDetails called with savingType:', savingType);
    
    if (!savingType) {
      Alert.alert('Please select an option', 'Choose how you would like to save before continuing.');
      return;
    }

    if (loading) return; // Prevent multiple clicks

    setLoading(true);
    try {
      console.log('Attempting to save to Firestore for UID:', uid);
      
      // First, try to get the user document
      const userDoc = await firestore().collection('users').doc(uid).get();
      
      if (userDoc.exists) {
        console.log('User document exists, updating...');
        // Update existing document
        await firestore().collection('users').doc(uid).update({ savingType });
      } else {
        console.log('User document does not exist, creating...');
        // Create new document
        await firestore().collection('users').doc(uid).set({ 
          savingType,
          uid,
          createdAt: firestore.Timestamp.now()
        });
      }
      
      console.log('Firestore operation completed, navigating...');
      
      // Navigate based on selection
      if (savingType === 'roundoff') {
        console.log('Navigating to Question2');
        navigation.navigate('Question2', { uid });
      } else {
        console.log('Navigating to Question3');
        navigation.navigate('Question3', { uid });
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
      Alert.alert('Error', 'Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.heading}>Let's personalize your experience</Text>
        <View style={styles.progressBar}>
          <View style={{ width: `${progress}%`, ...styles.progress }}></View>
        </View>
        <Text style={styles.progressText}>Step 2 of 4</Text>
        <Text style={styles.question}>How would you like to save money?</Text>
        <Text style={styles.subtitle}>Choose the saving method that fits your lifestyle best</Text>

        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionContainer,
              savingType === option.id && styles.selectedOptionContainer,
            ]}
            onPress={() => handleOptionPress(option.id)}
            activeOpacity={0.7}
          >
            <CheckBox
              checked={savingType === option.id}
              onPress={() => handleOptionPress(option.id)}
              checkedColor="#9D6DF9"
              containerStyle={styles.checkbox}
              style={styles.checkboxStyle}
            />
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionText,
                  savingType === option.id && styles.optionTextSelected,
                ]}
              >
                {option.text}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  savingType === option.id && styles.optionDescriptionSelected,
                ]}
              >
                {option.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[
            styles.button,
            (!savingType || loading) && styles.buttonDisabled
          ]} 
          onPress={saveDetails}
          disabled={!savingType || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.nextText,
              !savingType && styles.nextTextDisabled
            ]}>
              {savingType ? 'Next' : 'Select an option'}
            </Text>
          )}
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
    marginBottom: 10,
    fontWeight: '700',
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedOptionContainer: {
    backgroundColor: 'rgba(157, 109, 249, 0.2)',
    borderColor: '#9D6DF9',
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    marginRight: 10,
  },
  checkboxStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  optionContent: {
    flex: 1,
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
    backgroundColor: 'rgba(75, 0, 130, 0.5)',
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

export default Question1;
