/**
 * Data Loader System
 * JSON 기반 동적 콘텐츠 로딩 시스템
 * projects.json 및 blog.json 데이터를 로드하여 UI 생성
 */

class DataLoader {
  constructor() {
    this.projects = [];
    this.blog = [];
    this.categories = {};
    this.isLoaded = false;
  }

  /**
   * Initialize data loader
   */
  async init() {
    try {
      await Promise.all([
        this.loadProjects(),
        this.loadBlog()
      ]);
      this.isLoaded = true;
      console.log('✓ Data Loader initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Data Loader:', error);
      return false;
    }
  }

  /**
   * Load projects from JSON
   */
  async loadProjects() {
    try {
      const response = await fetch('./data/projects.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      this.projects = data.projects || [];
      this.categories.projects = data.categories || {};

      console.log(`✓ Loaded ${this.projects.length} projects`);
      return this.projects;
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  /**
   * Load blog posts from JSON
   */
  async loadBlog() {
    try {
      const response = await fetch('./data/blog.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      this.blog = data.posts || [];
      this.categories.blog = data.categories || {};

      console.log(`✓ Loaded ${this.blog.length} blog posts`);
      return this.blog;
    } catch (error) {
      console.error('Error loading blog:', error);
      return [];
    }
  }

  /**
   * Get projects by category
   * @param {string} category - Project category
   * @returns {Array} Filtered projects
   */
  getProjectsByCategory(category) {
    if (!category || category === 'all') return this.projects;
    return this.projects.filter(project => project.category === category);
  }

  /**
   * Get projects by year
   * @param {number} year - Project year
   * @returns {Array} Filtered projects
   */
  getProjectsByYear(year) {
    return this.projects.filter(project => project.year === year);
  }

  /**
   * Get featured projects
   * @returns {Array} Featured projects
   */
  getFeaturedProjects() {
    return this.projects.filter(project => project.featured);
  }

  /**
   * Get blog posts by category
   * @param {string} category - Blog category
   * @returns {Array} Filtered posts
   */
  getBlogByCategory(category) {
    if (!category || category === 'all') return this.blog;
    return this.blog.filter(post => post.category === category);
  }

  /**
   * Get featured blog posts
   * @returns {Array} Featured posts
   */
  getFeaturedBlog() {
    return this.blog.filter(post => post.featured);
  }

  /**
   * Search projects and blog
   * @param {string} query - Search query
   * @returns {Object} Search results
   */
  search(query) {
    const lowerQuery = query.toLowerCase();

    const projectResults = this.projects.filter(project =>
      project.title.toLowerCase().includes(lowerQuery) ||
      project.location.toLowerCase().includes(lowerQuery) ||
      project.subCategory.toLowerCase().includes(lowerQuery)
    );

    const blogResults = this.blog.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    return {
      projects: projectResults,
      blog: blogResults,
      total: projectResults.length + blogResults.length
    };
  }
}

// Project Gallery Renderer
class ProjectGalleryRenderer {
  constructor(dataLoader, containerId = 'project-gallery') {
    this.dataLoader = dataLoader;
    this.container = document.getElementById(containerId);
    this.currentFilter = 'all';
    this.currentYear = null;
    this.owlInstance = null;
  }

  /**
   * Render project gallery as carousel
   * @param {Array} projects - Projects to render
   */
  render(projects = null) {
    if (!this.container) return;

    const projectsToRender = projects || this.dataLoader.projects;

    if (projectsToRender.length === 0) {
      this.destroy();
      this.container.classList.remove('owl-carousel', 'owl-theme');
      this.container.innerHTML = '<p class="text-center cyber-text-glow">프로젝트를 찾을 수 없습니다.</p>';
      return;
    }

    const cards = projectsToRender.map((project, index) => this.createProjectCard(project, index));

    // 이미 만든 캐러셀은 파괴하지 않고 항목만 교체한다 (필터 클릭 반응 개선, 전략 문서 J2)
    if (this.owlInstance) {
      $(this.container)
        .trigger('replace.owl.carousel', [$(cards)])
        .trigger('refresh.owl.carousel')
        .trigger('to.owl.carousel', [0, 0]);
      return;
    }

    this.container.innerHTML = '';
    this.container.classList.add('owl-carousel', 'owl-theme');
    cards.forEach(card => this.container.appendChild(card));
    this.initializeCarousel();
  }

  /**
   * Initialize Owl Carousel
   *  - loop 대신 rewind: loop 복제 항목(최대 38개)과 그 이미지 요청을 없앤다
   *  - 모바일은 점(dot) 대신 화살표만: 점 37개가 가로로 넘쳐 페이지가 축소 표시되던 문제
   *  - 자동재생은 캐러셀이 화면에 보이고 탭이 활성일 때만, 감속 모드·데이터 절약 모드에서는 끈다
   */
  initializeCarousel() {
    if (typeof $ === 'undefined' || typeof $.fn.owlCarousel === 'undefined') return;

    const $el = $(this.container);
    this.owlInstance = $el.owlCarousel({
      items: 3,
      margin: 30,
      loop: false,
      rewind: true,
      autoRefresh: false,
      autoplay: false,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
      nav: true,
      dots: true,
      navText: ['<i class="uil uil-arrow-left"></i>', '<i class="uil uil-arrow-right"></i>'],
      responsive: {
        0: { items: 1, dots: false },
        768: { items: 2 },
        992: { items: 3 }
      }
    });

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData || !('IntersectionObserver' in window)) return;

    let inView = false;
    let playing = false;
    const sync = () => {
      const shouldPlay = inView && !document.hidden;
      if (shouldPlay === playing) return;
      playing = shouldPlay;
      $el.trigger(shouldPlay ? 'play.owl.autoplay' : 'stop.owl.autoplay', shouldPlay ? [5000] : []);
    };
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }).observe(this.container);
    document.addEventListener('visibilitychange', sync);
  }

  /**
   * Create project card element for carousel
   * @param {Object} project - Project data
   * @param {number} index - Card index for animation delay
   * @returns {HTMLElement} Project card
   */
  createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'item';

    const categoryLabel = this.dataLoader.categories.projects[project.category] || project.category;

    card.innerHTML = `
      <a href="${project.blogUrl}" target="_blank" class="cyber-project-card-link" data-project-id="${project.id}">
        <div class="cyber-project-card">
          <div class="cyber-project-image">
            ${this.createProjectImage(project)}
            <div class="cyber-badge position-absolute top-0 end-0 m-3">${categoryLabel}</div>
          </div>
          <div class="p-4">
            <h3 class="h5 mb-2 cyber-text-glow">${project.title}</h3>
            <p class="text-light mb-3">
              <i class="uil uil-map-marker"></i> ${project.location}
            </p>
            ${'' /* 구축일자(YYYY-MM-DD) 표시는 숨긴다. 다시 보이려면 아래 <p> 를 주석 밖으로 꺼낸다.
            <p class="text-light mb-3">
              <i class="uil uil-calendar-alt"></i> ${project.date}
            </p>
            */}
            <p class="small text-light mb-0">${project.subCategory}</p>
          </div>
        </div>
      </a>
    `;

    return card;
  }

  /**
   * 프로젝트 사진 마크업
   *  - width/height 로 자리를 미리 잡아 사진 도착 시 카드가 밀리지 않게 한다 (전략 문서 I4-①)
   *  - projects.json 의 avif/webp 가 있으면 <picture> 로 제공하고, image(JPEG)는 폴백으로 유지한다 (I4-b)
   */
  createProjectImage(project) {
    const size = project.imageWidth || 736;
    const img = `<img src="${project.image}" alt="${project.title}" class="img-fluid rounded-top" width="${size}" height="${size}" loading="lazy" decoding="async">`;
    if (!project.avif && !project.webp) return img;
    const sizes = '(min-width: 992px) 360px, (min-width: 768px) 50vw, 100vw';
    return `<picture>
              ${project.avif ? `<source type="image/avif" srcset="${project.avif}" sizes="${sizes}">` : ''}
              ${project.webp ? `<source type="image/webp" srcset="${project.webp}" sizes="${sizes}">` : ''}
              ${img}
            </picture>`;
  }

  /**
   * Render filter buttons
   * @param {string} filterContainerId - Filter container ID
   */
  renderFilters(filterContainerId = 'project-filters') {
    const filterContainer = document.getElementById(filterContainerId);
    if (!filterContainer) return;

    const categories = this.dataLoader.categories.projects;
    filterContainer.innerHTML = `
      <button class="cyber-btn active me-2 mb-2" data-filter="all">전체</button>
      ${Object.keys(categories).map(key => `
        <button class="cyber-btn me-2 mb-2" data-filter="${key}">${categories[key]}</button>
      `).join('')}
    `;

    // 눌린 버튼 표시를 먼저 그린 뒤 다음 태스크에서 캐러셀을 갱신한다 (탭 반응성)
    filterContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const button = e.currentTarget;
        const filter = button.getAttribute('data-filter');
        filterContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        setTimeout(() => this.applyFilter(filter), 0);
      });
    });
  }

  /**
   * Apply filter to gallery
   * @param {string} filter - Filter type
   */
  applyFilter(filter) {
    this.currentFilter = filter;
    const projects = this.dataLoader.getProjectsByCategory(filter);
    this.render(projects);
  }

  /**
   * Destroy carousel instance
   */
  destroy() {
    if (this.owlInstance) {
      $(this.container).trigger('destroy.owl.carousel');
      this.owlInstance = null;
    }
  }
}

// Blog Renderer
class BlogRenderer {
  constructor(dataLoader, containerId = 'blog-container') {
    this.dataLoader = dataLoader;
    this.container = document.getElementById(containerId);
    this.currentFilter = 'all';
  }

  /**
   * Render blog posts
   * @param {Array} posts - Posts to render
   * @param {boolean} featured - Only show featured posts
   */
  render(posts = null, featured = false) {
    if (!this.container) {
      console.error('Blog container not found');
      return;
    }

    const postsToRender = posts || (featured ? this.dataLoader.getFeaturedBlog() : this.dataLoader.blog);

    // Clear container
    this.container.innerHTML = '';

    if (postsToRender.length === 0) {
      this.container.innerHTML = '<p class="text-center cyber-text-glow">블로그 포스트를 찾을 수 없습니다.</p>';
      return;
    }

    // Create blog cards
    postsToRender.forEach((post, index) => {
      const card = this.createBlogCard(post, index);
      this.container.appendChild(card);
    });

    console.log(`✓ Rendered ${postsToRender.length} blog posts`);
  }

  /**
   * Create blog card element
   * @param {Object} post - Blog post data
   * @param {number} index - Card index
   * @returns {HTMLElement} Blog card
   */
  createBlogCard(post, index) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.style.animationDelay = `${index * 0.1}s`;

    const categoryLabel = this.dataLoader.categories.blog[post.category] || post.category;

    card.innerHTML = `
      <article class="cyber-card cyber-card-holographic h-100" style="cursor: pointer;">
        <div class="cyber-badge mb-3">${categoryLabel}</div>
        <h3 class="h5 mb-3" style="color: #ffffff; font-weight: bold;">${post.title}</h3>
        <p class="text-muted mb-3">${post.excerpt}</p>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <small class="text-muted">
            <i class="uil uil-user-circle"></i> ${post.author}
          </small>
          <small class="text-muted">
            <i class="uil uil-clock"></i> ${post.readTime}
          </small>
        </div>
        <div class="d-flex flex-wrap gap-2 mb-3">
          ${post.tags.slice(0, 3).map(tag => `
            <span class="badge bg-dark text-cyber-cyan">#${tag}</span>
          `).join('')}
        </div>
        <small class="text-muted d-block mb-0">
          <i class="uil uil-calendar-alt"></i> ${post.date}
        </small>
      </article>
    `;

    // Add click event to scroll to blog CTA section
    card.addEventListener('click', () => {
      const blogCta = document.getElementById('blog-cta');
      if (blogCta) {
        blogCta.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    return card;
  }

  /**
   * Render category filters
   * @param {string} filterContainerId - Filter container ID
   */
  renderFilters(filterContainerId = 'blog-filters') {
    const filterContainer = document.getElementById(filterContainerId);
    if (!filterContainer) return;

    const categories = this.dataLoader.categories.blog;
    filterContainer.innerHTML = `
      <button class="cyber-btn active me-2 mb-2" data-filter="all">전체</button>
      ${Object.keys(categories).map(key => `
        <button class="cyber-btn me-2 mb-2" data-filter="${key}">${categories[key]}</button>
      `).join('')}
    `;

    // Add event listeners
    filterContainer.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        this.applyFilter(filter);

        // Update active state
        filterContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      });
    });
  }

  /**
   * Apply filter to blog
   * @param {string} filter - Filter type
   */
  applyFilter(filter) {
    this.currentFilter = filter;
    const posts = this.dataLoader.getBlogByCategory(filter);
    this.render(posts);
  }
}

// Export classes
window.DataLoader = DataLoader;
window.ProjectGalleryRenderer = ProjectGalleryRenderer;
window.BlogRenderer = BlogRenderer;

// 프로젝트·블로그 섹션이 화면 800px 이내로 다가오면 JSON 을 받아 그린다 (전략 문서 J2-③)
function initDataSections() {
  const gallery = document.getElementById('project-gallery');
  const blog = document.getElementById('blog-container');
  if (!gallery && !blog) return;

  let started = false;
  const start = async () => {
    if (started) return;
    started = true;
    const dataLoader = new DataLoader();
    await dataLoader.init();
    window.dataLoaderInstance = dataLoader;

    if (gallery) {
      const projectGallery = new ProjectGalleryRenderer(dataLoader);
      projectGallery.render();
      projectGallery.renderFilters();
      window.projectGalleryInstance = projectGallery;
    }
    if (blog) {
      const blogRenderer = new BlogRenderer(dataLoader);
      blogRenderer.render(null, true); // Show featured posts by default
      blogRenderer.renderFilters();
      window.blogRendererInstance = blogRenderer;
    }
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      start();
    }
  }, { rootMargin: '800px 0px' });
  [gallery, blog].filter(Boolean).forEach(el => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDataSections);
} else {
  initDataSections();
}
