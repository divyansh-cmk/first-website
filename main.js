// SlimEats Scroll Animation Controller

document.addEventListener('DOMContentLoaded', () => {
  const totalFrames = 240;
  const images = [];
  let loadedCount = 0;
  
  // DOM Elements
  const canvas = document.getElementById('riceball-canvas');
  const context = canvas.getContext('2d');
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderText = document.getElementById('loader-text');
  
  // Animation State
  let currentFrameIndex = 0;
  let targetFrameIndex = 0;
  const ease = 0.08; // Lerp easing factor (lower = smoother, higher = tighter)
  
  // Create progress bar element dynamically at the top of the body
  const progressIndicator = document.createElement('div');
  progressIndicator.className = 'scroll-progress-bar';
  document.body.appendChild(progressIndicator);

  // Return the filename of a frame
  function getFramePath(index) {
    const paddedIndex = String(index).padStart(3, '0');
    return `/frames/ezgif-frame-${paddedIndex}.jpg`;
  }

  // Draw image or offscreen canvas to canvas covering the entire viewport (cover)
  function drawFrame(img) {
    if (!img) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Crop coordinates to exclude the black margins and watermark on the sides (X: 150 to 1770)
    const cropX = 150;
    const cropY = 0;
    const cropWidth = 1620; // 1770 - 150 (perfect 3:2 content box)
    const cropHeight = 1080;
    
    // Cover calculation using the cropped content region
    const hRatio = canvasWidth / cropWidth;
    const vRatio = canvasHeight / cropHeight;
    const ratio = Math.max(hRatio, vRatio);
    
    const targetWidth = cropWidth * ratio;
    const targetHeight = cropHeight * ratio;
    
    // Center the cropped animation region in the viewport
    const xOffset = (canvasWidth - targetWidth) / 2;
    const yOffset = (canvasHeight - targetHeight) / 2;
    
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(
      img, 
      cropX, cropY, cropWidth, cropHeight, // Source cropped content
      xOffset, yOffset, targetWidth, targetHeight // Destination covering screen
    );
  }

  // Handle Canvas Resizing
  function resizeCanvas() {
    // Multiply by devicePixelRatio to support retina screens without blur
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    // Scale context back to normal size
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    
    // Draw current frame immediately
    const roundFrame = Math.round(currentFrameIndex);
    if (images[roundFrame]) {
      drawFrame(images[roundFrame]);
    }
  }

  // Pre-process image to remove black background (close to 0,0,0) and make it transparent
  function makeImageTransparent(img) {
    return new Promise((resolve) => {
      const process = () => {
        const offscreenCanvas = document.createElement('canvas');
        const offscreenContext = offscreenCanvas.getContext('2d');
        
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        
        offscreenContext.drawImage(img, 0, 0);
        
        const imageData = offscreenContext.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Background color of frames is (1,1,1). Threshold below 14 makes it fully transparent.
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          
          if (r < 14 && g < 14 && b < 14) {
            data[i+3] = 0; // Set alpha to 0 (fully transparent)
          }
        }
        
        offscreenContext.putImageData(imageData, 0, 0);
        resolve(offscreenCanvas);
      };

      if (img.complete) {
        process();
      } else {
        img.onload = process;
      }
    });
  }

  // Preload and transparent-key all 240 image frames
  function preloadImages() {
    return new Promise((resolve) => {
      for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        
        img.onload = async () => {
          // Key out black background offscreen
          const transparentCanvas = await makeImageTransparent(img);
          images[i - 1] = transparentCanvas;
          
          loadedCount++;
          const percentage = Math.round((loadedCount / totalFrames) * 100);
          
          // Update loader UI
          if (loaderBar) loaderBar.style.width = `${percentage}%`;
          if (loaderText) loaderText.textContent = `Preparing fresh ingredients... ${percentage}%`;
          
          if (loadedCount === totalFrames) {
            // Loader is fully done
            setTimeout(() => {
              if (loader) loader.classList.add('loaded');
              resolve();
            }, 500);
          }
        };
        
        img.onerror = () => {
          console.error(`Failed to load frame: ${img.src}`);
          loadedCount++;
          if (loadedCount === totalFrames) {
            resolve();
          }
        };
      }
    });
  }

  // Scroll handler to compute the target frame index relative to the animation wrapper
  function handleScroll() {
    const wrapper = document.querySelector('.scroll-anim-wrapper');
    if (!wrapper) return;
    
    const scrollTop = window.scrollY;
    const wrapperHeight = wrapper.offsetHeight;
    const winHeight = window.innerHeight;
    
    // The maximum scroll within the wrapper is wrapperHeight - winHeight
    const scrollMaxRange = wrapperHeight - winHeight;
    
    // Progress is bounded between 0 and 1
    const progress = scrollMaxRange > 0 ? Math.min(1, Math.max(0, scrollTop / scrollMaxRange)) : 0;
    
    // Calculate target frame
    targetFrameIndex = Math.min(totalFrames - 1, Math.max(0, Math.floor(progress * totalFrames)));
  }

  // Animation render loop (smooth transitions via lerp)
  function renderLoop() {
    // prefers-reduced-motion check
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Switch frames instantly without lerp if user prefers reduced motion
      currentFrameIndex = targetFrameIndex;
    } else {
      // Lerp logic: current = current + (target - current) * ease
      currentFrameIndex += (targetFrameIndex - currentFrameIndex) * ease;
    }

    const currentFrameRounded = Math.round(currentFrameIndex);
    
    if (images[currentFrameRounded]) {
      drawFrame(images[currentFrameRounded]);
    }
    
    // Update scroll progress bar width relative to the scroll animation wrapper
    const wrapper = document.querySelector('.scroll-anim-wrapper');
    if (wrapper) {
      const scrollTop = window.scrollY;
      const scrollMax = wrapper.offsetHeight - window.innerHeight;
      const percent = scrollMax > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollMax) * 100)) : 0;
      if (progressIndicator) {
        progressIndicator.style.width = `${percent}%`;
      }
    }
    
    requestAnimationFrame(renderLoop);
  }

  // Initialize scrollytelling section intersections
  function initScrollTriggers() {
    const sections = document.querySelectorAll('.scroll-section');
    
    const observerOptions = {
      root: null,
      rootMargin: '-25% 0px -25% 0px', // Trigger when section takes up screen center
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Remove active class from all and assign to current
          sections.forEach(s => s.classList.remove('active'));
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);
    
    sections.forEach(section => {
      observer.observe(section);
    });
  }

  // Interactive Flavor Selector
  function initFlavorSelector() {
    const flavorOptions = document.querySelectorAll('.flavor-option');
    const flavorSelect = document.getElementById('flavor-input');
    
    flavorOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove active state and assign to clicked option
        flavorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        // Update select dropdown in order form
        const selectedFlavor = option.getAttribute('data-flavor');
        if (flavorSelect) {
          flavorSelect.value = selectedFlavor;
        }
      });
    });

    if (flavorSelect) {
      flavorSelect.addEventListener('change', (e) => {
        const selectedVal = e.target.value;
        flavorOptions.forEach(opt => {
          if (opt.getAttribute('data-flavor') === selectedVal) {
            opt.classList.add('active');
          } else {
            opt.classList.remove('active');
          }
        });
      });
    }
  }

  // Tailwind sections interactions and reveal animations
  function initTailwindInteractions() {
    // Button scales on click
    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('mousedown', () => {
        button.classList.add('scale-95');
      });
      button.addEventListener('mouseup', () => {
        button.classList.remove('scale-95');
      });
      button.addEventListener('mouseleave', () => {
        button.classList.remove('scale-95');
      });
    });

    // Reveal animation for explore flavor cards
    const observerOptions = {
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.group').forEach(el => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      revealObserver.observe(el);
    });
  }

  // Start initialization
  preloadImages().then(() => {
    // Setup Canvas sizes and events
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calls
    handleScroll();
    initScrollTriggers();
    initFlavorSelector();
    initTailwindInteractions();
    
    // Launch anim loop
    requestAnimationFrame(renderLoop);
  });
});
