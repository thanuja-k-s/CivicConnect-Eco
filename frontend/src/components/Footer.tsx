import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-navy text-navy-foreground mt-auto">
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-6 w-6 text-saffron" />
            <span className="text-lg font-bold">Civic Connect</span>
          </div>
          <p className="text-sm text-navy-foreground/70 leading-relaxed">
            An initiative by the Government to empower citizens to report and track civic issues in their locality for faster resolution.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-saffron">Quick Links</h4>
          <ul className="space-y-2 text-sm text-navy-foreground/70">
            <li><Link to="/" className="hover:text-saffron transition-colors">Home</Link></li>
            <li><Link to="/report" className="hover:text-saffron transition-colors">Report Issue</Link></li>
            <li><Link to="/track" className="hover:text-saffron transition-colors">Track Complaint</Link></li>
            <li><Link to="/login" className="hover:text-saffron transition-colors">Login</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/20 mt-8 pt-6 text-center text-xs text-navy-foreground/50">
        <p>© 2026 Civic Connect — Government of India. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
