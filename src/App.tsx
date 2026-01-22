import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { RoleSetup } from "./components/RoleSetup";
import { PatientDashboard } from "./components/PatientDashboard";
import { NurseDashboard } from "./components/NurseDashboard";
import { PorterDashboard } from "./components/PorterDashboard";
import { SupervisorDashboard } from "./components/SupervisorDashboard";
import { LogoUpload } from "./components/LogoUpload";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";

export default function App() {
  const currentLogo = useQuery(api.logos.getCurrentLogo);
  const [showLogoUpload, setShowLogoUpload] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-3">
          {currentLogo?.url ? (
            <img 
              src={currentLogo.url} 
              alt="CareRelay Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-800">CareRelay</h2>
          <Authenticated>
            <SupervisorLogoButton onUpload={() => setShowLogoUpload(true)} />
          </Authenticated>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      {showLogoUpload && (
        <LogoUpload onClose={() => setShowLogoUpload(false)} />
      )}
      <Toaster />
    </div>
  );
}

function SupervisorLogoButton({ onUpload }: { onUpload: () => void }) {
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  
  if (userProfile?.role !== "supervisor") {
    return null;
  }

  return (
    <button
      onClick={onUpload}
      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
      title="Upload Logo"
    >
      📷 Logo
    </button>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userProfile = useQuery(api.users.getCurrentUserProfile);
  const updateLastActive = useMutation(api.users.updateLastActive);

  // Update last active timestamp every 30 seconds
  useEffect(() => {
    if (userProfile) {
      const interval = setInterval(() => {
        updateLastActive();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [userProfile, updateLastActive]);

  if (loggedInUser === undefined || userProfile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to CareRelay</h1>
            <p className="text-lg text-gray-600">Hospital Task Management System</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {!userProfile ? (
          <div className="max-w-md mx-auto mt-10">
            <RoleSetup />
          </div>
        ) : (
          <div>
            {userProfile.role === "patient" && <PatientDashboard />}
            {userProfile.role === "nurse" && <NurseDashboard />}
            {userProfile.role === "porter" && <PorterDashboard />}
            {userProfile.role === "supervisor" && <SupervisorDashboard />}
          </div>
        )}
      </Authenticated>
    </div>
  );
}
