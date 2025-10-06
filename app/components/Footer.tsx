
const socialLinks = [
  { label: "GitHub", href: "#", icon: "🐙" },
  { label: "Twitter", href: "#", icon: "🐦" },
  { label: "LinkedIn", href: "#", icon: "💼" },
  { label: "Email", href: "#", icon: "📧" },
];

const quickLinks = [
  { label: "About", href: "#" },
  { label: "Services", href: "#" },
  { label: "Portfolio", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative z-20 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company info */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-4">Your Company</h3>
            <p className="text-gray-300 leading-relaxed">
              Creating beautiful and interactive experiences with modern web technologies.
            </p>
          </div>

          {/* Quick links */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social links */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
            <div className="flex justify-center md:justify-end space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-2xl hover:scale-110 transition-transform duration-200"
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Your Company. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}