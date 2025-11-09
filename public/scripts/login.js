document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoading = loginBtn.querySelector('.btn-loading');

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    // validation
    if (!username || !password) {
        errorMessage.textContent = 'Please enter both username/email and password.';
        errorMessage.style.display = 'block';
        return;
    }

    // Show loading state
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
        console.log('Sending login request...', { username, password: '***' });

        // Use the login endpoint
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);

        // First, get the response as text to see what we're actually getting
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
            console.log('Parsed JSON data:', data);
        } catch (parseError) {
            console.error('Failed to parse JSON:', parseError);
            throw new Error('Server returned invalid JSON: ' + responseText.substring(0, 100));
        }

        if (response.ok && data.success) {
            successMessage.textContent = 'Logged in successfully! Redirecting...';
            successMessage.style.display = 'block';

            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('isLoggedIn', 'true');

            // Update navigation immediately
            if (typeof updateNavigationForLoggedInUser === 'function') {
                updateNavigationForLoggedInUser(data.user);
            }
            
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            errorMessage.textContent = data.error || 'Login failed';
            errorMessage.style.display = 'block';
        }

    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Error: ' + error.message;
        errorMessage.style.display = 'block';
    } finally {
        // Reset button state
        loginBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
});