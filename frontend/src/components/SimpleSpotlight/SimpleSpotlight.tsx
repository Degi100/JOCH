// ============================================
// JOCH Bandpage - Simple Spotlight Effect
// Ein beweglicher Lichtstrahl der das Bild aufdeckt
// Mit integrierter Slideshow-Funktionalität
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import styles from './SimpleSpotlight.module.scss';

interface SimpleSpotlightProps {
  imageUrl: string;
  isActive: boolean;
  slideImages?: string[]; // Optional slideshow images
}

// Global state for beat synchronization
let globalBeatCount = 0;
let globalCurrentImageIndex = 0;

const SimpleSpotlight: React.FC<SimpleSpotlightProps> = ({ imageUrl, isActive, slideImages }) => {
  // Slideshow state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [beatCount, setBeatCount] = useState(0);
  const [showBeatPulse, setShowBeatPulse] = useState(false);

  // Determine which image to show
  const activeImageUrl = slideImages && slideImages.length > 0 && isActive
    ? slideImages[currentImageIndex]
    : imageUrl;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const colorChangeRef = useRef<number>(0);
  const beatFlashRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  const beatIntervalRef = useRef<number>(500); // Standard: 120 BPM = 500ms zwischen Beats
  const speedMultiplierRef = useRef<number>(1); // Geschwindigkeitsmultiplikator
  const fogOffsetRef = useRef<number>(0); // Für animierten Nebel

  // Fog machine state
  const fogMachineActiveRef = useRef<boolean>(false);
  const fogBurstStartTimeRef = useRef<number>(0);
  const fogBurstDurationRef = useRef<number>(15000); // Burst dauert 15 Sekunden
  const fogNextBurstTimeRef = useRef<number>(Date.now() + 5000); // Erster Burst nach 5 Sekunden
  const fogIntensityRef = useRef<number>(0); // 0 bis 1, kontrolliert Opazität
  const fogMachinePositionRef = useRef<number>(Math.random()); // Position der Nebelmaschine (0-1)

  // Bild laden - jetzt mit activeImageUrl statt imageUrl
  useEffect(() => {
    const img = new Image();
    img.src = activeImageUrl;
    img.onload = () => {
      imageRef.current = img;
      console.log('✅ Bild geladen:', activeImageUrl);
    };
  }, [activeImageUrl]);

  // Reset global state when concert mode stops
  useEffect(() => {
    if (!isActive) {
      globalBeatCount = 0;
      globalCurrentImageIndex = 0;
      setCurrentImageIndex(0);
      setBeatCount(0);
    } else {
      // Restore state when concert mode starts
      setCurrentImageIndex(globalCurrentImageIndex);
      setBeatCount(globalBeatCount);
    }
  }, [isActive]);

  // Beat-Event Listener mit Slideshow-Logik
  useEffect(() => {
    if (!isActive) return;

    const handleBeat = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🎵 Spotlight received beat!', customEvent.detail);

      // Increment beat count
      globalBeatCount++;
      setBeatCount(globalBeatCount);

      // Show beat pulse
      setShowBeatPulse(true);
      setTimeout(() => setShowBeatPulse(false), 150);

      // Change image every 4 beats if slideshow images are available
      if (slideImages && slideImages.length > 0 && globalBeatCount % 4 === 0 && globalBeatCount > 0) {
        globalCurrentImageIndex = (globalCurrentImageIndex + 1) % slideImages.length;
        setCurrentImageIndex(globalCurrentImageIndex);
        console.log(`🖼️ Slideshow: Changed to image ${globalCurrentImageIndex + 1}/${slideImages.length}`);
      }

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
  }, [isActive, slideImages]);

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

    // Vier Spotlights gleichmäßig verteilt mit unterschiedlichen Startwinkeln
    let angleSpot1 = -20;
    let angleSpot2 = -10;
    let angleSpot3 = 10;
    let angleSpot4 = 20;

    let directionSpot1 = 1;
    let directionSpot2 = -1;
    let directionSpot3 = 1;
    let directionSpot4 = -1;

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
      color: { r: number; g: number; b: number },
      isCenter: boolean = false
    ) => {
      const spotY = -50; // Über dem Canvas (von oben)
      const stageY = canvas.height * 0.7; // Bühnenhöhe
      const angleRad = (angle * Math.PI) / 180;
      const beamEndX = spotX + Math.sin(angleRad) * (stageY + 50);
      const beamEndY = stageY;

      // Zeichne den konischen Lichtstrahl
      ctx.save();

      // Erstelle konischen Clipping-Pfad - breiter bei schnellerer Musik!
      const beamWidth = (isCenter ? 180 : 100) * speedMultiplierRef.current; // Breiter für mittleren Spot!
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
      // Clear the canvas first to make it transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Canvas mit semi-transparentem Schwarz füllen (dunkle Bühne mit mehr Durchblick)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'; // 65% Schwarz, 35% transparent
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
      const maxAngleCenter = 35 + (speedMultiplierRef.current - 1) * 15; // Sanfter für Mitte (35-50°)

      // Update alle vier Winkel - Spots 2&3 bewegen sich sanfter!
      angleSpot1 += currentSpeed * directionSpot1;
      angleSpot2 += currentSpeed * 0.7 * directionSpot2; // 0.7x langsamer für sanftere Bewegung!
      angleSpot3 += currentSpeed * 0.7 * directionSpot3; // 0.7x langsamer für sanftere Bewegung!
      angleSpot4 += currentSpeed * directionSpot4;

      // Grenzen für Spot 1 (äußerer Radius)
      if (angleSpot1 >= maxAngleOuter) {
        angleSpot1 = maxAngleOuter;
        directionSpot1 = -1;
      } else if (angleSpot1 <= -maxAngleOuter) {
        angleSpot1 = -maxAngleOuter;
        directionSpot1 = 1;
      }

      // Grenzen für Spot 2 (mittlerer Radius)
      if (angleSpot2 >= maxAngleCenter) {
        angleSpot2 = maxAngleCenter;
        directionSpot2 = -1;
      } else if (angleSpot2 <= -maxAngleCenter) {
        angleSpot2 = -maxAngleCenter;
        directionSpot2 = 1;
      }

      // Grenzen für Spot 3 (mittlerer Radius)
      if (angleSpot3 >= maxAngleCenter) {
        angleSpot3 = maxAngleCenter;
        directionSpot3 = -1;
      } else if (angleSpot3 <= -maxAngleCenter) {
        angleSpot3 = -maxAngleCenter;
        directionSpot3 = 1;
      }

      // Grenzen für Spot 4 (äußerer Radius)
      if (angleSpot4 >= maxAngleOuter) {
        angleSpot4 = maxAngleOuter;
        directionSpot4 = -1;
      } else if (angleSpot4 <= -maxAngleOuter) {
        angleSpot4 = -maxAngleOuter;
        directionSpot4 = 1;
      }

      // Farben für die vier Spotlights (verschiedene Farben!)
      const colorSpot1 = spotlightColors[colorChangeRef.current % spotlightColors.length];
      const colorSpot2 = spotlightColors[(colorChangeRef.current + 2) % spotlightColors.length];
      const colorSpot3 = spotlightColors[(colorChangeRef.current + 4) % spotlightColors.length];
      const colorSpot4 = spotlightColors[(colorChangeRef.current + 6) % spotlightColors.length];

      // GRUND-BELEUCHTUNG ZUERST ZEICHNEN (unter den Spotlights!)
      // Beide Grundlichter haben die GLEICHE FARBE wie die äußeren Spots
      const groundLightColor = colorSpot1; // Beide Grundlichter nutzen die Farbe des ersten Spots!

      // Linke Grundbeleuchtung NUR als Lichteffekt (ohne Bild-Aufdeckung)
      ctx.save();
      const leftGroundIntensity = 0.3 + Math.abs(Math.sin(angleSpot1 * Math.PI / 180)) * 0.2;
      const leftGroundRadius = canvas.width * 0.3;

      // Weicher Gradient für Grundbeleuchtung
      const leftGroundGradient = ctx.createRadialGradient(
        0, canvas.height, 0,
        0, canvas.height, leftGroundRadius
      );
      leftGroundGradient.addColorStop(0, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.4})`);
      leftGroundGradient.addColorStop(0.3, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.2})`);
      leftGroundGradient.addColorStop(0.6, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.08})`);
      leftGroundGradient.addColorStop(0.85, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${leftGroundIntensity * 0.02})`);
      leftGroundGradient.addColorStop(1, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, 0)`);

      ctx.fillStyle = leftGroundGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Rechte Grundbeleuchtung NUR als Lichteffekt (ohne Bild-Aufdeckung)
      ctx.save();
      const rightGroundIntensity = 0.3 + Math.abs(Math.sin(angleSpot4 * Math.PI / 180)) * 0.2;
      const rightGroundRadius = canvas.width * 0.3;

      // Weicher Gradient für Grundbeleuchtung
      const rightGroundGradient = ctx.createRadialGradient(
        canvas.width, canvas.height, 0,
        canvas.width, canvas.height, rightGroundRadius
      );
      rightGroundGradient.addColorStop(0, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.4})`);
      rightGroundGradient.addColorStop(0.3, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.2})`);
      rightGroundGradient.addColorStop(0.6, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.08})`);
      rightGroundGradient.addColorStop(0.85, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, ${rightGroundIntensity * 0.02})`);
      rightGroundGradient.addColorStop(1, `rgba(${groundLightColor.r}, ${groundLightColor.g}, ${groundLightColor.b}, 0)`);

      ctx.fillStyle = rightGroundGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Jetzt die SPOTLIGHTS DARÜBER zeichnen - 4 gleichmäßig verteilt!
      drawSpotlight(canvas.width * 0.2, angleSpot1, colorSpot1, false);   // Spot 1 (20%)
      drawSpotlight(canvas.width * 0.4, angleSpot2, colorSpot2, true);    // Spot 2 (40%) - BREITER!
      drawSpotlight(canvas.width * 0.6, angleSpot3, colorSpot3, true);    // Spot 3 (60%) - BREITER!
      drawSpotlight(canvas.width * 0.8, angleSpot4, colorSpot4, false);   // Spot 4 (80%)

      // FOG MACHINE BURST EFFECT - Realistischer Nebelmaschinen-Ausstoß
      const currentTime = Date.now();

      // Prüfe ob neuer Burst starten soll
      if (!fogMachineActiveRef.current && currentTime >= fogNextBurstTimeRef.current) {
        // Starte neuen Fog Burst
        fogMachineActiveRef.current = true;
        fogBurstStartTimeRef.current = currentTime;

        // Zufällige Burst-Dauer zwischen 10-20 Sekunden
        fogBurstDurationRef.current = 10000 + Math.random() * 10000;

        // Nächster Burst in 15-30 Sekunden nach diesem Burst endet
        fogNextBurstTimeRef.current = currentTime + fogBurstDurationRef.current + 15000 + Math.random() * 15000;

        // Neue zufällige Position für die Nebelmaschine (links oder rechts)
        fogMachinePositionRef.current = Math.random() < 0.5 ? 0.1 + Math.random() * 0.2 : 0.7 + Math.random() * 0.2;

        console.log('💨 FOG BURST STARTED! Duration:', Math.round(fogBurstDurationRef.current / 1000), 'seconds');
      }

      // Update Fog Intensity während des Bursts
      if (fogMachineActiveRef.current) {
        const burstElapsed = currentTime - fogBurstStartTimeRef.current;
        const burstProgress = burstElapsed / fogBurstDurationRef.current;

        if (burstProgress >= 1) {
          // Burst beendet
          fogMachineActiveRef.current = false;
          fogIntensityRef.current = 0;
          console.log('💨 Fog burst ended. Next in:', Math.round((fogNextBurstTimeRef.current - currentTime) / 1000), 'seconds');
        } else {
          // Berechne Intensität: Starker Anfang, dann langsames Ausbreiten
          if (burstProgress < 0.2) {
            // Aufbau-Phase (erste 20%)
            fogIntensityRef.current = burstProgress * 5; // Schnell auf 1.0
          } else if (burstProgress < 0.7) {
            // Haupt-Phase (20-70%)
            fogIntensityRef.current = 1.0 - (burstProgress - 0.2) * 0.6; // Langsam auf 0.7 runter
          } else {
            // Auslauf-Phase (70-100%)
            fogIntensityRef.current = 0.7 * (1 - (burstProgress - 0.7) / 0.3); // Fade out
          }
        }
      }

      // Animiere den Nebel-Offset
      fogOffsetRef.current += 0.5 * speedMultiplierRef.current;

      // NEBEL NUR IN SPOTLIGHT-BEREICHEN SICHTBAR!
      if (fogIntensityRef.current > 0) {
        ctx.save();

        // Speichere die aktuellen Spotlight-Positionen und Winkel - 4 Spots!
        const spotlights = [
          { x: canvas.width * 0.2, angle: angleSpot1, color: colorSpot1, isCenter: false },
          { x: canvas.width * 0.4, angle: angleSpot2, color: colorSpot2, isCenter: true },
          { x: canvas.width * 0.6, angle: angleSpot3, color: colorSpot3, isCenter: true },
          { x: canvas.width * 0.8, angle: angleSpot4, color: colorSpot4, isCenter: false }
        ];

        // Zeichne Nebel für jeden Spotlight separat
        spotlights.forEach((spot) => {
          ctx.save();

          // Berechne Spotlight-Kegel-Bereich
          const spotY = -50;
          const stageY = canvas.height * 0.7;
          const angleRad = (spot.angle * Math.PI) / 180;
          const beamEndX = spot.x + Math.sin(angleRad) * (stageY + 50);
          const beamEndY = stageY;
          const beamWidth = (spot.isCenter ? 180 : 100) * speedMultiplierRef.current;

          // Erstelle Clipping-Path für diesen Spotlight
          ctx.beginPath();
          ctx.moveTo(spot.x - 5, spotY);
          ctx.lineTo(spot.x + 5, spotY);
          ctx.lineTo(beamEndX + beamWidth, beamEndY + 200);
          ctx.lineTo(beamEndX - beamWidth, beamEndY + 200);
          ctx.closePath();
          ctx.clip();

          // NEBEL-PARTIKEL NUR IM LICHTKEGEL
          const fogDensity = fogIntensityRef.current;

          // Mehrere Nebel-Schichten mit verschiedenen Höhen - VIEL DICHTER!
          for (let layer = 0; layer < 5; layer++) { // Mehr Schichten!
            const layerHeight = canvas.height * (0.2 + layer * 0.18);
            const layerOpacity = fogDensity * 0.35 * (1 - layer * 0.15); // DOPPELT SO STARK!

            // Wabernde Nebel-Wolken - MEHR WOLKEN!
            for (let i = 0; i < 5; i++) { // 5 statt 3!
              const offsetX = Math.sin((fogOffsetRef.current + layer * 100 + i * 50) * 0.01) * 70;
              const offsetY = Math.sin((fogOffsetRef.current + layer * 80 + i * 30) * 0.008) * 30;

              const fogX = beamEndX + offsetX;
              const fogY = layerHeight + offsetY;
              const fogRadius = 120 + Math.sin(fogOffsetRef.current * 0.01 + i) * 40; // GRÖßERE WOLKEN!

              // Nebel-Gradient mit Spotlight-Farbe getönt
              const fogGradient = ctx.createRadialGradient(
                fogX, fogY, 0,
                fogX, fogY, fogRadius
              );

              // Nebel nimmt die Farbe des Spotlights an! - INTENSIVER!
              const tintedOpacity = layerOpacity * (0.8 + beatFlashRef.current * 0.4);
              fogGradient.addColorStop(0, `rgba(${spot.color.r}, ${spot.color.g}, ${spot.color.b}, ${tintedOpacity * 0.5})`);
              fogGradient.addColorStop(0.3, `rgba(220, 225, 230, ${tintedOpacity * 0.4})`);
              fogGradient.addColorStop(0.6, `rgba(200, 210, 220, ${tintedOpacity * 0.2})`);
              fogGradient.addColorStop(1, 'transparent');

              ctx.fillStyle = fogGradient;
              ctx.fillRect(fogX - fogRadius, fogY - fogRadius, fogRadius * 2, fogRadius * 2);
            }
          }

          // Bodennebel im Lichtkegel - DICHTER!
          if (fogDensity > 0.2) { // Früher sichtbar
            const groundFogGradient = ctx.createLinearGradient(
              beamEndX - beamWidth, canvas.height,
              beamEndX - beamWidth, canvas.height * 0.5 // Höher hinauf!
            );

            const groundOpacity = fogDensity * 0.6; // STÄRKER!

            // Bodennebel auch mit Spotlight-Farbe getönt
            groundFogGradient.addColorStop(0, `rgba(${spot.color.r * 0.7 + 60}, ${spot.color.g * 0.7 + 65}, ${spot.color.b * 0.7 + 70}, ${groundOpacity})`);
            groundFogGradient.addColorStop(0.5, `rgba(190, 200, 210, ${groundOpacity * 0.7})`);
            groundFogGradient.addColorStop(1, 'transparent');

            ctx.fillStyle = groundFogGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Volumetrische Licht-Streuung im Nebel - INTENSIVER!
          const scatterGradient = ctx.createLinearGradient(
            spot.x, spotY,
            beamEndX, beamEndY + 150 // Länger!
          );

          const scatterOpacity = fogDensity * 0.25 * (1 + beatFlashRef.current * 0.7); // VIEL STÄRKER!
          scatterGradient.addColorStop(0, `rgba(${spot.color.r}, ${spot.color.g}, ${spot.color.b}, ${scatterOpacity * 0.4})`);
          scatterGradient.addColorStop(0.5, `rgba(${spot.color.r * 0.8 + 40}, ${spot.color.g * 0.8 + 40}, ${spot.color.b * 0.8 + 40}, ${scatterOpacity * 0.2})`);
          scatterGradient.addColorStop(1, 'transparent');

          ctx.fillStyle = scatterGradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.restore();
        });

        // Kleine schwebende Partikel die nur in Lichtkegeln sichtbar sind
        if (fogIntensityRef.current > 0.5 && beatFlashRef.current > 0.3) {
          ctx.globalAlpha = beatFlashRef.current * 0.5;

          for (let i = 0; i < 15; i++) {
            const particleX = Math.random() * canvas.width;
            const particleY = canvas.height * (0.3 + Math.random() * 0.5);
            const particleRadius = 2 + Math.random() * 4;

            // Prüfe ob Partikel in einem Lichtkegel ist
            let inSpotlight = false;
            let spotlightColor = { r: 220, g: 230, b: 240 };

            for (const spot of spotlights) {
              const angleRad = (spot.angle * Math.PI) / 180;
              const beamEndX = spot.x + Math.sin(angleRad) * (canvas.height * 0.7 + 50);
              const beamWidth = (spot.isCenter ? 180 : 100) * speedMultiplierRef.current;

              // Einfache Prüfung ob Punkt im Dreieck ist
              if (Math.abs(particleX - beamEndX) < beamWidth) {
                inSpotlight = true;
                spotlightColor = spot.color;
                break;
              }
            }

            if (inSpotlight) {
              ctx.beginPath();
              ctx.arc(particleX, particleY, particleRadius, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${spotlightColor.r}, ${spotlightColor.g}, ${spotlightColor.b}, 0.6)`;
              ctx.fill();
            }
          }

          ctx.globalAlpha = 1;
        }

        ctx.restore();
      }

      // Leichter Ambient-Nebel auch wenn keine Maschine aktiv (für Atmosphäre)
      if (fogIntensityRef.current < 0.1) {
        ctx.save();
        const ambientOpacity = 0.03 + beatFlashRef.current * 0.02;
        const ambientGradient = ctx.createLinearGradient(
          0, canvas.height,
          0, canvas.height * 0.6
        );

        ambientGradient.addColorStop(0, `rgba(180, 190, 200, ${ambientOpacity})`);
        ambientGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = ambientGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }


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

        // RANDOM VOLLBILD-BLITZ (20% Chance bei starkem Beat!)
        if (Math.random() < 0.2 && beatFlashRef.current > 0.85) {
          // Wähle zufällige Blitz-Farbe
          const fullFlashColors = [
            { r: 255, g: 255, b: 255, intensity: 0.9 },  // Weißer Blitz
            { r: 255, g: 100, b: 0, intensity: 0.7 },     // Orange Blitz
            { r: 0, g: 200, b: 255, intensity: 0.7 },     // Cyan Blitz
            { r: 255, g: 0, b: 100, intensity: 0.7 },     // Pink Blitz
          ];

          const flashColor = fullFlashColors[Math.floor(Math.random() * fullFlashColors.length)];
          const flashIntensity = flashColor.intensity * beatFlashRef.current;

          // VOLLBILD-BLITZ!
          ctx.fillStyle = `rgba(${flashColor.r}, ${flashColor.g}, ${flashColor.b}, ${flashIntensity})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          console.log('⚡ FULL SCREEN STROBE FLASH!');
        }

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
      {/* Background image - now changes based on beat */}
      <div
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${activeImageUrl})` }}
      />

      {/* Canvas for spotlight effects */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Beat indicator for debugging slideshow */}
      {slideImages && slideImages.length > 0 && isActive && (
        <div className={styles.beatIndicator}>
          <div className={`${styles.beatDot} ${showBeatPulse ? styles.pulse : ''}`} />
          <span className={styles.beatCount}>{beatCount}</span>
          <span style={{ marginLeft: '10px', color: '#ff6b35' }}>
            Img: {currentImageIndex + 1}/{slideImages.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(SimpleSpotlight);