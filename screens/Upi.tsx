import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Upi = () => {
  const route = useRoute();
  const [upiId, setUpiId] = useState('');
  const { uid } = route.params as { uid: string };
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleupi = async () => {
    try {
      await firestore().collection("users").doc(uid).update({ upiId });
      navigation.navigate('Home', { uid });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Link your UPI ID</Text>

            <View style={styles.limitBox}>
              <Text style={styles.limitTitle}>Daily Savings & Round Up Limit:</Text>
              <Text style={styles.amount}>₹100 / day</Text>
              <Text style={styles.note}>
                We'll never debit more than ₹100 in a day.
              </Text>
            </View>

            <View style={styles.upiAppContainer}>
              <Text style={styles.selectUpi}>Choose your UPI app</Text>
              <View style={styles.upiApps}>
                {[
                  { id: 'gpay', label: 'GPay', img: require('../components/assets/gpay.png') },
                  { id: 'phonepe', label: 'PhonePe', img: require('../components/assets/phonepe.png') },
                  { id: 'paytm', label: 'Paytm', img: require('../components/assets/paytm.png') },
                ].map(app => (
                  <TouchableOpacity key={app.id} style={styles.upiCard}>
                    <Image source={app.img} style={styles.upiImg} />
                    <Text style={styles.upiText}>{app.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.inputLabel}>Your UPI ID</Text>
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              placeholder="e.g. 9876543210@hdfcbank"
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.chargeNote}>
              A one-time ₹1 fee applies to activate auto-invest.
            </Text>

            <TouchableOpacity style={styles.button} onPress={handleupi}>
              <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => navigation.navigate('SmsReq')}
            >
              <Text style={styles.outlineButtonText}>Read SMS Permissions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    color: '#9D6DF9',
    fontWeight: '800',
    marginBottom: 16,
  },
  limitBox: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 28,
  },
  limitTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  amount: {
    fontSize: 22,
    color: '#9D6DF9',
    fontWeight: '600',
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  upiAppContainer: {
    marginBottom: 32,
  },
  selectUpi: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  upiApps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upiCard: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  upiImg: {
    width: 36,
    height: 36,
    marginBottom: 6,
  },
  upiText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    padding: 14,
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 40,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    backgroundColor: '#000',
  },
  chargeNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4B0082',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#9D6DF9',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#9D6DF9',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default Upi;
