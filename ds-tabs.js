/**
 * @fileoverview Composant de tabulation accessible (RGAA 4.1) en Vanilla JS.
 * Utilise ES Modules, MutationObserver et respecte le pattern ARIA Tabs.
 */

/**
 * Classe DsTabs
 * Gère un composant de tabulation accessible.
 */
export class DsTabs {
  // Propriétés privées (ES2022+)
  #root;
  #tablist;
  #tabs = [];
  #panels = [];
  #prevBtn;
  #nextBtn;
  #selectedIndex = 0;
  #resizeObserver;

  // Propriétés statiques pour la gestion globale
  static #instances = new Map();
  static #observer = null;

  /**
   * Crée une instance de DsTabs.
   * @param {HTMLElement} element - L'élément racine du composant.
   */
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('DsTabs: L\'élément fourni doit être un HTMLElement.');
    }

    this.#root = element;
    this.#initElements();
    this.#initEvents();
    this.#initAria();
    this.#updateUI();

    // Enregistrement de l'instance
    DsTabs.#instances.set(this.#root, this);
  }

  // --- Méthodes privées ---

  /**
   * Initialise les références aux éléments du DOM.
   */
  #initElements() {
    this.#tablist = this.#root.querySelector('[role="tablist"]');
    this.#tabs = Array.from(this.#root.querySelectorAll('[role="tab"]'));
    this.#panels = Array.from(this.#root.querySelectorAll('[role="tabpanel"]'));
    this.#prevBtn = this.#root.querySelector('[data-ds-tabs-scroll="prev"]');
    this.#nextBtn = this.#root.querySelector('[data-ds-tabs-scroll="next"]');

    // Déterminer l'index initial
    const selectedTab = this.#tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    this.#selectedIndex = selectedTab !== -1 ? selectedTab : 0;
  }

  /**
   * Initialise les écouteurs d'événements.
   */
  #initEvents() {
    // Événements sur les onglets
    this.#tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => this.selectTab(index));
      tab.addEventListener('keydown', (e) => this.#handleKeydown(e, index));
    });

    // Événements sur les boutons de scroll
    if (this.#prevBtn) {
      this.#prevBtn.addEventListener('click', () => this.#scroll('prev'));
    }
    if (this.#nextBtn) {
      this.#nextBtn.addEventListener('click', () => this.#scroll('next'));
    }

    // Observer pour le redimensionnement (gestion des flèches)
    this.#resizeObserver = new ResizeObserver(() => this.#checkScroll());
    this.#resizeObserver.observe(this.#root);
    
    if (this.#tablist) {
      this.#tablist.addEventListener('scroll', () => this.#checkScroll());
    }
  }

  /**
   * Initialise les attributs ARIA si manquants.
   */
  #initAria() {
    this.#tabs.forEach((tab, index) => {
      const isSelected = index === this.#selectedIndex;
      tab.setAttribute('aria-selected', isSelected.toString());
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      
      const panel = this.#panels[index];
      if (panel) {
        panel.hidden = !isSelected;
        panel.setAttribute('tabindex', '-1'); // Permet de recevoir le focus via JS
      }
    });
  }

  /**
   * Gère la navigation au clavier.
   * @param {KeyboardEvent} event 
   * @param {number} index 
   */
  #handleKeydown(event, index) {
    let newIndex = null;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (index + 1) % this.#tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = (index - 1 + this.#tabs.length) % this.#tabs.length;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = this.#tabs.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== null) {
      event.preventDefault();
      this.#focusTab(newIndex);
    }
  }

  /**
   * Donne le focus à un onglet sans forcément le sélectionner (activation manuelle).
   * @param {number} index 
   */
  #focusTab(index) {
    this.#tabs.forEach((tab, i) => {
      tab.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    this.#tabs[index].focus();
    this.#scrollIntoView(this.#tabs[index]);
  }

  /**
   * Gère le scroll horizontal.
   * @param {'prev' | 'next'} direction 
   */
  #scroll(direction) {
    if (!this.#tablist) return;
    const scrollAmount = this.#root.clientWidth * 0.8;
    this.#tablist.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  }

  /**
   * Vérifie si le scroll est nécessaire et affiche/masque les boutons.
   */
  #checkScroll() {
    if (!this.#tablist || !this.#prevBtn || !this.#nextBtn) return;

    const { scrollLeft, scrollWidth, clientWidth } = this.#tablist;
    const canScroll = scrollWidth > clientWidth;

    this.#prevBtn.hidden = !canScroll;
    this.#nextBtn.hidden = !canScroll;

    if (canScroll) {
      this.#prevBtn.disabled = scrollLeft <= 0;
      this.#nextBtn.disabled = Math.ceil(scrollLeft + clientWidth) >= scrollWidth;
    }
  }

  /**
   * Assure qu'un onglet est visible dans le viewport du tablist.
   * @param {HTMLElement} element 
   */
  #scrollIntoView(element) {
    if (!this.#tablist) return;
    
    const containerRect = this.#tablist.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    if (elementRect.left < containerRect.left) {
      this.#tablist.scrollBy({ left: elementRect.left - containerRect.left, behavior: 'smooth' });
    } else if (elementRect.right > containerRect.right) {
      this.#tablist.scrollBy({ left: elementRect.right - containerRect.right, behavior: 'smooth' });
    }
  }

  /**
   * Met à jour l'interface utilisateur.
   */
  #updateUI() {
    this.#tabs.forEach((tab, index) => {
      const isSelected = index === this.#selectedIndex;
      tab.setAttribute('aria-selected', isSelected.toString());
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
      tab.classList.toggle('ds-tabs__tab--selected', isSelected);

      const panel = this.#panels[index];
      if (panel) {
        panel.hidden = !isSelected;
      }
    });
    this.#checkScroll();
  }

  // --- Méthodes publiques (API) ---

  /**
   * Sélectionne un onglet par son index.
   * @param {number} index 
   */
  selectTab(index) {
    if (index < 0 || index >= this.#tabs.length || index === this.#selectedIndex) return;

    this.#selectedIndex = index;
    this.#updateUI();
    this.#scrollIntoView(this.#tabs[index]);

    // Déclenchement d'un événement personnalisé
    this.#root.dispatchEvent(new CustomEvent('ds-tab-change', {
      detail: { index, tab: this.#tabs[index], panel: this.#panels[index] }
    }));
  }

  /**
   * Détruit l'instance et nettoie les événements.
   */
  destroy() {
    this.#resizeObserver.disconnect();
    DsTabs.#instances.delete(this.#root);
  }

  // --- Méthodes statiques ---

  /**
   * Récupère l'instance associée à un élément.
   * @param {HTMLElement} element 
   * @returns {DsTabs|undefined}
   */
  static getInstance(element) {
    return DsTabs.#instances.get(element);
  }

  /**
   * Démarre le MutationObserver pour initialiser automatiquement les composants.
   */
  static startAutoInit() {
    if (DsTabs.#observer) return;

    const init = (container = document) => {
      const elements = container.querySelectorAll('[data-ds-toggle="ds-tab"]');
      elements.forEach(el => {
        if (!DsTabs.getInstance(el)) new DsTabs(el);
      });
    };

    // Initialisation immédiate
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }

    // Observation des changements futurs
    DsTabs.#observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.matches('[data-ds-toggle="ds-tab"]')) {
              new DsTabs(node);
            }
            const children = node.querySelectorAll('[data-ds-toggle="ds-tab"]');
            children.forEach(child => new DsTabs(child));
          }
        });
      });
    });

    DsTabs.#observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Arrête le MutationObserver.
   */
  static stopAutoInit() {
    if (DsTabs.#observer) {
      DsTabs.#observer.disconnect();
      DsTabs.#observer = null;
    }
  }
}

// Auto-démarrage par défaut si utilisé en tant que script direct
if (typeof window !== 'undefined') {
  DsTabs.startAutoInit();
}
