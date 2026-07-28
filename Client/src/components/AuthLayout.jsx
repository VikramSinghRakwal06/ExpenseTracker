import { Wallet } from 'lucide-react';

/** Shared shell for the Login and Register screens. */
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
    <div className="bg-gray-900 border border-gray-700 shadow-xl rounded-2xl p-8 w-full max-w-md">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-xl mb-3">
          <Wallet size={26} className="text-white" />
        </div>
        <h2 className="text-white text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>

      {children}

      {footer && <div className="mt-5 text-center text-gray-300 text-sm">{footer}</div>}
    </div>
  </div>
);

export const AuthField = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm mb-2" htmlFor={props.id}>
      {label}
    </label>
    <input
      {...props}
      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export const AuthSubmitButton = ({ loading, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-60"
  >
    {loading ? 'Please wait...' : children}
  </button>
);

export default AuthLayout;
