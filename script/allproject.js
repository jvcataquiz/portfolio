document.addEventListener('DOMContentLoaded', () => {
  const featuredCarousel = document.getElementById('featured-carousel2');
  const repoCountElement = document.getElementById('repoCount');
  const filterButtons = document.querySelectorAll('.filter-btn');

  let allRepos = [];

  async function fetchAllRepos() {
    let page = 1;
    let hasMore = true;
    allRepos = [];

    try {
      while (hasMore) {
        const response = await fetch(
          `https://api.github.com/users/jvcataquiz/repos?per_page=100&page=${page}`
        );
        const repos = await response.json();
        allRepos = allRepos.concat(repos);
        hasMore = repos.length === 100;
        page++;
      }

      // Sort by last pushed date descending
      allRepos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
      
      if (repoCountElement) repoCountElement.textContent = allRepos.length;

      renderProjects('all');
    } catch (error) {
      console.error('Failed to fetch repos:', error);
    }
  }

  function renderProjects(filter) {
    if (!featuredCarousel) return;

    featuredCarousel.innerHTML = '';

    let filteredRepos = allRepos;

    if (filter !== 'all') {
      filteredRepos = allRepos.filter(repo => {
        const name = repo.name.toLowerCase();
        const desc = (repo.description || '').toLowerCase();
        const lang = (repo.language || '').toLowerCase();
        return (
          lang.includes(filter.toLowerCase()) ||
          name.includes(filter.toLowerCase()) ||
          desc.includes(filter.toLowerCase())
        );
      });
    }

    filteredRepos.forEach(repo => {
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card2 animate';

      const desc = repo.description || 'No description available.';
      const shortDesc = desc.length >= 100
        ? desc.substring(0, 100) + '...'
        : desc.padEnd(100, '\u00A0');
      const name = repo.name || 'No name available.';
      const shortName = name.length > 30 ? name.substring(0, 30) + '...' : name;

      const emojiList = ["💻", "🖥️", "🖱️", "⌨️", "🕹️", "📱", "📡", "🛠️", "⚙️", "🧩", "🤖", "🔋", "💾", "🗄️"];
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];

      projectCard.innerHTML = `
        <div class="project-image2">${emoji}</div>
        <div class="project-content2">
          <h3 class="project-title2">${shortName}</h3>
          <p class="project-description2">${shortDesc}</p>
          <div class="project-tags2">
            <span class="tag2">${repo.language || 'Unknown'}</span>
          </div>
          <div class="project-links2">
            ${repo.html_url ? `<a href="${repo.html_url}" target="_blank" class="project-link2">Code</a>` : ''}
             <a href="#" class="project-link2">
              <i class="fas fa-external-link-alt"></i> Live Demo
              </a>
            </div>
        </div>
      `;

      featuredCarousel.appendChild(projectCard);
    });
  }

  // Filter button event listeners
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeBtn = document.querySelector('.filter-btn.active');
      if (activeBtn) activeBtn.classList.remove('active');
      btn.classList.add('active');
      renderProjects(btn.dataset.filter);
    });
  });

  fetchAllRepos();
});
