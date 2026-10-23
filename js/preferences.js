(function () {
  'use strict';

  var theme = 'dark';
  var language = 'en';

  // Apply saved preferences before the stylesheet renders the page. Storage can
  // be unavailable in private browsing or when opening the site from disk.
  try {
    var savedTheme = window.localStorage.getItem('zekun-theme');
    var savedLanguage = window.localStorage.getItem('zekun-language');

    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme = savedTheme;
    }
    if (savedLanguage === 'en' || savedLanguage === 'zh') {
      language = savedLanguage;
    }
  } catch (error) {
    // The defaults still work when the browser blocks local storage.
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
}());
