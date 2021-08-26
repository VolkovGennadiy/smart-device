const candidateSelectors = [
    'input',
    'select',
    'textarea',
    'a[href]',
    'button',
    '[tabindex]',
    'audio[controls]',
    'video[controls]',
    '[contenteditable]:not([contenteditable="false"])',
    'details>summary:first-of-type',
    'details',
  ];
  const candidateSelector = candidateSelectors.join(',');
  
  const matches =
    typeof Element === 'undefined'
      ? function () {}
      : Element.prototype.matches ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
  
  const getCandidates = function (el, includeContainer, filter) {
    let candidates = Array.prototype.slice.apply(
      el.querySelectorAll(candidateSelector)
    );
    if (includeContainer && matches.call(el, candidateSelector)) {
      candidates.unshift(el);
    }
    candidates = candidates.filter(filter);
    return candidates;
  };
  
  const isContentEditable = function (node) {
    return node.contentEditable === 'true';
  };
  
  const getTabindex = function (node) {
    const tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);
  
    if (!isNaN(tabindexAttr)) {
      return tabindexAttr;
    }

    if (isContentEditable(node)) {
      return 0;
    }

    if (
      (node.nodeName === 'AUDIO' ||
        node.nodeName === 'VIDEO' ||
        node.nodeName === 'DETAILS') &&
      node.getAttribute('tabindex') === null
    ) {
      return 0;
    }
  
    return node.tabIndex;
  };
  
  const sortOrderedTabbables = function (a, b) {
    return a.tabIndex === b.tabIndex
      ? a.documentOrder - b.documentOrder
      : a.tabIndex - b.tabIndex;
  };
  
  const isInput = function (node) {
    return node.tagName === 'INPUT';
  };
  
  const isHiddenInput = function (node) {
    return isInput(node) && node.type === 'hidden';
  };
  
  const isDetailsWithSummary = function (node) {
    const r =
      node.tagName === 'DETAILS' &&
      Array.prototype.slice
        .apply(node.children)
        .some((child) => child.tagName === 'SUMMARY');
    return r;
  };
  
  const getCheckedRadio = function (nodes, form) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].checked && nodes[i].form === form) {
        return nodes[i];
      }
    }
  };
  
  const isTabbableRadio = function (node) {
    if (!node.name) {
      return true;
    }
    const radioScope = node.form || node.ownerDocument;
  
    const queryRadios = function (name) {
      return radioScope.querySelectorAll(
        'input[type="radio"][name="' + name + '"]'
      );
    };
  
    let radioSet;
    if (
      typeof window !== 'undefined' &&
      typeof window.CSS !== 'undefined' &&
      typeof window.CSS.escape === 'function'
    ) {
      radioSet = queryRadios(window.CSS.escape(node.name));
    } else {
      try {
        radioSet = queryRadios(node.name);
      } catch (err) {
        console.error(
          'Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s',
          err.message
        );
        return false;
      }
    }
  
    const checked = getCheckedRadio(radioSet, node.form);
    return !checked || checked === node;
  };
  
  const isRadio = function (node) {
    return isInput(node) && node.type === 'radio';
  };
  
  const isNonTabbableRadio = function (node) {
    return isRadio(node) && !isTabbableRadio(node);
  };
  
  const isHidden = function (node, displayCheck) {
    if (getComputedStyle(node).visibility === 'hidden') {
      return true;
    }
  
    const isDirectSummary = matches.call(node, 'details>summary:first-of-type');
    const nodeUnderDetails = isDirectSummary ? node.parentElement : node;
    if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
      return true;
    }
    if (!displayCheck || displayCheck === 'full') {
      while (node) {
        if (getComputedStyle(node).display === 'none') {
          return true;
        }
        node = node.parentElement;
      }
    } else if (displayCheck === 'non-zero-area') {
      const { width, height } = node.getBoundingClientRect();
      return width === 0 && height === 0;
    }
  
    return false;
  };
  
  const isDisabledFromFieldset = function (node) {
    if (
      isInput(node) ||
      node.tagName === 'SELECT' ||
      node.tagName === 'TEXTAREA' ||
      node.tagName === 'BUTTON'
    ) {
      let parentNode = node.parentElement;
      while (parentNode) {
        if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
          for (let i = 0; i < parentNode.children.length; i++) {
            const child = parentNode.children.item(i);
            if (child.tagName === 'LEGEND') {
              if (child.contains(node)) {
                return false;
              }
  
              return true;
            }
          }
  
          return true;
        }
  
        parentNode = parentNode.parentElement;
      }
    }

    return false;
  };
  
  const isNodeMatchingSelectorFocusable = function (options, node) {
    if (
      node.disabled ||
      isHiddenInput(node) ||
      isHidden(node, options.displayCheck) ||
      isDetailsWithSummary(node) ||
      isDisabledFromFieldset(node)
    ) {
      return false;
    }
    return true;
  };
  
  const isNodeMatchingSelectorTabbable = function (options, node) {
    if (
      !isNodeMatchingSelectorFocusable(options, node) ||
      isNonTabbableRadio(node) ||
      getTabindex(node) < 0
    ) {
      return false;
    }
    return true;
  };
  
  const tabbable = function (el, options) {
    options = options || {};
  
    const regularTabbables = [];
    const orderedTabbables = [];
  
    const candidates = getCandidates(
      el,
      options.includeContainer,
      isNodeMatchingSelectorTabbable.bind(null, options)
    );
  
    candidates.forEach(function (candidate, i) {
      const candidateTabindex = getTabindex(candidate);
      if (candidateTabindex === 0) {
        regularTabbables.push(candidate);
      } else {
        orderedTabbables.push({
          documentOrder: i,
          tabIndex: candidateTabindex,
          node: candidate,
        });
      }
    });
  
    const tabbableNodes = orderedTabbables
      .sort(sortOrderedTabbables)
      .map((a) => a.node)
      .concat(regularTabbables);
  
    return tabbableNodes;
  };
  
  const focusable = function (el, options) {
    options = options || {};
  
    const candidates = getCandidates(
      el,
      options.includeContainer,
      isNodeMatchingSelectorFocusable.bind(null, options)
    );
  
    return candidates;
  };
  
  const isTabbable = function (node, options) {
    options = options || {};
    if (!node) {
      throw new Error('No node provided');
    }
    if (matches.call(node, candidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorTabbable(options, node);
  };
  
  const focusableCandidateSelector = candidateSelectors
    .concat('iframe')
    .join(',');
  
  const isFocusable = function (node, options) {
    options = options || {};
    if (!node) {
      throw new Error('No node provided');
    }
    if (matches.call(node, focusableCandidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorFocusable(options, node);
  };
  
  export { tabbable, focusable, isTabbable, isFocusable };

const activeFocusTraps = (function () {
  const trapQueue = [];
  return {
    activateTrap(trap) {
      if (trapQueue.length > 0) {
        const activeTrap = trapQueue[trapQueue.length - 1];
        if (activeTrap !== trap) {
          activeTrap.pause();
        }
      }

      const trapIndex = trapQueue.indexOf(trap);
      if (trapIndex === -1) {
        trapQueue.push(trap);
      } else {
        trapQueue.splice(trapIndex, 1);
        trapQueue.push(trap);
      }
    },

    deactivateTrap(trap) {
      const trapIndex = trapQueue.indexOf(trap);
      if (trapIndex !== -1) {
        trapQueue.splice(trapIndex, 1);
      }

      if (trapQueue.length > 0) {
        trapQueue[trapQueue.length - 1].unpause();
      }
    },
  };
})();

const isSelectableInput = function (node) {
  return (
    node.tagName &&
    node.tagName.toLowerCase() === 'input' &&
    typeof node.select === 'function'
  );
};

const isEscapeEvent = function (e) {
  return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
};

const isTabEvent = function (e) {
  return e.key === 'Tab' || e.keyCode === 9;
};

const delay = function (fn) {
  return setTimeout(fn, 0);
};

const findIndex = function (arr, fn) {
  let idx = -1;

  arr.every(function (value, i) {
    if (fn(value)) {
      idx = i;
      return false;
    }

    return true;
  });

  return idx;
};

/**
 * Get an option's value when it could be a plain value, or a handler that provides
 *  the value.
 * @param {*} value Option's value to check.
 * @param {...*} [params] Any parameters to pass to the handler, if `value` is a function.
 * @returns {*} The `value`, or the handler's returned value.
 */
const valueOrHandler = function (value, ...params) {
  return typeof value === 'function' ? value(...params) : value;
};

const createFocusTrap = function (elements, userOptions) {
  const doc = document;

  const config = {
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    delayInitialFocus: true,
    ...userOptions,
  };

  const state = {

    containers: [],


    tabbableGroups: [],

    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,


    delayInitialFocusTimer: undefined,
  };

  let trap; 

  const getOption = (configOverrideOptions, optionName, configOptionName) => {
    return configOverrideOptions &&
      configOverrideOptions[optionName] !== undefined
      ? configOverrideOptions[optionName]
      : config[configOptionName || optionName];
  };

  const containersContain = function (element) {
    return state.containers.some((container) => container.contains(element));
  };

  const getNodeForOption = function (optionName) {
    const optionValue = config[optionName];
    if (!optionValue) {
      return null;
    }

    let node = optionValue;

    if (typeof optionValue === 'string') {
      node = doc.querySelector(optionValue);
      if (!node) {
        throw new Error(`\`${optionName}\` refers to no known node`);
      }
    }

    if (typeof optionValue === 'function') {
      node = optionValue();
      if (!node) {
        throw new Error(`\`${optionName}\` did not return a node`);
      }
    }

    return node;
  };

  const getInitialFocusNode = function () {
    let node;

    if (getOption({}, 'initialFocus') === false) {
      return false;
    }

    if (getNodeForOption('initialFocus') !== null) {
      node = getNodeForOption('initialFocus');
    } else if (containersContain(doc.activeElement)) {
      node = doc.activeElement;
    } else {
      const firstTabbableGroup = state.tabbableGroups[0];
      const firstTabbableNode =
        firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
      node = firstTabbableNode || getNodeForOption('fallbackFocus');
    }

    if (!node) {
      throw new Error(
        'Your focus-trap needs to have at least one focusable element'
      );
    }

    return node;
  };

  const updateTabbableNodes = function () {
    state.tabbableGroups = state.containers
      .map((container) => {
        const tabbableNodes = tabbable(container);

        if (tabbableNodes.length > 0) {
          return {
            container,
            firstTabbableNode: tabbableNodes[0],
            lastTabbableNode: tabbableNodes[tabbableNodes.length - 1],
          };
        }

        return undefined;
      })
      .filter((group) => !!group);


    if (
      state.tabbableGroups.length <= 0 &&
      !getNodeForOption('fallbackFocus')
    ) {
      throw new Error(
        'Your focus-trap must have at least one container with at least one tabbable node in it at all times'
      );
    }
  };

  const tryFocus = function (node) {
    if (node === false) {
      return;
    }

    if (node === doc.activeElement) {
      return;
    }

    if (!node || !node.focus) {
      tryFocus(getInitialFocusNode());
      return;
    }

    node.focus({ preventScroll: !!config.preventScroll });
    state.mostRecentlyFocusedNode = node;

    if (isSelectableInput(node)) {
      node.select();
    }
  };

  const getReturnFocusNode = function (previousActiveElement) {
    const node = getNodeForOption('setReturnFocus');

    return node ? node : previousActiveElement;
  };


  const checkPointerDown = function (e) {
    if (containersContain(e.target)) {
      return;
    }

    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      trap.deactivate({
        returnFocus: config.returnFocusOnDeactivate && !isFocusable(e.target),
      });
      return;
    }

    if (valueOrHandler(config.allowOutsideClick, e)) {
      return;
    }

    e.preventDefault();
  };

  const checkFocusIn = function (e) {
    const targetContained = containersContain(e.target);
    if (targetContained || e.target instanceof Document) {
      if (targetContained) {
        state.mostRecentlyFocusedNode = e.target;
      }
    } else {
      e.stopImmediatePropagation();
      tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
    }
  };

  const checkTab = function (e) {
    updateTabbableNodes();

    let destinationNode = null;

    if (state.tabbableGroups.length > 0) {
      const containerIndex = findIndex(state.tabbableGroups, ({ container }) =>
        container.contains(e.target)
      );

      if (containerIndex < 0) {
        if (e.shiftKey) {
          destinationNode =
            state.tabbableGroups[state.tabbableGroups.length - 1]
              .lastTabbableNode;
        } else {
          destinationNode = state.tabbableGroups[0].firstTabbableNode;
        }
      } else if (e.shiftKey) {
        let startOfGroupIndex = findIndex(
          state.tabbableGroups,
          ({ firstTabbableNode }) => e.target === firstTabbableNode
        );

        if (
          startOfGroupIndex < 0 &&
          state.tabbableGroups[containerIndex].container === e.target
        ) {
          startOfGroupIndex = containerIndex;
        }

        if (startOfGroupIndex >= 0) {
          const destinationGroupIndex =
            startOfGroupIndex === 0
              ? state.tabbableGroups.length - 1
              : startOfGroupIndex - 1;

          const destinationGroup = state.tabbableGroups[destinationGroupIndex];
          destinationNode = destinationGroup.lastTabbableNode;
        }
      } else {
        let lastOfGroupIndex = findIndex(
          state.tabbableGroups,
          ({ lastTabbableNode }) => e.target === lastTabbableNode
        );

        if (
          lastOfGroupIndex < 0 &&
          state.tabbableGroups[containerIndex].container === e.target
        ) {
          lastOfGroupIndex = containerIndex;
        }

        if (lastOfGroupIndex >= 0) {
          const destinationGroupIndex =
            lastOfGroupIndex === state.tabbableGroups.length - 1
              ? 0
              : lastOfGroupIndex + 1;

          const destinationGroup = state.tabbableGroups[destinationGroupIndex];
          destinationNode = destinationGroup.firstTabbableNode;
        }
      }
    } else {
      destinationNode = getNodeForOption('fallbackFocus');
    }

    if (destinationNode) {
      e.preventDefault();
      tryFocus(destinationNode);
    }
  };

  const checkKey = function (e) {
    if (
      isEscapeEvent(e) &&
      valueOrHandler(config.escapeDeactivates) !== false
    ) {
      e.preventDefault();
      trap.deactivate();
      return;
    }

    if (isTabEvent(e)) {
      checkTab(e);
      return;
    }
  };

  const checkClick = function (e) {
    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      return;
    }

    if (containersContain(e.target)) {
      return;
    }

    if (valueOrHandler(config.allowOutsideClick, e)) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
  };

  const addListeners = function () {
    if (!state.active) {
      return;
    }

    activeFocusTraps.activateTrap(trap);

    state.delayInitialFocusTimer = config.delayInitialFocus
      ? delay(function () {
          tryFocus(getInitialFocusNode());
        })
      : tryFocus(getInitialFocusNode());

    doc.addEventListener('focusin', checkFocusIn, true);
    doc.addEventListener('mousedown', checkPointerDown, {
      capture: true,
      passive: false,
    });
    doc.addEventListener('touchstart', checkPointerDown, {
      capture: true,
      passive: false,
    });
    doc.addEventListener('click', checkClick, {
      capture: true,
      passive: false,
    });
    doc.addEventListener('keydown', checkKey, {
      capture: true,
      passive: false,
    });

    return trap;
  };

  const removeListeners = function () {
    if (!state.active) {
      return;
    }

    doc.removeEventListener('focusin', checkFocusIn, true);
    doc.removeEventListener('mousedown', checkPointerDown, true);
    doc.removeEventListener('touchstart', checkPointerDown, true);
    doc.removeEventListener('click', checkClick, true);
    doc.removeEventListener('keydown', checkKey, true);

    return trap;
  };

  trap = {
    activate(activateOptions) {
      if (state.active) {
        return this;
      }

      const onActivate = getOption(activateOptions, 'onActivate');
      const onPostActivate = getOption(activateOptions, 'onPostActivate');
      const checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');

      if (!checkCanFocusTrap) {
        updateTabbableNodes();
      }

      state.active = true;
      state.paused = false;
      state.nodeFocusedBeforeActivation = doc.activeElement;

      if (onActivate) {
        onActivate();
      }

      const finishActivation = () => {
        if (checkCanFocusTrap) {
          updateTabbableNodes();
        }
        addListeners();
        if (onPostActivate) {
          onPostActivate();
        }
      };

      if (checkCanFocusTrap) {
        checkCanFocusTrap(state.containers.concat()).then(
          finishActivation,
          finishActivation
        );
        return this;
      }

      finishActivation();
      return this;
    },

    deactivate(deactivateOptions) {
      if (!state.active) {
        return this;
      }

      clearTimeout(state.delayInitialFocusTimer);
      state.delayInitialFocusTimer = undefined;

      removeListeners();
      state.active = false;
      state.paused = false;

      activeFocusTraps.deactivateTrap(trap);

      const onDeactivate = getOption(deactivateOptions, 'onDeactivate');
      const onPostDeactivate = getOption(deactivateOptions, 'onPostDeactivate');
      const checkCanReturnFocus = getOption(
        deactivateOptions,
        'checkCanReturnFocus'
      );

      if (onDeactivate) {
        onDeactivate();
      }

      const returnFocus = getOption(
        deactivateOptions,
        'returnFocus',
        'returnFocusOnDeactivate'
      );

      const finishDeactivation = () => {
        delay(() => {
          if (returnFocus) {
            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
          }
          if (onPostDeactivate) {
            onPostDeactivate();
          }
        });
      };

      if (returnFocus && checkCanReturnFocus) {
        checkCanReturnFocus(
          getReturnFocusNode(state.nodeFocusedBeforeActivation)
        ).then(finishDeactivation, finishDeactivation);
        return this;
      }

      finishDeactivation();
      return this;
    },

    pause() {
      if (state.paused || !state.active) {
        return this;
      }

      state.paused = true;
      removeListeners();

      return this;
    },

    unpause() {
      if (!state.paused || !state.active) {
        return this;
      }

      state.paused = false;
      updateTabbableNodes();
      addListeners();

      return this;
    },

    updateContainerElements(containerElements) {
      const elementsAsArray = [].concat(containerElements).filter(Boolean);

      state.containers = elementsAsArray.map((element) =>
        typeof element === 'string' ? doc.querySelector(element) : element
      );

      if (state.active) {
        updateTabbableNodes();
      }

      return this;
    },
  };

  trap.updateContainerElements(elements);

  return trap;
};

export { createFocusTrap };