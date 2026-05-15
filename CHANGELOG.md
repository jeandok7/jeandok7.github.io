# Changelog

Tous les changements importants de ce projet sont documentés dans ce fichier.

## [1.0.0] - 2026-05-15

### Ajouté
- ✨ Première version stable du composant Modal
- ✅ Conformité RGAA 4.1 complète
- 🔒 Focus trap fonctionnel (Tab/Shift+Tab confinés à la modale)
- ⌨️ Navigation au clavier complète (Échap pour fermer)
- 📡 Événements personnalisés (ds-modal-open, ds-modal-close)
- 🎨 Styles SCSS avec tokens CSS personnalisables
- 📱 Design responsive (mobile, tablet, desktop)
- 🎭 Animations fluides avec respect de prefers-reduced-motion
- 🔄 Auto-initialisation via MutationObserver
- 📖 Documentation JSDoc complète
- 🎯 Gestion du scroll du body quand la modale est ouverte
- 🎮 Page de démo interactive avec 5 exemples
- 📦 Aucune dépendance externe (Vanilla JavaScript)

### Caractéristiques Techniques
- ES Modules pour une intégration moderne
- Propriétés privées (#) pour l'encapsulation
- Gestion complète du focus avec restauration
- Support des lecteurs d'écran
- Attributs ARIA appropriés (role="dialog", aria-modal="true", aria-labelledby)
- Focus initial sur le bouton de fermeture
- Piégeage du focus avec Tab/Shift+Tab
- Gestion des modales imbriquées
- Initialisation dynamique des modales

### Documentation
- README.md complet avec guide d'utilisation
- JSDoc pour toutes les méthodes et classes
- Exemples de code pour les cas d'usage courants
- Guide d'accessibilité RGAA 4.1
- Checklist d'accessibilité

### Démo
- Page HTML interactive avec 5 exemples
- Modales simples, avec actions, avec contenu long
- Modales imbriquées
- Événements personnalisés affichés dans la console

---

## Format du Changelog

Ce changelog suit les conventions de [Keep a Changelog](https://keepachangelog.com/).

Les versions sont numérotées selon [Semantic Versioning](https://semver.org/).
