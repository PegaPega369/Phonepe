import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const IdentityVerification1 = () => {
  const [dob, setDob] = useState(''); // State to store the date of birth
  const [showPicker, setShowPicker] = useState(false); // State to toggle the date picker modal
  const colorScheme = useColorScheme(); // Detect dark mode
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>(); // To navigate between screens

  const handleConfirm = () => {
    if (dob) {
      setShowPicker(false); // Close the modal
      // Navigate back to home or handle navigation
      navigation.navigate('Home');
    }
  };

  const handleDateInput = (date: string) => {
    setDob(date); // Set the manually entered date
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkTitle]}>Your Date of Birth</Text>

      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <View style={[styles.inputContainer, isDarkMode && styles.darkInputContainer]}>
          <TextInput
            style={[styles.input, isDarkMode && styles.darkInput]}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
            value={dob}
            onChangeText={handleDateInput}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isDarkMode && styles.darkButton]}
        disabled={!dob}
        onPress={handleConfirm} // Confirm button to save the DOB
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  darkTitle: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#000',
  },
  darkInputContainer: {
    borderColor: '#444',
    backgroundColor: '#333',
  },
  input: {
    flex: 1,
    color: '#000',
  },
  darkInput: {
    color: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  darkButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IdentityVerification1;
