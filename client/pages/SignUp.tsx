import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { AuthResponse } from '@shared/api';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

    // Prevent multiple submissions
    if (loading) return;

    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

                              const result: AuthResponse = await response.json();

      if (!result.success) {
        setError(result.message || 'Произошла ошибка при регистрации');
        return;
      }

      if (result.success && result.token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Redirect to homepage
        navigate('/');
        window.location.reload(); // Refresh to update auth state
      } else {
                setError(result.message || 'Произошла ошибка при регистрации');
      }
    } catch (error) {
      console.error('Registration error:', error);
            if (error instanceof TypeError && error.message.includes('stream')) {
        setError('Ошибка соединения. Попробуйте еще раз.');
      } else {
        setError('Произошла ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Назад на главную</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">AI Detect</h1>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Создать аккаунт</h2>
          <p className="text-white/70">Присоед��няйтесь к будущему защиты от ботов</p>
        </div>

        {/* SignUp Form */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Регистрация</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80">Полное имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Введите ваше имя"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Создайте пароль"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/80">Подтвердите пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Повторите пароль"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Создаем аккаунт...' : 'Создать аккаунт'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                  Войти
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
