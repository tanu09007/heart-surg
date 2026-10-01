// ─── CardioTrack Dynamic Data Service ────────────────────────────────────────
// Doctor linking: matched by name (case-insensitive) + specialty keyword.
// ─────────────────────────────────────────────────────────────────────────────
// All data is stored dynamically in localStorage.
// No static hardcoded patient or doctor details.
// Seed data is only injected once on first launch for demo purposes.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'cardiotrack_db_v3';

// ── SEED DATA (injected once on first ever load only) ────────────────────────
const SEED_DATA = {
  doctors: [
    {
      id: 'doc_001',
      name: 'Dr. Sarah Jenkins',
      phone: '9019283100',
      title: 'MD, FACS - Chief Cardiothoracic Surgeon',
      hospital: 'Metropolitan Heart & Vascular Institute',
      specialty: 'Post-Operative Cardiac Tele-Care & Revascularization',
      license: 'MD-NY-849204',
      email: 's.jenkins@heartinst.org',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'doc_002',
      name: 'Dr. Arjun Mehta',
      phone: '9811002233',
      title: 'MD, DM - Senior Interventional Cardiologist',
      hospital: 'National Heart & Stroke Centre',
      specialty: 'Interventional Cardiology & Structural Heart Disease',
      license: 'MD-DL-219384',
      email: 'a.mehta@nhsc.in',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ],
  patients: [
    {
      id: 'pat_001',
      name: 'John Doe',
      phone: '9876543210',
      doctorId: 'doc_001',
      dob: '1964-05-14',
      age: 62,
      gender: 'Male',
      bloodGroup: 'O+',
      surgeryType: 'Triple Coronary Artery Bypass Graft (CABG x 3)',
      surgeryDate: '2026-08-22',
      postOpDay: 12,
      hospital: 'Metropolitan Heart & Vascular Institute',
      emergencyContact: { name: 'Mary Doe', relation: 'Spouse', phone: '+1 (555) 876-5432' },
      allergies: ['Penicillin', 'NSAIDs (severe hives)'],
      medications: [
        'Metoprolol Succinate 25mg PO Daily',
        'Aspirin 81mg Delayed-Release Daily',
        'Atorvastatin 40mg PO at Bedtime',
        'Furosemide 20mg PO PRN'
      ],
      medicalHistory: 'Severe 3-vessel CAD, Hypertension (8 yrs), Dyslipidemia.',
      nextFollowUp: '2026-09-10',
      followUpMode: 'In-Person (Room 402, Cardiac Wing)',
      createdAt: '2026-08-22T08:00:00Z',
      vitalsHistory: [
        {
          id: 'v_105',
          date: '2026-09-03T08:30:00Z',
          systolic: 124, diastolic: 82, heartRate: 74, weight: 76.8,
          notes: 'Morning vitals recorded after 10-min light walking.'
        },
        {
          id: 'v_104',
          date: '2026-09-02T19:15:00Z',
          systolic: 128, diastolic: 84, heartRate: 76, weight: 76.9,
          notes: 'Evening post-dinner check.'
        },
        {
          id: 'v_103',
          date: '2026-09-02T08:10:00Z',
          systolic: 122, diastolic: 80, heartRate: 71, weight: 76.7,
          notes: 'Fasting morning check.'
        },
        {
          id: 'v_102',
          date: '2026-09-01T18:45:00Z',
          systolic: 134, diastolic: 86, heartRate: 79, weight: 77.3,
          notes: 'Slight ankle swelling in evening, took prescribed diuretic.'
        },
        {
          id: 'v_101',
          date: '2026-08-31T08:00:00Z',
          systolic: 121, diastolic: 79, heartRate: 69, weight: 76.5,
          notes: 'Discharge baseline reading.'
        }
      ],
      scansAndReports: [
        {
          id: 'rep_001',
          title: 'Post-Op Chest X-Ray (AP View)',
          category: 'Imaging Scan',
          date: '2026-08-25',
          fileType: 'image',
          previewUrl: '/chest_xray.jpg',
          summary: 'Median sternotomy wires in anatomical alignment. Clear lung fields bilaterally. No pleural effusion.'
        },
        {
          id: 'rep_002',
          title: '12-Lead Electrocardiogram (ECG)',
          category: 'Cardiac Rhythm',
          date: '2026-08-28',
          fileType: 'image',
          previewUrl: '/ecg_12lead.jpg',
          summary: 'Normal Sinus Rhythm at 72 bpm. No acute ST changes. QTc within normal limits.'
        },
        {
          id: 'rep_003',
          title: 'Post-Surgical Echocardiogram Report.pdf',
          category: 'Echo Ultrasound',
          date: '2026-08-29',
          fileType: 'pdf',
          previewUrl: '',
          summary: 'LVEF 55%. Trace mitral regurgitation. Good graft flow velocities.'
        }
      ],
      reviews: [
        {
          id: 'rev_002',
          date: '2026-09-02T14:30:00Z',
          doctorId: 'doc_001',
          doctorName: 'Dr. Sarah Jenkins',
          notes: 'Patient shows excellent sternal stabilization. BP and HR responding well to Metoprolol 25mg.',
          followUpDate: '2026-09-10',
          prescriptionNotes: 'Continue Metoprolol 25mg BID, Aspirin 81mg daily.'
        },
        {
          id: 'rev_001',
          date: '2026-08-28T11:00:00Z',
          doctorId: 'doc_001',
          doctorName: 'Dr. Sarah Jenkins',
          notes: 'Wounds clean, dry, intact. Encouraged deep breathing with incentive spirometer.',
          followUpDate: '2026-09-02',
          prescriptionNotes: 'No lifting >5 lbs. Contact if fever >100.4°F.'
        }
      ],
      incisionPhotos: [
        {
          id: 'inc_101',
          date: '2026-09-03T10:15:00Z',
          postOpDay: 12,
          location: 'Median Sternotomy (Chest)',
          imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
          redness: 'None / Normal Margin',
          swelling: 'None',
          drainage: 'None (Clean & Dry)',
          painLevel: 2,
          fever: 'No',
          patientNotes: 'Dressing removed, sternotomy line well-approximated, sutures intact and dry.',
          doctorReviewed: true,
          doctorFeedback: 'Clean wound edges with healthy granulation tissue. Sternal stability is solid. Keep dry.'
        },
        {
          id: 'inc_102',
          date: '2026-08-27T09:00:00Z',
          postOpDay: 5,
          location: 'Median Sternotomy (Chest)',
          imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
          redness: 'Mild around lower pole',
          swelling: 'Mild',
          drainage: 'Minimal serous fluid on gauze',
          painLevel: 4,
          fever: 'No',
          patientNotes: 'Slight tenderness when coughing or deep breathing. Minimal clear fluid on morning dressing.',
          doctorReviewed: true,
          doctorFeedback: 'Expected physiological inflammation for Post-Op Day 5. Continue sterile dressing protocol.'
        }
      ]
    },
    {
      id: 'pat_002',
      name: 'Emily Watson',
      phone: '9123456780',
      doctorId: 'doc_001',
      dob: '1978-11-20',
      age: 48,
      gender: 'Female',
      bloodGroup: 'A+',
      surgeryType: 'Minimally Invasive Mitral Valve Repair (MVR)',
      surgeryDate: '2026-08-29',
      postOpDay: 5,
      hospital: 'Metropolitan Heart & Vascular Institute',
      emergencyContact: { name: 'David Watson', relation: 'Brother', phone: '+1 (555) 345-9876' },
      allergies: ['Sulfa drugs'],
      medications: ['Warfarin 3mg PO Daily (target INR 2.0-3.0)', 'Bisoprolol 2.5mg Daily'],
      medicalHistory: 'Severe degenerative mitral regurgitation with preserved ejection fraction.',
      nextFollowUp: '2026-09-08',
      followUpMode: 'Telehealth Video Consult',
      createdAt: '2026-08-29T08:00:00Z',
      vitalsHistory: [
        {
          id: 'v_202',
          date: '2026-09-03T07:45:00Z',
          systolic: 118, diastolic: 76, heartRate: 68, weight: 62.4,
          notes: 'No palpitations, resting comfortably.'
        },
        {
          id: 'v_201',
          date: '2026-09-02T08:00:00Z',
          systolic: 116, diastolic: 74, heartRate: 66, weight: 62.2,
          notes: 'Morning vitals.'
        }
      ],
      scansAndReports: [
        {
          id: 'rep_201',
          title: 'Mitral Valve Post-Repair Doppler Scan',
          category: 'Echo Ultrasound',
          date: '2026-08-30',
          fileType: 'image',
          previewUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80',
          summary: 'Annuloplasty band in prime position. Mitral valve leaflet coaptation restored.'
        }
      ],
      reviews: [
        {
          id: 'rev_201',
          date: '2026-09-01T10:00:00Z',
          doctorId: 'doc_001',
          doctorName: 'Dr. Sarah Jenkins',
          notes: 'Hemodynamics steady. INR at 2.4. Continue current warfarin dosing.',
          followUpDate: '2026-09-08',
          prescriptionNotes: 'Maintain INR testing every Tuesday.'
        }
      ]
    },
    {
      id: 'pat_003',
      name: 'Robert Chen',
      phone: '9988776655',
      doctorId: 'doc_001',
      dob: '1971-03-08',
      age: 55,
      gender: 'Male',
      bloodGroup: 'B+',
      surgeryType: 'Transcatheter Aortic Valve Replacement (TAVR)',
      surgeryDate: '2026-08-13',
      postOpDay: 21,
      hospital: 'Metropolitan Heart & Vascular Institute',
      emergencyContact: { name: 'Grace Chen', relation: 'Daughter', phone: '+1 (555) 765-4321' },
      allergies: ['Latex'],
      medications: ['Clopidogrel 75mg PO Daily', 'Aspirin 81mg PO Daily', 'Ramipril 5mg Daily'],
      medicalHistory: 'Critical aortic stenosis, syncope, hypertension.',
      nextFollowUp: '2026-09-14',
      followUpMode: 'In-Person (Echo Lab)',
      createdAt: '2026-08-13T08:00:00Z',
      vitalsHistory: [
        {
          id: 'v_302',
          date: '2026-09-03T09:00:00Z',
          systolic: 136, diastolic: 86, heartRate: 80, weight: 81.2,
          notes: 'Slight shortness of breath when climbing stairs.'
        },
        {
          id: 'v_301',
          date: '2026-09-01T08:30:00Z',
          systolic: 132, diastolic: 84, heartRate: 78, weight: 81.0,
          notes: 'Normal morning reading.'
        }
      ],
      scansAndReports: [
        {
          id: 'rep_301',
          title: 'TAVR Bioprosthetic Valve Position CT',
          category: 'CT Scan',
          date: '2026-08-14',
          fileType: 'image',
          previewUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1000&q=80',
          summary: 'Sapien 3 valve appropriately seated with no paravalvular leak.'
        }
      ],
      reviews: [
        {
          id: 'rev_301',
          date: '2026-08-25T16:00:00Z',
          doctorId: 'doc_001',
          doctorName: 'Dr. Sarah Jenkins',
          notes: 'Groin puncture site fully healed. No heart block signs. BP mildly elevated.',
          followUpDate: '2026-09-14',
          prescriptionNotes: 'Ramipril increased to 5mg daily. Walk at measured pace.'
        }
      ]
    },
    {
      id: 'pat_004',
      name: 'Priya Sharma',
      phone: '9871234560',
      doctorId: 'doc_002',
      dob: '1980-06-15',
      age: 46,
      gender: 'Female',
      bloodGroup: 'AB+',
      surgeryType: 'Percutaneous Coronary Intervention (PCI) - Stent',
      surgeryDate: '2026-08-28',
      postOpDay: 6,
      hospital: 'National Heart & Stroke Centre',
      emergencyContact: { name: 'Rahul Sharma', relation: 'Husband', phone: '+91 98100 12345' },
      allergies: ['Contrast dye (mild reaction)'],
      medications: ['Dual antiplatelet: Aspirin 75mg + Clopidogrel 75mg Daily', 'Atorvastatin 40mg'],
      medicalHistory: 'Unstable angina with LAD stenosis (90%). PCI with DES stent placed.',
      nextFollowUp: '2026-09-10',
      followUpMode: 'In-Person (Cath Lab Review)',
      createdAt: '2026-08-28T08:00:00Z',
      vitalsHistory: [
        {
          id: 'v_401',
          date: '2026-09-03T08:00:00Z',
          systolic: 126, diastolic: 80, heartRate: 72, weight: 58.5,
          notes: 'Feeling well. No chest pain.'
        }
      ],
      scansAndReports: [],
      reviews: [
        {
          id: 'rev_401',
          date: '2026-09-01T14:00:00Z',
          doctorId: 'doc_002',
          doctorName: 'Dr. Arjun Mehta',
          notes: 'Excellent PCI outcome. Stent patent on next-day echo. Continue DAPT for 12 months.',
          followUpDate: '2026-09-10',
          prescriptionNotes: 'Do NOT miss antiplatelet doses — stent thrombosis risk. No NSAIDs.'
        }
      ]
    }
  ]
};

const SESSIONS_STORAGE_KEY = 'cardiotrack_sessions_v1';

const SEED_SESSIONS = [
  {
    id: 'sess_001',
    userId: 'doc_001',
    name: 'Dr. Sarah Jenkins',
    role: 'doctor',
    phone: '9019283100',
    title: 'MD, FACS - Chief Cardiothoracic Surgeon',
    hospital: 'Metropolitan Heart & Vascular Institute',
    status: 'active',
    loginAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    lastHeartbeat: new Date().toISOString(),
    ip: '192.168.1.104 (Ward 4 Workstation)',
    device: 'Windows 11 Workstation',
    browser: 'Chrome 128'
  },
  {
    id: 'sess_002',
    userId: 'doc_002',
    name: 'Dr. Arjun Mehta',
    role: 'doctor',
    phone: '9811002233',
    title: 'Senior Interventional Cardiologist',
    hospital: 'National Heart & Stroke Centre',
    status: 'active',
    loginAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    lastHeartbeat: new Date().toISOString(),
    ip: '192.168.1.118 (Cath Lab Tablet)',
    device: 'iPad Pro / iOS',
    browser: 'Mobile Safari'
  },
  {
    id: 'sess_003',
    userId: 'pat_001',
    name: 'John Doe',
    role: 'patient',
    phone: '9876543210',
    title: 'Patient (Post-CABG Day 12)',
    hospital: 'Metropolitan Heart & Vascular Institute',
    doctorId: 'doc_001',
    doctorName: 'Dr. Sarah Jenkins',
    status: 'active',
    loginAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    lastHeartbeat: new Date().toISOString(),
    ip: '104.28.19.42 (Cellular / Home)',
    device: 'iPhone 15 Pro (iOS)',
    browser: 'Mobile Safari'
  },
  {
    id: 'sess_004',
    userId: 'pat_002',
    name: 'Emily Watson',
    role: 'patient',
    phone: '9123456780',
    title: 'Patient (Post-MVR Day 5)',
    hospital: 'Metropolitan Heart & Vascular Institute',
    doctorId: 'doc_001',
    doctorName: 'Dr. Sarah Jenkins',
    status: 'logged_out',
    loginAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    logoutAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    ip: '172.56.21.90 (Home Wi-Fi)',
    device: 'MacBook Air (macOS)',
    browser: 'Chrome 128'
  }
];

// ── Internal DB helpers ────────────────────────────────────────────────────────
function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let data;
    if (!raw) {
      data = SEED_DATA;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    } else {
      data = JSON.parse(raw);
    }
    // Ensure each patient has an incisionPhotos array
    if (data && data.patients) {
      let modified = false;
      data.patients.forEach((p) => {
        if (!p.incisionPhotos) {
          const seedMatch = SEED_DATA.patients.find((sp) => sp.id === p.id);
          p.incisionPhotos = seedMatch?.incisionPhotos ? [...seedMatch.incisionPhotos] : [];
          modified = true;
        }
      });
      if (modified) {
        saveDb(data);
      }
    }
    return data;
  } catch (err) {
    console.error('Error loading DB', err);
    return SEED_DATA;
  }
}

function saveDb(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving DB', err);
  }
}

function normalizePhone(phone) {
  return (phone || '').replace(/\D/g, '').slice(-10); // last 10 digits
}

// ── dataService public API ─────────────────────────────────────────────────────
export const dataService = {

  // ── Reset to seed data ──────────────────────────────────────────────────────
  resetToDefault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  },

  // ── DOCTOR APIs ─────────────────────────────────────────────────────────────

  // Find doctor by phone. Returns null if not found.
  findDoctorByPhone(phone) {
    const db = loadDb();
    const cleaned = normalizePhone(phone);
    return db.doctors.find((d) => normalizePhone(d.phone) === cleaned) || null;
  },

  // Find doctor by name (case-insensitive partial match fallback)
  findDoctorByName(name) {
    const db = loadDb();
    const lower = (name || '').trim().toLowerCase();
    return db.doctors.find((d) => d.name.toLowerCase() === lower) || null;
  },

  // Find or create doctor based on name + phone (dynamic registration)
  findOrCreateDoctor(name, phone) {
    const db = loadDb();
    const cleaned = normalizePhone(phone);

    // Exact phone match
    let doc = db.doctors.find((d) => normalizePhone(d.phone) === cleaned);
    if (doc) {
      // Update name if different
      if (doc.name.toLowerCase() !== name.trim().toLowerCase()) {
        doc.name = name.trim();
        saveDb(db);
      }
      return doc;
    }

    // Create new doctor profile
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      title: 'MD - Cardiothoracic Physician',
      hospital: 'General Hospital',
      specialty: 'Cardiac Surgery & Post-Operative Care',
      license: `MD-${Math.floor(100000 + Math.random() * 900000)}`,
      email: '',
      createdAt: new Date().toISOString()
    };

    db.doctors.push(newDoc);
    saveDb(db);
    return newDoc;
  },

  getDoctorById(doctorId) {
    const db = loadDb();
    return db.doctors.find((d) => d.id === doctorId) || null;
  },

  // Get all doctors (for browsing/admin views)
  getAllDoctors() {
    const db = loadDb();
    return db.doctors;
  },

  // Update doctor profile fields
  updateDoctorProfile(doctorId, updates) {
    const db = loadDb();
    const idx = db.doctors.findIndex((d) => d.id === doctorId);
    if (idx === -1) return null;
    db.doctors[idx] = { ...db.doctors[idx], ...updates };
    saveDb(db);
    return db.doctors[idx];
  },

  // Get only the patients assigned to a specific doctor
  getDoctorPatients(doctorId) {
    const db = loadDb();
    return db.patients.filter((p) => p.doctorId === doctorId);
  },

  // ── PATIENT APIs ────────────────────────────────────────────────────────────

  // Find patient by phone
  findPatientByPhone(phone) {
    const db = loadDb();
    const cleaned = normalizePhone(phone);
    return db.patients.find((p) => normalizePhone(p.phone) === cleaned) || null;
  },

  // Find or create patient based on name + phone (dynamic registration)
  findOrCreatePatient(name, phone) {
    const db = loadDb();
    const cleaned = normalizePhone(phone);

    // Exact phone match
    let patient = db.patients.find((p) => normalizePhone(p.phone) === cleaned);
    if (patient) {
      if (patient.name.toLowerCase() !== name.trim().toLowerCase()) {
        patient.name = name.trim();
        saveDb(db);
      }
      return patient;
    }

    // Create new patient profile
    const newPatient = {
      id: `pat_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      doctorId: null, // patient must link to a doctor from their profile page
      dob: '',
      age: '',
      gender: '',
      bloodGroup: '',
      surgeryType: '',
      surgeryDate: '',
      postOpDay: 0,
      hospital: '',
      emergencyContact: { name: '', relation: '', phone: '' },
      allergies: [],
      medications: [],
      medicalHistory: '',
      nextFollowUp: '',
      followUpMode: '',
      createdAt: new Date().toISOString(),
      vitalsHistory: [],
      scansAndReports: [],
      reviews: [],
      incisionPhotos: []
    };

    db.patients.push(newPatient);
    saveDb(db);
    return newPatient;
  },

  getPatientById(id) {
    const db = loadDb();
    return db.patients.find((p) => p.id === id) || null;
  },

  // Link patient to a doctor by name + specialty keyword
  linkPatientToDoctorByNameAndSpecialty(patientId, doctorName, specialtyKeyword) {
    const db = loadDb();
    const patientIdx = db.patients.findIndex((p) => p.id === patientId);
    if (patientIdx === -1) return { error: 'Patient not found' };

    const nameLower = (doctorName || '').trim().toLowerCase();
    const specLower = (specialtyKeyword || '').trim().toLowerCase();

    if (!nameLower) return { error: 'Please enter the doctor\'s name.' };

    const doctor = db.doctors.find((d) => {
      const nameMatch = d.name.toLowerCase().includes(nameLower);
      const specMatch = !specLower || d.specialty.toLowerCase().includes(specLower) || d.title.toLowerCase().includes(specLower);
      return nameMatch && specMatch;
    });

    if (!doctor) {
      return {
        error: `No doctor found matching "${doctorName}"${specLower ? ` / "${specialtyKeyword}"` : ''}. Check the name or specialty and try again.`
      };
    }

    db.patients[patientIdx].doctorId = doctor.id;
    saveDb(db);
    return { success: true, doctor };
  },

  // Legacy: Link patient to a doctor by phone (kept for internal use)
  linkPatientToDoctor(patientId, doctorPhone) {
    const db = loadDb();
    const patientIdx = db.patients.findIndex((p) => p.id === patientId);
    if (patientIdx === -1) return { error: 'Patient not found' };
    const cleaned = normalizePhone(doctorPhone);
    const doctor = db.doctors.find((d) => normalizePhone(d.phone) === cleaned);
    if (!doctor) return { error: 'No doctor found with that phone number.' };
    db.patients[patientIdx].doctorId = doctor.id;
    saveDb(db);
    return { success: true, doctor };
  },

  // ── VITALS ──────────────────────────────────────────────────────────────────

  addVitalEntry(patientId, { systolic, diastolic, heartRate, weight, notes, date }) {
    const db = loadDb();
    const idx = db.patients.findIndex((p) => p.id === patientId);
    if (idx === -1) return null;

    const newVital = {
      id: `v_${Date.now()}`,
      date: date || new Date().toISOString(),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      weight: Number(weight),
      notes: notes || 'Daily routine measurement'
    };

    const history = [newVital, ...(db.patients[idx].vitalsHistory || [])];
    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    db.patients[idx].vitalsHistory = history;
    saveDb(db);
    return newVital;
  },

  // ── REPORTS / SCANS ─────────────────────────────────────────────────────────

  addReport(patientId, { title, category, fileType, previewUrl, summary, rawFile }) {
    const db = loadDb();
    const idx = db.patients.findIndex((p) => p.id === patientId);
    if (idx === -1) return null;

    const newReport = {
      id: `rep_${Date.now()}`,
      title: title || 'Medical Document',
      category: category || 'General Report',
      date: new Date().toISOString().split('T')[0],
      fileType: fileType || 'image',
      previewUrl: previewUrl || '',
      summary: summary || 'Uploaded for clinical review.',
      fileName: rawFile?.name || `${title}.${fileType === 'pdf' ? 'pdf' : 'jpg'}`
    };

    if (!db.patients[idx].scansAndReports) db.patients[idx].scansAndReports = [];
    db.patients[idx].scansAndReports.unshift(newReport);
    saveDb(db);
    return newReport;
  },

  // ── DOCTOR REVIEWS & FOLLOW-UPS ─────────────────────────────────────────────

  saveDoctorReview(patientId, { doctorId, doctorName, notes, prescriptionNotes, followUpDate, followUpMode }) {
    const db = loadDb();
    const idx = db.patients.findIndex((p) => p.id === patientId);
    if (idx === -1) return null;

    const newReview = {
      id: `rev_${Date.now()}`,
      date: new Date().toISOString(),
      doctorId: doctorId || '',
      doctorName: doctorName || 'Attending Physician',
      notes: notes || '',
      prescriptionNotes: prescriptionNotes || '',
      followUpDate: followUpDate || ''
    };

    if (!db.patients[idx].reviews) db.patients[idx].reviews = [];
    db.patients[idx].reviews.unshift(newReview);

    if (followUpDate) db.patients[idx].nextFollowUp = followUpDate;
    if (followUpMode) db.patients[idx].followUpMode = followUpMode;

    saveDb(db);
    return newReview;
  },

  // ── PATIENT PROFILE UPDATE ─────────────────────────────────────────────────

  updatePatientProfile(patientId, profileUpdates) {
    const db = loadDb();
    const idx = db.patients.findIndex((p) => p.id === patientId);
    if (idx === -1) return null;

    db.patients[idx] = {
      ...db.patients[idx],
      ...profileUpdates,
      emergencyContact: {
        ...db.patients[idx].emergencyContact,
        ...(profileUpdates.emergencyContact || {})
      }
    };

    saveDb(db);
    return db.patients[idx];
  },

  // ── ALL PATIENTS API ────────────────────────────────────────────────────────
  getAllPatients() {
    const db = loadDb();
    return db.patients || [];
  },

  // ── SESSIONS & REAL-TIME AUDIT ──────────────────────────────────────────────
  loadSessions() {
    try {
      const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(SEED_SESSIONS));
        return SEED_SESSIONS;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error loading sessions', err);
      return SEED_SESSIONS;
    }
  },

  saveSessions(sessions) {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
      console.error('Error saving sessions', err);
    }
  },

  recordSessionLogin({ userId, name, role, phone, device, browser, ip, title, hospital }) {
    const sessions = this.loadSessions();
    const now = new Date().toISOString();

    const existingIndex = sessions.findIndex((s) => s.userId === userId && s.status === 'active');
    let session;

    if (existingIndex !== -1) {
      sessions[existingIndex].lastHeartbeat = now;
      sessions[existingIndex].loginAt = now;
      if (device) sessions[existingIndex].device = device;
      if (browser) sessions[existingIndex].browser = browser;
      if (ip) sessions[existingIndex].ip = ip;
      session = sessions[existingIndex];
    } else {
      session = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        name,
        role,
        phone: phone || '',
        title: title || (role === 'doctor' ? 'Cardiothoracic Physician' : (role === 'admin' ? 'System Administrator' : 'Patient')),
        hospital: hospital || 'Metropolitan Heart & Vascular Institute',
        status: 'active',
        loginAt: now,
        lastHeartbeat: now,
        ip: ip || '192.168.1.' + Math.floor(100 + Math.random() * 100),
        device: device || (typeof navigator !== 'undefined' && navigator.userAgent?.includes('Mobile') ? 'Mobile Phone' : 'Desktop Workstation'),
        browser: browser || (typeof navigator !== 'undefined' && navigator.userAgent?.includes('Chrome') ? 'Chrome' : 'Secure Web')
      };
      sessions.unshift(session);
    }

    this.saveSessions(sessions);
    return session;
  },

  recordSessionLogout(userId) {
    if (!userId) return;
    const sessions = this.loadSessions();
    const now = new Date().toISOString();
    let updated = false;

    sessions.forEach((s) => {
      if (s.userId === userId && s.status === 'active') {
        s.status = 'logged_out';
        s.logoutAt = now;
        s.lastHeartbeat = now;
        updated = true;
      }
    });

    if (updated) this.saveSessions(sessions);
  },

  updateSessionHeartbeat(userId) {
    if (!userId) return;
    const sessions = this.loadSessions();
    const active = sessions.find((s) => s.userId === userId && s.status === 'active');
    if (active) {
      active.lastHeartbeat = new Date().toISOString();
      this.saveSessions(sessions);
    }
  },

  getActiveSessions() {
    const sessions = this.loadSessions();
    return sessions.filter((s) => s.status === 'active');
  },

  getAllSessions() {
    return this.loadSessions();
  },

  terminateSession(sessionId) {
    const sessions = this.loadSessions();
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      target.status = 'terminated';
      target.terminatedAt = new Date().toISOString();
      target.terminatedBy = 'System Admin';
      this.saveSessions(sessions);
      return { success: true, session: target };
    }
    return { error: 'Session not found' };
  },

  isSessionTerminated(userId) {
    if (!userId) return false;
    const sessions = this.loadSessions();
    return sessions.some((s) => s.userId === userId && s.status === 'terminated');
  },

  getAdminStats() {
    const db = loadDb();
    const sessions = this.loadSessions();
    const active = sessions.filter((s) => s.status === 'active');
    return {
      activeDoctors: active.filter((s) => s.role === 'doctor').length,
      activePatients: active.filter((s) => s.role === 'patient').length,
      totalDoctors: db.doctors?.length || 0,
      totalPatients: db.patients?.length || 0,
      linkedPatients: db.patients?.filter((p) => !!p.doctorId).length || 0,
      totalIncisionUploads: db.patients?.reduce((acc, p) => acc + (p.incisionPhotos?.length || 0), 0) || 0
    };
  },

  // ── SURGICAL INCISION / WOUND SITE PHOTOS ───────────────────────────────────
  addIncisionPhoto(patientId, { location, imageUrl, redness, swelling, drainage, painLevel, fever, patientNotes, postOpDay }) {
    const db = loadDb();
    const idx = db.patients.findIndex((p) => p.id === patientId);
    if (idx === -1) return null;

    const newPhoto = {
      id: `inc_${Date.now()}`,
      date: new Date().toISOString(),
      postOpDay: postOpDay || db.patients[idx].postOpDay || 0,
      location: location || 'Median Sternotomy (Chest)',
      imageUrl,
      redness: redness || 'None / Normal Margin',
      swelling: swelling || 'None',
      drainage: drainage || 'None (Clean & Dry)',
      painLevel: Number(painLevel) || 0,
      fever: fever || 'No',
      patientNotes: patientNotes || '',
      doctorReviewed: false,
      doctorFeedback: ''
    };

    if (!db.patients[idx].incisionPhotos) {
      db.patients[idx].incisionPhotos = [];
    }
    db.patients[idx].incisionPhotos.unshift(newPhoto);
    saveDb(db);
    return newPhoto;
  },

  getIncisionPhotos(patientId) {
    const db = loadDb();
    const patient = db.patients.find((p) => p.id === patientId);
    return patient?.incisionPhotos || [];
  },

  addDoctorIncisionFeedback(patientId, incisionId, feedback) {
    const db = loadDb();
    const pIdx = db.patients.findIndex((p) => p.id === patientId);
    if (pIdx === -1) return null;

    const incIdx = (db.patients[pIdx].incisionPhotos || []).findIndex((i) => i.id === incisionId);
    if (incIdx === -1) return null;

    db.patients[pIdx].incisionPhotos[incIdx].doctorReviewed = true;
    db.patients[pIdx].incisionPhotos[incIdx].doctorFeedback = feedback;
    db.patients[pIdx].incisionPhotos[incIdx].reviewedAt = new Date().toISOString();
    saveDb(db);
    return db.patients[pIdx].incisionPhotos[incIdx];
  }
};
