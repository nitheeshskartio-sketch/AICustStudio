import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { product } from '../data/product';
import ProductImages from '../components/ProductImages';
import { ShoppingCart, Palette, Download } from 'lucide-react';

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const [editedDesign, setEditedDesign] = useState<string | null>(null);

  useEffect(() => {
    const savedDesign = localStorage.getItem('tshirtDesign');
    if (savedDesign) {
      setEditedDesign(savedDesign);
    }
  }, []);

  const handleDownload = () => {
    if (editedDesign) {
      const link = document.createElement('a');
      link.href = editedDesign;
      link.download = 'my-tshirt-design.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-lg-6">
          <ProductImages 
            front={product.images.front} 
            back={product.images.back} 
            editedDesign={editedDesign} 
          />
        </div>
        
        <div className="col-lg-6">
          <div className="ps-lg-4">
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><a href="#" className="text-decoration-none">Home</a></li>
                <li className="breadcrumb-item"><a href="#" className="text-decoration-none">Apparel</a></li>
                <li className="breadcrumb-item active" aria-current="page">T-Shirts</li>
              </ol>
            </nav>

            <h1 className="display-5 fw-bold mb-3">{product.name}</h1>
            <div className="d-flex align-items-center gap-3 mb-4">
              <h2 className="text-primary mb-0">${product.price}</h2>
              <span className="badge bg-success">In Stock</span>
            </div>

            <p className="text-muted mb-4 lead">
              {product.description}
            </p>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Available Colors</h6>
              <div className="d-flex gap-2">
                {product.colors.map(color => (
                  <div 
                    key={color} 
                    className="rounded-circle border border-2" 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: color.toLowerCase(),
                      cursor: 'pointer'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Select Size</h6>
              <div className="d-flex gap-2">
                {product.sizes.map(size => (
                  <button key={size} className="btn btn-outline-secondary px-4 py-2">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-grid gap-3 d-sm-flex pt-4 border-top">
              <button 
                className="btn btn-primary btn-lg px-5 d-flex align-items-center justify-content-center gap-2"
                onClick={() => navigate('/studio')}
              >
                <Palette size={20} /> Customize Studio
              </button>
              
              <button className="btn btn-dark btn-lg px-5 d-flex align-items-center justify-content-center gap-2">
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </div>

            {editedDesign && (
              <div className="mt-5 p-4 bg-light rounded-4 border border-primary border-opacity-25">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="mb-0 fw-bold">Your Custom Design</h5>
                  <button 
                    className="btn btn-outline-success btn-sm d-flex align-items-center gap-2"
                    onClick={handleDownload}
                  >
                    <Download size={16} /> Download PNG
                  </button>
                </div>
                <p className="small text-muted mb-0">
                  This is a preview of your saved design. You can always go back to the studio to make more changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
