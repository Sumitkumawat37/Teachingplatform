import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#EEEADE] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last Updated: June 18, 2026</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">1.1 Personal Information</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Profile picture (if uploaded)</li>
                <li>Phone number (if provided)</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">1.2 Usage Data</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Course enrollment history</li>
                <li>Lecture progress</li>
                <li>Quiz scores</li>
                <li>Login history</li>
                <li>Device information</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">1.3 Payment Information</h3>
              <p className="text-slate-600">Payment transactions are processed securely through Razorpay. We do not store credit card information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. How We Use Your Information</h2>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">2.1 Educational Services</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>To provide access to purchased courses</li>
                <li>To track learning progress</li>
                <li>To provide personalized recommendations</li>
                <li>To send course-related notifications</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">2.2 Account Management</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>To authenticate users</li>
                <li>To manage subscriptions</li>
                <li>To provide customer support</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">2.3 Analytics</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>To improve our services</li>
                <li>To analyze usage patterns</li>
                <li>To optimize performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. Data Storage & Security</h2>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">3.1 Storage</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>All data is stored securely in Supabase (PostgreSQL database)</li>
                <li>User passwords are hashed and salted</li>
                <li>Payment data is processed through Razorpay (PCI DSS compliant)</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">3.2 Security Measures</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Row Level Security (RLS) policies in database</li>
                <li>Regular security audits</li>
                <li>Secure authentication with Supabase Auth</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Data Sharing</h2>
              <p className="text-slate-600 mb-3">We do not sell, rent, or trade your personal information with third parties for their marketing purposes.</p>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">4.1 Third-Party Services</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Razorpay:</strong> Payment processing</li>
                <li><strong>Google:</strong> OAuth authentication</li>
                <li><strong>Google Analytics:</strong> Usage analytics</li>
                <li><strong>Google Tag Manager:</strong> Marketing analytics</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">4.2 Legal Requirements</h3>
              <p className="text-slate-600">We may disclose your information if required by law or to protect our rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Your Rights</h2>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">5.1 Access</h3>
              <p className="text-slate-600">You can request a copy of your personal data.</p>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">5.2 Correction</h3>
              <p className="text-slate-600">You can update or correct your personal information.</p>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">5.3 Deletion</h3>
              <p className="text-slate-600">You can request deletion of your account and all associated data.</p>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">5.4 Opt-Out</h3>
              <p className="text-slate-600">You can opt-out of marketing communications.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Data Retention</h2>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Account data: Retained while account is active</li>
                <li>Purchase records: Retained for 7 years (legal requirement)</li>
                <li>Analytics data: Retained for 2 years</li>
                <li>Deleted accounts: Data permanently removed within 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Children's Privacy</h2>
              <p className="text-slate-600">Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">8. International Data Transfers</h2>
              <p className="text-slate-600">Your data may be transferred to and processed in countries other than your own in accordance with this privacy policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Changes to This Policy</h2>
              <p className="text-slate-600">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Contact Us</h2>
              <p className="text-slate-600 mb-2">For any questions about this privacy policy, please contact:</p>
              <ul className="list-none text-slate-600 space-y-1">
                <li><strong>Email:</strong> nadiyakhan0205@gmail.com</li>
                <li><strong>Website:</strong> https://www.upscwithnadiya.in</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">11. Account Deletion</h2>
              <p className="text-slate-600 mb-3">To delete your account and all associated data:</p>
              <ol className="list-decimal pl-5 text-slate-600 space-y-1">
                <li>Go to Profile settings</li>
                <li>Click "Delete Account"</li>
                <li>Confirm deletion</li>
                <li>All data will be permanently removed within 30 days</li>
              </ol>
              <p className="text-slate-600 mt-3">Alternatively, email us at nadiyakhan0205@gmail.com with the subject "Account Deletion Request" from your registered email address.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
