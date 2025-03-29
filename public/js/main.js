document.addEventListener("DOMContentLoaded", () => {
  const trackInput = document.getElementById("track-input");
  const secondaryTrackInput = document.getElementById("secondary-track-input");
  const generateBtn = document.getElementById("generate-btn");
  const secondaryGenerateBtn = document.getElementById(
    "secondary-generate-btn"
  );
  const downloadBtn = document.getElementById("download-btn");
  const editLyricsBtn = document.getElementById("edit-lyrics-btn");
  const saveLyricsBtn = document.getElementById("save-lyrics-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const editLyricsContainer = document.querySelector(".edit-lyrics-container");
  const editLyricsTextarea = document.getElementById("edit-lyrics-textarea");
  const cardContainer = document.querySelector(".card-container");
  const cardBackground = document.querySelector(".card-background");
  const loadingElement = document.querySelector(".loading");
  const errorNotification = document.querySelector(".error-notification");
  const lyricsCard = document.getElementById("lyrics-card");
  const albumArt = document.getElementById("album-art");
  const trackName = document.getElementById("track-name");
  const artistName = document.getElementById("artist-name");
  const lyricsText = document.getElementById("lyrics-text");
  const gradientItems = document.querySelectorAll(".gradient-item");
  const color1Input = document.getElementById("color1");
  const color2Input = document.getElementById("color2");
  const color1Preview = document.getElementById("color1-preview");
  const color2Preview = document.getElementById("color2-preview");
  const refreshLyricsBtn = document.getElementById("refresh-lyrics-btn");
  const mainInputSection = document.getElementById("main-input-section");
  const secondaryInputSection = document.querySelector(
    ".secondary-input-section"
  );

  // Store track data globally for refresh functionality
  let currentTrackData = null;
  let allLyricsLines = []; // Store all individual lines of lyrics
  let currentGradient = `linear-gradient(135deg, ${color1Input.value}, ${color2Input.value})`;

  // Initialize color previews
  color1Preview.style.backgroundColor = color1Input.value;
  color2Preview.style.backgroundColor = color2Input.value;

  // Update color previews and apply gradient when inputs change
  color1Input.addEventListener("input", () => {
    color1Preview.style.backgroundColor = color1Input.value;
    applyCustomGradient();
  });

  color2Input.addEventListener("input", () => {
    color2Preview.style.backgroundColor = color2Input.value;
    applyCustomGradient();
  });

  function applyCustomGradient() {
    const customGradient = `linear-gradient(135deg, ${color1Input.value}, ${color2Input.value})`;
    applyGradient(customGradient);
  }

  // Generate card when button is clicked
  generateBtn.addEventListener("click", generateCard);
  secondaryGenerateBtn.addEventListener("click", generateCard);

  // Generate card when Enter key is pressed in input
  trackInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      generateCard();
    }
  });

  secondaryTrackInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      generateCard();
    }
  });

  // Edit lyrics
  editLyricsBtn.addEventListener("click", () => {
    editLyricsTextarea.value = lyricsText.textContent;
    editLyricsContainer.classList.remove("hidden");
    editLyricsBtn.classList.add("hidden");
  });

  saveLyricsBtn.addEventListener("click", () => {
    lyricsText.textContent = editLyricsTextarea.value;
    editLyricsContainer.classList.add("hidden");
    editLyricsBtn.classList.remove("hidden");

    // Enable download button after editing lyrics
    downloadBtn.disabled = false;

    adjustCardHeight();
  });

  cancelEditBtn.addEventListener("click", () => {
    editLyricsContainer.classList.add("hidden");
    editLyricsBtn.classList.remove("hidden");
  });

  // Download card when button is clicked
  downloadBtn.addEventListener("click", downloadCard);

  // Change gradient when a gradient item is clicked
  gradientItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Remove active class from all items
      gradientItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      item.classList.add("active");

      const gradient = item.getAttribute("data-gradient");
      applyGradient(gradient);

      // Extract colors from gradient and update color inputs
      const colors = gradient.match(/#[a-fA-F0-9]{6}/g);
      if (colors && colors.length >= 2) {
        color1Input.value = colors[0];
        color2Input.value = colors[1];
        color1Preview.style.backgroundColor = colors[0];
        color2Preview.style.backgroundColor = colors[1];
      }
    });
  });

  // Refresh lyrics
  refreshLyricsBtn.addEventListener("click", () => {
    refreshRandomLyrics();
  });

  function refreshRandomLyrics() {
    if (
      allLyricsLines &&
      Array.isArray(allLyricsLines) &&
      allLyricsLines.length > 0
    ) {
      // Randomly decide how many lines to show (1-3)
      const numLines = Math.floor(Math.random() * 3) + 1;

      // Randomly select a starting point that ensures we don't go out of bounds
      const maxStartIndex = Math.max(0, allLyricsLines.length - numLines);
      const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));

      // Get the selected lines
      const selectedLines = allLyricsLines.slice(
        startIndex,
        startIndex + numLines
      );

      // Update the lyrics text
      lyricsText.textContent = selectedLines.join("\n");
      adjustCardHeight();
    } else if (typeof allLyricsLines === "string") {
      // If allLyricsLines is a string (fallback case)
      lyricsText.textContent = allLyricsLines;
      adjustCardHeight();
    }
  }

  async function generateCard() {
    // Get the input value from either the main or secondary input
    const trackUrl = mainInputSection.classList.contains("hidden")
      ? secondaryTrackInput.value.trim()
      : trackInput.value.trim();

    if (!trackUrl) {
      showNotification(
        errorNotification,
        "Please enter a Spotify track URL or ID"
      );
      return;
    }

    // Show loading state
    loadingElement.classList.remove("hidden");
    cardContainer.classList.add("hidden");

    try {
      // Extract track ID from URL
      const trackId = extractTrackId(trackUrl);

      if (!trackId) {
        showNotification(
          errorNotification,
          "Invalid Spotify URL. Please enter a valid Spotify track URL."
        );
        loadingElement.classList.add("hidden");
        mainInputSection.classList.remove("hidden");
        return;
      }

      // Get track info from Spotify
      const trackData = await getTrackInfo(trackId);

      if (!trackData) {
        showNotification(
          errorNotification,
          "Could not find track information. Please check the URL."
        );
        loadingElement.classList.add("hidden");
        mainInputSection.classList.remove("hidden");
        return;
      }

      // Store track data globally
      currentTrackData = trackData;

      // Get lyrics for the track
      try {
        const lyrics = await getLyrics(
          trackData.name,
          trackData.artists[0].name
        );

        if (!lyrics) {
          throw new Error("No lyrics found");
        }

        // Store all lyrics lines
        allLyricsLines = lyrics;

        // Select random lines for initial display
        refreshRandomLyrics();

        // Update card with track data
        updateCard(trackData);

        // Hide main input section and show secondary input section
        mainInputSection.classList.add("hidden");
        secondaryInputSection.classList.remove("hidden");

        // Hide loading and show card
        loadingElement.classList.add("hidden");
        cardContainer.classList.remove("hidden");
      } catch (lyricsError) {
        // Handle lyrics error with a nice message
        showNotification(
          errorNotification,
          `<i class="fas fa-search"></i> Lyrics not found for "${trackData.name}" by ${trackData.artists[0].name}`
        );

        // Set a fallback message
        allLyricsLines = "Lyrics unavailable";
        lyricsText.textContent = "Lyrics unavailable";

        // Still show the card with track info but with "Lyrics unavailable" message
        updateCard(trackData);

        // Hide main input section and show secondary input section
        mainInputSection.classList.add("hidden");
        secondaryInputSection.classList.remove("hidden");

        // Hide loading and show card
        loadingElement.classList.add("hidden");
        cardContainer.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification(
        errorNotification,
        `<i class="fas fa-exclamation-circle"></i> An error occurred: ${error.message}`
      );
      loadingElement.classList.add("hidden");
      mainInputSection.classList.remove("hidden");
    }
  }

  function extractTrackId(url) {
    // Extract track ID from various Spotify URL formats
    const patterns = [
      /spotify:track:([a-zA-Z0-9]+)/, // Spotify URI
      /open.spotify.com\/track\/([a-zA-Z0-9]+)/, // Web URL
      /^([a-zA-Z0-9]+)$/, // Just the ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  async function getTrackInfo(trackId) {
    try {
      // Use our backend API to fetch track info
      const response = await fetch(`/api/spotify/track/${trackId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch track information");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching track info:", error);
      throw error;
    }
  }

  async function getLyrics(title, artist) {
    try {
      // Use our backend API to fetch lyrics
      const response = await fetch(
        `/api/lyrics/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lyrics");
      }

      const data = await response.json();

      if (!data.lyrics || data.lyrics.trim() === "") {
        throw new Error("No lyrics found");
      }

      // Process the lyrics
      return processLyrics(data.lyrics);
    } catch (error) {
      console.error("Error fetching lyrics:", error);
      return null;
    }
  }

  function processLyrics(fullLyrics) {
    if (!fullLyrics) return null;

    // Clean up the lyrics
    const cleanedLyrics = fullLyrics
      .replace(/\[.*?\]/g, "") // Remove bracketed text like [Chorus]
      .replace(/\(.*?\)/g, "") // Remove parenthesized text
      .trim();

    // Split into individual lines and filter out empty lines
    const allLines = cleanedLyrics
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return allLines.length > 0 ? allLines : null;
  }

  function updateCard(trackData) {
    // Update card elements with track data
    albumArt.src = trackData.album.images[0].url || "assets/404.jpg";
    trackName.textContent = trackData.name;
    artistName.textContent = trackData.artists
      .map((artist) => artist.name)
      .join(", ");

    // Set a random gradient from the available options
    const randomIndex = Math.floor(Math.random() * gradientItems.length);
    const randomGradient =
      gradientItems[randomIndex].getAttribute("data-gradient");
    applyGradient(randomGradient);

    // Update color inputs to match the random gradient
    const colors = randomGradient.match(/#[a-fA-F0-9]{6}/g);
    if (colors && colors.length >= 2) {
      color1Input.value = colors[0];
      color2Input.value = colors[1];
      color1Preview.style.backgroundColor = colors[0];
      color2Preview.style.backgroundColor = colors[1];
    }

    // Mark the selected gradient as active
    gradientItems.forEach((item) => item.classList.remove("active"));
    gradientItems[randomIndex].classList.add("active");

    // Adjust card height based on lyrics length
    adjustCardHeight();
  }

  function adjustCardHeight() {
    // Get elements
    const card = document.querySelector(".card");
    const cardBackground = document.querySelector(".card-background");
    const lyricsLength = lyricsText.textContent.length;
    const lineCount = (lyricsText.textContent.match(/\n/g) || []).length + 1;

    // Reset to default first
    card.style.height = "auto";

    // Calculate appropriate height based on content
    let minHeight = 300; // Base minimum height

    // Add height based on number of lines and length
    if (lineCount > 3) {
      minHeight += (lineCount - 3) * 30; // Add 30px per additional line
    }

    if (lyricsLength > 100) {
      minHeight += Math.min(200, (lyricsLength - 100) / 2); // Add up to 200px based on length
    }

    // Set minimum height
    card.style.minHeight = `${minHeight}px`;

    // Adjust card background to match
    if (minHeight > 500) {
      // If card is tall, adjust aspect ratio of background
      cardBackground.style.aspectRatio = "auto";
      cardBackground.style.minHeight = `${minHeight + 100}px`; // Add padding
    } else {
      // For shorter content, maintain 9:16 aspect ratio
      cardBackground.style.aspectRatio = "9/16";
      cardBackground.style.minHeight = "600px";
    }
  }

  function applyGradient(gradient) {
    lyricsCard.style.background = gradient;
    cardBackground.style.background = gradient;
    downloadBtn.style.background = gradient;
    refreshLyricsBtn.style.background = gradient;
    editLyricsBtn.style.background = gradient;
    currentGradient = gradient;
  }

  function downloadCard() {
    // Show a loading notification
    showNotification(
      errorNotification,
      "<i class='fas fa-spinner fa-spin'></i> Generating image..."
    );

    // 1) Get the .card-background element dimensions
    const cardBackgroundEl = document.querySelector(".card-background");
    const cardBackgroundRect = cardBackgroundEl.getBoundingClientRect();

    // CHANGE #1: Force 3× scale for higher-resolution output
    const scale = 3;

    // Create a canvas matching the .card-background size * scale
    const canvas = document.createElement("canvas");
    canvas.width = cardBackgroundRect.width * scale;
    canvas.height = cardBackgroundRect.height * scale;

    const ctx = canvas.getContext("2d");

    // Scale all drawing operations for crisp text/images
    ctx.scale(scale, scale);

    // 2) Fill entire canvas with the same 135° gradient used on the page
    const gradientColors = currentGradient.match(/#[a-fA-F0-9]{6}/g);
    if (gradientColors && gradientColors.length >= 2) {
      // For a 135° CSS gradient, we create a linear gradient from top-left to bottom-right
      const gradient = ctx.createLinearGradient(
        0,
        0,
        cardBackgroundRect.width,
        cardBackgroundRect.height
      );
      gradient.addColorStop(0, gradientColors[0]);
      gradient.addColorStop(1, gradientColors[1]);
      ctx.fillStyle = gradient;
    } else {
      // Fallback if we can't parse the gradient
      ctx.fillStyle = "#F5A9C7";
    }
    ctx.fillRect(0, 0, cardBackgroundRect.width, cardBackgroundRect.height);

    // 3) Draw the smaller .card (with shadow) on top of the background
    // Grab the .card element and find its position relative to .card-background
    const cardEl = document.querySelector(".card");
    const cardRect = cardEl.getBoundingClientRect();

    // cardX/cardY are offsets inside the .card-background
    const cardX = cardRect.left - cardBackgroundRect.left;
    const cardY = cardRect.top - cardBackgroundRect.top;

    // Replicate the same shadow used in the DOM
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // Draw the rounded rectangle for the card
    roundRect(ctx, cardX, cardY, cardRect.width, cardRect.height, 12);

    // Create the same gradient for the card's fill
    if (gradientColors && gradientColors.length >= 2) {
      const cardGradient = ctx.createLinearGradient(
        cardX,
        cardY,
        cardX + cardRect.width,
        cardY + cardRect.height
      );
      cardGradient.addColorStop(0, gradientColors[0]);
      cardGradient.addColorStop(1, gradientColors[1]);
      ctx.fillStyle = cardGradient;
    } else {
      ctx.fillStyle = "#F5A9C7";
    }

    ctx.fill();
    ctx.restore();

    // 4) Draw the album art
    const artSize = 50;
    const contentPadding = 25;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = albumArt.src || "assets/404.jpg";

    // We'll do everything else (track name, artist name, lyrics, Spotify logo) once album art loads
    img.onload = function () {
      // Clip and draw the album art
      ctx.save();
      roundRect(
        ctx,
        cardX + contentPadding,
        cardY + contentPadding,
        artSize,
        artSize,
        8
      );
      ctx.clip();
      ctx.drawImage(
        img,
        cardX + contentPadding,
        cardY + contentPadding,
        artSize,
        artSize
      );
      ctx.restore();

      // Track info
      ctx.fillStyle = "black";
      ctx.font = "bold 16px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        trackName.textContent,
        cardX + contentPadding + artSize + 15,
        cardY + contentPadding + 15,
        cardRect.width - contentPadding * 2 - artSize - 15,
        20
      );

      ctx.font = "14px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        artistName.textContent,
        cardX + contentPadding + artSize + 15,
        cardY + contentPadding + 40,
        cardRect.width - contentPadding * 2 - artSize - 15,
        18
      );

      // 5) Draw the lyrics with word wrapping
      ctx.font = "bold 24px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        lyricsText.textContent,
        cardX + contentPadding,
        cardY + contentPadding + 100,
        cardRect.width - contentPadding * 2,
        30
      );

      // 6) Draw the Spotify logo (local asset to avoid CORS)
      const logoImg = new Image();
      logoImg.crossOrigin = "Anonymous";
      logoImg.src = "assets/spotify-logo.png"; // <--- Local path

      logoImg.onload = function () {
        // Place the logo at the bottom-left inside the card
        const logoHeight = 24;
        // Adjust width to maintain aspect ratio
        const logoWidth = logoHeight * (logoImg.width / logoImg.height);

        ctx.drawImage(
          logoImg,
          cardX + contentPadding,
          cardY + cardRect.height - contentPadding - logoHeight,
          logoWidth,
          logoHeight
        );

        // Finally, trigger the download
        finishDownload(canvas);
      };

      // If logo fails to load, still finish download
      logoImg.onerror = function () {
        finishDownload(canvas);
      };
    };

    // If album art fails to load, draw a placeholder and still proceed
    img.onerror = function () {
      // Gray box for missing album art
      ctx.fillStyle = "#333";
      roundRect(
        ctx,
        cardX + contentPadding,
        cardY + contentPadding,
        artSize,
        artSize,
        8
      );
      ctx.fill();

      // Track info
      ctx.fillStyle = "black";
      ctx.font = "bold 16px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        trackName.textContent,
        cardX + contentPadding + artSize + 15,
        cardY + contentPadding + 15,
        cardRect.width - contentPadding * 2 - artSize - 15,
        20
      );

      ctx.font = "14px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        artistName.textContent,
        cardX + contentPadding + artSize + 15,
        cardY + contentPadding + 40,
        cardRect.width - contentPadding * 2 - artSize - 15,
        18
      );

      // Lyrics
      ctx.font = "bold 24px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        lyricsText.textContent,
        cardX + contentPadding,
        cardY + contentPadding + 100,
        cardRect.width - contentPadding * 2,
        30
      );

      // No logo, just finish
      finishDownload(canvas);
    };

    // Helper: finalize download
    function finishDownload(canvasEl) {
      // Create download link
      const link = document.createElement("a");
      const songNameText = trackName.textContent || "SpotiCard";
      link.download = `${songNameText} - SpotiCard.png`;
      link.href = canvasEl.toDataURL("image/png");
      link.click();

      // Show success notification
      showNotification(
        errorNotification,
        "<i class='fas fa-check-circle'></i> Image downloaded successfully!"
      );
    }
  }

  // ------------- Helper Functions -------------- //

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    // Split by line breaks first to preserve intentional breaks
    const paragraphs = text.split("\n");
    let totalLines = 0;

    // Process each paragraph
    for (let i = 0; i < paragraphs.length; i++) {
      if (paragraphs[i].trim() === "") {
        // Empty line, just advance y position
        y += lineHeight;
        totalLines++;
        continue;
      }

      // Split paragraph into words
      const words = paragraphs[i].split(" ");
      let line = "";

      // Process words in this paragraph
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + " ";
          y += lineHeight;
          totalLines++;
        } else {
          line = testLine;
        }
      }

      // Draw the remaining line in this paragraph
      if (line.trim() !== "") {
        ctx.fillText(line, x, y);

        // Only add line height if not the last paragraph
        if (i < paragraphs.length - 1) {
          y += lineHeight;
          totalLines++;
        }
      }
    }
  }

  function showNotification(element, message) {
    element.querySelector("p").innerHTML = message; // Changed from textContent to innerHTML to support icons
    element.classList.remove("hidden");
    element.classList.add("show");

    // Hide notification after 4 seconds
    setTimeout(() => {
      element.classList.remove("show");
      element.classList.add("fade-out");

      // After animation completes, hide the element
      setTimeout(() => {
        element.classList.add("hidden");
        element.classList.remove("fade-out");
      }, 300);
    }, 4000);
  }
});
