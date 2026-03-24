import React from 'react';
import * as fabric from 'fabric';
import { 
  ZoomIn, 
  ZoomOut, 
  Lock, Unlock, 
  Bold, Italic, 
  AlignCenter, AlignLeft, AlignRight,
  ChevronUp, ChevronDown,
  ChevronsUp, ChevronsDown,
  Sun, Contrast, Moon
} from 'lucide-react';

interface ObjectControlsProps {
  selectedObject: fabric.FabricObject | null;
  onUpdateProperty: (property: string, value: any) => void;
  onApplyFilter: (filterType: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSwitchView: (view: 'front' | 'back') => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const ObjectControls: React.FC<ObjectControlsProps> = ({
  selectedObject,
  onUpdateProperty,
  onApplyFilter,
  onZoomIn,
  onZoomOut,
  onSwitchView,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack
}) => {
  const isText = selectedObject instanceof fabric.IText;
  const isImage = selectedObject instanceof fabric.FabricImage;
  const isLocked = selectedObject?.lockMovementX && selectedObject?.lockMovementY;

  return (
    <div className="bg-white p-3 rounded shadow-sm h-100 border d-flex flex-column gap-3 overflow-auto" style={{ minWidth: '280px' }}>
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
            <label className="form-label small fw-bold">Layering</label>
            <div className="d-flex gap-1">
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" title="Bring Forward" onClick={onBringForward}><ChevronUp size={14} /></button>
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" title="Send Backward" onClick={onSendBackward}><ChevronDown size={14} /></button>
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" title="Bring to Front" onClick={onBringToFront}><ChevronsUp size={14} /></button>
              <button className="btn btn-outline-secondary btn-sm flex-grow-1" title="Send to Back" onClick={onSendToBack}><ChevronsDown size={14} /></button>
            </div>
          </div>

          {!isImage && (
            <div className="d-flex flex-column gap-2">
              <label className="form-label small fw-bold">Color</label>
              <input 
                type="color" 
                className="form-control form-control-color w-100" 
                value={selectedObject.fill as string || '#000000'} 
                onChange={(e) => onUpdateProperty('fill', e.target.value)}
              />
            </div>
          )}

          {isImage && (
            <div className="d-flex flex-column gap-2">
              <label className="form-label small fw-bold">Filters</label>
              <div className="d-flex flex-wrap gap-1">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onApplyFilter('none')}>None</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onApplyFilter('grayscale')}>Gray</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onApplyFilter('sepia')}>Sepia</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onApplyFilter('invert')}>Invert</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => onApplyFilter('brightness')}>Bright</button>
              </div>
            </div>
          )}

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
                <label className="form-label small fw-bold">Text Style</label>
                <div className="btn-group w-100">
                  <button 
                    className={`btn btn-sm ${(selectedObject as fabric.IText).fontWeight === 'bold' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => onUpdateProperty('fontWeight', (selectedObject as fabric.IText).fontWeight === 'bold' ? 'normal' : 'bold')}
                  >
                    <Bold size={14} />
                  </button>
                  <button 
                    className={`btn btn-sm ${(selectedObject as fabric.IText).fontStyle === 'italic' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => onUpdateProperty('fontStyle', (selectedObject as fabric.IText).fontStyle === 'italic' ? 'normal' : 'italic')}
                  >
                    <Italic size={14} />
                  </button>
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                <label className="form-label small fw-bold">Alignment</label>
                <div className="btn-group w-100">
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => onUpdateProperty('textAlign', 'left')}><AlignLeft size={14} /></button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => onUpdateProperty('textAlign', 'center')}><AlignCenter size={14} /></button>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => onUpdateProperty('textAlign', 'right')}><AlignRight size={14} /></button>
                </div>
              </div>

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
                  <option value="Impact">Impact</option>
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
          <div className="mt-4 p-3 bg-light rounded border border-dashed">
            <p className="mb-1 fw-bold">Shortcuts</p>
            <ul className="list-unstyled small text-start mb-0">
              <li>• <kbd>Del</kbd> / <kbd>Back</kbd> to delete</li>
              <li>• <kbd>Ctrl+C</kbd> / <kbd>Ctrl+V</kbd> to copy</li>
              <li>• <kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> to undo</li>
              <li>• <kbd>Arrows</kbd> to move</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjectControls;
