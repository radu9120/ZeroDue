import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Lock,
  Mail,
  Users,
  FileText,
  Globe,
} from "lucide-react";
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-24 md:pt-28 bg-gradient-to-br from-blue-50 via-white to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-dark mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-header-text dark:text-slate-100">
                Privacy Policy
              </h1>
              <p className="text-secondary-text mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* Introduction */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              Introduction
            </h2>
            <div className="space-y-4 text-primary-text leading-relaxed">
              <p>
                At ZeroDue ("we", "our", or "us"), operated by VEROSITE LTD,
                Company number 16227585, we are committed to protecting and
                respecting your privacy. ZeroDue is a trading name of VEROSITE
                LTD. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you visit our website and
                use our invoicing services.
              </p>
              <p>
                This policy complies with the UK General Data Protection
                Regulation (UK GDPR) and the Data Protection Act 2018. By using
                our service, you agree to the collection and use of information
                in accordance with this policy.
              </p>
            </div>
          </div>

          {/* Data Controller */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              Data Controller
            </h2>
            <div className="space-y-3 text-primary-text">
              <p>
                <strong>Company:</strong> VEROSITE LTD
              </p>
              <p>
                <strong>Trading Name:</strong> ZeroDue
              </p>
              <p>
                <strong>Company Number:</strong> 16227585
              </p>
              <p>
                <strong>Registered Office:</strong> Flat 209, 1 Indescon Square,
                London, England, E14 9DQ
              </p>
              <p>
                <strong>Email:</strong> support@zerodue.co
              </p>
              <p>
                <strong>Data Protection Officer:</strong> dpo@zerodue.co
              </p>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-6">
              Information We Collect
            </h2>

            <div className="space-y-6">
              {/* Personal Information */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-header-text mb-2">
                    Personal Information
                  </h3>
                  <p className="text-primary-text mb-3">
                    When you register for an account or use our services, we may
                    collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-primary-text text-sm">
                    <li>
                      Name and contact information (email address, phone number)
                    </li>
                    <li>
                      Business information (company name, address, VAT number)
                    </li>
                    <li>
                      Payment information (processed securely by our payment
                      providers)
                    </li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>
              </div>

              {/* Business Data */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-header-text mb-2">
                    Business Data
                  </h3>
                  <p className="text-primary-text mb-3">
                    Information related to your invoicing activities:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-primary-text text-sm">
                    <li>
                      Invoice data (client details, amounts, descriptions)
                    </li>
                    <li>Customer information you input</li>
                    <li>Transaction records and payment history</li>
                    <li>Financial reports and analytics data</li>
                  </ul>
                </div>
              </div>

              {/* Technical Information */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Database className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-header-text mb-2">
                    Technical Information
                  </h3>
                  <p className="text-primary-text mb-3">
                    Automatically collected when you use our website:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-primary-text text-sm">
                    <li>IP address and location data</li>
                    <li>Browser type and version</li>
                    <li>Device information and operating system</li>
                    <li>Usage data and website interactions</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-6">
              How We Use Your Information
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Service Provision (Legal Basis: Contract)
                </h3>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  <li>Create and manage your account</li>
                  <li>Process invoices and payments</li>
                  <li>Provide customer support</li>
                  <li>Deliver our invoicing services</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">
                  Legitimate Interests
                </h3>
                <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                  <li>Improve our services and user experience</li>
                  <li>Conduct analytics and research</li>
                  <li>Prevent fraud and ensure security</li>
                  <li>Send service-related communications</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">Consent</h3>
                <ul className="list-disc list-inside space-y-1 text-orange-800 text-sm">
                  <li>Send marketing communications (with your consent)</li>
                  <li>Use non-essential cookies</li>
                  <li>Personalize content and advertisements</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">
                  Legal Compliance
                </h3>
                <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                  <li>Comply with legal obligations</li>
                  <li>Respond to legal requests</li>
                  <li>Maintain records for tax purposes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              Information Sharing and Disclosure
            </h2>
            <div className="space-y-4 text-primary-text">
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties except as described below:
              </p>

              <div className="space-y-3">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold">Service Providers</h3>
                  <p className="text-sm">
                    Payment processors, cloud hosting, email services, and
                    analytics providers who assist in our operations.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold">Legal Requirements</h3>
                  <p className="text-sm">
                    When required by law, court order, or to protect our rights
                    and safety.
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold">Business Transfers</h3>
                  <p className="text-sm">
                    In connection with a merger, acquisition, or sale of assets
                    (with notice to users).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-header-text mb-4">
                  Data Security
                </h2>
                <div className="space-y-3 text-primary-text">
                  <p>
                    We implement appropriate technical and organizational
                    measures to protect your personal data:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Encrypted data storage</li>
                    <li>Regular security assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Employee training on data protection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-6">
              Your Rights Under UK GDPR
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-blue-900 text-sm">
                    Right of Access
                  </h3>
                  <p className="text-blue-800 text-xs">
                    Request copies of your personal data
                  </p>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-green-900 text-sm">
                    Right to Rectification
                  </h3>
                  <p className="text-green-800 text-xs">
                    Correct inaccurate personal data
                  </p>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-orange-900 text-sm">
                    Right to Erasure
                  </h3>
                  <p className="text-orange-800 text-xs">
                    Request deletion of your data
                  </p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-purple-900 text-sm">
                    Right to Restrict Processing
                  </h3>
                  <p className="text-purple-800 text-xs">
                    Limit how we use your data
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-red-900 text-sm">
                    Right to Data Portability
                  </h3>
                  <p className="text-red-800 text-xs">
                    Transfer your data to another service
                  </p>
                </div>

                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 text-sm">
                    Right to Object
                  </h3>
                  <p className="text-indigo-800 text-xs">
                    Object to processing based on legitimate interests
                  </p>
                </div>

                <div className="bg-pink-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-pink-900 text-sm">
                    Right to Withdraw Consent
                  </h3>
                  <p className="text-pink-800 text-xs">
                    Withdraw consent for processing
                  </p>
                </div>

                <div className="bg-teal-50 p-3 rounded-lg">
                  <h3 className="font-semibold text-teal-900 text-sm">
                    Right to Complain
                  </h3>
                  <p className="text-teal-800 text-xs">
                    Contact the ICO if you have concerns
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p className="text-sm text-secondary-text dark:text-slate-400">
                To exercise any of these rights, please contact us at{" "}
                <strong>support@zerodue.co</strong>. We will respond within one
                month of receiving your request.
              </p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              Data Retention
            </h2>
            <div className="space-y-3 text-primary-text">
              <p>
                We retain your personal data only for as long as necessary to
                fulfill the purposes outlined in this policy:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <strong>Account Data:</strong> While your account remains
                  active and for 7 years after closure for legal compliance
                </li>
                <li>
                  <strong>Invoice Data:</strong> 7 years for tax and legal
                  requirements
                </li>
                <li>
                  <strong>Website Analytics:</strong> 26 months maximum
                </li>
                <li>
                  <strong>Marketing Data:</strong> Until you unsubscribe or
                  object
                </li>
              </ul>
            </div>
          </div>

          {/* International Transfers */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-primary dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-header-text mb-4">
                  International Data Transfers
                </h2>
                <div className="space-y-3 text-primary-text text-sm">
                  <p>
                    Some of our service providers may be located outside the
                    UK/EEA. When we transfer your data internationally, we
                    ensure appropriate safeguards are in place, including:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Adequacy decisions by the UK government</li>
                    <li>Standard Contractual Clauses (SCCs)</li>
                    <li>Binding Corporate Rules</li>
                    <li>Certification schemes and codes of conduct</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-header-text mb-4">
                  Contact Us
                </h2>
                <div className="space-y-3 text-primary-text">
                  <p>
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      ZeroDue is a trading name of VEROSITE LTD (Company number
                      16227585).
                    </p>
                    <p>
                      <strong>Email:</strong> support@zerodue.co
                    </p>
                    <p>
                      <strong>Data Protection Officer:</strong> dpo@zerodue.co
                    </p>
                    <p>
                      <strong>Post:</strong> VEROSITE LTD, Flat 209, 1 Indescon
                      Square, London, England, E14 9DQ
                    </p>
                    {/* <p>
                      <strong>ICO Registration:</strong> [Registration Number]
                    </p> */}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Complaints:</strong> You have the right to
                      complain to the Information Commissioner's Office (ICO) if
                      you believe we have not handled your personal data
                      properly. Visit <strong>ico.org.uk</strong> for more
                      information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg border border-blue-100 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-header-text mb-4">
              Changes to This Policy
            </h2>
            <p className="text-primary-text text-sm">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              this page and updating the "Last updated" date. We encourage you
              to review this policy periodically for any changes.
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-cyan-500 text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
