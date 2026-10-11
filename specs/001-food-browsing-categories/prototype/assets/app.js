const menuItems = [
  {
    id: 1,
    name: '香煎雞腿排',
    category: '主餐',
    price: 180,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 2,
    name: '招牌牛丼',
    category: '主餐',
    price: 210,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 3,
    name: '海鮮燉飯',
    category: '主餐',
    price: 240,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 4,
    name: '青菜沙拉',
    category: '輕食',
    price: 120,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 5,
    name: '檸檬氣泡飲',
    category: '飲品',
    price: 65,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 6,
    name: '焦糖奶茶',
    category: '飲品',
    price: 75,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b6462a1a?auto=format&fit=crop&w=900&q=80'
  }
];

const categoryFilters = document.getElementById('categoryFilters');
const menuGrid = document.getElementById('menuGrid');
const resultCount = document.getElementById('resultCount');

const categories = ['全部', ...new Set(menuItems.map((item) => item.category))];
let activeCategory = '全部';

function formatPrice(value) {
  return `NT$ ${value}`;
}

function renderFilters() {
  categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button class="filter-chip ${category === activeCategory ? 'active' : ''}" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join('');

  categoryFilters.querySelectorAll('.filter-chip').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      render();
    });
  });
}

function renderMenu() {
  const visibleItems =
    activeCategory === '全部'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  resultCount.textContent = `${visibleItems.length} 筆餐點`;

  if (!visibleItems.length) {
    menuGrid.innerHTML = '<div class="empty-state">目前沒有符合條件的餐點。</div>';
    return;
  }

  menuGrid.innerHTML = visibleItems
    .map(
      (item) => `
        <article class="menu-card">
          <img class="image" src="${item.image}" alt="${item.name}" />
          <div class="content">
            <div class="meta">
              <h3>${item.name}</h3>
              <span class="category-tag">${item.category}</span>
            </div>
            <div class="price">${formatPrice(item.price)}</div>
          </div>
        </article>
      `
    )
    .join('');
}

function render() {
  renderFilters();
  renderMenu();
}

render();
