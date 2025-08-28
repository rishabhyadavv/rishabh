// js/detail.js

(function () {
  const $ = (sel) => document.querySelector(sel);

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

  // Reusable Detail Card component
  function DetailCard({ title, subtitle, summary, responsibilities = [], features = [], tech = [], links = [] }) {
    const featuresList = features.map(f => `<li>${escapeHtml(f)}</li>`).join("");
    const respList = responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join("");
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

        ${features.length ? `
          <section>
            <h3>Key Features</h3>
            <ul class="list">${featuresList}</ul>
          </section>` : ""}

        ${responsibilities.length ? `
          <section>
            <h3>My Responsibilities</h3>
            <ul class="list">${respList}</ul>
          </section>` : ""}

        ${tech.length ? `
          <section>
            <h3>Tech Stack</h3>
            <div class="badges">${techBadges}</div>
          </section>` : ""}

        ${links.length ? `
          <section class="cta-row">
            ${linkButtons}
          </section>` : ""}
      </article>
    `;
  }

  async function load() {
    const slug = getProjectSlug();
    const root = $("#detail-root");
    const titleEl = $("#project-title");

    if (!slug) {
      root.innerHTML = `<p class="error">Missing project parameter. Try opening a project from the homepage.</p>`;
      return;
    }

    try {
      const res = await fetch(`projects/${slug}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load data for "${slug}"`);
      const data = await res.json();

      titleEl.textContent = data.title || "Project";
      root.innerHTML = DetailCard(data);
      document.title = `${data.title} — Project Detail`;
    } catch (e) {
      root.innerHTML = `<p class="error">Could not load project details. (${e.message})</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
