import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Interactive",
    description: "Smooth animations and particle effects",
    content: "Experience fluid interactions with every click",
    icon: "✨"
  },
  {
    title: "Modern Design",
    description: "Clean and contemporary interface",
    content: "Built with the latest design principles",
    icon: "🎨"
  },
  {
    title: "Responsive",
    description: "Works perfectly on all devices",
    content: "Optimized for desktop, tablet, and mobile",
    icon: "📱"
  }
];

const additionalFeatures = [
  {
    title: "Fast Performance",
    description: "Lightning-fast loading times",
    content: "Optimized for speed and efficiency",
    icon: "⚡"
  },
  {
    title: "Secure",
    description: "Enterprise-grade security",
    content: "Your data is protected with industry standards",
    icon: "🔒"
  },
  {
    title: "Scalable",
    description: "Grows with your business",
    content: "Built to handle any size project",
    icon: "📈"
  }
];

export default function MainContent() {
  return (
    <main className="relative z-10 flex-1 py-16">
      <div className="container mx-auto px-4">
        {/* Primary feature cards */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Our Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                <CardHeader>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    {feature.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to action section */}
        <section className="text-center mb-20">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-12 border border-white/10 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already experiencing the future of web interaction
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-3">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Secondary feature cards */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    {feature.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}