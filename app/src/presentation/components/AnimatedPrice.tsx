import React, { useEffect } from 'react';
import { StyleSheet, TextInput, TextStyle } from 'react-native';
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({ text: true });

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedPriceProps {
  value: number;
  style?: TextStyle | TextStyle[];
}

export const AnimatedPrice: React.FC<AnimatedPriceProps> = ({ value, style }) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 1000 });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    // Worklet logic for formatting
    const val = animatedValue.value;
    
    // toFixed(2) logic manually or via string manipulation if toFixed isn't available (it is in Hermes)
    // But let's be safe and simple.
    
    const fixed = val.toFixed(2);
    const parts = fixed.split('.');
    
    // Regex replace for thousands separator
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return {
      text: `$ ${integerPart},${parts[1]}`,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      style={[styles.text, style]}
      animatedProps={animatedProps}
      // Initial value prop is ignored by animatedProps but good for initial render if needed
      value={`$ ${value.toFixed(2).replace('.', ',')}`} 
    />
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#000',
    fontSize: 16,
  },
});
