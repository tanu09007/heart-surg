import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import Navbar from '../components/Navbar';
import ReportViewerModal from '../components/ReportViewerModal';
import {
  Users, Search, Activity, Heart, Scale, Calendar, Clock,
  FileText, Stethoscope, Send, Eye, TrendingUp,
  ChevronRight, User, Edit3, Save, Phone, Building2,
  Camera, ZoomIn, CheckCircle2, X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user, refreshUser } = useAuth();

  // Doctor's own profile (from DB)
  const [doctorProfile, setDoctorProfile] = useState(null);
  // Only this doctor's patients
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Doctor review form
  const [reviewNotes, setReviewNotes] = useState('');
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpMode, setFollowUpMode] = useState('In-Person');
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Doctor profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ title: '', hospital: '', specialty: '', email: '' });

  // Report viewer
  const [viewingReport, setViewingReport] = useState(null);

  // Incision photo inspection and review
  const [viewingIncision, setViewingIncision] = useState(null);
  const [incisionFeedbackText, setIncisionFeedbackText] = useState({});

  // ── Load doctor profile and their patients ──────────────────────────────────
  const loadData = useCallback(() => {
    if (!user?.doctorId) return;
    const doc = dataService.getDoctorById(user.doctorId);
    setDoctorProfile(doc);

    if (doc) {
      setProfileForm({
        title: doc.title || '',
        hospital: doc.hospital || '',
        specialty: doc.specialty || '',
        email: doc.email || ''
      });
    }

    const myPatients = dataService.getDoctorPatients(user.doctorId);
    setPatients(myPatients);

    // Auto-select first patient
    if (myPatients.length > 0 && !selectedPatientId) {
      const first = myPatients[0];
      setSelectedPatientId(first.id);
      setFollowUpDate(first.nextFollowUp || '');
      setFollowUpMode(first.followUpMode || 'In-Person');
    }
  }, [user?.doctorId, selectedPatientId]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id);
    setFollowUpDate(patient.nextFollowUp || '');
    setFollowUpMode(patient.followUpMode || 'In-Person');
    setReviewNotes('');
    setPrescriptionNotes('');
  };

  // Filter patients list
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.surgeryType.toLowerCase().includes(q);
  });

  // ── BP Status Helper ────────────────────────────────────────────────────────
  const getBpStatus = (sys, dia) => {
    if (!sys) return { label: 'No Data', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    if (sys < 120 && dia < 80) return { label: 'Optimal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (sys <= 129 && dia < 80) return { label: 'Elevated', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (sys <= 139 || dia <= 89) return { label: 'Stage 1 HTN', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'High Alert', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const latestVital = selectedPatient?.vitalsHistory?.[0] || null;
  const bpStatus = latestVital ? getBpStatus(latestVital.systolic, latestVital.diastolic) : null;

  // ── Save review ─────────────────────────────────────────────────────────────
  const handleSaveReview = (e) => {
    e.preventDefault();
    if (!reviewNotes.trim()) { toast.error('Please add clinical observations'); return; }
    if (!followUpDate) { toast.error('Please select a follow-up date'); return; }

    setIsSavingReview(true);
    setTimeout(() => {
      dataService.saveDoctorReview(selectedPatient.id, {
        doctorId: user.doctorId,
        doctorName: doctorProfile?.name || user.name,
        notes: reviewNotes.trim(),
        prescriptionNotes: prescriptionNotes.trim(),
        followUpDate,
        followUpMode
      });
      toast.success(`Review saved for ${selectedPatient.name}`);
      setIsSavingReview(false);
      setReviewNotes('');
      setPrescriptionNotes('');
      loadData();
    }, 600);
  };

  const applyPreset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  // ── Incision Feedback Handler ──────────────────────────────────────────────
  const handleSaveIncisionFeedback = (incisionId) => {
    const text = incisionFeedbackText[incisionId];
    if (!text?.trim()) {
      toast.error('Please enter a clinical assessment note');
      return;
    }
    const updated = dataService.addDoctorIncisionFeedback(selectedPatientId, incisionId, text.trim());
    if (updated) {
      toast.success('Incision assessment note saved.');
      setIncisionFeedbackText((prev) => ({ ...prev, [incisionId]: '' }));
      loadData();
    }
  };

  // ── Save doctor profile ────────────────────────────────────────────────────
  const handleSaveProfile = (e) => {
    e.preventDefault();
    dataService.updateDoctorProfile(user.doctorId, profileForm);
    toast.success('Profile updated!');
    setIsEditingProfile(false);
    loadData();
    refreshUser();
  };

  if (!doctorProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading your doctor profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Doctor Own Profile Banner ──────────────────────────────────────── */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">{doctorProfile.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {doctorProfile.title || 'Cardiac Physician'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center space-x-3 flex-wrap gap-y-1">
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{doctorProfile.hospital || 'Hospital not set'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-mono">{doctorProfile.phone}</span>
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{doctorProfile.specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs text-right">
                <span className="text-slate-400 block text-[10px] uppercase">Assigned Patients</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">{patients.length}</span>
              </div>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Inline edit form */}
          {isEditingProfile && (
            <form onSubmit={handleSaveProfile} className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title / Designation</label>
                <input type="text" value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hospital / Clinic</label>
                <input type="text" value={profileForm.hospital} onChange={(e) => setProfileForm({ ...profileForm, hospital: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Specialty</label>
                <input type="text" value={profileForm.specialty} onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditingProfile(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer">Cancel</button>
                <button type="submit" className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Main Workspace ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left – Patients List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>My Assigned Patients</span>
                <span className="ml-auto text-xs text-slate-500 font-normal">{filteredPatients.length} total</span>
              </h2>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or surgery…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {filteredPatients.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  {patients.length === 0
                    ? 'No patients assigned yet. Patients will appear here once they link your phone number in their profile.'
                    : 'No match for your search.'}
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredPatients.map((patient) => {
                    const isSelected = patient.id === selectedPatientId;
                    const latest = patient.vitalsHistory?.[0];
                    const status = latest ? getBpStatus(latest.systolic, latest.diastolic) : null;
                    return (
                      <div
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-white">{patient.name}</span>
                              {patient.postOpDay > 0 && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                                  Day {patient.postOpDay}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {patient.surgeryType || 'Surgery type not set'}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500 mt-0.5">{patient.phone}</p>
                          </div>
                          {status && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${status.color}`}>
                              {status.label}
                            </span>
                          )}
                        </div>

                        {latest && (
                          <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                            <div>
                              <span className="text-slate-500 block text-[9px]">BP</span>
                              <span className="font-bold text-cyan-300">{latest.systolic}/{latest.diastolic}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px]">HR</span>
                              <span className="font-bold text-rose-300">{latest.heartRate} bpm</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px]">Wt</span>
                              <span className="font-bold text-amber-300">{latest.weight} kg</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end mt-2">
                          <span className="text-[10px] text-cyan-400 flex items-center space-x-0.5">
                            <span>View Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right – Selected Patient Details */}
          {selectedPatient ? (
            <div className="lg:col-span-8 space-y-6">

              {/* Patient Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h2 className="text-xl font-extrabold text-white">{selectedPatient.name}</h2>
                      {selectedPatient.gender && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {selectedPatient.gender}, {selectedPatient.age} yrs
                        </span>
                      )}
                      {selectedPatient.bloodGroup && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {selectedPatient.bloodGroup}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-cyan-400 font-medium mt-1">
                      {selectedPatient.surgeryType || 'Surgery not recorded'}
                      {selectedPatient.surgeryDate && ` • Operated: ${new Date(selectedPatient.surgeryDate).toLocaleDateString()}`}
                      {selectedPatient.postOpDay > 0 && ` (Post-Op Day ${selectedPatient.postOpDay})`}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">Phone: {selectedPatient.phone}</p>
                  </div>
                  {selectedPatient.nextFollowUp && (
                    <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase">Next Follow-up</span>
                      <span className="font-bold text-cyan-300 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{selectedPatient.nextFollowUp}</span>
                      </span>
                    </div>
                  )}
                </div>
                {/* Quick clinical background */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Emergency Contact:</span>
                    <span className="text-slate-200 font-medium">
                      {selectedPatient.emergencyContact?.name
                        ? `${selectedPatient.emergencyContact.name} (${selectedPatient.emergencyContact.relation}) • ${selectedPatient.emergencyContact.phone}`
                        : 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Allergies:</span>
                    <span className="text-rose-400 font-medium">
                      {selectedPatient.allergies?.length > 0 ? selectedPatient.allergies.join(', ') : 'None reported'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Medications:</span>
                    <span className="text-slate-200 line-clamp-2">
                      {selectedPatient.medications?.[0] || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vitals Checks: BP, HR, Weight */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Latest Clinical Checks</span>
                  </h3>
                  <span className="text-xs text-slate-400">
                    {latestVital ? `Last: ${new Date(latestVital.date).toLocaleString()}` : 'No vitals submitted yet'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* BP */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">Blood Pressure</span>
                      {bpStatus && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${bpStatus.color}`}>
                          {bpStatus.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold font-mono text-cyan-300">
                        {latestVital ? `${latestVital.systolic}/${latestVital.diastolic}` : '--/--'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">mmHg</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Target: &lt;130/80 mmHg</p>
                  </div>
                  {/* HR */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">Heart Rate</span>
                      <Heart className="w-4 h-4 text-rose-400 animate-heartbeat fill-rose-500/20" />
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold font-mono text-rose-400">
                        {latestVital ? latestVital.heartRate : '--'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">BPM</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Normal: 60–90 bpm</p>
                  </div>
                  {/* Weight */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-400">Body Weight</span>
                      <Scale className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold font-mono text-amber-400">
                        {latestVital ? latestVital.weight : '--'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">kg</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Monitor &gt;1.5 kg/48h gain</p>
                  </div>
                </div>
              </div>

              {/* Surgical Incision & Body Wound Healing Monitor */}
              <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>Surgical Incision & Body Wound Healing Monitor</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {selectedPatient.incisionPhotos?.length || 0} photos
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">Review patient's body wound photographs, edge approximation, and erythema</p>
                    </div>
                  </div>
                </div>

                {selectedPatient.incisionPhotos?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedPatient.incisionPhotos.map((inc) => (
                      <div
                        key={inc.id}
                        className="rounded-2xl border border-slate-800 bg-slate-950 p-4 hover:border-purple-500/40 transition space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{inc.location}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(inc.date).toLocaleDateString()} • {new Date(inc.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            Post-Op Day {inc.postOpDay}
                          </span>
                        </div>

                        {/* Image Preview with click to zoom */}
                        <div
                          onClick={() => setViewingIncision(inc)}
                          className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative group cursor-pointer"
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

                        {/* Symptoms Checklist Data */}
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase">Redness</span>
                            <span className="text-slate-200 font-medium truncate block">{inc.redness}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase">Drainage</span>
                            <span className="text-slate-200 font-medium truncate block">{inc.drainage}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase">Pain Level</span>
                            <span className="font-mono text-purple-300 font-bold">{inc.painLevel}/10</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 block text-[9px] uppercase">Fever</span>
                            <span className="text-slate-200 font-medium truncate block">{inc.fever}</span>
                          </div>
                        </div>

                        {inc.patientNotes && (
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                            <span className="text-[10px] text-slate-500 font-semibold uppercase block">Patient Observation</span>
                            <p className="italic">"{inc.patientNotes}"</p>
                          </div>
                        )}

                        {/* Doctor's Assessment */}
                        {inc.doctorReviewed ? (
                          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-1">
                            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Clinical Note Recorded</span>
                            </div>
                            <p className="text-slate-200">{inc.doctorFeedback}</p>
                          </div>
                        ) : (
                          <div className="pt-2 space-y-2 border-t border-slate-800">
                            <input
                              type="text"
                              placeholder="Add clinical assessment (e.g. clean edges, keep dry)…"
                              value={incisionFeedbackText[inc.id] || ''}
                              onChange={(e) => setIncisionFeedbackText({ ...incisionFeedbackText, [inc.id]: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-400"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleSaveIncisionFeedback(inc.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition cursor-pointer flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Save Assessment</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-xs text-slate-400">
                    No surgical incision photos uploaded by this patient yet.
                  </div>
                )}
              </div>

              {/* Scan / Document Uploads */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-4">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Patient Scan Uploads & Reports ({selectedPatient.scansAndReports?.length || 0})</span>
                </h3>
                {selectedPatient.scansAndReports?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPatient.scansAndReports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setViewingReport(report)}
                        className="group rounded-xl border border-slate-800 bg-slate-950 p-3 hover:border-cyan-500/50 transition cursor-pointer"
                      >
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800 mb-2 relative flex items-center justify-center">
                          {report.fileType === 'image' && report.previewUrl ? (
                            <img src={report.previewUrl} alt={report.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          ) : (
                            <div className="flex flex-col items-center text-slate-400 text-center p-2">
                              <FileText className="w-8 h-8 text-cyan-400 mb-1" />
                              <span className="text-[10px] font-mono uppercase">PDF Report</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs flex items-center space-x-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                          {report.category}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{report.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{report.summary}</p>
                        <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{new Date(report.date).toLocaleDateString()}</span>
                          <span className="uppercase font-mono">{report.fileType}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-xs text-slate-400">
                    No scans or reports uploaded by this patient yet.
                  </div>
                )}
              </div>

              {/* Doctor Review & Follow-up Scheduler */}
              <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Clinical Review & Follow-up Scheduler</h3>
                    <p className="text-xs text-slate-400">Write your assessment and schedule the next appointment</p>
                  </div>
                </div>

                <form onSubmit={handleSaveReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Clinical Assessment / Progress Notes
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Sternal incision healing well. BP and HR stable. Continue progressive ambulation."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Prescription / Home-Care Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Continue Metoprolol 25mg. Alert clinic if systolic >140 on 2 checks."
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">Follow-up Date</label>
                        <div className="flex items-center space-x-1 text-[10px]">
                          {[3, 7, 14].map((d) => (
                            <button key={d} type="button" onClick={() => applyPreset(d)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer">
                              +{d}d
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Consultation Mode</label>
                      <select
                        value={followUpMode}
                        onChange={(e) => setFollowUpMode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
                      >
                        <option>In-Person (Cardiac Wing)</option>
                        <option>Telehealth Video Consult</option>
                        <option>Echo Ultrasound Lab</option>
                        <option>ECG &amp; Holter Evaluation</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingReview}
                      className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSavingReview ? 'Saving…' : 'Submit Review & Schedule Follow-up'}</span>
                    </button>
                  </div>
                </form>

                {/* Past reviews by this doctor for this patient */}
                {selectedPatient.reviews?.filter((r) => r.doctorId === user.doctorId).length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Your Previous Reviews for {selectedPatient.name}</span>
                    </h4>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {selectedPatient.reviews
                        .filter((r) => r.doctorId === user.doctorId)
                        .map((rev) => (
                          <div key={rev.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-300">{rev.doctorName}</span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(rev.date).toLocaleDateString()} {new Date(rev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-200 leading-relaxed">{rev.notes}</p>
                            {rev.prescriptionNotes && (
                              <p className="text-[11px] text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-800/30">
                                Rx: {rev.prescriptionNotes}
                              </p>
                            )}
                            {rev.followUpDate && (
                              <p className="text-[11px] text-cyan-400">
                                Scheduled: <strong>{rev.followUpDate}</strong>
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chronological Vitals History Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>Chronological Vitals Log</span>
                  </h3>
                  <span className="text-xs text-slate-400">{selectedPatient.vitalsHistory?.length || 0} entries</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">BP (mmHg)</th>
                        <th className="py-2.5 px-3">HR (BPM)</th>
                        <th className="py-2.5 px-3">Weight (kg)</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {selectedPatient.vitalsHistory?.map((v) => {
                        const s = getBpStatus(v.systolic, v.diastolic);
                        return (
                          <tr key={v.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-2.5 px-3 text-slate-400 font-sans whitespace-nowrap">
                              {new Date(v.date).toLocaleDateString()} {new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-cyan-300">{v.systolic}/{v.diastolic}</td>
                            <td className="py-2.5 px-3 font-bold text-rose-300">{v.heartRate} bpm</td>
                            <td className="py-2.5 px-3 font-bold text-amber-300">{v.weight} kg</td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border ${s.color}`}>{s.label}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-sans max-w-xs truncate">{v.notes || '-'}</td>
                          </tr>
                        );
                      })}
                      {(!selectedPatient.vitalsHistory || selectedPatient.vitalsHistory.length === 0) && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            No vitals submitted yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 text-center text-slate-500 text-sm">
              {patients.length === 0
                ? 'No patients have been assigned to you yet. Share your phone number with patients so they can link to your account.'
                : 'Select a patient from the list to view their records.'}
            </div>
          )}
        </div>
      </main>

      <ReportViewerModal report={viewingReport} isOpen={!!viewingReport} onClose={() => setViewingReport(null)} />

      {/* Incision Zoom Modal for Doctor */}
      {viewingIncision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span>{viewingIncision.location} — Post-Op Day {viewingIncision.postOpDay}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Patient: {selectedPatient?.name} • Captured: {new Date(viewingIncision.date).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewingIncision(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[500px] flex items-center justify-center">
              <img
                src={viewingIncision.imageUrl}
                alt={viewingIncision.location}
                className="max-h-[500px] w-full object-contain"
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
                <span className="text-[10px] text-slate-500 uppercase block">Pain Rating</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
