import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/theme.context';
import { CMSRepositoryImpl } from '../../data/repositories/cms.repository.impl';
import { HomeLayout } from '../../domain/entities/home-layout';
import { GetHomeLayoutUseCase } from '../../domain/use-cases/get-home-layout.use-case';
import HomeSectionRenderer from '../components/HomeSectionRenderer';
import SearchInput from '../components/SearchInput';

const { width } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const HomeScreen = () => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();

    const isDark = theme === 'dark';
    
    // State for HomeLayout
    const [layout, setLayout] = React.useState<HomeLayout | null>(null);

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const bgColor = isDark ? '#000000' : '#FFFFFF';
    const secondaryText = isDark ? '#AAAAAA' : '#666666';

    React.useEffect(() => {
        const fetchLayout = async () => {
             // In a real app we'd use DI container to get the repo
            const repo = new CMSRepositoryImpl();
            const useCase = new GetHomeLayoutUseCase(repo);
            const data = await useCase.execute();
            setLayout(data);
        };

        fetchLayout();
    }, []);


    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]} 
                showsVerticalScrollIndicator={false}
            >
                {/* Header / Search */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text style={[styles.logo, { color: textColor }]}>STORE</Text>
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <TouchableOpacity onPress={toggleTheme}>
                                <Ionicons 
                                    name={isDark ? 'moon' : 'sunny'} 
                                    size={24} 
                                    color={textColor} 
                                />
                            </TouchableOpacity>

                        </View>
                    </View>
                    <SearchInput />
                </View>

                {/* Dynamic Sections */}
                {layout?.sections.map((section, index) => (
                    <HomeSectionRenderer 
                        key={index} 
                        section={section} 
                        textColor={textColor}
                        secondaryText={secondaryText}
                    />
                ))}

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
        gap: 15,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 5,
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 1,
        paddingHorizontal: 20,
        marginBottom: 20,
        textTransform: 'uppercase',
    },
    featuredGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 15,
    },
    productCard: {
        width: (width - 55) / 2,
        marginBottom: 10,
    },
    productImage: {
        width: '100%',
        height: 250,
        backgroundColor: '#f8f8f8',
        marginBottom: 10,
    },
    productInfo: {
        alignItems: 'flex-start',
    },
    productName: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    productPrice: {
        fontSize: 12,
        fontWeight: '400',
    },
});

export default HomeScreen;
