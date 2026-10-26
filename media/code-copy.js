// Copy button on code blocks for Markdown Preview Enhanced
(function () {
  'use strict';

  var RESET_MS = 1500;

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(area);
      return ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  function addButton(pre) {
    var code = pre.querySelector(':scope > code');
    if (!code || pre.querySelector(':scope > .mpe-code-copy')) {
      return;
    }
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mpe-code-copy';
    button.textContent = 'Copy';
    button.title = 'Copy code';
    pre.classList.add('mpe-code-copy-host');
    pre.appendChild(button);
  }

  function scan(root) {
    var blocks = root.querySelectorAll('pre');
    for (var i = 0; i < blocks.length; i++) {
      addButton(blocks[i]);
    }
  }

  // Event delegation: the preview re-renders its content on every update.
  document.addEventListener('click', function (e) {
    var button =
      e.target && e.target.closest && e.target.closest('.mpe-code-copy');
    if (!button) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    var code = button.parentElement.querySelector(':scope > code');
    if (!code) {
      return;
    }
    copyText(code.textContent || '').then(
      function () {
        button.textContent = 'Copied!';
        button.classList.add('mpe-code-copy-done');
        setTimeout(function () {
          button.textContent = 'Copy';
          button.classList.remove('mpe-code-copy-done');
        }, RESET_MS);
      },
      function () {
        button.textContent = 'Failed';
        setTimeout(function () {
          button.textContent = 'Copy';
        }, RESET_MS);
      },
    );
  });

  var pending = false;
  function schedule() {
    if (pending) {
      return;
    }
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      scan(document);
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  scan(document);
})();
