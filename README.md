# Composant Tab Accessible (ES Module)

Ce projet propose une réécriture moderne du composant de tabulation, respectant les standards d'accessibilité **RGAA 4.1** et utilisant les dernières fonctionnalités de **Vanilla JavaScript (ES Modules, MutationObserver, Private Fields)**.

## Fonctionnalités

- **Accessibilité (RGAA 4.1)** : Gestion complète du focus, des attributs ARIA et de la navigation au clavier.
- **ES Module** : Architecture modulaire et propre.
- **MutationObserver** : Initialisation automatique des composants ajoutés dynamiquement au DOM.
- **Responsive** : Support du scroll horizontal avec flèches de navigation automatiques.
- **Customisation** : Utilisation de variables CSS et de tokens SCSS.
- **BEM** : Nomenclature CSS structurée avec préfixe `ds-`.

## Structure du projet

- `src/ds-tabs.js` : Le cœur du composant (ES Module).
- `src/scss/` : Fichiers sources SCSS (tokens et styles).
- `dist/ds-tabs.css` : Fichier CSS compilé.
- `demo/index.html` : Démo interactive.

## Utilisation

### HTML

```html
<div class="ds-tabs" data-ds-toggle="ds-tab">
    <div class="ds-tabs__header">
        <button class="ds-tabs__scroll-btn ds-tabs__scroll-btn--prev" type="button" data-ds-tabs-scroll="prev" hidden>&lt;</button>
        <div class="ds-tabs__tablist-wrapper">
            <div class="ds-tabs__tablist" role="tablist">
                <button class="ds-tabs__tab" role="tab" id="tab-1" aria-controls="panel-1" aria-selected="true">Onglet 1</button>
                <button class="ds-tabs__tab" role="tab" id="tab-2" aria-controls="panel-2" aria-selected="false">Onglet 2</button>
            </div>
        </div>
        <button class="ds-tabs__scroll-btn ds-tabs__scroll-btn--next" type="button" data-ds-tabs-scroll="next" hidden>&gt;</button>
    </div>
    <div class="ds-tabs__panel" id="panel-1" role="tabpanel" aria-labelledby="tab-1">Contenu 1</div>
    <div class="ds-tabs__panel" id="panel-2" role="tabpanel" aria-labelledby="tab-2" hidden>Contenu 2</div>
</div>
```

### JavaScript

Le composant s'auto-initialise grâce au `MutationObserver`. Vous pouvez également l'utiliser via son API :

```javascript
import { DsTabs } from './src/ds-tabs.js';

// Récupérer une instance
const instance = DsTabs.getInstance(document.querySelector('.ds-tabs'));

// Sélectionner un onglet
instance.selectTab(1);

// Écouter les changements
document.querySelector('.ds-tabs').addEventListener('ds-tab-change', (e) => {
    console.log('Nouvel index :', e.detail.index);
});
```

## Navigation Clavier

- `Flèche Droite / Bas` : Onglet suivant.
- `Flèche Gauche / Haut` : Onglet précédent.
- `Home` : Premier onglet.
- `End` : Dernier onglet.
- `Tab` : Accès au panneau de l'onglet sélectionné.
