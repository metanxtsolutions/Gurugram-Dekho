import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <p className="text-gray-600 mb-8">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-x-4">
        <Link href="/" className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          Go Home
        </Link>
        <Link href="/search" className="inline-block px-6 py-3 border rounded-lg hover:bg-gray-50">
          Search
        </Link>
      </div>
    </div>
  );
}
