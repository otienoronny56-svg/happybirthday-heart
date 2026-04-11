document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Date Locking Logic
    // const today = new Date(); // Production Mode: Real-time locking
    const today = new Date('2026-04-16'); // Test Mode: Unlocked for final testing
    const chapters = document.querySelectorAll('.chapter');
    chapters.forEach(chapter => {
        const unlockDate = new Date(chapter.dataset.date);
        
        // Check if today is on or after the unlock date
        if (today >= unlockDate) {
            chapter.classList.remove('locked');
            chapter.classList.add('unlocked');
        } else {
            // Keep it locked
            chapter.classList.add('locked');
        }
    });

    // 3. GSAP Animations - Landing
    const tl = gsap.timeline();
    tl.to('.elegant-text', { opacity: 1, y: 0, duration: 1.5, delay: 0.5, ease: 'power4.out' })
      .to('.sub-text', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, "-=0.8")
      .to('.fluid-btn', { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' }, "-=0.5")
      .to('.secondary-btn', { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' }, "-=0.8");

    // 4. Start Button Click
    const landing = document.getElementById('landing');
    const startBtn = document.getElementById('start-btn');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const noBtn = document.getElementById('no-btn');
    let noBtnAttempts = 0;

    // Handle Secret Note (Step-by-Step Multi-Tap)
    const noteBtn = document.getElementById('show-message-btn');
    const secretNote = document.getElementById('secret-note');
    if (noteBtn && secretNote) {
        const noteContainer = secretNote.querySelector('.note-container');
        const topPanel = secretNote.querySelector('.panel-top');
        const botPanel = secretNote.querySelector('.panel-bot');
        const hint = document.getElementById('unfold-hint');
        const closeNote = secretNote.querySelector('.close-note');
        let foldState = 0; // 0: Popped, 1: Top Open, 2: Bottom Open

        noteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            secretNote.classList.add('visible');
            foldState = 0;
            
            // Step 1: Pop the Middle Square
            gsap.fromTo(noteContainer, 
                { scale: 0.6, opacity: 0, rotation: -5 }, 
                { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: "power3.out", onComplete: () => {
                    hint.innerText = "Tap to unfold top...";
                    hint.classList.add('visible');
                }}
            );
        });

        // The "Grand Unfold" Tap Handler
        noteContainer.addEventListener('click', (e) => {
            if (e.target.closest('.close-note')) return;

            if (foldState === 0) {
                // Step 2: Unfold Top
                gsap.to(topPanel, {
                    rotateX: 0,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
                hint.innerText = "One more tap to finish...";
                foldState = 1;
            } else if (foldState === 1) {
                // Step 3: Unfold Bottom
                gsap.to(botPanel, {
                    rotateX: 0,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
                hint.classList.remove('visible');
                foldState = 2;
            }
        });

        const hideNote = () => {
            const foldTl = gsap.timeline({ onComplete: () => {
                secretNote.classList.remove('visible');
                // Reset for next time
                gsap.set([topPanel, botPanel], { rotateX: (i) => i === 0 ? -90 : 90 });
                hint.classList.remove('visible');
            }});
            foldTl.to(botPanel, { rotateX: 90, duration: 0.8, ease: "power2.inOut" });
            foldTl.to(topPanel, { rotateX: -90, duration: 0.8, ease: "power2.inOut" }, "-=0.6");
            foldTl.to(noteContainer, { scale: 0.8, opacity: 0, duration: 0.6, ease: "power2.in" });
        };

        if (closeNote) closeNote.addEventListener('click', hideNote);
        secretNote.addEventListener('click', (e) => { if (e.target === secretNote) hideNote(); });
    }

    // --- Interactive "No" Button Logic ---
    const messages = ["I insist! 🥺", "Just press this, my sister! ✨", "You know I love you, right? 💖"];
    const emojis = [
        // Trial 1: Confused/Sad (A bit hurt)
        `<svg class="emoji-svg" viewBox="0 0 100 100"><circle class="sketch-path" cx="50" cy="50" r="40"/><path class="sketch-path" d="M35,40 Q40,30 45,40"/><path class="sketch-path" d="M55,30 Q60,20 65,30"/><path class="sketch-path" d="M35,70 Q50,60 65,70"/></svg>`,
        // Trial 2: Pleading/Unbelieving (Face with downward mouth)
        `<svg class="emoji-svg" viewBox="0 0 100 100"><circle class="sketch-path" cx="50" cy="50" r="40"/><path class="sketch-path" d="M30,40 H45 V45 H30 Z"/><path class="sketch-path" d="M55,40 H70 V45 H55 Z"/><path class="sketch-path" d="M30,75 Q50,55 70,75"/></svg>`,
        // Trial 3: Heartbroken/Crying
        `<svg class="emoji-svg" viewBox="0 0 100 100"><circle class="sketch-path" cx="50" cy="50" r="40"/><path class="sketch-path" d="M30,35 Q40,25 50,35"/><path class="sketch-path" d="M50,35 Q60,25 70,35"/><path class="sketch-path" d="M30,75 Q50,55 70,75"/><path class="sketch-path" d="M35,80 V90"/><path class="sketch-path" d="M65,80 V90"/></svg>`
    ];

    noBtn.addEventListener('mouseenter', () => {
        // Evasive jump
        const x = (Math.random() - 0.5) * window.innerWidth * 0.7;
        const y = (Math.random() - 0.5) * window.innerHeight * 0.7;
        
        gsap.to(noBtn, { x: x, y: y, duration: 0.4, ease: 'power2.out' });
        
        // Trigger floating message
        spawnFloatingMessage(messages[noBtnAttempts % messages.length]);
        
        // Trigger emoji
        showEmoji(noBtnAttempts % 3);

        // Third Trial: Insistence Arrows
        if (noBtnAttempts === 2) {
            showArrow();
        }
        
        noBtnAttempts++;
    });

    function spawnFloatingMessage(text) {
        const container = document.getElementById('floating-msgs');
        const wordDiv = document.createElement('div');
        wordDiv.className = 'floating-word';
        wordDiv.innerText = text;
        
        const rect = noBtn.getBoundingClientRect();
        wordDiv.style.left = `${rect.left}px`;
        wordDiv.style.top = `${rect.top}px`;
        container.appendChild(wordDiv);
        
        // Slower floating away (4 seconds)
        gsap.to(wordDiv, {
            y: -120, // Reduced distance for slower feel
            x: (Math.random() - 0.5) * 80,
            opacity: 0,
            rotation: (Math.random() - 0.5) * 30,
            duration: 4,
            ease: 'sine.out',
            onComplete: () => wordDiv.remove()
        });
    }

    function showEmoji(index) {
        const canvas = document.getElementById('emoji-canvas');
        canvas.innerHTML = emojis[index];
        canvas.style.display = 'flex';
        gsap.set(canvas, { opacity: 1 });
        
        const paths = canvas.querySelectorAll('.sketch-path');
        paths.forEach(path => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
            gsap.to(path, { strokeDashoffset: 0, duration: 1, ease: 'power2.out' });
        });
        
        gsap.to(canvas, { opacity: 0, delay: 2.5, duration: 0.5, onComplete: () => {
            canvas.innerHTML = '';
            canvas.style.display = 'none';
        }});
    }

    function showArrow() {
        const container = document.getElementById('arrow-pointer');
        // Two arrows
        container.innerHTML = `
            <svg class="arrow-svg arrow-1" viewBox="0 0 100 100">
                <path class="arrow-path" d="M10,50 Q40,40 80,50 L70,40 M80,50 L70,60" />
            </svg>
            <svg class="arrow-svg arrow-2" viewBox="0 0 100 100">
                <path class="arrow-path" d="M10,50 Q40,40 80,50 L70,40 M80,50 L70,60" />
            </svg>
        `;
        
        const rect = startBtn.getBoundingClientRect();
        gsap.set(container, { opacity: 1 });
        
        // Position arrow 1 (left)
        gsap.set('.arrow-1', { 
            position: 'fixed',
            left: rect.left - 90, 
            top: rect.top - 10,
            width: 80, height: 80
        });

        // Position arrow 2 (right)
        gsap.set('.arrow-2', { 
            position: 'fixed',
            left: rect.right + 10, 
            top: rect.top - 10,
            width: 80, height: 80,
            scaleX: -1 // Flip horizontally
        });

        const paths = container.querySelectorAll('.arrow-path');
        paths.forEach(path => {
            const length = path.getTotalLength();
            gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
        });
        
        const tl = gsap.timeline({ repeat: -1 });
        tl.to(paths, { strokeDashoffset: 0, duration: 1 })
          .to('.arrow-1', { x: 15, duration: 0.6, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 1)
          .to('.arrow-2', { x: -15, duration: 0.6, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 1);

        gsap.to(container, { opacity: 0, delay: 8, duration: 1, onComplete: () => {
            tl.kill();
            container.innerHTML = '';
        }});
    }

    startBtn.addEventListener('click', () => {
        // Unlock main content
        mainContent.classList.remove('hidden');
        mainContent.classList.add('visible');
        
        // Start Music (Muted by default policy, but we attempt)
        bgMusic.play().catch(error => {
            console.log("Auto-play prevented. User interaction required for audio.");
        });

        // Fade out landing
        landing.classList.add('fade-out');

        // Reveal animations for scrolls
        initScrollAnimations();
        initInfiniteJourney();
        
        // Scroll to top just in case
        window.scrollTo(0, 0);
    });

    // 5. Scroll Animations (GSAP ScrollTrigger)
    function initScrollAnimations() {
        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

        // Parallax Effect for Images
        gsap.utils.toArray('.parallax-img').forEach(img => {
            gsap.to(img, {
                y: '20%',
                ease: 'none',
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

        // Day 2: Connection Map Animation
        initConnectionMap();

        // Fade Up Reveal for Chapters
        gsap.utils.toArray('.chapter-content').forEach(content => {
            gsap.from(content, {
                opacity: 0,
                y: 50,
                duration: 1.2,
                scrollTrigger: {
                    trigger: content,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        });

        // Special Birthday Reveal
        gsap.from('.birthday-title', {
            opacity: 0,
            scale: 0.8,
            duration: 2,
            ease: 'elastic.out(1, 0.5)',
            scrollTrigger: {
                trigger: '#day-4',
                start: 'top 50%',
            }
        });

        // --- The Infinite Memory Thread (Chapter 1) ---
    }

    function initInfiniteJourney() {
        const container = document.querySelector('.journey-container');
        const track = document.querySelector('.journey-track');
        if (!container || !track) return;

        let journeyTween;
        let resumeTimeout;
        
        const startAutoSlide = () => {
            const scrollWidth = track.scrollWidth;
            // The point where the original set ends and duplicates begin
            // Since we duplicated 3 out of 5, the wrap point is 5/8 of total width
            const wrapPoint = scrollWidth * (5/8);

            journeyTween = gsap.to(container, {
                scrollLeft: wrapPoint,
                duration: 30, // Elegant slow speed
                ease: "none",
                repeat: -1,
                modifiers: {
                    scrollLeft: gsap.utils.unitize(s => parseFloat(s) % wrapPoint)
                }
            });
        };

        // Start when section is reached
        ScrollTrigger.create({
            trigger: "#day-1",
            start: "top 80%",
            onEnter: () => startAutoSlide(),
            onLeave: () => { if (journeyTween) journeyTween.pause(); },
            onEnterBack: () => { if (journeyTween) journeyTween.play(); }
        });

        // Manual Interrupt Logic
        const handleInteraction = () => {
            if (journeyTween) journeyTween.kill();
            clearTimeout(resumeTimeout);
            resumeTimeout = setTimeout(startAutoSlide, 3500); // Resume after 3.5s of silence
        };

        // Listen for all types of manual moves
        container.addEventListener('touchstart', handleInteraction, { passive: true });
        container.addEventListener('mousedown', handleInteraction);
        container.addEventListener('wheel', handleInteraction, { passive: true });
        container.addEventListener('scroll', (e) => {
            // Only trigger if not caused by GSAP
            if (!gsap.isTweening(container)) {
                handleInteraction();
            }
        }, { passive: true });
        
        // Pause on hover for detail look
        container.addEventListener('mouseenter', () => { if (journeyTween) journeyTween.pause(); });
        container.addEventListener('mouseleave', () => { 
            if (!gsap.isTweening(container) && !resumeTimeout) startAutoSlide(); 
        });
    }

    function initScrollAnimations() {

        // Procedural Flower Bushes
        createFlowerBush('bush-day-1', false);

        // Handwritten Sticky Notes Reveal (Day 1)
        const stickerTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#bush-day-1",
                start: "top 75%",
                toggleActions: "play none none none"
            }
        });

        stickerTl.to('.day-1-stickers .sticker', {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            stagger: 1.5,
            delay: 4, 
            ease: "back.out(1.7)"
        })
        .to('.connector-path', {
            strokeDashoffset: 0,
            duration: 2,
            ease: "power2.inOut"
        }, "-=1.5"); // Start drawing as Ashley's note appears
        
        // 1. Infinite Journey (Day 1)
        initInfiniteJourney();

        // 2. Connection Map (Day 2 - Paper Plane)
        initConnectionMap();
        
        // 3. 28 Candles Ritual
        initCandleRitual();
    }

    function initCandleRitual() {
        const grid = document.getElementById('candle-grid');
        const wishPrompt = document.getElementById('wish-prompt');
        const ritualContainer = document.getElementById('candle-ritual');
        const celebration = document.getElementById('final-celebration');
        const wishBtn = document.getElementById('make-a-wish-btn');
        let extinguishedCount = 0;

        if (!grid) return;

        for (let i = 0; i < 28; i++) {
            const candle = document.createElement('div');
            candle.className = 'candle';
            candle.innerHTML = `
                <div class="candle-wax"></div>
                <div class="candle-wick"></div>
                <div class="flame-container">
                    <div class="flame-glow"></div>
                    <svg class="flame" viewBox="0 0 20 35">
                        <path d="M10,0 Q18,15 10,35 Q2,15 10,0" />
                    </svg>
                </div>
            `;

            candle.addEventListener('click', () => {
                if (!candle.classList.contains('extinguished')) {
                    candle.classList.add('extinguished');
                    extinguishedCount++;
                    
                    // Smoke Puff Animation
                    spawnSmokePuff(candle);
                    
                    if (extinguishedCount === 28) {
                        gsap.to(wishPrompt, { display: 'block', opacity: 1, duration: 1, delay: 0.5 });
                        ritualContainer.querySelector('.ritual-hint').style.display = 'none';
                    }
                }
            });

            grid.appendChild(candle);
        }

        wishBtn.addEventListener('click', () => {
            // High Energy Effects
            triggerConfetti();
            spawnCelebrationTexts();
            triggerFireworks();
            releaseBalloons();
            releaseDreamLanterns(); // Climax addition
            
            // Transition to Final Celebration
            gsap.to(ritualContainer, { opacity: 0, scale: 0.8, duration: 0.8, onComplete: () => {
                ritualContainer.classList.add('hidden');
                celebration.classList.remove('hidden');
                gsap.fromTo(celebration, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 });
                createFlowerBush('bush-day-4', true);
            }});
        });
    }

    function triggerFireworks() {
        for (let f = 0; f < 5; f++) {
            setTimeout(() => {
                const x = gsap.utils.random(20, 80);
                const y = gsap.utils.random(20, 50);
                const color = gsap.utils.random(['#ff9d00', '#f4c1bc', '#e6e6fa', '#ffffff', '#bd8749']);
                
                for (let i = 0; i < 30; i++) {
                    const spark = document.createElement('div');
                    spark.className = 'spark';
                    spark.style.background = color;
                    spark.style.left = `${x}%`;
                    spark.style.top = `${y}%`;
                    document.body.appendChild(spark);

                    const angle = (i / 30) * Math.PI * 2;
                    const velocity = gsap.utils.random(100, 200);
                    
                    gsap.to(spark, {
                        x: Math.cos(angle) * velocity,
                        y: Math.sin(angle) * velocity + 50, // Add gravity
                        opacity: 0,
                        scale: 0,
                        duration: 1.5,
                        ease: 'power2.out',
                        onComplete: () => spark.remove()
                    });
                }
            }, f * 500);
        }
    }

    function releaseBalloons() {
        const colors = ['#f4c1bc', '#ffd1dc', '#bd8749', '#e6e6fa', '#ffdab9'];
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const balloon = document.createElement('div');
                balloon.className = 'balloon';
                balloon.style.background = gsap.utils.random(colors);
                balloon.style.left = `${gsap.utils.random(10, 90)}%`;
                balloon.style.bottom = '-100px';
                document.body.appendChild(balloon);

                gsap.to(balloon, {
                    bottom: '120vh',
                    x: `+=${gsap.utils.random(-100, 100)}`,
                    rotation: gsap.utils.random(-20, 20),
                    duration: gsap.utils.random(4, 7),
                    ease: 'power1.in',
                    onComplete: () => balloon.remove()
                });
            }, i * 300);
        }
    }

    function spawnCelebrationTexts() {
        const phrases = [
            "Happiest Birthday my Precious sister! 🎂",
            "Enjoy your day! 💖",
            "You deserve the world! ✨",
            "28 Years of Brilliance! 🌟",
            "Love you tons! 👯‍♂️",
            "Make every second count! 🎈"
        ];

        phrases.forEach((text, i) => {
            setTimeout(() => {
                const msg = document.createElement('div');
                msg.className = 'celebratory-msg';
                msg.innerText = text;
                
                // Random position
                msg.style.left = `${gsap.utils.random(10, 70)}%`;
                msg.style.top = `${gsap.utils.random(20, 80)}%`;
                
                document.body.appendChild(msg);

                gsap.fromTo(msg, 
                    { opacity: 0, scale: 0.5, y: 50 },
                    { 
                        opacity: 1, scale: 1.2, y: -100, 
                        duration: 3, 
                        ease: 'power2.out',
                        onComplete: () => {
                            gsap.to(msg, { opacity: 0, duration: 1, delay: 1, onComplete: () => msg.remove() });
                        }
                    }
                );
            }, i * 800); // Stagger manually for extra control
        });
    }

    function spawnSmokePuff(candle) {
        const rect = candle.getBoundingClientRect();
        const smoke = document.createElement('div');
        smoke.style.position = 'fixed';
        smoke.style.left = `${rect.left + rect.width / 2}px`;
        smoke.style.top = `${rect.top}px`;
        smoke.style.width = '10px';
        smoke.style.height = '10px';
        smoke.style.background = 'rgba(200, 200, 200, 0.6)';
        smoke.style.borderRadius = '50%';
        smoke.style.pointerEvents = 'none';
        smoke.style.zIndex = '1000';
        document.body.appendChild(smoke);

        gsap.to(smoke, {
            y: -50,
            x: gsap.utils.random(-20, 20),
            opacity: 0,
            scale: 3,
            duration: 1,
            onComplete: () => smoke.remove()
        });
    }

    function triggerConfetti() {
        for (let i = 0; i < 100; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.position = 'fixed';
            conf.style.width = '10px';
            conf.style.height = '10px';
            conf.style.background = gsap.utils.random(['#f4c1bc', '#ffd1dc', '#bd8749', '#e6e6fa', '#ffdab9']);
            conf.style.left = '50%';
            conf.style.top = '50%';
            conf.style.zIndex = '2000';
            document.body.appendChild(conf);

            gsap.to(conf, {
                x: gsap.utils.random(-400, 400),
                y: gsap.utils.random(-400, 400),
                rotation: gsap.utils.random(0, 360),
                opacity: 0,
                scale: gsap.utils.random(0.5, 2),
                duration: gsap.utils.random(1, 3),
                onComplete: () => conf.remove()
            });
        }
    }

    function createFlowerBush(containerId, isCelebration) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.clientWidth || 600;
        const height = 400;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.style.overflow = "visible";
        container.appendChild(svg);

        // Add a beautiful vase
        const vase = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // Vase shape: wider at bottom, narrower at neck, slightly wider at rim
        vase.setAttribute("d", `M${width/2 - 20},${height} L${width/2 + 20},${height} Q${width/2 + 40},${height-10} ${width/2 + 25},${height-60} Q${width/2 + 15},${height-80} ${width/2 + 30},${height-100} L${width/2 - 30},${height-100} Q${width/2 - 15},${height-80} ${width/2 - 25},${height-60} Q${width/2 - 40},${height-10} ${width/2 - 20},${height} Z`);
        vase.setAttribute("fill", "url(#vaseGradient)");
        vase.setAttribute("stroke", "#bd8749");
        vase.setAttribute("stroke-width", "1");
        
        // Add gradient for vase
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad.setAttribute("id", "vaseGradient");
        grad.setAttribute("x1", "0%"); grad.setAttribute("y1", "0%"); grad.setAttribute("x2", "100%"); grad.setAttribute("y2", "0%");
        const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        s1.setAttribute("offset", "0%"); s1.setAttribute("stop-color", "#fefefe");
        const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        s2.setAttribute("offset", "100%"); s2.setAttribute("stop-color", "#f4c1bc");
        grad.appendChild(s1); grad.appendChild(s2);
        defs.appendChild(grad);
        svg.appendChild(defs);
        svg.appendChild(vase);

        const colors = ['#f4c1bc', '#ffd1dc', '#fefefe', '#e6e6fa', '#ffdab9'];
        const numBranches = isCelebration ? 35 : 25; // Massive increase for fullness
        
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        // 1. Vase fade in first
        masterTl.from(vase, { opacity: 0, y: 30, duration: 1.2, ease: "power2.out" });

        // 2. Grow branches sequentially
        for (let i = 0; i < numBranches; i++) {
            const angle = gsap.utils.mapRange(0, numBranches - 1, -170, -10, i) * (Math.PI / 180);
            const centerDist = Math.abs(i - (numBranches - 1) / 2);
            const baseLength = isCelebration ? 280 : 220;
            const length = baseLength - (centerDist * 10) + gsap.utils.random(-30, 30);
            
            const endX = width / 2 + Math.cos(angle) * length;
            const endY = height - 90 + Math.sin(angle) * length;
            
            const branch = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const curveIntensity = gsap.utils.mapRange(0, (numBranches-1)/2, 80, 5, centerDist);
            const midX = width / 2 + Math.cos(angle) * (length / 2) + (i < numBranches/2 ? -curveIntensity : curveIntensity);
            const midY = height - 90 + Math.sin(angle) * (length / 2) - 30;
            
            const d = `M${width / 2},${height - 90} Q${midX},${midY} ${endX},${endY}`;
            
            branch.setAttribute("d", d);
            branch.setAttribute("stroke", "#2d5a27");
            branch.setAttribute("fill", "none");
            branch.setAttribute("stroke-width", "2");
            const branchLength = length * 1.5; 
            branch.style.strokeDasharray = branchLength;
            branch.style.strokeDashoffset = branchLength;
            svg.insertBefore(branch, vase);

            // Stems grow after vase
            masterTl.to(branch, { strokeDashoffset: 0, duration: 1.8, ease: 'power1.out' }, 1 + (i * 0.05));

            const flowerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            svg.appendChild(flowerGroup);
            gsap.set(flowerGroup, { x: endX, y: endY });

            // 3. Bloom petals after stems reach their end
            const numPetals = 20; 
            for (let j = 0; j < numPetals; j++) {
                const petal = document.createElementNS("http://www.w3.org/2000/svg", "path");
                petal.setAttribute("d", "M0,0 C10,-10 15,-25 0,-35 C-15,-25 -10,-10 0,0 Z");
                petal.setAttribute("fill", colors[Math.floor(Math.random() * colors.length)]);
                flowerGroup.appendChild(petal);

                gsap.set(petal, { scale: 0, rotation: (j / numPetals) * 360, transformOrigin: "center bottom" });
                // Petals start blooming after the longest stem is done
                masterTl.to(petal, { scale: gsap.utils.random(0.4, 0.9), duration: 1, ease: "elastic.out(1, 0.5)" }, 2.5 + (i * 0.05) + (j * 0.02));
            }

            const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            center.setAttribute("r", "5");
            center.setAttribute("fill", "#bd8749");
            flowerGroup.appendChild(center);
            gsap.set(center, { scale: 0 });
            masterTl.to(center, { scale: 1, duration: 0.5 }, 2.8 + (i * 0.05));
        }
    }

    function initConnectionMap() {
        const arc = document.getElementById('connection-arc');
        const plane = document.getElementById('paper-plane');
        // --- Cinematic Message Logic (Compass Replacement) ---
        const cinematicOverlay = document.getElementById('map-dim-overlay');
        const textContainer = document.getElementById('cinematic-text-container');
        const cinematicLines = [
            "Across every ocean... 🌊",
            "Across every mile... ✈️",
            "You are always the brightest light in my sky.",
            "Happy Birthday, Sunflower! 🌻",
            "- Love, Ashley"
        ];

        function triggerCinematicMessage() {
            if (!cinematicOverlay || !textContainer || cinematicOverlay.classList.contains('triggered')) return;
            cinematicOverlay.classList.add('triggered');
            
            // 1. Reset container
            textContainer.innerHTML = '';
            cinematicOverlay.style.opacity = '1';
            
            const cinematicTl = gsap.timeline();
            
            cinematicLines.forEach((line, index) => {
                const wordEl = document.createElement('span');
                wordEl.className = 'cinematic-word';
                wordEl.innerText = line;
                textContainer.appendChild(wordEl);
                
                cinematicTl.to(wordEl, { 
                    opacity: 1, 
                    y: -20, 
                    filter: "blur(0px)",
                    duration: 1.5, 
                    ease: "power2.out" 
                }, index * 2)
                .to(wordEl, {
                    scale: 1.05,
                    duration: 2,
                    repeat: 1,
                    yoyo: true,
                    ease: "sine.inOut"
                }, index * 2);
            });

            // 2. Add tap to close
            const closePrompt = document.createElement('div');
            closePrompt.style.cssText = "color: #fff; opacity: 0; margin-top: 2rem; font-size: 0.9rem; cursor: pointer; text-align: center; width: 100%; font-family: sans-serif;";
            closePrompt.innerText = "(Tap anywhere to return to map)";
            textContainer.appendChild(closePrompt);
            
            cinematicTl.to(closePrompt, { opacity: 0.6, duration: 1 }, "+=1");

            const closeHider = () => {
                gsap.to([cinematicOverlay, textContainer], { opacity: 0, duration: 1, onComplete: () => {
                    cinematicOverlay.style.opacity = '0';
                    textContainer.innerHTML = '';
                    // Allow re-triggering if they scroll away and back? 
                    // No, usually just once is better for cinematic.
                }});
                window.removeEventListener('click', closeHider);
            };
            
            setTimeout(() => {
                window.addEventListener('click', closeHider);
            }, 3000);
        }

        // Trigger cinematic message as part of the map scroll
        ScrollTrigger.create({
            trigger: "#day-2",
            start: "top 20%",
            onEnter: () => triggerCinematicMessage()
        });

        // Path Drawing Logic
        const pathLength = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

        const mapTl = gsap.timeline({
            scrollTrigger: {
                trigger: '#day-2',
                start: 'top 60%',
                end: 'bottom 20%',
                scrub: 2,
            }
        });

        // 1. Draw the sweeping arc
        const kmCounter = document.getElementById('km-counter');
        const mmCounter = document.getElementById('mm-counter');

        mapTl.to(arc, {
            strokeDashoffset: 0,
            ease: 'none'
        })
        .to(plane, {
            motionPath: {
                path: arc,
                align: arc,
                autoRotate: true,
                alignOrigin: [0.5, 0.5]
            },
            ease: 'none'
        }, 0)
        // Counter Animations
        .to(kmCounter, {
            innerText: 7000,
            snap: { innerText: 1 },
            duration: 1,
            ease: 'none'
        }, 0)
        .to(mmCounter, {
            innerText: 0,
            snap: { innerText: 1 },
            duration: 1,
            ease: 'none'
        }, 0);

    }

    // 6. Music Toggle Logic
    const musicBtn = document.getElementById('music-toggle');
    const musicLabel = musicBtn.querySelector('.label');
    let isPlaying = false;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicLabel.innerText = 'Paused';
            isPlaying = false;
        } else {
            bgMusic.play();
            musicLabel.innerText = 'Playing Soft Beats...';
            isPlaying = true;
        }
    });

    // Automatically set playing state if audio actually plays
    bgMusic.onplay = () => {
        isPlaying = true;
        musicLabel.innerText = 'Playing Soft Beats...';
    };

    function releaseDreamLanterns() {
        const container = document.getElementById('lantern-container');
        if (!container) return;

        const dreams = [
            "Endless Adventures 🌍",
            "A Warm Home 🏡",
            "Always Together 💖",
            "Shared Laughter 😂",
            "Infinite Joy ✨",
            "Peace & Love 🕊️",
            "Growth & Trust 🌱",
            "A Bright Future 🌟",
            "Forever Us 👩‍❤️‍👨"
        ];

        for (let i = 0; i < 15; i++) {
            const lantern = document.createElement('div');
            lantern.className = 'dream-lantern';
            const dreamText = document.createElement('span');
            dreamText.className = 'lantern-text';
            dreamText.innerText = dreams[i % dreams.length];
            lantern.appendChild(dreamText);
            
            // Random start position
            const startX = Math.random() * 90; // Left %
            lantern.style.left = `${startX}%`;
            container.appendChild(lantern);

            // Animate using GSAP
            gsap.fromTo(lantern, 
                { y: 150, opacity: 0, scale: 0.8 }, 
                { 
                    y: -window.innerHeight - 500, 
                    opacity: 1, 
                    scale: 1, 
                    duration: 12 + Math.random() * 8, 
                    delay: Math.random() * 4,
                    ease: "power1.inOut",
                    onComplete: () => lantern.remove()
                }
            );

            // Add some gentle sway
            gsap.to(lantern, {
                x: (Math.random() - 0.5) * 200,
                duration: 4 + Math.random() * 3,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }
});
