import React from 'react';
import Input from './common/Input';
import Button from './common/Button';

const ContactPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger an email or API call
    alert('Thank you for your message! We will get back to you shortly.');
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-dark dark:text-light mb-2">Get in Touch</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">We'd love to hear from you. Please fill out the form below or contact us directly.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Your Name" name="name" type="text" placeholder="Priya Sharma" required />
            <Input label="Your Email" name="email" type="email" placeholder="priya@example.com" required />
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="How can we help you?"
                required
              />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold flex items-center gap-3">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    Email Us
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">For general inquiries, support, or feedback:</p>
                <a href="mailto:support@mahayatri.com" className="text-primary text-lg hover:underline">support@mahayatri.com</a>
            </div>
             <div className="bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Call Us
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">For urgent matters, contact our support line:</p>
                <a href="tel:+919998887777" className="text-primary text-lg hover:underline">+91 999 888 7777</a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
