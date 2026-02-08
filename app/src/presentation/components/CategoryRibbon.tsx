import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CategoryItem } from '../../domain/entities/home-layout';

interface CategoryRibbonProps {
  items: CategoryItem[];
  textColor: string;
  secondaryText: string;
}

const CategoryRibbon = ({ items, textColor, secondaryText }: CategoryRibbonProps) => {
  const router = useRouter();
  console.log("items", items)
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>CATEGORÍAS</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={styles.categoryItem}
            onPress={() => cat.link ? router.push(`/(tabs)${cat.link}`) : router.push('/(tabs)/categories')}
          >
            <View style={[styles.imageContainer, { backgroundColor: textColor === '#000000' ? '#F5F5F5' : '#111', borderColor: textColor === '#000000' ? '#EAEAEA' : '#222' }]}>
             {/* Use cat.image if available, otherwise fallback/placeholder */}
              <Image 
                source={{ uri: cat.image || 'https://via.placeholder.com/100' }} 
                style={styles.categoryImage} 
                resizeMode="cover"
              />
            </View>
            <Text style={[styles.categoryName, { color: textColor }]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#000',
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 20,
  },
  categoryItem: {
    alignItems: 'center',
    width: 80,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35, // Circle
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    fontSize: 11,
    color: '#000',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default CategoryRibbon;
