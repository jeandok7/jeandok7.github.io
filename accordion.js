/**
 * Accordion Component – Organism
 * Robust ARIA + keyboard + animation-safe
 */

export default class Accordion {
  constructor(element, options = {}) {
    if (!element) {
      throw new Error('Accordion element is required');
    }

    this.element = element;
    this.options = {
      allowMultiple:
        element.dataset.allowMultiple === 'true' ||
        options.allowMultiple ||
        false,
      ...options
    };

    this.items = [];
    this.element._accordionInstance = this;

    this.handleKeydown = this.handleKeydown.bind(this);

    this.init();
  }

  /* -------------------------------------------- */
  /* Init
  /* -------------------------------------------- */

  init() {
    this.items = Array.from(
      this.element.querySelectorAll('.ds-accordion__item')
    );

    this.items.forEach((item, index) => {
      const trigger = item.querySelector('.ds-accordion__trigger');
      const content = item.querySelector('.ds-accordion__content');
      if (!trigger || !content) return;

      if (!content.id) {
        content.id = `ds-accordion-content-${this.generateId()}`;
      }

      trigger.setAttribute('aria-controls', content.id);

      const isActive =
        item.classList.contains('ds-accordion__item--active') ||
        trigger.getAttribute('aria-expanded') === 'true';

      isActive ? this.open(index, false) : this.close(index, false);

      trigger.addEventListener('click', e =>
        this.handleClick(e, index)
      );
    });

    this.element.addEventListener('keydown', this.handleKeydown);
    this.dispatchEvent('initialized');
  }

  /* -------------------------------------------- */
  /* Events
  /* -------------------------------------------- */

  handleClick(event, index) {
    event.preventDefault();

    const trigger = this.items[index].querySelector(
      '.ds-accordion__trigger'
    );

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    isExpanded ? this.close(index) : this.open(index);
  }

  handleKeydown(event) {
    const { key, target } = event;
    if (!target.classList.contains('ds-accordion__trigger')) return;

    const triggers = this.items.map(item =>
      item.querySelector('.ds-accordion__trigger')
    );

    const currentIndex = triggers.indexOf(target);

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        triggers[(currentIndex + 1) % triggers.length].focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        triggers[
          currentIndex === 0 ? triggers.length - 1 : currentIndex - 1
        ].focus();
        break;

      case 'Home':
        event.preventDefault();
        triggers[0].focus();
        break;

      case 'End':
        event.preventDefault();
        triggers[triggers.length - 1].focus();
        break;
    }
  }

  /* -------------------------------------------- */
  /* State management
  /* -------------------------------------------- */

  open(index, animate = true) {
    const item = this.items[index];
    if (!item) return;

    const trigger = item.querySelector('.ds-accordion__trigger');
    const content = item.querySelector('.ds-accordion__content');

    if (!this.options.allowMultiple) {
      this.items.forEach((_, i) => {
        if (i !== index) this.close(i, animate);
      });
    }

    item.classList.add('ds-accordion__item--active');
    trigger.setAttribute('aria-expanded', 'true');

    // 🔒 Logique avant animation
    content.hidden = false;

    if (!animate) {
      content.style.height = '';
      content.style.opacity = '';
      this.dispatchEvent('opened', { index, item });
      return;
    }

    this.animateOpen(content);
    this.dispatchEvent('opened', { index, item });
  }

  close(index, animate = true) {
    const item = this.items[index];
    if (!item) return;

    const trigger = item.querySelector('.ds-accordion__trigger');
    const content = item.querySelector('.ds-accordion__content');

    item.classList.remove('ds-accordion__item--active');
    trigger.setAttribute('aria-expanded', 'false');

    if (!animate) {
      content.hidden = true;
      content.style.height = '';
      content.style.opacity = '';
      this.dispatchEvent('closed', { index, item });
      return;
    }

    this.animateClose(content, trigger);
    this.dispatchEvent('closed', { index, item });
  }

  /* -------------------------------------------- */
  /* Animations (isolated & safe)
  /* -------------------------------------------- */

  animateOpen(content) {
    const height = content.scrollHeight;

    content.style.height = '0px';
    content.style.opacity = '0';

    requestAnimationFrame(() => {
      content.style.height = `${height}px`;
      content.style.opacity = '1';

      content.addEventListener(
        'transitionend',
        () => {
          content.style.height = '';
        },
        { once: true }
      );
    });
  }

  animateClose(content, trigger) {
    const height = content.scrollHeight;

    content.style.height = `${height}px`;
    content.style.opacity = '1';

    requestAnimationFrame(() => {
      content.style.height = '0px';
      content.style.opacity = '0';

      content.addEventListener(
        'transitionend',
        () => {
          // 🔒 hidden = état final
          content.hidden =
            trigger.getAttribute('aria-expanded') !== 'true';
          content.style.height = '';
          content.style.opacity = '';
        },
        { once: true }
      );
    });
  }

  /* -------------------------------------------- */
  /* Utils
  /* -------------------------------------------- */

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  dispatchEvent(name, detail = {}) {
    this.element.dispatchEvent(
      new CustomEvent(`ds-accordion:${name}`, {
        bubbles: true,
        detail: { accordion: this, ...detail }
      })
    );
  }

  destroy() {
    this.element.removeEventListener('keydown', this.handleKeydown);
    delete this.element._accordionInstance;
  }
}

/* -------------------------------------------- */
/* Auto-init
/* -------------------------------------------- */

export function initAccordions(root = document) {
  root
    .querySelectorAll('[data-toggle="ds-accordion"]')
    .forEach(element => {
      if (!element._accordionInstance) {
        new Accordion(element);
      }
    });
}

/* -------------------------------------------- */
/* DOM Ready + MutationObserver
/* -------------------------------------------- */

if (typeof window !== 'undefined') {
  const init = () => initAccordions();

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            initAccordions(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}
