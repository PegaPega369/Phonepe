import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Animated,
  Linking,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, PROFILE_COLORS, SHADOWS } from '../../components/ProfileComponents/theme';

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [expanded, rotateAnim, heightAnim]);
  
  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity 
        style={styles.faqQuestion}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.faqQuestionText}>{question}</Text>
        <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
          <Icon name="chevron-down" size={22} color={COLORS.textDim} />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.faqAnswer,
          {
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 500] // Max height for the content
            }),
            opacity: heightAnim
          }
        ]}
      >
        <Text style={styles.faqAnswerText}>{answer}</Text>
      </Animated.View>
    </View>
  );
};

const SupportOption = ({ icon, title, description, onPress }) => {
  return (
    <TouchableOpacity style={styles.supportOption} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.supportIconContainer}>
        <Icon name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.supportContent}>
        <Text style={styles.supportTitle}>{title}</Text>
        <Text style={styles.supportDescription}>{description}</Text>
      </View>
      <Icon name="chevron-right" size={22} color={COLORS.textDim} />
    </TouchableOpacity>
  );
};

const HelpAndSupport: React.FC = () => {
  const navigation = useNavigation();
  const [emailSent, setEmailSent] = useState(false);
  
  // Animation for header entrance
  const headerOpacity = useState(new Animated.Value(0))[0];
  const headerTranslateY = useState(new Animated.Value(-20))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  const handleContactSupport = () => {
    // Simulate sending an email
    setEmailSent(true);
    
    // Reset the status after 3 seconds
    setTimeout(() => {
      setEmailSent(false);
    }, 3000);
  };
  
  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@digitalgold.com?subject=Support%20Request');
  };
  
  const handleChatSupport = () => {
    // This would open a chat interface in a real app
    handleContactSupport();
  };
  
  const handleCallSupport = () => {
    Linking.openURL('tel:+911234567890');
  };
  
  StatusBar.setBarStyle('light-content');
  
  const faqs = [
    {
      question: 'How do I make my first gold investment?',
      answer: 'To make your first gold investment, navigate to the Gold Investment section from the homepage. Choose an amount, select your payment method, and confirm your transaction. Your digital gold will be available in your portfolio immediately after successful payment.'
    },
    {
      question: 'What fees are involved in buying digital gold?',
      answer: 'There is a small transaction fee of 0.5% when buying digital gold. This covers the storage, insurance, and maintenance of your physical gold holdings. There are no annual maintenance charges or hidden fees.'
    },
    {
      question: 'How is my digital gold secured?',
      answer: 'Your digital gold is backed by physical gold stored in secure vaults with 24/7 surveillance. All holdings are fully insured against theft and damage. Digital records are secured using blockchain technology for transparency and safety.'
    },
    {
      question: 'Can I convert my digital gold to physical gold?',
      answer: 'Yes, you can convert your digital gold to physical gold coins or bars once you have accumulated a minimum of 1 gram. Navigate to your Gold Portfolio and select "Convert to Physical" to initiate the process.'
    },
    {
      question: 'How does the round-up savings feature work?',
      answer: 'The round-up savings feature automatically rounds up your everyday purchases to the nearest ₹10, ₹20, ₹50, or ₹100 (as per your settings) and invests the difference in digital gold. This allows you to accumulate gold while you spend.'
    }
  ];
  
  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading */}
        <Animated.View style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}>
          <Text style={styles.header}>Help & Support</Text>
          <Text style={styles.subheader}>
            Have questions? We're here to help with all your Digital Gold needs
          </Text>
        </Animated.View>
        
        {/* Contact options */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          
          <View style={styles.supportOptionsContainer}>
            <SupportOption 
              icon="email-outline"
              title="Email Support"
              description="Get help via email within 24 hours"
              onPress={handleEmailSupport}
            />
            
            <SupportOption 
              icon="chat-outline"
              title="Live Chat"
              description="Chat with our support team instantly"
              onPress={handleChatSupport}
            />
            
            <SupportOption 
              icon="phone-outline"
              title="Call Support"
              description="Speak with a representative directly"
              onPress={handleCallSupport}
            />
          </View>
        </View>
        
        {/* FAQ section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <FAQItem 
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </View>
        </View>
        
        {/* Still need help section */}
        <View style={styles.stillNeedHelpContainer}>
          <Text style={styles.stillNeedHelpText}>Still need help with something?</Text>
          <Text style={styles.stillNeedHelpDescription}>
            Our dedicated support team is available 7 days a week from 9 AM to 9 PM.
          </Text>
          
          <TouchableOpacity
            style={styles.contactButton}
            activeOpacity={0.8}
            onPress={handleContactSupport}
          >
            <LinearGradient
              colors={COLORS.purpleGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Icon name="email-send-outline" size={20} color={COLORS.text} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>
                {emailSent ? 'Request Sent!' : 'Contact Support Team'}
              </Text>
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
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: COLORS.textDim,
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  supportOptionsContainer: {
    marginBottom: 8,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.2)',
    ...SHADOWS.small,
  },
  supportIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(106, 78, 156, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 13,
    color: COLORS.textDim,
  },
  faqContainer: {
    marginBottom: 8,
  },
  faqItem: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 156, 0.2)',
    ...SHADOWS.small,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    paddingRight: 8,
  },
  faqAnswer: {
    overflow: 'hidden',
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.textDim,
    lineHeight: 20,
    padding: 16,
    paddingTop: 0,
  },
  stillNeedHelpContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(106, 78, 156, 0.08)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  stillNeedHelpText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  stillNeedHelpDescription: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HelpAndSupport;