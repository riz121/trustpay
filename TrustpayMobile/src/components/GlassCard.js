import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function GlassCard({ children, style, padding = 16 }) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26,26,46,0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
