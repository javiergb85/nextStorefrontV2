import { HomeLayout } from "../../domain/entities/home-layout";

export const DEFAULT_HOME_LAYOUT: HomeLayout = {
    sections: [
        {
            type: 'hero-slider',
            items: [
                {
                    id: '1',
                    title: 'Verano 26',
                    subtitle: 'Hasta 40% de descuento',
                    buttonText: 'Comprar ahora',
                    image: 'https://hanesar.vtexassets.com/assets/vtex.file-manager-graphql/images/05dbea22-e692-4d7d-9940-b60e39b0b429___560dfc19b6e78497c11e2774cb401af1.jpg',
                    backgroundColor: '#F5F5F5', // Light Grey
                    textColor: '#000',
                    link: '/159?map=productClusterIds'
                },
                {
                    id: '2',
                    title: 'Esencial de\ntodos los días',
                    subtitle: 'Confort Diario',
                    buttonText: 'Descubrir',
                    image: 'https://hanesar.vtexassets.com/assets/vtex.file-manager-graphql/images/cecd69c4-221c-48f8-bec7-df0a4c67bf4e___b2b308c053614cfb3d5165217ce7d8d0.jpg',
                    backgroundColor: '#1A1A1A', // Dark Grey
                    textColor: '#FFF',
                    link: '/mujer/ropa-interior'
                },
                {
                    id: '3',
                    title: 'Accesorios\nModernos',
                    subtitle: 'Edición Limitada',
                    buttonText: 'Explorar',
                    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
                    backgroundColor: '#E0E0E0', 
                    textColor: '#000',
                },
            ]
        },
        {
            type: 'categories',
            items: [
                { id: '1', name: 'HOMBRE', iconName: 'man-outline', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&q=80', link: '/hombre' },
                { id: '2', name: 'MUJER', iconName: 'woman-outline', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80', link: '/mujer' },
                { id: '3', name: 'NIÑO/A', iconName: 'happy-outline', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&q=80', link: '/nino-a' },

                { id: '5', name: 'NOVEDADES', iconName: 'star-outline', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', link: '/145?map=productClusterIds' },
            ]
        },
        {
            type: 'featured-products',
            title: 'COLECCIONES',
            items: [
                { id: '1', name: 'HANES ORIGINALS', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', link: '/154?map=productClusterIds' },
                { id: '2', name: 'VERANO 26', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', link: '/159?map=productClusterIds' },
                { id: '3', name: 'MÁS BUSCADOS', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', link: '/146?map=productClusterIds' },
                { id: '4', name: 'MÁS VENDIDOS', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80', link: '/147?map=productClusterIds' },
            ]
        }
    ]
};
