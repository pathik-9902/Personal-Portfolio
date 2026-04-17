document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Loader ---
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 800);
        }, 1200);
    });

    // --- 2. Floating Blob Mouse Follow ---
    const blob = document.getElementById('blob');
    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        blob.style.transform = `translate(${clientX - 250}px, ${clientY - 250}px)`;
    });

    // --- 3. Hero Canvas Nodes ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let dots = [];
        const dotCount = 40;

        function initCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            dots = [];
            for (let i = 0; i < dotCount; i++) {
                dots.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(0, 245, 255, 0.15)';
            ctx.lineWidth = 0.5;

            dots.forEach((d, i) => {
                d.x += d.vx;
                d.y += d.vy;
                if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
                if (d.y < 0 || d.y > canvas.height) d.vy *= -1;

                ctx.beginPath();
                ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 245, 255, 0.3)';
                ctx.fill();

                for (let j = i + 1; j < dots.length; j++) {
                    const d2 = dots[j];
                    const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(d.x, d.y);
                        ctx.lineTo(d2.x, d2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', initCanvas);
        initCanvas();
        draw();
    }

    // --- 4. Typewriter Effect ---
    const typeTarget = document.getElementById('typewriter');
    const professions = ["Full Stack Engineer", "Problem Solver", "AI Enthusiast", "B.Tech @ PDPU"];
    let pIdx = 0, cIdx = 0, isDeleting = false;

    function handleType() {
        const current = professions[pIdx];
        if (!typeTarget) return;
        typeTarget.textContent = isDeleting ? current.substring(0, cIdx--) : current.substring(0, cIdx++);

        let speed = isDeleting ? 50 : 150;
        if (!isDeleting && cIdx === current.length + 1) {
            isDeleting = true;
            speed = 2000;
        } else if (isDeleting && cIdx === 0) {
            isDeleting = false;
            pIdx = (pIdx + 1) % professions.length;
            speed = 500;
        }
        setTimeout(handleType, speed);
    }
    handleType();

    // --- 5. Intersection Observer (Reveal) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                if (e.target.querySelector('.stat-num')) startCounter(e.target.querySelector('.stat-num'));
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    function startCounter(el) {
        if (el.dataset.done) return;
        const target = parseFloat(el.dataset.target);
        let count = 0;
        const inc = target / 100;
        const timer = setInterval(() => {
            count += inc;
            if (count >= target) {
                el.textContent = target;
                el.dataset.done = true;
                clearInterval(timer);
            } else {
                el.textContent = count.toFixed(el.dataset.target.includes('.') ? 2 : 0);
            }
        }, 20);
    }

    // --- 6. Admin / Route Handling (/pathik) ---
    const adminModal = document.getElementById('admin-modal');
    const closeAdmin = document.getElementById('close-admin');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Check for admin "route"
    const handleAdminRoute = () => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (path.includes('/pathik') || hash === '#/pathik') {
            adminModal.classList.add('open');
        } else {
            adminModal.classList.remove('open');
        }
    };

    window.addEventListener('popstate', handleAdminRoute);
    window.addEventListener('hashchange', handleAdminRoute);
    handleAdminRoute();

    closeAdmin.onclick = () => {
        adminModal.classList.remove('open');
        // Reset URL back to home
        if (window.location.hash === '#/pathik') {
            window.location.hash = '#';
        } else if (window.location.pathname.includes('/pathik')) {
            window.history.pushState({}, '', '/');
        }
    };

    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        };
    });

    const loadCustomData = () => {
        const skills = JSON.parse(localStorage.getItem('p_skills')) || [];
        const projs = JSON.parse(localStorage.getItem('p_projects')) || [];
        const exps = JSON.parse(localStorage.getItem('p_experience')) || [];

        const skillsList = document.getElementById('skills-list');
        const projList = document.getElementById('project-list');
        const expList = document.getElementById('experience-list');

        skills.forEach(s => {
            const div = document.createElement('div');
            div.className = 'skill-group glass reveal active';
            div.innerHTML = `<div class="skill-head"><h3>${s.cat}</h3></div><div class="skill-pills">${s.vals.split(',').map(v => `<span>${v.trim()}</span>`).join('')}</div>`;
            skillsList.appendChild(div);
        });

        projs.forEach(p => {
            const div = document.createElement('div');
            div.className = 'project-tile glass reveal active';
            div.innerHTML = `
                <div class="p-img"><img src="${p.img || 'img/project1.png'}"></div>
                <div class="p-content">
                    <h3>${p.title}</h3><p>${p.desc}</p>
                    <div class="p-tags">${p.tags.split(',').map(t => `<span>${t.trim()}</span>`).join('')}</div>
                </div>`;
            projList.appendChild(div);
        });

        exps.forEach(ex => {
            const div = document.createElement('div');
            div.className = 'exp-card glass reveal active';
            div.innerHTML = `
                <div class="exp-date">${ex.dur}</div>
                <div class="exp-main">
                    <h3>${ex.role}</h3><p class="company">${ex.comp}</p>
                    <ul class="exp-details">${ex.desc.split('\n').map(l => `<li>${l}</li>`).join('')}</ul>
                </div>`;
            expList.appendChild(div);
        });
    };

    document.getElementById('add-skill-form').onsubmit = (e) => {
        e.preventDefault();
        const data = { cat: document.getElementById('sk-cat').value, vals: document.getElementById('sk-val').value };
        const skills = JSON.parse(localStorage.getItem('p_skills')) || [];
        skills.push(data);
        localStorage.setItem('p_skills', JSON.stringify(skills));
        location.reload();
    };

    document.getElementById('add-project-form').onsubmit = (e) => {
        e.preventDefault();
        const data = { 
            title: document.getElementById('pr-title').value, 
            desc: document.getElementById('pr-desc').value,
            tags: document.getElementById('pr-tags').value,
            img: document.getElementById('pr-img').value
        };
        const projs = JSON.parse(localStorage.getItem('p_projects')) || [];
        projs.push(data);
        localStorage.setItem('p_projects', JSON.stringify(projs));
        location.reload();
    };

    document.getElementById('add-exp-form').onsubmit = (e) => {
        e.preventDefault();
        const data = { 
            role: document.getElementById('ex-role').value, 
            comp: document.getElementById('ex-comp').value,
            dur: document.getElementById('ex-dur').value,
            desc: document.getElementById('ex-desc').value
        };
        const exps = JSON.parse(localStorage.getItem('p_experience')) || [];
        exps.push(data);
        localStorage.setItem('p_experience', JSON.stringify(exps));
        location.reload();
    };

    document.getElementById('clear-data').onclick = () => {
        localStorage.clear();
        location.reload();
    };

    loadCustomData();

    // --- 7. Contact Form Simulation ---
    document.getElementById('contact-form').onsubmit = (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.textContent = 'TRANSMITTING...';
        setTimeout(() => {
            btn.textContent = 'SEQUENCE COMPLETED';
            e.target.reset();
            setTimeout(() => btn.textContent = 'INITIATE SEQUENCE', 3000);
        }, 2000);
    };

    // Navbar Scroll Effect
    window.onscroll = () => {
        if (window.scrollY > 100) document.getElementById('navbar').classList.add('scrolled');
        else document.getElementById('navbar').classList.remove('scrolled');
    };
});