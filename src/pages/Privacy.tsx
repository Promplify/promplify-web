import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container max-w-4xl mx-auto p-6 pt-32">
        <div className="bg-white shadow-sm rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
            <p className="text-gray-600 mb-12 text-center">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-gray-600 leading-relaxed mb-12">
                Your privacy is important to us. It is Promplify's policy to respect your privacy and comply with any applicable law and regulation regarding any personal information we may collect
                about you, including across our website and other sites we own and operate.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know
                why we're collecting it and how it will be used. The types of information we may collect include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li className="mb-2">Basic account information such as username and email</li>
                <li className="mb-2">Profile information you choose to provide</li>
                <li className="mb-2">Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-12 mb-6">How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed mb-8">We use the information we collect in various ways, including to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li className="mb-2">Provide, operate, and maintain our website</li>
                <li className="mb-2">Improve, personalize, and expand our website</li>
                <li className="mb-2">Understand and analyze how you use our website</li>
                <li className="mb-2">Develop new products, services, features, and functionality</li>
                <li>Communicate with you about updates, security alerts, and support</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-12 mb-6">Data Storage and Security</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to
                prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification. We implement appropriate technical and organizational security measures to help
                protect your personal data.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">Data Sharing and Third Parties</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We don't share any personally identifying information publicly or with third-parties, except when required to by law. Our website may link to external sites that are not operated by
                us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">Your Rights and Control</h2>
              <p className="text-gray-600 leading-relaxed mb-8">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li className="mb-2">Access your personal data</li>
                <li className="mb-2">Correct any information you believe is inaccurate</li>
                <li className="mb-2">Request deletion of your personal data</li>
                <li>Opt-out of marketing communications</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-12 mb-6">Children's Privacy</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We do not knowingly collect or store personal information from children under 13. If you believe your child has provided us with personal information, please contact us so we can
                delete this information. If we learn that we have collected personal information from a child under 13, we will take steps to delete that information.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">Changes to Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page. You are advised to review this privacy policy
                periodically for any changes. Changes to this privacy policy are effective when they are posted on this page.
              </p>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 text-center">If you have any questions about our privacy policy or how we handle your data, please contact us at privacy@promplify.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
