/* RISE SIS — Shared Dashboard Runtime */
(() => {
  const THEME_KEY = "rise-sis-theme";
  const SESSION_KEY = "student-portal-session";
  const esc = v => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  const num = v => { const n=parseFloat(String(v).replace(/[^0-9.-]/g,"")); return Number.isFinite(n)?n:0; };
  const pct = v => Math.max(0,Math.min(100,num(v)));
  const theme = () => localStorage.getItem(THEME_KEY) || "light";

  function applyTheme(t){
    document.documentElement.dataset.theme=t;
    document.body.dataset.theme=t;
    localStorage.setItem(THEME_KEY,t);
    const a=document.querySelector("#rdThemeToggle");
    if(a) a.innerHTML=t==="dark" ? "☀ Light mode" : "☾ Dark mode";
  }

  window.RoleDashboard = {
    mount(config){
      const sidebar=document.querySelector(".role-sidebar");
      const main=document.querySelector(".role-main");
      if(!sidebar || !main || !config?.items?.length) return;
      let active=0;

      const render=()=>{
        const item=config.items[active];

        sidebar.innerHTML=`
          <div class="rd-brand">
            <div class="rd-logo-wrap"><img src="assets/images/branding/logo.png" alt="RISE School College logo"></div>
            <div><strong>RISE SIS</strong><span>${esc(config.role)}</span></div>
          </div>
          <p class="rd-label">${esc(config.title)}</p>
          <nav class="rd-nav">
            ${config.items.map((x,i)=>`
              <button class="rd-link ${i===active?"active":""}" data-index="${i}">
                <span class="rd-nav-icon">${x.icon||"◆"}</span>
                <span class="rd-nav-copy"><strong>${esc(x.label)}</strong><small>${esc(x.valueLabel||"Module")}</small></span>
                <span class="rd-nav-arrow">›</span>
              </button>`).join("")}
          </nav>
          <div class="rd-sidebar-footer">
            <div class="rd-sidebar-theme"><span>Appearance</span><button id="rdThemeToggle" type="button"></button></div>
            <button class="rd-logout" type="button">↪ &nbsp;Log out</button>
          </div>`;

        const data=item.chart||[45,58,52,69,64,79,91];
        const max=Math.max(...data,1);
        const bars=data.map((v,i)=>`
          <div class="rd-bar-wrap"><div class="rd-bar" style="height:${Math.max(8,(v/max)*100)}%"></div><small>${item.chartLabels?.[i]||["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</small></div>`).join("");

        main.innerHTML=`
          <div class="rd-main">
            <header class="rd-top">
              <div class="rd-heading"><div class="rd-eyebrow">${esc(config.role)}</div><h1>${esc(config.title)}</h1><p>Executive workspace • ${esc(item.label)}</p></div>
              <div class="rd-top-actions">
                <button class="rd-icon-button" id="rdNotification" type="button">♢<i></i></button>
                <button class="rd-theme-top" id="rdThemeTop" type="button">☾ Theme</button>
                <div class="rd-profile"><div class="rd-avatar">${esc(config.role).slice(0,2).toUpperCase()}</div><div><strong>${esc(config.role)}</strong><small>Authorized access</small></div></div>
              </div>
            </header>

            <section class="rd-welcome">
              <div class="rd-welcome-copy">
                <div class="rd-kicker">${esc(item.label)}</div>
                <h2>${esc(item.heading||item.label+" overview")}</h2>
                <p>${esc(item.description)}</p>
                <div class="rd-welcome-actions">
                  <button class="rd-primary" id="rdPrimaryAction" type="button">Open workspace →</button>
                  <button class="rd-secondary" id="rdViewActivity" type="button">View activity</button>
                </div>
              </div>
              <div class="rd-score">
                <div class="rd-score-ring" style="--score:${pct(item.score)}"><div><strong>${esc(item.value)}</strong><span>${esc(item.valueLabel)}</span></div></div>
                <small>${esc(item.scoreLabel||"Current performance")}</small>
              </div>
            </section>

            <section class="rd-kpis">
              ${item.cards.map((c,i)=>`<article class="rd-kpi"><div class="rd-kpi-top"><span>${esc(c.label)}</span><b>${i===0?"●":i===1?"↗":"✓"}</b></div><strong>${esc(c.value)}</strong><p>${esc(c.note)}</p></article>`).join("")}
            </section>

            <section class="rd-grid">
              <article class="rd-panel rd-chart-panel">
                <div class="rd-panel-head"><div><p class="rd-kicker">Performance analytics</p><h3>${esc(item.chartTitle)}</h3></div><span class="rd-chip">Last 7 periods</span></div>
                <div class="rd-chart">${bars}</div>
              </article>
              <article class="rd-panel">
                <div class="rd-panel-head"><div><p class="rd-kicker">Quick insight</p><h3>${esc(item.insightTitle)}</h3></div><span class="rd-chip success">${esc(item.pill)}</span></div>
                <div class="rd-insight"><div class="rd-insight-number">${esc(item.insightValue)}</div><p>${esc(item.insight)}</p></div>
                <div class="rd-progress"><div><span>Progress indicator</span><strong>${pct(item.progress)}%</strong></div><div class="rd-progress-track"><span style="width:${pct(item.progress)}%"></span></div></div>
              </article>
            </section>

            <section class="rd-bottom-grid">
              <article class="rd-panel rd-detail">
                <div class="rd-panel-head"><div><p class="rd-kicker">Workspace</p><h3>${esc(item.detailTitle)}</h3></div></div>
                <p>${esc(item.detail)}</p>
                <div class="rd-actions">${item.actions.map((a,i)=>`<button class="rd-action" data-action="${esc(a)}" type="button"><span>${i===0?"↗":i===1?"▣":"◷"}</span>${esc(a)}<b>›</b></button>`).join("")}</div>
              </article>
              <article class="rd-panel" id="rdActivity">
                <div class="rd-panel-head"><div><p class="rd-kicker">Recent activity</p><h3>Latest updates</h3></div><span class="rd-chip">Live</span></div>
                <div class="rd-activity-list">${item.activity.map(a=>`<div class="rd-activity-item"><span class="rd-activity-dot"></span><div><strong>${esc(a[0])}</strong><p>${esc(a[1])}</p></div><small>${esc(a[2])}</small></div>`).join("")}</div>
              </article>
            </section>
            <footer class="rd-footer"><span>RISE School Information System</span><span>Role-based access • ${esc(config.role)}</span></footer>
          </div>`;

        sidebar.querySelectorAll(".rd-link").forEach(b=>b.onclick=()=>{active=Number(b.dataset.index);render();});
        sidebar.querySelector("#rdThemeToggle").onclick=()=>applyTheme(theme()==="dark"?"light":"dark");
        sidebar.querySelector(".rd-logout").onclick=()=>{localStorage.removeItem(SESSION_KEY);location.href="index.html";};
        main.querySelector("#rdThemeTop").onclick=()=>applyTheme(theme()==="dark"?"light":"dark");
        main.querySelector("#rdNotification").onclick=()=>alert("You are up to date. No new critical notifications.");
        main.querySelector("#rdPrimaryAction").onclick=()=>document.querySelector(".rd-detail")?.scrollIntoView({behavior:"smooth"});
        main.querySelector("#rdViewActivity").onclick=()=>document.querySelector("#rdActivity")?.scrollIntoView({behavior:"smooth"});
        main.querySelectorAll(".rd-action").forEach(b=>b.onclick=()=>alert(b.dataset.action+"\n\nThis action is ready for backend/database integration."));
        applyTheme(theme());
      };
      render();
    }
  };
})();