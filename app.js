(() => {
  "use strict";

  const sourceCards = Array.isArray(window.FLASHCARDS) ? window.FLASHCARDS : [];
  const cards = sourceCards
    .filter(card => card && card.id && card.question != null && card.answer != null)
    .map(card => ({
      id: String(card.id).trim(),
      question: String(card.question).trim(),
      answer: String(card.answer).trim(),
      category: String(card.category || "All cards").trim()
    }));

  const storageKey = "istolab-flashcards-state-v1";

  const el = {
    flashcard: document.getElementById("flashcard"),
    completePanel: document.getElementById("completePanel"),
    completeSummary: document.getElementById("completeSummary"),
    cardImage: document.getElementById("cardImage"),
    imageError: document.getElementById("imageError"),
    questionText: document.getElementById("questionText"),
    answerText: document.getElementById("answerText"),
    answerArea: document.getElementById("answerArea"),
    categoryBadge: document.getElementById("categoryBadge"),
    cardId: document.getElementById("cardId"),
    showAnswerButton: document.getElementById("showAnswerButton"),
    ratingButtons: document.getElementById("ratingButtons"),
    againButton: document.getElementById("againButton"),
    knownButton: document.getElementById("knownButton"),
    resetButton: document.getElementById("resetButton"),
    restartButton: document.getElementById("restartButton"),
    progressText: document.getElementById("progressText"),
    scoreText: document.getElementById("scoreText"),
    progressBar: document.getElementById("progressBar"),
    categorySelect: document.getElementById("categorySelect"),
    zoomButton: document.getElementById("zoomButton"),
    imageDialog: document.getElementById("imageDialog"),
    zoomedImage: document.getElementById("zoomedImage"),
    closeDialogButton: document.getElementById("closeDialogButton")
  };

  let selectedCategory = "All cards";
  let queue = [];
  let currentCard = null;
  let revealed = false;
  let knownCount = 0;
  let reviewCount = 0;
  let completedCount = 0;
  let imageCandidates = [];
  let imageCandidateIndex = 0;

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function filteredCards() {
    if (selectedCategory === "All cards") return cards;
    return cards.filter(card => card.category === selectedCategory);
  }

  function buildImageCandidates(id) {
    const safeId = encodeURIComponent(id).replace(/%2F/gi, "/");
    const hasExtension = /\.(jpe?g|png|webp|gif|avif)$/i.test(id);

    if (hasExtension) {
      return [`images/${safeId}`];
    }

    return [
      `images/${safeId}.jpeg`,
      `images/${safeId}.jpg`,
      `images/${safeId}.png`,
      `images/${safeId}.webp`,
      `images/${safeId}.gif`,
      `images/${safeId}.avif`
    ];
  }

  function loadCardImage(card) {
    imageCandidates = buildImageCandidates(card.id);
    imageCandidateIndex = 0;
    el.imageError.hidden = true;
    el.cardImage.hidden = false;
    el.cardImage.src = imageCandidates[0];
  }

  function imageFallback() {
    imageCandidateIndex += 1;
    if (imageCandidateIndex < imageCandidates.length) {
      el.cardImage.src = imageCandidates[imageCandidateIndex];
      return;
    }

    el.cardImage.hidden = true;
    el.imageError.hidden = false;
  }

  function populateCategories() {
    const categories = [...new Set(cards.map(card => card.category))].sort((a, b) =>
      a.localeCompare(b)
    );

    el.categorySelect.replaceChildren();
    ["All cards", ...categories].forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      el.categorySelect.appendChild(option);
    });
    el.categorySelect.value = selectedCategory;
  }

  function updateProgress() {
    const total = filteredCards().length;
    const currentNumber = total === 0
      ? 0
      : Math.min(completedCount + (currentCard ? 1 : 0), total);
    const percentage = total === 0 ? 0 : (completedCount / total) * 100;

    el.progressText.textContent = total
      ? `Card ${currentNumber} of ${total}`
      : "No cards";
    el.scoreText.textContent = `Known ${knownCount} · Review ${reviewCount}`;
    el.progressBar.style.width = `${Math.min(100, percentage)}%`;
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        selectedCategory,
        knownCount,
        reviewCount,
        completedCount
      }));
    } catch (_) {
      // The app still works when browser storage is blocked.
    }
  }

  function resetSession({ preserveCategory = true } = {}) {
    if (!preserveCategory) {
      selectedCategory = "All cards";
      el.categorySelect.value = selectedCategory;
    }

    queue = shuffle(filteredCards());
    currentCard = null;
    revealed = false;
    knownCount = 0;
    reviewCount = 0;
    completedCount = 0;

    el.completePanel.hidden = true;
    el.flashcard.hidden = false;

    showNextCard();
    saveState();
  }

  function showNextCard() {
    if (queue.length === 0) {
      finishSession();
      return;
    }

    currentCard = queue.shift();
    revealed = false;

    el.questionText.textContent = currentCard.question;
    el.answerText.textContent = currentCard.answer;
    el.categoryBadge.textContent = currentCard.category;
    el.cardId.textContent = currentCard.id;
    el.cardId.title = currentCard.id;

    el.answerArea.hidden = true;
    el.ratingButtons.hidden = true;
    el.showAnswerButton.hidden = false;

    loadCardImage(currentCard);
    updateProgress();
  }

  function revealAnswer() {
    if (!currentCard || revealed) return;
    revealed = true;
    el.answerArea.hidden = false;
    el.showAnswerButton.hidden = true;
    el.ratingButtons.hidden = false;
    el.knownButton.focus({ preventScroll: true });
  }

  function rateCard(result) {
    if (!currentCard || !revealed) return;

    if (result === "known") {
      knownCount += 1;
    } else {
      reviewCount += 1;
    }

    completedCount += 1;
    currentCard = null;
    updateProgress();
    saveState();

    window.setTimeout(showNextCard, 120);
  }

  function finishSession() {
    currentCard = null;
    el.flashcard.hidden = true;
    el.completePanel.hidden = false;
    el.progressBar.style.width = "100%";
    el.progressText.textContent = `Completed ${completedCount} of ${filteredCards().length}`;
    el.completeSummary.textContent =
      `You knew ${knownCount} card${knownCount === 1 ? "" : "s"} and marked ` +
      `${reviewCount} for review.`;
    saveState();
  }

  function openZoom() {
    if (!el.cardImage.src || el.cardImage.hidden) return;
    el.zoomedImage.src = el.cardImage.src;

    if (typeof el.imageDialog.showModal === "function") {
      el.imageDialog.showModal();
    } else {
      window.open(el.cardImage.src, "_blank", "noopener");
    }
  }

  el.cardImage.addEventListener("error", imageFallback);
  el.showAnswerButton.addEventListener("click", revealAnswer);
  el.knownButton.addEventListener("click", () => rateCard("known"));
  el.againButton.addEventListener("click", () => rateCard("review"));
  el.resetButton.addEventListener("click", () => resetSession());
  el.restartButton.addEventListener("click", () => resetSession());
  el.zoomButton.addEventListener("click", openZoom);
  el.closeDialogButton.addEventListener("click", () => el.imageDialog.close());

  el.imageDialog.addEventListener("click", event => {
    if (event.target === el.imageDialog) el.imageDialog.close();
  });

  el.categorySelect.addEventListener("change", event => {
    selectedCategory = event.target.value;
    resetSession();
  });

  document.addEventListener("keydown", event => {
    if (el.imageDialog.open && event.key === "Escape") {
      el.imageDialog.close();
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      revealAnswer();
    } else if (event.key === "1" && revealed) {
      rateCard("review");
    } else if (event.key === "2" && revealed) {
      rateCard("known");
    }
  });

  populateCategories();

  if (cards.length === 0) {
    el.flashcard.hidden = true;
    el.completePanel.hidden = false;
    el.completeSummary.textContent =
      "No valid cards were found. Check cards.js and the image filenames.";
    el.restartButton.hidden = true;
    updateProgress();
  } else {
    resetSession();
  }
})();
