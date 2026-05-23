<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
import { Video, RefreshCw, Maximize2, ShieldAlert, Activity, Eye, Play, Square } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { Video, RefreshCw, Maximize2, ShieldAlert, Eye } from 'lucide-react';
>>>>>>> mrf

export default function CctvFootagePage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCam, setSelectedCam] = useState(null);
  const [nightVision, setNightVision] = useState(true);
<<<<<<< HEAD
  const [noiseIntensity, setNoiseIntensity] = useState(1);
=======
>>>>>>> mrf
  
  // Coordinates for simulated personnel tracking on CAM 02 (Room Locator)
  const [trackerPos, setTrackerPos] = useState({ x: 0.35, y: 0.65 });
  const [trackerLabel, setTrackerLabel] = useState('Near CNC-4');

<<<<<<< HEAD
=======
  // Mobile camera live feed state
  const [mobileFrame, setMobileFrame] = useState(null);
  const [isMobileOffline, setIsMobileOffline] = useState(true);

  // Poll for the latest mobile security camera frame
  useEffect(() => {
    const fetchLatestFrame = async () => {
      try {
        const response = await fetch('/api/camera/latest?device_id=mobile-cam-01');
        if (response.ok) {
          const data = await response.json();
          setMobileFrame(data);
          
          // Check if the frame was updated within the last 15 seconds
          const frameTime = new Date(data.timestamp);
          const diffSeconds = (new Date() - frameTime) / 1000;
          setIsMobileOffline(diffSeconds > 15);
        } else {
          setIsMobileOffline(true);
        }
      } catch (err) {
        // Keep silent to avoid console noise during developer setups
        setIsMobileOffline(true);
      }
    };

    // Initial fetch
    fetchLatestFrame();

    // Poll every 2 seconds
    const interval = setInterval(fetchLatestFrame, 2000);
    return () => clearInterval(interval);
  }, []);

>>>>>>> mrf
  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate tracker movement on CAM 02 (representing the room locator app output)
  useEffect(() => {
    const moveTimer = setInterval(() => {
      const xOffset = (Math.random() - 0.5) * 0.15;
      const yOffset = (Math.random() - 0.5) * 0.15;
      setTrackerPos(prev => {
        const nextX = Math.max(0.15, Math.min(0.85, prev.x + xOffset));
        const nextY = Math.max(0.15, Math.min(0.85, prev.y + yOffset));
        
        // Dynamic labels based on area
        let label = 'Centre of Room';
        if (nextX < 0.4 && nextY < 0.4) label = 'Near Window';
        else if (nextX > 0.6 && nextY < 0.4) label = 'Near Doorway';
        else if (nextX < 0.4 && nextY > 0.6) label = 'Storage Racks';
        else if (nextX > 0.6 && nextY > 0.6) label = 'Near CNC-4';
        
        setTrackerLabel(label);
        return { x: nextX, y: nextY };
      });
    }, 3000);
    return () => clearInterval(moveTimer);
  }, []);

<<<<<<< HEAD


=======
>>>>>>> mrf
  const formatDate = (date) => {
    return date.toISOString().slice(0, 10);
  };

  const formatTime = (date) => {
    return date.toTimeString().split(' ')[0];
  };

  const cameras = [
    { id: 1, name: 'CAM 01 // ZONE A-1 (CNC ASSEMBLY)', status: 'ACTIVE', fps: 30, activity: 'HIGH', videoUrl: '/videos/generate_a_realistic_k_video.mp4' },
    { id: 2, name: 'CAM 02 // GEOFENCED TRACKING (ROOM LOCATOR)', status: 'ACTIVE', fps: 15, activity: 'LOCATING', videoUrl: '/videos/make_another_one_but_the_room.mp4' },
    { id: 3, name: 'CAM 03 // ZONE C-2 (MAIN STORAGE)', status: 'ACTIVE', fps: 24, activity: 'LOW', videoUrl: '/videos/make_another_room_of_enginnere.mp4' },
    { id: 4, name: 'CAM 04 // ZONE B-1 (INSPECTION CELL)', status: 'ACTIVE', fps: 30, activity: 'HIGH', videoUrl: '/videos/mp_.mp4' },
<<<<<<< HEAD
=======
    { 
      id: 5, 
      name: 'CAM 05 // MOBILE SECURITY (LIVE PHONE FEED)', 
      status: isMobileOffline ? 'OFFLINE' : 'ACTIVE', 
      fps: isMobileOffline ? 0 : 15, 
      activity: isMobileOffline ? 'STANDBY' : (mobileFrame?.activityScore > 65 ? 'HIGH' : 'DETECTING'),
      isMobile: true
    }
>>>>>>> mrf
  ];

  return (
    <div className="flex flex-col gap-6 h-full p-4 lg:p-6 overflow-y-auto w-full select-none text-[#cac5cc]">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Video className="w-5 h-5 text-[#9cd2b8]" />
            CCTV Security Surveillance Feed
          </h2>
          <p className="text-xs text-[#cac5cc]/60 mt-0.5">Real-time localized security feeds and position telemetry</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Night Vision Switch */}
          <button
            onClick={() => setNightVision(!nightVision)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
              nightVision
                ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400'
                : 'bg-neutral-950/20 border-neutral-800 text-neutral-400'
            }`}
          >
            NIGHT VISION: {nightVision ? 'ON (MONO)' : 'OFF (COLOR)'}
          </button>
<<<<<<< HEAD

          {/* Trigger manual refresh */}
          <button
            onClick={() => {
              // Telemetry refresh indicator simulation
            }}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
            title="Refresh Feed Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
=======
>>>>>>> mrf
        </div>
      </div>

      {/* Main CCTV Feed Grid */}
      <div className={`grid grid-cols-1 ${selectedCam ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-6`}>
        {cameras
          .filter(cam => selectedCam === null || selectedCam === cam.id)
          .map(cam => (
            <div
              key={cam.id}
              className={`relative border rounded-2xl bg-[#080809] overflow-hidden flex flex-col justify-between ${
                cam.fps === 0 ? 'border-red-950/40' : 'border-[#9cd2b8]/20'
              } shadow-lg transition-all duration-300`}
              style={{ minHeight: selectedCam ? '550px' : '280px' }}
            >
              {/* Scanlines Effect */}
              {cam.fps > 0 && (
                <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.07] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />
              )}

<<<<<<< HEAD


=======
>>>>>>> mrf
              {/* Night Vision Tint filter */}
              <div 
                className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
                  cam.fps === 0 
                    ? 'bg-red-950/10' 
                    : (nightVision ? 'bg-emerald-950/10' : 'bg-transparent')
                }`} 
              />

              {/* Feed Header info (floating) */}
              <div className="absolute top-3 inset-x-3 flex items-start justify-between z-20 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10 flex flex-col gap-0.5">
                  <span className="text-[10px] font-mono font-bold text-white leading-none">
                    {cam.name}
                  </span>
                  <span className="text-[8px] font-mono text-[#cac5cc]/50">
                    FPS: {cam.fps} // LATENCY: {cam.fps > 0 ? '42ms' : '--'}
                  </span>
                </div>

                <div className="flex gap-2">
                  {cam.fps > 0 ? (
                    <div className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      <span className="text-[9px] font-mono font-bold text-red-500">REC</span>
                    </div>
                  ) : (
                    <div className="bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded border border-red-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
                      <span className="text-[9px] font-mono text-neutral-500">STANDBY</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulated Camera Video content */}
              <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black min-h-[180px]">
<<<<<<< HEAD
                {cam.fps > 0 && (
=======
                {cam.fps > 0 && !cam.isMobile && (
>>>>>>> mrf
                  <video
                    src={cam.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
                  />
                )}

<<<<<<< HEAD
                {cam.fps === 0 ? (
                  <div className="flex flex-col items-center gap-2 z-10">
                    <ShieldAlert className="w-10 h-10 text-red-500/80 animate-pulse" />
                    <span className="font-mono text-xs font-semibold text-red-400">STANDBY // STANDDOWN</span>
                    <span className="text-[10px] text-neutral-500 font-mono">feed deactivated by administrator</span>
                  </div>
                ) : cam.id === 2 ? (
                  /* Camera 2: Live Room Locator position tracking representation */
                  <div className="w-full h-full absolute inset-0 relative p-4 flex flex-col justify-between z-10 bg-transparent">
=======
                {cam.isMobile && !isMobileOffline && mobileFrame?.image && (
                  <img
                    src={mobileFrame.image}
                    alt="Mobile security live feed"
                    className="absolute inset-0 w-full h-full object-cover opacity-75 z-0"
                  />
                )}

                {cam.fps === 0 ? (
                  <div className="flex flex-col items-center gap-2 z-10 text-center px-4">
                    <ShieldAlert className="w-10 h-10 text-red-500/80 animate-pulse" />
                    <span className="font-mono text-xs font-semibold text-red-400">
                      {cam.isMobile ? 'STANDBY // NO MOBILE STREAM' : 'STANDBY // STANDDOWN'}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {cam.isMobile 
                        ? 'Launch the Expo smart security camera app on your phone to transmit live footage'
                        : 'feed deactivated by administrator'}
                    </span>
                  </div>
                ) : cam.isMobile && !isMobileOffline && mobileFrame ? (
                  /* Camera 5: Mobile Phone Camera Feed Overlays */
                  <div className="w-full h-full absolute inset-0 p-4 flex flex-col justify-between z-10 bg-transparent">
                    {/* Simulated Camera Scan HUD overlay */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/5" />
                      ))}
                    </div>

                    {/* HUD corners */}
                    <div className="absolute top-2 left-3 text-[8px] font-mono text-cyan-400 bg-black/45 px-1 rounded z-10">[STREAMING_OK]</div>
                    <div className="absolute top-2 right-3 text-[8px] font-mono text-cyan-400 bg-black/45 px-1 rounded z-10">[CAM_05_MOBILE]</div>

                    {/* Detection analytics overlay at bottom */}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 font-mono text-[10px] bg-black/85 px-3 py-2 rounded-xl border border-[#9cd2b8]/20 backdrop-blur-sm pointer-events-none z-10">
                      <div className="flex justify-between items-center">
                        <span className="text-[#9cd2b8] font-bold animate-pulse">● DETECTING WORKER ACTIVITY</span>
                        <span className="text-white text-[9px]">LUMINANCE_VARIANCE_MOTION</span>
                      </div>
                      
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-500" 
                          style={{ width: `${mobileFrame.activityScore}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-[#cac5cc]/80 mt-0.5">
                        <span>Workers Detected: <strong className="text-white text-xs">{mobileFrame.workerCount}</strong></span>
                        <span>Activity level: <strong className="text-cyan-300">{mobileFrame.activityScore.toFixed(0)}%</strong></span>
                      </div>
                    </div>
                  </div>
                ) : cam.id === 2 ? (
                  /* Camera 2: Live Room Locator position tracking representation */
                  <div className="w-full h-full absolute inset-0 p-4 flex flex-col justify-between z-10 bg-transparent">
>>>>>>> mrf
                    {/* Corner labels */}
                    <div className="absolute top-2 left-3 text-[8px] font-mono text-white/50 bg-black/45 px-1 rounded z-10">[0.0, 0.0]</div>
                    <div className="absolute top-2 right-3 text-[8px] font-mono text-white/50 bg-black/45 px-1 rounded z-10">[1.0, 0.0]</div>
                    <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/50 bg-black/45 px-1 rounded z-10">[0.0, 1.0]</div>
                    <div className="absolute bottom-2 right-3 text-[8px] font-mono text-white/50 bg-black/45 px-1 rounded z-10">[1.0, 1.0]</div>
                    
                    {/* Simulated 4x4 grid */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-30">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="border border-white/10" />
                      ))}
                    </div>

                    {/* Room Grid Radar line sweeps */}
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500/20 top-0 animate-[bounce_4s_infinite]" />

                    {/* Active Tracking Dot */}
                    <div
                      className="absolute w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center -ml-2 -mt-2 shadow-[0_0_15px_#22d3ee] transition-all duration-1000 z-20"
                      style={{
                        left: `${trackerPos.x * 100}%`,
                        top: `${trackerPos.y * 100}%`,
                      }}
                    >
                      <span className="absolute w-8 h-8 rounded-full border border-cyan-400/40 animate-ping" />
                    </div>

                    {/* Tracker overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] font-mono bg-black/75 px-2 py-1 rounded border border-white/10 backdrop-blur-sm pointer-events-none z-10">
                      <span className="text-[#9cd2b8] animate-pulse">● FEED TRACKING</span>
                      <span className="text-white">{trackerLabel.toUpperCase()} ({trackerPos.x.toFixed(2)}, {trackerPos.y.toFixed(2)})</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Feed Footer details */}
              <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between z-20">
                <div className="flex items-center gap-2 font-mono text-[9px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${cam.fps > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-white/70">
                    {formatDate(currentTime)} {formatTime(currentTime)}
                  </span>
                </div>

                <div className="flex gap-2">
                  {selectedCam === cam.id ? (
                    <button
                      onClick={() => setSelectedCam(null)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-[10px] font-mono cursor-pointer transition-all"
                    >
                      MINIMIZE FEED
                    </button>
                  ) : (
                    cam.fps > 0 && (
                      <button
                        onClick={() => setSelectedCam(cam.id)}
                        className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/15 text-white cursor-pointer transition-all"
                        title="Focus Camera Feed"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* CCTV Alerts / Activity Log panel */}
      {selectedCam === null && (
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Surveillance Incidents Log</h3>
            </div>
            <span className="text-[9px] font-mono text-[#9cd2b8]">SYNCED WITH SECURITY CORE</span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-[11px]">
<<<<<<< HEAD
=======
            {!isMobileOffline && mobileFrame && (
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex justify-between items-center text-xs animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">[CAM 05 LIVE]</span>
                  <span className="text-white/90">
                    Smart security camera streaming online. Detected {mobileFrame.workerCount} workers active with {mobileFrame.activityScore.toFixed(0)}% activity level.
                  </span>
                </div>
                <span className="text-[#9cd2b8] text-[10px]">STREAMING_ON</span>
              </div>
            )}

>>>>>>> mrf
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#9cd2b8]">[18:42:15]</span>
                <span className="text-white/80">CAM 02 detected operator position shift to window area.</span>
              </div>
              <span className="text-cyan-400 text-[10px]">TELEMETRY_OK</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">[18:35:42]</span>
                <span className="text-white/80">CAM 01 temporary compression artifacts resolved automatically.</span>
              </div>
              <span className="text-yellow-500 text-[10px]">RESOLVED</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#9cd2b8]">[18:15:00]</span>
                <span className="text-white/80">CAM 04 connection established. Direct cell footage streaming online.</span>
              </div>
              <span className="text-[#9cd2b8] text-[10px]">ACTIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
