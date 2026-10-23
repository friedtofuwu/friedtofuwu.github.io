(function () {
  'use strict';

  var root = document.documentElement;
  var language = /^zh(?:-|$)/i.test(root.lang) ? 'zh' : 'en';
  var theme = root.dataset.theme === 'light' ? 'light' : 'dark';
  var primaryNav = document.getElementById('primary-nav');
  var menuButtons = Array.from(document.querySelectorAll('.menu-toggle'));
  var menuOpen = false;
  var activeMenuButton = menuButtons[0] || null;
  var desktop = window.matchMedia('(min-width: 761px)');

  function savePreference(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Keep the in-memory preference when persistence is unavailable.
    }
  }

  function setButtonLabel(button, label) {
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  function updateMenuLabels() {
    var label = language === 'zh'
      ? (menuOpen ? '关闭导航菜单' : '打开导航菜单')
      : (menuOpen ? 'Close navigation menu' : 'Open navigation menu');

    menuButtons.forEach(function (button) {
      setButtonLabel(button, label);
      button.setAttribute('aria-expanded', String(menuOpen));
      if (primaryNav) {
        button.setAttribute('aria-controls', primaryNav.id);
      }
    });
  }

  function updatePreferenceButtons() {
    var languageLabel = language === 'zh' ? '切换到英文' : 'Switch to Simplified Chinese';
    var themeLabel = language === 'zh'
      ? (theme === 'dark' ? '切换到日间模式' : '切换到夜间模式')
      : (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');

    document.querySelectorAll('.language-toggle').forEach(function (button) {
      setButtonLabel(button, languageLabel);
    });
    document.querySelectorAll('.language-label').forEach(function (label) {
      label.textContent = language === 'zh' ? 'EN' : '中';
    });
    document.querySelectorAll('.theme-toggle').forEach(function (button) {
      setButtonLabel(button, themeLabel);
    });
    updateMenuLabels();
  }

  function translateAttribute(selector, source, attribute) {
    document.querySelectorAll(selector).forEach(function (element) {
      element.setAttribute(attribute, element.getAttribute(source + language));
    });
  }

  function applyLanguage() {
    root.lang = language === 'zh' ? 'zh-CN' : 'en';

    document.querySelectorAll('[data-i18n-en][data-i18n-zh]').forEach(function (element) {
      element.textContent = element.getAttribute('data-i18n-' + language);
    });
    translateAttribute('[data-aria-en][data-aria-zh]', 'data-aria-', 'aria-label');
    translateAttribute('[data-alt-en][data-alt-zh]', 'data-alt-', 'alt');
    translateAttribute('meta[data-content-en][data-content-zh]', 'data-content-', 'content');

    document.querySelectorAll('[data-title-en][data-title-zh]').forEach(function (element) {
      var title = element.getAttribute('data-title-' + language);
      if (element === root) {
        document.title = title;
      } else {
        element.setAttribute('title', title);
      }
    });

    updatePreferenceButtons();
  }

  function applyTheme() {
    root.dataset.theme = theme;
    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#090f1d' : '#f7f9fd');
    }
    updatePreferenceButtons();
  }

  function setMenuOpen(open, restoreFocus) {
    menuOpen = Boolean(open && primaryNav && !desktop.matches);
    if (primaryNav) {
      primaryNav.classList.toggle('is-open', menuOpen);
    }
    document.body.classList.toggle('menu-open', menuOpen);
    updateMenuLabels();
    if (restoreFocus && activeMenuButton) {
      activeMenuButton.focus();
    }
  }

  function eventElement(event) {
    return event.target instanceof Element ? event.target : event.target.parentElement;
  }

  function revealHashDetails(hash) {
    if (!hash || hash === '#') {
      return;
    }

    var id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch (error) {
      id = hash.slice(1);
    }
    var target = document.getElementById(id);
    if (!target) {
      return;
    }
    var detail = target.closest('details');
    while (detail) {
      detail.open = true;
      detail = detail.parentElement ? detail.parentElement.closest('details') : null;
    }
  }

  document.querySelectorAll('.language-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      language = language === 'en' ? 'zh' : 'en';
      applyLanguage();
      savePreference('zekun-language', language);
    });
  });

  document.querySelectorAll('.theme-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      savePreference('zekun-theme', theme);
    });
  });

  menuButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeMenuButton = button;
      setMenuOpen(!menuOpen);
    });
  });

  document.addEventListener('click', function (event) {
    var target = eventElement(event);
    if (!target) {
      return;
    }

    if (primaryNav && menuOpen) {
      var clickedMenuButton = menuButtons.some(function (button) {
        return button.contains(target);
      });
      if ((!primaryNav.contains(target) && !clickedMenuButton)
        || (primaryNav.contains(target) && target.closest('a[href]'))) {
        setMenuOpen(false);
      }
    }

    var detailLink = target.closest('a.project-detail-link[href]');
    if (detailLink) {
      var url = new URL(detailLink.href, window.location.href);
      if (url.origin === window.location.origin
        && url.pathname === window.location.pathname
        && url.search === window.location.search) {
        // Let the browser perform native fragment navigation after opening any
        // details element containing its destination.
        revealHashDetails(url.hash);
      }
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menuOpen) {
      event.preventDefault();
      setMenuOpen(false, true);
    }
  });

  function handleViewportChange(event) {
    if (event.matches) {
      setMenuOpen(false);
    }
  }
  if (desktop.addEventListener) {
    desktop.addEventListener('change', handleViewportChange);
  } else if (desktop.addListener) {
    desktop.addListener(handleViewportChange);
  }

  window.addEventListener('hashchange', function () {
    revealHashDetails(window.location.hash);
  });

  window.addEventListener('storage', function (event) {
    if (event.key === 'zekun-language' && (event.newValue === 'en' || event.newValue === 'zh')) {
      language = event.newValue;
      applyLanguage();
    } else if (event.key === 'zekun-theme' && (event.newValue === 'light' || event.newValue === 'dark')) {
      theme = event.newValue;
      applyTheme();
    }
  });

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  applyLanguage();
  applyTheme();
  setMenuOpen(false);
  revealHashDetails(window.location.hash);
}());
