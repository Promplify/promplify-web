import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { updateMeta } from "@/utils/meta";
import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    updateMeta("Privacy Policy", "Promplify's Privacy Policy - Learn how we protect your data and privacy.", "privacy policy, data protection, user privacy");
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        canonicalPath="/privacy"
        title="Privacy Policy - Promplify"
        description="Learn how Promplify protects your privacy and handles your data when you use our AI prompt management platform."
        keywords="privacy policy, data protection, user privacy"
      />
      <Navigation />
      <main className="container max-w-4xl mx-auto p-6 pt-32">
        <div className="bg-white">
          <div className="max-w-3xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6 text-gray-900 tracking-tight">Privacy Policy</h1>
              <p className="text-gray-500 text-sm">Last updated: June 15, 2025</p>
            </div>

            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <div className="mb-16">
                <p className="text-xl text-gray-700 leading-relaxed font-light">
                  At Promplify, we are committed to protecting your privacy and being transparent about how we collect, use, and protect your personal information. This privacy policy explains how we
                  handle your data when you use our AI prompt management platform.
                </p>
              </div>

              {/* Information We Collect */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-8 font-light">
                  We collect information that you voluntarily provide to us and that is necessary to deliver our AI prompt management services. All data collection is done with your explicit consent
                  and in accordance with applicable privacy laws.
                </p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Account Information</h3>
                    <ul className="space-y-3 text-gray-600 font-light">
                      <li>• Email address for account creation and communication</li>
                      <li>• Username and profile information you choose to provide</li>
                      <li>• Authentication data from third-party providers (GitHub, Google)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Usage Data</h3>
                    <ul className="space-y-3 text-gray-600 font-light">
                      <li>• AI prompts you create, edit, and organize</li>
                      <li>• Usage analytics to improve our platform</li>
                      <li>• API usage statistics and performance metrics</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-8 font-light">We use the information we collect to provide and improve our services:</p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Service Delivery</h3>
                    <ul className="space-y-3 text-gray-600 font-light">
                      <li>• Provide AI prompt management features</li>
                      <li>• Sync your prompts across devices</li>
                      <li>• Enable collaboration and sharing</li>
                      <li>• Process API requests and responses</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Platform Improvement</h3>
                    <ul className="space-y-3 text-gray-600 font-light">
                      <li>• Analyze usage patterns and optimize performance</li>
                      <li>• Develop new features and enhancements</li>
                      <li>• Improve AI prompt optimization algorithms</li>
                      <li>• Fix bugs and technical issues</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Communication</h3>
                    <ul className="space-y-3 text-gray-600 font-light">
                      <li>• Send important service updates</li>
                      <li>• Provide customer support</li>
                      <li>• Notify about security alerts</li>
                      <li>• Share platform announcements</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Data Security & Storage</h2>
                <p className="text-gray-600 leading-relaxed mb-8 font-light">
                  We implement industry-standard security measures to protect your data. Your prompts and personal information are encrypted both in transit and at rest using advanced encryption
                  protocols.
                </p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Security Measures</h3>
                    <ul className="space-y-3 text-gray-600 font-light">
                      <li>• End-to-end encryption for data transmission</li>
                      <li>• Secure cloud infrastructure with regular backups</li>
                      <li>• Multi-factor authentication support</li>
                      <li>• Regular security audits and monitoring</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Data Retention</h3>
                    <ul className="space-y-3 text-gray-600 font-light">
                      <li>• Account data retained while account is active</li>
                      <li>• Prompt data deleted within 30 days of account closure</li>
                      <li>• Usage logs retained for 12 months for security purposes</li>
                      <li>• You can request immediate data deletion</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Sharing */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Data Sharing & Third Parties</h2>
                <p className="text-gray-700 font-semibold mb-4">We never sell your data.</p>
                <p className="text-gray-600 leading-relaxed mb-8 font-light">
                  Promplify does not sell, rent, or trade your personal information to third parties for marketing purposes. We only share your information in the following limited circumstances:
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Service Providers</h3>
                    <p className="text-gray-600 font-light">Trusted third-party services that help us operate our platform (hosting, analytics, customer support)</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Legal Requirements</h3>
                    <p className="text-gray-600 font-light">When required by law, court order, or to protect the rights and safety of our users</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Public Sharing</h3>
                    <p className="text-gray-600 font-light">Prompts you explicitly choose to share publicly through our platform features</p>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Your Rights & Control</h2>
                <p className="text-gray-600 leading-relaxed mb-8 font-light">You have full control over your personal data. Here are your rights and how to exercise them:</p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Access & Download</h3>
                    <p className="text-gray-600 font-light">View and export all your personal data and prompts</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Correct & Update</h3>
                    <p className="text-gray-600 font-light">Edit your profile and account information anytime</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Delete Account</h3>
                    <p className="text-gray-600 font-light">Permanently remove your account and all associated data</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Privacy Settings</h3>
                    <p className="text-gray-600 font-light">Control sharing preferences and privacy options</p>
                  </div>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Children's Privacy</h2>
                <p className="text-gray-700 font-semibold mb-4">Age Requirement: 13+</p>
                <p className="text-gray-600 leading-relaxed font-light">
                  Promplify is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe
                  your child has provided us with personal information, please contact us immediately at <span className="font-medium text-gray-800">privacy@promplify.com</span> so we can delete such
                  information.
                </p>
              </section>

              {/* Changes to Policy */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed mb-8 font-light">
                  We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. When we make significant changes, we will:
                </p>

                <ul className="space-y-4 text-gray-600 font-light">
                  <li>• Send advance notice to your registered email</li>
                  <li>• Display prominent notification in the application</li>
                  <li>• Provide 30 days to review changes before they take effect</li>
                </ul>
              </section>

              {/* Contact Information */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Questions About This Policy?</h2>
                <p className="text-gray-600 mb-8 leading-relaxed font-light">
                  We're here to help! If you have any questions about this privacy policy or how we handle your data, please don't hesitate to reach out to our privacy team.
                </p>

                <div className="space-y-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Privacy inquiries:</span>
                    <a href="mailto:privacy@promplify.com" className="text-[#2C106A] hover:underline ml-2">
                      privacy@promplify.com
                    </a>
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">General support:</span>
                    <a href="mailto:support@promplify.com" className="text-[#2C106A] hover:underline ml-2">
                      support@promplify.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
