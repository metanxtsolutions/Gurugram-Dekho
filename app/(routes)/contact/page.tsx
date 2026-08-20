'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <a href="mailto:contact@gurugramdekho.com" className="text-orange-500 hover:text-orange-600">
                contact@gurugramdekho.com
              </a>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Location</p>
              <p className="text-gray-600">Gurugram, Haryana, India</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Send us a Message</h2>
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              Thank you! We'll get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Your Name" className="w-full px-4 py-2 border rounded-lg" required />
              <input type="email" placeholder="Your Email" className="w-full px-4 py-2 border rounded-lg" required />
              <textarea placeholder="Message" rows={4} className="w-full px-4 py-2 border rounded-lg" required />
              <button type="submit" className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
