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
      description: "Access to basic blockchain guides and fundamental knowledge",
      category: "blockchain-basic",
    });
  };

  const handleAddIntermediatePlan = () => {
    addItem({
      id: "intermediate-plan", 
      name: "Intermediate Plan",
      price: 349,
      description: "Everything in Beginner + Advanced blockchain insights and tools",
      category: "blockchain-intermediate",
    });
  };

  const handleAddAdvancedPlan = () => {
    addItem({
      id: "advanced-plan",
      name: "Advanced Plan", 
      price: 495,
      description: "Everything in Intermediate + Professional tools and priority support",
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">JumpBot</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">Home</a>
              <a href="#why-blockchain" className="text-white/70 hover:text-white transition-colors">Why Blockchain</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors">Pricing</a>
              <a href="#how-it-works" className="text-white/70 hover:text-white transition-colors">How it Works</a>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Cart Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-2 rounded-full hover:bg-white/10">
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-black border-gray-700 mt-2">
                  <div className="px-3 py-2">
                    <h3 className="font-semibold text-white mb-2">Cart</h3>
                    {items.length === 0 ? (
                      <p className="text-sm text-white/60 text-center py-4">Cart is empty</p>
                    ) : (
                      <>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between p-2 bg-gray-800 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-white">{item.name}</h4>
                                <p className="text-xs text-white/60 mt-1">{item.description.substring(0, 60)}...</p>
                                <p className="text-sm font-semibold text-white mt-1">${item.price}</p>
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
                          <span className="font-bold text-white">${getTotalPrice()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={clearCart} variant="outline" size="sm" className="flex-1">
                            Clear
                          </Button>
                          <Button onClick={handleProceedToOrder} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
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
                    <Button variant="ghost" className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/10">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="hidden sm:block text-sm">{currentUser.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black border-gray-700 mt-2">
                    <div className="px-2 py-1.5 text-sm text-white/60">
                      <div className="font-medium text-white">{currentUser.name}</div>
                      <div className="text-xs">{currentUser.email}</div>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={() => (window.location.href = "/profile")} className="text-white hover:bg-gray-800 cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => (window.location.href = "/profile")} className="text-white hover:bg-gray-800 cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-gray-800 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" className="text-sm px-4 py-2 rounded-full hover:bg-white/10" asChild>
                    <Link to="/signup">Sign up</Link>
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-full">
                    Contact US
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.2)_0%,transparent_50%)]"></div>
        
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
                  Transforming industries with secure, decentralized and transparent technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg">
                  Get Started with Blockchain
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-lg text-lg">
                  Discover How it Works
                </Button>
              </div>
            </div>

            {/* Right Side - 3D Model */}
            <div className="flex items-center justify-center">
              <div className="w-full h-96 rounded-2xl overflow-hidden">
                <GLBModel
                  url="https://cdn.builder.io/o/assets%2Fe7ee46b6f06b4b02a9803aeda10a012b%2Fc0894c02d77649a3aecc80105a96cd68?alt=media&token=0fe7336c-92c5-4c4c-928f-d3a77338f0e9&apiKey=e7ee46b6f06b4b02a9803aeda10a012b"
                  scale={2}
                  autoRotate={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Blockchain Section */}
      <section id="why-blockchain" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Why <span className="text-blue-400">Blockchain?</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Blockchain is redefining trust in the digital world. Here's why it matters:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Decentralization */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                <Layers className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Decentralization</h3>
              <p className="text-white/70">No single entity controls the system</p>
            </div>

            {/* Security */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-green-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600/30 transition-colors">
                <Lock className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Security</h3>
              <p className="text-white/70">Encrypted and tamper-proof technology</p>
            </div>

            {/* Transparency */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-600/30 transition-colors">
                <Search className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Transparency</h3>
              <p className="text-white/70">Public, accessible transactions</p>
            </div>

            {/* Efficiency */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600/30 transition-colors">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Efficiency</h3>
              <p className="text-white/70">Faster, cost-effective processes</p>
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
                Blockchain is revolutionizing how we handle data, transactions, and trust. By eliminating intermediaries and creating secure, transparent systems, blockchain is laying the foundation for a more efficient and fair digital future.
              </p>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg">
                Read More
              </Button>
            </div>

            {/* Right Side - 3D Model */}
            <div className="flex items-center justify-center">
              <div className="w-full h-96 rounded-2xl overflow-hidden">
                <GLBModel
                  url="https://cdn.builder.io/o/assets%2Fe7ee46b6f06b4b02a9803aeda10a012b%2Fc0894c02d77649a3aecc80105a96cd68?alt=media&token=0fe7336c-92c5-4c4c-928f-d3a77338f0e9&apiKey=e7ee46b6f06b4b02a9803aeda10a012b"
                  scale={1.5}
                  autoRotate={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Pricing <span className="text-blue-400">Plans</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Choose the plan that fits your needs and start exploring the power of blockchain today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Beginner Plan */}
            <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">Beginner Plan</h3>
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
                <h3 className="text-xl font-semibold mb-4 text-white">Intermediate Plan</h3>
                <div className="text-4xl font-bold mb-2">
                  $349<span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60">Users with some blockchain knowledge</p>
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
                <h3 className="text-xl font-semibold mb-4 text-white">Advanced Plan</h3>
                <div className="text-4xl font-bold mb-2">
                  $495<span className="text-lg text-white/60">/month</span>
                </div>
                <p className="text-white/60">Professionals looking for advanced tools and insights</p>
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

      {/* Voice Control Component */}
      <VoiceControl
        onAddBasicPlan={handleAddBeginnerPlan}
        onAddProPlan={handleAddIntermediatePlan}
        onAddMaxPlan={handleAddAdvancedPlan}
      />
    </div>
  );
}
