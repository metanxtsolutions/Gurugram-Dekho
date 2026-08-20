import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Gurugram Dekho</h1>
      
      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-6">
          Gurugram Dekho is your comprehensive local guide to Gurgaon, India's thriving tech hub and corporate capital.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
        <p>
          We help students, professionals, tourists, and residents discover the best restaurants, places, events, 
          and services in Gurugram through curated guides and local insights.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Choose Us?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Comprehensive local information</li>
          <li>Verified places and businesses</li>
          <li>Insider guides and recommendations</li>
          <li>Regular updates and new content</li>
          <li>Easy-to-use search and browsing</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Contact Us</h2>
        <p>Have questions or suggestions? <Link href="/contact" className="text-orange-500 hover:text-orange-600">Get in touch</Link></p>
      </div>
    </div>
  );
}
