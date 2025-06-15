
class MovieWebsite {
    constructor() {
        this.movies = [];
        this.currentPage = 1;
        this.moviesPerPage = 20;
        this.filteredMovies = [...this.movies];
        this.searchTimeout = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadMoviesFromFirestore();
        this.updateAdminButton();
        
        // Create directories if they don't exist (simulated)
        if (!localStorage.getItem('moviesInitialized')) {
            // this.initializeDefaultMovies();
            localStorage.setItem('moviesInitialized', 'true');
        }
    }
    
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.searchMovies(e.target.value);
            }, 300);
        });
        
        searchBtn.addEventListener('click', () => {
            this.searchMovies(searchInput.value);
        });
        
        // Input method toggle for admin form
        document.addEventListener('change', (e) => {
            if (e.target.name === 'inputMethod') {
                const urlInputs = document.getElementById('urlInputs');
                const fileInputs = document.getElementById('fileInputs');
                
                if (e.target.value === 'url') {
                    urlInputs.style.display = 'block';
                    fileInputs.style.display = 'none';
                } else {
                    urlInputs.style.display = 'none';
                    fileInputs.style.display = 'block';
                }
            }
        });
        
        // Admin panel
        const adminBtn = document.getElementById('adminBtn');
        const adminModal = document.getElementById('adminModal');
        const loginModal = document.getElementById('loginModal');
        const closeBtn = document.querySelector('.close');
        const loginCloseBtn = document.querySelector('.login-close');
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
        
        closeBtn.addEventListener('click', () => {
            adminModal.style.display = 'none';
        });
        
        loginCloseBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.
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


    handleLogin();
        });
        
        adminForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMovie();
        });
    }
    
    initializeDefaultMovies() {
        // Add some sample movies for demonstration
        const sampleMovies = [
            {
                id: 1,
                title: "The Dark Knight",
                description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...",
                bannerUrl: "https://picsum.photos/300/450?random=1",
                downloadUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
                dateAdded: new Date().toISOString()
            },
            {
                id: 2,
                title: "Inception",
                description: "A thief who steals corporate secrets through dream-sharing technology...",
                bannerUrl: "https://picsum.photos/300/450?random=2",
                downloadUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
                dateAdded: new Date().toISOString()
            },
            {
                id: 3,
                title: "Interstellar",
                description: "A team of explorers travel through a wormhole in space...",
                bannerUrl: "https://picsum.photos/300/450?random=3",
                downloadUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4",
                dateAdded: new Date().toISOString()
            }
        ];
        
        this.movies = sampleMovies;
        this.filteredMovies = [...this.movies];
        this.saveMovieToFirestore(newMovie);
    }
    
    searchMovies(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredMovies = [...this.movies];
        } else {
            this.filteredMovies = this.movies.filter(movie =>
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.description.toLowerCase().includes(searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.loadMoviesFromFirestore();
    }
    
    displayMovies() {
        const movieGrid = document.getElementById('movieGrid');
        const loading = document.getElementById('loading');
        
        loading.style.display = 'block';
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            const startIndex = (this.currentPage - 1) * this.moviesPerPage;
            const endIndex = startIndex + this.moviesPerPage;
            const moviesToShow = this.filteredMovies.slice(startIndex, endIndex);
            
            movieGrid.innerHTML = '';
            
            if (moviesToShow.length === 0) {
                movieGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: rgba(255,255,255,0.7);">No movies found matching your search.</p>';
            } else {
                moviesToShow.forEach(movie => {
                    const movieCard = this.createMovieCard(movie);
                    movieGrid.appendChild(movieCard);
                });
            }
            
            loading.style.display = 'none';
        }, 300);
    }
    
    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.setAttribute('data-movie-id', movie.id);
        
        card.innerHTML = `
            <img src="${movie.bannerUrl}" alt="${movie.title}" class="movie-poster" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMUExQTFBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNGRkZGRkYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'" crossorigin="anonymous">
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-description">${movie.description}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.downloadMovie(movie);
        });
        
        return card;
    }
    
    downloadMovie(movie) {
        // Get click count for this specific movie
        const movieClickKey = `clickCount_${movie.id}`;
        let clickCount = parseInt(localStorage.getItem(movieClickKey) || '0');
        
        // Increment click count
        clickCount++;
        localStorage.setItem(movieClickKey, clickCount.toString());
        
        // Check if user needs to view ads first
        if (clickCount <= 5) {
            // Show ad redirection message
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #ff6b35, #ff8c42);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                font-weight: bold;
                text-align: center;
                max-width: 300px;
            `;
            
            const remaining = 5 - clickCount + 1;
            notification.innerHTML = `
                <div style="margin-bottom: 8px;">Please view ad to continue</div>
                <div style="font-size: 0.9em; opacity: 0.9;">${remaining} more ${remaining === 1 ? 'click' : 'clicks'} until download</div>
            `;
            
            document.body.appendChild(notification);
            
            // Remove notification after 4 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 4000);
            
            // Redirect to ad page
            window.open('https://otieu.com/4/9421362', '_blank');
            
        } else {
            // User has completed ad views, provide actual download
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #28a745, #20c997);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                font-weight: bold;
            `;
            notification.textContent = `Starting download: ${movie.title}`;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
            
            // Trigger actual download
            if (movie.downloadUrl && movie.downloadUrl !== '#') {
                // Create a temporary link and click it to start download
                const link = document.createElement('a');
                link.href = movie.downloadUrl;
                link.download = `${movie.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
                link.target = '_blank';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Reset click count after successful download
                localStorage.removeItem(movieClickKey);
                
            } else {
                // Fallback for movies without download URLs
                setTimeout(() => {
                    alert(`Download URL not available for "${movie.title}". Please contact admin to add download link.`);
                }, 500);
            }
        }
    }
    
    setupPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredMovies.length / this.moviesPerPage);
        
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        if (this.currentPage > 1) {
            const prevBtn = this.createPageButton('‹', this.currentPage - 1);
            pagination.appendChild(prevBtn);
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            pagination.appendChild(this.createPageButton(1, 1));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-btn';
                pagination.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = this.createPageButton(i, i);
            if (i === this.currentPage) {
                pageBtn.classList.add('active');
            }
            pagination.appendChild(pageBtn);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-btn';
                pagination.appendChild(ellipsis);
            }
            pagination.appendChild(this.createPageButton(totalPages, totalPages));
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            const nextBtn = this.createPageButton('›', this.currentPage + 1);
            pagination.appendChild(nextBtn);
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return btn;
    }
    
    addMovie() {
        const titleInput = document.getElementById('movieTitle');
        const descriptionInput = document.getElementById('movieDescription');
        const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (!title) {
            alert('Please enter a movie title.');
            return;
        }
        
        let bannerUrl, downloadUrl;
        
        if (inputMethod === 'url') {
            // URL input method
            const bannerUrlInput = document.getElementById('bannerUrl');
            const downloadUrlInput = document.getElementById('downloadUrl');
            
            bannerUrl = bannerUrlInput.value.trim();
            downloadUrl = downloadUrlInput.value.trim();
            
            if (!bannerUrl || !downloadUrl) {
                alert('Please enter both banner URL and download URL.');
                return;
            }
            
            // Validate URLs
            try {
                new URL(bannerUrl);
                new URL(downloadUrl);
            } catch (e) {
                alert('Please enter valid URLs.');
                return;
            }
            
        } else {
            // File input method
            const bannerInput = document.getElementById('movieBanner');
            const movieInput = document.getElementById('movieFile');
            
            if (!bannerInput.files[0] || !movieInput.files[0]) {
                alert('Please select both banner image and movie file.');
                return;
            }
            
            // Create object URLs for local preview
            const bannerFile = bannerInput.files[0];
            const movieFile = movieInput.files[0];
            bannerUrl = URL.createObjectURL(bannerFile);
            downloadUrl = URL.createObjectURL(movieFile);
        }
        
        const newMovie = {
            id: Date.now(),
            title: title,
            description: description || 'No description available.',
            bannerUrl: bannerUrl,
            downloadUrl: downloadUrl,
            dateAdded: new Date().toISOString()
        };
        
        this.movies.unshift(newMovie); // Add to beginning
        this.filteredMovies = [...this.movies];
        this.saveMovieToFirestore(newMovie);
        
        // Reset form
        document.getElementById('adminForm').reset();
        
        // Reset to URL method by default
        document.querySelector('input[name="inputMethod"][value="url"]').checked = true;
        document.getElementById('urlInputs').style.display = 'block';
        document.getElementById('fileInputs').style.display = 'none';
        
        // Refresh displays
        this.loadMoviesFromFirestore();
        this.displayAdminMovies();
        
        alert('Movie added successfully!');
    }
    
    displayAdminMovies() {
        const adminMovieList = document.getElementById('adminMovieList');
        adminMovieList.innerHTML = '';
        
        if (this.movies.length === 0) {
            adminMovieList.innerHTML = '<p style="color: rgba(255,255,255,0.7);">No movies added yet.</p>';
            return;
        }
        
        this.movies.forEach(movie => {
            const movieClickKey = `clickCount_${movie.id}`;
            const clickCount = parseInt(localStorage.getItem(movieClickKey) || '0');
            const remaining = Math.max(0, 5 - clickCount);
            
            const movieItem = document.createElement('div');
            movieItem.className = 'admin-movie-item';
            movieItem.innerHTML = `
                <div style="flex: 1;">
                    <span style="font-weight: bold;">${movie.title}</span>
                    <br>
                    <small style="color: rgba(255,255,255,0.7);">
                        ${remaining > 0 ? `${remaining} ad clicks remaining` : 'Ready for download'}
                    </small>
                </div>
                <div>
                    <button class="reset-btn" onclick="movieWebsite.resetMovieClicks(${movie.id})" style="margin-right: 5px;">Reset Clicks</button>
                    <button class="delete-btn" onclick="movieWebsite.deleteMovie(${movie.id})">Delete</button>
                </div>
            `;
            adminMovieList.appendChild(movieItem);
        });
    }
    
    resetMovieClicks(movieId) {
        const movieClickKey = `clickCount_${movieId}`;
        localStorage.removeItem(movieClickKey);
        this.displayAdminMovies();
        
        const movie = this.movies.find(m => m.id === movieId);
        alert(`Click count reset for "${movie.title}". Users will need to view ads again.`);
    }
    
    deleteMovie(movieId) {
        if (confirm('Are you sure you want to delete this movie?')) {
            this.movies = this.movies.filter(movie => movie.id !== movieId);
            this.filteredMovies = this.filteredMovies.filter(movie => movie.id !== movieId);
            this.saveMovieToFirestore(newMovie);
            
            this.displayMovies();
            this.setupPagination();
            this.displayAdminMovies();
        }
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


    handleLogin() {
        const passwordInput = document.getElementById('adminPassword');
        const password = passwordInput.value;
        
        // Simple password check - in production, use proper authentication
        const adminPassword = 'tahahaya786'; // Change this to your desired password
        
        if (password === adminPassword) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminLoginTime', Date.now().toString());
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('adminModal').style.display = 'block';
            this.displayAdminMovies();
            passwordInput.value = '';
            this.updateAdminButton();
        } else {
            alert('Incorrect password!');
            passwordInput.value = '';
        }
    }
    
    isAdminLoggedIn() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        const loginTime = localStorage.getItem('adminLoginTime');
        
        if (!isLoggedIn || !loginTime) return false;
        
        // Session expires after 1 hour (3600000 ms)
        const sessionDuration = 3600000;
        const currentTime = Date.now();
        
        if (currentTime - parseInt(loginTime) > sessionDuration) {
            this.logout();
            return false;
        }
        
        return isLoggedIn === 'true';
    }
    
    logout() {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        this.updateAdminButton();
    }
    
    updateAdminButton() {
        const adminBtn = document.getElementById('adminBtn');
        if (this.isAdminLoggedIn()) {
            adminBtn.textContent = 'Admin Panel (Logout)';
            adminBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Do you want to logout?')) {
                    this.logout();
                } else {
                    document.getElementById('adminModal').style.display = 'block';
                    this.displayAdminMovies();
                }
            };
        } else {
            adminBtn.textContent = 'Admin Panel';
            adminBtn.onclick = null;
        }
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.movieWebsite = new MovieWebsite();
});

// Performance optimization: Lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    // Observe all images with lazy class
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
});
