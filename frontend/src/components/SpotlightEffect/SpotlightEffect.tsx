// ============================================
// JOCH Bandpage - Spotlight Effect Component
// Canvas-based spotlight that reveals background image
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import styles from './SpotlightEffect.module.scss';

interface SpotlightEffectProps {
  imageUrl: string;
  isActive: boolean;
}

const SpotlightEffect: React.FC<SpotlightEffectProps> = ({ imageUrl, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [rotation, setRotation] = useState(-90);

  useEffect(() => {
    // Load the image
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      console.log('✅ Spotlight image loaded');
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!isActive) {
      // Cancel animation when not active
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let startTime: number | null = null;
    const duration = 4000; // Schneller: 4 seconds for full swing

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;

      // Calculate rotation angle (pendulum motion)
      let angle;
      if (progress < 0.5) {
        // First half: -60 to +60 (kleinerer Schwung)
        angle = -60 + (progress * 2) * 120;
      } else {
        // Second half: +60 to -60
        angle = 60 - ((progress - 0.5) * 2) * 120;
      }

      // Clear canvas with black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the spotlight effect
      if (imageRef.current) {
        ctx.save();

        // Create spotlight path (elliptical beam)
        const centerX = canvas.width * 0.15; // 15% from left (etwas weiter rechts)
        const centerY = canvas.height * 0.1; // 10% from top

        ctx.translate(centerX, centerY);
        ctx.rotate((angle * Math.PI) / 180);

        // Create smaller elliptical spotlight shape (deutlich kleiner!)
        ctx.beginPath();
        ctx.ellipse(0, 0, canvas.width * 0.12, canvas.height * 0.8, 0, 0, Math.PI * 2);
        ctx.closePath();

        // Set up clipping to spotlight shape
        ctx.clip();

        // Reset transform to draw image normally
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw the background image (only visible in spotlight area)
        const imgAspect = imageRef.current.width / imageRef.current.height;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth, drawHeight, drawX, drawY;

        if (imgAspect > canvasAspect) {
          // Image is wider - fit height
          drawHeight = canvas.height;
          drawWidth = drawHeight * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          // Image is taller - fit width
          drawWidth = canvas.width;
          drawHeight = drawWidth / imgAspect;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(imageRef.current, drawX, drawY, drawWidth, drawHeight);

        // Add intense blue gradient overlay for spotlight effect
        ctx.globalCompositeOperation = 'screen';
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, canvas.width * 0.35
        );
        gradient.addColorStop(0, 'rgba(150, 200, 255, 0.6)');
        gradient.addColorStop(0.3, 'rgba(100, 150, 255, 0.4)');
        gradient.addColorStop(0.7, 'rgba(50, 100, 255, 0.2)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();
      }

      // Add more intense light glow effect
      ctx.globalCompositeOperation = 'screen';
      const glowGradient = ctx.createRadialGradient(
        canvas.width * 0.15, canvas.height * 0.1, 0,
        canvas.width * 0.15, canvas.height * 0.1, canvas.width * 0.2
      );
      glowGradient.addColorStop(0, 'rgba(200, 220, 255, 0.4)');
      glowGradient.addColorStop(0.5, 'rgba(100, 150, 255, 0.2)');
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setRotation(angle);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, imageUrl]);

  if (!isActive) return null;

  return (
    <div className={styles.spotlightContainer}>
      <canvas
        ref={canvasRef}
        className={styles.spotlightCanvas}
        style={{ display: 'block' }}
      />
      <div className={styles.debugInfo}>
        Rotation: {Math.round(rotation)}°
      </div>
    </div>
  );
};

export default SpotlightEffect;