"use client";
import { CropImageDialog } from "@/components/ui/CropImageDialog";
import { useState } from "react";

export default function TestCropPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileUrl = URL.createObjectURL(selectedFile);
      setImageSrc(fileUrl);
      setFile(selectedFile);
      setIsOpen(true);
    }
  };
  
  const handleCropComplete = (croppedFile: File, croppedImageUrl: string) => {
    // Display the cropped image
    console.log("Cropped!", { croppedFile, croppedImageUrl });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Cover Photo Cropper Test</h1>
      
      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
        Select Image
        <input 
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      
      <CropImageDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        imageSrc={imageSrc}
        originalFile={file}
        onCropComplete={handleCropComplete}
        aspectRatio={3}
      />
    </div>
  );
}
