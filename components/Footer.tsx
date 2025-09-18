import React from 'react';
import { Page } from '../types';

interface FooterProps {
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-dark text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4">MahaYatri</h3>
            <p className="text-gray-400">Your personal guide to the wonders of Maharashtra.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate(Page.About)} className="text-gray-300 hover:text-primary transition">About Us</button></li>
              <li><button onClick={() => onNavigate(Page.Contact)} className="text-gray-300 hover:text-primary transition">Contact</button></li>
              <li><button onClick={() => onNavigate(Page.Contact)} className="text-gray-300 hover:text-primary transition">FAQ</button></li>
              <li><button onClick={() => onNavigate(Page.PrivacyPolicy)} className="text-gray-300 hover:text-primary transition">Privacy Policy</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049 1.064.218 1.791.465 2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.149 2 12.315 2zm0 1.623c-2.403 0-2.73.01-3.693.056-.935.044-1.522.2-2.016.379a3.28 3.28 0 00-1.18 1.18c-.179.494-.335 1.081-.379 2.016-.046.963-.056 1.29-.056 3.693s.01 2.73.056 3.693c.044.935.2 1.522.379 2.016a3.28 3.28 0 001.18 1.18c.494.179 1.081.335 2.016.379.963.046 1.29.056 3.693.056s2.73-.01 3.693-.056c.935-.044 1.522-.2 2.016-.379a3.28 3.28 0 001.18-1.18c.179-.494.335-1.081-.379-2.016.046-.963.056-1.29.056-3.693s-.01-2.73-.056-3.693c-.044-.935-.2-1.522-.379-2.016a3.28 3.28 0 00-1.18-1.18c-.494-.179-1.081-.335-2.016-.379-.963-.046-1.29-.056-3.693-.056z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MahaYatri. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;