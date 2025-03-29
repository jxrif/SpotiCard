document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const body = document.body;
  const icon = themeToggleBtn.querySelector("i");
  const metaImage = document.getElementById("meta-image");
  const favicon = document.getElementById("favicon");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const menuDropdown = document.querySelector(".menu-dropdown");

  // Toggle hamburger menu
  hamburgerBtn.addEventListener("click", () => {
    menuDropdown.classList.toggle("hidden");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!hamburgerBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.add("hidden");
    }
  });

  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.className = savedTheme + " no-select";
    updateIcon(savedTheme);
    updateMetaImages(savedTheme);
  } else {
    // Check for preferred color scheme
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      body.className = "dark-theme no-select";
      updateIcon("dark-theme");
      updateMetaImages("dark-theme");
    } else {
      body.className = "light-theme no-select";
      updateIcon("light-theme");
      updateMetaImages("light-theme");
    }
  }

  // Toggle theme
  themeToggleBtn.addEventListener("click", () => {
    if (body.classList.contains("light-theme")) {
      body.className = "dark-theme no-select";
      localStorage.setItem("theme", "dark-theme");
      updateIcon("dark-theme");
      updateMetaImages("dark-theme");
    } else {
      body.className = "light-theme no-select";
      localStorage.setItem("theme", "light-theme");
      updateIcon("light-theme");
      updateMetaImages("light-theme");
    }
  });

  function updateIcon(theme) {
    if (theme === "dark-theme") {
      icon.className = "fas fa-moon";
    } else {
      icon.className = "fas fa-sun";
    }
  }

  function updateMetaImages(theme) {
    if (metaImage && favicon) {
      if (theme === "dark-theme") {
        metaImage.content = "assets/spotify-dark.png";
        favicon.href = "assets/spotify-dark.png";
      } else {
        metaImage.content = "assets/spotify-light.png";
        favicon.href = "assets/spotify-light.png";
      }
    }

    // Update logo in custom.html if it exists
    const logoImage = document.getElementById("logo-image");
    if (logoImage) {
      if (theme === "dark-theme") {
        logoImage.src = "assets/spotify-dark.png";
      } else {
        logoImage.src = "assets/spotify-light.png";
      }
    }
  }
});
