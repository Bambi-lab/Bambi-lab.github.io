(function () {
  const enter = document.getElementById('enterUniverse');
  const progressBar = document.querySelector('#journeyProgress span');
  const transformation = document.getElementById('transformation');
  const morphCanvas = document.getElementById('morphCanvas');
  const morphRing = document.getElementById('morphRing');
  const morphCopies = Array.from(document.querySelectorAll('[data-morph-copy]'));
  const morph = new window.ParticleMorph(morphCanvas);
  const musicToggle = document.getElementById('musicToggle');
  const music = new window.AmbientMusic(musicToggle);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scrollTicking = false;

  function preloadMemories() {
    let index = 2;
    function loadNext() {
      if (index > 21) return;
      const image = new Image();
      image.onload = image.onerror = () => {
        index += 1;
        if ('requestIdleCallback' in window) requestIdleCallback(loadNext, { timeout: 900 });
        else window.setTimeout(loadNext, 120);
      };
      image.src = `images/${index}.jpg`;
    }
    loadNext();
  }

  enter.addEventListener('click', () => {
    document.body.classList.remove('is-locked');
    document.body.classList.add('has-entered');
    preloadMemories();
    music.start();
    document.getElementById('universe').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  musicToggle.addEventListener('click', () => music.toggle());

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: .22 });
  document.querySelectorAll('.reveal-on-view, .finale').forEach(element => revealObserver.observe(element));

  function setMorphCopy(name) {
    morphCopies.forEach(copy => copy.classList.toggle('is-visible', copy.dataset.morphCopy === name));
  }

  function updateScroll() {
    scrollTicking = false;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, window.scrollY / scrollable))})`;

    const rect = transformation.getBoundingClientRect();
    const total = Math.max(1, rect.height - window.innerHeight);
    const morphProgress = Math.max(0, Math.min(1, -rect.top / total));
    const inRange = rect.top < window.innerHeight && rect.bottom > 0;
    morph.setVisible(inRange);

    if (inRange) {
      if (morphProgress < .28) {
        morph.setMode('name');
        setMorphCopy('name');
      } else if (morphProgress < .59) {
        morph.setMode('heart');
        setMorphCopy('heart');
      } else if (morphProgress < .69) {
        morph.setMode('swirl');
        setMorphCopy(null);
      } else {
        morph.setMode('rose');
        setMorphCopy('rose');
      }
    }

    const memories = document.getElementById('memories').getBoundingClientRect();
    if (memories.top < window.innerHeight && memories.bottom > 0) {
      const warmth = Math.max(0, Math.min(1, (window.innerHeight - memories.top) / (memories.height * .65)));
      window.CosmicField.setTone(warmth);
    } else if (rect.top < window.innerHeight) {
      window.CosmicField.setTone(.72);
    }
  }

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateScroll);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScroll();

  window.addEventListener('morph-heartbeat', () => {
    morphRing.classList.remove('is-pulsing');
    void morphRing.offsetWidth;
    morphRing.classList.add('is-pulsing');
  });

  const candle = document.getElementById('candle');
  const birthday = document.getElementById('birthday');
  const blackout = document.getElementById('blackout');
  const reveal = document.getElementById('birthdayReveal');
  let wished = false;

  candle.addEventListener('click', () => {
    if (wished) return;
    wished = true;
    candle.classList.add('is-out');
    candle.disabled = true;

    window.setTimeout(() => blackout.classList.add('is-dark'), reduceMotion ? 0 : 360);
    window.setTimeout(() => {
      birthday.classList.add('has-wished');
      reveal.classList.add('is-visible');
      blackout.classList.add('is-opening');
      window.CosmicField.burst(window.innerWidth / 2, window.innerHeight / 2, 'celebration', reduceMotion ? 90 : 330);
    }, reduceMotion ? 40 : 1050);
    window.setTimeout(() => blackout.classList.remove('is-dark', 'is-opening'), reduceMotion ? 100 : 2550);
  });

  const secretStar = document.getElementById('secretStar');
  const secretMessage = document.getElementById('secretMessage');
  const messages = [
    '你发现这里了。',
    '其实做这个网页的时候，\n我想了你好多好多遍。',
    '希望21岁的你，\n一直开心。'
  ];
  let secretIndex = 0;

  secretStar.addEventListener('click', () => {
    secretMessage.classList.add('is-changing');
    window.setTimeout(() => {
      secretMessage.innerHTML = messages[Math.min(secretIndex, messages.length - 1)].replace('\n', '<br>');
      secretMessage.classList.remove('is-changing');
      secretIndex += 1;
      window.CosmicField.burst(window.innerWidth / 2, secretStar.getBoundingClientRect().top + 30, 'warm', 24);
    }, reduceMotion ? 0 : 280);
  });
})();
