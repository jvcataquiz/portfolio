document.addEventListener('DOMContentLoaded', () => {
  const featuredCarousel = document.getElementById('featured-carousel');
  const repoCountElement = document.getElementById('repoCount');

  async function loadReposFromCache() {
    try {
      const response = await fetch('./data/repos.json');
      if (!response.ok) throw new Error('Cache not found');
      return await response.json();
    } catch (error) {
      console.warn('Using fallback because repo cache is unavailable.', error);
      return [];
    }
  }

  async function fetchAllRepos() {
    const cachedRepos = await loadReposFromCache();

    if (cachedRepos.length) {
      renderRepos(cachedRepos);
      return;
    }

    try {
      let page = 1;
      let allRepos = [];
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(`https://api.github.com/users/jvcataquiz/repos?per_page=100&page=${page}`, {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'portfolio-site'
          }
        });

        if (!response.ok) {
          throw new Error(`GitHub request failed with status ${response.status}`);
        }

        const repos = await response.json();
        allRepos = allRepos.concat(repos);
        hasMore = repos.length === 100;
        page++;
      }

      renderRepos(allRepos);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    }
  }

  function renderRepos(allRepos) {
    if (!featuredCarousel) return;

    const javaRepos = allRepos
      .filter(repo => repo.language === 'Java' || repo.language === 'TypeScript')
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    if (repoCountElement) repoCountElement.textContent = javaRepos.length;
    featuredCarousel.innerHTML = '';

    javaRepos.forEach(repo => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card1';

      const desc = repo.description || 'No description available.';
      const shortDesc = desc.length >= 100
        ? desc.substring(0, 100) + '...'
        : desc.padEnd(100, '\u00A0');
      const name = repo.name || 'No name available.';
      const shortName = name.length > 30 ? name.substring(0, 30) + '...' : name;

      const emojiList = ['💻', '🖥️', '🖱️', '⌨️', '🕹️', '📱', '📡', '🛠️', '⚙️', '🧩', '🤖', '🔋', '💾', '🗄️'];
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

      projectCard.innerHTML = `
        <div class="project-image">${emoji}</div>
        <div class="project-content">
          <h3 class="project-title">${shortName}</h3>
          <p class="project-description">${shortDesc}</p>
          <div class="project-tags">
            <span class="tag">${repo.language || 'Java'}</span>
            <span class="tag">Spring Boot</span>
            <span class="tag">MySQL</span>
          </div>
          <div class="project-links">
            ${repo.html_url ? `<a href="${repo.html_url}" target="_blank" class="tag1">Code</a>` : ''}
           
          </div>
        </div>
      `;
      featuredCarousel.appendChild(projectCard);
    });
  }

  // Scroll carousel function
  window.scrollCarousel = function (carouselId, direction) {
    const carousel = document.getElementById(`${carouselId}-carousel`);
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.project-card1');
    if (!cards.length) return;

    const gap = parseInt(getComputedStyle(carousel).gap) || 0;
    const cardWidth = cards[0].offsetWidth;
    const cardsPerView = window.innerWidth <= 480 ? 1 : 3;
    const scrollStep = (cardWidth + gap) * cardsPerView;

    let target = Math.round(carousel.scrollLeft / (cardWidth + gap)) * (cardWidth + gap);
    target += direction * scrollStep;

    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    if (target < 0) target = maxScroll;
    if (target > maxScroll - 10) target = 0;

    carousel.scrollTo({ left: target, behavior: 'smooth' });
  };

  fetchAllRepos();
});
