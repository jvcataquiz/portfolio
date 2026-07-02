document.addEventListener('DOMContentLoaded', () => {
  const featuredCarousel = document.getElementById('featured-carousel');
  const repoCountElement = document.getElementById('repoCount');

  const fallbackRepos = [
    {
      name: 'Java Inventory API',
      description: 'A Spring Boot REST API for inventory and order management.',
      language: 'Java',
      html_url: 'https://github.com/jvcataquiz',
      pushed_at: new Date().toISOString()
    },
    {
      name: 'TypeScript Task Tracker',
      description: 'A responsive task manager built with TypeScript and modern UI patterns.',
      language: 'TypeScript',
      html_url: 'https://github.com/jvcataquiz',
      pushed_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      name: 'Spring Boot Auth Service',
      description: 'Authentication service with JWT, role-based access, and MySQL integration.',
      language: 'Java',
      html_url: 'https://github.com/jvcataquiz',
      pushed_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  function renderRepos(repos) {
    if (!featuredCarousel) return;

    featuredCarousel.innerHTML = '';

    const javaRepos = repos
      .filter(repo => repo.language === 'Java' || repo.language === 'TypeScript')
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

    if (repoCountElement) repoCountElement.textContent = javaRepos.length;

    javaRepos.forEach(repo => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card1';

      const desc = repo.description || 'No description available.';
      const shortDesc = desc.length >= 100 ? desc.substring(0, 100) + '...' : desc.padEnd(100, '\u00A0');
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
            <a href="#" class="tag1"><i class="fas fa-external-link-alt"></i> Live Demo</a>
          </div>
        </div>
      `;
      featuredCarousel.appendChild(projectCard);
    });
  }

  async function fetchAllRepos() {
    try {
      let page = 1;
      let allRepos = [];
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://api.github.com/users/jvcataquiz/repos?per_page=100&page=${page}`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              'User-Agent': 'portfolio-site'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API request failed with status ${response.status}`);
        }

        const repos = await response.json();
        const normalizedRepos = Array.isArray(repos) ? repos : [];
        allRepos = allRepos.concat(normalizedRepos);
        hasMore = normalizedRepos.length === 100;
        page++;
      }

      renderRepos(allRepos);
    } catch (error) {
      console.warn('GitHub API unavailable, showing fallback projects.', error);
      renderRepos(fallbackRepos);
    }
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
