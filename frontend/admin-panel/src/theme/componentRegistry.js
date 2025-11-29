// src/theme/componentRegistry.js

// Bloklarınızı buradan içe aktarın (Dosya yollarına dikkat edin)
import SliderBlock from './blocks/SliderBlock'; 

// 1. Bileşen Haritası (Render için)
export const COMPONENT_MAP = {
    'slider': {
        component: SliderBlock,
        label: 'Slider / Galeri',
        defaultData: { images: [], height: '400px' }
    }
    // İleride buraya 'text', 'features' eklenecek
};

// 2. Editörün Sağ Menüsünde Görünecek Liste
export const AVAILABLE_COMPONENTS = [
    { type: 'slider', label: 'Slider Alanı', icon: '🖼️' },
    // { type: 'text', label: 'Metin Alanı', icon: '📝' },
];