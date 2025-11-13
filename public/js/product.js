document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) return;

  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(
      `http://localhost:3000/api/coffees/${productId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!response.ok) throw new Error('Failed to fetch product');
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
    document.getElementById('coffee-price').textContent = `$${lowestPrice}`;

    // Update price
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
      });

    // Cart handler to be completed
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
});
