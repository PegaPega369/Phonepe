import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  Keyboard,
  FlatList
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

interface RouteParams {
  uid?: string;
}

// Assumed theme/colors based on the HelpAndSupport component
const COLORS = {
  background: '#121212',
  cardDark: '#1E1E1E',
  text: '#FFFFFF',
  textDim: '#A0A0A0',
  primary: '#6A4E9C',
  accent: '#FFD700', // Gold color
  purpleGradient: ['#8A63D2', '#6A4E9C'],
  messageBackground: '#2A2A2A',
  userMessageBackground: '#6A4E9C',
  agentMessageBackground: '#333333',
  inputBackground: '#262626',
  separatorColor: '#333333',
  online: '#4CAF50',
  offline: '#CF6679',
  typing: '#FFD700'
};

const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  }
};

// Message interface
interface Message {
  id: number;
  text: string;
  timestamp: Date;
  senderId: number;
  isUser: boolean; // true if the message is from the current user
  isRead: boolean;
}

// User interface
interface User {
  id: number;
  name: string;
  profileImage?: string;
  isOnline: boolean;
  lastActive?: Date;
}

// Typing indicator component
const TypingIndicator = () => {
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => animateDot(dot, delay));
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, [dot1, dot2, dot3]);

  const getDotStyle = (dot: Animated.Value) => {
    return {
      transform: [
        {
          translateY: dot.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5]
          })
        }
      ],
      opacity: dot.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1]
      })
    };
  };

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingContent}>
        <Animated.View style={[styles.typingDot, getDotStyle(dot1)]} />
        <Animated.View style={[styles.typingDot, getDotStyle(dot2)]} />
        <Animated.View style={[styles.typingDot, getDotStyle(dot3)]} />
      </View>
    </View>
  );
};

// Message item component
const MessageItem = ({ message, isLastMessage }: { message: Message, isLastMessage: boolean }) => {
  const isUser = message.isUser;
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.agentMessageContainer,
        isLastMessage && { marginBottom: 16 }
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.agentMessageBubble
        ]}
      >
        <Text style={styles.messageText}>{message.text}</Text>
        <Text style={styles.messageTime}>{messageTime}</Text>
      </View>
      {!isUser && !message.isRead && (
        <View style={styles.unreadIndicator} />
      )}
    </View>
  );
};

// Feedback component for after conversation is complete
const FeedbackComponent = ({ onSubmit }: { onSubmit: (rating: number, feedback: string) => void }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, feedback);
  };

  return (
    <View style={styles.feedbackContainer}>
      <Text style={styles.feedbackTitle}>Rate your experience</Text>
      <Text style={styles.feedbackSubtitle}>How was your conversation with our agent?</Text>
      
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity 
            key={star} 
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Icon 
              name={rating >= star ? "star" : "star-outline"} 
              size={30} 
              color={rating >= star ? COLORS.accent : COLORS.textDim} 
            />
          </TouchableOpacity>
        ))}
      </View>
      
      <TextInput
        style={styles.feedbackInput}
        placeholder="Tell us about your experience (optional)"
        placeholderTextColor={COLORS.textDim}
        multiline
        numberOfLines={3}
        value={feedback}
        onChangeText={setFeedback}
      />
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <LinearGradient
          colors={COLORS.purpleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.submitButtonGradient}
        >
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

interface ChatInterfaceProps {
  userId: number;
  conversationId?: number; // Optional, if starting a new conversation
  initialMessages?: Message[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userId,
  conversationId,
  initialMessages = []
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const uid = params?.uid || 'default-uid';
  
  // Use uid to track and identify the user
  console.log(`Chat initialized with UID: ${uid}`);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [agent, setAgent] = useState<User | null>(null);
  const scrollViewRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  
  const demoAgentData: User = {
    id: 1,
    name: "Sarah Johnson",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces",
    isOnline: true,
    lastActive: new Date()
  };

  // For demo purposes, initialize with the demo agent
  useEffect(() => {
    // In a real app, this would be fetched from an API
    setAgent(demoAgentData);
    
    // Simulate receiving a welcome message
    if (messages.length === 0) {
      setTimeout(() => {
        simulateAgentMessage(
          "Welcome to DigitalGold support! How can I help you today with your digital gold investments?"
        );
      }, 1000);
    }
    
    // Set up WebSocket connection
    setupWebSocket();
    
    return () => {
      // Clean up WebSocket connection
      closeWebSocket();
    };
  }, []);

  const setupWebSocket = () => {
    // In a real app, this would establish a WebSocket connection
    console.log("Setting up WebSocket connection...");
    // websocket = new WebSocket('wss://api.example.com/ws');
    // websocket.onmessage = handleWebSocketMessage;
  };

  const closeWebSocket = () => {
    // In a real app, this would close the WebSocket connection
    console.log("Closing WebSocket connection...");
    // if (websocket) websocket.close();
  };

  const handleWebSocketMessage = (event: any) => {
    // In a real app, this would handle incoming WebSocket messages
    // const data = JSON.parse(event.data);
    // if (data.type === 'message') {
    //   addMessage({
    //     id: data.id,
    //     text: data.text,
    //     timestamp: new Date(data.timestamp),
    //     senderId: data.senderId,
    //     isUser: data.senderId === userId,
    //     isRead: false
    //   });
    // } else if (data.type === 'typing') {
    //   setIsTyping(data.isTyping);
    // }
  };

  const simulateAgentMessage = (text: string) => {
    if (!agent) return;
    
    // First show typing indicator but for a shorter time for quicker responses
    setIsTyping(true);
    
    // Create the message immediately to update UI faster
    const newMessage: Message = {
      id: Date.now(),
      text,
      timestamp: new Date(),
      senderId: agent.id,
      isUser: false,
      isRead: false
    };
    
    // Add the message immediately for faster rendering
    // But keep typing indicator briefly for a better UX
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to the new message immediately
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }, 500); // Reduced delay from 1500ms to 500ms for faster response
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Create new message
    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      timestamp: new Date(),
      senderId: userId,
      isUser: true,
      isRead: false
    };
    
    // Add message to state
    setMessages(prev => [...prev, newMessage]);
    
    // Clear input
    setInputText('');
    
    // In a real app, send the message to the server
    // sendMessageToServer(newMessage);
    
    // For demo purposes, simulate agent response
    handleDemoResponse(inputText);
  };

  const handleDemoResponse = (userMessage: string) => {
    // Simple demo response logic
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      simulateAgentMessage("Hello! How can I assist you with your digital gold investments today?");
    } else if (lowerMessage.includes('gold') && (lowerMessage.includes('price') || lowerMessage.includes('rate'))) {
      simulateAgentMessage("The current gold rate is ₹6,250 per gram. Our rates are updated every 15 minutes to reflect real-time market prices.");
    } else if (lowerMessage.includes('withdraw') || lowerMessage.includes('sell')) {
      simulateAgentMessage("To sell your digital gold, go to your portfolio, select the amount you want to sell, and choose 'Sell Gold'. The money will be credited to your bank account within 24 hours.");
    } else if (lowerMessage.includes('convert') || lowerMessage.includes('physical')) {
      simulateAgentMessage("You can convert your digital gold to physical gold once you have at least 1 gram. Go to your portfolio, select 'Convert to Physical', choose your preferred design, and provide your delivery address.");
    } else if (lowerMessage.includes('thank')) {
      simulateAgentMessage("You're welcome! Is there anything else I can help you with?");
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
      simulateAgentMessage("Thank you for contacting DigitalGold support. Have a great day!");
      // Show feedback after a delay
      setTimeout(() => {
        setShowFeedback(true);
      }, 2000);
    } else {
      simulateAgentMessage("I'd be happy to help you with that. Could you please provide more details so I can assist you better?");
    }
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    // In a real app, send the feedback to the server
    console.log("Feedback submitted:", { rating, feedback });
    
    // Hide feedback form and show thank you message
    setShowFeedback(false);
    
    // Add a thank you message
    simulateAgentMessage("Thank you for your feedback! We're always working to improve our service.");
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        {agent && (
          <View style={styles.agentInfo}>
            <Image 
              source={{ uri: agent.profileImage }} 
              style={styles.agentAvatar} 
            />
            <View style={styles.agentDetails}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, {
                  backgroundColor: agent.isOnline ? COLORS.online : COLORS.offline
                }]} />
                <Text style={styles.statusText}>
                  {agent.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.moreButton}>
          <Icon name="dots-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      {/* Messages */}
      {messages.length === 0 && !isTyping ? (
        <View style={styles.emptyContainer}>
          <Icon name="chat-outline" size={60} color={COLORS.textDim} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation by sending a message</Text>
        </View>
      ) : (
        <FlatList
          ref={scrollViewRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <MessageItem 
              message={item} 
              isLastMessage={index === messages.length - 1} 
            />
          )}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        />
      )}
      
      {/* Typing indicator */}
      {isTyping && (
        <TypingIndicator />
      )}
      
      {/* Feedback form */}
      {showFeedback && (
        <FeedbackComponent onSubmit={handleFeedbackSubmit} />
      )}
      
      {/* Input area */}
      {!showFeedback && (
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Icon name="paperclip" size={22} color={COLORS.textDim} />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textDim}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          {inputText.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <LinearGradient
                colors={COLORS.purpleGradient}
                style={styles.sendButtonGradient}
              >
                <Icon name="send" size={20} color={COLORS.text} />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <Icon name="microphone" size={22} color={COLORS.textDim} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separatorColor,
    backgroundColor: COLORS.cardDark,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  agentDetails: {
    flexDirection: 'column',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textDim,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    marginTop: 8,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  agentMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    paddingBottom: 8,
    ...SHADOWS.small,
  },
  userMessageBubble: {
    backgroundColor: COLORS.userMessageBackground,
    borderBottomRightRadius: 4,
  },
  agentMessageBubble: {
    backgroundColor: COLORS.agentMessageBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textDim,
    alignSelf: 'flex-end',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: 4,
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  typingContent: {
    flexDirection: 'row',
    backgroundColor: COLORS.agentMessageBackground,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    ...SHADOWS.small,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textDim,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.separatorColor,
    backgroundColor: COLORS.cardDark,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    color: COLORS.text,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    margin: 16,
    backgroundColor: COLORS.cardDark,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.medium,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  feedbackInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    padding: 12,
    color: COLORS.text,
    marginBottom: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  submitButtonGradient: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatInterface;