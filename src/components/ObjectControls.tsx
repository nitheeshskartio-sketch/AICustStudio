import React from 'react';
import * as fabric from 'fabric';
import { ZoomIn, ZoomOut, Lock, Unlock } from 'lucide-react';

interface ObjectControlsProps {
  selectedObject: fabric.FabricObject | null;
  onUpdateProperty: (property: string, value: any) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSwitchView: (view: 'front' | 'back') => void;
}

const ObjectControls: React.FC<ObjectControlsProps> = ({
  selectedObject,
  onUpdateProperty,
  onZoomIn,
  onZoomOut,
  onSwitchView
}) => {
  const isText = selectedObject instanceof fabric.IText;
  const isLocked = selectedObject?.lockMovementX && selectedObject?.lockMovementY;

  return (
    <div className="bg-white p-3 rounded shadow-sm h-100 border d-flex flex-column gap-3 overflow-auto" style={{ minWidth: '250px' }}>
      <h5 className="mb-3 border-bottom pb-2">Controls</h5>
      
      <div className="d-flex flex-column gap-2 mb-3">
        <label className="form-label small fw-bold">View</label>
        <div className="btn-group w-100">
          <button className="btn btn-outline-primary btn-sm" onClick={() => onSwitchView('front')}>Front</button>
          <button className="btn btn-outline-primary btn-sm" onClick={() => onSwitchView('back')}>Back</button>
        </div>
      </div>

      <div className="d-flex flex-column gap-2 mb-3">
        <label className="form-label small fw-bold">Zoom</label>
        <div className="btn-group w-100">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-1" onClick={onZoomIn}>
            <ZoomIn size={14} /> In
          </button>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-1" onClick={onZoomOut}>
            <ZoomOut size={14} /> Out
          </button>
        </div>
      </div>

      {selectedObject ? (
        <div className="d-flex flex-column gap-3">
          <hr className="my-1" />
          <h6 className="mb-0 text-primary">Object Settings</h6>
          
          <div className="d-flex flex-column gap-2">
            <label className="form-label small fw-bold">Color</label>
            <input 
              type="color" 
              className="form-control form-control-color w-100" 
              value={selectedObject.fill as string || '#000000'} 
              onChange={(e) => onUpdateProperty('fill', e.target.value)}
            />
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="form-label small fw-bold">Opacity</label>
            <input 
              type="range" 
              className="form-range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={selectedObject.opacity || 1} 
              onChange={(e) => onUpdateProperty('opacity', parseFloat(e.target.value))}
            />
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="form-label small fw-bold">Rotation ({Math.round(selectedObject.angle || 0)}°)</label>
            <input 
              type="range" 
              className="form-range" 
              min="0" 
              max="360" 
              value={selectedObject.angle || 0} 
              onChange={(e) => onUpdateProperty('angle', parseInt(e.target.value))}
            />
          </div>

          {isText && (
            <>
              <div className="d-flex flex-column gap-2">
                <label className="form-label small fw-bold">Font Size</label>
                <input 
                  type="number" 
                  className="form-control form-control-sm" 
                  value={(selectedObject as fabric.IText).fontSize || 24} 
                  onChange={(e) => onUpdateProperty('fontSize', parseInt(e.target.value))}
                />
              </div>
              <div className="d-flex flex-column gap-2">
                <label className="form-label small fw-bold">Font Family</label>
                <select 
                  className="form-select form-select-sm" 
                  value={(selectedObject as fabric.IText).fontFamily || 'Arial'} 
                  onChange={(e) => onUpdateProperty('fontFamily', e.target.value)}
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </>
          )}

          <div className="d-flex flex-column gap-2">
            <label className="form-label small fw-bold">Lock Movement</label>
            <button 
              className={`btn btn-sm ${isLocked ? 'btn-danger' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center gap-2`}
              onClick={() => {
                onUpdateProperty('lockMovementX', !isLocked);
                onUpdateProperty('lockMovementY', !isLocked);
              }}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-muted py-5">
          <p className="small">Select an object on the canvas to see controls</p>
        </div>
      )}
    </div>
  );
};

export default ObjectControls;
