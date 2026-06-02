import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Construction,
  Trash2,
  Droplets,
  Lamp,
  AlertTriangle,
  ArrowRight,
  FileText,
  UserCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const categories = [
  { icon: Construction, label: "Road", color: "text-saffron" },
  { icon: Trash2, label: "Garbage", color: "text-success" },
  { icon: Droplets, label: "Water", color: "text-info" },
  { icon: AlertTriangle, label: "Drainage", color: "text-warning" },
  { icon: Lamp, label: "Streetlight", color: "text-primary" },
  { icon: Trash2, label: "Illegal Dumping", color: "text-destructive" },
];

const steps = [
  { icon: FileText, title: "Submit Issue", desc: "Report a civic issue with details and location" },
  { icon: UserCheck, title: "Gets Assigned", desc: "Admin reviews and assigns a field worker" },
  { icon: CheckCircle2, title: "Issue Resolved", desc: "Worker resolves and updates the status" },
];



const Index = () => (
  <div>
    {/* Hero */}
    <section
      className="relative min-h-[520px] flex items-center justify-center text-center"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-navy/80" />
      <div className="relative z-10 container mx-auto px-4 py-20 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          Report Civic Issues <span className="text-saffron">Easily</span>
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
          Empowering citizens to report road damage, garbage, water supply issues and more.
          Track your complaint in real-time until resolution.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/report">
            <Button size="lg" className="bg-saffron text-saffron-foreground hover:bg-saffron/90 gap-2 text-base font-semibold shadow-lg">
              Report an Issue <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/track">
            <Button size="lg" variant="outline" className="border-white bg-white/20 text-white hover:bg-white/30 text-base font-semibold">
              Track Complaint
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">How It Works</h2>
        <p className="text-center text-muted-foreground mb-10">Three simple steps to get your civic issue resolved</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <Card key={i} className="text-center border-2 hover:border-saffron transition-colors hover:shadow-lg">
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-saffron/10 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-saffron" />
                </div>
                <div className="text-xs font-bold text-saffron mb-1">STEP {i + 1}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Issue Categories</h2>
        <p className="text-center text-muted-foreground mb-10">Select the type of civic issue you want to report</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {categories.map((cat, i) => (
            <Link to="/report" key={i}>
              <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="pt-6 pb-4">
                  <cat.icon className={`h-10 w-10 mx-auto mb-3 ${cat.color}`} />
                  <p className="text-sm font-semibold">{cat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>


  </div>
);

export default Index;
