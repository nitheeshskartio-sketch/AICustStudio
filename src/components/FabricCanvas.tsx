import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import * as fabric from 'fabric';

interface FabricCanvasProps {
  backgroundImage: string;
  onObjectSelected: (obj: fabric.FabricObject | null) => void;
}

export interface FabricCanvasHandle {
  addText: () => void;
  addRectangle: () => void;
  addCircle: () => void;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  resetCanvas: () => void;
  uploadImage: (file: File) => void;
  changeColor: (color: string) => void;
  getCanvasDataUrl: () => string;
  zoomIn: () => void;
  zoomOut: () => void;
  updateObjectProperty: (property: string, value: any) => void;
  undo: () => void;
  redo: () => void;
  applyFilter: (filterType: string) => void;
}

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(({ backgroundImage, onObjectSelected }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const history = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isProcessingHistory = useRef(false);
  const clipboard = useRef<fabric.FabricObject | null>(null);

  const saveHistory = useCallback(() => {
    if (!fabricCanvas.current || isProcessingHistory.current) return;
    const json = JSON.stringify(fabricCanvas.current.toJSON());
    history.current.push(json);
    if (history.current.length > 50) history.current.shift();
    redoStack.current = [];
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: '#f8f9fa',
      preserveObjectStacking: true,
    });

    fabricCanvas.current = canvas;

    canvas.on('selection:created', (e) => onObjectSelected(e.selected[0]));
    canvas.on('selection:updated', (e) => onObjectSelected(e.selected[0]));
    canvas.on('selection:cleared', () => onObjectSelected(null));
    canvas.on('object:modified', () => {
      saveHistory();
      onObjectSelected(canvas.getActiveObject());
    });
    canvas.on('object:added', () => {
      if (!isProcessingHistory.current) saveHistory();
    });
    canvas.on('object:removed', () => {
      if (!isProcessingHistory.current) saveHistory();
    });

    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvas) return;
      
      // Don't trigger shortcuts if user is typing in an input or IText is being edited
      const activeObject = canvas.getActiveObject();
      if (activeObject instanceof fabric.IText && activeObject.isEditing) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObjects = canvas.getActiveObjects();
        canvas.remove(...activeObjects);
        canvas.discardActiveObject();
        canvas.renderAll();
      } else if (isCtrl && e.key === 'z') {
        e.preventDefault();
        undoAction();
      } else if (isCtrl && e.key === 'y') {
        e.preventDefault();
        redoAction();
      } else if (isCtrl && e.key === 'c') {
        e.preventDefault();
        copyAction();
      } else if (isCtrl && e.key === 'v') {
        e.preventDefault();
        pasteAction();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (activeObject) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          switch (e.key) {
            case 'ArrowUp': activeObject.set('top', (activeObject.top || 0) - step); break;
            case 'ArrowDown': activeObject.set('top', (activeObject.top || 0) + step); break;
            case 'ArrowLeft': activeObject.set('left', (activeObject.left || 0) - step); break;
            case 'ArrowRight': activeObject.set('left', (activeObject.left || 0) + step); break;
          }
          activeObject.setCoords();
          canvas.renderAll();
          saveHistory();
        }
      }
    };

    const undoAction = async () => {
      if (history.current.length <= 1 || !canvas) return;
      isProcessingHistory.current = true;
      const current = history.current.pop()!;
      redoStack.current.push(current);
      const previous = history.current[history.current.length - 1];
      await canvas.loadFromJSON(previous);
      canvas.renderAll();
      isProcessingHistory.current = false;
    };

    const redoAction = async () => {
      if (redoStack.current.length === 0 || !canvas) return;
      isProcessingHistory.current = true;
      const next = redoStack.current.pop()!;
      history.current.push(next);
      await canvas.loadFromJSON(next);
      canvas.renderAll();
      isProcessingHistory.current = false;
    };

    const copyAction = async () => {
      if (!canvas) return;
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        const cloned = await activeObject.clone();
        clipboard.current = cloned;
      }
    };

    const pasteAction = async () => {
      if (!canvas || !clipboard.current) return;
      const clonedObj = await clipboard.current.clone();
      canvas.discardActiveObject();
      clonedObj.set({
        left: (clonedObj.left || 0) + 10,
        top: (clonedObj.top || 0) + 10,
        evented: true,
      });
      if (clonedObj instanceof fabric.ActiveSelection) {
        clonedObj.canvas = canvas;
        clonedObj.forEachObject((obj) => canvas.add(obj));
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      clipboard.current.set({
        left: (clipboard.current.left || 0) + 10,
        top: (clipboard.current.top || 0) + 10,
      });
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial history save
    saveHistory();

    return () => {
      canvas.dispose();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const setBg = async () => {
      if (!fabricCanvas.current) return;
      try {
        const img = await fabric.FabricImage.fromURL(backgroundImage, {
          crossOrigin: 'anonymous',
        });
        
        const canvas = fabricCanvas.current;
        canvas.setZoom(1);
        
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: canvas.width / 2,
          top: canvas.height / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        
        canvas.backgroundImage = img;
        canvas.renderAll();
      } catch (error) {
        console.error('Error loading background image:', error);
      }
    };

    setBg();
  }, [backgroundImage]);

  useImperativeHandle(ref, () => ({
    addText: () => {
      if (!fabricCanvas.current) return;
      const text = new fabric.IText('Double click to edit', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: 24,
        fill: '#000000',
      });
      fabricCanvas.current.add(text);
      fabricCanvas.current.setActiveObject(text);
    },
    addRectangle: () => {
      if (!fabricCanvas.current) return;
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: '#ff0000',
        width: 100,
        height: 100,
      });
      fabricCanvas.current.add(rect);
      fabricCanvas.current.setActiveObject(rect);
    },
    addCircle: () => {
      if (!fabricCanvas.current) return;
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        fill: '#0000ff',
        radius: 50,
      });
      fabricCanvas.current.add(circle);
      fabricCanvas.current.setActiveObject(circle);
    },
    deleteSelected: () => {
      if (!fabricCanvas.current) return;
      const activeObjects = fabricCanvas.current.getActiveObjects();
      fabricCanvas.current.remove(...activeObjects);
      fabricCanvas.current.discardActiveObject();
      fabricCanvas.current.renderAll();
      onObjectSelected(null);
    },
    bringForward: () => {
      if (!fabricCanvas.current) return;
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject) {
        fabricCanvas.current.bringObjectForward(activeObject);
      }
    },
    sendBackward: () => {
      if (!fabricCanvas.current) return;
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject) {
        fabricCanvas.current.sendObjectBackwards(activeObject);
      }
    },
    bringToFront: () => {
      if (!fabricCanvas.current) return;
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject) {
        fabricCanvas.current.bringObjectToFront(activeObject);
      }
    },
    sendToBack: () => {
      if (!fabricCanvas.current) return;
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject) {
        fabricCanvas.current.sendObjectToBack(activeObject);
        // Ensure background image stays at the very back
        if (fabricCanvas.current.backgroundImage) {
          fabricCanvas.current.sendObjectToBack(fabricCanvas.current.backgroundImage);
        }
      }
    },
    resetCanvas: () => {
      if (!fabricCanvas.current) return;
      const objects = fabricCanvas.current.getObjects().filter(obj => obj !== fabricCanvas.current?.backgroundImage);
      fabricCanvas.current.remove(...objects);
      fabricCanvas.current.renderAll();
      onObjectSelected(null);
    },
    uploadImage: (file: File) => {
      if (!fabricCanvas.current) return;
      const reader = new FileReader();
      reader.onload = async (f) => {
        const data = f.target?.result as string;
        const img = await fabric.FabricImage.fromURL(data);
        img.scaleToWidth(200);
        fabricCanvas.current?.add(img);
        fabricCanvas.current?.setActiveObject(img);
        fabricCanvas.current?.renderAll();
      };
      reader.readAsDataURL(file);
    },
    changeColor: (color: string) => {
      if (!fabricCanvas.current) return;
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject) {
        activeObject.set('fill', color);
        fabricCanvas.current.renderAll();
        saveHistory();
      }
    },
    getCanvasDataUrl: () => {
      if (!fabricCanvas.current) return '';
      return fabricCanvas.current.toDataURL({
        format: 'png',
        quality: 1,
      });
    },
    zoomIn: () => {
      if (!fabricCanvas.current) return;
      let zoom = fabricCanvas.current.getZoom();
      zoom = zoom * 1.1;
      if (zoom > 20) zoom = 20;
      fabricCanvas.current.setZoom(zoom);
    },
    zoomOut: () => {
      if (!fabricCanvas.current) return;
      let zoom = fabricCanvas.current.getZoom();
      zoom = zoom / 1.1;
      if (zoom < 0.01) zoom = 0.01;
      fabricCanvas.current.setZoom(zoom);
    },
    updateObjectProperty: (property: string, value: any) => {
      if (!fabricCanvas.current) return;
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject) {
        activeObject.set(property as any, value);
        fabricCanvas.current.renderAll();
        saveHistory();
      }
    },
    undo: () => {
      if (history.current.length <= 1 || !fabricCanvas.current) return;
      isProcessingHistory.current = true;
      const current = history.current.pop()!;
      redoStack.current.push(current);
      const previous = history.current[history.current.length - 1];
      fabricCanvas.current.loadFromJSON(previous).then(() => {
        fabricCanvas.current?.renderAll();
        isProcessingHistory.current = false;
      });
    },
    redo: () => {
      if (redoStack.current.length === 0 || !fabricCanvas.current) return;
      isProcessingHistory.current = true;
      const next = redoStack.current.pop()!;
      history.current.push(next);
      fabricCanvas.current.loadFromJSON(next).then(() => {
        fabricCanvas.current?.renderAll();
        isProcessingHistory.current = false;
      });
    },
    applyFilter: (filterType: string) => {
      if (!fabricCanvas.current) return;
      const activeObject = fabricCanvas.current.getActiveObject();
      if (activeObject instanceof fabric.FabricImage) {
        activeObject.filters = [];
        switch (filterType) {
          case 'grayscale': activeObject.filters.push(new fabric.filters.Grayscale()); break;
          case 'invert': activeObject.filters.push(new fabric.filters.Invert()); break;
          case 'sepia': activeObject.filters.push(new fabric.filters.Sepia()); break;
          case 'brightness': activeObject.filters.push(new fabric.filters.Brightness({ brightness: 0.1 })); break;
        }
        activeObject.applyFilters();
        fabricCanvas.current.renderAll();
        saveHistory();
      }
    }
  }));

  return (
    <div className="d-flex justify-content-center align-items-center bg-light p-4 rounded shadow-sm" style={{ minHeight: '650px' }}>
      <canvas ref={canvasRef} id="tshirt-canvas" />
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;
