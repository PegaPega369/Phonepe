import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';

const Details: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as { uid: string };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gmail, setGmail] = useState('');

  const saveDetails = async () => {
    try {
      await firestore().collection("users").doc(uid).set({
        firstName,
        lastName,
        dob,
        gmail
      });
      navigation.navigate('Question1', { uid });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.background}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Text style={styles.headerText}>Hello There!</Text>
        <Text style={styles.subHeaderText}>Let's get introduced properly?</Text>
        <Text style={styles.infoText}>*Please enter name as per your PAN.</Text>

        <Text style={styles.title2}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={firstName}
          onChangeText={text => setFirstName(text)}
        />

        <Text style={styles.title2}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your last name"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={lastName}
          onChangeText={text => setLastName(text)}
        />

        <Text style={styles.title2}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={dob}
          onChangeText={text => setDob(text)}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.title2}>Gmail</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Gmail ID"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={gmail}
          onChangeText={text => setGmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.button} onPress={saveDetails}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => {
            console.log('View Privacy and Policy clicked');
          }}
        >
          <Text style={styles.linkText}>View Privacy and Policy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  background: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
  },
  headerText: {
    fontSize: 26,
    color: '#9D6DF9',
    fontWeight: '700',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  title2: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    fontSize: 16,
    borderColor: '#2C2C2C',
    borderWidth: 1,
    marginBottom: 12,
  },
  spacer: {
    height: 20,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#9D6DF9',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});

export default Details;
