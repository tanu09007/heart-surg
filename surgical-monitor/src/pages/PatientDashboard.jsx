import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import Navbar from '../components/Navbar';
import ScannerModal from '../components/ScannerModal';
import ReportViewerModal from '../components/ReportViewerModal';
import {
  Calendar, Clock, User, Activity, Heart, Scale, FileText,
  Camera, Edit3, Save, Stethoscope, Plus, Pill, Phone,
  ShieldCheck, Eye, TrendingUp, Upload, Paperclip, Link2,
  CheckCircle2, Building2, AlertCircle, Sparkles, ZoomIn,
  X, AlertTriangle, Thermometer
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user, refreshUser } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('reviews');

  // Section: Incision Photo Upload
  const [incisionImage, setIncisionImage] = useState(null);
  const [incisionLocation, setIncisionLocation] = useState('Median Sternotomy (Chest)');
  const [incisionPostOpDay, setIncisionPostOpDay] = useState('');
  const [incisionRedness, setIncisionRedness] = useState('None / Normal Margin');
  const [incisionSwelling, setIncisionSwelling] = useState('None');
  const [incisionDrainage, setIncisionDrainage] = useState('None (Clean & Dry)');
  const [incisionPain, setIncisionPain] = useState(2);
  const [incisionFever, setIncisionFever] = useState('No');
  const [incisionNotes, setIncisionNotes] = useState('');
  const [isSubmittingIncision, setIsSubmittingIncision] = useState(false);
  const [viewingIncision, setViewingIncision] = useState(null);

  // Section 2: Profile edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    dob: '', age: '', gender: '', bloodGroup: '',
    surgeryType: '', surgeryDate: '', postOpDay: '', hospital: '',
    medicalHistory: '',
    phone: '',
    emergencyName: '', emergencyRelation: '', emergencyPhone: '',
    allergies: '', medications: ''
  });

  // Link to doctor
  const [doctorLinkName, setDoctorLinkName] = useState('');
  const [doctorLinkSpecialty, setDoctorLinkSpecialty] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Section 3 – Vitals form
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [weight, setWeight] = useState('');
  const [vitalNotes, setVitalNotes] = useState('');
  const [vitalDate, setVitalDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [isSubmittingVital, setIsSubmittingVital] = useState(false);

  // Section 3 – File upload
  const [pdfFile, setPdfFile] = useState(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('Lab Report');
  const [reportSummary, setReportSummary] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

  // ── Load this patient's data ──────────────────────────────────────────────
  const loadData = useCallback(() => {
    const pId = user?.patientId || user?.id;
    if (!pId) return;
    const data = dataService.getPatientById(pId);
    setPatientData(data);

    if (data) {
      setProfileForm({
        dob: data.dob || '',
        age: data.age || '',
        gender: data.gender || '',
        bloodGroup: data.bloodGroup || '',
        surgeryType: data.surgeryType || '',
        surgeryDate: data.surgeryDate || '',
        postOpDay: data.postOpDay || '',
        hospital: data.hospital || '',
        medicalHistory: data.medicalHistory || '',
        phone: data.phone || '',
        emergencyName: data.emergencyContact?.name || '',
        emergencyRelation: data.emergencyContact?.relation || '',
        emergencyPhone: data.emergencyContact?.phone || '',
        allergies: data.allergies ? data.allergies.join(', ') : '',
        medications: data.medications ? data.medications.join('\n') : ''
      });

      if (data.postOpDay) {
        setIncisionPostOpDay(data.postOpDay);
      }

      if (data.doctorId) {
        const doc = dataService.getDoctorById(data.doctorId);
        setDoctorProfile(doc);
      } else {
        setDoctorProfile(null);
      }
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Incision Photo Handlers ───────────────────────────────────────────────
  const handleIncisionPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIncisionImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleIncision = (sampleUrl) => {
    setIncisionImage(sampleUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80');
    toast.success('Sample surgical incision photo loaded.');
  };

  const handleAddIncisionCheck = (e) => {
    e.preventDefault();
    if (!incisionImage) {
      toast.error('Please capture or select an image of your surgical incision site');
      return;
    }

    setIsSubmittingIncision(true);
    setTimeout(() => {
      const added = dataService.addIncisionPhoto(patientData.id, {
        location: incisionLocation,
        imageUrl: incisionImage,
        redness: incisionRedness,
        swelling: incisionSwelling,
        drainage: incisionDrainage,
        painLevel: incisionPain,
        fever: incisionFever,
        patientNotes: incisionNotes,
        postOpDay: Number(incisionPostOpDay) || patientData.postOpDay || 0
      });

      if (added) {
        toast.success('Surgical incision photo submitted for doctor review!');
        setIncisionImage(null);
        setIncisionNotes('');
        loadData();
      } else {
        toast.error('Failed to submit incision photo');
      }
      setIsSubmittingIncision(false);
    }, 400);
  };

  // ── Link patient to a doctor by name + specialty ───────────────────────
  const handleLinkDoctor = (e) => {
    e.preventDefault();
    if (!doctorLinkName.trim()) { toast.error('Please enter the doctor\'s name'); return; }
    setIsLinking(true);
    setTimeout(() => {
      const result = dataService.linkPatientToDoctorByNameAndSpecialty(
        patientData.id,
        doctorLinkName.trim(),
        doctorLinkSpecialty.trim()
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Successfully linked to ${result.doctor.name}!`);
        setDoctorLinkName('');
        setDoctorLinkSpecialty('');
        loadData();
        refreshUser();
      }
      setIsLinking(false);
    }, 400);
  };

  // ── Save profile edits ────────────────────────────────────────────────────
  const handleSaveProfile = (e) => {
    e.preventDefault();
    dataService.updatePatientProfile(patientData.id, {
      dob: profileForm.dob,
      age: Number(profileForm.age) || '',
      gender: profileForm.gender,
      bloodGroup: profileForm.bloodGroup,
      surgeryType: profileForm.surgeryType,
      surgeryDate: profileForm.surgeryDate,
      postOpDay: Number(profileForm.postOpDay) || 0,
      hospital: profileForm.hospital,
      medicalHistory: profileForm.medicalHistory,
      phone: profileForm.phone,
      emergencyContact: {
        name: profileForm.emergencyName,
        relation: profileForm.emergencyRelation,
        phone: profileForm.emergencyPhone
      },
      allergies: profileForm.allergies.split(',').map((a) => a.trim()).filter(Boolean),
      medications: profileForm.medications.split('\n').map((m) => m.trim()).filter(Boolean)
    });
    toast.success('Personal details saved!');
    setIsEditingProfile(false);
    loadData();
  };

  // ── Add vitals ────────────────────────────────────────────────────────────
  const handleAddVitals = (e) => {
    e.preventDefault();
    if (!systolic || !diastolic || !heartRate || !weight) {
      toast.error('Please fill in all vital fields'); return;
    }
    const nSys = Number(systolic), nDia = Number(diastolic), nHr = Number(heartRate), nWt = Number(weight);
    if (nSys < 50 || nSys > 250 || nDia < 30 || nDia > 180) { toast.error('BP values out of range'); return; }
    if (nHr < 30 || nHr > 220) { toast.error('Heart rate out of range'); return; }
    if (nWt < 20 || nWt > 300) { toast.error('Weight out of range'); return; }

    setIsSubmittingVital(true);
    setTimeout(() => {
      dataService.addVitalEntry(patientData.id, {
        systolic: nSys, diastolic: nDia, heartRate: nHr, weight: nWt,
        notes: vitalNotes.trim() || 'Daily self-check',
        date: vitalDate ? new Date(vitalDate).toISOString() : new Date().toISOString()
      });
      toast.success('Vitals recorded!');
      setSystolic(''); setDiastolic(''); setHeartRate(''); setWeight(''); setVitalNotes('');
      setVitalDate(new Date().toISOString().slice(0, 16));
      setIsSubmittingVital(false);
      loadData();
    }, 400);
  };

  // ── Submit PDF / file ─────────────────────────────────────────────────────
  const handlePdfSubmit = (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) { toast.error('Please enter a report title'); return; }
    setIsUploadingFile(true);
    setTimeout(() => {
      const isPdf = pdfFile?.name?.toLowerCase().endsWith('.pdf');
      dataService.addReport(patientData.id, {
        title: reportTitle.trim(),
        category: reportCategory,
        fileType: isPdf ? 'pdf' : 'image',
        previewUrl: isPdf ? '' : 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80',
        summary: reportSummary.trim() || `Submitted by patient: ${reportTitle}`,
        rawFile: pdfFile
      });
      toast.success(`"${reportTitle}" submitted!`);
      setPdfFile(null); setReportTitle(''); setReportSummary('');
      setIsUploadingFile(false);
      loadData();
    }, 600);
  };

  const handleSaveScannedReport = (scannedReport) => {
    dataService.addReport(patientData.id, scannedReport);
    toast.success('Camera scan uploaded!');
    loadData();
  };

  if (!patientData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading your records…
      </div>
    );
  }

  const latestVital = patientData.vitalsHistory?.[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Patient Welcome Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Heart className="w-7 h-7 fill-white animate-heartbeat" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">{patientData.name}</h1>
                  {patientData.postOpDay > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Post-Op Day {patientData.postOpDay}
                    </span>
                  )}
                  {patientData.bloodGroup && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      {patientData.bloodGroup}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {patientData.surgeryType || 'Surgery details not set yet'}
                  {doctorProfile && (
                    <> • Attending: <span className="text-cyan-400 font-medium">{doctorProfile.name}</span></>
                  )}
                </p>

                {/* Doctor not linked yet */}
                {!doctorProfile && (
                  <div className="mt-2 flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg inline-flex">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No doctor linked yet. Go to <strong>Personal Details</strong> to link your attending physician.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {latestVital && (
                <div className="hidden md:flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9px]">LATEST BP</span>
                    <span className="font-bold text-cyan-300">{latestVital.systolic}/{latestVital.diastolic}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="text-slate-500 block text-[9px]">HR</span>
                    <span className="font-bold text-rose-300">{latestVital.heartRate} bpm</span>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div>
                    <span className="text-slate-500 block text-[9px]">WEIGHT</span>
                    <span className="font-bold text-amber-300">{latestVital.weight} kg</span>
                  </div>
                </div>
              )}
              {patientData.nextFollowUp && (
                <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-cyan-500/30 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase">Next Appointment</span>
                  <span className="font-bold text-cyan-300 flex items-center space-x-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span>{patientData.nextFollowUp}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex bg-slate-900/60 border border-slate-800 rounded-xl p-1 gap-1">
          {[
            { id: 'reviews', label: '1. Follow-ups & Reviews', Icon: Calendar },
            { id: 'incision', label: '2. Surgical Wound Photo', Icon: Camera, badge: patientData?.incisionPhotos?.length },
            { id: 'vitals', label: '3. Daily Vitals & Reports', Icon: Activity },
            { id: 'profile', label: '4. Personal & Medical Details', Icon: User }
          ].map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex-1 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                activeSection === id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split('.')[1] || label}</span>
              {typeof badge === 'number' && badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-800/60">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 – DOCTOR FOLLOW-UPS & REVIEW                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            {/* Upcoming appointment */}
            {doctorProfile ? (
              <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5 mb-2">
                      <Stethoscope className="w-4 h-4" />
                      <span>Your Attending Physician</span>
                    </span>
                    <h2 className="text-xl font-extrabold text-white">{doctorProfile.name}</h2>
                    <p className="text-sm text-slate-300 mt-0.5">{doctorProfile.title}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{doctorProfile.hospital}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    {patientData.nextFollowUp ? (
                      <div className="bg-slate-950/80 px-4 py-3 rounded-xl border border-cyan-500/30 text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase mb-1">Next Appointment</span>
                        <span className="font-bold text-white text-base">
                          {new Date(patientData.nextFollowUp).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="block text-cyan-300 mt-0.5">{patientData.followUpMode}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">No appointment scheduled yet</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-sm text-amber-300 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>You haven't been linked to a doctor yet. Go to <strong>Personal Details</strong> (Section 2) and enter your doctor's name and specialty to link your account.</span>
              </div>
            )}

            {/* Doctor Reviews Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-cyan-400" />
                    <span>Clinical Reviews & Doctor Notes</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">All post-operative assessments written by your attending physician</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{patientData.reviews?.length || 0} reviews</span>
              </div>

              {patientData.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {patientData.reviews.map((rev) => (
                    <div key={rev.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                          <span className="font-bold text-sm text-cyan-300">{rev.doctorName}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(rev.date).toLocaleDateString()} {new Date(rev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">{rev.notes}</p>
                      {rev.prescriptionNotes && (
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-xs text-emerald-300 flex items-start space-x-2">
                          <Pill className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-emerald-200 font-semibold">Prescription & Instructions:</strong>
                            {rev.prescriptionNotes}
                          </div>
                        </div>
                      )}
                      {rev.followUpDate && (
                        <p className="text-xs text-slate-400 flex items-center space-x-1.5 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Next Follow-up: <strong className="text-cyan-300">{rev.followUpDate}</strong></span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 rounded-xl bg-slate-950 border border-dashed border-slate-800 text-xs text-slate-400">
                  No reviews posted yet. Your doctor will review your daily vitals and uploads soon.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 – SURGICAL WOUND & INCISION PHOTO UPLOAD                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'incision' && (
          <div className="space-y-6">

            {/* Banner Guide */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/30 flex items-start space-x-4 shadow-lg">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <Camera className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-white">Surgical Incision & Body Wound Healing Monitor</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Wound Tele-Care
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Upload regular photographs of your surgery site on your body (chest sternotomy, leg vein harvest incision, or pacemaker site).
                  Your surgeon reviews these photographs for wound edge approximation, signs of redness (erythema), and infection prevention.
                </p>
              </div>
            </div>

            {/* Incision Upload Form Card */}
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-purple-400" />
                  <span>Submit New Surgical Wound Photograph</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Post-Op Day: <strong className="text-cyan-300 font-bold">{patientData.postOpDay > 0 ? `Day ${patientData.postOpDay}` : 'Day 1'}</strong>
                </span>
              </div>

              <form onSubmit={handleAddIncisionCheck} className="space-y-5">
                {/* Photo Selection / Camera Preview Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Incision Site Photograph <span className="text-rose-400">*</span>
                  </label>

                  {incisionImage ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/50 bg-slate-950 p-2 max-w-md mx-auto sm:mx-0">
                      <img
                        src={incisionImage}
                        alt="Incision Site Preview"
                        className="w-full h-64 sm:h-72 object-cover rounded-xl"
                      />
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setIncisionImage(null)}
                          className="p-2 rounded-xl bg-slate-950/80 hover:bg-rose-500/80 text-white border border-slate-700 transition cursor-pointer shadow-lg"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-2 text-center text-xs text-emerald-400 font-semibold flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Photo attached & ready for submission</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-700 hover:border-purple-400/60 rounded-2xl p-6 text-center bg-slate-950/50 transition">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Capture with Camera or Upload Photo</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Take a well-lit close-up photo of your surgical wound site (JPEG, PNG, HEIC)
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                          <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20">
                            <Upload className="w-4 h-4" />
                            <span>Browse / Take Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleIncisionPhotoChange}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleUseSampleIncision('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80')}
                            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/50 transition cursor-pointer flex items-center justify-center space-x-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>⚡ Use Demo Incision Photo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Clinical Checklist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">

                  {/* Anatomical Site */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Surgical Site Location on Body
                    </label>
                    <select
                      value={incisionLocation}
                      onChange={(e) => setIncisionLocation(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option>Median Sternotomy (Chest Incision)</option>
                      <option>Saphenous Vein Harvest (Leg / Calf)</option>
                      <option>Radial Artery Harvest (Forearm)</option>
                      <option>Minimally Invasive Port / Thoracotomy</option>
                      <option>Pacemaker / ICD Pocket (Upper Chest)</option>
                      <option>Femoral Artery Puncture (Groin)</option>
                      <option>Other Surgical Incision</option>
                    </select>
                  </div>

                  {/* Post-Op Day */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Post-Operative Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      placeholder="e.g. 12"
                      value={incisionPostOpDay}
                      onChange={(e) => setIncisionPostOpDay(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* Redness / Erythema */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Redness around Incision Edges
                    </label>
                    <select
                      value={incisionRedness}
                      onChange={(e) => setIncisionRedness(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option>None / Normal Margin</option>
                      <option>Mild Pink Border (&lt;1 cm)</option>
                      <option>Moderate Redness (1–2 cm)</option>
                      <option>Significant Spreading Redness (&gt;2 cm)</option>
                    </select>
                  </div>

                  {/* Drainage */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Fluid or Drainage from Wound
                    </label>
                    <select
                      value={incisionDrainage}
                      onChange={(e) => setIncisionDrainage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option>None (Clean & Dry)</option>
                      <option>Minimal Clear / Serous Fluid</option>
                      <option>Yellowish / Oozing Fluid</option>
                      <option>Cloudy / Purulent Discharge</option>
                    </select>
                  </div>

                  {/* Swelling */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Swelling or Sternal Bulging
                    </label>
                    <select
                      value={incisionSwelling}
                      onChange={(e) => setIncisionSwelling(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option>None / Flat Edges</option>
                      <option>Mild Puffiness</option>
                      <option>Moderate Bulging</option>
                      <option>Severe Swelling / Tension</option>
                    </select>
                  </div>

                  {/* Fever */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Fever or Body Chills
                    </label>
                    <select
                      value={incisionFever}
                      onChange={(e) => setIncisionFever(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option>No Fever (&lt;99.0°F)</option>
                      <option>Mild Warmth (99.0°F - 100.4°F)</option>
                      <option>Fever Detected (&gt;100.4°F / 38°C)</option>
                    </select>
                  </div>
                </div>

                {/* Pain Level Slider */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Wound Pain Level (0 = No Pain, 10 = Severe Pain)
                    </label>
                    <span className="text-sm font-mono font-bold text-purple-300">
                      Score: {incisionPain}/10 ({incisionPain === 0 ? 'None' : incisionPain <= 3 ? 'Mild' : incisionPain <= 6 ? 'Moderate' : 'Severe'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={incisionPain}
                    onChange={(e) => setIncisionPain(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>0 (No Pain)</span>
                    <span>3 (Mild)</span>
                    <span>5 (Moderate)</span>
                    <span>8 (Severe)</span>
                    <span>10 (Unbearable)</span>
                  </div>
                </div>

                {/* Patient notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Observations / Notes for Attending Surgeon
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Dressing changed this morning, wound edges dry, mild itching near bottom of sternum."
                    value={incisionNotes}
                    onChange={(e) => setIncisionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingIncision || !incisionImage}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 shadow-lg shadow-purple-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isSubmittingIncision ? 'Uploading & Saving…' : 'Submit Incision Photo'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Incision Healing Gallery / Progression Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Surgical Incision Healing Progression Timeline</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {patientData.incisionPhotos?.length || 0} checks documented
                </span>
              </div>

              {patientData.incisionPhotos?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patientData.incisionPhotos.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">{inc.location}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(inc.date).toLocaleDateString()} at {new Date(inc.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          Day {inc.postOpDay}
                        </span>
                      </div>

                      {/* Image preview with click to zoom */}
                      <div
                        onClick={() => setViewingIncision(inc)}
                        className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video group cursor-pointer"
                      >
                        <img
                          src={inc.imageUrl}
                          alt={inc.location}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-xl bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg">
                            <ZoomIn className="w-4 h-4" />
                            <span>Inspect Full Resolution</span>
                          </span>
                        </div>
                      </div>

                      {/* Symptoms badges */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="text-slate-500 block text-[9px] uppercase">Redness</span>
                          <span className="text-slate-200 font-medium truncate block">{inc.redness}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="text-slate-500 block text-[9px] uppercase">Drainage</span>
                          <span className="text-slate-200 font-medium truncate block">{inc.drainage}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="text-slate-500 block text-[9px] uppercase">Pain Score</span>
                          <span className="font-mono text-purple-300 font-bold">{inc.painLevel}/10</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                          <span className="text-slate-500 block text-[9px] uppercase">Fever</span>
                          <span className="text-slate-200 font-medium truncate block">{inc.fever}</span>
                        </div>
                      </div>

                      {inc.patientNotes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                          "{inc.patientNotes}"
                        </p>
                      )}

                      {/* Doctor Feedback Section */}
                      {inc.doctorReviewed ? (
                        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Surgeon Assessment</span>
                          </div>
                          <p className="text-slate-200">{inc.doctorFeedback}</p>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Awaiting Review by Attending Surgeon</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-500">
                  No incision photographs uploaded yet. Use the form above to record your first surgical check.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 – PERSONAL DETAILS                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'profile' && (
          <div className="space-y-5">
            {/* Link to Doctor Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span>Attending Physician Linkage</span>
              </h3>

              {doctorProfile ? (
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{doctorProfile.name}</p>
                    <p className="text-xs text-slate-400">{doctorProfile.title} • {doctorProfile.hospital}</p>
                    <p className="text-xs font-mono text-cyan-300 mt-0.5">Phone: {doctorProfile.phone}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <form onSubmit={handleLinkDoctor} className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>You are not yet linked to a doctor. Enter your attending doctor's name and specialty to connect.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Doctor Name */}
                    <div className="relative">
                      <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Doctor's name (e.g. Sarah Jenkins)"
                        value={doctorLinkName}
                        onChange={(e) => setDoctorLinkName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                    {/* Doctor Specialty */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Specialty (optional, e.g. Cardiac)"
                        value={doctorLinkSpecialty}
                        onChange={(e) => setDoctorLinkSpecialty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLinking}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                    >
                      {isLinking ? 'Linking…' : 'Link Doctor'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Existing doctors: Dr. Sarah Jenkins → <span className="font-mono text-slate-400">9019283100</span> &nbsp;|&nbsp; Dr. Arjun Mehta → <span className="font-mono text-slate-400">9811002233</span>
                  </p>
                </form>
              )}
            </div>

            {/* Personal Profile Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  <span>Personal & Surgical Profile</span>
                </h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button onClick={() => setIsEditingProfile(false)} className="text-xs text-slate-400 hover:text-white cursor-pointer">Cancel</button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { label: 'Date of Birth', key: 'dob', type: 'date' },
                      { label: 'Age (years)', key: 'age', type: 'number', placeholder: '45' },
                      { label: 'Gender', key: 'gender', type: 'text', placeholder: 'Male / Female / Other' },
                      { label: 'Blood Group', key: 'bloodGroup', type: 'text', placeholder: 'A+, O-, etc.' },
                      { label: 'Surgery Date', key: 'surgeryDate', type: 'date' },
                      { label: 'Post-Op Day', key: 'postOpDay', type: 'number', placeholder: '12' },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={profileForm[key]}
                          onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Surgery / Procedure</label>
                      <input
                        type="text"
                        placeholder="e.g. CABG x 3, Mitral Valve Repair, TAVR"
                        value={profileForm.surgeryType}
                        onChange={(e) => setProfileForm({ ...profileForm, surgeryType: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Hospital / Clinic</label>
                      <input
                        type="text"
                        placeholder="Metropolitan Heart Institute"
                        value={profileForm.hospital}
                        onChange={(e) => setProfileForm({ ...profileForm, hospital: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-slate-400 mb-1">Medical History / Diagnosis</label>
                      <input
                        type="text"
                        placeholder="e.g. Hypertension, CAD, Dyslipidemia"
                        value={profileForm.medicalHistory}
                        onChange={(e) => setProfileForm({ ...profileForm, medicalHistory: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Emergency Contact</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Contact Name', key: 'emergencyName', placeholder: 'Mary Doe' },
                        { label: 'Relationship', key: 'emergencyRelation', placeholder: 'Spouse' },
                        { label: 'Emergency Phone', key: 'emergencyPhone', placeholder: '+91 98765 43210' }
                      ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                          <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
                          <input
                            type="text"
                            placeholder={placeholder}
                            value={profileForm[key]}
                            onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Allergies (comma-separated)</label>
                      <input
                        type="text"
                        placeholder="Penicillin, NSAIDs, Latex"
                        value={profileForm.allergies}
                        onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Medications (one per line)</label>
                      <textarea
                        rows={2}
                        placeholder="Metoprolol 25mg Daily&#10;Aspirin 81mg Daily"
                        value={profileForm.medications}
                        onChange={(e) => setProfileForm({ ...profileForm, medications: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Details</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Read View */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Surgical Procedure</h4>
                      {[
                        ['Procedure', patientData.surgeryType || '—'],
                        ['Surgery Date', patientData.surgeryDate || '—'],
                        ['Post-Op Day', patientData.postOpDay > 0 ? `Day ${patientData.postOpDay}` : '—'],
                        ['Hospital', patientData.hospital || '—']
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b border-slate-800/80 pb-1.5 text-xs">
                          <span className="text-slate-400">{label}:</span>
                          <span className="font-medium text-white text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Demographics</h4>
                      {[
                        ['Name', patientData.name],
                        ['Date of Birth', patientData.dob || '—'],
                        ['Age & Gender', patientData.age && patientData.gender ? `${patientData.age} yrs, ${patientData.gender}` : '—'],
                        ['Blood Group', patientData.bloodGroup || '—'],
                        ['Phone', patientData.phone]
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between border-b border-slate-800/80 pb-1.5 text-xs">
                          <span className="text-slate-400">{label}:</span>
                          <span className="font-medium text-white font-mono text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Emergency Contact</span>
                      </h4>
                      <p className="font-bold text-white text-sm">{patientData.emergencyContact?.name || '—'}</p>
                      <p className="text-xs text-slate-400">
                        {patientData.emergencyContact?.relation ? `Relation: ${patientData.emergencyContact.relation}` : '—'}
                      </p>
                      <p className="text-xs font-mono text-cyan-300">{patientData.emergencyContact?.phone || '—'}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2">Documented Allergies</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {patientData.allergies?.length > 0
                          ? patientData.allergies.map((a, i) => (
                              <span key={i} className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">{a}</span>
                            ))
                          : <span className="text-xs text-slate-500">None recorded</span>}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5 mb-2">
                        <Pill className="w-3.5 h-3.5" />
                        <span>Active Medications</span>
                      </h4>
                      {patientData.medications?.length > 0 ? (
                        <ul className="text-xs text-slate-300 space-y-1">
                          {patientData.medications.map((m, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <span className="text-xs text-slate-500">No medications recorded</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 – DAILY REPORTS & VITALS UPLOAD                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeSection === 'vitals' && (
          <div className="space-y-6">

            {/* Vitals Entry Form */}
            <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Daily Vitals Entry (Numeric)</h2>
                  <p className="text-xs text-slate-400">Enter blood pressure, heart rate, and weight — recorded in chronological order.</p>
                </div>
              </div>

              <form onSubmit={handleAddVitals} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* BP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Blood Pressure (mmHg)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number" required placeholder="120" min="50" max="250"
                        value={systolic} onChange={(e) => setSystolic(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 text-center"
                      />
                      <span className="text-slate-500 font-bold">/</span>
                      <input
                        type="number" required placeholder="80" min="30" max="180"
                        value={diastolic} onChange={(e) => setDiastolic(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 text-center"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Systolic / Diastolic</span>
                  </div>

                  {/* HR */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Heart Rate (BPM)</label>
                    <div className="relative">
                      <input
                        type="number" required placeholder="72" min="30" max="220"
                        value={heartRate} onChange={(e) => setHeartRate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-rose-400"
                      />
                      <Heart className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 fill-rose-500/20 animate-heartbeat pointer-events-none" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Beats per minute (resting)</span>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weight (kg)</label>
                    <div className="relative">
                      <input
                        type="number" step="0.1" required placeholder="76.5" min="20" max="300"
                        value={weight} onChange={(e) => setWeight(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
                      />
                      <Scale className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">In kilograms</span>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Check Timestamp</label>
                    <input
                      type="datetime-local"
                      value={vitalDate}
                      onChange={(e) => setVitalDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Defaults to now</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Activity / Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning reading before breakfast, no chest tightness"
                    value={vitalNotes}
                    onChange={(e) => setVitalNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingVital}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSubmittingVital ? 'Saving…' : 'Submit Vitals Check'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Chronological Vitals Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Chronological Vitals Record (Newest First)</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">{patientData.vitalsHistory?.length || 0} entries</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">BP (mmHg)</th>
                      <th className="py-3 px-3">HR (BPM)</th>
                      <th className="py-3 px-3">Weight (kg)</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {patientData.vitalsHistory?.map((v) => {
                      const ok = v.systolic < 130 && v.diastolic < 85;
                      return (
                        <tr key={v.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-3 text-slate-400 font-sans whitespace-nowrap">
                            {new Date(v.date).toLocaleDateString()} {new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-3 font-bold text-cyan-300">{v.systolic}/{v.diastolic}</td>
                          <td className="py-3 px-3 font-bold text-rose-300">{v.heartRate} bpm</td>
                          <td className="py-3 px-3 font-bold text-amber-300">{v.weight} kg</td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border ${ok ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                              {ok ? 'Optimal' : 'Elevated'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-sans max-w-xs truncate">{v.notes || '-'}</td>
                        </tr>
                      );
                    })}
                    {(!patientData.vitalsHistory || patientData.vitalsHistory.length === 0) && (
                      <tr><td colSpan={6} className="py-10 text-center text-slate-500">No vitals recorded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reports Upload: Camera + PDF */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span>Medical Reports & Document Submissions</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Scan documents via camera or submit diagnostic files as PDF for your doctor to review</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Camera Scanner */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 flex flex-col gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Option A: Scan via Camera</h4>
                      <p className="text-xs text-slate-400">Photograph ECG, wound, or paper report using device camera</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Launch Document Scanner</span>
                  </button>
                </div>

                {/* PDF Upload */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-sm text-white">Option B: Submit as PDF / File</h4>
                  </div>
                  <form onSubmit={handlePdfSubmit} className="space-y-2.5">
                    <input
                      type="text" required placeholder="Report title (e.g. Lab Report Aug 2026)"
                      value={reportTitle} onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <select
                      value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option>Lab Report</option>
                      <option>Imaging Scan</option>
                      <option>Echo Ultrasound</option>
                      <option>ECG Rhythm</option>
                      <option>Discharge Summary</option>
                      <option>Prescription</option>
                    </select>
                    <input
                      type="file" accept=".pdf,image/*"
                      onChange={(e) => { if (e.target.files?.[0]) { setPdfFile(e.target.files[0]); if (!reportTitle) setReportTitle(e.target.files[0].name); } }}
                      className="w-full text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-cyan-300 hover:file:bg-slate-700 cursor-pointer"
                    />
                    <button
                      type="submit" disabled={isUploadingFile}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingFile ? 'Submitting…' : 'Upload & Submit File'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Uploaded docs list */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Your Submitted Documents ({patientData.scansAndReports?.length || 0})
                </h4>
                {patientData.scansAndReports?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {patientData.scansAndReports.map((rep) => (
                      <div
                        key={rep.id}
                        onClick={() => setViewingReport(rep)}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex items-start space-x-3 group"
                      >
                        <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold text-cyan-300 uppercase font-mono">{rep.category}</span>
                          <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition">{rep.title}</h5>
                          <p className="text-[10px] text-slate-500">{new Date(rep.date).toLocaleDateString()} • {rep.fileType?.toUpperCase()}</p>
                        </div>
                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">No reports submitted yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <ScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onSaveReport={handleSaveScannedReport} />
      <ReportViewerModal report={viewingReport} isOpen={!!viewingReport} onClose={() => setViewingReport(null)} />

      {/* Incision Zoom Modal */}
      {viewingIncision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span>{viewingIncision.location} - Day {viewingIncision.postOpDay}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Captured: {new Date(viewingIncision.date).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewingIncision(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[450px] flex items-center justify-center">
              <img
                src={viewingIncision.imageUrl}
                alt={viewingIncision.location}
                className="max-h-[450px] w-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Redness</span>
                <span className="text-slate-200 font-medium">{viewingIncision.redness}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Drainage</span>
                <span className="text-slate-200 font-medium">{viewingIncision.drainage}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Pain Level</span>
                <span className="font-mono text-purple-400 font-bold">{viewingIncision.painLevel}/10</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Fever</span>
                <span className="text-slate-200 font-medium">{viewingIncision.fever}</span>
              </div>
            </div>

            {viewingIncision.patientNotes && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Patient Comments</span>
                <p className="text-slate-300 italic">"{viewingIncision.patientNotes}"</p>
              </div>
            )}

            {viewingIncision.doctorReviewed && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1">
                <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Attending Surgeon Clinical Review</span>
                </span>
                <p className="text-slate-200">{viewingIncision.doctorFeedback}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
