(function () {
  const photos = [
    { id: 1, phase: '成长', caption: '故事从这里开始。', orientation: 'portrait' },
    { id: 2, phase: '成长', caption: '她还不知道，未来会有那么多人爱她。', orientation: 'portrait' },
    { id: 3, phase: '成长', caption: '小小的她，正认真认识这个世界。', orientation: 'portrait' },
    { id: 4, phase: '成长', caption: '那个穿红衣服的小女孩，又长大了一点。', orientation: 'portrait' },
    { id: 5, phase: '成长', caption: '阳光落在她身上，像很早就认识她。', orientation: 'portrait' },
    { id: 6, phase: '成长', caption: '慢慢长大，也有了自己的小宇宙。', orientation: 'portrait' },
    { id: 7, phase: '成长', caption: '安静的时候很安静，笑起来却很亮。', orientation: 'landscape' },
    { id: 8, phase: '成长', caption: '后来，她成为了现在的肖淑媛。', orientation: 'portrait' },
    { id: 9, phase: '相遇', caption: '一束花，替我先说了想念。', orientation: 'portrait' },
    { id: 10, phase: '相遇', caption: '掌心靠近，日子也有了温度。', orientation: 'portrait' },
    { id: 11, phase: '相遇', caption: '两个原本独立的人，站进了同一幅画。', orientation: 'tall' },
    { id: 12, phase: '相遇', caption: '一起出发，把普通的路走成纪念。', orientation: 'portrait' },
    { id: 13, phase: '我们', caption: '镜头里，是你、我，和那天的开心。', orientation: 'portrait' },
    { id: 14, phase: '我们', caption: '去见想见的人，也去看没看过的风景。', orientation: 'landscape' },
    { id: 15, phase: '我们', caption: '一起吃饭，是最朴素也最真实的浪漫。', orientation: 'landscape' },
    { id: 16, phase: '我们', caption: '镜头前会害羞，镜头后却总能逗我笑。', orientation: 'landscape' },
    { id: 17, phase: '我们', caption: '喜欢这样的我们，不用刻意也很合拍。', orientation: 'portrait' },
    { id: 18, phase: '我们', caption: '日常被一顿饭、一块蛋糕认真收藏。', orientation: 'portrait' },
    { id: 19, phase: '我们', caption: '和你一起，连古老的风景也变得鲜活。', orientation: 'tall' },
    { id: 20, phase: '我们', caption: '你低头认真许愿，我在旁边认真记住。', orientation: 'portrait' },
    { id: 21, phase: '以后', caption: '原来“以后”，可以有一个很具体的画面。', orientation: 'landscape' }
  ];

  const entries = [
    ...photos.slice(0, 8).map(photo => ({ type: 'photo', photo })),
    { type: 'milestone', label: 'THE DAY WE MET', date: '2026.04.19', text: '在这个很大的世界里，<br>我们遇见了。' },
    ...photos.slice(8, 12).map(photo => ({ type: 'photo', photo })),
    { type: 'milestone', label: 'THE DAY WE BECAME US', date: '2026.05.22', text: '从这一天开始，<br>我们的故事有了新的名字。' },
    ...photos.slice(12).map(photo => ({ type: 'photo', photo }))
  ];

  const section = document.getElementById('memories');
  const stepsRoot = document.getElementById('memorySteps');
  const constellation = document.getElementById('constellation');
  const memoryView = document.getElementById('memoryView');
  const milestoneView = document.getElementById('milestoneView');
  const memoryImage = document.getElementById('memoryImage');
  const memoryCaption = document.getElementById('memoryCaption');
  const memoryKicker = document.getElementById('memoryKicker');
  const memoryNumber = document.getElementById('memoryNumber');
  const memoryIndex = document.getElementById('memoryIndex');
  const frame = memoryImage.closest('.memory-frame');
  const milestoneLabel = document.getElementById('milestoneLabel');
  const milestoneDate = document.getElementById('milestoneDate');
  const milestoneText = document.getElementById('milestoneText');
  let activeEntry = -1;
  let ticking = false;

  entries.forEach((entry, index) => {
    const step = document.createElement('div');
    step.className = 'memory-step';
    step.dataset.entry = String(index);
    stepsRoot.appendChild(step);
  });

  photos.forEach((photo, index) => {
    const node = document.createElement('button');
    const angle = index * 2.3999632297 + .35;
    const ring = .28 + (index % 4) * .065;
    const x = 50 + Math.cos(angle) * ring * 100;
    const y = 50 + Math.sin(angle) * ring * 76;
    node.type = 'button';
    node.className = 'star-node';
    node.style.left = `${Math.max(5, Math.min(95, x))}%`;
    node.style.top = `${Math.max(13, Math.min(91, y))}%`;
    node.dataset.photo = String(photo.id);
    node.setAttribute('aria-label', `第${photo.id}颗星：${photo.caption}`);
    node.addEventListener('click', () => {
      const entryIndex = entries.findIndex(item => item.type === 'photo' && item.photo.id === photo.id);
      const step = stepsRoot.children[entryIndex];
      const top = window.scrollY + step.getBoundingClientRect().top - (window.innerHeight - step.offsetHeight) / 2;
      window.scrollTo({ top, behavior: 'smooth' });
    });
    constellation.appendChild(node);
  });

  function entryForPhoto(id) {
    return entries.findIndex(item => item.type === 'photo' && item.photo.id === id);
  }

  function preloadNext(id) {
    const next = photos.find(photo => photo.id === id + 1);
    if (!next) return;
    const image = new Image();
    image.src = `images/${next.id}.jpg`;
  }

  function setActive(index) {
    if (index === activeEntry || index < 0 || index >= entries.length) return;
    activeEntry = index;
    const entry = entries[index];

    if (entry.type === 'milestone') {
      memoryView.classList.add('is-hidden');
      milestoneView.classList.add('is-visible');
      milestoneLabel.textContent = entry.label;
      milestoneDate.textContent = entry.date;
      milestoneDate.setAttribute('datetime', entry.date.replaceAll('.', '-'));
      milestoneText.innerHTML = entry.text;
      memoryNumber.textContent = '··';
      section.style.setProperty('--phase-warmth', entry.date.endsWith('19') ? '.08' : '.14');
      constellation.querySelectorAll('.star-node').forEach(node => node.classList.remove('is-active'));
      return;
    }

    const photo = entry.photo;
    milestoneView.classList.remove('is-visible');
    memoryView.classList.remove('is-hidden');
    memoryView.classList.add('is-changing');
    section.style.setProperty('--phase-warmth', photo.id > 8 ? '.14' : '0');

    window.setTimeout(() => {
      memoryImage.src = `images/${photo.id}.jpg`;
      memoryImage.alt = `肖淑媛的第 ${photo.id} 颗回忆星星`;
      memoryCaption.textContent = photo.caption;
      memoryKicker.textContent = `第 ${String(photo.id).padStart(2, '0')} 颗星 · ${photo.phase}`;
      memoryNumber.textContent = String(photo.id).padStart(2, '0');
      memoryIndex.textContent = String(photo.id).padStart(2, '0');
      frame.classList.toggle('is-landscape', photo.orientation === 'landscape');
      frame.classList.toggle('is-tall', photo.orientation === 'tall');
      memoryView.classList.remove('is-changing');
      preloadNext(photo.id);
      if (window.CosmicField) window.CosmicField.burst(window.innerWidth * .42, window.innerHeight * .48, photo.id > 8 ? 'warm' : 'cool');
    }, 330);

    constellation.querySelectorAll('.star-node').forEach(node => {
      const nodeId = Number(node.dataset.photo);
      node.classList.toggle('is-active', nodeId === photo.id);
      node.classList.toggle('is-past', nodeId < photo.id);
    });
  }

  function updateFromScroll() {
    ticking = false;
    const steps = Array.from(stepsRoot.children);
    const targetY = window.innerHeight * .5;
    let nearest = 0;
    let distance = Infinity;
    for (let i = 0; i < steps.length; i += 1) {
      const rect = steps[i].getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const nextDistance = Math.abs(center - targetY);
      if (nextDistance < distance) {
        distance = nextDistance;
        nearest = i;
      }
    }
    const sectionRect = section.getBoundingClientRect();
    if (sectionRect.top < window.innerHeight && sectionRect.bottom > 0) setActive(nearest);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFromScroll);
  }

  window.MemoryTimeline = { entries, photos, entryForPhoto, setActive };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  setActive(0);
})();
