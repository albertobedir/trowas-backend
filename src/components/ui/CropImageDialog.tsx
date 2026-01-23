"use client";

import React, { useRef, useState } from "react";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '@/styles/crop-dialog.css';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Image from 'next/image';

interface CropImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File, croppedImageUrl: string) => void;
  aspectRatio?: number;
  originalFile: File | null;
  roundedCrop?: boolean; // true if the crop should be rounded (for profile pictures and logos)
  cropType?: 'cover' | 'profile' | 'logo'; // Type of crop being performed
}

export function CropImageDialog({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 3,
  originalFile,
  roundedCrop = false,
  cropType = 'cover'
}: CropImageDialogProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 30,
    x: 0,
    y: 35
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState<number[]>([1]);
  const [maxScale] = useState<number>(3); // Maximum zoom level  // Handle initial image load
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    
    // Set different initial crop based on crop type
    if (cropType === 'profile' || cropType === 'logo') {    // For profile picture or logo, use a square crop with 1:1 aspect ratio
    // but make it slightly larger than the visible circular area
    const visibleSize = Math.min(80, Math.min(width, height)); // Visible circle size
    const size = visibleSize * 1.2; // Actual crop size is 20% larger
    const x = (100 - size) / 2;
    const y = (100 - size) / 2;
      
      setCrop({
        unit: '%',
        width: size,
        height: size,
        x,
        y
      });
    } else {
      // For cover photos (default), use rectangular crop
      const cropHeight = Math.min(30, (100 / aspectRatio) * (width / height));
      const y = (100 - cropHeight) / 2;
      
      setCrop({
        unit: '%',
        width: 100,
        height: cropHeight,
        x: 0,
        y
      });
    }
    
    // Reset scale to default
    setScale([1]);
  };
  
  // Handle zoom with slider
  const handleZoomChange = (value: number[]) => {
    setScale(value);
  };

  // Handle crop selection
  const handleCropComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop);
  };

  // Apply the crop
  const applyCrop = () => {
    if (!completedCrop || !imgRef.current || !originalFile) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas background to be transparent
    canvas.style.backgroundColor = 'transparent';
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // For rounded crops (profile pictures and logos), we'll create a larger canvas
    if (cropType === 'profile' || cropType === 'logo') {
      // Create a temporary larger canvas for the actual crop
      const tempCanvas = document.createElement('canvas');
      const scale = 1.2; // Make the actual crop 20% larger
      tempCanvas.width = canvas.width * scale;
      tempCanvas.height = canvas.height * scale;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Clear the temporary canvas
      tempCtx.fillStyle = 'rgba(0,0,0,0)';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the image onto the larger canvas
      tempCtx.drawImage(
        imgRef.current,
        (completedCrop.x - (completedCrop.width * 0.1)) * scaleX,
        (completedCrop.y - (completedCrop.height * 0.1)) * scaleY,
        completedCrop.width * scale * scaleX,
        completedCrop.height * scale * scaleY,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );

      // Now draw the larger cropped image back to our original canvas
      ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    }

    // Draw the image with proper scaling
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );    // Restore context if we applied clipping
    if (cropType === 'profile' || cropType === 'logo') {
      ctx.restore();
    }

    // Convert canvas to blob
    canvas.toBlob(blob => {
      if (!blob || !originalFile) return;
      
      // Create a new file from the blob with the same name and type
      const croppedFile = new File([blob], originalFile.name, {
        type: 'image/png', // Use PNG to preserve transparency
        lastModified: new Date().getTime()
      });
      
      // Create URL for preview
      const croppedImageUrl = URL.createObjectURL(blob);
      
      // Call the callback with the cropped file
      onCropComplete(croppedFile, croppedImageUrl);
      
      // Close the dialog
      onClose();
    }, 'image/png'); // Use PNG format with alpha channel
  };

  // Cancel cropping
  const handleCancel = () => {
    onClose();
  };  // Get title based on crop type
  const getDialogTitle = () => {
    switch(cropType) {
      case 'profile': return 'Profile Picture Cropper';
      case 'logo': return 'Company Logo Cropper';
      default: return 'Cover Photo Cropper';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] md:max-w-[1200px] p-0 overflow-hidden bg-neutral-900/95 text-white border-none" aria-describedby="crop-image-description">
        <DialogHeader>
          <DialogTitle className="sr-only">{getDialogTitle()}</DialogTitle>
          <DialogDescription id="crop-image-description" className="sr-only">
            Adjust the cropping area for your image.
          </DialogDescription>
        </DialogHeader>
        <div className="relative w-full">
          {imageSrc && (
            <div className="relative overflow-hidden bg-black">              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={handleCropComplete}
                aspect={(cropType === 'profile' || cropType === 'logo') ? 1 : aspectRatio}
                className={`max-w-full block ${(cropType === 'profile' || cropType === 'logo') ? 'rounded-crop' : ''}`}
                style={{ maxHeight: '600px' }}
                ruleOfThirds
                circularCrop={false}
              >
                <div style={{ 
                  overflow: 'hidden', 
                  maxWidth: '100%', 
                  maxHeight: '600px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'black'
                }}>
                  <Image
                    ref={imgRef}
                    src={imageSrc}
                    alt="Image to crop"
                    width={800}
                    height={600}
                    className="max-w-full h-auto object-contain transform-gpu"
                    style={{ 
                      transform: `scale(${scale[0]})`,
                      transition: 'transform 0.2s ease-in-out',
                      transformOrigin: 'center'
                    }}
                    onLoad={onImageLoad}
                  />
                </div>
              </ReactCrop>
            </div>
          )}          {/* Slider for zoom adjustment */}
          <div className="crop-slider-container">
            <div className="crop-controls">
              <Slider 
                defaultValue={[1]} 
                value={scale}
                min={1} 
                max={maxScale} 
                step={0.01}
                onValueChange={handleZoomChange}
                className="crop-slider w-full"
              />
              
              <div className="crop-dialog-buttons">
                <Button
                  variant="default"
                  className="crop-button cancel-button"
                  onClick={handleCancel}
                  type="button"
                >
                  Cancel
                </Button>
                
                <Button
                  variant="default" 
                  className="crop-button crop-button-primary"
                  onClick={applyCrop}
                  type="button"
                >
                  Crop
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
