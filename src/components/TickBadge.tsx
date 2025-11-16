import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, Easing, useAnimatedProps, runOnJS, withDelay } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

type TickBadgeProps = {
  size?: number;
  strokeColor?: string;
  onAnimationComplete?: () => void;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function TickBadge({
  size = 100,
  strokeColor = '#047a44',
  onAnimationComplete,
}: TickBadgeProps) {
  const outerScale = useSharedValue(0.6);
  const innerScale = useSharedValue(0.6);
  const checkProgress = useSharedValue(0); // 0..1
  const [pathLength, setPathLength] = useState<number>(0);

  const tickPath =
    'M25 52 L42 70 L76 34';

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerScale.value }],
    shadowOpacity: outerScale.value ? 0.18 : 0,
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const animatedStrokeProps = useAnimatedProps(() => {
    const len = pathLength || 1;
    const dashoffset = len * (1 - checkProgress.value);
    return {
      strokeDashoffset: dashoffset,
    } as any;
  });

  useEffect(() => {
    outerScale.value = withSequence(
      withTiming(1.06, { duration: 320, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    innerScale.value = withDelay(
      140,
      withSequence(withTiming(1.12, { duration: 260, easing: Easing.out(Easing.cubic) }), withSpring(1, { damping: 8 }))
    );

    checkProgress.value = withDelay(
      320,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) {
          outerScale.value = withSpring(1, { damping: 9 });
        //   if (onAnimationComplete) runOnJS(onAnimationComplete)();
        }
      })
    );

  }, []);

  const pathRef = useRef<Path | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const len = pathRef.current?.getTotalLength?.() ?? 0;
        if (len) setPathLength(len);
        else setPathLength(80);
      } catch {
        setPathLength(80);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const ringSize = size;
  const innerSize = Math.round(size * 0.64);
  const svgSize = innerSize; 

  return (
    <Animated.View style={[styles.container, { width: ringSize, height: ringSize }, outerStyle]}>
      <LinearGradient
        colors={['#DFF6EA', '#BFF1D9', '#06b76a']}
        start={[0, 0]}
        end={[1, 1]}
        style={[styles.gradient, { borderRadius: ringSize / 2, padding: Math.round(size * 0.06) }]}
      >
        <Animated.View
          style={[
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: '#F2FFF8',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
            innerStyle,
          ]}
        >
          <Svg
            width={svgSize * 0.9}
            height={svgSize * 0.9}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <Path
              ref={(r) => {
                pathRef.current = r;
              }}
              d={tickPath}
              fill="none"
              stroke="transparent"
              strokeWidth={0.1}
            />
            <AnimatedPath
              d={tickPath}
              stroke={strokeColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={pathLength ? [pathLength] : [80]}
              animatedProps={animatedStrokeProps}
            />
          </Svg>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06b76a',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 6,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});