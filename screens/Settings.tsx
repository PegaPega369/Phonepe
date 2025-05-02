import {ScrollView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import Navbar from '../components/Navbar';
import {useRoute} from '@react-navigation/native';

const Settings: React.FC = () => {
  const route = useRoute();
  // const {uid} = route.params;
  const { uid } = route.params as { uid: string };

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView>
        <View style={styles.container}>
          <Text style={styles.heading}>Settings</Text>
        </View>
      </ScrollView>
      <Navbar uid={uid} />
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'black',
    // justifyContent:'center',
  },
  container: {
    margin: 10,
  },
  heading: {
    fontSize: 25,
    color: 'white',
    fontWeight: '500',
  },
});
