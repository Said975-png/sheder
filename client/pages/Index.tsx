import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import VoiceControl from "@/components/VoiceControl";
import GLBModel from "@/components/GLBModel";
import {
  Shield,
  User,
  LogOut,
  Settings,
  Code,
  Cpu,
  Brain,
  Zap,
  CheckCircle,
  ShoppingCart,
  Lock,
  Eye,
  Layers,
  TrendingUp,
  Search,
  Cog,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Index() {
  const { currentUser, logout, isAuthenticated, loading } = useAuth();
  const {
    getTotalItems,
    addItem,
    items,
    removeItem,
    getTotalPrice,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const [navbarAnimated, setNavbarAnimated] = useState(false);

  // Запуск анимации при загрузке компонента
  useEffect(() => {
    const timer = setTimeout(() => {
      setNavbarAnimated(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleAddBeginnerPlan = () => {
    addItem({
      id: "beginner-plan",
      name: "Beginner Plan",
      price: 199,
      description:
        "Access to basic blockchain guides and fundamental knowledge",
      category: "blockchain-basic",
    });
  };

  const handleAddIntermediatePlan = () => {
    addItem({
      id: "intermediate-plan",
      name: "Intermediate Plan",
      price: 349,
      description:
        "Everything in Beginner + Advanced blockchain insights and tools",
      category: "blockchain-intermediate",
    });
  };

  const handleAddAdvancedPlan = () => {
    addItem({
      id: "advanced-plan",
      name: "Advanced Plan",
      price: 495,
      description:
        "Everything in Intermediate + Professional tools and priority support",
      category: "blockchain-advanced",
    });
  };

  const handleProceedToOrder = () => {
    navigate("/order");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-transparent backdrop-blur-md border border-white/20 rounded-full px-8 py-3">
        <div className="flex items-center space-x-6">
          {/* Home Button */}
          <Button
            variant="ghost"
            className="text-sm px-4 py-2 rounded-full hover:bg-white/10"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Home
          </Button>

          {/* Voice Control */}
          <VoiceControl
            onAddBasicPlan={handleAddBeginnerPlan}
            onAddProPlan={handleAddIntermediatePlan}
            onAddMaxPlan={handleAddAdvancedPlan}
            inNavbar={true}
          />

          {/* Cart Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative p-2 rounded-full hover:bg-white/10"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-black border-gray-700 mt-2"
            >
              <div className="px-3 py-2">
                <h3 className="font-semibold text-white mb-2">Cart</h3>
                {items.length === 0 ? (
                  <p className="text-sm text-white/60 text-center py-4">
                    Cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-2 bg-gray-800 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-white">
                              {item.name}
                            </h4>
                            <p className="text-xs text-white/60 mt-1">
                              {item.description.substring(0, 60)}...
                            </p>
                            <p className="text-sm font-semibold text-white mt-1">
                              ${item.price}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="ml-2 h-6 w-6 p-0 hover:bg-red-500/20"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700 my-3" />
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="font-bold text-white">
                        ${getTotalPrice()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={clearCart}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleProceedToOrder}
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Checkout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />

          {isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden sm:block text-sm">
                    {currentUser.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-black border-gray-700 mt-2"
              >
                <div className="px-2 py-1.5 text-sm text-white/60">
                  <div className="font-medium text-white">
                    {currentUser.name}
                  </div>
                  <div className="text-xs">{currentUser.email}</div>
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/profile")}
                  className="text-white hover:bg-gray-800 cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.href = "/profile")}
                  className="text-white hover:bg-gray-800 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-gray-800 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-sm px-4 py-2 rounded-full hover:bg-white/10"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                variant="ghost"
                className="text-sm px-4 py-2 rounded-full hover:bg-white/10"
                asChild
              >
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-black relative overflow-hidden">
        {/* JARVIS-style Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Neural Network Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 border border-cyan-400/30 rounded-lg animate-pulse"></div>
            <div className="absolute top-20 right-20 w-24 h-24 border border-blue-400/30 rounded-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-20 w-28 h-28 border border-cyan-400/30 rounded-lg animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 border border-blue-400/30 rounded-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            <line x1="10%" y1="20%" x2="90%" y2="30%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse"/>
            <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '1s' }}/>
            <line x1="80%" y1="70%" x2="20%" y2="90%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse" style={{ animationDelay: '2s' }}/>
          </svg>

          {/* Floating Particles */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.8s' }}></div>
          </div>

          {/* HUD Corner Elements */}
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-400/60 animate-pulse"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-cyan-400/60 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-cyan-400/60 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-cyan-400/60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Unleashing the Power of{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Blockchain
                  </span>
                </h1>

                <p className="text-xl text-white/70 leading-relaxed max-w-lg">
                  Transforming industries with secure, decentralized and
                  transparent technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg text-lg shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40">
                  <Zap className="w-5 h-5 mr-2" />
                  Initialize Protocol
                </Button>
                <Button
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 px-8 py-3 rounded-lg text-lg transition-all duration-300"
                >
                  <Code className="w-5 h-5 mr-2" />
                  Analyze Systems
                </Button>
              </div>

              {/* JARVIS-style Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 text-center hover:border-cyan-400/60 transition-all duration-300">
                  <div className="text-2xl font-bold text-cyan-400 animate-pulse">99.9%</div>
                  <div className="text-xs text-white/60 uppercase tracking-wider">Security Level</div>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4 text-center hover:border-blue-400/60 transition-all duration-300">
                  <div className="text-2xl font-bold text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }}>24/7</div>
                  <div className="text-xs text-white/60 uppercase tracking-wider">System Status</div>
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 text-center hover:border-cyan-400/60 transition-all duration-300">
                  <div className="text-2xl font-bold text-cyan-400 animate-pulse" style={{ animationDelay: '1s' }}>∞</div>
                  <div className="text-xs text-white/60 uppercase tracking-wider">Scalability</div>
                </div>
              </div>
            </div>

            {/* Right Side - 3D Model */}
            <div className="flex items-center justify-center">
              <div className="w-full h-96 rounded-2xl overflow-hidden">
                <GLBModel
                  url="https://cdn.builder.io/o/assets%2Fd1c3ee1ec7be40678f2e6792ec37e2b0%2Fa3ddf442a35840a8ae7950219d9bdb2f?alt=media&token=138b2881-8b51-43df-b3e5-81d9e6d6983f&apiKey=d1c3ee1ec7be40678f2e6792ec37e2b0"
                  scale={3}
                  autoRotate={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Blockchain Section */}
      <section id="why-blockchain" className="py-20 bg-black relative overflow-hidden">
        {/* JARVIS Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            {/* JARVIS-style Header */}
            <div className="inline-block relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg blur opacity-30"></div>
              <div className="relative bg-black px-6 py-2 rounded-lg border border-cyan-400/50">
                <span className="text-sm text-cyan-400 uppercase tracking-widest">[ SYSTEM ANALYSIS ]</span>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Blockchain?</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Advanced distributed ledger technology protocols analyzing security matrices:
            </p>

            {/* Scanning Line Animation */}
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Decentralization */}
            <div className="bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-6 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-pulse"></div>
              <div className="w-16 h-16 bg-cyan-400/10 border border-cyan-400/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300 relative">
                <Layers className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400/5 rounded-lg animate-pulse"></div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400 uppercase tracking-wider">
                [ DECENTRALIZATION ]
              </h3>
              <p className="text-white/70 text-sm">
                Distributed network architecture • No single point of failure
              </p>
              <div className="mt-4 text-xs text-cyan-400/60 uppercase tracking-widest">STATUS: ACTIVE</div>
            </div>

            {/* Security */}
            <div className="bg-black/60 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-400/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-16 h-16 bg-blue-400/10 border border-blue-400/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-400/20 group-hover:border-blue-400/50 transition-all duration-300 relative">
                <Lock className="w-8 h-8 text-blue-400" />
                <div className="absolute inset-0 bg-blue-400/5 rounded-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-400 uppercase tracking-wider">
                [ SECURITY ]
              </h3>
              <p className="text-white/70 text-sm">
                Cryptographic protocols • Immutable data structures
              </p>
              <div className="mt-4 text-xs text-blue-400/60 uppercase tracking-widest">THREAT LEVEL: MINIMAL</div>
            </div>

            {/* Transparency */}
            <div className="bg-black/60 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-6 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="w-16 h-16 bg-cyan-400/10 border border-cyan-400/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-400/20 group-hover:border-cyan-400/50 transition-all duration-300 relative">
                <Eye className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 bg-cyan-400/5 rounded-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-cyan-400 uppercase tracking-wider">
                [ TRANSPARENCY ]
              </h3>
              <p className="text-white/70 text-sm">
                Public ledger • Verifiable transactions
              </p>
              <div className="mt-4 text-xs text-cyan-400/60 uppercase tracking-widest">VISIBILITY: MAXIMUM</div>
            </div>

            {/* Efficiency */}
            <div className="bg-black/60 backdrop-blur-sm border border-blue-400/30 rounded-xl p-6 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-400/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              <div className="w-16 h-16 bg-blue-400/10 border border-blue-400/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-400/20 group-hover:border-blue-400/50 transition-all duration-300 relative">
                <Cpu className="w-8 h-8 text-blue-400" />
                <div className="absolute inset-0 bg-blue-400/5 rounded-lg animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-blue-400 uppercase tracking-wider">
                [ EFFICIENCY ]
              </h3>
              <p className="text-white/70 text-sm">
                Optimized algorithms • Reduced overhead
              </p>
              <div className="mt-4 text-xs text-blue-400/60 uppercase tracking-widest">PERFORMANCE: OPTIMAL</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Blockchain Matters Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold">
                Why Blockchain <span className="text-blue-400">Matters</span>
              </h2>

              <p className="text-lg text-white/70 leading-relaxed">
                Blockchain is revolutionizing how we handle data, transactions,
                and trust. By eliminating intermediaries and creating secure,
                transparent systems, blockchain is laying the foundation for a
                more efficient and fair digital future.
              </p>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg">
                Read More
              </Button>
            </div>

            {/* Right Side - 3D Model */}
            <div className="flex items-center justify-center">
              <div className="w-full h-96 rounded-2xl overflow-hidden">
                <GLBModel
                  url="https://cdn.builder.io/o/assets%2Fd1c3ee1ec7be40678f2e6792ec37e2b0%2Fa3ddf442a35840a8ae7950219d9bdb2f?alt=media&token=138b2881-8b51-43df-b3e5-81d9e6d6983f&apiKey=d1c3ee1ec7be40678f2e6792ec37e2b0"
                  scale={2.5}
                  autoRotate={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black relative overflow-hidden">
        {/* JARVIS Tech Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-10 w-40 h-40 border border-cyan-400 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-1/4 right-10 w-32 h-32 border border-blue-400 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            {/* JARVIS-style Header */}
            <div className="inline-block relative mb-4">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg blur opacity-30"></div>
              <div className="relative bg-black px-6 py-2 rounded-lg border border-cyan-400/50">
                <span className="text-sm text-cyan-400 uppercase tracking-widest">[ SUBSCRIPTION MATRIX ]</span>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Access <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Protocols</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Select your clearance level and initialize blockchain protocol access
            </p>

            {/* Scanning Line */}
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Beginner Plan */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Beginner Plan
                </h3>
                <div className="text-4xl font-bold mb-2">
                  $199<span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60">Individuals new to blockchain</p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold">Features:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Access to basic blockchain guides
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Fundamental blockchain knowledge
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Community support
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleAddBeginnerPlan}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl"
              >
                Choose Plan
              </Button>
            </div>

            {/* Intermediate Plan */}
            <div className="bg-gray-900/80 backdrop-blur-sm border-2 border-blue-500 rounded-2xl p-8 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Intermediate Plan
                </h3>
                <div className="text-4xl font-bold mb-2">
                  $349<span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60">
                  Users with some blockchain knowledge
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold">Features:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Everything in Beginner
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Access to advanced blockchain
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Priority email support
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleAddIntermediatePlan}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl"
              >
                Choose Plan
              </Button>
            </div>

            {/* Advanced Plan */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">
                  Advanced Plan
                </h3>
                <div className="text-4xl font-bold mb-2">
                  $495<span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60">
                  Professionals looking for advanced tools and insights
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-semibold">Features:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Everything in Intermediate
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    Everything in Intermediate
                  </li>
                  <li className="flex items-center text-white/70">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    1-on-1 consultations
                  </li>
                </ul>
              </div>

              <Button
                onClick={handleAddAdvancedPlan}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl"
              >
                Choose Plan
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
