// Global function to calculate penalty
function calculatePenalty(borrowDateString, returnDateString) {
    const borrowDate = new Date(borrowDateString);
    const returnDate = new Date(returnDateString);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 15); // 15 günlük ödünç süresi

    // Normalize dates to compare day counts accurately
    borrowDate.setHours(0, 0, 0, 0);
    returnDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    // Eğer iade tarihi, son teslim tarihinden önceyse veya aynı günse ceza yok
    if (returnDate <= dueDate) {
        return 0;
    }

    // Gecikme günü sayısını hesapla (15 günden sonraki günler)
    const timeDiff = returnDate.getTime() - dueDate.getTime();
    const daysLate = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Günlük ceza ücreti 2 TL
    return daysLate * 2;
}

document.addEventListener('DOMContentLoaded', function () {
    const kitapForm = document.getElementById('kitapForm');
    const kitapListesiAdmin = document.getElementById('kitapListesiAdmin');
    const oduncListesiAdmin = document.getElementById('oduncListesiAdmin'); // Get the loan table body

    // Panel Navigation and Sidebar Toggle (copied from admin-panel.html for completeness if this script is used standalone)
    // However, it's better to keep that in admin-panel.html if it's already there and working.
    // For this task, we focus on CRUD for books.

    if (kitapForm) {
        kitapForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            // Get form values
            const kitapId = document.getElementById('kitapId').value;
            const kitapAdi = document.getElementById('kitapAdi').value.trim();
            const yazar = document.getElementById('yazar').value.trim();
            const isbn = document.getElementById('isbn').value.trim();
            const kategori = document.getElementById('kategori').value.trim();
            const yayinYili = document.getElementById('yayinYili').value;
            const sayfaSayisi = document.getElementById('sayfaSayisi').value;
            const stok = document.getElementById('stok').value;

            // Validate required fields
            if (!kitapAdi || !yazar || !isbn || !stok) {
                alert('Lütfen tüm zorunlu alanları doldurun (Kitap Adı, Yazar, ISBN ve Stok).');
                return;
            }

            // Validate ISBN format (13 digits)
            if (!/^\d{13}$/.test(isbn)) {
                alert('ISBN 13 haneli olmalıdır.');
                return;
            }

            // Validate stock (must be positive)
            if (parseInt(stok) < 0) {
                alert('Stok adedi negatif olamaz.');
                return;
            }

            if (kitapId) {
                // Update existing book
                const row = document.querySelector(`tr[data-id="${kitapId}"]`);
                if (row) {
                    // Check if ISBN is being changed and if it already exists
                    if (row.cells[2].textContent !== isbn) {
                        const existingBooks = kitapListesiAdmin.getElementsByTagName('tr');
                        for (let book of existingBooks) {
                            if (book.dataset.id !== kitapId && book.cells[2].textContent === isbn) {
                                alert('Bu ISBN numarası başka bir kitap için kullanılıyor.');
                                return;
                            }
                        }
                    }

                    // Update book information
                    row.cells[0].textContent = kitapAdi;
                    row.cells[1].textContent = yazar;
                    row.cells[2].textContent = isbn;
                    row.cells[3].textContent = kategori;
                    row.cells[4].textContent = yayinYili;
                    row.cells[5].textContent = sayfaSayisi;
                    row.cells[6].textContent = stok;
                    
                    // Update data attributes
                    row.dataset.kategori = kategori;
                    row.dataset.yayinYili = yayinYili;
                    row.dataset.sayfaSayisi = sayfaSayisi;
                    
                    alert('Kitap başarıyla güncellendi.');
                }
            } else {
                // Check if ISBN already exists
                const existingBooks = kitapListesiAdmin.getElementsByTagName('tr');
                for (let book of existingBooks) {
                    if (book.cells[2].textContent === isbn) {
                        alert('Bu ISBN numarası zaten kullanılıyor.');
                        return;
                    }
                }

                // Add new book
                const newRow = kitapListesiAdmin.insertRow();
                newRow.dataset.id = Date.now();
                newRow.dataset.kategori = kategori;
                newRow.dataset.yayinYili = yayinYili;
                newRow.dataset.sayfaSayisi = sayfaSayisi;
                
                newRow.innerHTML = `
                    <td>${kitapAdi}</td>
                    <td>${yazar}</td>
                    <td>${isbn}</td>
                    <td>${kategori}</td>
                    <td>${yayinYili}</td>
                    <td>${sayfaSayisi}</td>
                    <td>${stok}</td>
                    <td>
                        <button class="btn-sm btn-primary" onclick="editBook(this)"><i class="fas fa-edit"></i> Düzenle</button>
                        <button class="btn-sm btn-danger" onclick="deleteBook(this)"><i class="fas fa-trash"></i> Sil</button>
                    </td>
                `;
                
                alert('Yeni kitap başarıyla eklendi.');
            }
            
            // Reset form
            kitapForm.reset();
            document.getElementById('kitapId').value = '';
            const submitButton = kitapForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-plus-circle"></i> Kitap Ekle';
        });
    }

    // Function to update all penalty fees in the table on load
    function updateAllPenaltyFees() {
        if (!oduncListesiAdmin) return;
        const rows = oduncListesiAdmin.getElementsByTagName('tr');
        const currentDate = new Date(); // Use current date for on-loan books

        for (let row of rows) {
            const borrowDateCell = row.cells[2]; // Alış Tarihi
            const dueDateCell = row.cells[3];    // Teslim Tarihi (for status)
            const statusCell = row.cells[4];     // Durum
            const penaltyCell = row.cells[5];    // Ceza Ücreti

            if (borrowDateCell && statusCell && penaltyCell && dueDateCell) {
                // Update Status based on Due Date
                const dueDate = new Date(dueDateCell.textContent);
                const tempCurrentDateOnly = new Date(); // For status check, compare date parts only
                tempCurrentDateOnly.setHours(0,0,0,0);
                dueDate.setHours(0,0,0,0);

                let currentStatusHTML = statusCell.innerHTML;
                // Only update status if not already İade Edildi
                if (!currentStatusHTML.includes('status-iade-edildi')) {
                    if (tempCurrentDateOnly > dueDate) {
                        statusCell.innerHTML = '<span class="status-gec-kaldi">Geç Kaldı</span>';
                    } else {
                        statusCell.innerHTML = '<span class="status-odunc">Ödünç Verildi</span>';
                    }
                }
                
                // Calculate and Display Penalty based on Borrow Date and Current Date
                if (!currentStatusHTML.includes('status-iade-edildi')){
                    const penaltyAmount = calculatePenalty(borrowDateCell.textContent, currentDate);
                    if (penaltyAmount > 0) {
                        penaltyCell.textContent = `${penaltyAmount} TL`;
                    } else {
                        penaltyCell.textContent = '-';
                    }
                    penaltyCell.setAttribute('data-penalty', penaltyAmount);
                } else {
                    // If returned, show the stored penalty
                    const storedPenalty = penaltyCell.getAttribute('data-penalty') || '0';
                    penaltyCell.textContent = storedPenalty === '0' ? '-' : `${storedPenalty} TL (Ödendi)`;
                }
            }
        }
    }

    // Call on DOM load
    updateAllPenaltyFees(); 
});

// Book Management Functions
document.addEventListener('DOMContentLoaded', function() {
    const kitapForm = document.getElementById('kitapForm');
    const kitapListesiAdmin = document.getElementById('kitapListesiAdmin');

    if (kitapForm) {
        kitapForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const kitapId = document.getElementById('kitapId').value;
            const kitapAdi = document.getElementById('kitapAdi').value.trim();
            const yazar = document.getElementById('yazar').value.trim();
            const isbn = document.getElementById('isbn').value.trim();
            const kategori = document.getElementById('kategori').value.trim();
            const yayinYili = document.getElementById('yayinYili').value;
            const sayfaSayisi = document.getElementById('sayfaSayisi').value;
            const stok = document.getElementById('stok').value;

            // Validate required fields
            if (!kitapAdi || !yazar || !isbn || !stok) {
                alert('Lütfen tüm zorunlu alanları doldurun (Kitap Adı, Yazar, ISBN ve Stok).');
                return;
            }

            // Validate ISBN format (13 digits)
            if (!/^\d{13}$/.test(isbn)) {
                alert('ISBN 13 haneli olmalıdır.');
                return;
            }

            // Validate stock (must be positive)
            if (parseInt(stok) < 0) {
                alert('Stok adedi negatif olamaz.');
                return;
            }

            if (kitapId) {
                // Update existing book
                const row = document.querySelector(`tr[data-id="${kitapId}"]`);
                if (row) {
                    // Check if ISBN is being changed and if it already exists
                    if (row.cells[2].textContent !== isbn) {
                        const existingBooks = kitapListesiAdmin.getElementsByTagName('tr');
                        for (let book of existingBooks) {
                            if (book.dataset.id !== kitapId && book.cells[2].textContent === isbn) {
                                alert('Bu ISBN numarası başka bir kitap için kullanılıyor.');
                                return;
                            }
                        }
                    }

                    // Update book information
                    row.cells[0].textContent = kitapAdi;
                    row.cells[1].textContent = yazar;
                    row.cells[2].textContent = isbn;
                    row.cells[3].textContent = kategori;
                    row.cells[4].textContent = yayinYili;
                    row.cells[5].textContent = sayfaSayisi;
                    row.cells[6].textContent = stok;
                    
                    // Update data attributes
                    row.dataset.kategori = kategori;
                    row.dataset.yayinYili = yayinYili;
                    row.dataset.sayfaSayisi = sayfaSayisi;
                    
                    alert('Kitap başarıyla güncellendi.');
                }
            } else {
                // Check if ISBN already exists
                const existingBooks = kitapListesiAdmin.getElementsByTagName('tr');
                for (let book of existingBooks) {
                    if (book.cells[2].textContent === isbn) {
                        alert('Bu ISBN numarası zaten kullanılıyor.');
                        return;
                    }
                }

                // Add new book
                const newRow = kitapListesiAdmin.insertRow();
                newRow.dataset.id = Date.now();
                newRow.dataset.kategori = kategori;
                newRow.dataset.yayinYili = yayinYili;
                newRow.dataset.sayfaSayisi = sayfaSayisi;
                
                newRow.innerHTML = `
                    <td>${kitapAdi}</td>
                    <td>${yazar}</td>
                    <td>${isbn}</td>
                    <td>${kategori}</td>
                    <td>${yayinYili}</td>
                    <td>${sayfaSayisi}</td>
                    <td>${stok}</td>
                    <td>
                        <button class="btn-sm btn-primary" onclick="editBook(this)"><i class="fas fa-edit"></i> Düzenle</button>
                        <button class="btn-sm btn-danger" onclick="deleteBook(this)"><i class="fas fa-trash"></i> Sil</button>
                    </td>
                `;
                
                alert('Yeni kitap başarıyla eklendi.');
            }
            
            // Reset form
            kitapForm.reset();
            document.getElementById('kitapId').value = '';
            const submitButton = kitapForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-plus-circle"></i> Kitap Ekle';
        });
    }
});

function editBook(button) {
    const row = button.closest('tr');
    const cells = row.cells;
    
    // Populate form with book data
    document.getElementById('kitapId').value = row.dataset.id;
    document.getElementById('kitapAdi').value = cells[0].textContent;
    document.getElementById('yazar').value = cells[1].textContent;
    document.getElementById('isbn').value = cells[2].textContent;
    document.getElementById('kategori').value = cells[3].textContent;
    document.getElementById('yayinYili').value = cells[4].textContent;
    document.getElementById('sayfaSayisi').value = cells[5].textContent;
    document.getElementById('stok').value = cells[6].textContent;
    
    // Change form button text
    const submitButton = document.querySelector('#kitapForm button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save"></i> Güncelle';
    
    // Scroll to form
    document.getElementById('kitapForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteBook(button) {
    if (confirm('Bu kitabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        const row = button.closest('tr');
        const kitapAdi = row.cells[0].textContent;
        
        // Check if book is currently on loan
        const oduncListesi = document.getElementById('oduncListesiAdmin');
        if (oduncListesi) {
            const oduncRows = oduncListesi.getElementsByTagName('tr');
            for (let oduncRow of oduncRows) {
                if (oduncRow.cells[0].textContent === kitapAdi && 
                    !oduncRow.cells[4].textContent.includes('İade Edildi')) {
                    alert('Bu kitap şu anda ödünç verilmiş durumda. Önce iade alınması gerekiyor.');
                    return;
                }
            }
        }
        
        row.remove();
        alert('Kitap başarıyla silindi.');
    }
}

// Updated markAsReturned function
function markAsReturned(buttonEl) {
    if (confirm('Bu kitabı iade edildi olarak işaretlemek istediğinizden emin misiniz?')) {
        const row = buttonEl.closest('tr');
        const borrowDateCell = row.cells[2]; // Alış Tarihi
        const statusCell = row.cells[4];  
        const penaltyCell = row.cells[5]; 
        const currentDate = new Date(); // Bu iade tarihi

        const finalPenalty = calculatePenalty(borrowDateCell.textContent, currentDate);

        statusCell.innerHTML = '<span class="status-iade-edildi">İade Edildi</span>';
        penaltyCell.textContent = finalPenalty > 0 ? `${finalPenalty} TL` : '-';
        penaltyCell.setAttribute('data-penalty', finalPenalty); 

        const actionButtons = row.cells[6].getElementsByTagName('button');
        for(let btn of actionButtons){
            btn.disabled = true;
        }
        buttonEl.textContent = 'İade Alındı'; 

        let alertMessage = 'Kitap iade edildi olarak işaretlendi.';
        if (finalPenalty > 0) {
            alertMessage += ` Tahsil edilen ceza: ${finalPenalty} TL.`;
        }
        alert(alertMessage);
    }
}

// --- Modal Functions ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal if user clicks outside of modal-content
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            closeModal(modal.id);
        }
    });
});
// Make sure closeModal is globally accessible if called from HTML onclick
window.closeModal = closeModal; 

function viewLoanDetails(buttonEl) {
    const row = buttonEl.closest('tr');
    if (!row) return;

    // Assuming cell order: Kitap Adı, Ödünç Alan, Alış Tarihi, Teslim Tarihi, Durum, Ceza
    const kitapAdi = row.cells[0].textContent;
    const oduncAlan = row.cells[1].textContent;
    const alisTarihi = row.cells[2].textContent;
    const teslimTarihi = row.cells[3].textContent;
    const durum = row.cells[4].innerHTML; // Get innerHTML to keep span for status styling
    const cezaUcreti = row.cells[5].textContent;

    document.getElementById('modalKitapAdi').textContent = kitapAdi;
    document.getElementById('modalOduncAlan').textContent = oduncAlan;
    document.getElementById('modalAlisTarihi').textContent = alisTarihi;
    document.getElementById('modalTeslimTarihi').textContent = teslimTarihi;
    document.getElementById('modalDurum').innerHTML = durum; // Use innerHTML here
    document.getElementById('modalCezaUcreti').textContent = cezaUcreti;

    openModal('loanDetailsModal');
}

// Admin Panel JavaScript

// Sidebar Navigation
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    const panels = document.querySelectorAll('.content-panel');
    const panelTitle = document.getElementById('panelBaslik');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // Hide all panels
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Show selected panel
            const targetPanel = document.getElementById(this.getAttribute('data-target'));
            if (targetPanel) {
                targetPanel.classList.add('active');
                panelTitle.textContent = this.querySelector('span').textContent;
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('adminSidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
});

// User Management Functions
document.addEventListener('DOMContentLoaded', function() {
    const kullaniciForm = document.getElementById('kullaniciForm');
    const kullaniciListesiAdmin = document.getElementById('kullaniciListesiAdmin');

    if (kullaniciForm) {
        kullaniciForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const kullaniciId = document.getElementById('kullaniciId').value;
            const adSoyad = document.getElementById('kullaniciAdSoyad').value.trim();
            const email = document.getElementById('kullaniciEmail').value.trim();
            const kullaniciAdi = document.getElementById('kullaniciKullaniciAdi').value.trim();
            const rol = document.getElementById('kullaniciRol').value;
            
            // Validate required fields
            if (!adSoyad || !email || !kullaniciAdi) {
                alert('Lütfen tüm zorunlu alanları doldurun.');
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Lütfen geçerli bir e-posta adresi girin.');
                return;
            }

            // Check if username already exists (except for current user when editing)
            const existingUsers = kullaniciListesiAdmin.getElementsByTagName('tr');
            for (let user of existingUsers) {
                if (user.dataset.id !== kullaniciId && user.cells[2].textContent === kullaniciAdi) {
                    alert('Bu kullanıcı adı zaten kullanılıyor.');
                    return;
                }
            }

            if (kullaniciId) {
                // Update existing user
                const row = document.querySelector(`tr[data-id="${kullaniciId}"]`);
                if (row) {
                    // Check if changing role from admin to non-admin
                    const currentRole = row.cells[3].textContent;
                    if (currentRole === 'Admin' && rol !== 'Admin') {
                        alert('Admin kullanıcının rolü değiştirilemez!');
                        return;
                    }

                    // Update user information
                    row.cells[0].textContent = adSoyad;
                    row.cells[1].textContent = email;
                    row.cells[2].textContent = kullaniciAdi;
                    row.cells[3].textContent = rol;
                    
                    alert('Kullanıcı başarıyla güncellendi.');
                }
            } else {
                // Add new user
                const newRow = kullaniciListesiAdmin.insertRow();
                newRow.dataset.id = Date.now();
                newRow.dataset.status = 'active';
                newRow.dataset.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' ');
                
                newRow.innerHTML = `
                    <td>${adSoyad}</td>
                    <td>${email}</td>
                    <td>${kullaniciAdi}</td>
                    <td>${rol}</td>
                    <td><span class="status-active">Aktif</span></td>
                    <td>${new Date().toLocaleString('tr-TR')}</td>
                    <td>
                        <button class="btn-sm btn-primary" onclick="editUser(this)"><i class="fas fa-edit"></i> Düzenle</button>
                        <button class="btn-sm btn-danger" onclick="deleteUser(this)"><i class="fas fa-trash"></i> Sil</button>
                        <button class="btn-sm btn-warning" onclick="toggleUserStatus(this)"><i class="fas fa-ban"></i> Devre Dışı Bırak</button>
                    </td>
                `;
                
                alert('Yeni kullanıcı başarıyla eklendi.');
            }
            
            // Reset form
            kullaniciForm.reset();
            document.getElementById('kullaniciId').value = '';
            const submitButton = kullaniciForm.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Kullanıcı Ekle';
        });
    }
});

function editUser(button) {
    const row = button.closest('tr');
    const cells = row.cells;
    
    // Populate form with user data
    document.getElementById('kullaniciId').value = row.dataset.id;
    document.getElementById('kullaniciAdSoyad').value = cells[0].textContent;
    document.getElementById('kullaniciEmail').value = cells[1].textContent;
    document.getElementById('kullaniciKullaniciAdi').value = cells[2].textContent;
    document.getElementById('kullaniciRol').value = cells[3].textContent;
    
    // Change form button text
    const submitButton = document.querySelector('#kullaniciForm button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save"></i> Güncelle';
    
    // Scroll to form
    document.getElementById('kullaniciForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteUser(button) {
    const row = button.closest('tr');
    const kullaniciAdi = row.cells[0].textContent;
    
    // Check if user is an admin
    if (row.cells[3].textContent === 'Admin') {
        alert('Admin kullanıcıları silinemez!');
        return;
    }
    
    // Check if user has active loans
    const oduncListesi = document.getElementById('oduncListesiAdmin');
    if (oduncListesi) {
        const oduncRows = oduncListesi.getElementsByTagName('tr');
        for (let oduncRow of oduncRows) {
            if (oduncRow.cells[1].textContent.includes(kullaniciAdi) && 
                !oduncRow.cells[4].textContent.includes('İade Edildi')) {
                alert('Bu kullanıcının iade edilmemiş kitapları var. Önce kitapların iade edilmesi gerekiyor.');
                return;
            }
        }
    }
    
    if (confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        row.remove();
        alert('Kullanıcı başarıyla silindi.');
    }
}

function toggleUserStatus(button) {
    const row = button.closest('tr');
    const statusCell = row.cells[4];
    const currentStatus = row.dataset.status;
    const isAdmin = row.cells[3].textContent === 'Admin';
    
    if (isAdmin) {
        alert('Admin kullanıcıların durumu değiştirilemez!');
        return;
    }
    
    if (currentStatus === 'active') {
        if (confirm('Bu kullanıcıyı devre dışı bırakmak istediğinizden emin misiniz?')) {
            row.dataset.status = 'inactive';
            statusCell.innerHTML = '<span class="status-inactive">Devre Dışı</span>';
            button.className = 'btn-sm btn-success';
            button.innerHTML = '<i class="fas fa-check"></i> Aktifleştir';
            alert('Kullanıcı devre dışı bırakıldı.');
        }
    } else {
        if (confirm('Bu kullanıcıyı aktifleştirmek istediğinizden emin misiniz?')) {
            row.dataset.status = 'active';
            statusCell.innerHTML = '<span class="status-active">Aktif</span>';
            button.className = 'btn-sm btn-warning';
            button.innerHTML = '<i class="fas fa-ban"></i> Devre Dışı Bırak';
            alert('Kullanıcı aktifleştirildi.');
        }
    }
}

// Loan Management Functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize date inputs with today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('oduncAlisTarihi').value = today;
    
    // Set default return date to 15 days from today
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 15);
    document.getElementById('oduncTeslimTarihi').value = returnDate.toISOString().split('T')[0];
    
    // Populate book and user dropdowns
    populateBookDropdown();
    populateUserDropdown();
    
    // Update loan statuses and penalties
    updateAllLoanStatuses();
});

function populateBookDropdown() {
    const kitapSelect = document.getElementById('oduncKitap');
    const kitapListesi = document.getElementById('kitapListesiAdmin');
    
    if (kitapSelect && kitapListesi) {
        const rows = kitapListesi.getElementsByTagName('tr');
        for (let row of rows) {
            const kitapAdi = row.cells[0].textContent;
            const stok = parseInt(row.cells[6].textContent);
            
            // Only add books with available stock
            if (stok > 0) {
                const option = document.createElement('option');
                option.value = kitapAdi;
                option.textContent = `${kitapAdi} (Stok: ${stok})`;
                kitapSelect.appendChild(option);
            }
        }
    }
}

function populateUserDropdown() {
    const kullaniciSelect = document.getElementById('oduncKullanici');
    const kullaniciListesi = document.getElementById('kullaniciListesiAdmin');
    
    if (kullaniciSelect && kullaniciListesi) {
        const rows = kullaniciListesi.getElementsByTagName('tr');
        for (let row of rows) {
            // Only add active users
            if (row.dataset.status === 'active') {
                const adSoyad = row.cells[0].textContent;
                const kullaniciAdi = row.cells[2].textContent;
                const option = document.createElement('option');
                option.value = kullaniciAdi;
                option.textContent = `${adSoyad} (${kullaniciAdi})`;
                kullaniciSelect.appendChild(option);
            }
        }
    }
}

function showNewLoanForm() {
    document.getElementById('yeniOduncForm').style.display = 'block';
    // Refresh dropdowns
    document.getElementById('oduncKitap').innerHTML = '<option value="">Kitap Seçin</option>';
    document.getElementById('oduncKullanici').innerHTML = '<option value="">Kullanıcı Seçin</option>';
    populateBookDropdown();
    populateUserDropdown();
}

function hideNewLoanForm() {
    document.getElementById('yeniOduncForm').style.display = 'none';
}

function saveNewLoan() {
    const kitap = document.getElementById('oduncKitap').value;
    const kullanici = document.getElementById('oduncKullanici').value;
    const alisTarihi = document.getElementById('oduncAlisTarihi').value;
    const teslimTarihi = document.getElementById('oduncTeslimTarihi').value;
    
    if (!kitap || !kullanici || !alisTarihi || !teslimTarihi) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }
    
    // Validate dates
    if (new Date(teslimTarihi) <= new Date(alisTarihi)) {
        alert('Teslim tarihi alış tarihinden sonra olmalıdır.');
        return;
    }
    
    // Check if book is available
    const kitapListesi = document.getElementById('kitapListesiAdmin');
    const kitapRow = Array.from(kitapListesi.getElementsByTagName('tr'))
        .find(row => row.cells[0].textContent === kitap);
    
    if (!kitapRow) {
        alert('Kitap bulunamadı.');
        return;
    }
    
    const stok = parseInt(kitapRow.cells[6].textContent);
    if (stok <= 0) {
        alert('Bu kitabın stokta kopyası kalmamıştır.');
        return;
    }
    
    // Add new loan
    const oduncListesi = document.getElementById('oduncListesiAdmin');
    const newRow = oduncListesi.insertRow();
    newRow.dataset.id = Date.now();
    newRow.dataset.status = 'active';
    newRow.dataset.alisTarihi = alisTarihi;
    newRow.dataset.teslimTarihi = teslimTarihi;
    
    newRow.innerHTML = `
        <td>${kitap}</td>
        <td>${kullanici}</td>
        <td>${alisTarihi}</td>
        <td>${teslimTarihi}</td>
        <td><span class="status-odunc">Ödünç Verildi</span></td>
        <td data-penalty="0">-</td>
        <td>
            <button class="btn-sm btn-success" onclick="markAsReturned(this)"><i class="fas fa-check-circle"></i> İade Al</button>
            <button class="btn-sm btn-info" onclick="viewLoanDetails(this)"><i class="fas fa-info-circle"></i> Detay</button>
            <button class="btn-sm btn-warning" onclick="extendLoan(this)"><i class="fas fa-clock"></i> Süre Uzat</button>
        </td>
    `;
    
    // Update book stock
    kitapRow.cells[6].textContent = stok - 1;
    
    // Hide form and show success message
    hideNewLoanForm();
    alert('Kitap başarıyla ödünç verildi.');
    
    // Refresh book dropdown
    document.getElementById('oduncKitap').innerHTML = '<option value="">Kitap Seçin</option>';
    populateBookDropdown();
}

function extendLoan(button) {
    const row = button.closest('tr');
    const teslimTarihi = new Date(row.dataset.teslimTarihi);
    const yeniTarih = new Date(teslimTarihi);
    yeniTarih.setDate(yeniTarih.getDate() + 7); // Extend by 7 days
    
    if (confirm(`Teslim tarihini ${yeniTarih.toLocaleDateString('tr-TR')} tarihine uzatmak istediğinizden emin misiniz?`)) {
        row.dataset.teslimTarihi = yeniTarih.toISOString().split('T')[0];
        row.cells[3].textContent = yeniTarih.toISOString().split('T')[0];
        alert('Teslim tarihi başarıyla uzatıldı.');
    }
}

function filterLoans() {
    const durumFiltre = document.getElementById('durumFiltre').value;
    const baslangicTarih = document.getElementById('baslangicTarih').value;
    const bitisTarih = document.getElementById('bitisTarih').value;
    
    const rows = document.getElementById('oduncListesiAdmin').getElementsByTagName('tr');
    
    for (let row of rows) {
        let show = true;
        
        // Status filter
        if (durumFiltre !== 'all' && row.dataset.status !== durumFiltre) {
            show = false;
        }
        
        // Date range filter
        if (baslangicTarih) {
            const alisTarihi = new Date(row.dataset.alisTarihi);
            const baslangic = new Date(baslangicTarih);
            if (alisTarihi < baslangic) {
                show = false;
            }
        }
        
        if (bitisTarih) {
            const alisTarihi = new Date(row.dataset.alisTarihi);
            const bitis = new Date(bitisTarih);
            if (alisTarihi > bitis) {
                show = false;
            }
        }
        
        row.style.display = show ? '' : 'none';
    }
}

function updateAllLoanStatuses() {
    const rows = document.getElementById('oduncListesiAdmin').getElementsByTagName('tr');
    const bugun = new Date();
    
    for (let row of rows) {
        if (row.dataset.status === 'returned') continue;
        
        const alisTarihi = row.cells[2].textContent;
        const statusCell = row.cells[4];
        const penaltyCell = row.cells[5];
        
        const ceza = calculatePenalty(alisTarihi, bugun);
        
        if (ceza > 0) {
            // Overdue
            row.dataset.status = 'overdue';
            statusCell.innerHTML = '<span class="status-gec-kaldi">Geç Kaldı</span>';
            penaltyCell.textContent = `${ceza} TL`;
            penaltyCell.dataset.penalty = ceza;
        } else {
            // Active
            row.dataset.status = 'active';
            statusCell.innerHTML = '<span class="status-odunc">Ödünç Verildi</span>';
            penaltyCell.textContent = '-';
            penaltyCell.dataset.penalty = '0';
        }
    }
}

// Update loan statuses every minute
setInterval(updateAllLoanStatuses, 60000);

// Ayarlar Sayfası Fonksiyonları
function ayarlariKaydet() {
    // Ödünç Verme Ayarları
    const maxOduncKitap = document.getElementById('maxOduncKitap').value;
    const oduncSuresi = document.getElementById('oduncSuresi').value;
    const cezaUcreti = document.getElementById('cezaUcreti').value;
    const uzatmaHakki = document.getElementById('uzatmaHakki').value;

    // Bildirim Ayarları
    const hatirlatmaGunu = document.getElementById('hatirlatmaGunu').value;
    const emailBildirim = document.getElementById('emailBildirim').value;
    const smtpSunucu = document.getElementById('smtpSunucu').value;
    const smtpPort = document.getElementById('smtpPort').value;

    // Sistem Ayarları
    const dilSecimi = document.getElementById('dilSecimi').value;
    const temaSecimi = document.getElementById('temaSecimi').value;
    const yedeklemeSikligi = document.getElementById('yedeklemeSikligi').value;
    const oturumSuresi = document.getElementById('oturumSuresi').value;

    // Ayarları localStorage'a kaydet
    const ayarlar = {
        oduncVerme: {
            maxOduncKitap,
            oduncSuresi,
            cezaUcreti,
            uzatmaHakki
        },
        bildirimler: {
            hatirlatmaGunu,
            emailBildirim,
            smtpSunucu,
            smtpPort
        },
        sistem: {
            dilSecimi,
            temaSecimi,
            yedeklemeSikligi,
            oturumSuresi
        }
    };

    localStorage.setItem('kutuphaneAyarlari', JSON.stringify(ayarlar));
    
    // Ayarları uygula
    uygulaAyarlar(ayarlar);
    
    alert('Ayarlar başarıyla kaydedildi.');
}

function ayarlariYukle() {
    const kayitliAyarlar = localStorage.getItem('kutuphaneAyarlari');
    if (kayitliAyarlar) {
        const ayarlar = JSON.parse(kayitliAyarlar);
        
        // Ödünç Verme Ayarları
        document.getElementById('maxOduncKitap').value = ayarlar.oduncVerme.maxOduncKitap;
        document.getElementById('oduncSuresi').value = ayarlar.oduncVerme.oduncSuresi;
        document.getElementById('cezaUcreti').value = ayarlar.oduncVerme.cezaUcreti;
        document.getElementById('uzatmaHakki').value = ayarlar.oduncVerme.uzatmaHakki;

        // Bildirim Ayarları
        document.getElementById('hatirlatmaGunu').value = ayarlar.bildirimler.hatirlatmaGunu;
        document.getElementById('emailBildirim').value = ayarlar.bildirimler.emailBildirim;
        document.getElementById('smtpSunucu').value = ayarlar.bildirimler.smtpSunucu;
        document.getElementById('smtpPort').value = ayarlar.bildirimler.smtpPort;

        // Sistem Ayarları
        document.getElementById('dilSecimi').value = ayarlar.sistem.dilSecimi;
        document.getElementById('temaSecimi').value = ayarlar.sistem.temaSecimi;
        document.getElementById('yedeklemeSikligi').value = ayarlar.sistem.yedeklemeSikligi;
        document.getElementById('oturumSuresi').value = ayarlar.sistem.oturumSuresi;

        // Ayarları uygula
        uygulaAyarlar(ayarlar);
    }
}

function uygulaAyarlar(ayarlar) {
    // Tema değişikliğini uygula
    temaDegistir(ayarlar.sistem.temaSecimi);
    
    // Dil değişikliğini uygula
    dilDegistir(ayarlar.sistem.dilSecimi);
    
    // Oturum süresini güncelle
    oturumSuresiGuncelle(ayarlar.sistem.oturumSuresi);
    
    // Ceza ücretini güncelle
    cezaUcretiGuncelle(ayarlar.oduncVerme.cezaUcreti);
}

function dilDegistir(dil) {
    // Dil değişikliği için gerekli işlemler
    document.documentElement.lang = dil;
    localStorage.setItem('dil', dil);
}

function oturumSuresiGuncelle(sure) {
    // Oturum süresini güncelle (dakika cinsinden)
    localStorage.setItem('oturumSuresi', sure);
}

function cezaUcretiGuncelle(ucret) {
    // Ceza ücretini güncelle
    localStorage.setItem('cezaUcreti', ucret);
}

function yedekAl() {
    // Veritabanı yedeği alma işlemi
    const yedek = {
        kitaplar: Array.from(document.getElementById('kitapListesiAdmin').getElementsByTagName('tr')).map(row => ({
            id: row.dataset.id,
            ad: row.cells[0].textContent,
            yazar: row.cells[1].textContent,
            isbn: row.cells[2].textContent,
            kategori: row.cells[3].textContent,
            yayinYili: row.cells[4].textContent,
            sayfaSayisi: row.cells[5].textContent,
            stok: row.cells[6].textContent
        })),
        kullanicilar: Array.from(document.getElementById('kullaniciListesiAdmin').getElementsByTagName('tr')).map(row => ({
            id: row.dataset.id,
            adSoyad: row.cells[0].textContent,
            email: row.cells[1].textContent,
            kullaniciAdi: row.cells[2].textContent,
            rol: row.cells[3].textContent,
            durum: row.dataset.status,
            sonGiris: row.dataset.lastLogin
        })),
        odunc: Array.from(document.getElementById('oduncListesiAdmin').getElementsByTagName('tr')).map(row => ({
            id: row.dataset.id,
            kitap: row.cells[0].textContent,
            kullanici: row.cells[1].textContent,
            alisTarihi: row.cells[2].textContent,
            teslimTarihi: row.cells[3].textContent,
            durum: row.dataset.status,
            ceza: row.cells[5].dataset.penalty
        })),
        ayarlar: JSON.parse(localStorage.getItem('kutuphaneAyarlari') || '{}')
    };

    // Yedeği indir
    const yedekStr = JSON.stringify(yedek, null, 2);
    const blob = new Blob([yedekStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kutuphane_yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function yedekYukle() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const yedek = JSON.parse(e.target.result);
                
                if (confirm('Yedeği yüklemek istediğinizden emin misiniz? Mevcut veriler silinecektir.')) {
                    // Kitapları yükle
                    const kitapListesi = document.getElementById('kitapListesiAdmin');
                    kitapListesi.innerHTML = '';
                    yedek.kitaplar.forEach(kitap => {
                        const row = kitapListesi.insertRow();
                        row.dataset.id = kitap.id;
                        row.dataset.kategori = kitap.kategori;
                        row.dataset.yayinYili = kitap.yayinYili;
                        row.dataset.sayfaSayisi = kitap.sayfaSayisi;
                        row.innerHTML = `
                            <td>${kitap.ad}</td>
                            <td>${kitap.yazar}</td>
                            <td>${kitap.isbn}</td>
                            <td>${kitap.kategori}</td>
                            <td>${kitap.yayinYili}</td>
                            <td>${kitap.sayfaSayisi}</td>
                            <td>${kitap.stok}</td>
                            <td>
                                <button class="btn-sm btn-primary" onclick="editBook(this)"><i class="fas fa-edit"></i> Düzenle</button>
                                <button class="btn-sm btn-danger" onclick="deleteBook(this)"><i class="fas fa-trash"></i> Sil</button>
                            </td>
                        `;
                    });

                    // Kullanıcıları yükle
                    const kullaniciListesi = document.getElementById('kullaniciListesiAdmin');
                    kullaniciListesi.innerHTML = '';
                    yedek.kullanicilar.forEach(kullanici => {
                        const row = kullaniciListesi.insertRow();
                        row.dataset.id = kullanici.id;
                        row.dataset.status = kullanici.durum;
                        row.dataset.lastLogin = kullanici.sonGiris;
                        row.innerHTML = `
                            <td>${kullanici.adSoyad}</td>
                            <td>${kullanici.email}</td>
                            <td>${kullanici.kullaniciAdi}</td>
                            <td>${kullanici.rol}</td>
                            <td><span class="status-${kullanici.durum}">${kullanici.durum === 'active' ? 'Aktif' : 'Devre Dışı'}</span></td>
                            <td>${kullanici.sonGiris}</td>
                            <td>
                                <button class="btn-sm btn-primary" onclick="editUser(this)"><i class="fas fa-edit"></i> Düzenle</button>
                                <button class="btn-sm btn-danger" onclick="deleteUser(this)"><i class="fas fa-trash"></i> Sil</button>
                                <button class="btn-sm ${kullanici.durum === 'active' ? 'btn-warning' : 'btn-success'}" onclick="toggleUserStatus(this)">
                                    <i class="fas ${kullanici.durum === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                                    ${kullanici.durum === 'active' ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                                </button>
                            </td>
                        `;
                    });

                    // Ödünç kayıtlarını yükle
                    const oduncListesi = document.getElementById('oduncListesiAdmin');
                    oduncListesi.innerHTML = '';
                    yedek.odunc.forEach(odunc => {
                        const row = oduncListesi.insertRow();
                        row.dataset.id = odunc.id;
                        row.dataset.status = odunc.durum;
                        row.dataset.alisTarihi = odunc.alisTarihi;
                        row.dataset.teslimTarihi = odunc.teslimTarihi;
                        row.innerHTML = `
                            <td>${odunc.kitap}</td>
                            <td>${odunc.kullanici}</td>
                            <td>${odunc.alisTarihi}</td>
                            <td>${odunc.teslimTarihi}</td>
                            <td><span class="status-${odunc.durum}">${odunc.durum === 'active' ? 'Ödünç Verildi' : odunc.durum === 'overdue' ? 'Geç Kaldı' : 'İade Edildi'}</span></td>
                            <td data-penalty="${odunc.ceza}">${odunc.ceza === '0' ? '-' : `${odunc.ceza} TL`}</td>
                            <td>
                                ${odunc.durum !== 'returned' ? `
                                    <button class="btn-sm btn-success" onclick="markAsReturned(this)"><i class="fas fa-check-circle"></i> İade Al</button>
                                    <button class="btn-sm btn-info" onclick="viewLoanDetails(this)"><i class="fas fa-info-circle"></i> Detay</button>
                                    <button class="btn-sm btn-warning" onclick="extendLoan(this)"><i class="fas fa-clock"></i> Süre Uzat</button>
                                ` : `
                                    <button class="btn-sm btn-info" onclick="viewLoanDetails(this)"><i class="fas fa-info-circle"></i> Detay</button>
                                `}
                            </td>
                        `;
                    });

                    // Ayarları yükle
                    if (yedek.ayarlar) {
                        localStorage.setItem('kutuphaneAyarlari', JSON.stringify(yedek.ayarlar));
                        ayarlariYukle();
                    }

                    alert('Yedek başarıyla yüklendi.');
                }
            } catch (error) {
                alert('Yedek dosyası geçersiz veya bozuk.');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function sifreDegistir() {
    const eskiSifre = prompt('Mevcut şifrenizi girin:');
    if (!eskiSifre) return;

    // Burada gerçek bir uygulamada şifre doğrulaması yapılmalı
    const yeniSifre = prompt('Yeni şifrenizi girin:');
    if (!yeniSifre) return;

    const sifreTekrar = prompt('Yeni şifrenizi tekrar girin:');
    if (!sifreTekrar) return;

    if (yeniSifre !== sifreTekrar) {
        alert('Şifreler eşleşmiyor!');
        return;
    }

    // Şifre değişikliğini kaydet
    localStorage.setItem('adminSifre', yeniSifre);
    alert('Şifreniz başarıyla değiştirildi.');
}

function temaDegistir(tema) {
    document.body.className = tema === 'dark' ? 'panel-page dark-theme' : 'panel-page';
    localStorage.setItem('tema', tema);
}

// Sayfa yüklendiğinde ayarları yükle
document.addEventListener('DOMContentLoaded', function() {
    ayarlariYukle();
    
    // Tema değişikliği dinleyicisi
    document.getElementById('temaSecimi').addEventListener('change', function(e) {
        temaDegistir(e.target.value);
    });
    
    // Dil değişikliği dinleyicisi
    document.getElementById('dilSecimi').addEventListener('change', function(e) {
        dilDegistir(e.target.value);
    });
    
    // Oturum süresi değişikliği dinleyicisi
    document.getElementById('oturumSuresi').addEventListener('change', function(e) {
        oturumSuresiGuncelle(e.target.value);
    });
    
    // Ceza ücreti değişikliği dinleyicisi
    document.getElementById('cezaUcreti').addEventListener('change', function(e) {
        cezaUcretiGuncelle(e.target.value);
    });
});

// Çıkış Yapma Fonksiyonu
function cikisYap() {
    // Oturum bilgilerini temizle
    localStorage.removeItem('adminOturum');
    localStorage.removeItem('sonGiris');
    
    // Kullanıcıyı giriş sayfasına yönlendir
    window.location.href = 'index.html';
}

// Sayfa yüklendiğinde çıkış butonuna event listener ekle
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Çıkış butonuna tıklama olayını ekle
    const cikisButonu = document.querySelector('.nav-item.logout');
    if (cikisButonu) {
        cikisButonu.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
                cikisYap();
            }
        });
    }
});

// Randevu Yönetimi Fonksiyonları
const randevuCards = document.querySelector('.randevu-cards');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');

// Randevuları localStorage'dan al
function getRandevular() {
    const randevular = localStorage.getItem('randevular');
    return randevular ? JSON.parse(randevular) : [];
}

// Randevuları localStorage'a kaydet
function saveRandevular(randevular) {
    localStorage.setItem('randevular', JSON.stringify(randevular));
}

// Randevuları göster
function randevulariGoster(filter = 'tumu', searchTerm = '') {
    const randevular = getRandevular();
    randevuCards.innerHTML = '';

    // Filtreleme ve arama
    const filteredRandevular = randevular.filter(randevu => {
        const matchesFilter = filter === 'tumu' || randevu.durum === filter;
        const matchesSearch = !searchTerm || 
            randevu.kullaniciAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            randevu.calismaAlani.toLowerCase().includes(searchTerm.toLowerCase()) ||
            randevu.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Randevuları tarihe göre sırala (en yeniden en eskiye)
    filteredRandevular.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

    if (filteredRandevular.length === 0) {
        randevuCards.innerHTML = '<div class="no-data">Randevu bulunamadı</div>';
        return;
    }

    filteredRandevular.forEach(randevu => {
        const card = document.createElement('div');
        card.className = 'randevu-card';
        card.innerHTML = `
            <div class="randevu-header">
                <h4>${randevu.kullaniciAdi}</h4>
                <span class="durum ${randevu.durum}">${randevu.durum.charAt(0).toUpperCase() + randevu.durum.slice(1)}</span>
            </div>
            <div class="randevu-body">
                <p><i class="fas fa-calendar"></i> ${randevu.tarih}</p>
                <p><i class="fas fa-clock"></i> ${randevu.saat}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${randevu.calismaAlani}</p>
                <p><i class="fas fa-envelope"></i> ${randevu.email}</p>
                ${randevu.notlar ? `<p><i class="fas fa-sticky-note"></i> ${randevu.notlar}</p>` : ''}
            </div>
            <div class="randevu-footer">
                ${randevu.durum === 'beklemede' ? `
                    <button class="btn-success" onclick="randevuDurumDegistir('${randevu.id}', 'onaylandi')">
                        <i class="fas fa-check"></i> Onayla
                    </button>
                    <button class="btn-danger" onclick="randevuDurumDegistir('${randevu.id}', 'reddedildi')">
                        <i class="fas fa-times"></i> Reddet
                    </button>
                ` : ''}
                ${randevu.durum === 'onaylandi' ? `
                    <button class="btn-danger" onclick="randevuDurumDegistir('${randevu.id}', 'iptal')">
                        <i class="fas fa-ban"></i> İptal Et
                    </button>
                ` : ''}
            </div>
        `;
        randevuCards.appendChild(card);
    });
}

// Randevu durumunu değiştir
function randevuDurumDegistir(randevuId, yeniDurum) {
    const randevular = getRandevular();
    const randevuIndex = randevular.findIndex(r => r.id === randevuId);
    
    if (randevuIndex === -1) {
        alert('Randevu bulunamadı!');
        return;
    }

    const randevu = randevular[randevuIndex];
    const eskiDurum = randevu.durum;
    randevu.durum = yeniDurum;
    
    saveRandevular(randevular);
    randevulariGoster(document.querySelector('.filter-btn.active').dataset.filter, searchInput.value);

    // E-posta bildirimi gönder
    const durumMesaji = {
        'onaylandi': 'Randevunuz onaylanmıştır.',
        'reddedildi': 'Randevunuz reddedilmiştir.',
        'iptal': 'Randevunuz iptal edilmiştir.'
    };

    const emailBody = `
        Sayın ${randevu.kullaniciAdi},
        
        ${durumMesaji[yeniDurum]}
        
        Randevu Detayları:
        Tarih: ${randevu.tarih}
        Saat: ${randevu.saat}
        Çalışma Alanı: ${randevu.calismaAlani}
        
        İyi çalışmalar dileriz.
        Kütüphane Yönetimi
    `;

    sendEmail(randevu.email, 'Randevu Durumu Güncellendi', emailBody);
}

// E-posta gönder
function sendEmail(to, subject, body) {
    Email.send({
        SecureToken: "YOUR-SECURE-TOKEN", // SMTP.js'den alınacak token
        To: to,
        From: "kutuphane@example.com",
        Subject: subject,
        Body: body
    }).then(
        message => console.log("E-posta gönderildi:", message)
    );
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...

    // Randevu yönetimi için event listener'lar
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                randevulariGoster(button.dataset.filter, searchInput.value);
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            randevulariGoster(activeFilter, searchInput.value);
        });
    }

    // Randevu paneli aktif olduğunda randevuları göster
    const randevuPanel = document.getElementById('randevuYonetimiPanel');
    if (randevuPanel) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('active')) {
                    randevulariGoster();
                }
            });
        });

        observer.observe(randevuPanel, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
});

// Test randevuları oluştur
function createTestRandevular() {
    const testRandevular = [
        {
            id: '1',
            kullaniciAdi: 'Ahmet Yılmaz',
            email: 'ahmet.yilmaz@example.com',
            tarih: '2024-03-20',
            saat: '10:00',
            calismaAlani: 'Sessiz Çalışma Odası 1',
            durum: 'beklemede',
            notlar: 'Ders çalışmak için randevu talep edildi.',
            olusturmaTarihi: '2024-03-15T09:30:00'
        },
        {
            id: '2',
            kullaniciAdi: 'Ayşe Demir',
            email: 'ayse.demir@example.com',
            tarih: '2024-03-21',
            saat: '14:30',
            calismaAlani: 'Grup Çalışma Odası 2',
            durum: 'onaylandi',
            notlar: 'Grup projesi için toplantı.',
            olusturmaTarihi: '2024-03-14T15:45:00'
        },
        {
            id: '3',
            kullaniciAdi: 'Mehmet Kaya',
            email: 'mehmet.kaya@example.com',
            tarih: '2024-03-19',
            saat: '16:00',
            calismaAlani: 'Sessiz Çalışma Odası 3',
            durum: 'reddedildi',
            notlar: 'Araştırma için randevu talep edildi.',
            olusturmaTarihi: '2024-03-13T11:20:00'
        },
        {
            id: '4',
            kullaniciAdi: 'Zeynep Şahin',
            email: 'zeynep.sahin@example.com',
            tarih: '2024-03-22',
            saat: '09:00',
            calismaAlani: 'Grup Çalışma Odası 1',
            durum: 'iptal',
            notlar: 'Seminer hazırlığı için randevu.',
            olusturmaTarihi: '2024-03-15T10:15:00'
        },
        {
            id: '5',
            kullaniciAdi: 'Ali Öztürk',
            email: 'ali.ozturk@example.com',
            tarih: '2024-03-23',
            saat: '13:00',
            calismaAlani: 'Sessiz Çalışma Odası 2',
            durum: 'beklemede',
            notlar: 'Tez çalışması için randevu talep edildi.',
            olusturmaTarihi: '2024-03-16T14:30:00'
        }
    ];

    // Eğer localStorage'da randevu yoksa test verilerini ekle
    if (!localStorage.getItem('randevular')) {
        saveRandevular(testRandevular);
    }
}

// Sayfa yüklendiğinde test randevularını oluştur
document.addEventListener('DOMContentLoaded', function() {
    createTestRandevular();
    // ... existing code ...
}); 