import { Link } from "wouter";
import { Coffee, Instagram, Facebook, Twitter, MapPin, Phone, Mail, Sparkles } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-primary text-white pt-24 pb-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-8">
                        <Link href="/" className="group flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md border border-white/10 group-hover:rotate-6 transition-all font-bold text-lg">P</div>
                            <span className="font-display text-2xl text-white font-normal">Parsik <span className="text-accent italic">elite</span></span>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs font-medium">
                            Elevating the artisanal coffee culture in Mumbai with premium roasts and gourmet cuisine since 2015.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink icon={<Instagram className="w-4 h-4" />} />
                            <SocialLink icon={<Facebook className="w-4 h-4" />} />
                            <SocialLink icon={<Twitter className="w-4 h-4" />} />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-accent">Curriculum</h4>
                        <ul className="space-y-4">
                            <FooterLink href="/">Home</FooterLink>
                            <FooterLink href="/menu">Artisanal Menu</FooterLink>
                            <FooterLink href="/reservation">Member Booking</FooterLink>
                            <FooterLink href="/scan">Direct Order</FooterLink>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-accent">Registry</h4>
                        <ul className="space-y-5">
                            <ContactItem icon={<MapPin className="w-4 h-4" />} text="Sector 20, Airoli, Navi Mumbai" />
                            <ContactItem icon={<Phone className="w-4 h-4" />} text="+91 98765 43210" />
                            <ContactItem icon={<Mail className="w-4 h-4" />} text="hello@parsikcafe.com" />
                        </ul>
                    </div>

                    {/* Hours */}
                    <div className="space-y-8">
                        <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-accent">Availability</h4>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Weekdays</p>
                                <p className="text-sm font-semibold italic text-white/80">11:00 AM – 11:00 PM</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Weekends</p>
                                <p className="text-sm font-semibold italic text-white/80">10:00 AM – 12:00 AM</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-[0.2em]">
                        © 2026 Parsik Elite • All Rights Reserved
                    </p>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-accent">
                        <Sparkles className="w-3 h-3" /> Premium Service Standard
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon }) {
    return (
        <a href="#" className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 hover:bg-accent hover:border-accent transition-all duration-300">
            {icon}
        </a>
    );
}

function FooterLink({ href, children }) {
    return (
        <li>
            <Link href={href}>
                <span className="text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer">{children}</span>
            </Link>
        </li>
    );
}

function ContactItem({ icon, text }) {
    return (
        <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-accent border border-white/5 shrink-0 uppercase">{icon}</div>
            <span className="text-sm font-semibold text-white/60 leading-tight">{text}</span>
        </li>
    );
}
