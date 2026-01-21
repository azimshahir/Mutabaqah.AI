import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BankRakyatLogo } from '@/components/logo'
import { Shield, Clock, CheckCircle, Banknote } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/financing')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <BankRakyatLogo size="md" />
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-[#0e4f8b]">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-[#f7941d] hover:bg-[#e8850a]">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="islamic-pattern py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Islamic Financing
              <span className="text-[#f7941d]"> Made Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Apply for Shariah-compliant financing with Bank Rakyat.
              Fast approvals, competitive rates, and fully transparent Tawarruq process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#f7941d] hover:bg-[#e8850a] text-white text-lg px-8 py-6"
              >
                <Link href="/register">Apply Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0e4f8b] mb-4">
              Why Choose Bank Rakyat?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the best of Islamic banking with our comprehensive financing solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#0e4f8b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#0e4f8b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0e4f8b] mb-2">
                100% Shariah Compliant
              </h3>
              <p className="text-muted-foreground">
                All our products are certified by our Shariah Advisory Committee
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#f7941d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#f7941d]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0e4f8b] mb-2">
                Fast Processing
              </h3>
              <p className="text-muted-foreground">
                Quick application review and approval process
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#0e4f8b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-8 h-8 text-[#0e4f8b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0e4f8b] mb-2">
                Competitive Rates
              </h3>
              <p className="text-muted-foreground">
                Attractive profit rates starting from 5% per annum
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-xl border bg-gray-50 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#f7941d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#f7941d]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0e4f8b] mb-2">
                Transparent Process
              </h3>
              <p className="text-muted-foreground">
                Clear documentation and full visibility of all transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0e4f8b] mb-4">
              Our Financing Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our range of Tawarruq-based financing solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Personal Financing-i',
                desc: 'For personal needs, education, or emergencies',
                amount: 'Up to RM 200,000',
              },
              {
                title: 'Home Financing-i',
                desc: 'Finance your dream home',
                amount: 'Up to RM 1,000,000',
              },
              {
                title: 'Vehicle Financing-i',
                desc: 'Get your dream car',
                amount: 'Up to RM 300,000',
              },
              {
                title: 'Business Financing-i',
                desc: 'Grow your business',
                amount: 'Up to RM 500,000',
              },
            ].map((product) => (
              <div
                key={product.title}
                className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-[#0e4f8b] mb-2">
                  {product.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {product.desc}
                </p>
                <p className="text-[#f7941d] font-bold">{product.amount}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              asChild
              size="lg"
              className="bg-[#0e4f8b] hover:bg-[#0a3d6e]"
            >
              <Link href="/register">Start Your Application</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 br-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of satisfied customers who have chosen Bank Rakyat
            for their Islamic financing needs.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#f7941d] hover:bg-[#e8850a] text-lg px-8 py-6"
          >
            <Link href="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a3d6e] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <BankRakyatLogo size="md" className="mb-4" />
              <p className="text-blue-200 text-sm">
                Your trusted Islamic banking partner since 1954.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>Personal Financing-i</li>
                <li>Home Financing-i</li>
                <li>Vehicle Financing-i</li>
                <li>Business Financing-i</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>1-300-80-5454</li>
                <li>customerservice@bankrakyat.com.my</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200 text-sm">
            <p>&copy; {new Date().getFullYear()} Bank Rakyat. All rights reserved.</p>
            <p className="mt-1">Licensed by Bank Negara Malaysia</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
