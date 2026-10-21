/* HCM Academy pre-assessment and final assessment pages.
   Questions come from assets/assessments.js. Results are saved only in this browser:
   hcm-pre (pre-assessment taken), hcm-final (final passed). The landing page writes
   hcm-total (number of courses) so the final can tell when every course is complete. */
(function(){
  'use strict';
  var BANK = window.HCM_ASSESS, main = document.querySelector('main'), kind = main.dataset.kind;
  var list = kind === 'pre' ? BANK.pre : BANK.final, PASS = BANK.pass, home = '../../index.html';
  var store = {
    get: function(k, d){ try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
    set: function(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  };
  var form = document.getElementById('aform'), qs = document.getElementById('qs'), err = document.getElementById('aerr'),
      qsec = document.getElementById('questions'), res = document.getElementById('results');

  function shuffle(a){ for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* questions are grouped under a heading for each topic; answer order is shuffled each time */
  function build(){
    qs.innerHTML = ''; err.textContent = ''; var last = null;
    list.forEach(function(q, i){
      if (q.topic !== last){ var h = document.createElement('h3'); h.className = 'tg'; h.textContent = BANK.topics[q.topic] || q.topic; qs.appendChild(h); last = q.topic; }
      var fs = document.createElement('fieldset'), lg = document.createElement('legend');
      lg.innerHTML = '<span class="qn"></span>'; lg.firstChild.textContent = 'Q' + (i + 1);
      lg.appendChild(document.createTextNode(q.q));
      fs.appendChild(lg); fs.dataset.topic = q.topic;
      shuffle(q.o.map(function(o, j){ return j; })).forEach(function(j){
        var l = document.createElement('label'), r = document.createElement('input');
        r.type = 'radio'; r.name = 'q' + i; r.value = j === q.a ? '1' : '0';
        l.appendChild(r); l.appendChild(document.createTextNode(q.o[j])); fs.appendChild(l);
      });
      qs.appendChild(fs);
    });
    qsec.hidden = false; res.hidden = true;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var sets = qs.querySelectorAll('fieldset'), right = 0, missed = [], left = 0;
    sets.forEach(function(fs){
      var c = fs.querySelector('input:checked');
      if (!c) left++; else if (c.value === '1') right++; else if (missed.indexOf(fs.dataset.topic) < 0) missed.push(fs.dataset.topic);
    });
    if (left){
      err.textContent = 'Answer all ' + sets.length + ' questions to submit (' + left + ' left).';
      var first = qs.querySelector('fieldset:not(:has(input:checked)) input'); if (first) first.focus();
      return;
    }
    var pct = Math.round(right / sets.length * 100), ok = right / sets.length >= PASS, msg;
    if (kind === 'pre'){
      store.set('hcm-pre', true);
      msg = right + ' of ' + sets.length + ' correct. ' + (missed.length ? 'These topics are a good place to start:' : 'You know the basics across every topic. Take the courses in any order.');
    } else {
      if (ok) store.set('hcm-final', true);
      msg = pct + '%. ' + right + ' of ' + sets.length + ' correct. ' + (ok ? 'You passed. HCM Academy is complete.' : 'You need ' + Math.round(PASS * 100) + '% to complete HCM Academy. Review these topics, then retake it:');
    }
    var score = document.getElementById('ascore'), tl = document.getElementById('atopics'), acts = document.getElementById('aacts');
    score.textContent = msg;
    score.className = 'score' + ((kind === 'pre' ? !missed.length : ok) ? ' pass' : '');
    tl.innerHTML = ''; acts.innerHTML = '';
    if (!(kind === 'final' && ok)) missed.forEach(function(m){
      var li = document.createElement('li'), a = document.createElement('a');
      a.href = home + '#' + m; a.textContent = BANK.topics[m] || m; li.appendChild(a); tl.appendChild(li);
    });
    tl.hidden = !tl.children.length;
    var go = document.createElement('a'); go.className = 'btn'; go.href = home; go.textContent = kind === 'pre' ? 'Start learning' : 'Back to all courses';
    acts.appendChild(go);
    if (kind === 'final' && !ok){
      var again = document.createElement('button'); again.type = 'button'; again.className = 'btn ghost'; again.textContent = 'Retake the final assessment';
      again.addEventListener('click', function(){ build(); window.scrollTo(0, qsec.offsetTop); qs.querySelector('input').focus(); });
      acts.appendChild(again);
    }
    qsec.hidden = true; res.hidden = false; res.focus();
  });

  /* the final unlocks when every course is complete */
  if (kind === 'final'){
    var total = store.get('hcm-total', 0), done = store.get('hcm-done', []);
    if (!total || done.length < total){ qsec.hidden = true; document.getElementById('locked').hidden = false; return; }
  }
  build();
})();
