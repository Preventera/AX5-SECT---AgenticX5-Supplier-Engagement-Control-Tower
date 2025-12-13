import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="text-center">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">X5</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AX5-SECT</h1>
              <p className="text-sm text-gray-500">Control Tower</p>
            </div>
          </div>
          <p className="text-gray-600">Créez votre compte pour commencer</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
              formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-700',
              footerActionLink: 'text-emerald-600 hover:text-emerald-700',
            }
          }}
        />
      </div>
    </div>
  );
}
