// ============================================
// JOCH Bandpage - Simple Spotlight Effect
// Ein beweglicher Lichtstrahl der das Bild aufdeckt
// ============================================

import React, { useEffect, useRef } from 'react';
import styles from './SimpleSpotlight.module.scss';

interface SimpleSpotlightProps {
  imageUrl: string;
  isActive: boolean;
}

const SimpleSpotlight: React.FC<SimpleSpotlightProps> = ({ imageUrl, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const colorChangeRef = useRef<number>(0);
  const beatFlashRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  const beatIntervalRef = useRef<number>(500); // Standard: 120 BPM = 500ms zwischen Beats
  const speedMultiplierRef = useRef<number>(1); // Geschwindigkeitsmultiplikator

  // Bild laden
  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      console.log('✅ Bild geladen');
    };
  }, [imageUrl]);

  // Beat-Event Listener
  useEffect(() => {
    if (!isActive) return;

    const handleBeat = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🎵 Spotlight received beat!', customEvent.detail);

      const now = Date.now();

      // Berechne Zeit zwischen Beats (Tempo)
      if (lastBeatTimeRef.current > 0) {
        const timeSinceLastBeat = now - lastBeatTimeRef.current;

        // Gleitender Durchschnitt für stabileres Tempo
        beatIntervalRef.current = beatIntervalRef.current * 0.7 + timeSinceLastBeat * 0.3;

        // Berechne Geschwindigkeitsmultiplikator
        // Schnellere Beats = schnellere Bewegung
        // 500ms (120 BPM) = normale Geschwindigkeit (1.0)
        // 300ms (200 BPM) = schneller (1.67)
        // 750ms (80 BPM) = langsamer (0.67)
        speedMultiplierRef.current = 500 / beatIntervalRef.current;

        // Begrenzen auf sinnvollen Bereich
        speedMultiplierRef.current = Math.max(0.5, Math.min(2.0, speedMultiplierRef.current));

        console.log(`⏱️ Tempo: ${Math.round(60000 / beatIntervalRef.current)} BPM, Speed: ${speedMultiplierRef.current.toFixed(2)}x`);
      }

      // Trigger beat flash
      beatFlashRef.current = 1;
      lastBeatTimeRef.current = now;

      // Random color change on beat (70% chance)
      if (Math.random() > 0.3) {
        colorChangeRef.current++;
      }
    };

    window.addEventListener('musicBeat', handleBeat);
    return () => {
      window.removeEventListener('musicBeat', handleBeat);
    };
  }, [isActive]);

  // Animation
  useEffect(() => {
    if (!isActive || !canvasRef.current || !imageRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas an Container anpassen
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Drei Spotlights mit unterschiedlichen Startwinkeln
    let angleLeft = -30;
    let angleCenter = 0;
    let angleRight = 30;

    let directionLeft = 1;
    let directionCenter = -1;
    let directionRight = 1;

    // Spotlight-Farben für zufällige Auswahl - JETZT RICHTIG KRASS!
    const spotlightColors = [
      { r: 255, g: 255, b: 200 }, // Warmweiß (Standard)
      { r: 255, g: 50, b: 0 },    // Knalliges Rot
      { r: 255, g: 150, b: 0 },   // Orange
      { r: 0, g: 100, b: 255 },   // Tiefes Blau
      { r: 180, g: 0, b: 255 },   // Lila
      { r: 0, g: 255, b: 100 },   // Grün
      { r: 255, g: 0, b: 150 },   // Pink
      { r: 0, g: 255, b: 255 },   // Cyan
      { r: 255, g: 255, b: 0 },   // Gelb
    ];

    // Funktion zum Zeichnen eines einzelnen Spotlights
    const drawSpotlight = (
      spotX: number,
      angle: number,
      color: { r: number; g: number; b: number }
    ) => {
      const spotY = -50; // Über dem Canvas (von oben)
      const stageY = canvas.height * 0.7; // Bühnenhöhe
      const angleRad = (angle * Math.PI) / 180;
      const beamEndX = spotX + Math.sin(angleRad) * (stageY + 50);
      const beamEndY = stageY;

      // Zeichne den konischen Lichtstrahl
      ctx.save();

      // Erstelle konischen Clipping-Pfad - breiter bei schnellerer Musik!
      const beamWidth = 100 * speedMultiplierRef.current; // Schmaler für 3 Spots
      ctx.beginPath();
      ctx.moveTo(spotX - 5, spotY);
      ctx.lineTo(spotX + 5, spotY);
      ctx.lineTo(beamEndX + beamWidth, beamEndY + 200);
      ctx.lineTo(beamEndX - beamWidth, beamEndY + 200);
      ctx.closePath();
      ctx.clip();

      // Zeichne das Bild nur im Lichtkegel
      if (imageRef.current) {
        ctx.drawImage(
          imageRef.current,
          0, 0, imageRef.current.width, imageRef.current.height,
          0, 0, canvas.width, canvas.height
        );
      }

      // Füge Lichteffekt mit aktueller Farbe hinzu (Beat-verstärkt!)
      const intensity = 0.4 + (beatFlashRef.current * 0.4);
      const gradient = ctx.createLinearGradient(spotX, spotY, beamEndX, beamEndY);
      gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity})`);
      gradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.5})`);
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${intensity * 0.125})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.restore();

      // Zeichne Umgebungslicht-Effekt
      ctx.save();
      const ambientIntensity = 0.1 + (beatFlashRef.current * 0.2);
      const ambientRadius = 200 + (beatFlashRef.current * 100);
      const ambientGradient = ctx.createRadialGradient(
        beamEndX, beamEndY, 0,
        beamEndX, beamEndY, ambientRadius
      );
      ambientGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${ambientIntensity})`);
      ambientGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = ambientGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    };

    const draw = () => {
      // Canvas mit schwarz füllen (dunkle Bühne)
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Beat-Flash-Effekt (fade out)
      if (beatFlashRef.current > 0) {
        beatFlashRef.current = Math.max(0, beatFlashRef.current - 0.05);
      }

      // Tempo-angepasste Bewegung
      const baseSpeed = 0.5;
      const currentSpeed = baseSpeed * speedMultiplierRef.current;

      // Unterschiedliche Bewegungsradien für die Spots
      const maxAngleOuter = 45 + (speedMultiplierRef.current - 1) * 20; // Größerer Radius für außen (45-65°)
      const maxAngleCenter = 25 + (speedMultiplierRef.current - 1) * 10; // Kleinerer für Mitte (25-35°)

      // Update alle drei Winkel
      angleLeft += currentSpeed * directionLeft;
      angleCenter += currentSpeed * directionCenter;
      angleRight += currentSpeed * directionRight;

      // Grenzen für linken Spotlight (größerer Radius!)
      if (angleLeft >= maxAngleOuter) {
        angleLeft = maxAngleOuter;
        directionLeft = -1;
      } else if (angleLeft <= -maxAngleOuter) {
        angleLeft = -maxAngleOuter;
        directionLeft = 1;
      }

      // Grenzen für mittleren Spotlight (kleinerer Radius)
      if (angleCenter >= maxAngleCenter) {
        angleCenter = maxAngleCenter;
        directionCenter = -1;
      } else if (angleCenter <= -maxAngleCenter) {
        angleCenter = -maxAngleCenter;
        directionCenter = 1;
      }

      // Grenzen für rechten Spotlight (größerer Radius!)
      if (angleRight >= maxAngleOuter) {
        angleRight = maxAngleOuter;
        directionRight = -1;
      } else if (angleRight <= -maxAngleOuter) {
        angleRight = -maxAngleOuter;
        directionRight = 1;
      }

      // Farben für die drei Spotlights (verschiedene Farben!)
      const colorLeft = spotlightColors[colorChangeRef.current % spotlightColors.length];
      const colorCenter = spotlightColors[(colorChangeRef.current + 3) % spotlightColors.length];
      const colorRight = spotlightColors[(colorChangeRef.current + 6) % spotlightColors.length];

      // Zeichne alle drei Spotlights
      drawSpotlight(canvas.width * 0.05, angleLeft, colorLeft);    // Links (5%)
      drawSpotlight(canvas.width * 0.5, angleCenter, colorCenter);  // Mitte (50%)
      drawSpotlight(canvas.width * 0.95, angleRight, colorRight);   // Rechts (95%)

      // STROBOSKOP-EFFEKT VON UNTEN (bei starkem Beat!)
      if (beatFlashRef.current > 0.7) {
        ctx.save();

        // Stroboskop-Licht von unten (wie Bühnenboden-LEDs)
        const strobeIntensity = beatFlashRef.current;
        const strobeGradient = ctx.createLinearGradient(
          0, canvas.height,
          0, canvas.height * 0.3
        );

        // Zufällige Stroboskop-Farbe
        const strobeColors = [
          { r: 255, g: 255, b: 255 }, // Weiß
          { r: 0, g: 150, b: 255 },   // Blau
          { r: 255, g: 0, b: 255 },   // Magenta
          { r: 0, g: 255, b: 200 },   // Cyan
        ];
        const strobeColor = strobeColors[Math.floor(Math.random() * strobeColors.length)];

        strobeGradient.addColorStop(0, `rgba(${strobeColor.r}, ${strobeColor.g}, ${strobeColor.b}, ${strobeIntensity * 0.8})`);
        strobeGradient.addColorStop(0.3, `rgba(${strobeColor.r}, ${strobeColor.g}, ${strobeColor.b}, ${strobeIntensity * 0.4})`);
        strobeGradient.addColorStop(0.7, `rgba(${strobeColor.r}, ${strobeColor.g}, ${strobeColor.b}, ${strobeIntensity * 0.1})`);
        strobeGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = strobeGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Zusätzlicher Blitz-Effekt für mehr Impact
        if (beatFlashRef.current > 0.9) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(beatFlashRef.current - 0.9) * 2})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.restore();
      }

      // Nächster Frame
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
};

export default SimpleSpotlight;