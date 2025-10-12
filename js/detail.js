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

  function getCurrentLanguage() {
    return document.body.getAttribute('data-language') || 'en';
  }

  function getTranslatedText(obj, key, fallback = '') {
    const currentLang = getCurrentLanguage();
    if (currentLang === 'de' && obj[`${key}_de`]) {
      return obj[`${key}_de`];
    }
    return obj[key] || fallback;
  }

  function DetailCard({ title, subtitle, summary, responsibilities = [], features = [], tech = [], links = [], features_de = [], responsibilities_de = [], links_de = [], title_de, subtitle_de, summary_de }) {
    const currentLang = getCurrentLanguage();
    const li = (x) => `<li>${escapeHtml(x)}</li>`;
    
    // Get translated arrays
    const translatedFeatures = currentLang === 'de' && features_de ? features_de : features;
    const translatedResponsibilities = currentLang === 'de' && responsibilities_de ? responsibilities_de : responsibilities;
    const translatedLinks = currentLang === 'de' && links_de ? links_de : links;
    
    const featuresList = translatedFeatures.map(li).join("");
    const respList = translatedResponsibilities.map(li).join("");
    const techBadges = tech.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("");
    const linkButtons = translatedLinks.map(({ label, href }) =>
      `<a class="btn" href="${href}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`
    ).join("");

    // Section headers based on language
    const sectionHeaders = {
      en: {
        features: "Key Features",
        responsibilities: "My Responsibilities", 
        tech: "Tech Stack"
      },
      de: {
        features: "Wichtige Funktionen",
        responsibilities: "Meine Verantwortlichkeiten",
        tech: "Tech Stack"
      }
    };

    return `
      <article class="detail-card">
        <header class="detail-card__header">
          <h2>${escapeHtml(getTranslatedText({title, title_de}, 'title', title))}</h2>
          ${subtitle ? `<p class="muted">${escapeHtml(getTranslatedText({subtitle, subtitle_de}, 'subtitle', subtitle))}</p>` : ""}
        </header>
        ${summary ? `<p class="detail-summary">${escapeHtml(getTranslatedText({summary, summary_de}, 'summary', summary))}</p>` : ""}
        ${translatedFeatures.length ? `<section><h3>${sectionHeaders[currentLang].features}</h3><ul class="list">${featuresList}</ul></section>` : ""}
        ${translatedResponsibilities.length ? `<section><h3>${sectionHeaders[currentLang].responsibilities}</h3><ul class="list">${respList}</ul></section>` : ""}
        ${tech.length ? `<section><h3>${sectionHeaders[currentLang].tech}</h3><div class="badges">${techBadges}</div></section>` : ""}
        ${translatedLinks.length ? `<section class="cta-row">${linkButtons}</section>` : ""}
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

      titleEl.textContent = getTranslatedText(data, 'title', 'Project');
      root.innerHTML = DetailCard({
        title: data.title,
        title_de: data.title_de,
        subtitle: data.subtitle,
        subtitle_de: data.subtitle_de,
        summary: data.summary,
        summary_de: data.summary_de,
        features: data.features || [],
        features_de: data.features_de || [],
        responsibilities: data.responsibilities || [],
        responsibilities_de: data.responsibilities_de || [],
        tech: data.tech || [],
        links: data.links || [],
        links_de: data.links_de || []
      });
      document.title = `${getTranslatedText(data, 'title', 'Project')} — Project Detail`;
    } catch (e) {
      console.error("[detail] load error:", e);
      titleEl.textContent = "Project";
      root.innerHTML = `<p class="error">Could not load project details. ${escapeHtml(e.message)}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", load);
})();
