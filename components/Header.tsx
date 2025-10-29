'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/new-logo.png"
              alt="twnty.ai"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:opacity-70 transition-opacity">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium hover:opacity-70 transition-opacity">
              About
            </Link>
            <button
              onClick={() => router.push('/search')}
              className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-2"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-sm font-medium hover:opacity-70 transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/search');
                }}
                className="text-sm font-medium hover:opacity-70 transition-opacity flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}