import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import {PermissionsAndroid} from 'react-native';

import messaging from '@react-native-firebase/messaging';


const requestUserPermission = async ()=>{
    const granted= await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    if(granted=== PermissionsAndroid.RESULTS.GRANTED){
        console.log("Granted")
    }
    else{
        console.log("Denied")
    }
}

  const getToken = async()=>{
    const token= await messaging().getToken()
    console.log(token)
  }

  export default function UseNotification() {
    useEffect(()=>{
        requestUserPermission();
        getToken();
    })
}