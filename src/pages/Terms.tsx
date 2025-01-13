import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container max-w-4xl mx-auto p-6 pt-32">
        <div className="bg-white shadow-sm rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
            <p className="text-gray-600 mb-12 text-center">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-semibold mt-12 mb-6">1. Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                By accessing this Website, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local
                laws. If you disagree with any of these terms, you are prohibited from accessing this site.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">2. Use License</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Permission is granted to temporarily download one copy of the materials (information or software) on Promplify's Website for personal, non-commercial transitory viewing only. This is
                the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8">
                <li className="mb-2">Modify or copy the materials</li>
                <li className="mb-2">Use the materials for any commercial purpose</li>
                <li className="mb-2">Attempt to decompile or reverse engineer any software contained on Promplify's Website</li>
                <li className="mb-2">Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-12 mb-6">3. Disclaimer</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                All the materials on Promplify's Website are provided "as is". Promplify makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore,
                Promplify does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites
                linked to this Website.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">4. Limitations</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Promplify or its suppliers will not be held accountable for any damages that will arise with the use or inability to use the materials on Promplify's Website, even if Promplify or an
                authorized representative of this Website has been notified, orally or written, of the possibility of such damage.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">5. Revisions and Errata</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                The materials appearing on Promplify's Website may include technical, typographical, or photographic errors. Promplify will not promise that any of the materials in this Website are
                accurate, complete, or current. Promplify may change the materials contained on its Website at any time without notice.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">6. Links</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Promplify has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement
                by Promplify of the site. Use of any such linked website is at the user's own risk.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">7. Site Terms of Use Modifications</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Promplify may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and
                Conditions of Use.
              </p>

              <h2 className="text-2xl font-semibold mt-12 mb-6">8. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Any claim related to Promplify's Website shall be governed by the laws of the country of registration without regards to its conflict of law provisions.
              </p>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 text-center">If you have any questions about these Terms of Service, please contact us at support@promplify.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
