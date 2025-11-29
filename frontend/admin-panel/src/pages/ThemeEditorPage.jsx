import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; 
import api from '../api';
import '../css/dashboard.css';

// DND Kit
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Bileşen Kayıt Defteri (Registry)
import { COMPONENT_MAP, AVAILABLE_COMPONENTS } from '../theme/componentRegistry';

// Sürüklenebilir Öğe (Wrapper)
const SortableItem = ({ id, componentData, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: '15px',
        position: 'relative',
        cursor: 'grab'
    };

    // Registry'den ilgili bileşeni bul
    const ComponentToRender = COMPONENT_MAP[componentData.type]?.component;

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="editor-component-wrapper">
            {/* Önizleme Alanı */}
            <div {...listeners} className="component-preview border rounded bg-white p-2 shadow-sm position-relative">
                {ComponentToRender ? <ComponentToRender data={componentData.data} /> : <div className="p-3 text-danger">Bilinmeyen Bileşen</div>}
                
                {/* Silme Butonu */}
                <button 
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle"
                    style={{ width: '30px', height: '30px', padding: 0, zIndex: 10 }}
                    onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                    onMouseDown={(e) => e.stopPropagation()} // Sürüklemeyi engellemek için
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

const ThemeEditorPage = () => {
    const { pageId } = useParams();
    const navigate = useNavigate();
    
    const [pageComponents, setPageComponents] = useState([]);
    const [pageName, setPageName] = useState('Yükleniyor...');
    const [loading, setLoading] = useState(true);

    // Sayfa Verisini Çek
    useEffect(() => {
        if (!pageId) return;
        const fetchPageData = async () => {
            try {
                const res = await api.get(`/website-pages/${pageId}`);
                setPageName(res.data.name);
                // Eğer daha önce kaydedilmiş bileşenler varsa yükle, yoksa boş dizi
                setPageComponents(res.data.components || []);
            } catch (error) {
                console.error('Sayfa verisi alınamadı');
                alert('Sayfa bulunamadı.');
                navigate('/theme-settings');
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, [pageId, navigate]);

    // Sürükleme Bittiğinde Sıralama
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setPageComponents((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Yeni Bileşen Ekle
    const handleAddComponent = (type) => {
        const newComponent = {
            id: uuidv4(),
            type: type,
            data: COMPONENT_MAP[type].defaultData 
        };
        setPageComponents([...pageComponents, newComponent]);
    };

    // Bileşen Sil
    const handleRemoveComponent = (id) => {
        if(window.confirm("Bu alanı silmek istediğinize emin misiniz?")) {
            setPageComponents(pageComponents.filter(c => c.id !== id));
        }
    };

    // Kaydet
    const handleSavePage = async () => {
        try {
            await api.put(`/website-pages/${pageId}`, { components: pageComponents });
            alert("✅ Sayfa düzeni kaydedildi.");
        } catch (error) {
            alert("❌ Kaydedilemedi.");
        }
    };

    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center">Yükleniyor...</div>;

    return (
        <div className="d-flex flex-column vh-100 bg-light">
            {/* HEADER */}
            <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm" style={{ height: '60px', zIndex: 100 }}>
                <div className="d-flex align-items-center gap-3">
                    <button onClick={() => navigate('/theme-settings')} className="btn btn-light btn-sm">← Geri</button>
                    <h5 className="m-0 fw-bold text-primary">{pageName} Düzenleniyor</h5>
                </div>
                <button onClick={handleSavePage} className="btn btn-success btn-sm px-4 fw-bold">💾 Kaydet</button>
            </header>

            {/* EDİTÖR ALANI */}
            <div className="d-flex flex-grow-1 overflow-hidden">
                
                {/* 1. CANVAS (ORTA) */}
                <div className="flex-grow-1 d-flex justify-content-center p-4 overflow-auto" style={{ backgroundColor: '#f0f2f5' }}>
                    <div className="bg-white shadow-lg page-canvas" style={{ width: '100%', maxWidth: '1000px', minHeight: '800px', borderRadius: '8px', padding: '20px' }}>
                        
                        {pageComponents.length === 0 ? (
                            <div className="text-center py-5 mt-5 text-muted border-2 border-dashed rounded bg-light">
                                <h4>Sayfa Boş</h4>
                                <p>Sağ menüden bileşen ekleyerek başlayın.</p>
                            </div>
                        ) : (
                            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={pageComponents} strategy={verticalListSortingStrategy}>
                                    {pageComponents.map((comp) => (
                                        <SortableItem 
                                            key={comp.id} 
                                            id={comp.id} 
                                            componentData={comp} 
                                            onRemove={handleRemoveComponent}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}

                    </div>
                </div>

                {/* 2. SIDEBAR (SAĞ) */}
                <div className="bg-white border-start shadow-sm" style={{ width: '300px', minWidth: '300px', overflowY: 'auto' }}>
                    <div className="p-3 border-bottom bg-light">
                        <h6 className="fw-bold m-0">Bileşen Ekle</h6>
                    </div>
                    
                    <div className="p-3">
                        <div className="row g-2">
                            {AVAILABLE_COMPONENTS.map((item) => (
                                <div className="col-12" key={item.type}>
                                    <div 
                                        className="p-3 border rounded cursor-pointer d-flex align-items-center gap-3 bg-white hover-shadow"
                                        onClick={() => handleAddComponent(item.type)}
                                        style={{ transition: 'all 0.2s' }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                        <div>
                                            <h6 className="m-0 fw-bold" style={{ fontSize: '0.9rem' }}>{item.label}</h6>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Ekle</small>
                                        </div>
                                        <div className="ms-auto text-primary fw-bold">+</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ThemeEditorPage;