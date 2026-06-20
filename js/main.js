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

  // Words to ignore when matching (question words, generic site words, and the
  // category trigger words that are handled by intent detection instead).
  var STOP = ("a an the and or of to in on for is are was were be been who whom whose what when where why how which "
    + "do does did can could will would should may might must i me my we us our you your they them their this that these those "
    + "it its as at by with from about tell show list give find search please help want know more info information page "
    + "lab labs team teams member members person people staff group everyone student students faculty researcher researchers "
    + "scientist scientists mentee mentees colleague colleagues leadership "
    + "publication publications paper papers article articles study studies research published journal finding findings work works "
    + "news latest recent update updates event events conference conferences defense defence defended graduate graduated graduation "
    + "award awards happening "
    + "project projects grant grants funding ongoing current").split(" ");

  function score(pool, terms){
    if(!terms.length) return [];
    return pool.map(function(it){
      var t=it.title.toLowerCase(), hay=(it.title+" "+it.text).toLowerCase(), s=0;
      terms.forEach(function(w){ if(t.indexOf(w)>=0) s+=3; if(hay.indexOf(w)>=0) s+=1; });
      return {it:it,s:s};
    }).filter(function(x){return x.s>0;}).sort(function(a,b){return b.s-a.s;});
  }

  function respond(q){
    if(!index){ add("One moment, I&rsquo;m still loading. Please ask again in a second.", "bot"); return; }
    var v = q.toLowerCase();

    if (/\b(hi|hello|hey|kumusta|hiya)\b/.test(v)) {
      add("Hi! Ask me about our team, research, publications, or news, and I&rsquo;ll point you to the right place.", "bot"); return; }
    if (/\b(contact|email|e-mail|reach|phone|address)\b/.test(v)) {
      add('You can reach the lab at <a href="mailto:datolentino@sonnet.ucla.edu">datolentino@sonnet.ucla.edu</a>, or use the <a href="'+base+'contact.html">Contact page</a>.', "bot"); return; }
    if (/\b(join|apply|position|positions|opening|openings|volunteer|hiring|collaborat)\b/.test(v)) {
      add('We welcome students, collaborators, and community partners. Reach out through the <a href="'+base+'contact.html">Contact page</a>.', "bot"); return; }

    // Detect what KIND of thing is being asked about
    var intent = null, lead = "Here&rsquo;s what I found:";
    if (/\b(member|members|team|teams|people|who|student|students|staff|faculty|researcher|researchers|scientist|scientists|mentee|mentees|leadership|colleague|colleagues)\b/.test(v)) {
      intent = "Team"; lead = "Here are our team members:";
    } else if (/\b(publication|publications|paper|papers|article|articles|study|studies|research|published|journal|finding|findings)\b/.test(v)) {
      intent = "Publication"; lead = "Here are some of our publications:";
    } else if (/\b(news|latest|recent|update|updates|event|events|conference|conferences|defense|defence|defended|graduate|graduated|graduation|award|awards|happening)\b/.test(v)) {
      intent = "Lab News"; lead = "Here&rsquo;s some recent lab news:";
    } else if (/\b(project|projects|grant|grants|funding|ongoing)\b/.test(v)) {
      intent = "Project"; lead = "Here are our projects:";
    }

    var terms = v.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(function(w){ return w.length > 2 && STOP.indexOf(w) < 0; });

    var hits;
    if (intent) {
      var pool = index.filter(function(it){ return it.type === intent; });
      hits = score(pool, terms);
      if (hits.length) { lead = "Here&rsquo;s what I found:"; }
      else { hits = pool.map(function(it){ return { it: it }; }); }  // representative list
    } else {
      hits = score(index, terms);
    }

    hits = hits.slice(0, intent === "Team" ? 25 : 6);
    if (!hits.length) {
      add("I couldn&rsquo;t find anything on that. Try asking about our <strong>team</strong>, <strong>publications</strong>, <strong>projects</strong>, or <strong>news</strong>, or use keywords like &ldquo;diabetes&rdquo; or &ldquo;colonial mentality.&rdquo;", "bot"); return; }

    var html = lead;
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
