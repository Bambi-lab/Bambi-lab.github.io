(() => {
  const abstracts = Array.from(document.querySelectorAll('.pub-abstract'));
  if (abstracts.length === 0) return;

  const COLLAPSED_CLASS = 'is-collapsed';
  const COLLAPSED_TEXT = '展开全文';
  const EXPANDED_TEXT = '收起';

  const shouldShowToggle = (element) => {
    const lineHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
    if (!lineHeight || Number.isNaN(lineHeight)) return true;
    const maxHeight = lineHeight * 10 + 1;
    return element.scrollHeight > maxHeight;
  };

  abstracts.forEach((abstract) => {
    abstract.classList.add(COLLAPSED_CLASS);

    if (!shouldShowToggle(abstract)) {
      abstract.classList.remove(COLLAPSED_CLASS);
      return;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pub-abstract-toggle';
    button.textContent = COLLAPSED_TEXT;
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', () => {
      const expanded = !abstract.classList.contains(COLLAPSED_CLASS);
      if (expanded) {
        abstract.classList.add(COLLAPSED_CLASS);
        button.textContent = COLLAPSED_TEXT;
        button.setAttribute('aria-expanded', 'false');
      } else {
        abstract.classList.remove(COLLAPSED_CLASS);
        button.textContent = EXPANDED_TEXT;
        button.setAttribute('aria-expanded', 'true');
      }
    });

    abstract.insertAdjacentElement('afterend', button);
  });
})();
