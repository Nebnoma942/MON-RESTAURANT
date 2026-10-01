import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function SkeletonBox({ width = "100%", height = 16, borderRadius = 8, style }: Props) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [anim]);

  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.muted, colors.border],
  });

  return (
    <Animated.View
      style={[{ width: width as number, height, borderRadius, backgroundColor: bg }, style]}
    />
  );
}

export function RestaurantCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.cardSkeleton, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <SkeletonBox width="100%" height={160} borderRadius={0} />
      <View style={styles.skeletonInfo}>
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox width="40%" height={12} style={{ marginTop: 6 }} />
        <SkeletonBox width="60%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  skeletonInfo: { padding: 14, gap: 0 },
});
