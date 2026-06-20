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

// "Ask the TenJ Lab" assistant: guided, tap-a-bubble navigation over the site's
// content (search index). No backend. A text box is available as a secondary option.
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
    '<form class="ask-form"><input class="ask-in" type="text" placeholder="Or type your own question..." aria-label="Ask a question" /><button class="ask-send" type="submit" aria-label="Send">&#10148;</button></form>';
  document.body.appendChild(panel);

  var msgs = panel.querySelector(".ask-msgs");
  var form = panel.querySelector(".ask-form");
  var input = panel.querySelector(".ask-in");

  function esc(s){ return s.replace(/[&<>]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;"}[c]; }); }
  function add(htmlStr, who){ var d=document.createElement("div"); d.className="ask-msg ask-"+who; d.innerHTML=htmlStr; msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; }
  function chipRow(items){ return '<div class="ask-sugg">'+items.map(function(c){ return '<button type="button" data-act="'+c[1]+'">'+c[0]+'</button>'; }).join("")+'</div>'; }
  function hitLink(it){ return '<a class="ask-hit" href="'+base+it.url+'"><span class="ask-hit-type">'+it.type+'</span>'+esc(it.title)+'</a>'; }

  var MENU = [
    ["👥 Meet the team", "team"],
    ["📄 Browse publications", "pubs"],
    ["📰 Latest news", "news"],
    ["🔬 Our projects", "projects"],
    ["🤝 Get involved", "involved"],
    ["✉️ Contact us", "contact"]
  ];
  var BACK = ["← Back to menu", "menu"];

  function botMenu(prefix){ add((prefix || "") + chipRow(MENU), "bot"); }

  function listType(type, lead, chips, limit){
    var pool = index.filter(function(it){ return it.type === type; });
    if (limit) pool = pool.slice(0, limit);
    var html = lead; pool.forEach(function(it){ html += hitLink(it); });
    add(html + chipRow(chips), "bot");
  }

  // Words to ignore when matching typed questions
  var STOP = ("a an the and or of to in on for is are was were be been who whom whose what when where why how which "
    + "do does did can could will would should may might must i me my we us our you your they them their this that these those "
    + "it its as at by with from about tell show list give find search please help want know more info information page "
    + "lab labs team teams member members person people staff group everyone student students faculty researcher researchers "
    + "scientist scientists mentee mentees colleague colleagues leadership "
    + "publication publications paper papers article articles study studies research published journal finding findings work works "
    + "news latest recent update updates event events conference conferences defense defence defended graduate graduated graduation "
    + "award awards happening project projects grant grants funding ongoing current").split(" ");

  function score(pool, terms){
    if(!terms.length) return [];
    return pool.map(function(it){
      var t=it.title.toLowerCase(), hay=(it.title+" "+it.text).toLowerCase(), s=0;
      terms.forEach(function(w){ if(t.indexOf(w)>=0) s+=3; if(hay.indexOf(w)>=0) s+=1; });
      return {it:it,s:s};
    }).filter(function(x){return x.s>0;}).sort(function(a,b){return b.s-a.s;});
  }

  function doSearch(query, type, chips){
    var pool = type ? index.filter(function(it){ return it.type === type; }) : index;
    var terms = query.toLowerCase().split(/\s+/);
    var hits = score(pool, terms).slice(0, 6);
    var html = hits.length ? "Here&rsquo;s what I found:" : "I couldn&rsquo;t find anything on that topic just yet.";
    hits.forEach(function(x){ html += hitLink(x.it); });
    add(html + chipRow(chips), "bot");
  }

  // Bubble navigation
  function handleAction(act){
    if (!index && act !== "contact" && act !== "involved") { add("One moment, I&rsquo;m still loading. Please tap again in a second.", "bot"); return; }
    if (act === "menu") { botMenu("What would you like to know?"); return; }
    if (act === "team") { listType("Team", "Here are our team members. Tap a name to read their bio:", [["📄 Publications", "pubs"], ["🔬 Projects", "projects"], BACK]); return; }
    if (act === "pubs") {
      add("Which topic interests you?" + chipRow([
        ["Filipino American health", "q:filipino"],
        ["Colonial mentality", "q:colonial mentality"],
        ["Asian American diabetes", "q:asian american"],
        ["Technology & wearables", "q:technology wearable digital informatics"],
        ["Social media & education", "q:tiktok social media education self-management"],
        ["See all publications", "link:publications.html"],
        BACK
      ]), "bot"); return;
    }
    if (act === "news") { listType("Lab News", "Here&rsquo;s the latest from the lab:", [["See all lab news", "link:news.html"], BACK], 5); return; }
    if (act === "projects") { listType("Project", "Here are our current projects:", [["📄 Related publications", "pubs"], BACK]); return; }
    if (act === "involved") { add('We welcome students, collaborators, and community partners who share our commitment to health equity. The best way to start is to reach out.' + chipRow([["✉️ Contact us", "contact"], ["👥 Meet the team", "team"], BACK]), "bot"); return; }
    if (act === "contact") { add('You can reach the lab at <a href="mailto:datolentino@sonnet.ucla.edu">datolentino@sonnet.ucla.edu</a>, or use the <a href="'+base+'contact.html">Contact page</a>.' + chipRow([["🤝 Get involved", "involved"], BACK]), "bot"); return; }
    if (act.indexOf("q:") === 0) { doSearch(act.slice(2), "Publication", [["Other topics", "pubs"], BACK]); return; }
    if (act.indexOf("link:") === 0) { window.location.href = base + act.slice(5); return; }
    botMenu("What would you like to know?");
  }

  // Typed questions (secondary path): detect intent, then answer + offer the menu
  function respond(q){
    if(!index){ add("One moment, I&rsquo;m still loading. Please ask again in a second.", "bot"); return; }
    var v = q.toLowerCase();
    if (/\b(hi|hello|hey|kumusta|hiya)\b/.test(v)) { botMenu("Hi! What would you like to know?"); return; }
    if (/\b(contact|email|e-mail|reach|phone|address)\b/.test(v)) { handleAction("contact"); return; }
    if (/\b(join|apply|position|positions|opening|openings|volunteer|hiring|collaborat)\b/.test(v)) { handleAction("involved"); return; }

    var intent = null;
    if (/\b(member|members|team|teams|people|who|student|students|staff|faculty|researcher|researchers|scientist|scientists|mentee|mentees|leadership|colleague|colleagues)\b/.test(v)) intent = "Team";
    else if (/\b(publication|publications|paper|papers|article|articles|study|studies|research|published|journal|finding|findings)\b/.test(v)) intent = "Publication";
    else if (/\b(news|latest|recent|update|updates|event|events|conference|conferences|defense|defence|defended|graduate|graduated|graduation|award|awards|happening)\b/.test(v)) intent = "Lab News";
    else if (/\b(project|projects|grant|grants|funding|ongoing)\b/.test(v)) intent = "Project";

    var terms = v.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(function(w){ return w.length > 2 && STOP.indexOf(w) < 0; });
    var hits;
    if (intent) {
      var pool = index.filter(function(it){ return it.type === intent; });
      hits = score(pool, terms);
      if (!hits.length) hits = pool.map(function(it){ return { it: it }; });
    } else {
      hits = score(index, terms);
    }
    hits = hits.slice(0, intent === "Team" ? 25 : 6);
    if (!hits.length) { botMenu("I couldn&rsquo;t find that. Here are some things I can help with:"); return; }
    var html = "Here&rsquo;s what I found:";
    hits.forEach(function(x){ html += hitLink(x.it); });
    add(html + chipRow([BACK]), "bot");
  }

  var opened = false;
  function open(){
    panel.classList.add("open"); launch.classList.add("hide");
    if (!opened) {
      opened = true;
      if (!index) fetch(base+"search-index.json").then(function(r){return r.json();}).then(function(d){ index=d; }).catch(function(){});
      botMenu("Hi! I&rsquo;m the TenJ Lab assistant. What would you like to know? Tap an option below.");
    }
  }
  function close(){ panel.classList.remove("open"); launch.classList.remove("hide"); }
  launch.addEventListener("click", open);
  panel.querySelector(".ask-close").addEventListener("click", close);
  form.addEventListener("submit", function(e){ e.preventDefault(); var q=input.value.trim(); if(!q) return; add(esc(q),"user"); input.value=""; setTimeout(function(){ respond(q); }, 150); });
  msgs.addEventListener("click", function(e){
    var b = e.target && e.target.closest ? e.target.closest("button[data-act]") : null;
    if (!b) return;
    var act = b.getAttribute("data-act");
    if (act !== "menu" && act.indexOf("link:") !== 0) add(esc(b.textContent.replace(/^[^\w]+/, "").trim()), "user");
    setTimeout(function(){ handleAction(act); }, 120);
  });
})();
