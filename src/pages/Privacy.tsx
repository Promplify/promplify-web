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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO
        canonicalPath="/privacy"
        title="Privacy Policy - Promplify"
        description="Learn how Promplify protects your privacy and handles your data when you use our AI prompt management platform."
        keywords="privacy policy, data protection, user privacy"
      />
      <Navigation />
      <main className="container max-w-5xl mx-auto p-6 pt-32">
        <div className="bg-white shadow-lg rounded-xl p-8 md:p-12 border border-gray-100">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Privacy Policy</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600 font-medium">Last updated: June 15, 2025</p>
              </div>
            </div>

            <div className="prose prose-lg prose-slate max-w-none">
              {/* Introduction */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 mb-12 border border-blue-100">
                <p className="text-xl text-gray-700 leading-relaxed mb-0 font-medium">
                  At Promplify, we are committed to protecting your privacy and being transparent about how we collect, use, and protect your personal information. This privacy policy explains how we
                  handle your data when you use our AI prompt management platform.
                </p>
              </div>

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Information We Collect
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We collect information that you voluntarily provide to us and that is necessary to deliver our AI prompt management services. All data collection is done with your explicit consent
                  and in accordance with applicable privacy laws.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Account Information</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Email address for account creation and communication
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Username and profile information you choose to provide
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Authentication data from third-party providers (GitHub, Google)
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Usage Data</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        AI prompts you create, edit, and organize
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        Usage analytics to improve our platform
                      </li>
                      <li className="flex items-start">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        API usage statistics and performance metrics
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  How We Use Your Information
                </h2>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Service Delivery</h3>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• Provide AI prompt management features</li>
                      <li>• Sync your prompts across devices</li>
                      <li>• Enable collaboration and sharing</li>
                      <li>• Process API requests and responses</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">Platform Improvement</h3>
                    <ul className="space-y-2 text-green-700 text-sm">
                      <li>• Analyze usage patterns and optimize performance</li>
                      <li>• Develop new features and enhancements</li>
                      <li>• Improve AI prompt optimization algorithms</li>
                      <li>• Fix bugs and technical issues</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-semibold mb-4 text-purple-800">Communication</h3>
                    <ul className="space-y-2 text-purple-700 text-sm">
                      <li>• Send important service updates</li>
                      <li>• Provide customer support</li>
                      <li>• Notify about security alerts</li>
                      <li>• Share platform announcements</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Data Security & Storage
                </h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    We implement industry-standard security measures to protect your data. Your prompts and personal information are encrypted both in transit and at rest using advanced encryption
                    protocols.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Security Measures</h4>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• End-to-end encryption for data transmission</li>
                        <li>• Secure cloud infrastructure with regular backups</li>
                        <li>• Multi-factor authentication support</li>
                        <li>• Regular security audits and monitoring</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Data Retention</h4>
                      <ul className="space-y-2 text-gray-600 text-sm">
                        <li>• Account data retained while account is active</li>
                        <li>• Prompt data deleted within 30 days of account closure</li>
                        <li>• Usage logs retained for 12 months for security purposes</li>
                        <li>• You can request immediate data deletion</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Sharing */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Data Sharing & Third Parties
                </h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-6">
                  <p className="text-yellow-800 font-medium mb-2">We never sell your data</p>
                  <p className="text-yellow-700 text-sm">Promplify does not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">We only share your information in the following limited circumstances:</p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Service Providers</h4>
                      <p className="text-gray-600 text-sm">Trusted third-party services that help us operate our platform (hosting, analytics, customer support)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Legal Requirements</h4>
                      <p className="text-gray-600 text-sm">When required by law, court order, or to protect the rights and safety of our users</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">Public Sharing</h4>
                      <p className="text-gray-600 text-sm">Prompts you explicitly choose to share publicly through our platform features</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Your Rights & Control
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">You have full control over your personal data. Here are your rights and how to exercise them:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Access & Download</h4>
                        <p className="text-gray-600 text-sm">View and export all your personal data and prompts</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Correct & Update</h4>
                        <p className="text-gray-600 text-sm">Edit your profile and account information anytime</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM8 13a1 1 0 012 0v1a1 1 0 11-2 0v-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Delete Account</h4>
                        <p className="text-gray-600 text-sm">Permanently remove your account and all associated data</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Privacy Settings</h4>
                        <p className="text-gray-600 text-sm">Control sharing preferences and privacy options</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 8v11a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h4a1 1 0 001-1V8l-7-6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Children's Privacy
                </h2>
                <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
                  <p className="text-pink-800 font-medium mb-3">Age Requirement: 13+</p>
                  <p className="text-pink-700 leading-relaxed">
                    Promplify is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe
                    your child has provided us with personal information, please contact us immediately at <span className="font-medium">privacy@promplify.com</span> so we can delete such information.
                  </p>
                </div>
              </section>

              {/* Changes to Policy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Changes to This Policy
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We may update this privacy policy from time to time to reflect changes in our practices or applicable laws. When we make significant changes, we will:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-blue-800 mb-2">Email Notification</h4>
                    <p className="text-blue-700 text-sm">Send advance notice to your registered email</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-green-800 mb-2">Platform Notice</h4>
                    <p className="text-green-700 text-sm">Display prominent notification in app</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-purple-800 mb-2">30-Day Notice</h4>
                    <p className="text-purple-700 text-sm">Provide 30 days to review changes</p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <div className="bg-gradient-to-r from-[#2C106A]/10 to-purple-500/10 rounded-xl p-8 border border-purple-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">Questions About This Policy?</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    We're here to help! If you have any questions about this privacy policy or how we handle your data, please don't hesitate to reach out to our privacy team.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a href="mailto:privacy@promplify.com" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C106A] text-white rounded-lg hover:bg-[#1F0B4C] transition-colors font-medium">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      privacy@promplify.com
                    </a>
                    <span className="text-gray-400">or</span>
                    <a
                      href="mailto:support@promplify.com"
                      className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-1.56-1.56A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.539-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      General Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
