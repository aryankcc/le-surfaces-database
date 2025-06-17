
import { Layers, AlertCircle } from "lucide-react";

const AuthHeader = () => {
  return (
    <>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Layers className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">LE Surfaces</h1>
        </div>
        <p className="text-slate-600">Quartz Slab Management System</p>
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center space-x-1">
          <AlertCircle className="h-4 w-4" />
          <span>Complete the captcha verification to proceed</span>
        </div>
      </div>
    </>
  );
};

export default AuthHeader;
