import React from 'react';
import LazyImage from './common/LazyImage';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in bg-white dark:bg-dark-light p-8 rounded-2xl shadow-lg">
      <h1 className="text-4xl font-extrabold font-heading text-dark dark:text-light mb-4 text-center">About MahaYatri</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-8">
        Your personal guide to the heart of incredible India.
      </p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold font-heading text-primary mb-3">Our Mission</h2>
          <p>
            MahaYatri was born from a simple yet powerful idea: to connect travelers with the authentic soul of Maharashtra. We believe that the best way to experience a place is through the eyes of a local. Our mission is to empower local guides and provide tourists with safe, unforgettable, and deeply personal travel experiences. We're bridging the gap between curious travelers and the passionate individuals who know this land best.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading text-primary mb-3">What We Do</h2>
          <p>
            We are a platform dedicated to making travel in Maharashtra seamless, safe, and enriching. We meticulously verify every guide on our platform to ensure they are not only knowledgeable and professional but also passionate storytellers who can bring the rich history, vibrant culture, and stunning landscapes of Maharashtra to life. From the bustling streets of Mumbai to the ancient caves of Ajanta and Ellora, our guides are your key to unlocking hidden gems and authentic experiences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading text-primary mb-3">Our Technology</h2>
          <p>
            Powered by cutting-edge AI, the MahaYatri app is more than just a directory. Our intelligent trip planner helps you craft personalized itineraries in seconds. Our in-app chat with live translation breaks down language barriers, and our robust safety features like SOS and live tracking ensure you can explore with peace of mind. We're committed to using technology to enhance, not replace, the human connection that makes travel so special.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading text-primary mb-3">Meet the (Mock) Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <LazyImage src="https://picsum.photos/seed/team1/200/200" alt="Founder" className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-secondary" placeholderClassName="rounded-full" sizes="96px" />
              <h3 className="font-bold font-heading">Priya Sharma</h3>
              <p className="text-sm text-gray-500">Founder & CEO</p>
            </div>
            <div className="p-4">
              <LazyImage src="https://picsum.photos/seed/team2/200/200" alt="Lead Guide" className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-secondary" placeholderClassName="rounded-full" sizes="96px" />
              <h3 className="font-bold font-heading">Rohan Patil</h3>
              <p className="text-sm text-gray-500">Head of Guide Relations</p>
            </div>
             <div className="p-4">
              <LazyImage src="https://picsum.photos/seed/team3/200/200" alt="Tech Lead" className="w-24 h-24 rounded-full mx-auto mb-2 border-4 border-secondary" placeholderClassName="rounded-full" sizes="96px" />
              <h3 className="font-bold font-heading">Aisha Khan</h3>
              <p className="text-sm text-gray-500">Lead Engineer</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;