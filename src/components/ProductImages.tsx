import React, { useState } from 'react';

interface ProductImagesProps {
  front: string;
  back: string;
  editedDesign?: string | null;
}

const ProductImages: React.FC<ProductImagesProps> = ({ front, back, editedDesign }) => {
  const [activeImage, setActiveImage] = useState<'front' | 'back' | 'edited'>(editedDesign ? 'edited' : 'front');

  return (
    <div className="d-flex flex-column gap-3">
      <div className="border rounded-4 overflow-hidden shadow-sm bg-white p-3 d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
        <img 
          src={activeImage === 'edited' ? editedDesign! : (activeImage === 'front' ? front : back)} 
          alt="Product" 
          className="img-fluid rounded-3" 
          style={{ maxHeight: '450px', objectFit: 'contain' }}
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="d-flex gap-2 justify-content-center">
        {editedDesign && (
          <div 
            className={`border rounded-3 p-1 cursor-pointer ${activeImage === 'edited' ? 'border-primary border-2' : 'border-light'}`}
            style={{ width: '80px', height: '80px', cursor: 'pointer' }}
            onClick={() => setActiveImage('edited')}
          >
            <img src={editedDesign} alt="Edited" className="img-fluid w-100 h-100 object-fit-cover rounded-2" referrerPolicy="no-referrer" />
          </div>
        )}
        <div 
          className={`border rounded-3 p-1 cursor-pointer ${activeImage === 'front' ? 'border-primary border-2' : 'border-light'}`}
          style={{ width: '80px', height: '80px', cursor: 'pointer' }}
          onClick={() => setActiveImage('front')}
        >
          <img src={front} alt="Front" className="img-fluid w-100 h-100 object-fit-cover rounded-2" referrerPolicy="no-referrer" />
        </div>
        <div 
          className={`border rounded-3 p-1 cursor-pointer ${activeImage === 'back' ? 'border-primary border-2' : 'border-light'}`}
          style={{ width: '80px', height: '80px', cursor: 'pointer' }}
          onClick={() => setActiveImage('back')}
        >
          <img src={back} alt="Back" className="img-fluid w-100 h-100 object-fit-cover rounded-2" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
};

export default ProductImages;
