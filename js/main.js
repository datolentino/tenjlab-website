// Mobile nav toggle
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }
});

// Back-to-top button (bottom-left so it doesn't clash with the Ask bubble)
(function () {
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = "&uarr;";
  document.body.appendChild(btn);
  function onScroll() { btn.classList.toggle("show", window.scrollY > 500); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
})();

// "Ask the TenJ Lab" assistant: answers from the site's search index (no backend)
(function () {
  var base = location.pathname.indexOf("/publications/") !== -1 ? "../" : "";
  var index = null;

  var launch = document.createElement("button");
  launch.type = "button";
  launch.className = "ask-launch";
  launch.setAttribute("aria-label", "Ask the TenJ Lab");
  launch.innerHTML = "&#128172; Ask";
  document.body.appendChild(launch);

  var panel = document.createElement("div");
  panel.className = "ask-panel";
  panel.innerHTML =
    '<div class="ask-head"><span>Ask the TenJ Lab</span><button class="ask-close" aria-label="Close">&times;</button></div>' +
    '<div class="ask-msgs" id="ask-msgs"></div>' +
    '<form class="ask-form"><input class="ask-in" type="text" placeholder="Ask about our work..." aria-label="Ask a question" /><button class="ask-send" type="submit" aria-label="Send">&#10148;</button></form>';
  document.body.appendChild(panel);

  var msgs = panel.querySelector(".ask-msgs");
  var form = panel.querySelector(".ask-form");
  var input = panel.querySelector(".ask-in");

  function esc(s){ return s.replace(/[&<>]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]; }); }
  function add(htmlStr, who){ var d=document.createElement("div"); d.className="ask-msg ask-"+who; d.innerHTML=htmlStr; msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; }

  function search(v){
    if(!index) return [];
    var terms = v.toLowerCase().split(/\s+/).filter(Boolean);
    return index.map(function(it){
      var t=it.title.toLowerCase(), hay=(it.title+" "+it.text).toLowerCase(), s=0;
      terms.forEach(function(w){ if(t.indexOf(w)>=0) s+=3; if(hay.indexOf(w)>=0) s+=1; });
      return {it:it,s:s};
    }).filter(function(x){return x.s>0;}).sort(function(a,b){return b.s-a.s;}).slice(0,4);
  }

  function respond(q){
    var v = q.toLowerCase();
    if (/\b(hi|hello|hey|kumusta)\b/.test(v)) { add("Hi! Ask me about our research, team, publications, or news, and I'll point you to the right place.", "bot"); return; }
    if (v.indexOf("contact")>=0 || v.indexOf("email")>=0 || v.indexOf("reach")>=0) {
      add('You can reach the lab at <a href="mailto:datolentino@sonnet.ucla.edu">datolentino@sonnet.ucla.edu</a>, or use the <a href="'+base+'contact.html">Contact page</a>.', "bot"); return; }
    if (v.indexOf("join")>=0 || v.indexOf("position")>=0 || v.indexOf("apply")>=0 || v.indexOf("volunteer")>=0) {
      add('We welcome students, collaborators, and community partners. Reach out via the <a href="'+base+'contact.html">Contact page</a>.', "bot"); return; }
    var hits = search(v);
    if (!hits.length) { add("I couldn&rsquo;t find anything on that. Try keywords like &ldquo;diabetes,&rdquo; &ldquo;colonial mentality,&rdquo; &ldquo;team,&rdquo; or &ldquo;publications.&rdquo;", "bot"); return; }
    var html = "Here&rsquo;s what I found:";
    hits.forEach(function(x){ var it=x.it;
      html += '<a class="ask-hit" href="'+base+it.url+'"><span class="ask-hit-type">'+it.type+'</span>'+esc(it.title)+'</a>';
    });
    add(html, "bot");
  }

  var opened = false;
  function open(){
    panel.classList.add("open"); launch.classList.add("hide");
    setTimeout(function(){ input.focus(); }, 60);
    if (!opened) {
      opened = true;
      add("Hi! I&rsquo;m the TenJ Lab assistant. Ask about our research, team, publications, or news.<div class=\"ask-sugg\"><button>diabetes</button><button>colonial mentality</button><button>our team</button><button>contact</button></div>", "bot");
      if (!index) fetch(base+"search-index.json").then(function(r){return r.json();}).then(function(d){ index=d; }).catch(function(){});
    }
  }
  function close(){ panel.classList.remove("open"); launch.classList.remove("hide"); }
  launch.addEventListener("click", open);
  panel.querySelector(".ask-close").addEventListener("click", close);
  form.addEventListener("submit", function(e){ e.preventDefault(); var q=input.value.trim(); if(!q) return; add(esc(q),"user"); input.value=""; setTimeout(function(){ respond(q); }, 150); });
  msgs.addEventListener("click", function(e){ if(e.target.tagName==="BUTTON" && e.target.parentNode.className==="ask-sugg"){ var q=e.target.textContent; add(esc(q),"user"); setTimeout(function(){ respond(q); },150); } });
})();
