document.addEventListener("DOMContentLoaded", () => {
  const customImageInput = document.getElementById("custom-image-input");
  const downloadBtn = document.getElementById("download-btn");
  const albumArt = document.getElementById("album-art");
  const logoImage = document.getElementById("logo-image");
  const gradientItems = document.querySelectorAll(".gradient-item");
  const color1Input = document.getElementById("color1");
  const color2Input = document.getElementById("color2");
  const color1Preview = document.getElementById("color1-preview");
  const color2Preview = document.getElementById("color2-preview");
  const lyricsCard = document.getElementById("lyrics-card");
  const cardBackground = document.querySelector(".card-background");
  const trackName = document.getElementById("track-name");
  const artistName = document.getElementById("artist-name");
  const lyricsText = document.getElementById("lyrics-text");

  let currentGradient = `linear-gradient(135deg, ${color1Input.value}, ${color2Input.value})`;

  // Initialize color previews
  color1Preview.style.backgroundColor = color1Input.value;
  color2Preview.style.backgroundColor = color2Input.value;

  // Set default logo
  logoImage.src = "assets/spotify-logo.png";

  // Set a default album art
  albumArt.src = "assets/404.jpg";

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

  // Change album art when image is uploaded
  customImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        albumArt.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Download card when button is clicked
  downloadBtn.addEventListener("click", downloadCard);

  function applyGradient(gradient) {
    lyricsCard.style.background = gradient;
    cardBackground.style.background = gradient;
    downloadBtn.style.background = gradient;
    currentGradient = gradient;
  }

  function downloadCard() {
    // Show a loading notification
    showCustomNotification(
      "<i class='fas fa-spinner fa-spin'></i> Generating image..."
    );

    // 1) Get the .card-background element dimensions
    const cardBackgroundEl = document.querySelector(".card-background");
    const cardBackgroundRect = cardBackgroundEl.getBoundingClientRect();

    // Force 3× scale for higher-resolution output
    const scale = 3;

    // Create a canvas matching the .card-background size * scale
    const canvas = document.createElement("canvas");
    canvas.width = cardBackgroundRect.width * scale;
    canvas.height = cardBackgroundRect.height * scale;

    const ctx = canvas.getContext("2d");

    // Scale all drawing operations for crisp text/images
    ctx.scale(scale, scale);

    // Fill entire canvas with gradient
    const gradientColors = currentGradient.match(/#[a-fA-F0-9]{6}/g);
    if (gradientColors && gradientColors.length >= 2) {
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
      ctx.fillStyle = "#F5A9C7";
    }
    ctx.fillRect(0, 0, cardBackgroundRect.width, cardBackgroundRect.height);

    // Draw the card with shadow
    const cardEl = document.querySelector(".card");
    const cardRect = cardEl.getBoundingClientRect();
    const cardX = cardRect.left - cardBackgroundRect.left;
    const cardY = cardRect.top - cardBackgroundRect.top;

    // Add shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // Draw rounded rectangle for card
    roundRect(ctx, cardX, cardY, cardRect.width, cardRect.height, 12);

    // Fill with gradient
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

    // Draw album art
    const artSize = 50;
    const contentPadding = 25;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = albumArt.src;

    img.onload = function () {
      // Draw album art
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

      // Draw track info
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

      // Draw lyrics - Get raw content with line breaks
      const rawLyrics = lyricsText.innerText || lyricsText.textContent;

      ctx.font = "bold 24px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        rawLyrics,
        cardX + contentPadding,
        cardY + contentPadding + 100,
        cardRect.width - contentPadding * 2,
        30
      );

      // Draw logo
      const logoImg = new Image();
      logoImg.crossOrigin = "Anonymous";
      logoImg.src = "assets/spotify-logo.png";

      logoImg.onload = function () {
        const logoHeight = 24;
        const logoWidth = logoHeight * (logoImg.width / logoImg.height);

        ctx.drawImage(
          logoImg,
          cardX + contentPadding,
          cardY + cardRect.height - contentPadding - logoHeight,
          logoWidth,
          logoHeight
        );

        // Download the image
        finishDownload(canvas);
      };

      logoImg.onerror = function () {
        finishDownload(canvas);
      };
    };

    img.onerror = function () {
      // Draw placeholder for album art
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

      // Draw the rest of the content
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

      // Draw lyrics
      const rawLyrics = lyricsText.innerText || lyricsText.textContent;

      ctx.font = "bold 24px 'Circular', Arial, sans-serif";
      wrapText(
        ctx,
        rawLyrics,
        cardX + contentPadding,
        cardY + contentPadding + 100,
        cardRect.width - contentPadding * 2,
        30
      );

      finishDownload(canvas);
    };
  }

  function finishDownload(canvasEl) {
    const link = document.createElement("a");
    const cardTitle = trackName.textContent || "Custom";
    link.download = `${cardTitle} - SpotiCard.png`;
    link.href = canvasEl.toDataURL("image/png");
    link.click();

    showCustomNotification(
      "<i class='fas fa-check-circle'></i> Image downloaded successfully!"
    );
  }

  function showCustomNotification(message) {
    // Remove any existing notifications
    const existingNotification = document.querySelector(".custom-notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create a new notification
    const notificationEl = document.createElement("div");
    notificationEl.className = "custom-notification";
    notificationEl.innerHTML = message;

    // Add to document
    document.body.appendChild(notificationEl);

    // Hide notification after 3 seconds
    setTimeout(() => {
      notificationEl.style.opacity = "0";
      setTimeout(() => {
        notificationEl.remove();
      }, 300);
    }, 3000);
  }

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
});
