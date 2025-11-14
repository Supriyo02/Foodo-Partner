import React, { useEffect, useRef } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { Image } from 'expo-image';
import Animated, { Extrapolate, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

type Slide = {
  id: string;
  uri: number | { uri: string } | string;
  title?: string;
  subtitle?: string;
};

export default function ImageCarousel({ slides = [], height = 520, showDots = true, autoPlay = true, autoPlayInterval = 3500 }: {
  slides: Slide[];
  height?: number;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}) {
  const x = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView | null>(null);

  const onScroll = useAnimatedScrollHandler((event) => {
    x.value = event.contentOffset.x;
  });

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    let mounted = true;
    let idx = 0;

    const id = setInterval(() => {
      if (!mounted) return;
      idx = (idx + 1) % slides.length;
      scrollRef.current?.scrollTo({ x: idx * WINDOW_WIDTH, y: 0, animated: true });
    }, autoPlayInterval);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [autoPlay, autoPlayInterval, slides.length]);

  return (
    <View className="w-full" style={{ height }}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
      >
        {slides.map((s, i) => (
          <View key={s.id} style={{ width: WINDOW_WIDTH, height }} className="items-end">
            <Image
              source={typeof s.uri === "string" ? { uri: s.uri } : s.uri}
              style={{ width: WINDOW_WIDTH, height}}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            
            <View className="absolute left-6 bottom-10 w-[70%]">
              <View className="mb-5">
                <Text className="text-white font-inter-extrabolditalic text-5xl -mb-1">Foodo</Text>
                <Text className="text-white font-inter text-sm">-- kitchen partners --</Text>
              </View>
              {s.title ? (
                <Text className="text-white text-2xl font-inter-bold mb-1">{s.title}</Text>
              ) : null}
              {s.subtitle ? (
                <Text className="text-white text-base opacity-90">{s.subtitle}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {showDots && (
        <View className="absolute left-0 right-0 bottom-4 flex-row justify-center items-center">
          {slides.map((_, i) => {
            const animatedStyle = useAnimatedStyle(() => {
              const progress = interpolate(
                x.value,
                [(i - 1) * WINDOW_WIDTH, i * WINDOW_WIDTH, (i + 1) * WINDOW_WIDTH],
                [0.6, 1.2, 0.6],
                Extrapolate.CLAMP
              );

              const opacity = interpolate(
                x.value,
                [(i - 1) * WINDOW_WIDTH, i * WINDOW_WIDTH, (i + 1) * WINDOW_WIDTH],
                [0.35, 1, 0.35],
                Extrapolate.CLAMP
              );

              return {
                transform: [{ scale: progress }],
                opacity,
              };
            });

            return (
              <Animated.View
                key={`dot-${i}`}
                style={[{ width: 8, height: 8, borderRadius: 8, marginHorizontal: 6, backgroundColor: "#fff" }, animatedStyle]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}