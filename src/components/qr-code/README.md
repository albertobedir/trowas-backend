# QR Code Components with Beautiful Animations

This collection includes enhanced QR code components with smooth, beautiful animations built using Framer Motion.

## 🎨 Components Overview

### 1. QrCodeView (`qr-code-view.tsx`)
Enhanced color selector with stunning animations:
- **Staggered color button animations** - Each color button animates in with a spring effect
- **Hover effects** - Scale and rotate animations on color buttons
- **Rotating Plus icon** - Continuous rotation animation for the "Create Event Badge" button
- **Smooth page transitions** - Fade and slide animations for the entire component

### 2. QrCodePreview (`qr-code-preview.tsx`)
Advanced QR code preview with dynamic effects:
- **3D QR code container** - Initial rotation and spring animations
- **Smart color transitions** - Smooth transitions when QR code color changes
- **Interactive hover effects** - Scale and rotation on hover
- **Animated custom color picker** - Slide-in animations for color controls
- **Floating download button** - Subtle bounce animation

### 3. QrCodeShowcase (`qr-code-showcase.tsx`)
Professional showcase component with advanced effects:
- **Multiple animation modes**:
  - **Pulse Effect** - Gentle scaling animation
  - **Glow Effect** - Dynamic box-shadow animation
  - **Scan Effect** - Moving gradient line animation
  - **Float Effect** - Vertical floating motion
- **Corner decorations** - Animated corner markers with staggered timing
- **Scanning simulation** - Full scan animation with moving line effect
- **Floating particles** - Background particle animations
- **Interactive effect controls** - Animated button grid for effect selection

### 4. QrCodeAnimations (`qr-code-animations.tsx`)
Specialized loading and success animations:

#### QrCodeLoadingAnimation
- **Progressive grid building** - QR code squares animate in sequentially
- **Scanning line effect** - Moving gradient line across the QR code
- **Corner marker animations** - Rotating corner squares with spring physics
- **Breathing dots** - Pulsing loading indicator

#### QrCodeSuccessAnimation
- **Success checkmark** - Animated SVG path drawing
- **Ripple effect** - Expanding circle animation
- **Spring entrance** - Bouncy scale-in animation

### 5. QrCodeDemo (`qr-code-demo.tsx`)
Comprehensive demonstration page:
- **Gradient background** - Beautiful animated background
- **Navigation animations** - Smooth tab transitions
- **Current color indicator** - Rotating color display
- **Page transitions** - AnimatePresence for smooth view switching
- **Staggered text animations** - Sequential text appearance

## 🚀 Animation Features

### Performance Optimized
- **GPU acceleration** - All animations use transform properties
- **Smooth 60fps** - Optimized for performance across devices
- **Reduced motion support** - Respects user accessibility preferences

### Interactive Elements
- **Hover states** - Responsive hover animations
- **Click feedback** - Satisfying tap animations
- **Loading states** - Engaging loading sequences
- **Success feedback** - Clear success animations

### Visual Effects
- **Spring physics** - Natural, bouncy animations
- **Staggered timing** - Sequential animation delays
- **Morphing shapes** - Smooth shape transitions
- **Color transitions** - Seamless color changes
- **Particle systems** - Floating background elements

## 🎯 Usage Examples

### Basic Color Selector
```tsx
import { QrCodeView } from '@/components/qr-code';

<QrCodeView 
  selectedColor={color}
  onColorChange={setColor}
/>
```

### Advanced Showcase
```tsx
import { QrCodeShowcase } from '@/components/qr-code';

<QrCodeShowcase
  userId="user123"
  userName="John Doe"
  qrCodeSvg={svgString}
  selectedColor={color}
  onColorChange={setColor}
/>
```

### Loading Animation
```tsx
import { QrCodeLoadingAnimation } from '@/components/qr-code';

{isLoading && <QrCodeLoadingAnimation />}
```

## 🎨 Animation Types

### Entrance Animations
- **Fade In** - Smooth opacity transitions
- **Scale In** - Growing from small to full size
- **Slide In** - Movement from different directions
- **Rotate In** - Spinning entrance effects

### Interaction Animations
- **Hover Scale** - Subtle size changes on hover
- **Tap Feedback** - Quick scale-down on press
- **Color Morphing** - Smooth color transitions
- **Shadow Effects** - Dynamic shadow animations

### Loading Animations
- **Progressive Building** - Elements appearing sequentially
- **Scanning Effects** - Moving line animations
- **Pulsing Elements** - Rhythmic scale animations
- **Spinning Icons** - Continuous rotation effects

### Success Animations
- **Checkmark Drawing** - SVG path animation
- **Ripple Effects** - Expanding circular waves
- **Bounce In** - Spring-powered entrances
- **Celebration Particles** - Floating celebratory elements

## 🔧 Technical Implementation

### Framer Motion Features Used
- **motion.div** - Basic animated containers
- **AnimatePresence** - Enter/exit animations
- **useAnimation** - Programmatic animation control
- **Variants** - Reusable animation configurations
- **Stagger** - Sequential animation timing

### CSS Integration
- **Tailwind CSS** - Utility-first styling
- **Custom gradients** - Beautiful background effects
- **Shadow systems** - Layered depth effects
- **Responsive design** - Mobile-optimized animations

### Accessibility
- **Reduced motion** - Respects user preferences
- **Screen reader friendly** - Proper ARIA labels
- **Keyboard navigation** - Full keyboard support
- **Focus indicators** - Clear focus states

## 🎉 Animation Highlights

The QR code components now feature:

1. **Smooth Page Transitions** - Every component animates in beautifully
2. **Interactive Color Selection** - Buttons that respond with delightful animations
3. **Dynamic QR Code Display** - Rotating, scaling, and glowing effects
4. **Professional Loading States** - Engaging loading animations
5. **Success Celebrations** - Satisfying completion animations
6. **Floating Elements** - Subtle background motion
7. **Hover Interactions** - Responsive feedback on all interactive elements
8. **Staggered Timing** - Natural, sequential animation flow

All animations are designed to be smooth, performant, and enhance the user experience without being distracting.
