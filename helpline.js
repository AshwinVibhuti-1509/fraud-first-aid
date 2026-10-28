'use strict';
/* Additive helper: tel: links only dial on phones. On a laptop/desktop, copy the number
   and say so instead of silently doing nothing. Does not touch app.js or any API call. */
(function () {
  const phone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  if (phone) return;
  let timer;
  function show(message) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      t.setAttribute('role', 'status');
      document.body.append(t);
    }
    t.textContent = message;
    t.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => { t.hidden = true; }, 6000);
  }
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="tel:"]');
    if (!link) return;
    e.preventDefault();
    const number = link.getAttribute('href').slice(4);
    const copied = () => show('Calls open on a phone. Dial ' + number + ' from your mobile. Number copied.');
    const failed = () => show('Calls open on a phone. Dial ' + number + ' from your mobile.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(number).then(copied, failed);
    else failed();
  });
})();
