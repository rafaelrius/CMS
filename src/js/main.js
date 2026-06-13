/* Paca Cervera — JS propio (~4 KB, sin librerías)
   1) Menú móvil accesible  2) Reveals con IntersectionObserver
   3) Validación de formularios (newsletter + contacto)
   Formularios: action="#" sin backend aún [PENDIENTE-CLIENTE];
   vía alternativa visible: mailto info@pacacervera.es. */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- menú móvil ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') &&
          !menu.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }

  /* ---------- reveals on-scroll ---------- */
  var revealables = document.querySelectorAll('.reveal, .pase-item');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- validación de formularios ---------- */
  function setInvalid(field, invalid) {
    var box = field.closest('.field, .field-check');
    if (box) box.classList.toggle('invalid', invalid);
    field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
    return !invalid;
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.setAttribute('novalidate', 'novalidate');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;

      form.querySelectorAll('[required]').forEach(function (field) {
        var valid;
        if (field.type === 'checkbox') {
          valid = field.checked;
        } else if (field.type === 'email') {
          valid = validEmail(field.value.trim());
        } else {
          valid = field.value.trim().length > 0;
        }
        if (!setInvalid(field, !valid)) ok = false;
      });

      var status = form.parentElement.querySelector('.form-status');
      if (!status) return;

      if (ok) {
        /* Sin backend todavía: éxito simulado para la demo.
           Al contratar endpoint, enviar aquí con fetch(form.action). */
        form.hidden = true;
        status.innerHTML = '<p role="status">' + form.dataset.success + '</p>';
      } else {
        status.innerHTML = '<p role="alert" class="error-msg" style="display:block">' +
          form.dataset.error + '</p>';
        var first = form.querySelector('.invalid input, .invalid select, .invalid textarea');
        if (first) first.focus();
      }
    });
  });
})();
