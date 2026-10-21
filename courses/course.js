/* HCM Academy micro-course behavior: step checklist, 3-question check, completion, print.
   Completion is saved only in this browser (localStorage hcm-done), shared with the landing page. */
(function(){
  'use strict';
  var root = document.querySelector('main'), slug = root.dataset.slug, id = 'c-' + slug;
  var store = {
    get: function(k, d){ try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
    set: function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  };
  /* courses stay locked until the pre-assessment has been taken once */
  if (!store.get('hcm-pre', false)){
    document.querySelectorAll('main .part, main .draft, nav.parts').forEach(function(el){ el.hidden = true; });
    document.getElementById('locked').hidden = false;
    return;
  }
  var live = document.getElementById('live');
  function say(t){ live.textContent = ''; setTimeout(function(){ live.textContent = t; }, 30); }

  /* step checklist */
  var boxes = document.querySelectorAll('ol.steps input'), sc = document.getElementById('stepcount');
  function steps(){
    var n = 0; boxes.forEach(function(b){ if (b.checked) n++; });
    sc.textContent = n + ' of ' + boxes.length + ' steps checked off.';
    document.querySelector('a[href="#steps"]').classList.toggle('ok', n === boxes.length);
  }
  boxes.forEach(function(b){ b.addEventListener('change', steps); }); steps();

  /* knowledge check: instant feedback, all 3 right marks the course complete */
  var sets = document.querySelectorAll('.quiz fieldset'), score = document.getElementById('score');
  function grade(){
    var right = 0, answered = 0;
    sets.forEach(function(fs){
      var c = fs.querySelector('input:checked'); if (!c) return; answered++;
      if (c.value === fs.dataset.a) right++;
    });
    if (answered < sets.length){ score.hidden = true; return; }
    score.hidden = false;
    var done = store.get('hcm-done', []);
    if (right === sets.length){
      if (done.indexOf(id) < 0){ done.push(id); store.set('hcm-done', done); }
      score.className = 'score pass';
      score.textContent = '3 of 3. Course complete. It is checked off on your HCM Academy page.';
      document.querySelector('a[href="#check"]').classList.add('ok');
    } else {
      score.className = 'score';
      score.textContent = right + ' of ' + sets.length + '. Review the explanation and pick again. All three right completes the course.';
    }
    say(score.textContent);
  }
  sets.forEach(function(fs){
    fs.querySelectorAll('input').forEach(function(inp){
      inp.addEventListener('change', function(){
        var ok = inp.value === fs.dataset.a, fb = fs.querySelector('.fb');
        fs.querySelectorAll('label').forEach(function(l){ l.classList.remove('right','wrong'); });
        inp.closest('label').classList.add(ok ? 'right' : 'wrong');
        fb.className = 'fb ' + (ok ? 'ok' : 'no');
        fb.innerHTML = '<b>' + (ok ? 'Correct.' : 'Not quite.') + '</b>';
        fb.appendChild(document.createTextNode(ok ? fs.dataset.why : 'Try again. ' + fs.dataset.hint));
        grade();
      });
    });
  });
  if (store.get('hcm-done', []).indexOf(id) > -1){ document.querySelector('a[href="#check"]').classList.add('ok'); }

  /* print the job aid */
  document.querySelectorAll('[data-print]').forEach(function(b){ b.addEventListener('click', function(){
    var quick = b.getAttribute('data-print') === 'quick';
    document.documentElement.classList.toggle('print-quick', quick);
    window.print();
  }); });
  window.addEventListener('afterprint', function(){ document.documentElement.classList.remove('print-quick'); });

  /* highlight the part in view */
  var links = document.querySelectorAll('nav.parts a');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ links.forEach(function(a){ a.setAttribute('aria-current', a.getAttribute('href') === '#' + e.target.id ? 'true' : 'false'); }); } }); }, { rootMargin:'-40% 0px -55% 0px' });
    document.querySelectorAll('.part').forEach(function(p){ io.observe(p); });
  }
})();
