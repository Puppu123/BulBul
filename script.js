class MovieWebsite {
    constructor() {
        this.movies = [];
        this.currentPage = 1;
        this.moviesPerPage = 50;
        this.filteredMovies = [];
        this.searchTimeout = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMoviesFromFirestore();
        this.updateAdminButton();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        searchInput.addEventListener('input', this.debounce((e) => {
            this.searchMovies(e.target.value);
        }, 150));

        searchBtn.addEventListener('click', () => {
            this.searchMovies(searchInput.value);
        });

        document.addEventListener('change', (e) => {
            if (e.target.name === 'inputMethod') {
                const urlInputs = document.getElementById('urlInputs');
                const fileInputs = document.getElementById('fileInputs');
                urlInputs.style.display = e.target.value === 'url' ? 'block' : 'none';
                fileInputs.style.display = e.target.value === 'file' ? 'block' : 'none';
            }
        });

        const adminBtn = document.getElementById('adminBtn');
        const adminModal = document.getElementById('adminModal');
        const loginModal = document.getElementById('loginModal');
        const closeBtn = adminModal.querySelector('.close');
        const loginCloseBtn = loginModal.querySelector('.close');
        const adminForm = document.getElementById('adminForm');
        const loginForm = document.getElementById('loginForm');

        adminBtn.addEventListener('click', () => {
            if (this.isAdminLoggedIn()) {
                adminModal.style.display = 'block';
                this.displayAdminMovies();
            } else {
                loginModal.style.display = 'block';
            }
        });

        closeBtn.addEventListener('click', () => adminModal.style.display = 'none');
        loginCloseBtn.addEventListener('click', () => loginModal.style.display = 'none');

        window.addEventListener('click', (e) => {
            if (e.target === adminModal) adminModal.style.display = 'none';
            if (e.target === loginModal) loginModal.style.display = 'none';
        });

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMovie();
        });
    }

    async loadMoviesFromFirestore() {
        const snapshot = await db.collection("movies").orderBy("dateAdded", "desc").get();
        this.movies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.filteredMovies = [...this.movies];
        this.displayMovies();
        this.setupPagination();
    }

    async saveMovieToFirestore(movie) {
        const docRef = await db.collection("movies").add(movie);
        movie.id = docRef.id;
        this.movies.unshift(movie);
        this.filteredMovies = [...this.movies];
        this.displayMovies();
        this.setupPagination();
    }

    searchMovies(query) {
        const term = query.toLowerCase().trim();
        this.filteredMovies = term === ''
            ? [...this.movies]
            : this.movies.filter(movie =>
                movie.title.toLowerCase().includes(term) ||
                movie.description.toLowerCase().includes(term)
            );
        this.currentPage = 1;
        this.displayMovies();
        this.setupPagination();
    }

    displayMovies() {
        const movieGrid = document.getElementById('movieGrid');
        const loading = document.getElementById('loading');
        loading.style.display = 'block';

        requestAnimationFrame(() => {
            const start = (this.currentPage - 1) * this.moviesPerPage;
            const end = start + this.moviesPerPage;
            const moviesToShow = this.filteredMovies.slice(start, end);

            movieGrid.innerHTML = '';
            if (moviesToShow.length === 0) {
                movieGrid.innerHTML = '<p>No movies found.</p>';
            } else {
                moviesToShow.forEach(movie => {
                    const card = document.createElement('div');
                    card.className = 'movie-card';
                    card.innerHTML = `
                        <img src="${movie.bannerUrl}" alt="${movie.title}" class="movie-poster">
                        <div class="movie-info">
                            <div class="movie-title">${movie.title}</div>
                            <div class="movie-description">${movie.description}</div>
                        </div>`;
                    card.addEventListener('click', () => {
                        window.open(movie.downloadUrl, '_blank');
                    });
                    movieGrid.appendChild(card);
                });
            }

            loading.style.display = 'none';
        });
    }

    setupPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredMovies.length / this.moviesPerPage);
        pagination.innerHTML = '';
        if (totalPages <= 1) return;

        if (this.currentPage > 1) {
            pagination.appendChild(this.createPageButton('‹', this.currentPage - 1));
        }

        for (let i = 1; i <= totalPages; i++) {
            const btn = this.createPageButton(i, i);
            if (i === this.currentPage) btn.classList.add('active');
            pagination.appendChild(btn);
        }

        if (this.currentPage < totalPages) {
            pagination.appendChild(this.createPageButton('›', this.currentPage + 1));
        }
    }

    createPageButton(text, page) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.className = 'page-btn';
        btn.addEventListener('click', () => {
            this.currentPage = page;
            this.displayMovies();
            this.setupPagination();
        });
        return btn;
    }

    addMovie() {
        const titleInput = document.getElementById('movieTitle');
        const descriptionInput = document.getElementById('movieDescription');
        const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim() || 'No description.';
        let bannerUrl, downloadUrl;

        if (inputMethod === 'url') {
            bannerUrl = document.getElementById('bannerUrl').value.trim();
            downloadUrl = document.getElementById('downloadUrl').value.trim();
            if (!bannerUrl || !downloadUrl) return alert('Enter banner and download URLs.');
        } else {
            const bannerFile = document.getElementById('movieBanner').files[0];
            const movieFile = document.getElementById('movieFile').files[0];
            if (!bannerFile || !movieFile) return alert('Select both files.');
            bannerUrl = URL.createObjectURL(bannerFile);
            downloadUrl = URL.createObjectURL(movieFile);
        }

        const newMovie = {
            title,
            description,
            bannerUrl,
            downloadUrl,
            dateAdded: new Date().toISOString()
        };

        this.saveMovieToFirestore(newMovie);

        document.getElementById('adminForm').reset();
        document.querySelector('input[value="url"]').checked = true;
        document.getElementById('urlInputs').style.display = 'block';
        document.getElementById('fileInputs').style.display = 'none';
        this.displayAdminMovies();
        alert('Movie added!');
    }

    displayAdminMovies() {
        const list = document.getElementById('adminMovieList');
        list.innerHTML = '';
        if (this.movies.length === 0) {
            list.innerHTML = '<p>No movies added yet.</p>';
            return;
        }

        this.movies.forEach(movie => {
            const div = document.createElement('div');
            div.className = 'admin-movie-item';
            div.innerHTML = `<div><strong>${movie.title}</strong><br><small>${movie.description}</small></div>`;
            list.appendChild(div);
        });
    }

    handleLogin() {
        const input = document.getElementById('adminPassword');
        const adminPassword = 'tahahaya786';

        if (input.value === adminPassword) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminLoginTime', Date.now().toString());
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('adminModal').style.display = 'block';
            this.displayAdminMovies();
            input.value = '';
            this.updateAdminButton();
        } else {
            alert('Incorrect password.');
            input.value = '';
        }
    }

    isAdminLoggedIn() {
        const logged = localStorage.getItem('adminLoggedIn');
        const time = localStorage.getItem('adminLoginTime');
        if (!logged || !time) return false;

        if (Date.now() - parseInt(time) > 3600000) {
            this.logout();
            return false;
        }
        return logged === 'true';
    }

    logout() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        this.updateAdminButton();
    }

    updateAdminButton() {
        const btn = document.getElementById('adminBtn');
        if (this.isAdminLoggedIn()) {
            btn.textContent = 'Admin Panel (Logout)';
            btn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Logout?')) this.logout();
                else {
                    document.getElementById('adminModal').style.display = 'block';
                    this.displayAdminMovies();
                }
            };
        } else {
            btn.textContent = 'Admin Panel';
            btn.onclick = null;
        }
    }

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.movieWebsite = new MovieWebsite();
});
