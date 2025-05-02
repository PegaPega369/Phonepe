import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';

import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';


const MySwiper: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as { uid: string };

  return (
    <Swiper
      style={styles.wrapper}
      showsPagination={true}
      autoplay={true}
      autoplayTimeout={5}
    >
      <View style={styles.slide}>
        <TouchableOpacity
              style={styles.statBox}
              onPress={() => {
                navigation.navigate('Gold', {uid});
              }}>
              <Image
                source={require('../components/assets/gold.png')}
                style={styles.image}></Image>
              <Text style={styles.font}>Gold</Text>
              <Text style={{color: 'white'}}>
                Start investing in{' '}
                <Text style={{fontWeight: 'bold', color: 'gold'}}>Gold</Text>{' '}
                with a minimum of ₹10
              </Text>
            </TouchableOpacity>
      </View>

      <View style={styles.slide}>
        <TouchableOpacity
              style={styles.statBox}
              onPress={() => {
                navigation.navigate('Gold', {uid});
              }}>
              <Image
                source={require('../components/assets/gold.png')}
                style={styles.image}></Image>
              <Text style={styles.font}>Gold</Text>
              <Text style={{color: 'white'}}>
                Start investing in{' '}
                <Text style={{fontWeight: 'bold', color: 'gold'}}>Gold</Text>{' '}
                with a minimum of ₹10
              </Text>
            </TouchableOpacity>
      </View>

      <View style={styles.slide}>
        <TouchableOpacity
              style={styles.statBox}
              onPress={() => {
                navigation.navigate('Gold', {uid});
              }}>
              <Image
                source={require('../components/assets/gold.png')}
                style={styles.image}></Image>
              <Text style={styles.font}>Gold</Text>
              <Text style={{color: 'white'}}>
                Start investing in{' '}
                <Text style={{fontWeight: 'bold', color: 'gold'}}>Gold</Text>{' '}
                with a minimum of ₹10
              </Text>
            </TouchableOpacity>
      </View>

      <View style={styles.slide}>
        <TouchableOpacity
              style={styles.statBox}
              onPress={() => {
                navigation.navigate('Gold', {uid});
              }}>
              <Image
                source={require('../components/assets/gold.png')}
                style={styles.image}></Image>
              <Text style={styles.font}>Gold</Text>
              <Text style={{color: 'white'}}>
                Start investing in{' '}
                <Text style={{fontWeight: 'bold', color: 'gold'}}>Gold</Text>{' '}
                with a minimum of ₹10
              </Text>
            </TouchableOpacity>
      </View>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop:20,
    backgroundColor:'#121313',
    height: 400,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 205,
    height: 200,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statBox: {
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
  },
  font: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
});

export default MySwiper;
