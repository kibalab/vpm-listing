const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; else; package.Name; end; }}",
    description: "{{ if package.Description; package.Description; else; 'No description provided.'; end; }}",
    version: "{{ package.Version }}",
    type: "{{ if package.Type; package.Type; end; }}",
    imageUrl: "{{ if package.ImageUrl; package.ImageUrl; else; if package.IconUrl; package.IconUrl; else; if package.ThumbnailUrl; package.ThumbnailUrl; else; ''; end; end; end; }}",
    zipUrl: "{{ if package.ZipUrl; package.ZipUrl; else; ''; end; }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

const getById = (id) => document.getElementById(id);

const openDialog = (dialog) => {
  if (!dialog) return;
  if (dialog.open) return;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.removeAttribute("hidden");
    dialog.setAttribute("open", "");
  }
};

const closeDialog = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
    dialog.setAttribute("hidden", "");
  }
};

const setupDialog = (dialog) => {
  if (!dialog) return;
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeDialog(dialog);
    }
  });
};

const setVisible = (element, isVisible) => {
  if (!element) return;
  if (isVisible) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
};

const attachCopy = (buttonId, inputId) => {
  const button = getById(buttonId);
  const input = getById(inputId);
  if (!button || !input) return;
  button.addEventListener("click", () => {
    input.select();
    input.setSelectionRange(0, input.value.length);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(input.value);
    }
    const originalText = button.textContent;
    button.textContent = "Copied";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 1000);
  });
};

const hashToHue = (value) => {
  let hash = 0;
  const text = value || "";
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
};

const setThumb = (thumb, name, imageUrl) => {
  if (!thumb) return;
  const label = (name || "").trim();
  const fallback = thumb.querySelector(".thumb-fallback");
  const existingImage = thumb.querySelector("img");

  if (imageUrl) {
    const img = existingImage || document.createElement("img");
    img.src = imageUrl;
    img.alt = label ? `${label} thumbnail` : "Package thumbnail";
    if (!existingImage) {
      thumb.appendChild(img);
    }
    thumb.classList.add("has-image");
    return;
  }

  if (existingImage) {
    existingImage.remove();
  }
  thumb.classList.remove("has-image");
  if (fallback) {
    fallback.textContent = label ? label[0].toUpperCase() : "#";
  }
  thumb.style.setProperty("--thumb-hue", `${hashToHue(label)}`);
};

(() => {
  const addListingToVccHelp = getById("addListingToVccHelp");
  const packageInfoModal = getById("packageInfoModal");
  setupDialog(addListingToVccHelp);
  setupDialog(packageInfoModal);

  document.querySelectorAll("[data-dialog-close]").forEach((button) => {
    const dialog = button.closest("dialog");
    button.addEventListener("click", () => closeDialog(dialog));
  });

  const addToVcc = () => {
    window.location.assign(`vcc://vpm/addRepo?url=${encodeURIComponent(LISTING_URL)}`);
  };

  document.querySelectorAll(".js-add-to-vcc").forEach((button) => {
    button.addEventListener("click", addToVcc);
  });

  const urlBarHelp = getById("urlBarHelp");
  if (urlBarHelp && addListingToVccHelp) {
    urlBarHelp.addEventListener("click", () => openDialog(addListingToVccHelp));
  }

  const packageInfoListingHelp = getById("packageInfoListingHelp");
  if (packageInfoListingHelp && addListingToVccHelp) {
    packageInfoListingHelp.addEventListener("click", () => openDialog(addListingToVccHelp));
  }

  attachCopy("vccUrlFieldCopy", "vccUrlField");
  attachCopy("vccListingInfoUrlFieldCopy", "vccListingInfoUrlField");
  attachCopy("packageInfoVccUrlFieldCopy", "packageInfoVccUrlField");

  const packageCards = Array.from(document.querySelectorAll(".package-card"));
  const searchInput = getById("searchInput");
  const emptyState = getById("emptyState");

  const filterPackages = (query) => {
    const value = (query || "").trim().toLowerCase();
    let visibleCount = 0;
    packageCards.forEach((card) => {
      const name = (card.dataset.packageName || "").toLowerCase();
      const id = (card.dataset.packageId || "").toLowerCase();
      const isVisible = value.length === 0 || name.includes(value) || id.includes(value);
      card.classList.toggle("is-hidden", !isVisible);
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  };

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      filterPackages(event.target?.value);
    });
  }

  filterPackages("");

  document.querySelectorAll(".package-thumb[data-name]").forEach((thumb) => {
    if (thumb.id === "packageInfoThumb") return;
    setThumb(thumb, thumb.dataset.name, thumb.dataset.image);
  });

  const packageInfoName = getById("packageInfoName");
  const packageInfoId = getById("packageInfoId");
  const packageInfoVersion = getById("packageInfoVersion");
  const packageInfoType = getById("packageInfoType");
  const packageInfoDescription = getById("packageInfoDescription");
  const packageInfoAuthor = getById("packageInfoAuthor");
  const packageInfoLicense = getById("packageInfoLicense");
  const packageInfoKeywords = getById("packageInfoKeywords");
  const packageInfoDependencies = getById("packageInfoDependencies");
  const packageInfoThumb = getById("packageInfoThumb");
  const packageInfoAuthorWrap = getById("packageInfoAuthorWrap");
  const packageInfoLicenseWrap = getById("packageInfoLicenseWrap");
  const packageInfoKeywordsWrap = getById("packageInfoKeywordsWrap");
  const packageInfoDependenciesWrap = getById("packageInfoDependenciesWrap");

  const updatePackageInfo = (packageInfo) => {
    if (!packageInfo) return;

    const displayName = packageInfo.displayName || packageInfo.name;
    const description = packageInfo.description || "No description provided.";

    if (packageInfoName) packageInfoName.textContent = displayName;
    if (packageInfoId) packageInfoId.textContent = packageInfo.name || "";

    if (packageInfoVersion) {
      if (packageInfo.version) {
        packageInfoVersion.textContent = `v${packageInfo.version}`;
        setVisible(packageInfoVersion, true);
      } else {
        setVisible(packageInfoVersion, false);
      }
    }

    if (packageInfoType) {
      if (packageInfo.type) {
        packageInfoType.textContent = packageInfo.type;
        setVisible(packageInfoType, true);
      } else {
        setVisible(packageInfoType, false);
      }
    }

    if (packageInfoDescription) packageInfoDescription.textContent = description;

    if (packageInfoAuthor && packageInfoAuthorWrap) {
      if (packageInfo.author?.name) {
        packageInfoAuthor.textContent = packageInfo.author.name;
        if (packageInfo.author.url) {
          packageInfoAuthor.href = packageInfo.author.url;
        } else {
          packageInfoAuthor.removeAttribute("href");
        }
        setVisible(packageInfoAuthorWrap, true);
      } else {
        setVisible(packageInfoAuthorWrap, false);
      }
    }

    if (packageInfoLicense && packageInfoLicenseWrap) {
      if (packageInfo.license || packageInfo.licensesUrl) {
        packageInfoLicense.textContent = packageInfo.license || "See license";
        if (packageInfo.licensesUrl) {
          packageInfoLicense.href = packageInfo.licensesUrl;
        } else {
          packageInfoLicense.removeAttribute("href");
        }
        setVisible(packageInfoLicenseWrap, true);
      } else {
        setVisible(packageInfoLicenseWrap, false);
      }
    }

    if (packageInfoKeywords && packageInfoKeywordsWrap) {
      packageInfoKeywords.innerHTML = "";
      if (packageInfo.keywords?.length) {
        packageInfo.keywords.forEach((keyword) => {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = keyword;
          packageInfoKeywords.appendChild(badge);
        });
        setVisible(packageInfoKeywordsWrap, true);
      } else {
        setVisible(packageInfoKeywordsWrap, false);
      }
    }

    if (packageInfoDependencies && packageInfoDependenciesWrap) {
      packageInfoDependencies.innerHTML = "";
      const entries = Object.entries(packageInfo.dependencies || {});
      if (entries.length) {
        entries.forEach(([name, version]) => {
          const item = document.createElement("li");
          item.textContent = `${name} @ v${version}`;
          packageInfoDependencies.appendChild(item);
        });
        setVisible(packageInfoDependenciesWrap, true);
      } else {
        setVisible(packageInfoDependenciesWrap, false);
      }
    }

    if (packageInfoThumb) {
      packageInfoThumb.dataset.name = displayName || "";
      setThumb(packageInfoThumb, displayName, packageInfo.imageUrl);
    }
  };

  document.querySelectorAll(".js-package-info").forEach((button) => {
    button.addEventListener("click", (event) => {
      const packageId = event.currentTarget?.dataset?.packageId;
      if (!packageId) return;
      const packageInfo = PACKAGES[packageId];
      if (!packageInfo) return;
      updatePackageInfo(packageInfo);
      openDialog(packageInfoModal);
    });
  });
})();
