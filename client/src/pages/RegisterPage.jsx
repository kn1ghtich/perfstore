import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div style={{ background: 'var(--dark)', minHeight: '100vh' }}
      className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-sm"
            style={{ background: 'var(--gold)' }}>
            <span className="font-serif font-bold text-black text-xl">P</span>
          </div>
          <h1 className="font-serif text-3xl font-semibold text-white mb-1">Создать аккаунт</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Присоединяйтесь к миру ароматов</p>
        </div>

        {/* Card */}
        <div className="p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
