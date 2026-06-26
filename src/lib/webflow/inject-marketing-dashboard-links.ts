const DASHBOARD_HREF = "/";
const NAV_MARKER = "data-marketing-dashboard-nav";
const MOBILE_MARKER = "data-marketing-dashboard-mobile";
const FOOTER_MARKER = "data-marketing-dashboard-footer";

const DASHBOARD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`;

const NAV_LINK_HTML = `<div class="nav-button-wrapper marketing-dashboard-nav"><a href="${DASHBOARD_HREF}" ${NAV_MARKER} class="marketing-dashboard-button"><span class="marketing-dashboard-button__icon">${DASHBOARD_ICON}</span><span class="marketing-dashboard-button__text">Dashboard</span></a></div>`;

const MOBILE_LINK_HTML = `<li class="nav-item marketing-dashboard-mobile-item"><a href="${DASHBOARD_HREF}" ${MOBILE_MARKER} class="nav-link marketing-dashboard-mobile-link w-inline-block"><span class="marketing-dashboard-mobile-link__icon">${DASHBOARD_ICON}</span><div class="nav-dropdown-text">Dashboard</div></a></li>`;

const FOOTER_LINK_HTML = `<a href="${DASHBOARD_HREF}" ${FOOTER_MARKER} class="footer-menu paragraph-02 marketing-dashboard-footer-link"><span class="marketing-dashboard-footer-link__icon">${DASHBOARD_ICON}</span><span>Go to Dashboard</span></a>`;

export function injectMarketingDashboardLinksHtml(html: string): string {
  if (html.includes(NAV_MARKER)) {
    return html;
  }

  let result = html;

  result = result.replace(
    /<div class="navbar-right">([\s\S]*?)(<div class="menu-button)/g,
    `<div class="navbar-right">${NAV_LINK_HTML}$1$2`,
  );

  result = result.replace(
    /(<ul role="list" class="nav-menu w-list-unstyled">)([\s\S]*?)(<\/ul>)/,
    `$1$2${MOBILE_LINK_HTML}$3`,
  );

  result = result.replace(
    /(<div class="footer-menu-list">)/,
    `$1${FOOTER_LINK_HTML}`,
  );

  return result;
}

function createNavbarDashboardLink(): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "nav-button-wrapper marketing-dashboard-nav";
  wrapper.innerHTML = `<a href="${DASHBOARD_HREF}" ${NAV_MARKER} class="marketing-dashboard-button"><span class="marketing-dashboard-button__icon">${DASHBOARD_ICON}</span><span class="marketing-dashboard-button__text">Dashboard</span></a>`;
  return wrapper;
}

function createMobileDashboardLink(): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "nav-item marketing-dashboard-mobile-item";
  item.innerHTML = `<a href="${DASHBOARD_HREF}" ${MOBILE_MARKER} class="nav-link marketing-dashboard-mobile-link w-inline-block"><span class="marketing-dashboard-mobile-link__icon">${DASHBOARD_ICON}</span><div class="nav-dropdown-text">Dashboard</div></a>`;
  return item;
}

function injectNavbarLinks(root: ParentNode) {
  root.querySelectorAll(".navbar-right").forEach((navbarRight) => {
    if (navbarRight.querySelector(`[${NAV_MARKER}]`)) return;

    const link = createNavbarDashboardLink();
    const menuButton = navbarRight.querySelector(".menu-button");

    if (menuButton) {
      navbarRight.insertBefore(link, menuButton);
    } else {
      navbarRight.appendChild(link);
    }
  });

  root.querySelectorAll(".nav-menu").forEach((navMenu) => {
    if (navMenu.querySelector(`[${MOBILE_MARKER}]`)) return;
    navMenu.appendChild(createMobileDashboardLink());
  });
}

function injectFooterLink(root: ParentNode) {
  root.querySelectorAll(".footer-right").forEach((footerRight) => {
    if (footerRight.querySelector(`[${FOOTER_MARKER}]`)) return;

    const firstList = footerRight.querySelector(".footer-menu-list");
    if (firstList) {
      const link = document.createElement("a");
      link.href = DASHBOARD_HREF;
      link.setAttribute(FOOTER_MARKER, "");
      link.className =
        "footer-menu paragraph-02 marketing-dashboard-footer-link";
      link.innerHTML = `<span class="marketing-dashboard-footer-link__icon">${DASHBOARD_ICON}</span><span>Go to Dashboard</span>`;
      firstList.insertBefore(link, firstList.firstChild);
      return;
    }

    const wrap = document.createElement("div");
    wrap.className = "footer-menu-list-wrap";
    wrap.innerHTML = `
      <div class="paragraph-01 footer-menu-title">Account</div>
      <div class="footer-menu-list">
        <a href="${DASHBOARD_HREF}" ${FOOTER_MARKER} class="footer-menu paragraph-02 marketing-dashboard-footer-link">
          <span class="marketing-dashboard-footer-link__icon">${DASHBOARD_ICON}</span>
          <span>Go to Dashboard</span>
        </a>
      </div>
    `;
    footerRight.appendChild(wrap);
  });
}

export function injectMarketingDashboardLinks(
  root: ParentNode | Document = document,
) {
  const scope = root instanceof Document ? root : root;

  injectNavbarLinks(scope);
  injectFooterLink(scope);
}
