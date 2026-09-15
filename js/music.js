(function () {
  class AmbientMusic {
    constructor(button) {
      this.button = button;
      this.audio = document.getElementById('backgroundMusic');
      this.playing = false;
      this.fadeFrame = 0;
      this.targetVolume = .58;
      this.supported = Boolean(this.audio && this.audio.canPlayType('audio/mpeg'));
      if (!this.supported) button.hidden = true;

      if (this.audio) {
        this.audio.loop = true;
        this.audio.volume = 0;
        this.audio.addEventListener('ended', () => {
          this.audio.currentTime = 0;
          this.audio.play().catch(() => {});
        });
        this.audio.addEventListener('error', () => {
          this.playing = false;
          this.button.classList.add('is-muted');
          this.button.setAttribute('aria-label', '背景音乐暂时无法播放');
        });
      }
    }

    fadeTo(volume, duration, onComplete) {
      cancelAnimationFrame(this.fadeFrame);
      const startVolume = this.audio.volume;
      const startTime = performance.now();
      const step = now => {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = progress * progress * (3 - 2 * progress);
        this.audio.volume = startVolume + (volume - startVolume) * eased;
        if (progress < 1) this.fadeFrame = requestAnimationFrame(step);
        else if (onComplete) onComplete();
      };
      this.fadeFrame = requestAnimationFrame(step);
    }

    async start() {
      if (!this.supported || this.playing) return;
      try {
        await this.audio.play();
        this.playing = true;
        this.fadeTo(this.targetVolume, 1800);
        this.updateButton();
      } catch (error) {
        this.playing = false;
        this.updateButton();
      }
    }

    pause() {
      if (!this.audio || !this.playing) return;
      this.playing = false;
      this.fadeTo(0, 480, () => this.audio.pause());
      this.updateButton();
    }

    toggle() {
      if (this.playing) this.pause();
      else this.start();
    }

    updateButton() {
      const muted = !this.playing;
      this.button.classList.toggle('is-muted', muted);
      this.button.setAttribute('aria-pressed', String(!muted));
      this.button.setAttribute('aria-label', muted ? '播放背景音乐' : '暂停背景音乐');
    }
  }

  window.AmbientMusic = AmbientMusic;
})();
