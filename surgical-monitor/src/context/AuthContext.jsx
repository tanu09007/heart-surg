import { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'cardiotrack_auth_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lastOtp, setLastOtp] = useState(null);
  const [otpGeneratedAt, setOtpGeneratedAt] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // Generate a random 6-digit OTP
  const requestOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setLastOtp(code);
    setOtpGeneratedAt(Date.now());
    return code;
  };

  // Verify OTP and log in — dynamically finds or creates doctor/patient
  const verifyOtpAndLogin = ({ name, phone, role, enteredOtp }) => {
    if (!enteredOtp || enteredOtp.length !== 6) {
      throw new Error('Please enter a valid 6-digit OTP');
    }

    // Accept the generated OTP or the dev override '123456'
    if (lastOtp && enteredOtp !== lastOtp && enteredOtp !== '123456') {
      throw new Error(`Invalid OTP. Expected: ${lastOtp}`);
    }

    let authenticatedUser;

    if (role === 'doctor') {
      // Find or create doctor profile by phone + name
      const doctor = dataService.findOrCreateDoctor(name, phone);
      authenticatedUser = {
        role: 'doctor',
        doctorId: doctor.id,
        id: doctor.id,
        name: doctor.name,
        phone: doctor.phone,
        title: doctor.title,
        hospital: doctor.hospital,
        specialty: doctor.specialty
      };
    } else {
      // Find or create patient profile by phone + name
      const patient = dataService.findOrCreatePatient(name, phone);
      authenticatedUser = {
        role: 'patient',
        patientId: patient.id,
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        doctorId: patient.doctorId || null
      };
    }

    setUser(authenticatedUser);
    setLastOtp(null);

    // Record session in dataService
    dataService.recordSessionLogin({
      userId: authenticatedUser.id,
      name: authenticatedUser.name,
      role: authenticatedUser.role,
      phone: authenticatedUser.phone,
      title: authenticatedUser.title || (role === 'doctor' ? 'Cardiothoracic Physician' : 'Patient'),
      hospital: authenticatedUser.hospital || 'Metropolitan Heart & Vascular Institute'
    });

    return authenticatedUser;
  };

  // Admin login using username and passcode
  const loginAdmin = ({ username, password }) => {
    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    const validUsers = ['admin', 'admin@cardiotrack.com', 'administrator', 'root'];
    const validPasses = ['admin123', 'admin', 'cardio2026', '123456'];

    if (!trimmedUser || !trimmedPass) {
      throw new Error('Please enter both Admin ID and Security Passcode.');
    }

    if (!validUsers.includes(trimmedUser) && !trimmedUser.includes('admin')) {
      throw new Error('Invalid Admin Username. Use "admin" or "admin@cardiotrack.com".');
    }

    if (!validPasses.includes(trimmedPass)) {
      throw new Error('Invalid Passcode. Use "admin123".');
    }

    const adminUser = {
      role: 'admin',
      id: 'admin_001',
      name: 'System Administrator',
      email: 'admin@cardiotrack.com',
      phone: 'Super Admin',
      title: 'Clinical Operations Director & Telemetry Superuser',
      hospital: 'CardioTrack Telemedicine Command Center'
    };

    setUser(adminUser);
    dataService.recordSessionLogin({
      userId: adminUser.id,
      name: adminUser.name,
      role: 'admin',
      phone: adminUser.phone,
      title: adminUser.title,
      hospital: adminUser.hospital
    });

    return adminUser;
  };

  const logout = () => {
    if (user?.id) {
      dataService.recordSessionLogout(user.id);
    }
    setUser(null);
    setLastOtp(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('accessToken');
  };

  // Heartbeat tracking for active sessions & termination detection
  useEffect(() => {
    if (!user?.id) return;

    dataService.updateSessionHeartbeat(user.id);

    const interval = setInterval(() => {
      if (dataService.isSessionTerminated(user.id)) {
        logout();
        return;
      }
      dataService.updateSessionHeartbeat(user.id);
    }, 20000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Refresh auth state from DB (e.g., after profile update)
  const refreshUser = () => {
    if (!user) return;
    if (user.role === 'admin') return;

    if (user.role === 'doctor') {
      const doctor = dataService.getDoctorById(user.doctorId);
      if (doctor) {
        const updated = {
          ...user,
          name: doctor.name,
          title: doctor.title,
          hospital: doctor.hospital,
          specialty: doctor.specialty
        };
        setUser(updated);
      }
    } else {
      const patient = dataService.getPatientById(user.patientId);
      if (patient) {
        const updated = {
          ...user,
          name: patient.name,
          doctorId: patient.doctorId || null
        };
        setUser(updated);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        lastOtp,
        otpGeneratedAt,
        requestOtp,
        verifyOtpAndLogin,
        loginAdmin,
        refreshUser,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
