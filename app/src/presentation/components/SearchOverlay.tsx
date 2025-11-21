import { Ionicons } from '@expo/vector-icons';
import {
  BackdropFilter,
  Canvas,
  Circle,
  DisplacementMap,
  Fill,
  Group,
  Oval,
  Shader,
  Skia,
  SweepGradient,
  vec
} from '@shopify/react-native-skia';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- Shaders ---

const RIPPLE_SHADER = `
uniform float2 u_resolution;
uniform float u_progress; // 0 to 1

half4 main(float2 xy) {
    vec2 center = vec2(u_resolution.x * 0.5, u_resolution.y * 0.9); // Start from bottom center
    vec2 uv = xy;
    
    float dist = distance(uv, center);
    
    // Ripple parameters
    float maxRadius = u_resolution.y * 1.2;
    float currentRadius = maxRadius * u_progress;
    float waveWidth = 150.0;
    
    // Calculate wave intensity based on distance from current radius
    float diff = dist - currentRadius;
    float mask = 1.0 - smoothstep(0.0, waveWidth, abs(diff));
    
    // Decay intensity as it expands
    float decay = 1.0 - u_progress;
    float intensity = mask * decay;
    
    // Direction vector for displacement (outwards)
    vec2 dir = normalize(uv - center);
    
    // Map displacement to color channels (0.5 is neutral)
    // We want R and G to represent X and Y displacement
    float dispX = 0.5 + (dir.x * intensity * 0.5); // Scale factor
    float dispY = 0.5 + (dir.y * intensity * 0.5);
    
    return half4(dispX, dispY, 0.0, 1.0);
}
`;

const WaveBackground = ({ progress }: { progress: Animated.SharedValue<number> }) => {
    const shader = useMemo(() => Skia.RuntimeEffect.Make(RIPPLE_SHADER), []);
    
    if (!shader) return null;

    const uniforms = useDerivedValue(() => ({
        u_resolution: vec(width, height),
        u_progress: progress.value,
    }));

    // Only render if progress is active to save resources
    const active = useDerivedValue(() => progress.value > 0 && progress.value < 1);

    // We need to wrap in a component that can handle the conditional rendering cleanly
    // or just return null if not active (though hooks order matters, here we are safe inside the component)
    // But for Skia, it's better to control opacity or just let it run if cheap.
    // However, BackdropFilter is expensive. Let's try to render it only when needed.
    
    // Note: In Reanimated, we can't easily conditionally render based on shared value in JS thread 
    // without runOnJS or using an animated prop. 
    // For now, we'll render it always but with 0 displacement if progress is 0.
    // Actually, let's use a small optimization:
    
    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            <BackdropFilter
                filter={
                    <DisplacementMap channelX="r" channelY="g" scale={50}>
                        <Shader source={shader} uniforms={uniforms} />
                    </DisplacementMap>
                }
            >
                <Fill color="transparent" />
            </BackdropFilter>
        </Canvas>
    );
};

// --- Components ---

const LoadingEyes = ({ isLoading, scale = 1 }: { isLoading: boolean, scale?: number }) => {
    // Animation values
    const eyeScaleY = useSharedValue(1);
    const eyeTranslateX = useSharedValue(0);
    const eyeTranslateY = useSharedValue(0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isLoading) {
            // Blinking animation
            const blink = () => {
                eyeScaleY.value = withSequence(
                    withTiming(0.1, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                );
            };
            const blinkInterval = setInterval(() => {
                if (Math.random() > 0.7) blink();
            }, 2000);

            // Looking around animation
            const lookAround = () => {
                const x = (Math.random() - 0.5) * 6; // -3 to 3
                const y = (Math.random() - 0.5) * 4; // -2 to 2
                eyeTranslateX.value = withSpring(x);
                eyeTranslateY.value = withSpring(y);
            };
            const lookInterval = setInterval(lookAround, 1500);

            // Border rotation
            rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1, false);

            return () => {
                clearInterval(blinkInterval);
                clearInterval(lookInterval);
                eyeScaleY.value = 1;
                eyeTranslateX.value = 0;
                eyeTranslateY.value = 0;
                rotation.value = 0;
            };
        } else {
            rotation.value = 0;
        }
    }, [isLoading]);

    // Corrected: Return array directly, not object with transform property
    const eyeTransform = useDerivedValue(() => {
        return [
            { translateX: eyeTranslateX.value },
            { translateY: eyeTranslateY.value },
            { scaleY: eyeScaleY.value }
        ];
    });

    const rotationTransform = useDerivedValue(() => {
        return [{ rotate: (rotation.value * Math.PI) / 180 }];
    });

    return (
        <View style={[styles.eyesContainer, { transform: [{ scale }] }]}>
            <Canvas style={{ width: 40, height: 40 }}>
                 {/* Rotating Border (Glow Effect) */}
                 {isLoading && (
                    <Group origin={vec(20, 20)} transform={rotationTransform}>
                        <Circle cx={20} cy={20} r={18} style="stroke" strokeWidth={3}>
                            <SweepGradient
                                c={vec(20, 20)}
                                colors={['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#4285F4']}
                            />
                        </Circle>
                    </Group>
                )}
                
                {/* White Background Circle */}
                <Circle cx={20} cy={20} r={14} color="white" />

                {/* Eyes */}
                {isLoading && (
                    <Group>
                         {/* Left Eye */}
                        <Oval 
                            x={12} y={18} width={4} height={6} 
                            color="#c2c2c2" 
                            transform={eyeTransform}
                            origin={vec(14, 21)}
                        />
                        {/* Right Eye */}
                        <Oval 
                            x={24} y={18} width={4} height={6} 
                            color="#c2c2c2" 
                            transform={eyeTransform}
                            origin={vec(26, 21)}
                        />
                    </Group>
                )}
            </Canvas>
            {!isLoading && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                     <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                        <Ionicons name="search" size={18} color="#ccc" />
                     </View>
                </View>
            )}
        </View>
    );
};

const ShimmerText = ({ text, visible, style: customStyle }: { text: string, visible: boolean, style?: any }) => {
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        if (visible) {
            opacity.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 800 }),
                    withTiming(0.5, { duration: 800 })
                ),
                -1,
                true
            );
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    if (!visible) return null;

    return (
        <Animated.Text style={[styles.loadingText, customStyle, animatedStyle]}>{text}</Animated.Text>
    );
};

interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isVisible,
  onClose,
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching'>('idle');
  const [showModal, setShowModal] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Animation Values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(height);
  const scaleY = useSharedValue(1); // For the stretch effect
  const waveProgress = useSharedValue(0); // For the wave effect

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      opacity.value = withTiming(1, { duration: 300 });
      
      // Deploy and Stretch Animation
      // 1. Slide up
      translateY.value = withSpring(0, { 
          damping: 15, 
          stiffness: 120, 
          mass: 0.8 
      });

      // 2. Stretch effect sequence
      scaleY.value = withSequence(
          withTiming(1.05, { duration: 200, easing: Easing.out(Easing.cubic) }), // Stretch slightly as it goes up
          withSpring(1, { damping: 10, stiffness: 150 }) // Snap back to normal
      );

      // 3. Wave Effect - Trigger slightly before it settles or right after
      waveProgress.value = 0;
      waveProgress.value = withDelay(200, withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad) }));

    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(height, { duration: 300 }, (finished) => {
          if (finished) {
              runOnJS(setShowModal)(false);
              runOnJS(setSearchStatus)('idle'); // Reset status on close
              runOnJS(setIsLoading)(false);
          }
      });
      Keyboard.dismiss();
    }
  }, [isVisible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
     transform: [
         { translateY: translateY.value },
         { scaleY: scaleY.value }
     ],
  }));

  const handleSearch = () => {
      if (!query.trim()) return;
      setIsLoading(true);
      setSearchStatus('searching'); // Switch to central loading view
      
      // Simulate loading for demo purposes or wait for actual search
      setTimeout(() => {
          setIsLoading(false);
          onSearch(query);
      }, 3000); // Longer timeout to show off animation
  };

  return (
    <Modal
        transparent
        visible={showModal}
        animationType="none"
        onRequestClose={onClose}
    >
        <Animated.View style={[styles.container, containerStyle]}>
            {/* Wave Distortion - Renders BEHIND the dark overlay but ON TOP of the app content */}
            <WaveBackground progress={waveProgress} />

            {/* Background - Serious Dark Theme */}
            <View style={StyleSheet.absoluteFill}>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
            </View>

            {/* Content */}
            <Animated.View style={[styles.content, contentStyle, { paddingTop: insets.top }]}>
                {/* Close Button (Top Right) */}
                <TouchableOpacity 
                    onPress={onClose} 
                    style={[styles.closeButton, { marginTop: 20 }]} // Added margin top relative to safe area
                >
                    <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>

                {/* Central Loading View */}
                {searchStatus === 'searching' && (
                    <View style={styles.centralLoadingContainer}>
                        <View style={styles.centralLoadingRow}>
                            <LoadingEyes isLoading={true} scale={1.8} />
                            <View style={{ width: 20 }} /> 
                            <ShimmerText 
                                text={`Buscando productos de\n${query}...`} 
                                visible={true} 
                                style={styles.centralLoadingText} 
                            />
                        </View>
                    </View>
                )}

                {/* Suggestions Area (Middle) - Hide when searching */}
                {searchStatus !== 'searching' && (
                    <View style={styles.suggestionsContainer}>
                        {/* Suggestions can go here */}
                    </View>
                )}

                {/* Bottom Input Section - Hide or Fade out when searching? User didn't specify, but usually we keep it or disable it. 
                    Let's keep it but maybe hide the small loader since we have the big one. 
                */}
                <View style={[styles.bottomSection, { paddingBottom: Platform.OS === 'ios' ? 40 : 20 }]}>
                    {/* Loading Text - Only show if NOT searching centrally (or maybe just hide it completely since we have central) */}
                    {searchStatus !== 'searching' && (
                        <View style={{ height: 20, marginBottom: 8, marginLeft: 52 }}>
                            <ShimmerText text="Cargando..." visible={isLoading} />
                        </View>
                    )}

                    <View style={styles.inputRow}>
                        {/* Eyes / Icon - Always show animation if loading, even if central view is active */}
                        <LoadingEyes isLoading={isLoading} />

                        {/* Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Pregunta lo que quieras..."
                            placeholderTextColor="rgba(255,255,255,0.6)"
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            selectionColor="#fff"
                            editable={searchStatus !== 'searching'} // Disable input while searching
                        />

                        {/* Send/Search Button */}
                        <TouchableOpacity onPress={handleSearch} style={styles.sendButton} disabled={searchStatus === 'searching'}>
                            <Ionicons name="arrow-up" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    padding: 8,
    backgroundColor: '#fff', // Solid white for better visibility
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsContainer: {
      flex: 1,
      // Add content styling
  },
  centralLoadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10, // Ensure it's above suggestions
  },
  centralLoadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 40,
  },
  centralLoadingText: {
      fontSize: 18,
      fontWeight: '300',
      color: '#fff',
      marginLeft: 20,
      flex: 1,
      flexWrap: 'wrap',
  },
  bottomSection: {
      paddingHorizontal: 20,
      width: '100%',
  },
  inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1e1e1e',
      borderRadius: 30,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  eyesContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
  },
  input: {
      flex: 1,
      color: '#fff',
      fontSize: 16,
      paddingVertical: 8,
  },
  sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
  },
  loadingText: {
      color: '#ccc',
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.5,
  },
  shimmerTextContainer: {
      position: 'relative',
      overflow: 'hidden',
  },
});
