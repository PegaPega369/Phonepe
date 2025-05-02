import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SHADOWS } from './theme';

const { width } = Dimensions.get('window');

interface AutomaticSavingsProps {
  onRoundOffPress: () => void;
  onDailySavingsPress: () => void;
  onWeeklySavingsPress: () => void;
  onMonthlySavingsPress: () => void;
}

const AutomaticSavings: React.FC<AutomaticSavingsProps> = ({
  onRoundOffPress,
  onDailySavingsPress,
  onWeeklySavingsPress,
  onMonthlySavingsPress,
}) => {
  const [isToggleOn, setIsToggleOn] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headingText}>Smart Autopilot</Text>
          <LinearGradient
            colors={['#9D6DF9', '#4B0082']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headingUnderline}
          />
        </View>
    
      </View>

      <Text style={styles.descriptiveTextContent}>
        Automate your investments and achieve goals on autopilot
      </Text>

      <View style={styles.cardsContainer}>
        {/* Round-Off Savings */}
        <TouchableHighlight
          style={styles.card}
          onPress={onRoundOffPress}
          underlayColor="rgba(255,255,255,0.05)"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.cardBorder}>
            <View style={styles.cardGradient}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Icon name="coins" size={20} color={COLORS.primary} />
                </View>

                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Round-Off Savings</Text>
                  <Text style={styles.cardDescription}>
                    Automatically save spare change from transactions
                  </Text>

                  <View style={styles.separator} />

                  <View style={styles.cardStatsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>₹2,450</Text>
                      <Text style={styles.statLabel}>Total Saved</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>182</Text>
                      <Text style={styles.statLabel}>Transactions</Text>
                    </View>
                  </View>
                </View>

                <TouchableHighlight
                  style={styles.switchContainer}
                  onPress={() => setIsToggleOn(!isToggleOn)}
                  underlayColor="transparent"
                >
                  <View
                    style={[
                      styles.switchTrack,
                      {
                        backgroundColor: isToggleOn
                          ? 'rgba(157, 109, 249, 0.2)'
                          : 'rgba(50, 50, 50, 0.2)',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        {
                          marginLeft: isToggleOn ? 'auto' : 0,
                          backgroundColor: isToggleOn ? COLORS.primary : '#555555',
                        },
                      ]}
                    >
                      <View style={styles.switchIndicator} />
                    </View>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </TouchableHighlight>

        <View style={styles.optionsContainer}>
          {/* Daily */}
          <TouchableHighlight
            style={styles.optionCard}
            onPress={onDailySavingsPress}
            underlayColor="rgba(255,255,255,0.05)"
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <View style={styles.optionBorder}>
              <View style={styles.optionGradient}>
                <View style={styles.smallIconContainer}>
                  <Icon name="calendar-day" size={18} color="#FFC107" />
                </View>
                <Text style={styles.optionTitle}>Daily</Text>
                <Text style={styles.optionDescription}>₹50/day</Text>
              </View>
            </View>
          </TouchableHighlight>

          {/* Weekly */}
          <TouchableHighlight
            style={styles.optionCard}
            onPress={onWeeklySavingsPress}
            underlayColor="rgba(255,255,255,0.05)"
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <View style={styles.optionBorder}>
              <View style={styles.optionGradient}>
                <View style={styles.smallIconContainer}>
                  <Icon name="calendar-week" size={18} color="#00BFA6" />
                </View>
                <Text style={styles.optionTitle}>Weekly</Text>
                <Text style={styles.optionDescription}>₹200/week</Text>
              </View>
            </View>
          </TouchableHighlight>

          {/* Monthly */}
          <TouchableHighlight
            style={styles.optionCard}
            onPress={onMonthlySavingsPress}
            underlayColor="rgba(255,255,255,0.05)"
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <View style={styles.optionBorder}>
              <View style={styles.optionGradient}>
                <View style={styles.smallIconContainer}>
                  <Icon name="calendar-alt" size={18} color="#29B6F6" />
                </View>
                <Text style={styles.optionTitle}>Monthly</Text>
                <Text style={styles.optionDescription}>₹1,000/mo</Text>
              </View>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 20, // Extra space for navbar
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headingText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headingUnderline: {
    height: 3,
    width: 40,
    borderRadius: 3,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
    shadowColor: '#9D6DF9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  manageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptiveTextContent: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  cardsContainer: {
    gap: 20,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    marginBottom: 5,
  },
  cardBorder: {
    borderRadius: 16,
    padding: 1,
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  cardGradient: {
    borderRadius: 15,
    padding: 16,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(157, 109, 249, 0.07)',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  cardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9D6DF9',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.2,
  },
  switchContainer: {
    marginLeft: 'auto',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  switchTrack: {
    width: 42,
    height: 22,
    borderRadius: 12,
    backgroundColor: 'rgba(157, 109, 249, 0.2)',
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(157, 109, 249, 0.3)',
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    marginLeft: 'auto', // Move to the right for ON position
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionCard: {
    flex: 1,
    borderRadius: 16,
  },
  optionBorder: {
    borderRadius: 16,
    padding: 1,
    height: 110,
    backgroundColor: COLORS.cardDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.small,
  },
  optionGradient: {
    flex: 1,
    borderRadius: 15,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
  },
  smallIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    textAlign: 'center',
  }
});

export default AutomaticSavings;