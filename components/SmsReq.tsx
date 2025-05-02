import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  PermissionsAndroid,
  Alert,
  Platform,
} from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

const SmsReq = () => {
  const [messages, setMessages] = useState([]);
  const [amt, setAmt] = useState([]);
  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      if (Platform.OS === 'android') {
        const hasPermission = await requestSMSPermissions();
        if (hasPermission) {
          console.log('Starting to read SMS at intervals');
          const interval = setInterval(readSMS, 5000); // Fetch messages every 5 seconds
          return () => clearInterval(interval);
        }
      }
    };
    checkAndRequestPermissions();
  }, []);

  const requestSMSPermissions = async () => {
    try {
      console.log('Requesting SMS permissions');
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      ]);

      console.log('Permissions granted status:', granted);

      if (
        granted['android.permission.READ_SMS'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECEIVE_SMS'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('SMS permissions granted');
        return true;
      } else {
        console.log('SMS permissions denied');
        Alert.alert(
          'Permissions required',
          'This app requires SMS permissions to read messages. Please enable them in the app settings.',
          [{text: 'OK'}],
        );
        return false;
      }
    } catch (err) {
      console.error('Error requesting SMS permissions:', err);
      return false;
    }
  };

  const readSMS = () => {
    console.log('Reading SMS');
    SmsAndroid.list(
      JSON.stringify({
        box: 'inbox',
        maxCount: 1, // Increase the maxCount if you want to read more messages
      }),
      fail => {
        console.error('Failed to get messages:', fail);
      },
      (count, smsList) => {
        // console.log('SMS List:', smsList);
        const parsedSmsList = JSON.parse(smsList);
        const debitedAmounts = [];

        parsedSmsList.forEach(message => {
          const debitedAmount = extractDebitedAmount(message.body);
          if (debitedAmount !== null) {
            debitedAmounts.push(debitedAmount);
          }
        });
        setAmt(debitedAmounts);
        console.log('Debited Amounts:', debitedAmounts);

        // Update state with debited amounts
        setMessages(parsedSmsList);
      },
    );
  };

  // Function to extract debited amount from the message body
  const extractDebitedAmount = body => {
    const amountRegex = /(?:Rs\.|INR)\s+(\d+\.\d{2})/;
    const match = body.match(amountRegex);
    return match ? parseFloat(match[1]) : null;
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}>
        <Text style={{fontSize: 20, textAlign: 'center', marginBottom: 20}}>
          SMS Reader App
        </Text>
        {messages.length > 0 ? (
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={{borderBottomWidth: 1, paddingVertical: 10}}>
                <Text style={{color: 'white'}}>From: {item.address}</Text>
                <Text>Body: {item.body}</Text>
              </View>
            )}
          />
        ) : (
          <Text>No messages</Text>
        )}
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}>
        <Text style={{fontSize: 20, textAlign: 'center', marginBottom: 20}}>
          SMS Reader App
        </Text>
        {amt.length > 0 ? (
          <FlatList
            data={amt}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <View style={{borderBottomWidth: 1, paddingVertical: 10}}>
                <Text style={{color: 'white'}}>Amount: {item}</Text>
                <Text style={{color: 'white'}}>
                  Spare Amount: {(Math.round(item / 10) * 10)-item}
                </Text>
              </View>
            )}
          />
        ) : (
          <Text>No debited amounts</Text>
        )}
      </View>
    </>
  );
};

export default SmsReq;
