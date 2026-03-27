import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">Sign In</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <LoginForm />
      </div>
    </div>
  );
}
