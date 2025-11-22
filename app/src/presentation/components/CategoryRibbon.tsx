import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CATEGORIES = [
  { id: '1', name: 'Phones', iconName: 'phone-portrait-outline' },
  { id: '2', name: 'Consoles', iconName: 'game-controller-outline' },
  { id: '3', name: 'Laptops', iconName: 'laptop-outline' },
  { id: '4', name: 'Cameras', iconName: 'camera-outline' },
  { id: '5', name: 'Audio', iconName: 'headset-outline' },
  { id: '6', name: 'Watches', iconName: 'watch-outline' },
];

const CategoryRibbon = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
          <Text style={styles.seeAll}>See all {'>'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={styles.categoryItem}
            onPress={() => router.push('/(tabs)/categories')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={cat.iconName as any} size={24} color="#000" />
            </View>
            <Text style={styles.categoryName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
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
    gap: 25,
  },
  categoryItem: {
    alignItems: 'center',
    width: 60,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circle
    backgroundColor: '#F5F5F5', // Very light grey
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  categoryName: {
    fontSize: 10,
    color: '#000',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default CategoryRibbon;
