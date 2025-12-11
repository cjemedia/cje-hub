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
            {/* Introduction */}
            <section>
              <p className="text-white/90">
                The CJE Experience ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Information You Provide</h3>
                  <p className="mb-2">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Name and contact information (email address, phone number, mailing address)</li>
                    <li>Account credentials (username, password)</li>
                    <li>Information about your projects and inquiries</li>
                    <li>Booking and scheduling information</li>
                    <li>Payment information (processed securely through third-party processors)</li>
                    <li>Communications and correspondence with us</li>
                    <li>Any other information you choose to provide</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Automatically Collected Information</h3>
                  <p className="mb-2">
                    When you visit our website, we may automatically collect certain information, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                    <li>Date and time of access</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4">
                <p>We use the information we collect for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process and manage your bookings, inquiries, and transactions</li>
                  <li>Authenticate and manage your account</li>
                  <li>Communicate with you about your projects, services, and account</li>
                  <li>Send you updates, newsletters, and marketing communications (with your consent)</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, prevent, and address technical issues and security threats</li>
                  <li>Comply with legal obligations and enforce our terms of service</li>
                </ul>
                <p className="text-white/70 text-sm mt-4">
                  <strong>Legal Basis for Processing (GDPR):</strong> We process your personal data based on your consent, to fulfill our contractual obligations, to comply with legal requirements, and for our legitimate business interests.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                3. Cookies and Tracking Technologies
              </h2>
              <div className="space-y-4">
                <p>
                  We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are small data files stored on your device.
                </p>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Types of Cookies We Use</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., authentication, security)</li>
                    <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                  </ul>
                </div>
                <p>
                  You can control cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our website.
                </p>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                4. Third-Party Services
              </h2>
              <div className="space-y-4">
                <p>
                  We use third-party services to operate our website and provide our services. These services may collect, process, and store your information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Supabase:</strong> Database, authentication, and storage services. 
                    <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors ml-1">
                      View their privacy policy
                    </a>
                  </li>
                  <li>
                    <strong>Resend:</strong> Email delivery service. 
                    <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors ml-1">
                      View their privacy policy
                    </a>
                  </li>
                  <li>
                    <strong>Google Calendar:</strong> Calendar integration for booking management. 
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors ml-1">
                      View their privacy policy
                    </a>
                  </li>
                  <li>
                    <strong>Vercel:</strong> Website hosting and deployment platform. 
                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 transition-colors ml-1">
                      View their privacy policy
                    </a>
                  </li>
                </ul>
                <p>
                  These third-party services have their own privacy policies governing how they collect, use, and protect your information. We encourage you to review their privacy policies.
                </p>
              </div>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                5. Data Sharing and Disclosure
              </h2>
              <div className="space-y-4">
                <p>We may share your information in the following circumstances:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (e.g., hosting, email delivery, payment processing)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users or others</li>
                  <li><strong>With Your Consent:</strong> When you have given us explicit permission to share your information</li>
                </ul>
                <p>
                  We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                6. Data Retention
              </h2>
              <div className="space-y-4">
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
                </p>
                <p>
                  Account information is retained while your account is active and for a reasonable period thereafter to comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </div>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                7. International Data Transfers
              </h2>
              <div className="space-y-4">
                <p>
                  Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country.
                </p>
                <p>
                  When we transfer your information internationally, we take steps to ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                8. Your Rights and Choices
              </h2>
              <div className="space-y-4">
                <p>
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw your consent where processing is based on consent</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the contact information provided below. We will respond to your request within a reasonable timeframe and in accordance with applicable law.
                </p>
                <p className="text-white/70 text-sm">
                  <strong>Note for California Residents:</strong> Under the California Consumer Privacy Act (CCPA), you have the right to know what personal information we collect, sell, or disclose, and the right to opt-out of the sale of personal information (we do not sell personal information).
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                9. Children's Privacy
              </h2>
              <div className="space-y-4">
                <p>
                  Our services are not directed to individuals under the age of 13 (or 16 in the European Union). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                10. Data Security
              </h2>
              <div className="space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure hosting infrastructure</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <div className="space-y-4">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Posting the updated Privacy Policy on this page</li>
                  <li>Updating the "Last updated" date at the top of this page</li>
                  <li>Sending you an email notification (for significant changes)</li>
                </ul>
                <p>
                  Your continued use of our services after any changes to this Privacy Policy constitutes acceptance of those changes.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
                12. Contact Information
              </h2>
              <div className="space-y-4">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
                  If you are located in the European Economic Area (EEA) and have concerns about our data practices, you also have the right to lodge a complaint with your local data protection authority.
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

