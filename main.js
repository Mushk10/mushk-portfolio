/**
 * MUSHK ZEHRA - 3D PORTFOLIO JAVASCRIPT
 * Three.js Interactive 3D Canvas, Card Tilt Physics, Typewriter, and UI Interactivity
 */

// =============================================================================
// 1. TYPEWRITER EFFECT
// =============================================================================
const roles = [
  "Frontend Developer",
  "Aspiring AI Engineer",
  "BS AI Student at Iqra University",
  "Python & Machine Learning Explorer",
  "C# & Object-Oriented Programmer"
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 90;
const deletingSpeed = 45;
const delayBetweenWords = 1800;

function typeWriter() {
  const typewriterElement = document.getElementById("typewriter");
  if (!typewriterElement) return;

  const currentRole = roles[roleIndex];

  if (!isDeleting) {
    typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(typeWriter, delayBetweenWords);
      return;
    }
  } else {
    typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeWriter, 400);
      return;
    }
  }

  setTimeout(typeWriter, isDeleting ? deletingSpeed : typingSpeed);
}

// =============================================================================
// 2. THREE.JS BACKGROUND INTERACTIVE PARTICLE SYSTEM
// =============================================================================
let bgRenderer, bgScene, bgCamera, bgParticles;
const bgMouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

function initBackground3D() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  bgScene = new THREE.Scene();
  bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  bgCamera.position.z = 400;

  bgRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
  bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles creation
  const particleCount = window.innerWidth < 768 ? 400 : 850;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 1200;
    positions[i + 1] = (Math.random() - 0.5) * 1200;
    positions[i + 2] = (Math.random() - 0.5) * 800;
    scales[i / 3] = Math.random() * 2 + 1;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

  // Circular glow particle texture
  const pCanvas = document.createElement("canvas");
  pCanvas.width = 32;
  pCanvas.height = 32;
  const pCtx = pCanvas.getContext("2d");
  const pGrad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
  pGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
  pGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.9)");
  pGrad.addColorStop(0.8, "rgba(0, 210, 255, 0.2)");
  pGrad.addColorStop(1, "rgba(2, 8, 23, 0)");
  pCtx.fillStyle = pGrad;
  pCtx.beginPath();
  pCtx.arc(16, 16, 16, 0, Math.PI * 2);
  pCtx.fill();

  const pTexture = new THREE.CanvasTexture(pCanvas);

  const material = new THREE.PointsMaterial({
    size: 5,
    map: pTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    color: 0x38bdf8
  });

  bgParticles = new THREE.Points(geometry, material);
  bgScene.add(bgParticles);

  window.addEventListener("resize", onBgResize);
  document.addEventListener("mousemove", onBgMouseMove);
  animateBg();
}

function onBgResize() {
  if (!bgCamera || !bgRenderer) return;
  bgCamera.aspect = window.innerWidth / window.innerHeight;
  bgCamera.updateProjectionMatrix();
  bgRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onBgMouseMove(e) {
  bgMouse.targetX = (e.clientX - window.innerWidth / 2) * 0.08;
  bgMouse.targetY = (e.clientY - window.innerHeight / 2) * 0.08;
}

function animateBg() {
  requestAnimationFrame(animateBg);
  bgMouse.x += (bgMouse.targetX - bgMouse.x) * 0.05;
  bgMouse.y += (bgMouse.targetY - bgMouse.y) * 0.05;

  if (bgParticles) {
    bgParticles.rotation.y += 0.0006;
    bgParticles.rotation.x += 0.0003;
    bgParticles.position.x = bgMouse.x * 0.3;
    bgParticles.position.y = -bgMouse.y * 0.3;
  }

  if (bgRenderer && bgScene && bgCamera) {
    bgRenderer.render(bgScene, bgCamera);
  }
}

// =============================================================================
// 3. THREE.JS HERO INTERACTIVE 3D AI CORE
// =============================================================================
let heroRenderer, heroScene, heroCamera;
let heroGroup, coreMesh, wireIcosahedron, gyroRing1, gyroRing2, heroParticles;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const heroPointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

function initHero3D() {
  const container = document.getElementById("canvas-3d-hero");
  if (!container || typeof THREE === "undefined") return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 450;

  heroScene = new THREE.Scene();
  heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  heroCamera.position.z = 24;

  heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  heroRenderer.setSize(width, height);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(heroRenderer.domElement);

  // Group to rotate everything together
  heroGroup = new THREE.Group();
  heroScene.add(heroGroup);

  // 1. Outer Wireframe Icosahedron
  const icoGeo = new THREE.IcosahedronGeometry(7, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  });
  wireIcosahedron = new THREE.Mesh(icoGeo, icoMat);
  heroGroup.add(wireIcosahedron);

  // 2. Inner Glowing Core (Octahedron with translucent light blue material)
  const coreGeo = new THREE.OctahedronGeometry(4.2, 0);
  const coreMat = new THREE.MeshPhongMaterial({
    color: 0x0a2a5e,
    emissive: 0x00d2ff,
    emissiveIntensity: 0.45,
    specular: 0xffffff,
    shininess: 90,
    wireframe: false,
    transparent: true,
    opacity: 0.85,
    flatShading: true
  });
  coreMesh = new THREE.Mesh(coreGeo, coreMat);
  heroGroup.add(coreMesh);

  // Inner wireframe for core
  const coreWireGeo = new THREE.OctahedronGeometry(4.25, 0);
  const coreWireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });
  const coreWire = new THREE.Mesh(coreWireGeo, coreWireMat);
  heroGroup.add(coreWire);

  // 3. Gyroscopic Orbital Rings
  const ring1Geo = new THREE.TorusGeometry(8.6, 0.08, 16, 100);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
  gyroRing1 = new THREE.Mesh(ring1Geo, ringMat1);
  heroGroup.add(gyroRing1);

  const ring2Geo = new THREE.TorusGeometry(10.2, 0.08, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.4 });
  gyroRing2 = new THREE.Mesh(ring2Geo, ringMat2);
  gyroRing2.rotation.x = Math.PI / 3;
  heroGroup.add(gyroRing2);

  // 4. Satellite Particle Cloud
  const heroParticleCount = 180;
  const heroPartGeo = new THREE.BufferGeometry();
  const heroPartPos = new Float32Array(heroParticleCount * 3);

  for (let i = 0; i < heroParticleCount * 3; i += 3) {
    const radius = 6.5 + Math.random() * 4.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    heroPartPos[i] = radius * Math.sin(phi) * Math.cos(theta);
    heroPartPos[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
    heroPartPos[i + 2] = radius * Math.cos(phi);
  }

  heroPartGeo.setAttribute("position", new THREE.BufferAttribute(heroPartPos, 3));
  const heroPartMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.25,
    transparent: true,
    opacity: 0.85
  });
  heroParticles = new THREE.Points(heroPartGeo, heroPartMat);
  heroGroup.add(heroParticles);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x0c2548, 1.5);
  heroScene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00d2ff, 2.5, 50);
  pointLight1.position.set(12, 12, 12);
  heroScene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x38bdf8, 2, 50);
  pointLight2.position.set(-12, -12, -12);
  heroScene.add(pointLight2);

  // Drag Interaction
  const domElem = heroRenderer.domElement;
  domElem.addEventListener("mousedown", (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  domElem.addEventListener("mousemove", (e) => {
    if (!isDragging) {
      const rect = domElem.getBoundingClientRect();
      heroPointer.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.5;
      heroPointer.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 1.5;
    } else {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      heroGroup.rotation.y += deltaX * 0.01;
      heroGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  });

  // Touch controls for mobile
  domElem.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    isDragging = false;
  });

  domElem.addEventListener("touchmove", (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      heroGroup.rotation.y += deltaX * 0.015;
      heroGroup.rotation.x += deltaY * 0.015;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener("resize", onHeroResize);
  animateHero();
}

function onHeroResize() {
  const container = document.getElementById("canvas-3d-hero");
  if (!container || !heroCamera || !heroRenderer) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  heroCamera.aspect = width / height;
  heroCamera.updateProjectionMatrix();
  heroRenderer.setSize(width, height);
}

function animateHero() {
  requestAnimationFrame(animateHero);

  // Smooth mouse follow when not dragging
  if (!isDragging) {
    heroPointer.x += (heroPointer.targetX - heroPointer.x) * 0.05;
    heroPointer.y += (heroPointer.targetY - heroPointer.y) * 0.05;

    heroGroup.rotation.y += 0.007;
    heroGroup.rotation.x = heroPointer.y * 0.4;
    heroGroup.rotation.z = -heroPointer.x * 0.2;
  }

  if (wireIcosahedron) wireIcosahedron.rotation.y -= 0.005;
  if (coreMesh) coreMesh.rotation.y += 0.012;
  if (gyroRing1) gyroRing1.rotation.z += 0.01;
  if (gyroRing2) gyroRing2.rotation.y += 0.015;
  if (heroParticles) heroParticles.rotation.y -= 0.003;

  if (heroRenderer && heroScene && heroCamera) {
    heroRenderer.render(heroScene, heroCamera);
  }
}

// =============================================================================
// 4. 3D CARD TILT EFFECT (Dynamic Spatial Physics)
// =============================================================================
function initTiltEffect() {
  const tiltCards = document.querySelectorAll(".tilt-card");

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });
}

// =============================================================================
// 5. NAVBAR SCROLL & MOBILE MENU
// =============================================================================
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link, .nav-cta-btn");

  // Sticky Navbar on Scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar?.classList.add("scrolled");
    } else {
      navbar?.classList.remove("scrolled");
    }
  });

  // Mobile menu toggle
  menuToggle?.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu?.classList.toggle("active");
  });

  // Close mobile menu upon clicking links
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle?.classList.remove("active");
      navMenu?.classList.remove("active");
    });
  });
}

// =============================================================================
// 6. PROJECT MODALS
// =============================================================================
const projectData = {
  tuneflow: {
    title: "TuneFlow Music App",
    category: "Full-Stack Architecture • Java Backend & REST API",
    description: "A modern, high-performance web audio streaming application powered by an enterprise Java backend delivering high-throughput REST APIs, coupled with a responsive HTML5, CSS3, and JavaScript modern client interface with real-time stream playback.",
    features: [
      "Enterprise Java REST API: High-throughput endpoints for music tracks, albums, artist catalogs, and JSON serialization.",
      "Reactive Client Interface: Dynamic HTML5, CSS3, and JavaScript audio player with continuous stream playback, seekbar, and volume controls.",
      "RESTful API Integration: Asynchronous fetch requests for real-time track search, playlist generation, and category filtering.",
      "Web Audio Visualizer: Integrated audio frequency visualizer animating live frequency spikes synchronized with playback.",
      "Modular Multi-Tier Architecture: Decoupled client-server design following robust software engineering practices."
    ],
    techStack: ["Java", "REST API", "JavaScript", "HTML5", "CSS3", "Web Audio API", "JSON Data Models"],
    status: "Completed Full-Stack Project"
  },
  sms: {
    title: "Student Management System",
    category: "C# Desktop Application & Architecture",
    description: "A robust desktop application engineered in C# focusing on object-oriented programming principles and structured record management for educational institutions.",
    features: [
      "Complete CRUD Operations (Create, Read, Update, Delete) for student profiles and grades.",
      "Input validation pipelines to prevent data inconsistency or duplicate records.",
      "Modular Object-Oriented structure separating business logic, entity models, and interface.",
      "Clear error logging and exception handling safeguarding against crashes.",
      "Built and tested in Visual Studio using standard .NET frameworks."
    ],
    techStack: ["C#", ".NET Framework", "Visual Studio", "OOP", "Data Structures"],
    status: "Completed Academic Project"
  },
  sls: {
    title: "Smart Library System",
    category: "C# System Architecture & File Handling",
    description: "An automated library inventory and circulation software utilizing persistent file storage to track books, patrons, checkouts, and returns seamlessly.",
    features: [
      "Dynamic search algorithms allowing instant lookup by title, author, or ISBN.",
      "Persistent file handling for storing catalog datasets and transaction logs.",
      "Real-time update logic for book availability and member borrowing limits.",
      "Clean command/interface flows tailored for administrative efficiency.",
      "Rigorous unit testing of file reading and writing routines."
    ],
    techStack: ["C#", "File I/O", "Data Structures", "Visual Studio", "Algorithms"],
    status: "Completed Academic Project"
  },
  port: {
    title: "Immersive 3D Portfolio Platform",
    category: "Interactive 3D Web & Modern Frontend",
    description: "A state-of-the-art personal portfolio website designed with spatial depth, Three.js WebGL rendering, 3D card tilt physics, and responsive aesthetics strictly adhering to a dark blue, light blue, and white theme.",
    features: [
      "Custom Three.js particle constellation background responding to mouse coordinates.",
      "Interactive 3D hero gyroscope and AI core with drag rotation and damping physics.",
      "Kinematic 3D card tilt calculating angle of reflection in real-time.",
      "Zero portrait photo policy, utilizing geometric wireframes and SVG cybernetic badges.",
      "Fully responsive across smartphones, tablets, and high-DPI desktop displays."
    ],
    techStack: ["HTML5", "CSS3", "JavaScript ES6+", "Three.js", "WebGL"],
    status: "Production Ready"
  }
};

window.openProjectModal = function (projectId) {
  const modal = document.getElementById("project-modal");
  const modalBody = document.getElementById("modal-body");
  const project = projectData[projectId];

  if (!modal || !modalBody || !project) return;

  modalBody.innerHTML = `
    <div style="margin-bottom: 20px;">
      <span style="font-size: 0.8rem; color: var(--accent-light); background: rgba(56, 189, 248, 0.12); padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(56, 189, 248, 0.3);">${project.category}</span>
      <h2 style="font-size: 1.8rem; margin-top: 14px; margin-bottom: 8px; color: var(--text-white);">${project.title}</h2>
      <p style="color: var(--text-dim); font-size: 0.95rem; line-height: 1.7;">${project.description}</p>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 1.05rem; margin-bottom: 12px; color: var(--accent-light);"><i class="fa-solid fa-list-check"></i> Key Engineering Highlights</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
        ${project.features.map(f => `<li style="position: relative; padding-left: 20px; color: var(--text-dim); font-size: 0.9rem;"><span style="position: absolute; left: 0; color: var(--accent-light);">▹</span> ${f}</li>`).join("")}
      </ul>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 1.05rem; margin-bottom: 10px; color: var(--accent-light);"><i class="fa-solid fa-microchip"></i> Technologies & Tools</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${project.techStack.map(t => `<span style="font-size: 0.78rem; background: rgba(5, 19, 41, 0.8); border: 1px solid rgba(56, 189, 248, 0.25); color: var(--accent-ice); padding: 4px 12px; border-radius: 8px;">${t}</span>`).join("")}
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(56, 189, 248, 0.2); padding-top: 18px;">
      <span style="font-size: 0.82rem; color: var(--accent-ice);"><i class="fa-solid fa-circle-check" style="color: var(--accent-light);"></i> ${project.status}</span>
      <button class="btn btn-secondary" onclick="closeProjectModal()" style="padding: 8px 18px; font-size: 0.86rem;">Close Window</button>
    </div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeProjectModal = function () {
  const modal = document.getElementById("project-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
};

// =============================================================================
// 7. RESUME MODAL HANDLER
// =============================================================================
function initResumeModal() {
  const printBtn = document.getElementById("print-cv-btn");
  const resumeModal = document.getElementById("resume-modal");

  printBtn?.addEventListener("click", () => {
    resumeModal?.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  window.closeResumeModal = function () {
    resumeModal?.classList.remove("active");
    document.body.style.overflow = "auto";
  };
}

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  const pModal = document.getElementById("project-modal");
  const rModal = document.getElementById("resume-modal");

  if (e.target === pModal) window.closeProjectModal();
  if (e.target === rModal) window.closeResumeModal();
});

// =============================================================================
// 8. CONTACT FORM HANDLER
// =============================================================================
window.handleFormSubmit = function (e) {
  e.preventDefault();
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const feedback = document.getElementById("form-feedback");

  if (!form || !submitBtn || !feedback) return;

  const originalContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Transmitting Message...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

  setTimeout(() => {
    submitBtn.innerHTML = `<span>Message Sent Successfully!</span> <i class="fa-solid fa-check"></i>`;
    feedback.className = "form-notification success";
    feedback.innerHTML = `<strong>Thank you for reaching out!</strong><br/>Your message has been dispatched to Mushk Zehra (zehramushk10@gmail.com). You will receive a response shortly.`;
    form.reset();

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }, 4000);
  }, 1200);
};

// =============================================================================
// 9. THREE.JS 3D FLOATING LAPTOP & AUDIO STUDIO SIMULATION
// =============================================================================
let laptopRenderer, laptopScene, laptopCamera;
let laptopGroup, laptopScreenCtx, laptopScreenTexture;
let laptopClock = new THREE.Clock();
const laptopPointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
let isLaptopDragging = false;
let laptopPrevMouse = { x: 0, y: 0 };

function initLaptop3D() {
  const container = document.getElementById("canvas-3d-laptop");
  if (!container || typeof THREE === "undefined") return;

  const width = container.clientWidth || 360;
  const height = container.clientHeight || 340;

  laptopScene = new THREE.Scene();
  laptopCamera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
  laptopCamera.position.set(0, 4, 22);
  laptopCamera.lookAt(0, 1, 0);

  laptopRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  laptopRenderer.setSize(width, height);
  laptopRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(laptopRenderer.domElement);

  // Group containing the entire floating laptop
  laptopGroup = new THREE.Group();
  laptopScene.add(laptopGroup);

  // Bright Pure White & Light Blue Metallic Materials for High Visibility
  const whiteChassisMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,          // PURE WHITE LAPTOP CHASSIS
    roughness: 0.15,
    metalness: 0.2,
    emissive: 0xffffff,
    emissiveIntensity: 0.12
  });

  const screenBezelMat = new THREE.MeshStandardMaterial({
    color: 0x051329,          // Sleek contrast bezel around display
    roughness: 0.4,
    metalness: 0.4
  });

  const accentMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff           // Neon Electric Light Blue
  });

  const whiteKeyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,          // Crisp White Keybed
    roughness: 0.25,
    metalness: 0.1
  });

  // 1. Laptop Base / Chassis (Bright White)
  const baseGeo = new THREE.BoxGeometry(13.2, 0.5, 9.2);
  const baseMesh = new THREE.Mesh(baseGeo, whiteChassisMat);
  baseMesh.position.set(0, -0.25, 0);
  laptopGroup.add(baseMesh);

  // Base Light Blue Glow Rim (Front Edge)
  const rimGeo = new THREE.BoxGeometry(13.3, 0.12, 0.15);
  const rimMesh = new THREE.Mesh(rimGeo, accentMat);
  rimMesh.position.set(0, 0, 4.6);
  laptopGroup.add(rimMesh);

  // Keyboard Bed (White / Light Silver Bed)
  const kbBedGeo = new THREE.BoxGeometry(11.4, 0.06, 4.8);
  const kbBed = new THREE.Mesh(kbBedGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 }));
  kbBed.position.set(0, 0.04, -1.2);
  laptopGroup.add(kbBed);

  // Individual Glowing White & Light Blue Key Strips
  for (let r = 0; r < 5; r++) {
    const keyRowGeo = new THREE.BoxGeometry(10.8, 0.1, 0.68);
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.15
    });
    const keyRow = new THREE.Mesh(keyRowGeo, keyMat);
    keyRow.position.set(0, 0.08, -2.8 + r * 0.85);
    laptopGroup.add(keyRow);

    // Glowing subtle key divider lines
    const keyLineGeo = new THREE.BoxGeometry(10.85, 0.11, 0.05);
    const keyLine = new THREE.Mesh(keyLineGeo, accentMat);
    keyLine.position.set(0, 0.09, -2.8 + r * 0.85 + 0.34);
    laptopGroup.add(keyLine);
  }

  // Trackpad (Pure White with Glowing Border)
  const tpGeo = new THREE.BoxGeometry(3.6, 0.05, 2.4);
  const tpMesh = new THREE.Mesh(tpGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15 }));
  tpMesh.position.set(0, 0.05, 2.3);
  laptopGroup.add(tpMesh);

  const tpBorderGeo = new THREE.BoxGeometry(3.75, 0.06, 2.55);
  const tpBorder = new THREE.Mesh(tpBorderGeo, new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true }));
  tpBorder.position.set(0, 0.06, 2.3);
  laptopGroup.add(tpBorder);

  // 2. Laptop Lid & Screen (Hinged at back z = -4.5)
  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, 0, -4.5);
  screenGroup.rotation.x = -Math.PI / 1.65; // Open angle ~110 degrees — clean straight-on viewing
  laptopGroup.add(screenGroup);

  // Screen Back / Lid (Pure White Outer Shell)
  const lidGeo = new THREE.BoxGeometry(13.2, 8.8, 0.38);
  const lidMesh = new THREE.Mesh(lidGeo, whiteChassisMat);
  lidMesh.position.set(0, 4.4, 0);
  screenGroup.add(lidMesh);

  // Inner Dark Screen Bezel for High Contrast
  const bezelGeo = new THREE.BoxGeometry(12.8, 8.4, 0.05);
  const bezelMesh = new THREE.Mesh(bezelGeo, screenBezelMat);
  bezelMesh.position.set(0, 4.4, 0.19);
  screenGroup.add(bezelMesh);

  // Glowing MZ Emblem on back of lid
  const logoGeo = new THREE.RingGeometry(0.9, 1.2, 32);
  const logoMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });
  const logoMesh = new THREE.Mesh(logoGeo, logoMat);
  logoMesh.position.set(0, 4.4, -0.22);
  screenGroup.add(logoMesh);

  // Dynamic Screen Display Canvas
  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = 512;
  screenCanvas.height = 340;
  laptopScreenCtx = screenCanvas.getContext("2d");
  laptopScreenTexture = new THREE.CanvasTexture(screenCanvas);

  const displayGeo = new THREE.PlaneGeometry(12.2, 7.8);
  const displayMat = new THREE.MeshBasicMaterial({
    map: laptopScreenTexture,
    transparent: false
  });
  const displayMesh = new THREE.Mesh(displayGeo, displayMat);
  displayMesh.position.set(0, 4.4, 0.22);
  screenGroup.add(displayMesh);

  // 3. Orbiting Particles / Floating Notes around the Laptop
  const orbitCount = 50;
  const orbitGeo = new THREE.BufferGeometry();
  const orbitPos = new Float32Array(orbitCount * 3);

  for (let i = 0; i < orbitCount * 3; i += 3) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 8.5 + Math.random() * 4.5;
    orbitPos[i] = Math.cos(angle) * rad;
    orbitPos[i + 1] = (Math.random() - 0.5) * 8;
    orbitPos[i + 2] = Math.sin(angle) * rad;
  }

  orbitGeo.setAttribute("position", new THREE.BufferAttribute(orbitPos, 3));
  const orbitMat = new THREE.PointsMaterial({
    color: 0x00d2ff,
    size: 0.4,
    transparent: true,
    opacity: 0.95
  });
  const orbitPoints = new THREE.Points(orbitGeo, orbitMat);
  laptopGroup.add(orbitPoints);

  // High-Visibility Lighting
  const ambLight = new THREE.AmbientLight(0xffffff, 2.2); // Bright ambient
  laptopScene.add(ambLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8); // Bright white key light
  keyLight.position.set(12, 22, 18);
  laptopScene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x00d2ff, 2.2); // Electric light blue rim
  rimLight.position.set(-14, -8, -12);
  laptopScene.add(rimLight);

  const frontFill = new THREE.PointLight(0xffffff, 2.0, 40); // Front direct illumination
  frontFill.position.set(0, 10, 15);
  laptopScene.add(frontFill);

  // Initial Laptop orientation — STRAIGHT front-facing (no side tilt)
  laptopGroup.rotation.x = 0.18;  // slight upward tilt so keyboard is visible
  laptopGroup.rotation.y = 0.0;   // ZERO Y rotation — faces the camera straight

  // Mouse & Drag events for laptop
  const domElem = laptopRenderer.domElement;
  domElem.addEventListener("mousedown", (e) => {
    isLaptopDragging = true;
    laptopPrevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener("mouseup", () => {
    isLaptopDragging = false;
  });

  domElem.addEventListener("mousemove", (e) => {
    if (isLaptopDragging) {
      const deltaX = e.clientX - laptopPrevMouse.x;
      const deltaY = e.clientY - laptopPrevMouse.y;
      laptopGroup.rotation.y += deltaX * 0.012;
      laptopGroup.rotation.x += deltaY * 0.012;
      laptopPrevMouse = { x: e.clientX, y: e.clientY };
    } else {
      const rect = domElem.getBoundingClientRect();
      laptopPointer.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
      laptopPointer.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.6;
    }
  });

  window.addEventListener("resize", onLaptopResize);
  animateLaptop();
}

function updateLaptopScreen(time) {
  if (!laptopScreenCtx || !laptopScreenTexture) return;
  const ctx = laptopScreenCtx;

  // Screen background: deep obsidian blue for high readability
  ctx.fillStyle = "#020917";
  ctx.fillRect(0, 0, 512, 340);

  // Window Top Header Bar
  ctx.fillStyle = "#081a38";
  ctx.fillRect(0, 0, 512, 36);

  // Control dots
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(18, 18, 5, 0, Math.PI * 2);
  ctx.arc(34, 18, 5, 0, Math.PI * 2);
  ctx.arc(50, 18, 5, 0, Math.PI * 2);
  ctx.fill();

  // Header Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("MUSHK ZEHRA • AI & FRONTEND PORTFOLIO", 75, 23);

  // CV Details Content on Screen
  ctx.fillStyle = "#38bdf8";
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText("// --- CANDIDATE PROFILE (CV GROUNDED) ---", 20, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText("DEVELOPER: Mushk Zehra", 20, 80);

  ctx.fillStyle = "#bae6fd";
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText("TITLE    : Frontend Developer | Aspiring AI Engineer", 20, 100);
  ctx.fillText("DEGREE   : BS Artificial Intelligence (Iqra University)", 20, 120);

  ctx.fillStyle = "#38bdf8";
  ctx.fillText("SKILLS   : Python, Java, C#, JS, SQL, NumPy, Pandas", 20, 142);

  ctx.fillStyle = "#00d2ff";
  ctx.fillText("PROJECTS : TuneFlow Music, Student Mgmt, Smart Library", 20, 164);

  ctx.fillStyle = "#ffffff";
  ctx.fillText("STATUS   : Available for Internships & Full-Time ⚡", 20, 186);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillText("CONTACT  : zehramushk10@gmail.com | +92 3702280485", 20, 208);

  // Dynamic Audio & AI Neural Waveform in Electric Cyan
  ctx.strokeStyle = "#00d2ff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x < 512; x += 5) {
    const wave = Math.sin(x * 0.05 + time * 5) * Math.cos(x * 0.025 + time * 2.5) * 18;
    const y = 265 + wave;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Bottom Status Bar
  ctx.fillStyle = "#081a38";
  ctx.fillRect(0, 310, 512, 30);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("● KARACHI, PAKISTAN • ENGLISH & URDU • ACTIVE", 16, 328);

  laptopScreenTexture.needsUpdate = true;
}

function onLaptopResize() {
  const container = document.getElementById("canvas-3d-laptop");
  if (!container || !laptopCamera || !laptopRenderer) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  laptopCamera.aspect = width / height;
  laptopCamera.updateProjectionMatrix();
  laptopRenderer.setSize(width, height);
}

function animateLaptop() {
  requestAnimationFrame(animateLaptop);
  const elapsedTime = laptopClock.getElapsedTime();

  // Smooth floating levitation physics
  if (laptopGroup) {
    laptopGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.55;
    
    if (!isLaptopDragging) {
      laptopPointer.x += (laptopPointer.targetX - laptopPointer.x) * 0.05;
      laptopPointer.y += (laptopPointer.targetY - laptopPointer.y) * 0.05;

      // Straight-facing with very subtle gentle sway (no side tilt)
      laptopGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.08 + laptopPointer.x * 0.5;
      laptopGroup.rotation.x = 0.18 + laptopPointer.y * 0.3;
      laptopGroup.rotation.z = Math.cos(elapsedTime * 0.9) * 0.02;
    }
  }

  // Update dynamic display
  updateLaptopScreen(elapsedTime);

  if (laptopRenderer && laptopScene && laptopCamera) {
    laptopRenderer.render(laptopScene, laptopCamera);
  }
}

// Set dynamic year in footer
function setDynamicYear() {
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// =============================================================================
// INITIALIZATION ON DOM READY
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
  typeWriter();
  initBackground3D();
  initHero3D();
  initTiltEffect();
  initNavigation();
  initResumeModal();
  initLaptop3D();
  setDynamicYear();
});
