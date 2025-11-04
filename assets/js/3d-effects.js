/**
 * 3D Effects System with Three.js
 * Cyber-themed particle system and 3D backgrounds
 * Dependencies: Three.js (ES Module)
 */

import * as THREE from 'three';

class CyberEffects {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.animationId = null;
    this.isInitialized = false;
  }

  /**
   * Initialize 3D background with particles
   * @param {string} containerId - DOM element ID for rendering
   */
  init(containerId = 'cyber-3d-background') {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container element #${containerId} not found.`);
        return false;
      }

      // Setup scene
      this.scene = new THREE.Scene();

      // Setup camera
      this.camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      this.camera.position.z = 50;

      // Setup renderer
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      // Create particle system
      this.createParticleSystem();

      // Create geometric elements
      this.createGeometricElements();

      // Handle window resize
      window.addEventListener('resize', () => this.onWindowResize(container));

      // Start animation loop
      this.animate();

      this.isInitialized = true;
      console.log('✓ Cyber 3D Effects initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize 3D effects:', error);
      return false;
    }
  }

  /**
   * Create cyber-themed particle system
   */
  createParticleSystem() {
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Cyber color palette
    const colorPalette = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xff00ff), // Magenta
      new THREE.Color(0x0080ff), // Electric Blue
      new THREE.Color(0x8000ff), // Purple
      new THREE.Color(0x00ff88)  // Neon Green
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Position
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      // Color - random from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Size
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Shader material for glowing particles
    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);

    // Store original positions for animation
    this.particlePositions = positions.slice();
  }

  /**
   * Create floating geometric elements
   */
  createGeometricElements() {
    this.geometricElements = [];

    // Create wireframe shapes
    const shapes = [
      { geometry: new THREE.OctahedronGeometry(3, 0), position: [-15, 10, -10] },
      { geometry: new THREE.TorusGeometry(2, 0.5, 8, 16), position: [15, -10, -5] },
      { geometry: new THREE.IcosahedronGeometry(2.5, 0), position: [0, 15, -15] }
    ];

    shapes.forEach((shape, index) => {
      const edges = new THREE.EdgesGeometry(shape.geometry);
      const material = new THREE.LineBasicMaterial({
        color: index === 0 ? 0x00f0ff : index === 1 ? 0xff00ff : 0x0080ff,
        transparent: true,
        opacity: 0.6
      });
      const wireframe = new THREE.LineSegments(edges, material);
      wireframe.position.set(...shape.position);

      this.scene.add(wireframe);
      this.geometricElements.push({
        mesh: wireframe,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        }
      });
    });
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.0005;

    // Animate particles
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;

      for (let i = 0; i < positions.length; i += 3) {
        // Wave motion
        positions[i + 1] = this.particlePositions[i + 1] + Math.sin(time + i) * 2;

        // Gentle drift
        positions[i] += Math.sin(time + i * 0.1) * 0.01;
        positions[i + 2] += Math.cos(time + i * 0.1) * 0.01;

        // Wrap around
        if (positions[i] > 50) positions[i] = -50;
        if (positions[i] < -50) positions[i] = 50;
        if (positions[i + 2] > 50) positions[i + 2] = -50;
        if (positions[i + 2] < -50) positions[i + 2] = 50;
      }

      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y += 0.0005;
    }

    // Animate geometric elements
    if (this.geometricElements) {
      this.geometricElements.forEach(element => {
        element.mesh.rotation.x += element.rotationSpeed.x;
        element.mesh.rotation.y += element.rotationSpeed.y;
        element.mesh.rotation.z += element.rotationSpeed.z;
      });
    }

    // Camera slight movement (parallax effect)
    this.camera.position.x = Math.sin(time * 0.5) * 5;
    this.camera.position.y = Math.cos(time * 0.3) * 5;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Handle window resize
   */
  onWindowResize(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Clean up and dispose
   */
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.particles) {
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }

    if (this.geometricElements) {
      this.geometricElements.forEach(element => {
        element.mesh.geometry.dispose();
        element.mesh.material.dispose();
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    console.log('✓ 3D Effects disposed');
  }
}

// Create enhanced particle effect for hero section
class HeroParticleEffect {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mousePosition = { x: 0, y: 0 };
    this.animationId = null;
  }

  /**
   * Initialize canvas-based particle effect
   * @param {string} canvasId - Canvas element ID
   */
  init(canvasId = 'hero-particles') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas element #${canvasId} not found.`);
      return false;
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    // Create particles
    this.createParticles();

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    });

    // Window resize
    window.addEventListener('resize', () => this.resize());

    // Start animation
    this.animate();

    console.log('✓ Hero Particle Effect initialized');
    return true;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    const particleCount = 100;
    this.particles = [];

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: this.getRandomColor()
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(95, 244, 255, 0.8)',    // Cyan
      'rgba(255, 0, 255, 0.8)',    // Magenta
      'rgba(0, 128, 255, 0.8)',    // Electric Blue
      'rgba(128, 0, 255, 0.8)',    // Purple
      'rgba(0, 255, 136, 0.8)'     // Neon Green
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Clear canvas with trail effect
    this.ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((particle, i) => {
      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Mouse interaction
      const dx = this.mousePosition.x - particle.x;
      const dy = this.mousePosition.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        const force = (150 - distance) / 150;
        particle.x -= dx * force * 0.01;
        particle.y -= dy * force * 0.01;
      }

      // Draw particle with glow
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = particle.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Connect nearby particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const other = this.particles[j];
        const dx2 = particle.x - other.x;
        const dy2 = particle.y - other.y;
        const dist = Math.sqrt(dx2 * dx2 + dy2 * dy2);

        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(other.x, other.y);
          this.ctx.strokeStyle = `rgba(95, 244, 255, ${1 - dist / 100})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    });
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    console.log('✓ Hero Particle Effect disposed');
  }
}

// Holographic text effect
class HolographicTextEffect {
  constructor(element) {
    this.element = element;
    this.originalText = element.textContent;
    this.element.setAttribute('data-text', this.originalText);
  }

  enable() {
    this.element.classList.add('cyber-glitch');
  }

  disable() {
    this.element.classList.remove('cyber-glitch');
  }
}

// Card 3D tilt effect
class Card3DTilt {
  constructor(selector) {
    this.cards = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
      card.addEventListener('mouseleave', () => this.handleMouseLeave(card));
    });
  }

  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  }

  handleMouseLeave(card) {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
}

// Export for use in other scripts
window.CyberEffects = CyberEffects;
window.HeroParticleEffect = HeroParticleEffect;
window.HolographicTextEffect = HolographicTextEffect;
window.Card3DTilt = Card3DTilt;

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main 3D background if container exists
  if (document.getElementById('cyber-3d-background')) {
    const cyberEffects = new CyberEffects();
    cyberEffects.init('cyber-3d-background');
    window.cyberEffectsInstance = cyberEffects;
  }

  // Initialize hero particles if canvas exists
  if (document.getElementById('hero-particles')) {
    const heroParticles = new HeroParticleEffect();
    heroParticles.init('hero-particles');
    window.heroParticlesInstance = heroParticles;
  }

  // Initialize card 3D tilt effects
  if (document.querySelectorAll('.cyber-3d-card').length > 0) {
    new Card3DTilt('.cyber-3d-card');
  }

  console.log('✓ Cyber 3D Effects system loaded');
});
