import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { product } from '../data/product';
import FabricCanvas, { FabricCanvasHandle } from '../components/FabricCanvas';
import Toolbar from '../components/Toolbar';
import ObjectControls from '../components/ObjectControls';
import * as fabric from 'fabric';

const StudioPage: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<FabricCanvasHandle>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');

  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.getCanvasDataUrl();
      localStorage.setItem('tshirtDesign', dataUrl);
      alert('Design saved successfully!');
      navigate('/product');
    }
  };

  const handleDownload = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.getCanvasDataUrl();
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'my-custom-tshirt.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSwitchView = (view: 'front' | 'back') => {
    setCurrentView(view);
    // Note: In a real app, you might want to save the current canvas state 
    // for each side and reload it when switching.
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-0 bg-light">
      <header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <h4 className="mb-0 fw-bold text-primary">T-Shirt Studio</h4>
          <span className="badge bg-secondary opacity-75">Customization Mode</span>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/product')}>Cancel</button>
          <button className="btn btn-primary btn-sm px-4" onClick={handleSave}>Save & Finish</button>
        </div>
      </header>

      <main className="flex-grow-1 d-flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <aside className="h-100 border-end" style={{ width: '240px' }}>
          <Toolbar 
            onAddText={() => canvasRef.current?.addText()}
            onAddRectangle={() => canvasRef.current?.addRectangle()}
            onAddCircle={() => canvasRef.current?.addCircle()}
            onUploadImage={(file) => canvasRef.current?.uploadImage(file)}
            onDeleteSelected={() => canvasRef.current?.deleteSelected()}
            onBringForward={() => canvasRef.current?.bringForward()}
            onSendBackward={() => canvasRef.current?.sendBackward()}
            onResetCanvas={() => canvasRef.current?.resetCanvas()}
            onDownload={handleDownload}
            onSave={handleSave}
            onBackToProduct={() => navigate('/product')}
          />
        </aside>

        {/* Center - Canvas Area */}
        <section className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-4 bg-secondary bg-opacity-10 overflow-auto">
          <div className="mb-3 text-center">
            <span className="badge bg-dark px-3 py-2 text-uppercase letter-spacing-1">
              {currentView} View
            </span>
          </div>
          <FabricCanvas 
            ref={canvasRef}
            backgroundImage={currentView === 'front' ? product.images.front : product.images.back}
            onObjectSelected={setSelectedObject}
          />
          <div className="mt-4 text-muted small text-center max-w-500">
            <p className="mb-0">Drag to move • Resize using corners • Rotate using top handle</p>
            <p className="mb-0">Double click text to edit content</p>
          </div>
        </section>

        {/* Right Sidebar - Controls */}
        <aside className="h-100 border-start" style={{ width: '280px' }}>
          <ObjectControls 
            selectedObject={selectedObject}
            onUpdateProperty={(prop, val) => canvasRef.current?.updateObjectProperty(prop, val)}
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            onSwitchView={handleSwitchView}
          />
        </aside>
      </main>
    </div>
  );
};

export default StudioPage;
