// DOM Elements
const citySelect = document.getElementById('city-select');
const viewScheduleBtn = document.getElementById('view-schedule-btn');
const verseSection = document.getElementById('verse-section');
const prayerCardsSection = document.getElementById('prayer-cards-section');
const prayerCardsContainer = document.getElementById('prayer-cards-container');

// API Base URL
const API_BASE_URL = 'https://api.myquran.com/v3/sholat';

// Prayer name mapping (API response -> Display)
const prayerNameMap = {
    subuh: 'Subuh',
    dzuhur: 'Dhuhur',
    ashar: 'Ashar',
    maghrib: 'Maghrib',
    isya: 'Isya'
};

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Fetch all cities on page load
async function fetchCities() {
    try {
        const response = await fetch(`${API_BASE_URL}/kabkota/semua`);
        const data = await response.json();

        if (data.status && data.data) {
            populateCityDropdown(data.data);
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error fetching cities:', error);
        citySelect.innerHTML = '<option value="">Gagal memuat kota</option>';
    }
}

// Populate the city dropdown
function populateCityDropdown(cities) {
    citySelect.innerHTML = '<option value="" disabled selected>Pilih Kota</option>';

    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.lokasi;
        citySelect.appendChild(option);
    });

    viewScheduleBtn.disabled = false;
}

// Fetch prayer schedule for selected city
async function fetchPrayerSchedule(cityId) {
    const originalBtnText = viewScheduleBtn.textContent;

    // Set loading state
    viewScheduleBtn.disabled = true;
    viewScheduleBtn.textContent = 'Memuat...';

    try {
        const response = await fetch(`${API_BASE_URL}/jadwal/${cityId}/today`);
        const data = await response.json();

        if (data.status && data.data) {
            displayPrayerSchedule(data.data);
            verseSection.classList.add('hidden');
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error fetching prayer schedule:', error);
        showError('Gagal memuat jadwal solat. Silakan coba lagi.');
    } finally {
        // Reset button state
        viewScheduleBtn.disabled = false;
        viewScheduleBtn.textContent = originalBtnText;
    }
}

// Display prayer schedule cards
function displayPrayerSchedule(data) {
    const dateString = getTodayDate();
    const jadwal = data.jadwal;

    // Clear previous cards
    prayerCardsContainer.innerHTML = '';

    // Create card for each prayer
    Object.keys(prayerNameMap).forEach(key => {
        const card = document.createElement('div');
        card.className = 'prayer-card';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'prayer-name';
        nameSpan.textContent = prayerNameMap[key];

        const timeSpan = document.createElement('span');
        timeSpan.className = 'prayer-time';
        timeSpan.textContent = jadwal[dateString][key];

        card.appendChild(nameSpan);
        card.appendChild(timeSpan);
        
        prayerCardsContainer.appendChild(card);
    });

    console.log(prayerCardsContainer);

    // Show cards, hide verse
    verseSection.classList.add('hidden');
    prayerCardsSection.classList.remove('hidden');
}

// Show error message
function showError(message) {
    prayerCardsContainer.innerHTML = `<div class="error-message">${message}</div>`;
    verseSection.classList.add('hidden');
    prayerCardsSection.classList.remove('hidden');
}

// Event Listener: Button click
viewScheduleBtn.addEventListener('click', () => {
    const selectedCityId = citySelect.value;
    if (selectedCityId) {
        fetchPrayerSchedule(selectedCityId);
    }
});

// Initialize: Fetch cities on page load
document.addEventListener('DOMContentLoaded', fetchCities);