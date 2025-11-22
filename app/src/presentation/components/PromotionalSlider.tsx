import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const PROMOTIONS = [
  {
    id: '1',
    title: 'Minimalist\nCollection',
    subtitle: 'Up to 40% off',
    buttonText: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    backgroundColor: '#F5F5F5', // Light Grey
    textColor: '#000',
  },
  {
    id: '2',
    title: 'Summer\nEssentials',
    subtitle: 'New Arrivals',
    buttonText: 'Discover',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    backgroundColor: '#1A1A1A', // Dark Grey
    textColor: '#FFF',
  },
  {
    id: '3',
    title: 'Modern\nAccessories',
    subtitle: 'Limited Edition',
    buttonText: 'Explore',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    backgroundColor: '#E0E0E0', 
    textColor: '#000',
  },
];

const PromotionalSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (width - 40));
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: typeof PROMOTIONS[0] }) => (
    <View style={[styles.card, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.contentContainer}>
        <Text style={[styles.subtitle, { color: item.textColor }]}>{item.subtitle}</Text>
        <Text style={[styles.title, { color: item.textColor }]}>{item.title}</Text>
        <TouchableOpacity style={[styles.button, { borderColor: item.textColor }]}>
          <Text style={[styles.buttonText, { color: item.textColor }]}>{item.buttonText}</Text>
        </TouchableOpacity>
      </View>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PROMOTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={width - 40}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      
      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {PROMOTIONS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? '#000' : '#D1D1D1',
                width: index === activeIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 15,
  },
  card: {
    width: width - 40,
    height: 200,
    borderRadius: 0, // Sharp corners for minimalist look
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    padding: 25,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 0, // Sharp corners
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  image: {
    width: '50%',
    height: '110%',
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default PromotionalSlider;
