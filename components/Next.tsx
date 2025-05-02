import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';


interface NextProps {
  nextScreen: string; // The name of the next screen to navigate to
}

const Next: React.FC<NextProps> = ({ nextScreen}) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handlePress = () => {
    navigation.navigate(nextScreen);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.nextText}>Next</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: '#0080ff',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Next;
