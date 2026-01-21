#!/usr/bin/env node

/**
 * Component Generator for Cardif Design System
 * 
 * This script automates the creation of components following Atomic Design principles.
 * It creates a complete component structure with 7 files:
 * - HTML, SCSS, JS, Stories, Tests, README, CHANGELOG
 * 
 * Usage: node generate-component.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Atomic Design categories
const CATEGORIES = {
  1: { name: 'atoms', description: 'Basic building blocks (Button, Input, Label, Icon, Badge)' },
  2: { name: 'molecules', description: 'Groups of atoms (Form Field, Search Bar, Card Header)' },
  3: { name: 'organisms', description: 'Complex components (Accordion, Modal, Navigation, Card)' },
  4: { name: 'templates', description: 'Page structures without content (Layout, Dashboard Template)' },
  5: { name: 'pages', description: 'Complete pages with real content (Home, About, Contact)' }
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Promisified question function
 */
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

/**
 * Convert component name to different case formats
 */
function formatComponentName(name) {
  // Convert to kebab-case
  const kebab = name
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

  // Convert to PascalCase
  const pascal = kebab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // Convert to camelCase
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);

  return { kebab, pascal, camel };
}

/**
 * Get complexity level based on category
 */
function getComplexityLevel(category) {
  const complexityMap = {
    'atoms': 'simple',
    'molecules': 'moderate',
    'organisms': 'complex',
    'templates': 'structural',
    'pages': 'complete'
  };
  return complexityMap[category] || 'moderate';
}

/**
 * Generate HTML template
 */
function generateHTML(componentName, category) {
  const { kebab, pascal } = componentName;
  const complexity = getComplexityLevel(category);
  const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
  
  let content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${pascal} : ${categoryCapitalized} level component in the Cardif Design System">
  <title>${pascal} Component</title>
  
  <!-- Head Partial -->
  {{> head}}
  
  <!-- Component Styles -->
  <link rel="stylesheet" href="${kebab}.scss">
</head>
<body>
  <!-- Header Partial -->
  {{> header}}

  <!-- Nav Partial -->
  {{> nav}}
  
  <main class="container">
    <h1>${pascal} Component</h1>
    
    <!-- Basic ${pascal} -->
    <section class="example-section">
      <h2>Default ${pascal}</h2>
      <div class="ds-${kebab}"`;

  if (complexity !== 'simple') {
    content += ` data-toggle="ds-${kebab}"`;
  }

  content += `>
`;

  // Add category-specific structure
  if (category === 'atoms') {
    content += `        <!-- Atom: Simple, single-purpose element -->
        <span class="ds-${kebab}__content">Default ${pascal}</span>
`;
  } else if (category === 'molecules') {
    content += `        <!-- Molecule: Combination of atoms -->
        <div class="ds-${kebab}__header">
          <h3 class="ds-${kebab}__title">${pascal} Title</h3>
        </div>
        <div class="ds-${kebab}__body">
          <p>Content goes here...</p>
        </div>
`;
  } else if (category === 'organisms') {
    content += `        <!-- Organism: Complex, feature-rich component -->
        <div class="ds-${kebab}__header">
          <h3 class="ds-${kebab}__title">${pascal} Title</h3>
          <button class="ds-${kebab}__close" aria-label="Close">×</button>
        </div>
        <div class="ds-${kebab}__body">
          <p>Complex content with interactions...</p>
        </div>
        <div class="ds-${kebab}__footer">
          <button class="ds-button ds-button--primary">Action</button>
          <button class="ds-button ds-button--secondary">Cancel</button>
        </div>
`;
  } else if (category === 'templates') {
    content += `        <!-- Template: Page structure layout -->
        <div class="ds-${kebab}__sidebar">
          <nav>Navigation area</nav>
        </div>
        <div class="ds-${kebab}__main">
          <header class="ds-${kebab}__header">Header area</header>
          <div class="ds-${kebab}__content">Main content area</div>
          <footer class="ds-${kebab}__footer">Footer area</footer>
        </div>
`;
  } else if (category === 'pages') {
    content += `        <!-- Page: Complete page with real content -->
        <header class="ds-${kebab}__hero">
          <h1>Welcome to ${pascal} Page</h1>
          <p>Real content for this specific page</p>
        </header>
        <section class="ds-${kebab}__content">
          <article>
            <h2>Section Title</h2>
            <p>Actual page content...</p>
          </article>
        </section>
`;
  }

  content += `      </div>
    </section>

    <!-- Variant Example -->
    <section class="example-section">
      <h2>${pascal} - Variant</h2>
      <div class="ds-${kebab} ds-${kebab}--variant"`;
  
  if (complexity !== 'simple') {
    content += ` data-toggle="ds-${kebab}"`;
  }

  content += `>
        <div class="ds-${kebab}__content">
          Modified variant with different styling
        </div>
      </div>
    </section>

    <!-- State Examples -->
    <section class="example-section">
      <h2>${pascal} - States</h2>
      
      <!-- Active State -->
      <div class="ds-${kebab} is-active">
        <div class="ds-${kebab}__content">Active State</div>
      </div>
      
      <!-- Disabled State -->
      <div class="ds-${kebab} is-disabled">
        <div class="ds-${kebab}__content">Disabled State</div>
      </div>
    </section>
  </main>

  <!-- Footer Partial -->
  {{> footer}}
  
  <!-- Component Script -->
  <script type="module" src="${kebab}.js"></script>
</body>
</html>
`;

  return content;
}

/**
 * Generate SCSS template
 */
function generateSCSS(componentName, category) {
  const { kebab, pascal } = componentName;
  
  let content = `/**
 * ${pascal} Component - ${category.charAt(0).toUpperCase() + category.slice(1)}
 * 
 * ${getCategoryDescription(category)}
 */

.ds-${kebab} {
  // Layout
  display: `;
  
  if (category === 'templates' || category === 'pages') {
    content += `grid;
  grid-template-columns: repeat(12, 1fr);
  gap: $spacing-lg;
  min-height: 100vh;
`;
  } else {
    content += `flex;
  flex-direction: column;
`;
  }

  content += `
  // Spacing
  padding: $spacing-`;
  content += category === 'atoms' ? 'sm' : 'md';
  content += `;
  
  // Visual
  background-color: $color-white;
  border: 1px solid $color-border;
  border-radius: $border-radius-`;
  content += category === 'atoms' ? 'sm' : 'md';
  content += `;
  
  // Effects
  box-shadow: $shadow-`;
  content += category === 'atoms' ? 'none' : 'sm';
  content += `;
  transition: all $transition-base ease-in-out;

  // Hover state
  &:hover {
    box-shadow: $shadow-`;
  content += category === 'atoms' ? 'sm' : 'md';
  content += `;
  }

`;

  // Add category-specific elements
  if (category === 'atoms') {
    content += `  /* Element: Content */
  &__content {
    font-size: $font-size-base;
    font-weight: $font-weight-normal;
    color: $color-text;
  }

`;
  } else if (category === 'molecules') {
    content += `  /* Element: Header */
  &__header {
    padding-bottom: $spacing-md;
    border-bottom: 1px solid $color-border;
  }

  /* Element: Title */
  &__title {
    margin: 0;
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-text;
  }

  /* Element: Body */
  &__body {
    flex: 1;
    padding: $spacing-md 0;
  }

`;
  } else if (category === 'organisms') {
    content += `  /* Element: Header */
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    border-bottom: 1px solid $color-border;
  }

  /* Element: Title */
  &__title {
    margin: 0;
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-text;
  }

  /* Element: Close Button */
  &__close {
    padding: $spacing-xs;
    background: transparent;
    border: none;
    font-size: $font-size-xl;
    cursor: pointer;
    color: $color-text-light;
    transition: color $transition-base;

    &:hover {
      color: $color-text;
    }
  }

  /* Element: Body */
  &__body {
    flex: 1;
    padding: $spacing-lg;
    overflow-y: auto;
  }

  /* Element: Footer */
  &__footer {
    display: flex;
    gap: $spacing-md;
    justify-content: flex-end;
    padding: $spacing-lg;
    border-top: 1px solid $color-border;
    background-color: $color-background-light;
  }

`;
  } else if (category === 'templates') {
    content += `  /* Element: Sidebar */
  &__sidebar {
    grid-column: 1 / 4;
    padding: $spacing-lg;
    background-color: $color-background-dark;
  }

  /* Element: Main */
  &__main {
    grid-column: 4 / 13;
    display: flex;
    flex-direction: column;
  }

  /* Element: Header */
  &__header {
    padding: $spacing-lg;
    background-color: $color-white;
    border-bottom: 1px solid $color-border;
  }

  /* Element: Content */
  &__content {
    flex: 1;
    padding: $spacing-lg;
  }

  /* Element: Footer */
  &__footer {
    padding: $spacing-lg;
    background-color: $color-background-light;
    border-top: 1px solid $color-border;
  }

`;
  } else if (category === 'pages') {
    content += `  /* Element: Hero */
  &__hero {
    grid-column: 1 / -1;
    padding: $spacing-xl * 2;
    text-align: center;
    background: linear-gradient(135deg, $color-primary, $color-secondary);
    color: $color-white;
  }

  /* Element: Content */
  &__content {
    grid-column: 2 / 12;
    padding: $spacing-xl 0;
  }

`;
  }

  content += `  /* Modifier: Variant */
  &--variant {
    background-color: $color-background-light;
    border-color: $color-primary;
  }

  /* State: Active */
  &.is-active {
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
  }

  /* State: Disabled */
  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  /* State: Loading */
  &.is-loading {
    position: relative;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: rgba($color-white, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  /* Responsive: Tablet */
  @media (min-width: $breakpoint-md) {
`;

  if (category === 'templates' || category === 'pages') {
    content += `    grid-template-columns: 1fr;
    
    &__sidebar {
      grid-column: 1 / -1;
    }

    &__main {
      grid-column: 1 / -1;
    }
`;
  } else {
    content += `    padding: $spacing-md;
`;
  }

  content += `  }

  /* Responsive: Desktop */
  @media (min-width: $breakpoint-lg) {
    padding: $spacing-lg;
  }

  /* Responsive: Large Desktop */
  @media (min-width: $breakpoint-xl) {
    padding: $spacing-xl;
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
}
`;

  return content;
}

/**
 * Generate JavaScript template
 */
function generateJS(componentName, category) {
  const { kebab, pascal, camel } = componentName;
  const needsJS = category !== 'atoms' && category !== 'templates';
  
  if (!needsJS) {
    return `/**
 * ${pascal} Component - ${category.charAt(0).toUpperCase() + category.slice(1)}
 * 
 * This ${category.slice(0, -1)} does not require JavaScript logic.
 * All functionality is handled through CSS.
 */

console.log('${pascal} component loaded (no interactive logic required)');
`;
  }

  let content = `/**
 * ${pascal} Component - ${category.charAt(0).toUpperCase() + category.slice(1)}
 * ${getCategoryDescription(category)}
 * 
 * Features:
 * - Auto-initialization via data-toggle
 * - Custom events for state changes
 * - Public API for programmatic control
 * - MutationObserver for dynamic content
 * - Keyboard navigation support
 * - ARIA accessibility
 */

(function() {
  'use strict';

  /**
   * ${pascal} Class
   */
  class ${pascal} {
    /**
     * Constructor
     * @param {HTMLElement} element - The component element
     * @param {Object} options - Configuration options
     */
    constructor(element, options = {}) {
      if (!element) {
        throw new Error('${pascal} element is required');
      }

      this.element = element;
      this.options = {
        // Default options
        animated: element.dataset.animated !== 'false',
        closeOnOutsideClick: element.dataset.closeOnOutsideClick === 'true',
        keyboard: element.dataset.keyboard !== 'false',
        ...options
      };

      // State
      this.state = {
        isOpen: false,
        isActive: false,
        isDisabled: false
      };

      // Store instance reference
      this.element._${camel}Instance = this;

      // Initialize
      this.init();
    }

    /**
     * Initialize the component
     */
    init() {
      this.setupElements();
      this.setupEventListeners();
      this.setupAccessibility();
      
      this.dispatchEvent('initialized');
    }

    /**
     * Setup child elements
     */
    setupElements() {
      this.elements = {
        trigger: this.element.querySelector('.ds-${kebab}__trigger'),
        content: this.element.querySelector('.ds-${kebab}__content'),
        close: this.element.querySelector('.ds-${kebab}__close')
      };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
      // Click events
      if (this.elements.trigger) {
        this.elements.trigger.addEventListener('click', this.handleTriggerClick.bind(this));
      }

      if (this.elements.close) {
        this.elements.close.addEventListener('click', this.handleCloseClick.bind(this));
      }

      // Keyboard events
      if (this.options.keyboard) {
        this.element.addEventListener('keydown', this.handleKeydown.bind(this));
      }

      // Outside click
      if (this.options.closeOnOutsideClick) {
        document.addEventListener('click', this.handleOutsideClick.bind(this));
      }
    }

    /**
     * Setup accessibility attributes
     */
    setupAccessibility() {
      // Set ARIA attributes
      if (this.elements.trigger) {
        this.elements.trigger.setAttribute('aria-expanded', 'false');
        this.elements.trigger.setAttribute('aria-controls', this.getContentId());
      }

      if (this.elements.content) {
        this.elements.content.setAttribute('id', this.getContentId());
        this.elements.content.setAttribute('role', 'region');
        this.elements.content.setAttribute('aria-hidden', 'true');
      }

      // Make element focusable if needed
      if (!this.element.hasAttribute('tabindex')) {
        this.element.setAttribute('tabindex', '0');
      }
    }

    /**
     * Handle trigger click
     */
    handleTriggerClick(event) {
      event.preventDefault();
      this.toggle();
    }

    /**
     * Handle close button click
     */
    handleCloseClick(event) {
      event.preventDefault();
      this.close();
    }

    /**
     * Handle keyboard interactions
     */
    handleKeydown(event) {
      const { key } = event;

      switch (key) {
        case 'Escape':
          if (this.state.isOpen) {
            event.preventDefault();
            this.close();
          }
          break;

        case 'Enter':
        case ' ':
          if (event.target === this.elements.trigger) {
            event.preventDefault();
            this.toggle();
          }
          break;

        // Add more keyboard shortcuts as needed
      }
    }

    /**
     * Handle outside click
     */
    handleOutsideClick(event) {
      if (this.state.isOpen && !this.element.contains(event.target)) {
        this.close();
      }
    }

    /**
     * Open the component
     */
    open() {
      if (this.state.isOpen || this.state.isDisabled) return;

      this.state.isOpen = true;
      this.element.classList.add('is-open');

      if (this.elements.trigger) {
        this.elements.trigger.setAttribute('aria-expanded', 'true');
      }

      if (this.elements.content) {
        this.elements.content.setAttribute('aria-hidden', 'false');
        
        if (this.options.animated) {
          this.elements.content.style.display = 'block';
        }
      }

      this.dispatchEvent('opened');
    }

    /**
     * Close the component
     */
    close() {
      if (!this.state.isOpen) return;

      this.state.isOpen = false;
      this.element.classList.remove('is-open');

      if (this.elements.trigger) {
        this.elements.trigger.setAttribute('aria-expanded', 'false');
      }

      if (this.elements.content) {
        this.elements.content.setAttribute('aria-hidden', 'true');
        
        if (this.options.animated) {
          setTimeout(() => {
            if (!this.state.isOpen) {
              this.elements.content.style.display = 'none';
            }
          }, 300); // Match CSS transition duration
        }
      }

      this.dispatchEvent('closed');
    }

    /**
     * Toggle the component
     */
    toggle() {
      if (this.state.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Enable the component
     */
    enable() {
      this.state.isDisabled = false;
      this.element.classList.remove('is-disabled');
      this.element.removeAttribute('aria-disabled');
      this.dispatchEvent('enabled');
    }

    /**
     * Disable the component
     */
    disable() {
      this.state.isDisabled = true;
      this.element.classList.add('is-disabled');
      this.element.setAttribute('aria-disabled', 'true');
      this.dispatchEvent('disabled');
    }

    /**
     * Get unique content ID
     */
    getContentId() {
      if (!this._contentId) {
        this._contentId = \`ds-${kebab}-content-\${Math.random().toString(36).substr(2, 9)}\`;
      }
      return this._contentId;
    }

    /**
     * Dispatch custom event
     */
    dispatchEvent(eventName, detail = {}) {
      const event = new CustomEvent(\`ds-${kebab}:\${eventName}\`, {
        bubbles: true,
        cancelable: true,
        detail: {
          ${camel}: this,
          element: this.element,
          ...detail
        }
      });
      this.element.dispatchEvent(event);
      return event;
    }

    /**
     * Destroy the component instance
     */
    destroy() {
      // Remove event listeners
      if (this.elements.trigger) {
        this.elements.trigger.removeEventListener('click', this.handleTriggerClick);
      }

      if (this.elements.close) {
        this.elements.close.removeEventListener('click', this.handleCloseClick);
      }

      this.element.removeEventListener('keydown', this.handleKeydown);
      document.removeEventListener('click', this.handleOutsideClick);

      // Remove ARIA attributes
      this.element.removeAttribute('tabindex');

      // Clear instance reference
      delete this.element._${camel}Instance;

      this.dispatchEvent('destroyed');
    }
  }

  /**
   * Auto-initialization
   */
  function init${pascal}Components() {
    document.querySelectorAll('[data-toggle="ds-${kebab}"]').forEach(element => {
      if (!element._${camel}Instance) {
        new ${pascal}(element);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init${pascal}Components);
  } else {
    init${pascal}Components();
  }

  /**
   * MutationObserver for dynamically added components
   */
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            // Check if the node itself is a component
            if (node.matches && node.matches('[data-toggle="ds-${kebab}"]')) {
              if (!node._${camel}Instance) {
                new ${pascal}(node);
              }
            }
            // Check for components within the node
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-toggle="ds-${kebab}"]').forEach(element => {
                if (!element._${camel}Instance) {
                  new ${pascal}(element);
                }
              });
            }
          }
        });
      });
    });

    // Start observing after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      });
    } else {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // ES Module export
  export default ${pascal};
})();
`;

  return content;
}

/**
 * Generate Storybook stories template
 */
function generateStories(componentName, category) {
  const { kebab, pascal } = componentName;
  const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
  
  let content = `/**
 * ${pascal} Component Stories
 * 
 * This file defines Storybook stories for the ${pascal} component.
 * Stories showcase different states, variants, and use cases.
 */

import { html } from 'lit-html';
import './${kebab}.scss';
`;

  if (category !== 'atoms' && category !== 'templates') {
    content += `import ${pascal} from './${kebab}.js';
`;
  }

  content += `
export default {
  title: '${categoryCapitalized}/${pascal}',
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the ${kebab}',
      defaultValue: '${pascal} Title'
    },
    content: {
      control: 'text',
      description: 'Content of the ${kebab}',
      defaultValue: 'This is the content of the ${kebab} component.'
    },
    variant: {
      control: 'select',
      options: ['default', 'variant'],
      description: 'Visual variant of the ${kebab}',
      defaultValue: 'default'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the ${kebab}',
      defaultValue: false
    }
  },
  parameters: {
    docs: {
      description: {
        component: '${getCategoryDescription(category)}'
      }
    }
  }
};

/**
 * Template function for creating stories
 */
const Template = ({ title = '${pascal} Title', content = 'Content goes here...', variant = 'default', disabled = false }) => {
  const variantClass = variant !== 'default' ? \`ds-${kebab}--\${variant}\` : '';
  const disabledClass = disabled ? 'is-disabled' : '';
  const dataAttrs = ${category !== 'atoms' && category !== 'templates' ? `'data-toggle="ds-${kebab}"'` : "''"};
  
  return html\`
    <div class="ds-${kebab} \${variantClass} \${disabledClass}" \${dataAttrs}>
`;

  if (category === 'atoms') {
    content += `      <span class="ds-${kebab}__content">\${content}</span>
`;
  } else if (category === 'molecules') {
    content += `      <div class="ds-${kebab}__header">
        <h3 class="ds-${kebab}__title">\${title}</h3>
      </div>
      <div class="ds-${kebab}__body">
        <p>\${content}</p>
      </div>
`;
  } else if (category === 'organisms') {
    content += `      <div class="ds-${kebab}__header">
        <h3 class="ds-${kebab}__title">\${title}</h3>
        <button class="ds-${kebab}__close" aria-label="Close">×</button>
      </div>
      <div class="ds-${kebab}__body">
        <p>\${content}</p>
      </div>
      <div class="ds-${kebab}__footer">
        <button class="ds-button ds-button--primary">Confirm</button>
        <button class="ds-button ds-button--secondary">Cancel</button>
      </div>
`;
  } else if (category === 'templates') {
    content += `      <div class="ds-${kebab}__sidebar">
        <nav>Sidebar Navigation</nav>
      </div>
      <div class="ds-${kebab}__main">
        <header class="ds-${kebab}__header">\${title}</header>
        <div class="ds-${kebab}__content">\${content}</div>
        <footer class="ds-${kebab}__footer">Footer</footer>
      </div>
`;
  } else if (category === 'pages') {
    content += `      <header class="ds-${kebab}__hero">
        <h1>\${title}</h1>
        <p>\${content}</p>
      </header>
      <section class="ds-${kebab}__content">
        <article>
          <h2>Page Section</h2>
          <p>Real page content goes here...</p>
        </article>
      </section>
`;
  }

  content += `    </div>
  \`;
};

/**
 * Default story
 */
export const Default = Template.bind({});
Default.args = {
  title: 'Default ${pascal}',
  content: 'This is the default ${kebab} component with standard styling.',
  variant: 'default',
  disabled: false
};

/**
 * Variant story
 */
export const Variant = Template.bind({});
Variant.args = {
  title: '${pascal} Variant',
  content: 'This ${kebab} uses a different visual variant.',
  variant: 'variant',
  disabled: false
};

/**
 * Disabled state story
 */
export const Disabled = Template.bind({});
Disabled.args = {
  title: 'Disabled ${pascal}',
  content: 'This ${kebab} is in a disabled state.',
  variant: 'default',
  disabled: true
};
`;

  if (category === 'organisms' || category === 'molecules') {
    content += `
/**
 * Interactive story with event handling
 */
export const Interactive = () => {
  setTimeout(() => {
    const element = document.querySelector('[data-toggle="ds-${kebab}"]');
    
    if (element && element._${componentName.camel}Instance) {
      // Listen to custom events
      element.addEventListener('ds-${kebab}:opened', (e) => {
        console.log('${pascal} opened:', e.detail);
      });
      
      element.addEventListener('ds-${kebab}:closed', (e) => {
        console.log('${pascal} closed:', e.detail);
      });
    }
  }, 100);

  return html\`
    <div>
      <p>Open the browser console to see event logs.</p>
      <div class="ds-${kebab}" data-toggle="ds-${kebab}">
        <div class="ds-${kebab}__header">
          <h3 class="ds-${kebab}__title">Interactive ${pascal}</h3>
          <button class="ds-${kebab}__trigger">Toggle</button>
        </div>
        <div class="ds-${kebab}__body">
          <p>Click the toggle button to see events in action.</p>
        </div>
      </div>
    </div>
  \`;
};
`;
  }

  content += `
/**
 * Multiple instances story
 */
export const Multiple = () => html\`
  <div style="display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
    \${Template({ title: '${pascal} One', content: 'First instance', variant: 'default' })}
    \${Template({ title: '${pascal} Two', content: 'Second instance', variant: 'variant' })}
    \${Template({ title: '${pascal} Three', content: 'Third instance', variant: 'default' })}
  </div>
\`;
`;

  return content;
}

/**
 * Generate test file template
 */
function generateTest(componentName, category) {
  const { kebab, pascal, camel } = componentName;
  const needsTests = category !== 'templates' && category !== 'pages';
  
  let content = `/**
 * ${pascal} Component Tests
 * 
 * Test suite for the ${pascal} component
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
`;

  if (category !== 'atoms') {
    content += `import ${pascal} from './${kebab}.js';
`;
  }

  content += `
describe('${pascal} Component', () => {
  let container;

  beforeEach(() => {
    // Create a container for each test
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
`;

  if (category === 'atoms') {
    content += `    it('should render with correct HTML structure', () => {
      container.innerHTML = \`
        <div class="ds-${kebab}">
          <span class="ds-${kebab}__content">Test Content</span>
        </div>
      \`;

      const element = container.querySelector('.ds-${kebab}');
      const content = element.querySelector('.ds-${kebab}__content');

      expect(element).toBeDefined();
      expect(content).toBeDefined();
      expect(content.textContent).toBe('Test Content');
    });

    it('should apply correct CSS classes', () => {
      container.innerHTML = \`
        <div class="ds-${kebab} ds-${kebab}--variant">
          <span class="ds-${kebab}__content">Test</span>
        </div>
      \`;

      const element = container.querySelector('.ds-${kebab}');
      
      expect(element.classList.contains('ds-${kebab}')).toBe(true);
      expect(element.classList.contains('ds-${kebab}--variant')).toBe(true);
    });

    it('should handle disabled state', () => {
      container.innerHTML = \`
        <div class="ds-${kebab} is-disabled">
          <span class="ds-${kebab}__content">Disabled</span>
        </div>
      \`;

      const element = container.querySelector('.ds-${kebab}');
      
      expect(element.classList.contains('is-disabled')).toBe(true);
    });
`;
  } else {
    content += `    it('should auto-initialize with data-toggle attribute', () => {
      container.innerHTML = \`
        <div class="ds-${kebab}" data-toggle="ds-${kebab}">
          <div class="ds-${kebab}__content">Test</div>
        </div>
      \`;

      const element = container.querySelector('[data-toggle="ds-${kebab}"]');
      
      // Trigger initialization
      document.dispatchEvent(new Event('DOMContentLoaded'));

      expect(element._${camel}Instance).toBeDefined();
      expect(element._${camel}Instance).toBeInstanceOf(${pascal});
    });

    it('should accept options through constructor', () => {
      container.innerHTML = \`
        <div class="ds-${kebab}">
          <div class="ds-${kebab}__content">Test</div>
        </div>
      \`;

      const element = container.querySelector('.ds-${kebab}');
      const instance = new ${pascal}(element, {
        animated: false,
        keyboard: true
      });

      expect(instance.options.animated).toBe(false);
      expect(instance.options.keyboard).toBe(true);
    });

    it('should throw error when element is not provided', () => {
      expect(() => {
        new ${pascal}(null);
      }).toThrow('${pascal} element is required');
    });
`;
  }

  content += `  });

`;

  if (category !== 'atoms') {
    content += `  describe('Public API', () => {
    let element;
    let instance;

    beforeEach(() => {
      container.innerHTML = \`
        <div class="ds-${kebab}" data-toggle="ds-${kebab}">
          <button class="ds-${kebab}__trigger">Toggle</button>
          <div class="ds-${kebab}__content">Content</div>
        </div>
      \`;

      element = container.querySelector('[data-toggle="ds-${kebab}"]');
      instance = new ${pascal}(element);
    });

    it('should have open() method', () => {
      expect(typeof instance.open).toBe('function');
      
      instance.open();
      
      expect(instance.state.isOpen).toBe(true);
      expect(element.classList.contains('is-open')).toBe(true);
    });

    it('should have close() method', () => {
      expect(typeof instance.close).toBe('function');
      
      instance.open();
      instance.close();
      
      expect(instance.state.isOpen).toBe(false);
      expect(element.classList.contains('is-open')).toBe(false);
    });

    it('should have toggle() method', () => {
      expect(typeof instance.toggle).toBe('function');
      
      instance.toggle();
      expect(instance.state.isOpen).toBe(true);
      
      instance.toggle();
      expect(instance.state.isOpen).toBe(false);
    });

    it('should have enable() and disable() methods', () => {
      expect(typeof instance.enable).toBe('function');
      expect(typeof instance.disable).toBe('function');
      
      instance.disable();
      expect(instance.state.isDisabled).toBe(true);
      expect(element.classList.contains('is-disabled')).toBe(true);
      
      instance.enable();
      expect(instance.state.isDisabled).toBe(false);
      expect(element.classList.contains('is-disabled')).toBe(false);
    });

    it('should have destroy() method', () => {
      expect(typeof instance.destroy).toBe('function');
      
      instance.destroy();
      
      expect(element._${camel}Instance).toBeUndefined();
    });
  });

  describe('Events', () => {
    let element;
    let instance;

    beforeEach(() => {
      container.innerHTML = \`
        <div class="ds-${kebab}" data-toggle="ds-${kebab}">
          <button class="ds-${kebab}__trigger">Toggle</button>
          <div class="ds-${kebab}__content">Content</div>
        </div>
      \`;

      element = container.querySelector('[data-toggle="ds-${kebab}"]');
      instance = new ${pascal}(element);
    });

    it('should dispatch initialized event', (done) => {
      const newElement = document.createElement('div');
      newElement.className = 'ds-${kebab}';
      newElement.innerHTML = '<div class="ds-${kebab}__content">Test</div>';
      
      newElement.addEventListener('ds-${kebab}:initialized', (event) => {
        expect(event.detail.${camel}).toBeDefined();
        done();
      });

      container.appendChild(newElement);
      new ${pascal}(newElement);
    });

    it('should dispatch opened event', (done) => {
      element.addEventListener('ds-${kebab}:opened', (event) => {
        expect(event.detail.${camel}).toBe(instance);
        expect(event.bubbles).toBe(true);
        done();
      });

      instance.open();
    });

    it('should dispatch closed event', (done) => {
      element.addEventListener('ds-${kebab}:closed', (event) => {
        expect(event.detail.${camel}).toBe(instance);
        done();
      });

      instance.open();
      instance.close();
    });

    it('should dispatch enabled and disabled events', (done) => {
      let eventCount = 0;

      element.addEventListener('ds-${kebab}:disabled', () => {
        eventCount++;
        if (eventCount === 2) done();
      });

      element.addEventListener('ds-${kebab}:enabled', () => {
        eventCount++;
        if (eventCount === 2) done();
      });

      instance.disable();
      instance.enable();
    });
  });

  describe('Accessibility', () => {
    let element;
    let instance;

    beforeEach(() => {
      container.innerHTML = \`
        <div class="ds-${kebab}" data-toggle="ds-${kebab}">
          <button class="ds-${kebab}__trigger">Toggle</button>
          <div class="ds-${kebab}__content">Content</div>
        </div>
      \`;

      element = container.querySelector('[data-toggle="ds-${kebab}"]');
      instance = new ${pascal}(element);
    });

    it('should set correct ARIA attributes on initialization', () => {
      const trigger = element.querySelector('.ds-${kebab}__trigger');
      const content = element.querySelector('.ds-${kebab}__content');

      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(trigger.hasAttribute('aria-controls')).toBe(true);
      expect(content.getAttribute('role')).toBe('region');
      expect(content.getAttribute('aria-hidden')).toBe('true');
    });

    it('should update ARIA attributes when opened', () => {
      const trigger = element.querySelector('.ds-${kebab}__trigger');
      const content = element.querySelector('.ds-${kebab}__content');

      instance.open();

      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      expect(content.getAttribute('aria-hidden')).toBe('false');
    });

    it('should be keyboard accessible', () => {
      const trigger = element.querySelector('.ds-${kebab}__trigger');
      
      // Simulate Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(enterEvent, 'target', { value: trigger });
      element.dispatchEvent(enterEvent);

      expect(instance.state.isOpen).toBe(true);
    });

    it('should close on Escape key', () => {
      instance.open();

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      element.dispatchEvent(escapeEvent);

      expect(instance.state.isOpen).toBe(false);
    });

    it('should have tabindex for focus management', () => {
      expect(element.hasAttribute('tabindex')).toBe(true);
    });
  });

  describe('Dynamic Content (MutationObserver)', () => {
    it('should auto-initialize dynamically added components', (done) => {
      // Add component dynamically
      const newElement = document.createElement('div');
      newElement.className = 'ds-${kebab}';
      newElement.setAttribute('data-toggle', 'ds-${kebab}');
      newElement.innerHTML = '<div class="ds-${kebab}__content">Dynamic</div>';

      container.appendChild(newElement);

      // Wait for MutationObserver to trigger
      setTimeout(() => {
        expect(newElement._${camel}Instance).toBeDefined();
        done();
      }, 100);
    });
  });
`;
  }

  content += `});
`;

  return content;
}

/**
 * Generate README template
 */
function generateREADME(componentName, category) {
  const { kebab, pascal } = componentName;
  const categoryCapitalized = category.charAt(0).toUpperCase() + category.slice(1);
  
  let content = `# ${pascal} Component

> ${categoryCapitalized} level component in the Cardif Design System

## Description

${getCategoryDescription(category)}

## Category

**${categoryCapitalized}** - ${getCategoryCharacteristics(category)}

## File Structure

\`\`\`
${category}/${kebab}/
├── ${kebab}.html          # HTML examples and usage
├── ${kebab}.scss          # Component styles (BEM methodology)
├── ${kebab}.js            # JavaScript logic${category === 'atoms' || category === 'templates' ? ' (minimal/none)' : ' (auto-initialization)'}
├── ${kebab}.stories.js    # Storybook documentation
├── ${kebab}.test.js       # Unit tests
├── README.md              # This file
└── CHANGELOG.md           # Version history
\`\`\`

## Usage

### HTML

\`\`\`html
`;

  if (category === 'atoms') {
    content += `<!-- Basic ${pascal} -->
<div class="ds-${kebab}">
  <span class="ds-${kebab}__content">Content</span>
</div>

<!-- ${pascal} with variant -->
<div class="ds-${kebab} ds-${kebab}--variant">
  <span class="ds-${kebab}__content">Variant content</span>
</div>
`;
  } else if (category === 'molecules') {
    content += `<!-- Basic ${pascal} -->
<div class="ds-${kebab}" data-toggle="ds-${kebab}">
  <div class="ds-${kebab}__header">
    <h3 class="ds-${kebab}__title">Title</h3>
  </div>
  <div class="ds-${kebab}__body">
    <p>Content goes here...</p>
  </div>
</div>
`;
  } else if (category === 'organisms') {
    content += `<!-- Basic ${pascal} -->
<div class="ds-${kebab}" data-toggle="ds-${kebab}">
  <div class="ds-${kebab}__header">
    <h3 class="ds-${kebab}__title">Title</h3>
    <button class="ds-${kebab}__close" aria-label="Close">×</button>
  </div>
  <div class="ds-${kebab}__body">
    <p>Complex content with interactions...</p>
  </div>
  <div class="ds-${kebab}__footer">
    <button class="ds-button ds-button--primary">Confirm</button>
    <button class="ds-button ds-button--secondary">Cancel</button>
  </div>
</div>
`;
  } else if (category === 'templates') {
    content += `<!-- ${pascal} Layout -->
<div class="ds-${kebab}">
  <div class="ds-${kebab}__sidebar">
    <nav>Sidebar content</nav>
  </div>
  <div class="ds-${kebab}__main">
    <header class="ds-${kebab}__header">Header</header>
    <div class="ds-${kebab}__content">Main content</div>
    <footer class="ds-${kebab}__footer">Footer</footer>
  </div>
</div>
`;
  } else if (category === 'pages') {
    content += `<!-- ${pascal} Page -->
<div class="ds-${kebab}">
  <header class="ds-${kebab}__hero">
    <h1>Page Title</h1>
    <p>Hero content</p>
  </header>
  <section class="ds-${kebab}__content">
    <article>
      <h2>Section</h2>
      <p>Page content...</p>
    </article>
  </section>
</div>
`;
  }

  content += `\`\`\`

`;

  if (category !== 'atoms' && category !== 'templates') {
    content += `### JavaScript

#### Auto-Initialization

The component automatically initializes when the DOM is ready:

\`\`\`html
<div class="ds-${kebab}" data-toggle="ds-${kebab}">
  <!-- Component content -->
</div>
\`\`\`

#### Manual Initialization

\`\`\`javascript
const element = document.querySelector('.ds-${kebab}');
const ${componentName.camel} = new DS${pascal}(element, {
  animated: true,
  keyboard: true,
  closeOnOutsideClick: false
});
\`\`\`

#### Public API

\`\`\`javascript
// Open the component
${componentName.camel}.open();

// Close the component
${componentName.camel}.close();

// Toggle the component
${componentName.camel}.toggle();

// Enable the component
${componentName.camel}.enable();

// Disable the component
${componentName.camel}.disable();

// Destroy the component
${componentName.camel}.destroy();
\`\`\`

#### Events

The component dispatches custom events:

\`\`\`javascript
element.addEventListener('ds-${kebab}:initialized', (e) => {
  console.log('Component initialized', e.detail);
});

element.addEventListener('ds-${kebab}:opened', (e) => {
  console.log('Component opened', e.detail);
});

element.addEventListener('ds-${kebab}:closed', (e) => {
  console.log('Component closed', e.detail);
});

element.addEventListener('ds-${kebab}:enabled', (e) => {
  console.log('Component enabled', e.detail);
});

element.addEventListener('ds-${kebab}:disabled', (e) => {
  console.log('Component disabled', e.detail);
});
\`\`\`

`;
  }

  content += `### SCSS

#### BEM Structure

\`\`\`scss
.ds-${kebab} {}                    // Block
.ds-${kebab}__element {}           // Element
.ds-${kebab}--modifier {}          // Modifier
.ds-${kebab}.is-state {}           // State
\`\`\`

#### Available Modifiers

- \`.ds-${kebab}--variant\` - Alternative visual style
- \`.is-active\` - Active state
- \`.is-disabled\` - Disabled state
- \`.is-loading\` - Loading state

#### Design Tokens

This component uses the following design tokens:

- **Spacing**: \`$spacing-sm\`, \`$spacing-md\`, \`$spacing-lg\`
- **Colors**: \`$color-white\`, \`$color-border\`, \`$color-text\`
- **Border Radius**: \`$border-radius-sm\`, \`$border-radius-md\`
- **Shadows**: \`$shadow-sm\`, \`$shadow-md\`
- **Transitions**: \`$transition-base\`

## Accessibility

`;

  if (category === 'atoms') {
    content += `This atom component follows basic accessibility guidelines:

- ✅ Semantic HTML structure
- ✅ Color contrast meets RGAA 4.1 standards
- ✅ Reduced motion support via \`prefers-reduced-motion\`
`;
  } else {
    content += `This component follows RGAA 4.1 guidelines:

- ✅ **ARIA Attributes**: Proper \`aria-expanded\`, \`aria-hidden\`, \`aria-controls\`, \`aria-label\`
- ✅ **Keyboard Navigation**: Full support for keyboard interactions
  - \`Enter\`/\`Space\`: Toggle component
  - \`Escape\`: Close component
  - \`Tab\`: Navigate through interactive elements
- ✅ **Focus Management**: Clear focus indicators and logical focus flow
- ✅ **Screen Reader Support**: All interactive elements properly labeled
- ✅ **Reduced Motion**: Respects \`prefers-reduced-motion\` user preference
`;
  }

  content += `
## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Dependencies

`;

  if (category === 'atoms' || category === 'templates') {
    content += `No JavaScript dependencies. Pure CSS component.
`;
  } else {
    content += `- None (Vanilla JavaScript)
- Auto-initialization via \`data-toggle\` attribute
- MutationObserver for dynamic content
`;
  }

  content += `
## Testing

Run tests using Vitest:

\`\`\`bash
npm run test ${kebab}.test.js
\`\`\`

## Storybook

View component documentation and interactive examples:

\`\`\`bash
npm run storybook
\`\`\`

Navigate to: **${categoryCapitalized} > ${pascal}**

## Contributing

1. Follow the [Component Creation Guide](../../docs/COMPONENT-CREATION.md)
2. Ensure all tests pass
3. Update CHANGELOG.md
4. Submit pull request

## License

Cardif Design System - © ${new Date().getFullYear()}
`;

  return content;
}

/**
 * Generate CHANGELOG template
 */
function generateCHANGELOG(componentName) {
  const { pascal } = componentName;
  const today = new Date().toISOString().split('T')[0];
  
  return `# ${pascal} Changelog

All notable changes to the ${pascal} component will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version History Notes

### Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

---

## [Unreleased]

### Added
- Initial component creation
- HTML structure with examples
- SCSS styles following BEM methodology
- JavaScript logic with auto-initialization
- Storybook stories for documentation
- Unit tests with Vitest
- Full accessibility support (ARIA, keyboard navigation)
- MutationObserver for dynamic content

## [0.1.0] - ${today}

### Added
- Initial release of ${pascal} component
- Basic structure and styling
- Core functionality
- Documentation

`;
}

/**
 * Get category description
 */
function getCategoryDescription(category) {
  const descriptions = {
    'atoms': 'Basic building block component. Indivisible, pure UI element with simple styling and minimal logic.',
    'molecules': 'Functional group of atoms. Combines multiple basic elements into a cohesive unit with coordinated behavior.',
    'organisms': 'Complex, relatively autonomous component. Feature-rich with advanced interactions, multiple states, and rich public API.',
    'templates': 'Page structure layout. Defines spatial organization and content zones without specific content.',
    'pages': 'Complete page instance. Template filled with real, specific content for actual use.'
  };
  return descriptions[category] || '';
}

/**
 * Get category characteristics
 */
function getCategoryCharacteristics(category) {
  const characteristics = {
    'atoms': 'Simple, reusable, no dependencies',
    'molecules': 'Combination of atoms, coordinated behavior',
    'organisms': 'Complex logic, rich interactions, multiple states',
    'templates': 'Layout structure, responsive grids, content zones',
    'pages': 'Real content, specific data, complete experience'
  };
  return characteristics[category] || '';
}

/**
 * Display welcome banner
 */
function displayBanner() {
  console.log('\n');
  console.log(colors.bright + colors.blue + '╔════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bright + colors.blue + '║                                                    ║' + colors.reset);
  console.log(colors.bright + colors.blue + '║     ' + colors.green + 'Cardif Design System - Component Generator' + colors.blue + '     ║' + colors.reset);
  console.log(colors.bright + colors.blue + '║                                                    ║' + colors.reset);
  console.log(colors.bright + colors.blue + '╚════════════════════════════════════════════════════╝' + colors.reset);
  console.log('\n');
}

/**
 * Display category selection menu
 */
function displayCategories() {
  console.log(colors.bright + 'Select component category:' + colors.reset);
  console.log('');
  Object.entries(CATEGORIES).forEach(([key, value]) => {
    console.log(`  ${colors.blue}${key}${colors.reset}. ${colors.bright}${value.name.toUpperCase()}${colors.reset}`);
    console.log(`     ${colors.yellow}${value.description}${colors.reset}`);
    console.log('');
  });
}

/**
 * Main execution
 */
export async function main() {
  try {
    displayBanner();

    // Step 1: Select category
    displayCategories();
    const categoryChoice = await question('Enter category number (1-5): ');
    
    if (!CATEGORIES[categoryChoice]) {
      console.log(colors.red + '✗ Invalid category selection' + colors.reset);
      rl.close();
      return;
    }

    const category = CATEGORIES[categoryChoice].name;
    console.log(colors.green + `✓ Selected: ${category}` + colors.reset + '\n');

    // Step 2: Get component name
    const rawName = await question('Enter component name (e.g., "my component" or "my-component" or "MyComponent"): ');
    
    if (!rawName.trim()) {
      console.log(colors.red + '✗ Component name is required' + colors.reset);
      rl.close();
      return;
    }

    const componentName = formatComponentName(rawName);
    console.log(colors.green + `✓ Component name: ${componentName.kebab}` + colors.reset);
    console.log(colors.yellow + `  Pascal case: ${componentName.pascal}` + colors.reset);
    console.log(colors.yellow + `  Camel case: ${componentName.camel}` + colors.reset + '\n');

    // Step 3: Confirm creation
    const confirm = await question(`Create component in ${colors.bright}src/components/${category}/${componentName.kebab}/${colors.reset}? (y/n): `);
    
    if (confirm.toLowerCase() !== 'y') {
      console.log(colors.yellow + 'Component creation cancelled' + colors.reset);
      rl.close();
      return;
    }

    // Step 4: Create directory structure
    const componentDir = path.join(process.cwd(), 'src', 'components', category, componentName.kebab);
    
    if (fs.existsSync(componentDir)) {
      console.log(colors.red + `✗ Component directory already exists: ${componentDir}` + colors.reset);
      rl.close();
      return;
    }

    console.log('\n' + colors.bright + 'Creating component...' + colors.reset + '\n');

    fs.mkdirSync(componentDir, { recursive: true });
    console.log(colors.green + `✓ Created directory: ${componentDir}` + colors.reset);

    // Step 5: Generate files
    const files = [
      { name: `${componentName.kebab}.html`, generator: generateHTML },
      { name: `${componentName.kebab}.scss`, generator: generateSCSS },
      { name: `${componentName.kebab}.js`, generator: generateJS },
      { name: `${componentName.kebab}.stories.js`, generator: generateStories },
      { name: `${componentName.kebab}.test.js`, generator: generateTest },
      { name: 'README.md', generator: generateREADME },
      { name: 'CHANGELOG.md', generator: generateCHANGELOG }
    ];

    for (const file of files) {
      const filePath = path.join(componentDir, file.name);
      const content = file.generator(componentName, category);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(colors.green + `✓ Created: ${file.name}` + colors.reset);
    }

    // Step 6: Success message
    console.log('\n' + colors.bright + colors.green + '═══════════════════════════════════════════════════' + colors.reset);
    console.log(colors.green + '✓ Component created successfully!' + colors.reset);
    console.log(colors.bright + colors.green + '═══════════════════════════════════════════════════' + colors.reset + '\n');

    console.log(colors.bright + 'Component location:' + colors.reset);
    console.log(`  ${colors.blue}${componentDir}${colors.reset}\n`);

    console.log(colors.bright + 'Next steps:' + colors.reset);
    console.log(`  1. Review and customize the generated files`);
    console.log(`  2. Import styles in src/index.js file: ${colors.yellow}import '@${category}/${componentName.kebab}/${componentName.kebab}.scss';${colors.reset}`);
    console.log(`  3. Import js in src/index.js file: ${colors.yellow}import ${componentName.pascal} from '@${category}/${componentName.kebab}/${componentName.kebab}.js';${colors.reset}`);
    console.log(`  4. Run Storybook to see your component: ${colors.yellow}npm run storybook${colors.reset}`);
    console.log(`  5. Run tests: ${colors.yellow}npm run test ${componentName.kebab}.test.js${colors.reset}`);
    console.log(`  6. Update the component based on your requirements\n`);

  } catch (error) {
    console.error(colors.red + '✗ Error: ' + error.message + colors.reset);
  } finally {
    rl.close();
  }
}

// Run the generator only if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
