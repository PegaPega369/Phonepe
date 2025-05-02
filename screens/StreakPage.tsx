import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  FlatList,
  StatusBar
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

interface RouteParams {
  uid: string;
}

interface LeaderboardUser {
  id: number;
  name: string;
  avatar: string;
  streakDays: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalSavings: number;
  lastSavedDays: number[];
  weekSavingRate: number;
}

interface LeaderboardItemProps {
  item: LeaderboardUser;
  index: number;
}

// Separate LeaderboardItem component to fix hooks issue
const LeaderboardItem = ({ item, index }: LeaderboardItemProps) => {
  const itemOpacity = useRef(new Animated.Value(0)).current;
  const itemSlide = useRef(new Animated.Value(15)).current;
  
  useEffect(() => {
    Animated.sequence([
      Animated.delay(600 + index * 100),
      Animated.parallel([
        Animated.timing(itemOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(itemSlide, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index]);
  
  return (
    <Animated.View 
      style={[
        styles.leaderboardItem,
        item.isCurrentUser && styles.currentUserItem,
        {
          opacity: itemOpacity,
          transform: [{ translateY: itemSlide }],
        }
      ]}
    >
      {/* Rank */}
      <View style={styles.rankContainer}>
        {item.rank <= 3 ? (
          <FontAwesome5 
            name="crown" 
            size={18} 
            color={
              item.rank === 1 
                ? '#FFD700' 
                : item.rank === 2 
                  ? '#C0C0C0' 
                  : '#CD7F32'
            } 
          />
        ) : (
          <Text style={styles.rankText}>{item.rank}</Text>
        )}
      </View>
      
      {/* User info */}
      <View style={styles.userInfoContainer}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: item.avatar }} 
            style={styles.avatar} 
          />
          {item.isCurrentUser && (
            <View style={styles.currentUserIndicator} />
          )}
        </View>
        <Text 
          style={[
            styles.userName,
            item.isCurrentUser && styles.currentUserName
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </View>
      
      {/* Streak badge */}
      <View style={styles.streakBadge}>
        <FontAwesome5 name="fire" size={12} color="#FF5E3A" style={styles.streakIcon} />
        <Text style={styles.streakText}>{item.streakDays} days</Text>
      </View>
    </Animated.View>
  );
};

// Weekly calendar component
const WeeklyCalendar = ({ streakData, slideAnim, statsOpacity }) => {
  const days = [6, 5, 4, 3, 2, 1, 0]; // Days ago (0 = today)
  
  // Generate week days 
  const getDayOfWeek = (index: number) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    const offset = (7 - index) % 7;
    return days[(today - offset + 7) % 7];
  };
  
  return (
    <Animated.View 
      style={[
        styles.calendarContainer,
        {
          opacity: statsOpacity,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Text style={styles.sectionTitle}>Last 7 Days</Text>
      
      <View style={styles.daysContainer}>
        {days.map((day) => {
          const isSaved = streakData.lastSavedDays.includes(day);
          return (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{getDayOfWeek(day)}</Text>
              <View style={[
                styles.dayCircle,
                isSaved ? styles.savedDay : styles.notSavedDay
              ]}>
                {isSaved && <FontAwesome5 name="check" size={14} color="#FFFFFF" />}
              </View>
            </View>
          );
        })}
      </View>
      
      <View style={styles.savingRateContainer}>
        <Text style={styles.savingRateText}>
          Your saving rate this week: 
          <Text style={styles.savingRateHighlight}> {streakData.weekSavingRate}%</Text>
        </Text>
      </View>
    </Animated.View>
  );
};

const StreakPage: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { uid } = route.params as RouteParams;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const flameScale = useRef(new Animated.Value(1)).current;
  
  // Mock data - would be fetched from API in real app
  const [streakData] = useState<StreakData>({
    currentStreak: 42,
    longestStreak: 58,
    totalSavings: 25800,
    lastSavedDays: [1, 2, 3, 5, 6], // Last 7 days (0 = today, 6 = 6 days ago)
    weekSavingRate: 92,
  });
  
  const [leaderboard] = useState<LeaderboardUser[]>([
    { id: 1, name: 'Sarah Williams', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', streakDays: 86, rank: 1 },
    { id: 2, name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', streakDays: 77, rank: 2 },
    { id: 3, name: 'Aisha Patel', avatar: 'https://randomuser.me/api/portraits/women/26.jpg', streakDays: 65, rank: 3 },
    { id: 4, name: 'John Smith', avatar: 'https://randomuser.me/api/portraits/men/41.jpg', streakDays: 59, rank: 4 },
    { id: 5, name: 'Alex Johnson', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', streakDays: 42, rank: 5, isCurrentUser: true },
    { id: 6, name: 'Mia Rodriguez', avatar: 'https://randomuser.me/api/portraits/women/38.jpg', streakDays: 37, rank: 6 },
    { id: 7, name: 'Raj Kumar', avatar: 'https://randomuser.me/api/portraits/men/37.jpg', streakDays: 35, rank: 7 },
    { id: 8, name: 'Olivia Smith', avatar: 'https://randomuser.me/api/portraits/women/17.jpg', streakDays: 31, rank: 8 },
  ]);
  
  useEffect(() => {
    // Main card animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Stats animation with delay
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Continuous flame animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameScale, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(flameScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Render leaderboard items safely
  const renderLeaderboardItem = ({ item, index }) => {
    return <LeaderboardItem item={item} index={index} />;
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Your Streaks</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Streak Card */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim }
                ],
              }
            ]}
          >
            <LinearGradient
              colors={['#231537', '#4B0082']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBanner}
            >
              {/* Flame icon with glow */}
              <View style={styles.flameContainer}>
                <Animated.View 
                  style={[
                    styles.flameBackground,
                    {
                      transform: [{ scale: flameScale }],
                    }
                  ]}
                >
                  <LinearGradient
                    colors={['#FF5E3A', '#FFBB00']}
                    style={styles.flameGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <FontAwesome5 name="fire" size={24} color="#FFFFFF" style={styles.flameIcon} />
                </Animated.View>
              </View>
              
              {/* Current streak */}
              <View style={styles.currentStreakContainer}>
                <Text style={styles.currentStreakLabel}>Current Streak</Text>
                <View style={styles.streakValueContainer}>
                  <Text style={styles.streakValue}>{streakData.currentStreak}</Text>
                  <Text style={styles.streakUnit}>days</Text>
                </View>
              </View>
              
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{streakData.longestStreak}</Text>
                  <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>₹{streakData.totalSavings.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Saved While on Streak</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
        
        {/* Week Calendar */}
        <View style={styles.sectionContainer}>
          <WeeklyCalendar 
            streakData={streakData} 
            slideAnim={slideAnim} 
            statsOpacity={statsOpacity} 
          />
        </View>
        
        {/* Leaderboard */}
        <View style={styles.sectionContainer}>
          <Animated.View 
            style={[
              styles.leaderboardContainer,
              {
                opacity: statsOpacity,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.leaderboardHeader}>
              <Text style={styles.sectionTitle}>Leaderboard</Text>
              <TouchableOpacity style={styles.timeframeButton}>
                <Text style={styles.timeframeText}>This Month</Text>
                <Icon name="chevron-down" size={16} color="#CCCCCC" style={styles.timeframeIcon} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={leaderboard}
              renderItem={renderLeaderboardItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              style={styles.leaderboardList}
            />
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>See Full Leaderboard</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
      
      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['#231537', '#4B0082']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity 
            style={styles.proceedButton}
            activeOpacity={0.8}
          >
            <Text style={styles.proceedButtonText}>Keep the streak going! Invest today</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionContainer: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  gradientBanner: {
    borderRadius: 16,
    padding: 24,
    position: 'relative',
  },
  flameContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  flameBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5E3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  flameGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  flameIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  currentStreakContainer: {
    marginTop: 10,
  },
  currentStreakLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  streakValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  streakUnit: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  savedDay: {
    backgroundColor: '#9D6DF9',
    borderColor: '#9D6DF9',
  },
  notSavedDay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  savingRateContainer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  savingRateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  savingRateHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  leaderboardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeframeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  timeframeText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  timeframeIcon: {
    marginLeft: 4,
  },
  leaderboardList: {
    marginTop: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
  },
  currentUserItem: {
    backgroundColor: 'rgba(157, 109, 249, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.2)',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentUserIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9D6DF9',
    borderWidth: 2,
    borderColor: 'black',
  },
  userName: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    width: width * 0.35, // Limit width to prevent text overflow
  },
  currentUserName: {
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakIcon: {
    marginRight: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9D6DF9',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  gradientButton: {
    borderRadius: 12,
  },
  proceedButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StreakPage;