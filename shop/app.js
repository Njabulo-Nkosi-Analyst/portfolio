const SUPABASE_URL = 'https://dlrkbpianpatztugqekd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WxaNOwW3TB6nnAYysChjGQ_sHJiDS6E';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cart = JSON.parse(localStorage.getItem('green_cart')) || [];

// 1. DYNAMIC BANNER FROM SUPABASE
async function fetchBanner() {
    const { data, error } = await db.from('banners').select('*').limit(1).single();
    if (data && !error) {
        const hero = document.getElementById('hero-banner');
        const content = document.getElementById('hero-data');
        hero.style.backgroundImage = `url('${data.image_url}')`;
        content.innerHTML = `
            <span class="discount-tag">${data.promo_label || 'Special Offer'}</span>
            <h1>${data.title}</h1>
            <p>${data.subtitle}</p>
            <button class="shop-now-btn" style="background:var(--green); color:white; border:none; padding:15px 35px; border-radius:30px; font-weight:bold; cursor:pointer;" onclick="document.querySelector('.main-container').scrollIntoView({behavior:'smooth'})">Shop Now</button>
        `;
    }
}

// 2. CATEGORIES (RIBBON AT TOP)
async function fetchCategories() {
    const { data } = await db.from('categories').select('*');
    const list = document.getElementById('category-list');
    if (list && data) {
        let html = `<li class="active" onclick="filterProducts('all', this)">All Products</li>`;
        html += data.map(cat => `<li onclick="filterProducts(${cat.id}, this)">${cat.name}</li>`).join('');
        list.innerHTML = html;
    }
}

// 3. PRODUCTS GRID
async function fetchProducts(catId = 'all', search = '') {
    let query = db.from('products').select('*');
    if (catId !== 'all') query = query.eq('category_id', catId);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data } = await query;
    renderGrid(data);
}

function renderGrid(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = products.map(prod => {
        const isOutOfStock = prod.stock_quantity <= 0;
        return `
            <div class="card">
                <span class="tag">${prod.is_organic ? '🌿 Organic' : 'Fresh'}</span>
                <img src="${prod.image_url}" alt="${prod.name}">
                <h4>${prod.name}</h4>
                <p class="unit">${prod.unit}</p>
                <p class="price">R${prod.price}</p>
                <button class="add-btn" ${isOutOfStock ? 'disabled style="background:#ccc"' : ''} 
                    onclick="addToCart('${prod.id}', '${prod.name}', ${prod.price}, '${prod.image_url}')">
                    ${isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                </button>
            </div>
        `;
    }).join('');
}

// 4. FILTER & SEARCH
window.filterProducts = (categoryId, element) => {
    document.querySelectorAll('#category-list li').forEach(li => li.classList.remove('active'));
    if(element) element.classList.add('active');
    fetchProducts(categoryId);
};

document.getElementById('global-search')?.addEventListener('input', (e) => {
    fetchProducts('all', e.target.value);
});

// 5. CART LOGIC
window.addToCart = (productId, name, price, image) => {
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += 1;
    else cart.push({ id: productId, name, price, image, quantity: 1 });
    saveAndRefresh();
    document.getElementById('cart-sidebar').classList.add('active');
};

function saveAndRefresh() {
    localStorage.setItem('green_cart', JSON.stringify(cart));
    updateCartUI();
    renderCartItems();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = count;
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-msg">Your bag is empty.</p>';
        totalEl.innerText = 'R0.00';
        return;
    }
    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <img src="${item.image}">
                <div class="cart-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">R${item.price} x ${item.quantity}</p>
                </div>
            </div>
        `;
    }).join('');
    totalEl.innerText = `R${total.toFixed(2)}`;
}

// 6. INITIALIZE
document.getElementById('cart-btn').onclick = () => document.getElementById('cart-sidebar').classList.add('active');
document.getElementById('close-cart').onclick = () => document.getElementById('cart-sidebar').classList.remove('active');

async function init() {
    await fetchBanner();
    await fetchCategories();
    await fetchProducts();
    updateCartUI();
    if (window.lucide) window.lucide.createIcons();
}
init();