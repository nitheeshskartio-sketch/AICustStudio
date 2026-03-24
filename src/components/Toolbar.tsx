import React, { useRef } from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Image as ImageIcon, 
  Trash2, 
  RotateCcw, 
  Download, 
  Save, 
  ArrowLeft,
  Undo2,
  Redo2
} from 'lucide-react';

interface ToolbarProps {
  onAddText: () => void;
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onUploadImage: (file: File) => void;
  onDeleteSelected: () => void;
  onResetCanvas: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onSave: () => void;
  onBackToProduct: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddText,
  onAddRectangle,
  onAddCircle,
  onUploadImage,
  onDeleteSelected,
  onResetCanvas,
  onUndo,
  onRedo,
  onDownload,
  onSave,
  onBackToProduct
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  return (
    <div className="bg-dark text-white p-3 rounded shadow-sm h-100 d-flex flex-column gap-3 overflow-auto" style={{ minWidth: '200px' }}>
      <h5 className="mb-3 border-bottom pb-2">Tools</h5>
      
      <div className="d-flex gap-1 mb-2">
        <button className="btn btn-outline-light btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1" onClick={onUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={16} /> Undo
        </button>
        <button className="btn btn-outline-light btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1" onClick={onRedo} title="Redo (Ctrl+Y)">
          <Redo2 size={16} /> Redo
        </button>
      </div>

      <button className="btn btn-outline-light d-flex align-items-center gap-2" onClick={onAddText}>
        <Type size={18} /> Add Text
      </button>
      
      <button className="btn btn-outline-light d-flex align-items-center gap-2" onClick={onAddRectangle}>
        <Square size={18} /> Rectangle
      </button>
      
      <button className="btn btn-outline-light d-flex align-items-center gap-2" onClick={onAddCircle}>
        <Circle size={18} /> Circle
      </button>
      
      <button className="btn btn-outline-light d-flex align-items-center gap-2" onClick={() => fileInputRef.current?.click()}>
        <ImageIcon size={18} /> Upload Image
        <input 
          type="file" 
          ref={fileInputRef} 
          className="d-none" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </button>

      <hr className="my-2" />
      
      <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={onDeleteSelected}>
        <Trash2 size={18} /> Delete Selected
      </button>
      
      <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={onResetCanvas}>
        <RotateCcw size={18} /> Clear All
      </button>

      <hr className="my-2 mt-auto" />
      
      <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onSave}>
        <Save size={18} /> Save Design
      </button>
      
      <button className="btn btn-success d-flex align-items-center gap-2" onClick={onDownload}>
        <Download size={18} /> Download PNG
      </button>
      
      <button className="btn btn-secondary d-flex align-items-center gap-2" onClick={onBackToProduct}>
        <ArrowLeft size={18} /> Back to Product
      </button>
    </div>
  );
};

export default Toolbar;
