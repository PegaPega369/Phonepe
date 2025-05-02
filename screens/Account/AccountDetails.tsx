import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { PROFILE_COLORS, PROFILE_STYLES,SHADOWS } from '../../components/ProfileComponents/theme';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

interface RouteParams {
  uid: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  pincode: string;
  [key: string]: string;
}

const AccountDetails: React.FC = () => {
  const route = useRoute();
  const params = route.params as RouteParams;
  const uid = params?.uid || 'defaultUser';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [buttonScale] = useState<Animated.Value>(new Animated.Value(1));
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    pincode: '',
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      
      try {
        const userDoc = await firestore().collection('users').doc(uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data() as Partial<UserData>;
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.gmail || '',
            phone: userData.phone || '',
            dateOfBirth: userData.dob || '',
            address: userData.address || '',
            pincode: userData.pincode || '',
          });
        } else {
          setError('User data not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid]);

  const saveUserData = async (): Promise<void> => {
    setSaving(true);
    
    try {
      await firestore().collection('users').doc(uid).update({
        ...formData,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      Alert.alert('Success', 'Your profile has been updated successfully.');
      setIsEditing(false);
      navigation.navigate('Profile', { uid });
    } catch (err) {
      console.error('Error saving user data:', err);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleEditMode = (): void => {
    if (isEditing) {
      saveUserData();
    } else {
      setIsEditing(true);
    }
  };

  const handlePressIn = (): void => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={PROFILE_COLORS.darkPurpleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={PROFILE_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Details</Text>
          <View style={styles.backButton} />
        </LinearGradient>
        
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={PROFILE_COLORS.primary} />
          <Text style={styles.loadingText}>Loading your account details...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={PROFILE_COLORS.darkPurpleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={PROFILE_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account Details</Text>
          <View style={styles.backButton} />
        </LinearGradient>
        
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color={PROFILE_COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.navigate('AccountDetails', { uid })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={PROFILE_COLORS.darkPurpleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={PROFILE_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Details</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={toggleEditMode}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={PROFILE_COLORS.primaryLight} />
          ) : (
            <Icon 
              name={isEditing ? "save-outline" : "create-outline"} 
              size={24} 
              color={PROFILE_COLORS.primaryLight} 
            />
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              editable={isEditing}
              placeholderTextColor={PROFILE_COLORS.textMuted}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              editable={isEditing}
              placeholderTextColor={PROFILE_COLORS.textMuted}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={formData.dateOfBirth}
              onChangeText={(text) => handleInputChange('dateOfBirth', text)}
              editable={isEditing}
              placeholderTextColor={PROFILE_COLORS.textMuted}
            />
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              editable={isEditing}
              placeholderTextColor={PROFILE_COLORS.textMuted}
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              editable={isEditing}
              placeholderTextColor={PROFILE_COLORS.textMuted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Address Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              editable={isEditing}
              placeholderTextColor={PROFILE_COLORS.textMuted}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pincode</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled
              ]}
              value={formData.pincode}
              onChangeText={(text) => handleInputChange('pincode', text)}
              editable={isEditing}
              placeholderTextColor={PROFILE_COLORS.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={saveUserData}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={saving}
          >
            <Animated.View style={[
              styles.saveButton,
              { transform: [{ scale: buttonScale }] }
            ]}>
              <LinearGradient
                colors={PROFILE_COLORS.lightPurpleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={PROFILE_COLORS.text} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

// Keep all your existing styles exactly the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: PROFILE_COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: PROFILE_COLORS.textDim,
    marginBottom: 8,
  },
  input: {
    backgroundColor: PROFILE_COLORS.cardLight,
    borderRadius: 8,
    padding: 12,
    color: PROFILE_COLORS.text,
   
  
  },
  inputDisabled: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    color: PROFILE_COLORS.textMuted,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: PROFILE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: PROFILE_COLORS.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: PROFILE_COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: PROFILE_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: PROFILE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountDetails;