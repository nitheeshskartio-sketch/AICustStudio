import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
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
  resetCanvas: () => void;
  uploadImage: (file: File) => void;
  changeColor: (color: string) => void;
  getCanvasDataUrl: () => string;
  zoomIn: () => void;
  zoomOut: () => void;
  updateObjectProperty: (property: string, value: any) => void;
}

const FabricCanvas = forwardRef<FabricCanvasHandle, FabricCanvasProps>(({ backgroundImage, onObjectSelected }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: '#f8f9fa',
    });

    fabricCanvas.current = canvas;

    canvas.on('selection:created', (e) => onObjectSelected(e.selected[0]));
    canvas.on('selection:updated', (e) => onObjectSelected(e.selected[0]));
    canvas.on('selection:cleared', () => onObjectSelected(null));
    canvas.on('object:modified', (e) => onObjectSelected(e.target));

    return () => {
      canvas.dispose();
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
        // Scale image to fit canvas
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
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
    resetCanvas: () => {
      if (!fabricCanvas.current) return;
      const objects = fabricCanvas.current.getObjects();
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
