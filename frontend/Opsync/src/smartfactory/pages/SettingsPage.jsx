import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Shield, RefreshCw, Key, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [sensitivity, setSensitivity] = useState(85);
  const [reportRate, setReportRate] = useState(15);
  const [autoTriage, setAutoTriage] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = () => {
    setSaveStatus('Saving settings configurations...');
    setTimeout(() => {
      setSaveStatus('All configurations updated inside localized cache storage.');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 h-full p-4 lg:p-6 overflow-y-auto max-w-[1000px] mx-auto w-full select-none">
      
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#9cd2b8]" />
          System Parameter Configurations
        </h2>
        <p className="text-xs text-[#cac5cc]/60 mt-0.5">Adjust diagnostic thresholds and physical safety geofences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        
        {/* Panel 1: Predictive sensitivity */}
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#9cd2b8]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Fault Diagnosis Scanners</h3>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {/* Slider 1 */}
            <div className="flex flex-col">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#cac5cc]">Anomaly Detection Sensitivity</span>
                <span className="font-mono font-bold text-white">{sensitivity}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-full accent-[#9cd2b8] h-1 bg-[#2b292b] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-[#cac5cc]/50 mt-1">Increasing threshold triggers quicker incident predictions.</span>
            </div>

            {/* Slider 2 */}
            <div className="flex flex-col mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#cac5cc]">Telemetry Poll Interval</span>
                <span className="font-mono font-bold text-white">{reportRate} seconds</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="60" 
                value={reportRate}
                onChange={(e) => setReportRate(Number(e.target.value))}
                className="w-full accent-[#9cd2b8] h-1 bg-[#2b292b] rounded-lg cursor-pointer"
              />
            </div>

            <div className="border-t border-white/5 my-1"></div>

            {/* Auto triage checkbox toggle */}
            <label className="flex items-center gap-3 cursor-pointer py-1">
              <input 
                type="checkbox" 
                checked={autoTriage} 
                onChange={(e) => setAutoTriage(e.target.checked)}
                className="accent-[#9cd2b8] w-4 h-4 rounded cursor-pointer"
              />
              <div className="flex flex-col text-xs text-[#cac5cc]">
                <span className="font-semibold text-white">Autonomous AI Defect Escalation</span>
                <span className="text-[10px] text-[#cac5cc]/60">Allow tickets to be generated automatically based on thermal breaches.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Panel 2: Biometrics authentication & integrations */}
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Biometric Credentials & Access</h3>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            
            {/* Toggle biometrics */}
            <label className="flex items-center gap-3 cursor-pointer py-1">
              <input 
                type="checkbox" 
                checked={biometrics} 
                onChange={(e) => setBiometrics(e.target.checked)}
                className="accent-cyan-400 w-4 h-4 rounded cursor-pointer"
              />
              <div className="flex flex-col text-xs text-[#cac5cc]">
                <span className="font-semibold text-white">Biometric Quick Clock-In</span>
                <span className="text-[10px] text-[#cac5cc]/60">Authenticate clock events via standard mobile biometric face-scan.</span>
              </div>
            </label>

            <div className="border-t border-white/5 my-1"></div>

            {/* Integrations state checks */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono text-[#cac5cc]/50 uppercase">Active Integrations Check</span>
              
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80">ERP SAP Connector</span>
                </div>
                <span className="font-mono text-emerald-400 text-[10px] font-bold">CONNECTED</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80">Google Workspace Sync</span>
                </div>
                <span className="font-mono text-emerald-400 text-[10px] font-bold">CONNECTED</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Save response alerts */}
      {saveStatus && (
        <div className="p-3 bg-cyan-950/20 border border-cyan-800/35 text-cyan-300 text-xs rounded-xl text-center select-none animate-fadeIn flex items-center justify-center gap-2 leading-relaxed">
          <CheckCircle className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Submit footer bar */}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          className="py-2.5 px-6 rounded-xl bg-[#9cd2b8] hover:bg-[#9cd2b8]/80 text-black text-xs font-bold cursor-pointer active:scale-95 transition-all shadow-xl"
        >
          Save Configuration Changes
        </button>
      </div>

    </div>
  );
}
