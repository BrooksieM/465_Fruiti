// Stripe Payment Integration Script
// Add this to your seller-payment.html

// Form submission with Stripe
async function handleStripePayment(e, formData, plan, submitBtn) {
  try {
    // Step 1: Create Payment Intent
    const paymentIntentResponse = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriptionType: plan,
        email: formData.email
      })
    });

    if (!paymentIntentResponse.ok) {
      throw new Error('Failed to create payment intent');
    }

    const { clientSecret } = await paymentIntentResponse.json();

    // Step 2: Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          email: formData.email,
          address: {
            line1: formData.standAddress,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipcode
          }
        }
      }
    });

    if (stripeError) {
      // Show error to customer
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = stripeError.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete Purchase & Become a Seller';
      return;
    }

    // Step 3: Payment succeeded - create seller subscription
    if (paymentIntent.status === 'succeeded') {
      // Add payment info to formData
      formData.stripePaymentIntentId = paymentIntent.id;
      formData.paymentStatus = 'succeeded';

      const response = await fetch('/api/purchase-seller-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Success! ${result.message}\n\nYour subscription is active until ${new Date(result.subscriptionEnd).toLocaleDateString()}`);

        // Store user info in localStorage
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('isLoggedIn', 'true');

        // Fetch updated user data
        try {
          const userResponse = await fetch(`/api/accounts/${result.userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }

        // Redirect to homepage
        window.location.href = '/';
      } else {
        alert(`Error: ${result.error}`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Complete Purchase & Become a Seller';
      }
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('An error occurred while processing your payment. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Complete Purchase & Become a Seller';
  }
}
