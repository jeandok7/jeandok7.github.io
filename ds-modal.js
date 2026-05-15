/**
 * @fileoverview Composant Modal accessible (RGAA 4.1) en Vanilla JS.
 * Utilise ES Modules, MutationObserver et respecte le pattern ARIA Dialog.
 * Gère le piégeage du focus, la navigation au clavier et la fermeture.
 */

/**
 * Classe DsModal
 * Gère un composant de dialogue modal accessible et conforme RGAA 4.1.
 * 
 * @class
 * @description
 * Crée une modale accessible avec :
 * - Piégeage du focus : le focus reste confiné à la modale
 * - Focus initial sur le bouton de fermeture
 * - Fermeture par la touche Échap
 * - Navigation Tab/Shift+Tab confinée à la modale
 * - Attributs ARIA complets (role="dialog", aria-modal="true", aria-labelledby)
 * - Gestion du scroll du body quand la modale est ouverte
 * - Support des événements personnalisés
 */
export class DsModal {
  // Propriétés privées (ES2022+)
  #root;
  #dialog;
  #closeBtn;
  #focusableElements = [];
  #previousActiveElement;
  #isOpen = false;
  #focusTrapListener;
  #keydownListener;
  #backdropClickListener;

  // Propriétés statiques pour la gestion globale
  static #instances = new Map();
  static #observer = null;
  static #openModals = [];

  /**
   * Crée une instance de DsModal.
   * 
   * @param {HTMLElement} element - L'élément racine du composant modal.
   * @throws {Error} Si l'élément fourni n'est pas un HTMLElement.
   * 
   * @example
   * const modal = new DsModal(document.getElementById('myModal'));
   * modal.open();
   */
  constructor(element) {
    if (!(element instanceof HTMLElement)) {
      throw new Error('DsModal: L\'élément fourni doit être un HTMLElement.');
    }

    this.#root = element;
    this.#initElements();
    this.#initAria();
    this.#bindMethods();

    // Enregistrement de l'instance
    DsModal.#instances.set(this.#root, this);
  }

  // --- Méthodes privées ---

  /**
   * Initialise les références aux éléments du DOM.
   * 
   * @private
   * @description
   * Récupère le conteneur de dialogue et le bouton de fermeture.
   * Lance une erreur si la structure est invalide.
   */
  #initElements() {
    this.#dialog = this.#root.querySelector('[role="dialog"]');
    this.#closeBtn = this.#root.querySelector('[data-ds-modal-close]');

    if (!this.#dialog) {
      throw new Error('DsModal: Un élément avec role="dialog" est requis.');
    }

    if (!this.#closeBtn) {
      throw new Error('DsModal: Un bouton avec data-ds-modal-close est requis.');
    }
  }

  /**
   * Initialise les attributs ARIA si manquants.
   * 
   * @private
   * @description
   * Définit les attributs ARIA essentiels pour l'accessibilité :
   * - role="dialog" : identifie le conteneur comme une boîte de dialogue
   * - aria-modal="true" : indique qu'il s'agit d'une modale
   * - aria-labelledby : lie la modale à son titre
   * - aria-hidden="true" : masque la modale initialement aux lecteurs d'écran
   */
  #initAria() {
    // Vérifier que role="dialog" est présent
    if (!this.#dialog.getAttribute('role')) {
      this.#dialog.setAttribute('role', 'dialog');
    }

    // Ajouter aria-modal
    if (!this.#dialog.hasAttribute('aria-modal')) {
      this.#dialog.setAttribute('aria-modal', 'true');
    }

    // Chercher le titre et ajouter aria-labelledby
    const title = this.#dialog.querySelector('[data-ds-modal-title]');
    if (title && !this.#dialog.hasAttribute('aria-labelledby')) {
      if (!title.id) {
        title.id = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
      }
      this.#dialog.setAttribute('aria-labelledby', title.id);
    }

    // Masquer initialement
    this.#dialog.setAttribute('aria-hidden', 'true');
  }

  /**
   * Lie les méthodes au contexte de la classe.
   * 
   * @private
   * @description
   * Crée les fonctions de gestion d'événements avec le bon contexte
   * pour éviter les problèmes de `this` lors de l'ajout/suppression d'écouteurs.
   */
  #bindMethods() {
    this.#focusTrapListener = (e) => this.#handleFocusTrap(e);
    this.#keydownListener = (e) => this.#handleKeydown(e);
    this.#backdropClickListener = (e) => this.#handleBackdropClick(e);
  }

  /**
   * Récupère tous les éléments focusables dans la modale.
   * 
   * @private
   * @returns {HTMLElement[]} Tableau des éléments focusables.
   * @description
   * Les éléments focusables incluent :
   * - Boutons, liens, inputs, textareas, selects
   * - Éléments avec tabindex >= 0
   * - Éléments audio/vidéo avec contrôles
   */
  #getFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'audio[controls]',
      'video[controls]',
    ].join(',');

    return Array.from(this.#dialog.querySelectorAll(focusableSelectors))
      .filter(el => {
        // Exclure les éléments masqués
        return el.offsetParent !== null && 
               getComputedStyle(el).visibility !== 'hidden' &&
               getComputedStyle(el).display !== 'none';
      });
  }

  /**
   * Gère le piégeage du focus (focus trap).
   * 
   * @private
   * @param {KeyboardEvent} event - L'événement clavier.
   * @description
   * Empêche le focus de quitter la modale lors de la navigation Tab/Shift+Tab.
   * Si Tab est pressé sur le dernier élément focusable, le focus revient au premier.
   * Si Shift+Tab est pressé sur le premier élément, le focus va au dernier.
   */
  #handleFocusTrap(event) {
    if (event.key !== 'Tab') return;

    this.#focusableElements = this.#getFocusableElements();
    
    if (this.#focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = this.#focusableElements[0];
    const lastElement = this.#focusableElements[this.#focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey) {
      // Shift + Tab
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Gère les événements clavier de la modale.
   * 
   * @private
   * @param {KeyboardEvent} event - L'événement clavier.
   * @description
   * Gère la touche Échap pour fermer la modale.
   * Les autres touches sont ignorées.
   */
  #handleKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  /**
   * Gère les clics sur le backdrop (arrière-plan).
   * 
   * @private
   * @param {MouseEvent} event - L'événement de clic.
   * @description
   * Ferme la modale si le clic est sur le backdrop (pas sur la modale elle-même).
   */
  #handleBackdropClick(event) {
    if (event.target === this.#root) {
      this.close();
    }
  }

  /**
   * Définit le focus initial sur le bouton de fermeture.
   * 
   * @private
   * @description
   * Donne le focus au bouton de fermeture lors de l'ouverture de la modale.
   * Cela respecte les bonnes pratiques d'accessibilité.
   */
  #setInitialFocus() {
    if (this.#closeBtn) {
      // Petit délai pour s'assurer que le DOM est prêt
      requestAnimationFrame(() => {
        this.#closeBtn.focus();
      });
    }
  }

  /**
   * Restaure le focus à l'élément précédent.
   * 
   * @private
   * @description
   * Remet le focus sur l'élément qui avait le focus avant l'ouverture de la modale.
   * Cela améliore l'expérience utilisateur, notamment pour les lecteurs d'écran.
   */
  #restorePreviousFocus() {
    if (this.#previousActiveElement && this.#previousActiveElement.focus) {
      this.#previousActiveElement.focus();
    }
  }

  /**
   * Ajoute les écouteurs d'événements pour la modale ouverte.
   * 
   * @private
   * @description
   * Ajoute les écouteurs pour :
   * - Tab/Shift+Tab (piégeage du focus)
   * - Échap (fermeture)
   * - Clics sur le backdrop (fermeture optionnelle)
   */
  #attachEventListeners() {
    this.#dialog.addEventListener('keydown', this.#focusTrapListener);
    this.#dialog.addEventListener('keydown', this.#keydownListener);
    this.#closeBtn.addEventListener('click', () => this.close());
    
    // Ajouter le gestionnaire de clic sur le backdrop si la modale est cliquable
    if (this.#root.hasAttribute('data-ds-modal-backdrop-close')) {
      this.#root.addEventListener('click', this.#backdropClickListener);
    }
  }

  /**
   * Supprime les écouteurs d'événements de la modale fermée.
   * 
   * @private
   * @description
   * Supprime tous les écouteurs d'événements pour éviter les fuites mémoire.
   */
  #detachEventListeners() {
    this.#dialog.removeEventListener('keydown', this.#focusTrapListener);
    this.#dialog.removeEventListener('keydown', this.#keydownListener);
    this.#closeBtn.removeEventListener('click', () => this.close());
    this.#root.removeEventListener('click', this.#backdropClickListener);
  }

  /**
   * Gère le scroll du body quand la modale est ouverte.
   * 
   * @private
   * @param {boolean} disable - true pour désactiver le scroll, false pour le réactiver.
   * @description
   * Empêche le scroll du body quand la modale est ouverte.
   * Restaure le scroll quand la modale est fermée.
   */
  #toggleBodyScroll(disable) {
    if (disable) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  // --- Méthodes publiques (API) ---

  /**
   * Ouvre la modale.
   * 
   * @public
   * @returns {void}
   * @description
   * Affiche la modale, définit le focus initial sur le bouton de fermeture,
   * active le piégeage du focus et désactive le scroll du body.
   * Déclenche un événement personnalisé 'ds-modal-open'.
   * 
   * @example
   * modal.open();
   */
  open() {
    if (this.#isOpen) return;

    this.#isOpen = true;
    this.#previousActiveElement = document.activeElement;

    // Afficher la modale
    this.#root.hidden = false;
    this.#dialog.setAttribute('aria-hidden', 'false');

    // Attacher les écouteurs d'événements
    this.#attachEventListeners();

    // Gérer le scroll du body
    this.#toggleBodyScroll(true);

    // Ajouter à la pile des modales ouvertes
    DsModal.#openModals.push(this);

    // Définir le focus initial
    this.#setInitialFocus();

    // Déclencher un événement personnalisé
    this.#root.dispatchEvent(new CustomEvent('ds-modal-open', {
      detail: { modal: this }
    }));
  }

  /**
   * Ferme la modale.
   * 
   * @public
   * @returns {void}
   * @description
   * Masque la modale, restaure le focus à l'élément précédent,
   * désactive le piégeage du focus et réactive le scroll du body.
   * Déclenche un événement personnalisé 'ds-modal-close'.
   * 
   * @example
   * modal.close();
   */
  close() {
    if (!this.#isOpen) return;

    this.#isOpen = false;

    // Masquer la modale
    this.#root.hidden = true;
    this.#dialog.setAttribute('aria-hidden', 'true');

    // Détacher les écouteurs d'événements
    this.#detachEventListeners();

    // Gérer le scroll du body
    DsModal.#openModals.pop();
    if (DsModal.#openModals.length === 0) {
      this.#toggleBodyScroll(false);
    }

    // Restaurer le focus
    this.#restorePreviousFocus();

    // Déclencher un événement personnalisé
    this.#root.dispatchEvent(new CustomEvent('ds-modal-close', {
      detail: { modal: this }
    }));
  }

  /**
   * Vérifie si la modale est ouverte.
   * 
   * @public
   * @returns {boolean} true si la modale est ouverte, false sinon.
   * 
   * @example
   * if (modal.isOpen()) {
   *   console.log('La modale est ouverte');
   * }
   */
  isOpen() {
    return this.#isOpen;
  }

  /**
   * Détruit l'instance et nettoie les événements.
   * 
   * @public
   * @returns {void}
   * @description
   * Ferme la modale si elle est ouverte et supprime l'instance de la Map globale.
   * À appeler avant de supprimer l'élément du DOM.
   * 
   * @example
   * modal.destroy();
   */
  destroy() {
    if (this.#isOpen) {
      this.close();
    }
    this.#detachEventListeners();
    DsModal.#instances.delete(this.#root);
  }

  // --- Méthodes statiques ---

  /**
   * Récupère l'instance associée à un élément.
   * 
   * @static
   * @param {HTMLElement} element - L'élément racine du composant modal.
   * @returns {DsModal|undefined} L'instance DsModal ou undefined si non trouvée.
   * 
   * @example
   * const modal = DsModal.getInstance(document.getElementById('myModal'));
   * if (modal) {
   *   modal.open();
   * }
   */
  static getInstance(element) {
    return DsModal.#instances.get(element);
  }

  /**
   * Démarre le MutationObserver pour initialiser automatiquement les composants.
   * 
   * @static
   * @returns {void}
   * @description
   * Lance l'observation du DOM pour initialiser automatiquement les modales
   * avec l'attribut data-ds-toggle="ds-modal".
   * Initialise également les modales existantes au moment de l'appel.
   * 
   * @example
   * DsModal.startAutoInit();
   */
  static startAutoInit() {
    if (DsModal.#observer) return;

    const init = (container = document) => {
      const elements = container.querySelectorAll('[data-ds-toggle="ds-modal"]');
      elements.forEach(el => {
        if (!DsModal.getInstance(el)) new DsModal(el);
      });
    };

    // Initialisation immédiate
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init());
    } else {
      init();
    }

    // Observation des changements futurs
    DsModal.#observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.matches('[data-ds-toggle="ds-modal"]')) {
              new DsModal(node);
            }
            const children = node.querySelectorAll('[data-ds-toggle="ds-modal"]');
            children.forEach(child => new DsModal(child));
          }
        });
      });
    });

    DsModal.#observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Arrête le MutationObserver.
   * 
   * @static
   * @returns {void}
   * @description
   * Arrête l'observation du DOM et nettoie les ressources.
   * À appeler si vous n'avez plus besoin de l'auto-initialisation.
   * 
   * @example
   * DsModal.stopAutoInit();
   */
  static stopAutoInit() {
    if (DsModal.#observer) {
      DsModal.#observer.disconnect();
      DsModal.#observer = null;
    }
  }
}

// Auto-démarrage par défaut si utilisé en tant que script direct
if (typeof window !== 'undefined') {
  DsModal.startAutoInit();
}
