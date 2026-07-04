import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Construction, Trash2, Droplets, Lamp, AlertTriangle, ArrowRight,
  FileText, UserCheck, CheckCircle2, Leaf, Globe,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const categories = [
  { icon: Construction,  label: "Road",           color: "text-saffron" },
  { icon: Trash2,        label: "Garbage",         color: "text-success" },
  { icon: Droplets,      label: "Water",           color: "text-info" },
  { icon: AlertTriangle, label: "Drainage",        color: "text-warning" },
  { icon: Lamp,          label: "Streetlight",     color: "text-primary" },
  { icon: Trash2,        label: "Illegal Dumping", color: "text-destructive" },
];

const steps = [
  { icon: FileText,     title: "Submit Issue",   desc: "Report a civic issue with details and location" },
  { icon: UserCheck,    title: "Gets Assigned",  desc: "Admin reviews and assigns a field worker" },
  { icon: CheckCircle2, title: "Issue Resolved", desc: "Worker resolves and updates the status" },
];

const ecoModules = [
  {
    icon: "🌿", title: "Eco Events",
    desc: "Join tree plantation drives, beach cleanups, and other community events near you.",
    link: "/events", cta: "Discover Events",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    icon: "🏆", title: "Leaderboard",
    desc: "Earn Eco Points for every action and climb the leaderboard. Unlock exclusive badges.",
    link: "/leaderboard", cta: "View Rankings",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: "🌍", title: "Eco Impact",
    desc: "Real-time stats on trees planted, waste collected, and CO₂ reduced by our community.",
    link: "/eco-impact", cta: "See Our Impact",
    gradient: "from-blue-500 to-teal-600",
  },
  {
    icon: "🏛️", title: "NGO / Eco Club",
    desc: "Register your organization, create environmental events, and mobilize volunteers.",
    link: "/ngo/register", cta: "Register NGO",
    gradient: "from-purple-500 to-violet-600",
  },
];

const Index = () => (
  <div>
    {/* Compact Hero — ~50% shorter */}
    <section
      className="relative flex items-center justify-center text-center"
      style={{
        minHeight: "260px",
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-navy/80" />
      <div className="relative z-10 container mx-auto px-8 py-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 rounded-full px-3 py-1 text-green-300 text-xs font-medium mb-3">
          <Leaf className="h-3 w-3" /> Now with NGO / Eco Club Engagement Module
        </div>
        <h1 className="text-[28px] md:text-[36px] font-extrabold text-white mb-2.5 leading-tight">
          Report Civic Issues <span className="text-saffron">Easily</span>
        </h1>
        <p className="text-sm text-white/80 max-w-xl mx-auto mb-5">
          Empowering citizens to report road damage, garbage, water supply issues and more.
          Join eco events, earn badges, and track your environmental impact.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/report">
            <Button size="sm" className="bg-saffron text-saffron-foreground hover:bg-saffron/90 gap-1.5 text-sm font-semibold shadow-lg h-9 px-4">
              Report an Issue <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link to="/events">
            <Button size="sm" variant="outline" className="border-green-400 bg-green-500/20 text-green-300 hover:bg-green-500/30 text-sm font-semibold h-9 px-4">
              <Leaf className="mr-1.5 h-3.5 w-3.5" /> Explore Eco Events
            </Button>
          </Link>
          <Link to="/track">
            <Button size="sm" variant="outline" className="border-white bg-white/20 text-white hover:bg-white/30 text-sm font-semibold h-9 px-4">
              Track Complaint
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Eco Module CTA Section */}
    <section className="py-10 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-8">
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-2">
            <Leaf className="h-3 w-3" /> NEW
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">NGO / Eco Club Ecosystem</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            CivicConnect Eco connects citizens, NGOs, and government for coordinated environmental action
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {ecoModules.map((mod) => (
            <Link to={mod.link} key={mod.title}>
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer rounded-xl">
                <div className={`h-1 bg-gradient-to-r ${mod.gradient}`} />
                <CardContent className="pt-4 pb-4 px-4">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform inline-block">{mod.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{mod.title}</h3>
                  <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">{mod.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                    {mod.cta} <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-10 bg-background">
      <div className="container mx-auto px-8">
        <h2 className="text-xl font-bold text-center mb-1.5">How It Works</h2>
        <p className="text-center text-muted-foreground text-sm mb-7">Three simple steps to get your civic issue resolved</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <Card key={i} className="text-center border-2 hover:border-saffron transition-colors hover:shadow-md rounded-xl">
              <CardContent className="pt-6 pb-5">
                <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-saffron" />
                </div>
                <div className="text-[10px] font-bold text-saffron mb-1">STEP {i + 1}</div>
                <h3 className="text-sm font-bold mb-1.5">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-10 bg-muted">
      <div className="container mx-auto px-8">
        <h2 className="text-xl font-bold text-center mb-1.5">Issue Categories</h2>
        <p className="text-center text-muted-foreground text-sm mb-7">Select the type of civic issue you want to report</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto">
          {categories.map((cat, i) => (
            <Link to="/report" key={i}>
              <Card className="text-center hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full rounded-xl">
                <CardContent className="pt-5 pb-3">
                  <cat.icon className={`h-7 w-7 mx-auto mb-2 ${cat.color}`} />
                  <p className="text-xs font-semibold">{cat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Bottom eco banner */}
    <section className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-700 py-7 text-white text-center">
      <p className="text-green-200 text-xs mb-1.5 font-medium uppercase tracking-wider">Join the movement</p>
      <h2 className="text-xl md:text-2xl font-extrabold mb-4">Together, we're making India Greener 🌿</h2>
      <div className="flex flex-wrap justify-center gap-7 mb-5">
        {[
          { emoji: "🌳", label: "Trees Planted" },
          { emoji: "🏖️", label: "Cleanups Done" },
          { emoji: "👥", label: "Volunteers" },
          { emoji: "🏛️", label: "NGOs Active" },
        ].map(({ emoji, label }) => (
          <div key={label} className="text-center">
            <div className="text-xl mb-0.5">{emoji}</div>
            <p className="text-[10px] text-green-300">{label}</p>
          </div>
        ))}
      </div>
      <Link to="/eco-impact">
        <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10 text-xs h-8">
          <Globe className="mr-1.5 h-3 w-3" /> View Live Eco Impact Dashboard
        </Button>
      </Link>
    </section>
  </div>
);

export default Index;
