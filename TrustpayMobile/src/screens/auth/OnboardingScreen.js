import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'shield',
    iconColor: '#6366f1',
    bg: 'rgba(99,102,241,0.15)',
    title: 'Secure Payments',
    description:
      'TrustPay holds funds securely until both parties confirm the transaction. No more payment disputes.',
  },
  {
    id: '2',
    icon: 'zap',
    iconColor: '#a78bfa',
    bg: 'rgba(167,139,250,0.15)',
    title: 'Instant Transfers',
    description:
      'Release funds instantly once conditions are met. Track every transaction in real time with full transparency.',
  },
  {
    id: '3',
    icon: 'users',
    iconColor: '#34d399',
    bg: 'rgba(52,211,153,0.15)',
    title: 'Trusted by Businesses',
    description:
      'Join thousands of businesses and freelancers using TrustPay for secure, dispute-free payments across the UAE.',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { setOnboardingDone } = useAuth();

  const markDone = async () => {
    await setOnboardingDone(); // writes AsyncStorage + updates AuthContext state
    // AppNavigator will automatically re-render and show SelectPlan or MainTabs
  };

  const next = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIdx = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      markDone();
    }
  };

  const skip = () => {
    markDone();
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
                <Feather name={item.icon} size={56} color={item.iconColor} />
              </View>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDesc}>{item.description}</Text>
            </View>
          )}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={next} activeOpacity={0.8} style={{ width: '100%' }}>
            <LinearGradient colors={['#6366f1', '#8b5cf6']} style={styles.nextBtn}>
              <Text style={styles.nextBtnText}>
                {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Feather name={currentIndex === SLIDES.length - 1 ? 'check' : 'arrow-right'} size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  skipBtn: { alignSelf: 'flex-end', padding: 20, paddingBottom: 0 },
  skipText: { color: colors.textMuted, fontSize: 16 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 24,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 24, backgroundColor: colors.primary },
  dotInactive: { width: 8, backgroundColor: colors.border },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
