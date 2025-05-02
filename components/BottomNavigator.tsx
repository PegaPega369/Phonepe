import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomePage from '../screens/Home';
import ProfilePage from '../screens/ProfilePage';

const Tab = createBottomTabNavigator();

export default function BottomNavigator({uid}) {
  // const route=useRoute();
  // const {uid}=route.params;
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return (
              <Icon
                name={iconName}
                size={size}
                color={color}
                style={{ marginBottom: -6 }} // Adjust the marginBottom to decrease the gap
              />
            );
          },
          tabBarLabel: ({ focused, color }) => {
            let labelName;

            if (route.name === 'Home') {
              labelName = 'Home';
            } else if (route.name === 'Profile') {
              labelName = 'Profile';
            }

            return (
              <Text style={{ color, fontSize: 12, marginBottom: 5 }}> {/* Adjust the marginBottom to align the text */}
                {labelName}
              </Text>
            );
          },
          headerShown: false,
          tabBarStyle: {
            height: 60,
            paddingHorizontal: 5,
            paddingTop: 0,
            backgroundColor: '#121313',
            position: 'absolute',
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: '#0080ff',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" >
        {() => <HomePage uid={uid} />}
        </Tab.Screen>
        <Tab.Screen name="Profile" component={ProfilePage} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
