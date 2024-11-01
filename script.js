const firebaseConfig = {
    apiKey: "AIzaSyC61LqMCJ2u94FFP_ficTFi0qAm2s2b5zk",
    authDomain: "cansufurkan-8514f.firebaseapp.com",
    databaseURL: "https://cansufurkan-8514f-default-rtdb.firebaseio.com",
    projectId: "cansufurkan-8514f",
    storageBucket: "cansufurkan-8514f.appspot.com",
    messagingSenderId: "469450478703",
    appId: "1:469450478703:web:6019d7a41b6508a9b1299a",
    measurementId: "G-5B0936W17P"
  };
// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

let selectedLanguage = 'tr'; // Varsayılan dil

function setLanguage(lang) {
    selectedLanguage = lang;
    localStorage.setItem('selectedLanguage', lang);
    fetchMenuItems();
    loadHeaderText();
}

// Sayfa yüklendiğinde seçili dili kontrol et
document.addEventListener('DOMContentLoaded', () => {
    const lang = localStorage.getItem('selectedLanguage');
    if (lang) {
        selectedLanguage = lang;
    }
    setLanguage(selectedLanguage);
});

// Menü öğelerini Firebase'den çekip kategoriye göre ayırma
function fetchMenuItems() {
    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = ''; // Mevcut içeriği temizle
    const categories = {};

    // Kategorileri çekme
    database.ref('Categories').once('value', (catSnapshot) => {
        const categoryData = catSnapshot.val();

        // Ürünleri çekme
        database.ref('Products').once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const product = childSnapshot.val();
                if (product && product.categoryId) {
                    const categoryId = product.categoryId;
                    if (!categories[categoryId]) {
                        categories[categoryId] = {
                            info: categoryData[categoryId],
                            products: []
                        };
                    }
                    categories[categoryId].products.push(product);
                }
            });

            // Kategorileri ve ürünleri işleme
            for (let categoryId in categories) {
                const categoryInfo = categories[categoryId].info;
                const categoryProducts = categories[categoryId].products;

                // Kategori ismini ve resmini seçili dile göre al
                const categoryName = categoryInfo.names[selectedLanguage] || categoryInfo.names['tr'];
                const categoryImageUrl = categoryInfo.imageUrl;

                // Kategori bölümü oluşturma
                const categoryDiv = document.createElement('div');
                categoryDiv.classList.add('category-container');

                const categoryTitleDiv = document.createElement('div');
                categoryTitleDiv.classList.add('category');

                // Kategori başlığına arka plan resmi ekleme
                categoryTitleDiv.style.backgroundImage = `url(${categoryImageUrl})`;

                const categoryTitle = document.createElement('h2');
                categoryTitle.textContent = categoryName;

                categoryTitleDiv.addEventListener('click', () => {
                    toggleMenu(categoryId);
                });

                categoryTitleDiv.appendChild(categoryTitle);

                const menuItemsDiv = document.createElement('div');
                menuItemsDiv.classList.add('menu-items');
                menuItemsDiv.id = categoryId;

                categoryProducts.forEach(product => {
                    const menuItemDiv = document.createElement('div');
                    menuItemDiv.classList.add('menu-item');

                    // Ürün isimlerini ve açıklamalarını seçili dile göre al
                    const productName = product.names[selectedLanguage] || product.names['tr'];
                    const productDescription = product.descriptions[selectedLanguage] || product.descriptions['tr'];

                    // Güvenli bir şekilde öğeleri oluşturma
                    const img = document.createElement('img');
                    img.src = product.imageUrl;
                    img.alt = productName;

                    const itemInfoDiv = document.createElement('div');
                    itemInfoDiv.classList.add('item-info');

                    const h3 = document.createElement('h3');
                    h3.textContent = productName;

                    const p = document.createElement('p');
                    p.textContent = productDescription;

                    itemInfoDiv.appendChild(h3);
                    itemInfoDiv.appendChild(p);

                    const priceSpan = document.createElement('span');
                    priceSpan.classList.add('price');
                    priceSpan.textContent = `₺${product.price}`;

                    menuItemDiv.appendChild(img);
                    menuItemDiv.appendChild(itemInfoDiv);
                    menuItemDiv.appendChild(priceSpan);

                    menuItemsDiv.appendChild(menuItemDiv);
                });

                categoryDiv.appendChild(categoryTitleDiv);
                categoryDiv.appendChild(menuItemsDiv);
                menuContent.appendChild(categoryDiv);
            }
        });
    });
}

// Menü öğesini aç/kapat ve header'ı küçült
function toggleMenu(categoryId) {
    const menu = document.getElementById(categoryId);
    const header = document.getElementById('header');
    if (menu.style.display === "block") {
        menu.style.display = "none";
        header.classList.remove('shrink');
    } else {
        // Tüm açık menüleri kapat
        const allMenus = document.querySelectorAll('.menu-items');
        allMenus.forEach(m => {
            m.style.display = 'none';
        });

        menu.style.display = "block";
        header.classList.add('shrink');
    }
}

// Scroll event ile header'ı küçültme
// Kaydırma sırasında header küçültme
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('shrink');
    } else {
        header.classList.remove('shrink');
    }
});


// Başlık metinlerini yükle
function loadHeaderText() {
    const restaurantNameElem = document.getElementById('restaurantName');
    const restaurantTaglineElem = document.getElementById('restaurantTagline');

    const headerTextsRef = database.ref(`Languages/${selectedLanguage}/headerTexts`);
    headerTextsRef.once('value', (snapshot) => {
        const texts = snapshot.val();
        if (texts) {
            restaurantNameElem.textContent = texts.restaurantName;
            restaurantTaglineElem.textContent = texts.tagline;
        }
    });
}
