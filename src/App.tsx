import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Rocket, 
  Zap, 
  Target, 
  MessageSquare, 
  Layout, 
  CheckCircle2, 
  ArrowRight, 
  Upload, 
  Loader2, 
  ChevronDown,
  Facebook,
  Smartphone,
  Sparkles,
  TrendingUp,
  DollarSign,
  Globe,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { generateCODContent, GenerationResult } from "@/src/lib/gemini";
import { auth, signInWithProvider, logout, googleProvider } from "@/src/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { countries } from "@/src/lib/countries";

function AuthModal({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: 'login' | 'signup' }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: 'Morocco'
  });
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen && type === 'signup') {
      // Try multiple services for better reliability
      const detectCountry = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (!res.ok) throw new Error('ipapi failed');
          const data = await res.json();
          if (data.country_name) {
            setFormData(prev => ({ ...prev, country: data.country_name }));
          }
        } catch (err) {
          console.warn("Primary IP detection failed, trying fallback...", err);
          try {
            const res = await fetch('https://ipinfo.io/json');
            const data = await res.json();
            // ipinfo uses country codes, we need names. This is a simple fallback.
            if (data.country) {
              // If we had a mapping we'd use it, for now just log
              console.log("Fallback detected country code:", data.country);
            }
          } catch (fallbackErr) {
            console.error("All IP detection services failed", fallbackErr);
          }
        }
      };
      detectCountry();
    }
  }, [isOpen, type]);

  const handleAuth = async (provider: any) => {
    if (type === 'signup') {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        setError('Please fill in all fields');
        return;
      }
    }

    try {
      const user = await signInWithProvider(provider, type === 'signup' ? formData : undefined);
      
      if (type === 'signup' && user) {
        // WhatsApp redirection
        const message = `*New User Registration*\n\n` +
          `*Name:* ${formData.firstName} ${formData.lastName}\n` +
          `*Email:* ${user.email}\n` +
          `*Phone:* ${formData.phone}\n` +
          `*Country:* ${formData.country}\n` +
          `*UID:* ${user.uid}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/212694715893?text=${encodedMessage}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
      }
      
      onClose();
    } catch (error) {
      console.error("Auth failed", error);
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-white/10 sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {type === 'login' 
              ? 'Choose your preferred method to login.' 
              : 'Fill in your details to get started with COD AI Machine.'}
          </DialogDescription>
        </DialogHeader>

        {type === 'signup' && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="John" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="+212 600 000 000" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={formData.country} 
                onValueChange={(val) => setFormData({ ...formData, country: val })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 max-h-[300px]">
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-xs text-center mb-2">{error}</p>}

        <div className="grid gap-4 pb-4">
          <Button 
            variant="outline" 
            className="h-12 border-white/10 hover:bg-white/5 flex items-center justify-center gap-3 w-full bg-gradient-purple text-white border-none"
            onClick={() => handleAuth(googleProvider)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {type === 'login' ? 'Login with Google' : 'Sign Up with Google'}
          </Button>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean, type: 'login' | 'signup' }>({ isOpen: false, type: 'login' });

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [productCost, setProductCost] = useState("");
  const [customExchangeRate, setCustomExchangeRate] = useState("");
  const [country, setCountry] = useState("Libya");
  const [images, setImages] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    const files = Array.from(fileList);
    if (files.length + images.length > 4) {
      alert("You can only upload up to 4 images.");
      return;
    }

    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);
    try {
      const data = await generateCODContent(country, productCost, images, country === "Libya" ? customExchangeRate : undefined);
      setResult(data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setResult(null);
    setProductCost("");
    setCustomExchangeRate("");
    setImages([]);
    setCountry("Libya");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-grid-white pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={resetApp}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-purple flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">COD AI <span className="text-gradient">Machine</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#machine" className="hover:text-foreground transition-colors">The Machine</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
            
            {isAuthLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img src={user.photoURL || ""} alt={user.displayName || ""} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                  <span className="text-foreground">{user.displayName}</span>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="ghost" className="hover:bg-white/5" onClick={() => setAuthModal({ isOpen: true, type: 'login' })}>Login</Button>
                <Button className="bg-gradient-purple hover:opacity-90 transition-opacity" onClick={() => setAuthModal({ isOpen: true, type: 'signup' })}>Sign Up</Button>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-white/5 p-4 flex flex-col gap-4"
            >
              <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#machine" onClick={() => setIsMenuOpen(false)}>The Machine</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
              {user ? (
                <Button className="w-full bg-gradient-purple" onClick={logout}>Logout</Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full border-white/10" onClick={() => { setIsMenuOpen(false); setAuthModal({ isOpen: true, type: 'login' }); }}>Login</Button>
                  <Button className="w-full bg-gradient-purple" onClick={() => { setIsMenuOpen(false); setAuthModal({ isOpen: true, type: 'signup' }); }}>Sign Up</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 py-1 px-4 border-purple-500/30 text-purple-400 bg-purple-500/5">
                <Sparkles className="w-3 h-3 mr-2" />
                The #1 AI Tool for MENA COD Sellers
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
                Build Winning COD Products <br />
                <span className="text-gradient">In Minutes, Not Days.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Stop guessing. Let AI validate your products, generate high-converting ad copy, 
                and build your entire sales funnel for Libya, Morocco, and the MENA region.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-purple shadow-xl shadow-purple-500/20 group" onClick={() => document.getElementById('machine')?.scrollIntoView({ behavior: 'smooth' })}>
                  Generate Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 hover:bg-white/5">
                  See Examples
                </Button>
              </div>
            </motion.div>

            {/* Hero Image/Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-20 relative max-w-5xl mx-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20" />
              <div className="relative bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <div className="mx-auto text-xs text-muted-foreground font-mono">cod-ai-machine.app/dashboard</div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-32 w-full bg-white/5 rounded-xl border border-dashed border-white/10" />
                    <div className="h-10 w-full bg-purple-500/20 rounded-lg" />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="h-4 w-1/2 bg-white/10 rounded" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                      <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                    </div>
                    <div className="h-40 bg-white/5 rounded-xl border border-white/5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Machine Section */}
        <section id="machine" className="py-24 bg-zinc-950/50 border-y border-white/5 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The AI Machine</h2>
                <p className="text-muted-foreground">Input your product details and let the magic happen.</p>
              </div>

              <Card className="glass border-white/10 overflow-hidden">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="product-cost">Product Cost (in USD $)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="product-cost"
                            placeholder="e.g. 5.50" 
                            className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50 transition-colors"
                            value={productCost}
                            onChange={(e) => setProductCost(e.target.value)}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Enter the price in Dollars. The AI will convert it to local currency.</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Target Country</Label>
                        <Select value={country} onValueChange={setCountry}>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-white/10">
                            <SelectItem value="Libya">Libya 🇱🇾</SelectItem>
                            <SelectItem value="Morocco">Morocco 🇲🇦</SelectItem>
                            <SelectItem value="Algeria">Algeria 🇩🇿</SelectItem>
                            <SelectItem value="Egypt">Egypt 🇪🇬</SelectItem>
                            <SelectItem value="Saudi Arabia">Saudi Arabia 🇸🇦</SelectItem>
                            <SelectItem value="UAE">UAE 🇦🇪</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {country === "Libya" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-2"
                        >
                          <Label htmlFor="exchange-rate">سعر صرف الدولار (1$ = كم دينار؟)</Label>
                          <div className="relative">
                            <TrendingUp className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input 
                              id="exchange-rate"
                              placeholder="مثلاً: 9.00" 
                              className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50 transition-colors"
                              value={customExchangeRate}
                              onChange={(e) => setCustomExchangeRate(e.target.value)}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">أدخل سعر الصرف الحالي في السوق الموازي لليبيا.</p>
                        </motion.div>
                      )}

                      <Button 
                        onClick={handleGenerate}
                        disabled={isGenerating || images.length === 0}
                        className="w-full h-12 bg-gradient-purple text-lg font-semibold shadow-lg shadow-purple-500/20"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing Images...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-5 w-5 fill-current" />
                            Generate Marketing Kit
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <Label>Product Images (Max 4)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {images.map((img, idx) => (
                          <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10">
                            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                        {images.length < 4 && (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-500/50 hover:bg-white/5 transition-all cursor-pointer group"
                          >
                            <Upload className="text-muted-foreground w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-medium text-muted-foreground">Add Image</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                      />
                      <p className="text-[10px] text-muted-foreground text-center">
                        Upload clear images of your product. The AI will identify it automatically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  id="results"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-20 max-w-6xl mx-auto space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Sparkles className="text-purple-400" />
                      Your AI Marketing Kit
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>Export PDF</Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Analysis & Ad Copy */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Product Analysis */}
                      <Card className="bg-zinc-900/50 border-white/5">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-green-400" />
                              Product Validation
                            </CardTitle>
                            <Badge className={result.productAnalysis.isWinning ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                              {result.productAnalysis.isWinning ? "Winning Potential" : "Testing Required"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Suggested Price</p>
                              <p className="text-2xl font-bold text-gradient">{result.productAnalysis.suggestedPrice}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Target Audience</p>
                              <p className="text-lg font-medium">{result.productAnalysis.targetAudience}</p>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                            <p className="text-xs text-green-400 uppercase tracking-wider mb-3 font-bold">Profit Breakdown (Per Unit)</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Cost</p>
                                <p className="text-sm font-mono">{result.productAnalysis.profitBreakdown.productCost}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Shipping</p>
                                <p className="text-sm font-mono">{result.productAnalysis.profitBreakdown.estShipping}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Ads (CPA)</p>
                                <p className="text-sm font-mono">{result.productAnalysis.profitBreakdown.estAdSpend}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase">RTO Buffer</p>
                                <p className="text-sm font-mono">{result.productAnalysis.profitBreakdown.estRTO}</p>
                              </div>
                              <div className="bg-green-500/10 p-2 rounded-lg">
                                <p className="text-[10px] text-green-400 uppercase font-bold">Net Profit</p>
                                <p className="text-sm font-bold text-green-400">{result.productAnalysis.profitBreakdown.netProfit}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <p className="text-xs text-blue-400 uppercase tracking-wider mb-1 font-bold">Pricing Strategy</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {result.productAnalysis.pricingStrategy}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                            <p className="text-xs text-purple-400 uppercase tracking-wider mb-1 font-bold">Market Analysis</p>
                            <p className="text-sm leading-relaxed italic text-muted-foreground">
                              "{result.productAnalysis.reasoning}"
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tabs for Ad Copy, Landing Page, etc. */}
                      <Tabs defaultValue="adcopy" className="w-full">
                        <TabsList className="w-full bg-zinc-900 border border-white/5 p-1 h-12">
                          <TabsTrigger value="adcopy" className="flex-1 gap-2"><Facebook className="w-4 h-4" /> Ad Copy</TabsTrigger>
                          <TabsTrigger value="landing" className="flex-1 gap-2"><Layout className="w-4 h-4" /> Landing Page</TabsTrigger>
                          <TabsTrigger value="whatsapp" className="flex-1 gap-2"><MessageSquare className="w-4 h-4" /> WhatsApp</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="adcopy" className="mt-6">
                          <Card className="bg-zinc-900/50 border-white/5">
                            <CardContent className="p-6 space-y-6">
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-muted-foreground">Headline</Label>
                                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 mt-1 font-medium">
                                    {result.adCopy.headline}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Primary Text</Label>
                                  <div className="p-4 bg-white/5 rounded-lg border border-white/5 mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                                    {result.adCopy.primaryText}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Description</Label>
                                  <div className="p-3 bg-white/5 rounded-lg border border-white/5 mt-1 text-sm">
                                    {result.adCopy.description}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="landing" className="mt-6">
                          <Card className="bg-zinc-900/50 border-white/5">
                            <CardContent className="p-6 space-y-6">
                              <div className="space-y-4">
                                <h4 className="text-xl font-bold text-gradient">{result.landingPage.headline}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {result.landingPage.benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                      <span>{benefit}</span>
                                    </div>
                                  ))}
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="space-y-4">
                                  {result.landingPage.sections.map((section, i) => (
                                    <div key={i} className="space-y-1">
                                      <p className="font-bold text-purple-400">{section.title}</p>
                                      <p className="text-sm text-muted-foreground">{section.content}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="whatsapp" className="mt-6">
                          <Card className="bg-zinc-900/50 border-white/5">
                            <CardContent className="p-6 space-y-6">
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <Badge variant="outline">First Message</Badge>
                                  <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl rounded-tl-none text-sm">
                                    {result.whatsappFunnel.firstMessage}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Badge variant="outline">Follow-ups</Badge>
                                  {result.whatsappFunnel.followUps.map((msg, i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none text-sm">
                                      {msg}
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-2">
                                  <Badge variant="outline">Closing</Badge>
                                  <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl rounded-tl-none text-sm">
                                    {result.whatsappFunnel.closingMessage}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Right Column: Hooks & Offers */}
                    <div className="space-y-8">
                      {/* Hooks */}
                      <Card className="bg-zinc-900/50 border-white/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            10 Scroll-Stopping Hooks
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-white/5">
                            {result.hooks.map((hook, i) => (
                              <div key={i} className="p-4 flex gap-3 hover:bg-white/5 transition-colors">
                                <span className="text-purple-500 font-mono font-bold">{String(i + 1).padStart(2, '0')}</span>
                                <p className="text-sm">{hook}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Offers */}
                      <Card className="bg-zinc-900/50 border-white/5">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                            Offer Ideas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {result.offerIdeas.map((offer, i) => (
                            <div key={i} className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm font-medium">
                              {offer}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to <span className="text-gradient">Dominate COD</span></h2>
              <p className="text-muted-foreground text-lg">We've automated the boring stuff so you can focus on scaling your business.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Target className="w-6 h-6" />,
                  title: "Product Validation",
                  desc: "Instantly know if a product is worth your time and budget before spending a cent on ads."
                },
                {
                  icon: <Facebook className="w-6 h-6" />,
                  title: "High-Converting Ads",
                  desc: "Generate primary text, headlines, and descriptions tailored for MENA audiences."
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: "Viral Hooks",
                  desc: "Get 10 unique hooks for TikTok and Facebook that stop the scroll and drive clicks."
                },
                {
                  icon: <Layout className="w-6 h-6" />,
                  title: "Landing Page Content",
                  desc: "Ready-to-use headlines and benefits designed to maximize conversion rates."
                },
                {
                  icon: <MessageSquare className="w-6 h-6" />,
                  title: "WhatsApp Funnels",
                  desc: "Professional scripts for order confirmation and follow-ups to reduce RTO."
                },
                {
                  icon: <TrendingUp className="w-6 h-6" />,
                  title: "Market Insights",
                  desc: "Localized pricing and audience targeting for specific MENA countries."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-zinc-950/50 border-y border-white/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Trusted by 2,000+ Sellers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Ahmed L.",
                  role: "Libya Seller",
                  text: "This tool saved me hours of work. The WhatsApp funnel decreased my RTO by 25% in the first week."
                },
                {
                  name: "Yassine M.",
                  role: "Morocco Dropshipper",
                  text: "The hooks are insane. My TikTok CTR went from 0.8% to 2.4% after using the AI generated hooks."
                },
                {
                  name: "Sara K.",
                  role: "E-com Agency Owner",
                  text: "We use this for all our clients. It's the best way to quickly test new products in the MENA market."
                }
              ].map((t, i) => (
                <Card key={i} className="bg-zinc-900/50 border-white/5">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Sparkles key={s} className="w-4 h-4 text-yellow-500 fill-current" />)}
                    </div>
                    <p className="text-muted-foreground italic mb-6">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-purple" />
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">Start for free, upgrade as you scale your COD empire.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <Card className="bg-zinc-900/50 border-white/5 relative overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl">Free Plan</CardTitle>
                  <CardDescription>Perfect for beginners</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "3 Generations per day",
                    "Product Validation",
                    "Basic Ad Copy",
                    "Standard Support"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-6 border-white/10">Get Started</Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="bg-zinc-900/50 border-purple-500/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">Popular</div>
                <CardHeader>
                  <CardTitle className="text-2xl">Pro Plan</CardTitle>
                  <CardDescription>For serious sellers</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Unlimited Generations",
                    "Advanced Image Analysis",
                    "Full Sales Funnel Builder",
                    "WhatsApp Script Generator",
                    "Priority Support",
                    "Early access to new features"
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-purple-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <Button className="w-full mt-6 bg-gradient-purple shadow-lg shadow-purple-500/20">Go Pro Now</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-zinc-950/50 border-t border-white/5">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  q: "Does it support Arabic language?",
                  a: "Yes! The AI generates content in a mix of Modern Standard Arabic and local dialects (Libyan, Moroccan, etc.) to ensure it resonates with your target audience."
                },
                {
                  q: "How accurate is the product validation?",
                  a: "Our AI is trained on thousands of successful COD products in the MENA region. While it's not 100% guaranteed, it provides a very high-confidence score based on current market trends."
                },
                {
                  q: "Can I use it for TikTok ads?",
                  a: "Absolutely. The hook generator is specifically designed for short-form video platforms like TikTok and Instagram Reels."
                },
                {
                  q: "What countries are supported?",
                  a: "Currently we specialize in Libya, Morocco, Algeria, Egypt, Saudi Arabia, and the UAE. We are constantly adding more MENA markets."
                }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                  <AccordionTrigger className="hover:text-purple-400 transition-colors">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-purple opacity-10 blur-[100px]" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to Scale Your <br /> COD Business?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of successful sellers using COD AI Machine to find winners and scale faster.
            </p>
            {!user ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-16 px-12 text-xl bg-white text-black hover:bg-white/90" onClick={() => setAuthModal({ isOpen: true, type: 'login' })}>
                  Login
                </Button>
                <Button size="lg" className="h-16 px-12 text-xl bg-gradient-purple shadow-2xl shadow-purple-500/40" onClick={() => setAuthModal({ isOpen: true, type: 'signup' })}>
                  Sign Up Now
                </Button>
              </div>
            ) : (
              <Button size="lg" className="h-16 px-12 text-xl bg-gradient-purple shadow-2xl shadow-purple-500/40" onClick={() => document.getElementById('machine')?.scrollIntoView({ behavior: 'smooth' })}>
                Go to The Machine
              </Button>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={resetApp}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Rocket className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold">COD AI Machine</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The ultimate AI toolkit for MENA e-commerce sellers.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#machine" className="hover:text-white transition-colors">The Machine</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5">
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/5">
                  <Globe className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <Separator className="bg-white/5 mb-8" />
          <div className="flex flex-col md:row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 COD AI Machine. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        type={authModal.type} 
      />
    </div>
  );
}
