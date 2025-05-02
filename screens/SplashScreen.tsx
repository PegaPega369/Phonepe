import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require('../components/assets/Fincraft.png')}
          style={styles.logo}></Image>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  logo: {
    width: 360,
    height: 200,
    resizeMode: 'cover',
  },
});
export default SplashScreen;
