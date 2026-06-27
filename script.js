document.addEventListener("DOMContentLoaded", function () {
  
  // Initialize Firebase using user's config (US-Central Region)
  const firebaseConfig = {
    apiKey: "AIzaSyBJCRphhOTiLuK8_5HF1F_co9CJrBXGnGs",
    authDomain: "ilhamdho-downloader.firebaseapp.com",
    databaseURL: "https://ilhamdho-downloader-default-rtdb.firebaseio.com",
    projectId: "ilhamdho-downloader",
    storageBucket: "ilhamdho-downloader.firebasestorage.app",
    messagingSenderId: "343531450168",
    appId: "1:343531450168:web:ee1e820fe03f7d70b51bcd",
    measurementId: "G-GEY66M43CG"
  };
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  /* ==========================================
     1. PARSE GUEST NAME FROM URL PARAMETER
     ========================================== */
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to');
  const guestNameElement = document.getElementById("guest-name");
  const rsvpNameInput = document.getElementById("rsvp-name");

  if (guestParam) {
    // Replace '+' or '%20' with space and decode
    const cleanGuestName = decodeURIComponent(guestParam.replace(/\+/g, ' '));
    guestNameElement.textContent = cleanGuestName;
    rsvpNameInput.value = cleanGuestName; // Pre-fill RSVP form name
  } else {
    guestNameElement.textContent = "Tamu Undangan";
  }

  // Initialize 3D floating leaves effect
  initFloatingLeaves();

  /* ==========================================
     2. COVER OVERLAY & AUTOPLAY AUDIO BYPASS
     ========================================== */
  const coverOverlay = document.getElementById("cover-overlay");
  const btnOpenInvite = document.getElementById("btn-open-invite");
  const bgMusic = document.getElementById("bg-music");
  const audioControl = document.getElementById("audio-control");
  const audioBtn = document.getElementById("audio-btn");
  const audioIcon = document.getElementById("audio-icon");
  let isPlaying = false;

  btnOpenInvite.addEventListener("click", function () {
    // Play Background Music
    playMusic();
    
    // Unlock scrolling
    document.body.classList.remove("scroll-locked");
    
    // Slide cover up
    coverOverlay.classList.add("fade-out");
    
    // Show floating audio controls
    audioControl.classList.remove("hidden");
    
    // Remove cover from DOM after animation completes (1.2s)
    setTimeout(() => {
      coverOverlay.style.display = "none";
      // Trigger scroll anim once immediately upon opening
      triggerScrollAnimations();
    }, 1200);
  });

  function playMusic() {
    bgMusic.play().then(() => {
      isPlaying = true;
      audioIcon.className = "fas fa-music fa-spin";
    }).catch(error => {
      console.log("Autoplay music blocked: ", error);
      isPlaying = false;
      audioIcon.className = "fas fa-play";
    });
  }

  function pauseMusic() {
    bgMusic.pause();
    isPlaying = false;
    audioIcon.className = "fas fa-play";
  }

  audioBtn.addEventListener("click", function () {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });

  /* ==========================================
     3. COUNTDOWN TIMER
     ========================================== */
  // Set wedding date: December 14, 2026, 08:00:00 (Jakarta Time - UTC+7)
  const targetDate = new Date("December 14, 2026 08:00:00").getTime();

  const countdownInterval = setInterval(function () {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";
      return;
    }

    // Time calculations
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Format output with leading zeros
    document.getElementById("days").textContent = String(days).padStart(2, '0');
    document.getElementById("hours").textContent = String(hours).padStart(2, '0');
    document.getElementById("minutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("seconds").textContent = String(seconds).padStart(2, '0');
  }, 1000);

  /* ==========================================
     4. GALLERY LIGHTBOX MODAL
     ========================================== */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightboxClose = document.querySelector(".lightbox-close");

  galleryItems.forEach(item => {
    item.addEventListener("click", function () {
      const img = this.querySelector(".gallery-img");
      lightbox.style.display = "block";
      lightboxImg.src = img.src;
      lightboxCaption.textContent = img.alt;
    });
  });

  // Close lightbox clicking cross
  lightboxClose.addEventListener("click", function () {
    lightbox.style.display = "none";
  });

  // Close lightbox clicking outside image
  lightbox.addEventListener("click", function (e) {
    if (e.target !== lightboxImg && e.target !== lightboxCaption) {
      lightbox.style.display = "none";
    }
  });

  /* ==========================================
     5. DYNAMIC RSVP & TICKET GENERATOR
     ========================================== */
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpStatus = document.getElementById("rsvp-status");
  const guestCountGroup = document.getElementById("guest-count-group");
  const rsvpFormCard = document.getElementById("rsvp-form-card");
  const rsvpTicketCard = document.getElementById("rsvp-ticket-card");
  const ticketGuestName = document.getElementById("ticket-guest-name");
  const ticketGuestStatus = document.getElementById("ticket-guest-status");
  const ticketGuestCount = document.getElementById("ticket-guest-count");
  const ticketQrImg = document.getElementById("ticket-qr-img");
  const ticketIdElement = document.getElementById("ticket-id");
  const btnShareWa = document.getElementById("btn-share-wa");
  const btnResetRsvp = document.getElementById("btn-reset-rsvp");

  // Show/Hide guest count based on attendance selection
  rsvpStatus.addEventListener("change", function () {
    if (this.value === "Hadir") {
      guestCountGroup.style.display = "flex";
    } else {
      guestCountGroup.style.display = "none";
    }
  });

  // Handle RSVP Submit
  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("rsvp-name").value.trim();
    const status = rsvpStatus.value;
    const guests = status === "Hadir" ? document.getElementById("rsvp-guests").value : "0";
    const message = document.getElementById("rsvp-message").value.trim();

    // Create unique Ticket/Confirmation ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `PASS-${randomNum}`;

    // 1. Save wish/comment to LocalStorage guestbook
    const newWish = {
      name: name,
      status: status,
      message: message,
      timestamp: new Date().toISOString()
    };
    saveWish(newWish);

    // If Attending, generate & show QR Guest Pass
    if (status === "Hadir") {
      ticketGuestName.textContent = name;
      ticketGuestStatus.textContent = "HADIR";
      ticketGuestStatus.className = "ticket-val text-success";
      ticketGuestCount.textContent = `${guests} Orang`;
      ticketIdElement.textContent = ticketId;

      // Generate real QR Code pointing to a confirmation mockup data
      const qrData = JSON.stringify({
        id: ticketId,
        name: name,
        guests: guests,
        event: "Alkodri & Jumro Wedding"
      });
      // QR server API to load clean QR code
      ticketQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=2c2925&bgcolor=faf8f5&data=${encodeURIComponent(qrData)}`;

      // Swap RSVP form card with Ticket Card
      rsvpFormCard.style.opacity = "0";
      setTimeout(() => {
        rsvpFormCard.classList.add("hidden");
        rsvpTicketCard.classList.remove("hidden");
        rsvpTicketCard.style.opacity = "1";
      }, 400);

      // Setup WhatsApp share content
      btnShareWa.onclick = function () {
        const textMessage = `Halo Alkodri & Jumro, saya ingin mengonfirmasi kehadiran di acara pernikahan kalian.%0A%0A*Nama:* ${encodeURIComponent(name)}%0A*Kehadiran:* Hadir (${guests} Orang)%0A*Kode Tiket:* ${ticketId}%0A*Pesan:* "${encodeURIComponent(message)}"%0A%0A*Sampai jumpa di lokasi acara!*`;
        window.open(`https://wa.me/6281234567890?text=${textMessage}`, '_blank');
      };

    } else {
      // If Not Attending, show thankful popup and reset form
      alert(`Terima kasih konfirmasinya, ${name}. Ucapan doa Anda telah terkirim ke buku tamu kami!`);
      rsvpForm.reset();
      guestCountGroup.style.display = "none";
    }
  });

  // Reset RSVP form (change responses)
  btnResetRsvp.addEventListener("click", function () {
    rsvpTicketCard.style.opacity = "0";
    setTimeout(() => {
      rsvpTicketCard.classList.add("hidden");
      rsvpFormCard.classList.remove("hidden");
      rsvpFormCard.style.opacity = "1";
      rsvpForm.reset();
      guestCountGroup.style.display = "none";
    }, 400);
  });

  /* ==========================================
     6. FIREBASE REALTIME GUEST BOOK (Ucapan & Doa)
     ========================================== */
  const guestbookFeed = document.getElementById("guestbook-feed");

  // Initial default wishes to pre-populate if database is empty
  const defaultWishes = [
    {
      name: "Yudi Telok",
      status: "Hadir",
      message: "Selamat ya Kodri & Jumro! Semoga lancar sampai hari H dan selalu dilimpahi keberkahan.",
      timestamp: new Date().toISOString()
    },
    {
      name: "Ledi Jay",
      status: "Hadir",
      message: "Happy Wedding Jumro & Kodri! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.",
      timestamp: new Date().toISOString()
    },
    {
      name: "Idel Kalangan",
      status: "Hadir",
      message: "Selamat menempuh hidup baru bro Kodri dan Jumro! Sukses acaranya.",
      timestamp: new Date().toISOString()
    },
    {
      name: "Mama Rania",
      status: "Hadir",
      message: "Selamat ya untuk kedua mempelai! Semoga bahagia selamanya dan cepat diberikan momongan.",
      timestamp: new Date().toISOString()
    },
    {
      name: "Eli Daging",
      status: "Hadir",
      message: "Barakallahu lakum wa baraka 'alaikum. Selamat ya Alkodri & Jumro!",
      timestamp: new Date().toISOString()
    },
    {
      name: "Wak Elon",
      status: "Hadir",
      message: "Happy wedding Jumro & Alkodri! Lancar-lancar sampai hari H ya.",
      timestamp: new Date().toISOString()
    },
    {
      name: "Dela Racun",
      status: "Hadir",
      message: "Selamat ya Kodri & Jumro! Bahagia selalu sampai akhir hayat ya.",
      timestamp: new Date().toISOString()
    },
    {
      name: "Iwan Sapi",
      status: "Hadir",
      message: "Selamat menempuh hidup baru Alkodri dan Jumro! Berkah selalu.",
      timestamp: new Date().toISOString()
    },
    {
      name: "Lina Warung",
      status: "Hadir",
      message: "Masya Allah, selamat ya Jumro & Alkodri! Semoga bahagia lahir batin.",
      timestamp: new Date().toISOString()
    }
  ];

  // Reference to wishes path in Firebase Realtime Database
  const wishesRef = db.ref("wishes");

  // Load and render wishes in real-time
  wishesRef.on("value", function (snapshot) {
    const data = snapshot.val();
    
    // If database has no wishes, seed with default wishes
    if (!data) {
      defaultWishes.forEach(wish => {
        wishesRef.push(wish);
      });
      return;
    }

    // Convert object of wishes to array and sort by timestamp descending
    const wishes = [];
    for (const key in data) {
      wishes.push(data[key]);
    }
    wishes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    renderWishes(wishes);
  });

  function saveWish(newWish) {
    // Save to Firebase Realtime Database
    wishesRef.push(newWish);
  }

  function renderWishes(wishes) {
    guestbookFeed.innerHTML = "";

    wishes.forEach(wish => {
      const firstLetter = wish.name ? wish.name.charAt(0).toUpperCase() : "?";
      const statusClass = wish.status === "Hadir" ? "status-hadir" : "status-tidak";
      const statusText = wish.status === "Hadir" ? "Hadir" : "Tidak Hadir";

      const itemHTML = `
        <div class="guestbook-item">
          <div class="guest-avatar">${firstLetter}</div>
          <div class="guest-msg-content">
            <div class="guest-msg-header">
              <h4 class="guest-msg-name">${wish.name}</h4>
              <span class="guest-msg-status ${statusClass}">${statusText}</span>
            </div>
            <p class="guest-msg-text">${wish.message}</p>
          </div>
        </div>
      `;
      guestbookFeed.insertAdjacentHTML("beforeend", itemHTML);
    });
  }

  /* ==========================================
     7. COPY REKENING / ALAMAT TO CLIPBOARD + TOAST
     ========================================== */
  const copyButtons = document.querySelectorAll(".btn-copy");
  const toast = document.getElementById("toast");

  copyButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      const textToCopy = this.getAttribute("data-copy");

      navigator.clipboard.writeText(textToCopy).then(() => {
        // Show customized toast text depending on what was copied
        if (textToCopy.match(/^\d+$/)) {
          toast.textContent = "Nomor rekening berhasil disalin!";
        } else {
          toast.textContent = "Alamat pengiriman berhasil disalin!";
        }
        
        // Trigger Toast show anim
        toast.classList.add("show");
        
        // Hide after 2.5s
        setTimeout(() => {
          toast.classList.remove("show");
        }, 2500);
      }).catch(err => {
        console.error("Gagal menyalin teks: ", err);
      });
    });
  });

  /* ==========================================
     8. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
     ========================================== */
  const animatedElements = document.querySelectorAll(".scroll-animate");

  function triggerScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15 // Triggers when 15% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target); // Animates only once
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }

  // Set initial trigger scroll animations fallback
  triggerScrollAnimations();

  /* ==========================================
     11. 3D FLOATING LEAVES EFFECT
     ========================================== */
  function initFloatingLeaves() {
    const container = document.createElement("div");
    container.id = "particles-container";
    document.body.appendChild(container);

    const leafSVG = `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path d="M10,80 Q40,60 80,10 Q60,40 10,80" fill="#C09A67" opacity="0.6"/>
      </svg>
    `;

    const leafCount = 15;
    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement("div");
      leaf.className = "floating-leaf";
      leaf.innerHTML = leafSVG;
      
      // Randomize initial positions & 3D animation offsets
      const startX = Math.random() * 100; // left position in %
      const size = 15 + Math.random() * 20; // width/height in px
      const delay = Math.random() * 12; // animation delay in seconds
      const duration = 8 + Math.random() * 8; // animation duration in seconds
      const driftX = (Math.random() - 0.5) * 200; // horizontal drift in px
      const driftZ = (Math.random() - 0.5) * 300; // depth drift in px

      leaf.style.left = `${startX}%`;
      leaf.style.width = `${size}px`;
      leaf.style.height = `${size}px`;
      leaf.style.animationDelay = `${delay}s`;
      leaf.style.animationDuration = `${duration}s`;
      leaf.style.setProperty("--drift-x", `${driftX}px`);
      leaf.style.setProperty("--drift-z", `${driftZ}px`);

      container.appendChild(leaf);
    }
  }

});
