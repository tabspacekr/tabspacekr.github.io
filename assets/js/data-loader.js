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
    if (!this.container) {
      console.error('Project gallery container not found');
      return;
    }

    const projectsToRender = projects || this.dataLoader.projects;

    // Destroy existing owl carousel if exists
    if (this.owlInstance) {
      $(this.container).trigger('destroy.owl.carousel');
      this.owlInstance = null;
    }

    // Clear container
    this.container.innerHTML = '';

    if (projectsToRender.length === 0) {
      this.container.innerHTML = '<p class="text-center cyber-text-glow">프로젝트를 찾을 수 없습니다.</p>';
      return;
    }

    // Add owl-carousel class
    this.container.classList.add('owl-carousel', 'owl-theme');

    // Create project cards
    projectsToRender.forEach((project, index) => {
      const card = this.createProjectCard(project, index);
      this.container.appendChild(card);
    });

    // Initialize Owl Carousel
    this.initializeCarousel();

    console.log(`✓ Rendered ${projectsToRender.length} project cards in carousel`);
  }

  /**
   * Initialize Owl Carousel
   */
  initializeCarousel() {
    if (typeof $ === 'undefined' || typeof $.fn.owlCarousel === 'undefined') {
      console.error('Owl Carousel not available');
      return;
    }

    this.owlInstance = $(this.container).owlCarousel({
      items: 3,
      margin: 30,
      loop: true,
      autoplay: true,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
      nav: true,
      dots: true,
      navText: ['<i class="uil uil-arrow-left"></i>', '<i class="uil uil-arrow-right"></i>'],
      responsive: {
        0: {
          items: 1
        },
        768: {
          items: 2
        },
        992: {
          items: 3
        }
      }
    });
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
    card.style.animationDelay = `${index * 0.1}s`;

    const categoryLabel = this.dataLoader.categories.projects[project.category] || project.category;

    card.innerHTML = `
      <a href="${project.blogUrl}" target="_blank" class="cyber-project-card-link" data-project-id="${project.id}">
        <div class="cyber-project-card">
          <div class="cyber-project-image">
            <img src="${project.image}" alt="${project.title}" class="img-fluid rounded-top" loading="lazy">
            <div class="cyber-badge position-absolute top-0 end-0 m-3">${categoryLabel}</div>
          </div>
          <div class="p-4">
            <h3 class="h5 mb-2 cyber-text-glow">${project.title}</h3>
            <p class="text-light mb-2">
              <i class="uil uil-map-marker"></i> ${project.location}
            </p>
            <p class="text-light mb-3">
              <i class="uil uil-calendar-alt"></i> ${project.date}
            </p>
            <p class="small text-light mb-0">${project.subCategory}</p>
          </div>
        </div>
      </a>
    `;

    return card;
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

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize data loader
  const dataLoader = new DataLoader();
  await dataLoader.init();

  // Store globally
  window.dataLoaderInstance = dataLoader;

  // Initialize project gallery if container exists
  if (document.getElementById('project-gallery')) {
    const projectGallery = new ProjectGalleryRenderer(dataLoader);
    projectGallery.render();
    projectGallery.renderFilters();
    window.projectGalleryInstance = projectGallery;
  }

  // Initialize blog if container exists
  if (document.getElementById('blog-container')) {
    const blogRenderer = new BlogRenderer(dataLoader);
    blogRenderer.render(null, true); // Show featured posts by default
    blogRenderer.renderFilters();
    window.blogRendererInstance = blogRenderer;
  }

  console.log('✓ Data Loader system initialized');
});
