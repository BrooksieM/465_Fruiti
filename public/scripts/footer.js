document.addEventListener('DOMContentLoaded', function() {
  const footerHTML = `
<footer class="footer">
  <div class="footer-content">
    <div class="footer-section">
      <h3>About Fruiti</h3>
      <p>Your local guide to finding fresh, delicious fruit stands in your area. Supporting local farmers and healthy eating!</p>
      <div class="social-links">
        <a href="#" aria-label="Facebook">📘</a>
        <a href="#" aria-label="Instagram">📷</a>
        <a href="#" aria-label="Twitter">🐦</a>
      </div>
    </div>
    
    <div class="footer-section">
      <h3>Quick Links</h3>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/become-seller">Become a Seller</a></li>
        <li><a href="nutrition">Nutrition</a></li>
        <li><a href="/recipes">Recipes</a></li>
        <li><a href="/aboutus">About Us</a></li>
      </ul>
    </div>
    
    <div class="footer-section">
      <h3>Support</h3>
      <ul>
        <li><a href="#">Help Center</a></li>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Service</a></li>
      </ul>
    </div>
    
    <div class="footer-section">
      <h3>Contact</h3>
      <p>📍 Erie, Pennsylvania, US</p>
      <p>📧 some_email@fruiti.com</p>
      <p>📞 (814) 440-2112</p>
    </div>
  </div>
  
  <div class="footer-bottom">
    <p>&copy; 2025 Fruiti. All rights reserved.</p>
    <p>Made with 🍎 for fruit lovers everywhere</p>
  </div>
</footer>
  `;
  document.getElementById('footer-placeholder').innerHTML = footerHTML;
});
