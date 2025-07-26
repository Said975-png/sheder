import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Brain,
  Home,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import JarvisInterface from "@/components/JarvisInterface";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ModernNavbarProps {
  onAddBasicPlan: () => void;
  onAddProPlan: () => void;
  onAddMaxPlan: () => void;
  onListeningChange: (isListening: boolean, transcript?: string) => void;
  forceStopVoice: boolean;
  onModelRotateStart: () => void;
  onModelRotateStop: () => void;
}

export default function ModernNavbar({
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  onListeningChange,
  forceStopVoice,
  onModelRotateStart,
  onModelRotateStop,
}: ModernNavbarProps) {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { getTotalItems, items, removeItem, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.reload();
  }, [logout]);

  const handleProceedToOrder = useCallback(() => {
    navigate("/order");
    setIsMobileMenuOpen(false);
  }, [navigate]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Main Navigation */}
      <nav
        className={cn(
          "fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out",
          "top-4 rounded-full px-6 py-3 w-auto max-w-4xl h-14",
          // Simple transparent background
          isScrolled
            ? "bg-white/10 backdrop-blur-md border border-white/20"
            : "bg-transparent border border-white/10",
          "shadow-lg"
        )}
      >
        <div className="flex items-center justify-center w-full h-full">
          {/* Even spacing for all buttons */}
          <div className="flex items-center space-x-4">
            {/* Home Button */}
            <Button
              variant="ghost"
              onClick={scrollToTop}
              className={cn(
                "rounded-full px-4 py-2 h-10",
                "bg-white/10 hover:bg-white/20",
                "border border-white/20 hover:border-white/30",
                "transition-all duration-200",
                "text-white hover:text-white"
              )}
            >
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span className="font-medium text-sm">Home</span>
              </div>
            </Button>

            {/* JARVIS Interface */}
            <div className="bg-white/10 border border-white/20 rounded-full px-3 py-2 h-10">
              <JarvisInterface
                onAddBasicPlan={onAddBasicPlan}
                onAddProPlan={onAddProPlan}
                onAddMaxPlan={onAddMaxPlan}
                inNavbar={true}
                onListeningChange={onListeningChange}
                forceStop={forceStopVoice}
                onModelRotateStart={onModelRotateStart}
                onModelRotateStop={onModelRotateStop}
              />
            </div>
            {/* Cart */}
            <CartDropdown
              items={items}
              getTotalItems={getTotalItems}
              getTotalPrice={getTotalPrice}
              removeItem={removeItem}
              clearCart={clearCart}
              handleProceedToOrder={handleProceedToOrder}
            />

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User Menu or Auth Buttons */}
            {isAuthenticated && currentUser ? (
              <UserMenu user={currentUser} onLogout={handleLogout} />
            ) : (
              <AuthButtons />
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "lg:hidden p-1.5 rounded-full h-8 w-8",
                "border border-cyan-400/40 bg-black/70",
                "hover:bg-cyan-400/25 hover:border-cyan-300/60",
                "transition-all duration-300 hover:scale-110"
              )}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-cyan-300" />
              ) : (
                <Menu className="w-4 h-4 text-cyan-300" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAddBasicPlan={onAddBasicPlan}
        onAddProPlan={onAddProPlan}
        onAddMaxPlan={onAddMaxPlan}
        onListeningChange={onListeningChange}
        forceStopVoice={forceStopVoice}
        onModelRotateStart={onModelRotateStart}
        onModelRotateStop={onModelRotateStop}
      />
    </>
  );
}

// Cart Dropdown Component
function CartDropdown({
  items,
  getTotalItems,
  getTotalPrice,
  removeItem,
  clearCart,
  handleProceedToOrder,
}: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative rounded-full px-4 py-2 h-10",
            "bg-white/10 hover:bg-white/20",
            "border border-white/20 hover:border-white/30",
            "transition-all duration-200",
            "text-white hover:text-white"
          )}
        >
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="font-medium text-sm">Cart</span>
            {getTotalItems() > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "w-80 mt-2 p-0 border-0 overflow-hidden",
          "bg-black/95 backdrop-blur-xl",
          "rounded-xl shadow-2xl shadow-cyan-400/20"
        )}
      >
        <div className="p-4 border-b border-cyan-400/20">
          <h3 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            CART MATRIX
          </h3>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCart className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
              <p className="text-white/60">Your cart is empty</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-black/60 border border-cyan-400/20 rounded-lg hover:border-cyan-400/40 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <p className="text-sm text-white/60 mt-1">
                      {item.description.substring(0, 60)}...
                    </p>
                    <p className="text-lg font-bold text-cyan-400 mt-2">
                      {item.price.toLocaleString()} сум
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="ml-3 w-8 h-8 p-0 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-cyan-400/20 bg-black/80">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-white">TOTAL:</span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {getTotalPrice().toLocaleString()} сум
              </span>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={clearCart}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
              >
                Clear All
              </Button>
              <Button
                onClick={handleProceedToOrder}
                className={cn(
                  "flex-1 font-semibold",
                  "bg-gradient-to-r from-cyan-500 to-blue-600",
                  "hover:from-cyan-400 hover:to-blue-500",
                  "shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50",
                  "transition-all duration-300"
                )}
              >
                Checkout
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// User Menu Component
function UserMenu({ user, onLogout }: any) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center space-x-1.5 px-2 py-1 rounded-full h-8",
            "bg-gradient-to-r from-purple-500/25 to-blue-500/25",
            "border border-purple-400/50 hover:border-purple-300/70",
            "hover:bg-gradient-to-r hover:from-purple-400/35 hover:to-blue-400/35",
            "transition-all duration-300 hover:scale-110"
          )}
        >
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="hidden sm:block text-xs font-medium text-white max-w-20 truncate">
            {user.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-black/95 backdrop-blur-xl border border-cyan-400/30 rounded-xl mt-2"
      >
        <div className="px-4 py-3 border-b border-cyan-400/20">
          <div className="font-semibold text-white">{user.name}</div>
          <div className="text-sm text-white/60">{user.email}</div>
        </div>
        
        <div className="p-2">
          <DropdownMenuItem
            onClick={() => (window.location.href = "/profile")}
            className="text-white hover:bg-cyan-400/10 cursor-pointer rounded-lg"
          >
            <User className="mr-3 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => (window.location.href = "/profile")}
            className="text-white hover:bg-cyan-400/10 cursor-pointer rounded-lg"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => (window.location.href = "/chat")}
            className="text-white hover:bg-cyan-400/10 cursor-pointer rounded-lg"
          >
            <Brain className="mr-3 h-4 w-4" />
            Чат с Пятницей
          </DropdownMenuItem>
        </div>
        
        <div className="p-2 border-t border-cyan-400/20">
          <DropdownMenuItem
            onClick={onLogout}
            className="text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Auth Buttons Component
function AuthButtons() {
  return (
    <div className="hidden sm:flex items-center space-x-1.5">
      <Button
        variant="ghost"
        className={cn(
          "px-3 py-1 rounded-full font-medium text-xs h-8",
          "border border-cyan-400/40 bg-black/70",
          "hover:bg-cyan-400/25 hover:border-cyan-300/60",
          "text-cyan-300 hover:text-white",
          "transition-all duration-300 hover:scale-110"
        )}
        asChild
      >
        <Link to="/login">Login</Link>
      </Button>
      <Button
        className={cn(
          "px-3 py-1 rounded-full font-medium text-xs h-8",
          "bg-gradient-to-r from-cyan-500 to-blue-600",
          "hover:from-cyan-400 hover:to-blue-500",
          "shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50",
          "transition-all duration-300 hover:scale-110"
        )}
        asChild
      >
        <Link to="/signup">Sign Up</Link>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "px-3 py-1 rounded-full font-medium text-xs h-8",
          "border border-purple-400/40 bg-black/70",
          "hover:bg-purple-400/25 hover:border-purple-300/60",
          "text-purple-300 hover:text-white",
          "transition-all duration-300 hover:scale-110"
        )}
        asChild
      >
        <Link to="/chat">Пятница</Link>
      </Button>
    </div>
  );
}

// Mobile Menu Component
function MobileMenu({
  isOpen,
  onClose,
  isAuthenticated,
  currentUser,
  onLogout,
  onAddBasicPlan,
  onAddProPlan,
  onAddMaxPlan,
  onListeningChange,
  forceStopVoice,
  onModelRotateStart,
  onModelRotateStop,
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute top-20 left-4 right-4 bg-black/95 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 shadow-2xl shadow-cyan-400/20">
        {/* JARVIS Interface */}
        <div className="mb-6 p-4 bg-black/60 border border-cyan-400/20 rounded-xl">
          <JarvisInterface
            onAddBasicPlan={onAddBasicPlan}
            onAddProPlan={onAddProPlan}
            onAddMaxPlan={onAddMaxPlan}
            inNavbar={true}
            onListeningChange={onListeningChange}
            forceStop={forceStopVoice}
            onModelRotateStart={onModelRotateStart}
            onModelRotateStop={onModelRotateStop}
          />
        </div>

        {/* Navigation Links */}
        <div className="space-y-3">
          {isAuthenticated && currentUser ? (
            <>
              <div className="p-3 bg-purple-500/10 border border-purple-400/20 rounded-xl">
                <div className="font-semibold text-white">{currentUser.name}</div>
                <div className="text-sm text-white/60">{currentUser.email}</div>
              </div>
              
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-cyan-400/10 transition-colors"
              >
                <User className="w-5 h-5 text-cyan-400" />
                <span className="text-white">Profile</span>
              </Link>
              
              <Link
                to="/chat"
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-400/10 transition-colors"
              >
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-white">Чат с Пятницей</span>
              </Link>
              
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="block p-3 text-center rounded-xl border border-cyan-400/30 hover:bg-cyan-400/10 text-cyan-300 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="block p-3 text-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium transition-transform hover:scale-105"
              >
                Sign Up
              </Link>
              <Link
                to="/chat"
                onClick={onClose}
                className="block p-3 text-center rounded-xl border border-purple-400/30 hover:bg-purple-400/10 text-purple-300 transition-colors"
              >
                Пятница
              </Link>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <div className="mt-6 pt-6 border-t border-cyan-400/20">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
