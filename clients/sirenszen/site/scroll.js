(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      toggle.classList.toggle('is-active');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('nav-open');
        toggle.classList.remove('is-active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var hero = document.getElementById('home');
  if (hero) {
    function updateParallax() {
      if (window.scrollY < window.innerHeight * 1.2) {
        hero.style.backgroundPositionY = 'calc(50% + ' + (window.scrollY * 0.35) + 'px)';
      }
    }
    window.addEventListener('scroll', updateParallax, { passive: true });
  }

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) { obs.observe(el); });
})();
