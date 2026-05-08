const SUPABASE_URL = 'https://dlrkbpianpatztugqekd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_WxaNOwW3TB6nnAYysChjGQ_sHJiDS6E';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cart = JSON.parse(localStorage.getItem('my_green_cart')) || [];

// 1. UPDATE BANNER WITH FALLBACK
async function fetchHero() {
    const { data, error } = await db.from('banners').select('*').limit(1).single();
    if (data && !error) {
        document.getElementById('hero-banner').style.backgroundImage = `url('${data.image_url}')`;
        document.getElementById('hero-data').innerHTML = `
            <span class="badge">${data.promo_label || 'NEW ARRIVAL'}</span>
            <h1>${data.title}</h1>
            <p>${data.subtitle}</p>
            <div class="hero-btns">
                <button class="btn-primary">Shop Now</button>
            </div>
        `;
    }
}

// 2. FETCH CATEGORIES
async function fetchCategories() {
    const { data } = await db.from('categories').select('*');
    const list = document.getElementById('category-list');
    if (data) {
        let html = `<div class="pill active" onclick="filterCat('all', this)">All Products</div>`;
        html += data.map(c => `<div class="pill" onclick="filterCat(${c.id}, this)">${c.name}</div>`).join('');
        list.innerHTML = html;
    }
}

// 3. FETCH PRODUCTS
async function fetchProducts(catId = 'all', search = '') {
    let query = db.from('products').select('*');
    if (catId !== 'all') query = query.eq('category_id', catId);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data } = await query;
    const grid = document.getElementById('product-grid');
    grid.innerHTML = data.map(p => `
        <div class="card">
            <img src="${p.image_url}" onerror="this.src='https://via.placeholder.com/200?text=Fresh+Product'">
            <p style="font-size:11px; color:#aaa; text-transform:uppercase;">${p.category_name || 'Produce'}</p>
            <h4>${p.name}</h4>
            <p class="price">R${p.price.toFixed(2)}</p>
            <button class="add-btn" onclick="addToCart('${p.id}', '${p.name}', ${p.price}, '${p.image_url}')">
                <i data-lucide="plus"></i> Add to Bag
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

// 4. LOGIC
window.filterCat = (id, el) => {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    fetchProducts(id);
};

document.getElementById('global-search').addEventListener('input', (e) => {
    fetchProducts('all', e.target.value);
});

window.addToCart = (id, name, price, img) => {
    const item = cart.find(i => i.id === id);
    if (item) item.qty++;
    else cart.push({ id, name, price, img, qty: 1 });
    updateCart();
};

function updateCart() {
    localStorage.setItem('my_green_cart', JSON.stringify(cart));
    document.getElementById('cart-count').innerText = cart.reduce((a, b) => a + b.qty, 0);
    renderCart();
}

function renderCart() {
    const itemsCont = document.getElementById('cart-items');
    let total = 0;
    itemsCont.innerHTML = cart.map(i => {
        total += i.price * i.qty;
        return `<div style="display:flex; align-items:center; gap:15px; margin-bottom:20px;">
            <img src="${i.img}" style="width:50px; border-radius:10px;">
            <div style="flex:1"><b>${i.name}</b><br>R${i.price} x ${i.qty}</div>
        </div>`;
    }).join('');
    document.getElementById('cart-total').innerText = `R${total.toFixed(2)}`;
}

// UI Toggles
document.getElementById('cart-btn').onclick = () => document.getElementById('cart-sidebar').classList.add('active');
document.getElementById('close-cart').onclick = () => document.getElementById('cart-sidebar').classList.remove('active');

// INIT
async function start() {
    await fetchHero();
    await fetchCategories();
    await fetchProducts();
    updateCart();
}
start();