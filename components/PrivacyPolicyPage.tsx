import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in bg-white dark:bg-dark-light p-8 md:p-12 rounded-2xl shadow-lg">
      <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-4 text-center">Privacy Policy</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
        <p>Welcome to MahaYatri. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
        
        <h2 className="font-heading">1. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
        <ul>
          <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the Application.</li>
          <li><strong>Geolocation Information:</strong> We may request access or permission to and track location-based information from your mobile device, either continuously or while you are using the Application, to provide location-based services like our SOS feature.</li>
          <li><strong>Payment Data:</strong> We may collect data related to your payment method (e.g., valid credit card number, card brand, expiration date) when you unlock a guide's contact, but we do not store this information. It is processed securely by our payment processor, Razorpay.</li>
        </ul>

        <h2 className="font-heading">2. Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
        <ul>
          <li>Create and manage your account.</li>
          <li>Process your transactions and bookings.</li>
          <li>Email you regarding your account or order.</li>
          <li>Enable user-to-user communications.</li>
          <li>Provide safety features, such as the SOS signal.</li>
          <li>Generate personalized itineraries and recommendations via our AI services.</li>
        </ul>

        <h2 className="font-heading">3. Disclosure of Your Information</h2>
        <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
        <ul>
          <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
          <li><strong>To Your Emergency Contacts:</strong> If you use our SOS feature, we will share your location information with the emergency contacts you have provided.</li>
          <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing (Razorpay) and AI services (Google Gemini).</li>
        </ul>
        
        <h2 className="font-heading">4. Security of Your Information</h2>
        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

        <h2 className="font-heading">5. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at:</p>
        <p className="not-prose"><a href="mailto:privacy@mahayatri.com" className="text-primary hover:underline">privacy@mahayatri.com</a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;