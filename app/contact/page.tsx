import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif text-brand-burgundy mb-4">Get in Touch</h1>
        <p className="text-brand-charcoal/80 text-lg">We would love to hear from you. Reach out to us for any queries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8 bg-white p-8 rounded-xl border border-brand-rose/20 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-brand-rose/10 p-3 rounded-full text-brand-burgundy">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal mb-1">Phone</h3>
              <p className="text-brand-charcoal/80">9054549199</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-brand-rose/10 p-3 rounded-full text-brand-burgundy">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal mb-1">Email</h3>
              <p className="text-brand-charcoal/80">contact.adaabyshagun@gmail.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-brand-rose/10 p-3 rounded-full text-brand-burgundy">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal mb-1">Visit Us</h3>
              <p className="text-brand-charcoal/80 leading-relaxed">
                G-3 Upper Floor Centurion Complex,<br />
                Beside SBI Bank, Nr Gipcl Circle,<br />
                Opp. Kalyan Hall, Sama Road,<br />
                Vadodara - 390024
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-brand-rose/10 p-3 rounded-full text-brand-burgundy">
               {/* Replaced Lucide Icon with Raw SVG */}
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </div>
            <div>
              <h3 className="font-semibold text-brand-charcoal mb-1">Instagram</h3>
              <a href="https://instagram.com/adaa.byshagun" target="_blank" rel="noopener noreferrer" className="text-brand-rose hover:text-brand-burgundy transition-colors">
                @adaa.byshagun
              </a>
            </div>
          </div>
        </div>

        {/* Direct Action */}
        <div className="flex flex-col justify-center items-center bg-brand-burgundy text-center p-10 rounded-xl text-brand-cream">
          <MessageCircle className="w-16 h-16 mb-6 text-brand-rose" />
          <h2 className="text-3xl font-serif mb-4">Quick Support</h2>
          <p className="mb-8 text-brand-cream/80 text-lg">
            Have a question about sizing or an existing order? Send us a quick message on WhatsApp.
          </p>
          <a 
            href="https://wa.me/919054549199?text=Hi!%20I%20have%20a%20query%20regarding%20Adaa%20by%20Shagun." 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-brand-rose text-white px-8 py-4 rounded-full font-medium hover:bg-white hover:text-brand-burgundy transition-all duration-300 shadow-lg w-full sm:w-auto"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}