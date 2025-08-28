// js/detail.js
(function () {
  const $id = (id) => document.getElementById(id);

  function getProjectSlug() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("project") || "").toLowerCase();
  }

  function escapeHtml(str = "") {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function DetailCard({ title, subtitle, summary, responsibilities = [], features = [], tech = [], links = [] }) {
    const li = (x) => `<li>${escapeHtml(x)}</li>`;
    const featuresList = features.map(li).join("");
    const respList = responsibilities.map(li).join("");
    const techBadges = tech.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("");
    const linkButtons = links.map(({ label, href }) =>
      `<a class="btn" href="${href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`
    ).join("");

    return `
      <article class="detail-card">
        <header class="detail-card__header">
          <h2>${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="muted">${escapeHtml(subtitle)}</p>` : ""}
        </header>
        ${summary ? `<p class="detail-summary">${escapeHtml(summary)}</p>` : ""}
        ${features.length ? `<section><h3>Key Features</h3><ul class="list">${featuresList}</ul></section>` : ""}
        ${responsibilities.length ? `<section><h3>My Responsibilities</h3><ul class="list">${respList}</ul></section>` : ""}
        ${tech.length ? `<section><h3>Tech Stack</h3><div class="badges">${techBadges}</div></section>` : ""}
        ${links.length ? `<section class="cta-row">${linkButtons}</section>` : ""}
      </article>
    `;
  }

  async function load() {
    const slug = getProjectSlug();
    const root = $id("detail-root");
    const titleEl = $id("project-title");

    if (!root) {
      console.error("[detail] #detail-root not found");
      return;
    }
    if (!titleEl) {
      console.error("[detail] #project-title not found in DOM. Check detail.html.");
      root.innerHTML = `<p class="error">Header target missing. Please ensure <code>id="project-title"</code> exists in detail.html.</p>`;
      return;
    }
    if (!slug) {
      titleEl.textContent = "Project";
      root.innerHTML = `<p class="error">Missing project parameter. Open a project from the homepage.</p>`;
      return;
    }

    try {
      // cache-bust to avoid GH Pages/Browser stale html/js/json
      const res = await fetch(`projects/${slug}.json?v=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load data for "${slug}" (HTTP ${res.status})`);
      const data = await res.json();

      titleEl.textContent = data.title || "Project";
      root.innerHTML = DetailCard(data);
      document.title = `${data.title || "Project"} — Project Detail`;
    } catch (e) {
      console.error("[detail] load error:", e);
      titleEl.textContent = "Project";
      root.innerHTML = `<p class="error">Could not load project details. ${escapeHtml(e.message)}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
