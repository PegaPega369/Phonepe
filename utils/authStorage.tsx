import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token after login
const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (e) {
    console.error('Failed to save token.', e);
  }
};

// Retrieve token on app launch
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (e) {
    console.error('Failed to fetch token.', e);
    return null;
  }
};

// Remove token on logout
const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (e) {
    console.error('Failed to remove token.', e);
  }
};
