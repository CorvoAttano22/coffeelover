//to be tested

const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    } else {
        console.error("Checkout form not found! Ensure your form has the ID 'checkout-form'.");
    }
});

async function handleCheckoutSubmit(event) {
    event.preventDefault();

    const submitButton = document.getElementById('payment-button');
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    const formData = new FormData(event.target);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }

    const token = localStorage.getItem('access_token'); 

    if (!token) {
        alert('You must be logged in to complete checkout.');
        submitButton.disabled = false;
        submitButton.textContent = 'Pay Now';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/order/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create Stripe session due to a server error.');
        }

        const result = await response.json();

        if (result.url) {
            window.location.href = result.url;
        } else {
            throw new Error('Server did not return a Stripe checkout URL.');
        }

    } catch (error) {
        console.error('Checkout Error:', error);
        alert(`Checkout failed: ${error.message}`);
        
        submitButton.disabled = false;
        submitButton.textContent = 'Pay Now';
    }
}