const API_BASE_URL = 'http://localhost:3000/api'; 

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
        verifyOrder(sessionId);
    } else {
        showError('No payment session found. Did you complete the checkout?');
    }
});

async function verifyOrder(sessionId) {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        showError('Please log in to view your order confirmation.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/order/session/${sessionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to verify session with server.');
        }

        const data = await response.json();

        if (data.status === 'paid' || data.status === 'complete') {
            showSuccess(data, sessionId);
        } else {
            showError(`Payment status is: ${data.status}`);
        }

    } catch (error) {
        console.error('Order Verification Error:', error);
        showError('System error verifying payment. Please contact support.');
    }
}

function showSuccess(data, sessionId) {
    document.getElementById('loader').style.display = 'none';
    
    document.getElementById('order-confirmed').style.display = 'block';
    
    document.getElementById('payment-status').textContent = data.status.toUpperCase();
    document.getElementById('customer-email-display').textContent = data.email;
    document.getElementById('order-id-display').textContent = data.orderId || 'N/A';
    document.getElementById('session-id-display').textContent = sessionId.slice(0, 10) + '...';
}

function showError(message) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('order-confirmed').style.display = 'none';
    
    const errorSection = document.getElementById('order-failed');
    errorSection.style.display = 'block';
    
    if (message) {
        document.getElementById('error-message').textContent = message;
    }
}