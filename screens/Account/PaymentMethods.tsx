import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { PROFILE_COLORS } from '../../components/ProfileComponents/theme';

const PaymentMethods: React.FC = () => {
  const route = useRoute();
  const { uid } = route.params || { uid: 'defaultUser' };
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      {/* Header with back button */}
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {}}
        >
          <Icon name="add" size={24} color={PROFILE_COLORS.primaryLight} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.paymentCard}>
          <View style={styles.cardHeader}>
            <Icon name="card" size={24} color={PROFILE_COLORS.primaryLight} />
            <Text style={styles.cardTitle}>Payment Methods</Text>
          </View>
          
          <Text style={styles.emptyText}>
            You haven't added any payment methods yet. Add a payment method to enable easy and secure transactions.
          </Text>

          <TouchableOpacity style={styles.addMethodButton}>
            <LinearGradient
              colors={PROFILE_COLORS.darkPurpleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addMethodGradient}
            >
              <Icon name="add-circle-outline" size={20} color={PROFILE_COLORS.text} />
              <Text style={styles.addMethodText}>Add Payment Method</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

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
    paddingTop: 50, // Additional padding for status bar
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
  addButton: {
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
  paymentCard: {
    backgroundColor: PROFILE_COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: PROFILE_COLORS.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PROFILE_COLORS.text,
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 14,
    color: PROFILE_COLORS.textDim,
    marginBottom: 20,
    lineHeight: 20,
  },
  addMethodButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  addMethodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addMethodText: {
    color: PROFILE_COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default PaymentMethods;