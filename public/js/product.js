import { apiFetch } from './apiClient.js';

export async function loadProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) return;

  try {
    const response = await apiFetch(`/api/coffees/${productId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const coffee = await response.json();

    document.getElementById('coffee-image').src = coffee.image;
    document.getElementById('coffee-name').textContent = coffee.name;
    document.getElementById('coffee-description').textContent =
      coffee.description;

    const sizeSelect = document.getElementById('coffee-size');
    coffee.variants.forEach((variant) => {
      const option = document.createElement('option');
      option.value = variant.id;
      option.textContent = `${variant.weight}g - $${variant.price}`;
      sizeSelect.appendChild(option);
    });

    const lowestPrice = Math.min(
      ...coffee.variants.map((v) => parseFloat(v.price)),
    );
    document.getElementById('coffee-price').textContent = `$${lowestPrice}`; // Update price

    sizeSelect.addEventListener('change', (e) => {
      const selected = coffee.variants.find((v) => v.id == e.target.value);
      if (selected) {
        document.getElementById('coffee-price').textContent =
          `$${selected.price}`;
      }
    });

    const qtyInput = document.getElementById('quantity');
    document
      .querySelector('.quantity-right-plus')
      .addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
      });
    document
      .querySelector('.quantity-left-minus')
      .addEventListener('click', () => {
        const val = parseInt(qtyInput.value);
        if (val > 1) qtyInput.value = val - 1;
      }); // Cart handler to be completed

    document
      .getElementById('add-to-cart-btn')
      .addEventListener('click', (e) => {
        e.preventDefault();
        const selectedVariantId = sizeSelect.value;
        const quantity = parseInt(qtyInput.value);
        console.log({
          productId: coffee.id,
          variantId: selectedVariantId,
          quantity,
        });
      });
  } catch (err) {
    console.error(err);
  }
}
export async function loadAllCoffees() {
    try {
        const res = await apiFetch('/api/coffees');

        if (res.status !== 200) {
            throw new Error(`Failed to fetch coffees. Status: ${res.status}`);
        }

        let data = await res.json();

        if (!Array.isArray(data)) {
            if (data && data.coffees && Array.isArray(data.coffees)) {
                data = data.coffees;
            } else {
                console.warn('API returned unexpected data format:', data);
                data = [];
            }
        }

        const container = document.getElementById('coffee-list');
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML =
                '<p class="text-center">No coffee products found at this time.</p>';
            return;
        }

        container.innerHTML = data
            .map((item) => {
                const variants = item.variants || [];
                const lowestPrice = variants.length
                    ? Math.min(...variants.map((v) => Number(v.price)))
                    : 'N/A';

                return `
                    <div class="col-md-4 text-center">
                        <div class="menu-wrap">
                            <a href="/product-single.html?id=${item.id}" 
                                class="menu-img img mb-4" 
                                style="background-image: url(${item.image})">
                            </a>
                            <div class="text">
                                <h3><a href="/product-single.html?id=${item.id}">${item.name}</a></h3>
                                <p>${item.description || ''}</p>
                                <p class="price"><span>From $${lowestPrice}</span></p>
                                <p>
                                    <a href="/product-single.html?id=${item.id}" class="btn btn-primary btn-outline-primary">
                                        View Details
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            })
            .join('');
    } catch (err) {
        console.error('Error loading coffees:', err);
        const container = document.getElementById('coffee-list');
        if (container) {
            container.innerHTML = `<p>Error loading products: ${err.message}. Try reloading.</p>`;
        }
    }
}
