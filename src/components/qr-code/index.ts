// QR Code Components with Beautiful Animations
export { QrCodeView } from './qr-code-view';
export { QrCodeView as QrCodeViewNew } from './qr-code-view-new';
export { QrCodePreview } from './qr-code-preview';
export { QrCodeShowcase } from './qr-code-showcase';
export { 
  QrCodeLoadingAnimation, 
  QrCodeSuccessAnimation 
} from './qr-code-animations';

// Type definitions
export interface QrCodeViewProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export interface QrCodePreviewProps {
  userId: string;
  userName: string;
  qrCodePath?: string;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
}

export interface QrCodeShowcaseProps {
  userId: string;
  userName: string;
  qrCodeSvg: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
}
