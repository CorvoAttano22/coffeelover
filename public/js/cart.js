import { apiFetch } from './apiClient.js';
//import { showAlert } from './ui.js';

//Temporary
function showAlert(message, type) {
  console.log(`[ALERT] Type: ${type}, Message: ${message}`);

  const container = document.getElementById('navbar-placeholder')
    ? document.getElementById('navbar-placeholder').parentElement
    : document.body;

  const alertDiv = document.createElement('div');
  alertDiv.textContent = message;
  alertDiv.style.cssText = `
        position: fixed; top: 10px; right: 10px; padding: 15px; 
        color: white; z-index: 1000; border-radius: 5px; 
        font-family: sans-serif; transition: opacity 0.5s;
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
    `;

  container.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.style.opacity = '0';
    setTimeout(() => alertDiv.remove(), 500);
  }, 3000);
}

//
export async function loadCartPage() {
  const tableBody = document.getElementById('cart-table-body');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  if (!tableBody) return; 

  try {
    const res = await apiFetch('/api/cart');
    
    if (!res.ok) {
       tableBody.innerHTML = '<tr><td colspan="6">Could not load cart.</td></tr>';
       return;
    }

    const data = await res.json();
    const items = data.items;
    const meta = data.meta;

    if (items.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6">Your cart is empty.</td></tr>';
      subtotalEl.textContent = '$0.00';
      totalEl.textContent = '$0.00';
      return;
    }

    tableBody.innerHTML = items.map(item => {
      const price = Number(item.variant.price);
      const total = price * item.quantity;
      const coffeeName = item.variant.coffee.name;
      const image = item.variant.coffee.image || 'images/menu-1.jpg';
      const weight = item.variant.weight;

      return `
        <tr class="text-center" data-cart-item-id="${item.id}">
          <td class="product-remove">
            <a href="#" class="remove-btn" data-id="${item.id}"><span class="icon-close"></span></a>
          </td>
          
          <td class="image-prod">
            <div class="img" style="background-image: url(${image});"></div>
          </td>
          
          <td class="product-name">
            <h3>${coffeeName}</h3>
            <p>${weight}g Package</p>
          </td>
          
          <td class="price">$${price.toFixed(2)}</td>
          
          <td class="quantity">
            <div class="input-group mb-3">
              <input type="text" name="quantity" 
                     class="quantity form-control input-number" 
                     value="${item.quantity}" min="1" max="100" readonly>
            </div>
          </td>
          
          <td class="total">$${total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const grandTotalFormatted = `$${Number(meta.grandTotal).toFixed(2)}`;
    subtotalEl.textContent = grandTotalFormatted;
    totalEl.textContent = grandTotalFormatted;

  } catch (error) {
    console.error('Error loading cart page:', error);
    tableBody.innerHTML = '<tr><td colspan="6">Error loading cart.</td></tr>';
  }
}
//

async function handleAddToCart(variantId, quantity) {
  try {
    const response = await apiFetch(`/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variantId, quantity }),
    });

    if (!response.ok) {
      let message = 'Failed to add item to cart.';
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {}
      throw new Error(message);
    }

    const cartData = await response.json();

    updateCartIcon(cartData.meta.totalQuantity);
    updateCartTotal(cartData.meta.grandTotal);

    showAlert('Item added to cart!', 'success');
  } catch (error) {
    console.error('Cart Error:', error);
    showAlert(error.message, 'error');
  }
}

function updateCartIcon(count) {
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = count;
  }
}

function updateCartTotal(amount) {
  //will implement
}

async function initializeCartCount() {
  try {
    const res = await apiFetch('/api/cart');
    if (!res.ok) return;

    const data = await res.json();
    updateCartIcon(data.meta.totalQuantity);
  } catch (err) {
    console.error('Failed to load cart count', err);
  }
}

export function initializeCartFeatures() {
  initializeCartCount();

  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const quantitySelect = document.getElementById('quantity');
  const sizeSelect = document.getElementById('coffee-size');

  if (!addToCartBtn || !quantitySelect || !sizeSelect) {
    return;
  }

  addToCartBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const variantId = sizeSelect.value;
    const quantity = parseInt(quantitySelect.value);

    if (!variantId || variantId === '0') {
      showAlert('Please select a size/variant first.', 'warning');
      return;
    }
    if (isNaN(quantity) || quantity < 1) {
      showAlert('Quantity must be 1 or more.', 'warning');
      return;
    }

    handleAddToCart(parseInt(variantId), quantity);
  });
}
