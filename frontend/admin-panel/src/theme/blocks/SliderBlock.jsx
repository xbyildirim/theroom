import React from 'react';

const SliderBlock = ({ data }) => {
    return (
        <div style={{ 
            width: '100%', 
            height: '300px', 
            backgroundColor: '#e9ecef', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(45deg, #e9ecef 25%, #f8f9fa 25%, #f8f9fa 50%, #e9ecef 50%, #e9ecef 75%, #f8f9fa 75%, #f8f9fa 100%)',
            backgroundSize: '20px 20px',
            border: '2px dashed #ced4da',
            borderRadius: '8px',
            position: 'relative'
        }}>
            <div className="text-center">
                <h3 className="text-muted fw-bold">SLIDER ALANI Deneme</h3>
                <p className="small text-muted">Görseller buraya gelecek</p>
            </div>
        </div>
    );
};

export default SliderBlock;