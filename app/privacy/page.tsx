import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-dark">
      <Navigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/70 text-lg mb-12">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-12 text-white/80">
            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                Information We Collect
              </h2>
              <div className="space-y-4">
                <p>
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Information about your projects and inquiries</li>
                  <li>Booking and scheduling information</li>
                  <li>Any other information you choose to provide</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                How We Use Your Information
              </h2>
              <div className="space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and manage your bookings and inquiries</li>
                  <li>Communicate with you about your projects and services</li>
                  <li>Send you updates, newsletters, and marketing communications (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends and usage</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                Data Security
              </h2>
              <div className="space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong className="text-white">Email:</strong>{' '}
                    <a href="mailto:media@ciarajevans.com" className="text-accent hover:text-accent/80 transition-colors">
                      media@ciarajevans.com
                    </a>
                  </p>
                  <p>
                    <strong className="text-white">Phone:</strong>{' '}
                    <a href="tel:7737278262" className="text-accent hover:text-accent/80 transition-colors">
                      (773) 727-8262
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

