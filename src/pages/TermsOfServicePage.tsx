import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8">Last Updated: June 18, 2026</p>

          <div className="prose prose-slate max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Acceptance of Terms</h2>
              <p className="text-slate-600">By accessing or using the UPSC by Nadiya Ma'am platform, you agree to be bound by these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Description of Service</h2>
              <p className="text-slate-600 mb-3">UPSC by Nadiya Ma'am provides:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Online courses for UPSC preparation</li>
                <li>Live classes and recordings</li>
                <li>Study materials and notes</li>
                <li>Quizzes and assessments</li>
                <li>Mentoring services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">3. User Accounts</h2>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">3.1 Registration</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must notify us immediately of unauthorized access</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">3.2 Account Termination</h3>
              <p className="text-slate-600 mb-2">We reserve the right to:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Suspend or terminate accounts for violations</li>
                <li>Remove content that violates our policies</li>
                <li>Refuse service at our discretion</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Course Enrollment & Payments</h2>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">4.1 Pricing</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Course prices are displayed in INR</li>
                <li>All payments are processed through Razorpay</li>
                <li>We do not store credit card information</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">4.2 Refund Policy</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Refunds are processed within 7 days of purchase</li>
                <li>Courses with more than 20% completion are not eligible for refunds</li>
                <li>Technical issues that prevent course access may qualify for refunds</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">4.3 Course Access</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Access is granted immediately after successful payment</li>
                <li>Course access is lifetime unless otherwise specified</li>
                <li>Account sharing is prohibited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Intellectual Property</h2>
              
              <h3 className="text-lg font-medium text-slate-700 mb-2">5.1 Course Content</h3>
              <p className="text-slate-600">All course materials, videos, notes, and other content are protected by copyright.</p>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">5.2 User-Generated Content</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>You retain rights to content you create</li>
                <li>You grant us license to use content for platform purposes</li>
                <li>You must have rights to all content you upload</li>
              </ul>

              <h3 className="text-lg font-medium text-slate-700 mb-2 mt-4">5.3 Prohibited Uses</h3>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Recording or downloading course videos</li>
                <li>Sharing account credentials</li>
                <li>Distributing course materials</li>
                <li>Reverse engineering the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">6. User Conduct</h2>
              <p className="text-slate-600 mb-2">Users must not:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Use the platform for illegal purposes</li>
                <li>Harass or abuse other users</li>
                <li>Upload malicious content</li>
                <li>Violate intellectual property rights</li>
                <li>Attempt to hack or disrupt the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Privacy</h2>
              <p className="text-slate-600">Your use of our service is also governed by our Privacy Policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Disclaimer of Warranties</h2>
              <p className="text-slate-600">The service is provided "as is" without warranties of any kind.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Limitation of Liability</h2>
              <p className="text-slate-600 mb-2">We are not liable for:</p>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of data or business</li>
                <li>Service interruptions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Indemnification</h2>
              <p className="text-slate-600">You agree to indemnify us from claims arising from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">11. Governing Law</h2>
              <p className="text-slate-600">These terms are governed by the laws of India.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">12. Changes to Terms</h2>
              <p className="text-slate-600">We may modify these terms at any time. Continued use constitutes acceptance of changes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-800 mb-3">13. Contact</h2>
              <p className="text-slate-600 mb-2">For questions about these terms, contact:</p>
              <ul className="list-none text-slate-600 space-y-1">
                <li><strong>Email:</strong> nadiyakhan0205@gmail.com</li>
                <li><strong>Website:</strong> https://www.upscwithnadiya.in</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
