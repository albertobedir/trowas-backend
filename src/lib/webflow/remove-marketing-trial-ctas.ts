const TRIAL_CTA_PATTERN =
  /Start Free Trial|Start a Project|Get Started|Request a Demo|Try for free|Start Free|free trial/i;

export function removeMarketingTrialCtasHtml(html: string): string {
  let result = html;

  result = result.replace(
    /<li class="mobile-margin-top-10">[\s\S]*?Start a Project[\s\S]*?<\/li>/g,
    "",
  );

  result = result.replace(
    /<div class="nav-button-wrapper"><a data-wf--button-02--variant="cta-button-01"[\s\S]*?Start Free Trial[\s\S]*?<\/a><\/div>/g,
    "",
  );

  result = result.replace(
    /<div class="animated-load-04"><a[^>]*class="button-01[^"]*"[^>]*>[\s\S]*?Get Started[\s\S]*?<\/a><\/div>/gi,
    "",
  );

  result = result.replace(
    /<div class="animated-load-04"><a data-wf--button-02--variant="base"[^>]*>[\s\S]*?Request a Demo[\s\S]*?<\/a><\/div>/gi,
    "",
  );

  result = result.replace(
    /<div class="plan-01-button-wrap"><a[\s\S]*?Get Started[\s\S]*?<\/a><\/div>/gi,
    "",
  );

  result = result.replace(
    /<a href="[^"]*" class="button-02 plan-button w-inline-block">[\s\S]*?Get Started[\s\S]*?<\/a>/gi,
    "",
  );

  result = result.replace(
    /<a[^>]*class="button-02[^"]*"[^>]*>[\s\S]*?Get Started[\s\S]*?<\/a>/gi,
    "",
  );

  result = result.replace(
    /<div class="hero-button-wrap">\s*<\/div>/g,
    "",
  );

  return result;
}

function elementContainsTrialCta(element: Element): boolean {
  const text = element.textContent?.replace(/\s+/g, " ").trim() ?? "";
  return TRIAL_CTA_PATTERN.test(text);
}

function removeTrialElements(root: ParentNode) {
  root.querySelectorAll("li.mobile-margin-top-10").forEach((item) => {
    if (elementContainsTrialCta(item)) {
      item.remove();
    }
  });

  root
    .querySelectorAll('a[data-wf--button-02--variant="cta-button-01"]')
    .forEach((link) => {
      const wrapper = link.closest(".nav-button-wrapper");
      (wrapper ?? link).remove();
    });

  root.querySelectorAll("a.button-01, a.button-02, a.button-04").forEach((link) => {
    if (elementContainsTrialCta(link)) {
      const animatedWrap = link.closest(".animated-load-04");
      const planWrap = link.closest(".plan-01-button-wrap");

      if (animatedWrap) {
        animatedWrap.remove();
      } else if (planWrap) {
        planWrap.innerHTML = "";
      } else {
        link.remove();
      }
    }
  });

  root.querySelectorAll(".hero-button-wrap").forEach((wrap) => {
    if (!wrap.querySelector("a")) {
      wrap.remove();
    }
  });
}

export function removeMarketingTrialCtas(root: ParentNode | Document = document) {
  const scope = root instanceof Document ? root : root;
  removeTrialElements(scope);
}
