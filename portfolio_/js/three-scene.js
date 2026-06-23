/**
 * Three.js 3D Background Scene for Kurapati Hruthik's Portfolio
 * Renders high-visibility floating wireframe models illuminated by neon and emissive lights
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('three-canvas');
  if (!container) return;

  let scene, camera, renderer, particles;
  let torusKnot, sideSphere, centerIco;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let scrollY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  init();
  animate();

  function init() {
    // 1. Create Scene
    scene = new THREE.Scene();

    // 2. Setup Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 850;

    // 3. Add Point Lights for neon reflection shading
    const cyanLight = new THREE.PointLight(0x06b6d4, 5, 1500);
    cyanLight.position.set(400, 200, 300);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 5, 1500);
    purpleLight.position.set(-400, -200, 300);
    scene.add(purpleLight);

    const whiteLight = new THREE.PointLight(0xffffff, 2.0, 1000);
    whiteLight.position.set(0, 0, 500);
    scene.add(whiteLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // 4. Create Particles (Starfield)
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color('#06b6d4'); // Cyan accent
    const color2 = new THREE.Color('#8b5cf6'); // Purple accent
    const tempColor = new THREE.Color();

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2000;
      positions[i + 1] = (Math.random() - 0.5) * 2000;
      positions[i + 2] = (Math.random() - 0.5) * 2000;

      const ratio = Math.random();
      tempColor.lerpColors(color1, color2, ratio);
      colors[i] = tempColor.r;
      colors[i + 1] = tempColor.g;
      colors[i + 2] = tempColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleTexture = createCircleTexture();

    const material = new THREE.PointsMaterial({
      size: 10, // Increased size (10 instead of 6) for clear visibility
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      opacity: 0.8 // High visibility
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 5. Add Torus Knot (moves on scroll, reflects lights, emissive glow)
    const torusGeo = new THREE.TorusKnotGeometry(130, 42, 160, 18);
    const torusMat = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6, // Purple base
      emissive: 0x2b1055, // Emissive purple glow for constant baseline visibility
      wireframe: true,
      transparent: true,
      opacity: 0.45, // High visibility
      shininess: 120,
      specular: 0xffffff
    });
    torusKnot = new THREE.Mesh(torusGeo, torusMat);
    torusKnot.position.set(300, 100, 50);
    scene.add(torusKnot);

    // 6. Add Sphere (moves on scroll, reflects lights, emissive glow)
    const sphereGeo = new THREE.SphereGeometry(120, 24, 24);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x06b6d4, // Cyan base
      emissive: 0x052e3d, // Emissive cyan glow
      wireframe: true,
      transparent: true,
      opacity: 0.35, // High visibility
      shininess: 120,
      specular: 0xffffff
    });
    sideSphere = new THREE.Mesh(sphereGeo, sphereMat);
    sideSphere.position.set(-350, -180, 0);
    scene.add(sideSphere);

    // 7. Add Center Floating Icosahedron (attracts central focus, emissive glow)
    const icoGeo = new THREE.IcosahedronGeometry(90, 1);
    const icoMat = new THREE.MeshPhongMaterial({
      color: 0x00f0ff,
      emissive: 0x003b46, // Emissive glow
      wireframe: true,
      transparent: true,
      opacity: 0.32,
      shininess: 150
    });
    centerIco = new THREE.Mesh(icoGeo, icoMat);
    centerIco.position.set(0, 0, -200);
    scene.add(centerIco);

    // 8. Setup WebGL Renderer (Solid Clear background for additive rendering visibility)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050508, 1); // Dark space black
    container.appendChild(renderer.domElement);

    // 9. Event Listeners
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll);
  }

  // Generate bright circular particle texture programmatically
  function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.85)'); // Brighter core
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.25)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);

    const texture = new THREE.CanvasTexture(canvas); // CanvasTexture updates automatically
    return texture;
  }

  function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.45;
    mouseY = (event.clientY - windowHalfY) * 0.45;
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onWindowScroll() {
    scrollY = window.scrollY;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Rotate particles
    if (particles) {
      particles.rotation.y = Date.now() * 0.00003;
      particles.rotation.x = Date.now() * 0.00001;
    }

    // Scroll parallax transitions
    if (torusKnot) {
      torusKnot.rotation.y = Date.now() * 0.00015 + scrollY * 0.002;
      torusKnot.rotation.x = Date.now() * 0.0001 + scrollY * 0.001;
      torusKnot.position.y = 100 - scrollY * 0.7; // Drift vertically
    }

    if (sideSphere) {
      sideSphere.rotation.y = -Date.now() * 0.0001 - scrollY * 0.001;
      sideSphere.position.y = -180 - scrollY * 0.5;
    }

    if (centerIco) {
      centerIco.rotation.y = Date.now() * 0.0003;
      centerIco.rotation.z = Date.now() * 0.0002;
      centerIco.position.y = -scrollY * 0.35;
    }

    // Shift camera slightly based on mouse
    camera.position.x += (targetX - camera.position.x) * 0.08;
    camera.position.y += (-targetY - camera.position.y) * 0.08;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
});
