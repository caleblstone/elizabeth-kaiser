document.addEventListener("DOMContentLoaded", () => {
    const NUM_SIGNS = 10;
    const SIGN_SIZE = 24; // px, font size and for collision
    const SIGNS = [];
    const VELOCITY = 2; // px per frame
    const MAX_SIGNS = 200; // Prevent runaway doubling
    const COLLISION_COOLDOWN = 300; // ms
    const signsContainer = document.createElement('div');
    signsContainer.style.position = 'fixed';
    signsContainer.style.left = '0';
    signsContainer.style.top = '0';
    signsContainer.style.width = '100vw';
    signsContainer.style.height = '100vh';
    signsContainer.style.pointerEvents = 'none';
    signsContainer.style.zIndex = '9999';
    document.body.appendChild(signsContainer);

    // Get bounding rects of all divs on the page (excluding the container)
    function getDivRects() {
        return Array.from(document.querySelectorAll('div'))
            .filter(div => div !== signsContainer)
            .map(div => div.getBoundingClientRect());
    }

    // Helper: check if two rectangles overlap
    function rectsOverlap(r1, r2) {
        return !(r2.left > r1.right ||
                 r2.right < r1.left ||
                 r2.top > r1.bottom ||
                 r2.bottom < r1.top);
    }

    // Create @ signs
    const centerX = window.innerWidth / 2 - SIGN_SIZE / 2;
    const centerY = window.innerHeight / 2 - SIGN_SIZE / 2;
    for (let i = 0; i < NUM_SIGNS; i++) {
        const sign = document.createElement('span');
        sign.textContent = '@';
        sign.style.position = 'absolute';
        sign.style.fontSize = SIGN_SIZE + 'px';
        sign.style.userSelect = 'none';
        sign.style.pointerEvents = 'none';
        // All start at center
        const x = centerX;
        const y = centerY;
        // Random velocity outward
        const angle = Math.random() * 2 * Math.PI;
        SIGNS.push({
            el: sign,
            x, y,
            vx: Math.cos(angle) * VELOCITY,
            vy: Math.sin(angle) * VELOCITY,
            lastCollision: 0 // timestamp of last collision
        });
        signsContainer.appendChild(sign);
    }

    function update() {
        const divRects = getDivRects();
        const newSigns = [];
        const now = Date.now();
        // Move each sign
        for (let i = 0; i < SIGNS.length; i++) {
            let s = SIGNS[i];
            // Move
            s.x += s.vx;
            s.y += s.vy;

            // Window bounds
            if (s.x < 0) { s.x = 0; s.vx *= -1; }
            if (s.x > window.innerWidth - SIGN_SIZE) { s.x = window.innerWidth - SIGN_SIZE; s.vx *= -1; }
            if (s.y < 0) { s.y = 0; s.vy *= -1; }
            if (s.y > window.innerHeight - SIGN_SIZE) { s.y = window.innerHeight - SIGN_SIZE; s.vy *= -1; }

            // Div collision
            const signRect = {
                left: s.x,
                right: s.x + SIGN_SIZE,
                top: s.y,
                bottom: s.y + SIGN_SIZE
            };
            for (const divRect of divRects) {
                if (rectsOverlap(signRect, divRect)) {
                    // Simple bounce: reverse direction
                    // Determine which side collided
                    const prevX = s.x - s.vx;
                    const prevY = s.y - s.vy;
                    if (prevX + SIGN_SIZE <= divRect.left || prevX >= divRect.right) {
                        s.vx *= -1;
                        s.x += s.vx;
                    }
                    if (prevY + SIGN_SIZE <= divRect.top || prevY >= divRect.bottom) {
                        s.vy *= -1;
                        s.y += s.vy;
                    }
                }
            }

            // Signs collision (naive O(n^2))
            for (let j = i + 1; j < SIGNS.length; j++) {
                let s2 = SIGNS[j];
                const dx = s2.x - s.x;
                const dy = s2.y - s.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < SIGN_SIZE) {
                    // Only double if both are off cooldown
                    if (
                        now - (s.lastCollision || 0) > COLLISION_COOLDOWN &&
                        now - (s2.lastCollision || 0) > COLLISION_COOLDOWN
                    ) {
                        // Doubling feature
                        if (SIGNS.length + newSigns.length < MAX_SIGNS) {
                            const angle = Math.random() * 2 * Math.PI;
                            const newSign = document.createElement('span');
                            newSign.textContent = '@';
                            newSign.style.position = 'absolute';
                            newSign.style.fontSize = SIGN_SIZE + 'px';
                            newSign.style.userSelect = 'none';
                            newSign.style.pointerEvents = 'none';
                            const newX = (s.x + s2.x) / 2;
                            const newY = (s.y + s2.y) / 2;
                            newSigns.push({
                                el: newSign,
                                x: newX,
                                y: newY,
                                vx: Math.cos(angle) * VELOCITY,
                                vy: Math.sin(angle) * VELOCITY,
                                lastCollision: now
                            });
                            signsContainer.appendChild(newSign);
                            // Set cooldown for both
                            s.lastCollision = now;
                            s2.lastCollision = now;
                        }
                    }
                    // Simple elastic collision: swap velocities
                    [s.vx, s2.vx] = [s2.vx, s.vx];
                    [s.vy, s2.vy] = [s2.vy, s.vy];
                    // Move them apart
                    const overlap = SIGN_SIZE - dist;
                    const nx = dx / (dist || 1);
                    const ny = dy / (dist || 1);
                    s.x -= nx * overlap / 2;
                    s.y -= ny * overlap / 2;
                    s2.x += nx * overlap / 2;
                    s2.y += ny * overlap / 2;
                }
            }

            // Update DOM
            s.el.style.left = s.x + 'px';
            s.el.style.top = s.y + 'px';
        }

        // Add new signs after all collisions processed
        if (newSigns.length > 0) {
            SIGNS.push(...newSigns);
        }

        requestAnimationFrame(update);
    }

    update();

});

