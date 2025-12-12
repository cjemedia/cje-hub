import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-dark">
      <Navigation />
      
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-white/70 text-lg mb-12">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-12 text-white/80">
            {/* Agreement to Terms */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                1. Agreement to Terms
              </h2>
              <div className="space-y-4">
                <p>
                  By accessing or using the website and services of The CJE Experience ("we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our website or services.
                </p>
                <p>
                  These Terms apply to all visitors, users, clients, and others who access or use our services. By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Services */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                2. Services
              </h2>
              <div className="space-y-4">
                <p>
                  The CJE Experience provides the following services:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Public Speaking:</strong> Keynote speeches, workshops, and presentations for events, conferences, and organizations</li>
                  <li><strong>Coaching & Programs:</strong> Purpose-driven coaching, personal development programs, and strategic guidance</li>
                  <li><strong>Brand Strategy & Consulting:</strong> Brand development, content strategy, and business consulting services</li>
                  <li><strong>Event Hosting:</strong> Hosting and moderating events, panels, and experiences</li>
                  <li><strong>Content Creation:</strong> Strategic content development and storytelling services</li>
                </ul>
                <p>
                  We reserve the right to modify, suspend, or discontinue any aspect of our services at any time, with or without notice. We do not guarantee that our services will be available at all times or that they will be error-free.
                </p>
              </div>
            </section>

            {/* Bookings & Payments */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                3. Bookings & Payments
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Booking Process</h3>
                  <p className="mb-2">
                    When you book a service through our website or client portal:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All bookings are subject to availability and our approval</li>
                    <li>We reserve the right to decline any booking request</li>
                    <li>Booking confirmations will be sent via email</li>
                    <li>You are responsible for providing accurate contact and event information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Payment Terms</h3>
                  <p className="mb-2">
                    Payment terms vary by service type:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Payment may be required in advance, upon booking, or according to the terms specified in your service agreement</li>
                    <li>All fees are non-refundable unless otherwise specified in writing</li>
                    <li>Payment methods accepted include credit cards, bank transfers, and other methods as specified</li>
                    <li>Late payments may result in service cancellation or additional fees</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Cancellation Policy</h3>
                  <p className="mb-2">
                    Cancellation terms are as follows:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Cancellations must be made in writing via email to media@ciarajevans.com</li>
                    <li>Cancellation fees may apply based on the timing of cancellation and service type</li>
                    <li>Refunds, if applicable, will be processed according to the terms of your specific service agreement</li>
                    <li>We reserve the right to cancel services due to circumstances beyond our control, in which case we will provide a full refund</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Client Portal */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                4. Client Portal
              </h2>
              <div className="space-y-4">
                <p>
                  Access to our client portal is provided to clients and authorized users. By using the client portal, you agree to the following:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account</li>
                  <li><strong>Accurate Information:</strong> You must provide accurate, current, and complete information when creating and maintaining your account</li>
                  <li><strong>Unauthorized Access:</strong> You must immediately notify us of any unauthorized use of your account or any other breach of security</li>
                  <li><strong>Account Termination:</strong> We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason we deem necessary</li>
                  <li><strong>Portal Content:</strong> Content in the portal is confidential and proprietary. You may not share, copy, or redistribute portal content without written permission</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                5. Intellectual Property
              </h2>
              <div className="space-y-4">
                <p>
                  All content, materials, and intellectual property on our website and in our services, including but not limited to text, graphics, logos, images, audio, video, software, and other materials, are owned by The CJE Experience or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p>
                  You may not:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Copy, reproduce, distribute, or create derivative works from our content without written permission</li>
                  <li>Use our content for commercial purposes without authorization</li>
                  <li>Remove or alter any copyright, trademark, or other proprietary notices</li>
                  <li>Reverse engineer, decompile, or disassemble any software or materials</li>
                  <li>Use our name, logo, or trademarks without prior written consent</li>
                </ul>
                <p>
                  Any content you submit to us (such as testimonials, feedback, or project materials) may be used by us for marketing, promotional, or business purposes, unless otherwise agreed in writing.
                </p>
              </div>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                6. User Conduct
              </h2>
              <div className="space-y-4">
                <p>
                  When using our website and services, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use our services only for lawful purposes and in accordance with these Terms</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Respect the rights and privacy of others</li>
                  <li>Not engage in any activity that could harm, disable, or impair our services or servers</li>
                  <li>Not attempt to gain unauthorized access to any part of our services or systems</li>
                  <li>Not transmit any viruses, malware, or other harmful code</li>
                  <li>Not use our services to harass, abuse, or harm others</li>
                  <li>Not impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                </ul>
                <p>
                  Violation of these conduct rules may result in immediate termination of your access to our services and may subject you to legal action.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                7. Limitation of Liability
              </h2>
              <div className="space-y-4">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE CJE EXPERIENCE AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your use or inability to use our services</li>
                  <li>Any unauthorized access to or use of our servers or your personal information</li>
                  <li>Any interruption or cessation of transmission to or from our services</li>
                  <li>Any bugs, viruses, trojan horses, or the like that may be transmitted through our services</li>
                  <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content</li>
                  <li>Any conduct or content of third parties on our services</li>
                </ul>
                <p>
                  Our total liability for any claims arising out of or relating to these Terms or our services shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                </p>
                <p className="text-white/70 text-sm">
                  Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                8. Changes to Terms
              </h2>
              <div className="space-y-4">
                <p>
                  We reserve the right to modify or update these Terms at any time. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Posting the updated Terms on this page</li>
                  <li>Updating the "Last updated" date at the top of this page</li>
                  <li>Sending you an email notification (for significant changes, when possible)</li>
                </ul>
                <p>
                  Your continued use of our services after any changes to these Terms constitutes acceptance of those changes. If you do not agree to the modified Terms, you must stop using our services.
                </p>
                <p>
                  It is your responsibility to review these Terms periodically for changes. We encourage you to check this page regularly.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                9. Contact
              </h2>
              <div className="space-y-4">
                <p>
                  If you have any questions, concerns, or requests regarding these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 bg-dark-light/50 p-4 rounded-lg">
                  <p>
                    <strong className="text-white">The CJE Experience</strong>
                  </p>
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
                <p className="text-white/70 text-sm">
                  We will respond to your inquiries as soon as reasonably possible.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

