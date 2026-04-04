import React, { useEffect, useRef, useState } from 'react';
import { Results } from '@mediapipe/hands';
import { HandTracker } from './lib/handTracker';
import { detectGesture, GestureType } from './lib/gestureLogic';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Play, 
  BarChart3, 
  MoveHorizontal, 
  CircleDot, 
  Info,
  ChevronRight,
  ChevronLeft,
  Camera,
  Zap,
  ExternalLink,
  Settings,
  Upload,
  Link as LinkIcon,
  Monitor,
  Minimize,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from './lib/utils';
import JSZip from 'jszip';

// --- Types ---

interface SlideData {
  id: number;
  image?: string;
  text?: string;
}

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Giới thiệu', icon: Info },
    { path: '/demo', label: 'Triển khai', icon: Play },
    { path: '/stats', label: 'Đánh giá', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <CircleDot className="w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">GestureAI</h1>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-2xl p-4">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Trạng thái</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Hệ thống sẵn sàng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Pages ---

const IntroPage = () => {
  const features = [
    { title: "Laser Pointer", desc: "Sử dụng ngón trỏ để điều khiển điểm laser ảo trực tiếp trên màn hình.", icon: CircleDot },
    { title: "Click / Next Slide", desc: "Chụm ngón cái và ngón trỏ để thực hiện thao tác click hoặc chuyển trang.", icon: Zap },
    { title: "Thuyết trình", desc: "Vuốt tay trái/phải để chuyển slide PowerPoint mượt mà và chuyên nghiệp.", icon: MoveHorizontal },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">GestureAI Presentation Control</h2>
        <p className="text-xl text-slate-600 max-w-3xl">
          Giải pháp điều khiển máy tính không chạm, hỗ trợ thuyết trình chuyên nghiệp bằng trí tuệ nhân tạo.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <f.icon className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-slate-600">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2rem] p-10 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4">Tại sao chọn GestureAI?</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Zap className="text-yellow-400 w-5 h-5 mt-1 shrink-0" />
              <span>Độ trễ cực thấp (&lt;30ms) nhờ tối ưu hóa trên trình duyệt.</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="text-yellow-400 w-5 h-5 mt-1 shrink-0" />
              <span>Không cần phần cứng chuyên dụng, chỉ cần webcam thông thường.</span>
            </li>
            <li className="flex items-start gap-3">
              <Zap className="text-yellow-400 w-5 h-5 mt-1 shrink-0" />
              <span>Chạy mượt mà trên CPU, không yêu cầu GPU mạnh.</span>
            </li>
          </ul>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

const DemoPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presentationVideoRef = useRef<HTMLVideoElement>(null);
  const presentationCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [tracker, setTracker] = useState<HandTracker | null>(null);
  const [gesture, setGesture] = useState<GestureType>('None');
  const [confidence, setConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [virtualCursor, setVirtualCursor] = useState({ x: 0, y: 0 });
  const [laserPoints, setLaserPoints] = useState<{x: number, y: number}[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [presentationUrl, setPresentationUrl] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const isPresentationModeRef = useRef(false);
  const slidesRef = useRef<SlideData[]>([]);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  
  useEffect(() => {
    isPresentationModeRef.current = isPresentationMode;
  }, [isPresentationMode]);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastClickTimeRef = useRef(0);
  const lastSwipeTimeRef = useRef(0);
  
  const lastTimeRef = useRef(performance.now());

  const extractSlides = async (file: File) => {
    setIsParsing(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
      const mediaFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/media/'));
      
      const extractedSlides: SlideData[] = [];
      
      // Sort slides by number
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0]);
        const numB = parseInt(b.match(/\d+/)![0]);
        return numA - numB;
      });

      for (let i = 0; i < slideFiles.length; i++) {
        const slideXml = await zip.file(slideFiles[i])?.async('string');
        // Simple regex to extract text from slide XML
        const textMatches = slideXml?.match(/<a:t>(.*?)<\/a:t>/g);
        const slideText = textMatches?.map(m => m.replace(/<a:t>|<\/a:t>/g, '')).join(' ') || '';
        
        // Try to find a corresponding image if any (simplified)
        // In a real app, we'd parse .rels files, but here we just take images in order or by ID
        let slideImage = '';
        const imageFile = mediaFiles[i]; // Fallback: one image per slide
        if (imageFile) {
          const blob = await zip.file(imageFile)?.async('blob');
          if (blob) slideImage = URL.createObjectURL(blob);
        }

        extractedSlides.push({
          id: i + 1,
          text: slideText,
          image: slideImage
        });
      }
      
      setSlides(extractedSlides);
    } catch (error) {
      console.error("Error parsing PPTX:", error);
      alert("Lỗi khi đọc tệp PPTX. Vui lòng thử lại.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith('.ppt') || file.name.endsWith('.pptx'))) {
      setUploadedFile(file);
      setPresentationUrl(''); // Clear embed URL if file is uploaded
      setSlideIndex(0);
      if (file.name.endsWith('.pptx')) {
        await extractSlides(file);
      } else {
        setSlides([]); // Reset for .ppt (not supported for parsing)
      }
    } else if (file) {
      alert("Vui lòng chọn tệp định dạng .ppt hoặc .pptx");
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const t = new HandTracker();
    t.setCallback((results) => {
      const { gesture: g, confidence: c } = detectGesture(results);
      setGesture(g);
      setConfidence(c);
      
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const indexTip = results.multiHandLandmarks[0][8];
        setVirtualCursor({ x: indexTip.x * 100, y: indexTip.y * 100 });
        
        if (g === 'Laser') {
          setLaserPoints(prev => [...prev.slice(-20), { x: indexTip.x * 100, y: indexTip.y * 100 }]);
        } else {
          setLaserPoints([]);
        }

        const now = Date.now();

        // Handle Click Action (Advance Slide)
        if (g === 'Click' && c > 0.9) {
          if (now - lastClickTimeRef.current > 1000) { // 1 second debounce
            const currentSlides = slidesRef.current;
            const maxSlides = currentSlides.length > 0 ? currentSlides.length : 5;
            setSlideIndex(prev => (prev + 1) % maxSlides);
            lastClickTimeRef.current = now;
          }
        }

        // Handle Swipe Actions
        if ((g === 'Swipe Left' || g === 'Swipe Right') && c > 0.8) {
          if (now - lastSwipeTimeRef.current > 1500) { // 1.5s debounce for swipes
            const currentSlides = slidesRef.current;
            const maxSlides = currentSlides.length > 0 ? currentSlides.length : 5;
            if (g === 'Swipe Left') setSlideIndex(prev => Math.min(maxSlides - 1, prev + 1));
            if (g === 'Swipe Right') setSlideIndex(prev => Math.max(0, prev - 1));
            lastSwipeTimeRef.current = now;
          }
        }
      }

      const activeCanvas = isPresentationModeRef.current ? presentationCanvasRef.current : canvasRef.current;
      if (activeCanvas) {
        const ctx = activeCanvas.getContext('2d');
        if (ctx) t.draw(ctx, results);
      }

      const now = performance.now();
      setFps(Math.round(1000 / (now - lastTimeRef.current)));
      lastTimeRef.current = now;
    });
    setTracker(t);

    return () => {
      t.close();
    };
  }, []); // Initialize once

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    let animationFrame: number;
    const process = async () => {
      if (!isMountedRef.current) return;
      
      const activeVideo = isPresentationModeRef.current ? presentationVideoRef.current : videoRef.current;
      if (isCameraOn && activeVideo && tracker) {
        await tracker.send(activeVideo);
      }
      
      if (isMountedRef.current) {
        animationFrame = requestAnimationFrame(process);
      }
    };
    process();
    return () => cancelAnimationFrame(animationFrame);
  }, [isCameraOn, tracker]); // Removed isPresentationMode

  // Sync video stream when switching modes
  useEffect(() => {
    if (isCameraOn && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (isPresentationMode && presentationVideoRef.current) {
        presentationVideoRef.current.srcObject = stream;
      } else if (!isPresentationMode && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }
  }, [isPresentationMode, isCameraOn]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Triển khai Real-time</h2>
          <p className="text-slate-500">Bật camera để bắt đầu điều khiển bằng cử chỉ.</p>
        </div>
        <button
          onClick={isCameraOn ? stopCamera : startCamera}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all",
            isCameraOn 
              ? "bg-red-100 text-red-600 hover:bg-red-200" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
          )}
        >
          <Camera className="w-5 h-5" />
          {isCameraOn ? "Tắt Camera" : "Bật Camera"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white group">
            {!isCameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-100/50 backdrop-blur-sm z-10">
                <div className="bg-white p-6 rounded-full shadow-xl mb-4">
                  <Camera className="w-12 h-12 text-blue-600" />
                </div>
                <p className="font-bold text-lg text-slate-700">Camera đang tắt</p>
                <button 
                  onClick={startCamera}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
                >
                  Bật ngay
                </button>
              </div>
            )}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              autoPlay
              playsInline
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60"
            />
            
            {/* HUD Overlay */}
            <div className="absolute top-6 left-6 flex gap-3 z-20">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isCameraOn ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                <span className="text-white text-xs font-bold uppercase tracking-widest">{isCameraOn ? "Live" : "Offline"}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs font-bold uppercase tracking-widest">
                {fps} FPS
              </div>
            </div>

            {/* Virtual Cursor Overlay */}
            {isCameraOn && (
              <div 
                className={cn(
                  "absolute border-2 rounded-full pointer-events-none transition-all duration-75 z-50 flex items-center justify-center",
                  gesture === 'Click' 
                    ? "w-12 h-12 border-yellow-400 bg-yellow-400/40 scale-125" 
                    : "w-8 h-8 border-white bg-blue-500/50"
                )}
                style={{ left: `${100 - virtualCursor.x}%`, top: `${virtualCursor.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {gesture === 'Click' && <div className="w-3 h-3 bg-white rounded-full animate-ping" />}
                <div className={cn(
                  "absolute inset-0 rounded-full animate-ping",
                  gesture === 'Click' ? "bg-yellow-400/30" : "bg-white/30"
                )} />
              </div>
            )}

            {/* Laser Trail */}
            {laserPoints.map((p, i) => (
              <div 
                key={i}
                className="absolute w-3 h-3 bg-red-500 rounded-full pointer-events-none z-40 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                style={{ left: `${100 - p.x}%`, top: `${p.y}%`, opacity: i / laserPoints.length }}
              />
            ))}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-2xl">
                  <Monitor className="text-indigo-600 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Presentation Screen</h3>
                  <p className="text-slate-500 text-sm">Điều khiển slide bằng cử chỉ vuốt hoặc click.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPresentationMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                >
                  <Monitor className="w-4 h-4" />
                  Thuyết trình
                </button>
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100"
                >
                  <Settings className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl">
                  <button onClick={() => setSlideIndex(s => Math.max(0, s-1))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronLeft className="w-5 h-5" /></button>
                  <span className="font-bold px-4 text-slate-700">
                    {slideIndex + 1} / {slides.length > 0 ? slides.length : 5}
                  </span>
                  <button onClick={() => setSlideIndex(s => Math.min((slides.length > 0 ? slides.length - 1 : 4), s+1))} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden relative z-10"
                >
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Kết nối nguồn thuyết trình
                  </h4>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Dán link Canva hoặc Google Slides (Embed URL)..."
                      className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                    />
                    <button 
                      onClick={() => {
                        setPresentationUrl(tempUrl);
                        setIsSettingsOpen(false);
                      }}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
                    >
                      Kết nối
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    * Lưu ý: Hãy sử dụng link "Embed" để hiển thị tốt nhất.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="aspect-[16/9] bg-slate-900 rounded-[2rem] flex items-center justify-center text-white relative overflow-hidden shadow-2xl border border-slate-800 max-w-4xl mx-auto">
              {presentationUrl ? (
                <iframe 
                  src={presentationUrl}
                  className="w-full h-full border-none"
                  allowFullScreen
                />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={uploadedFile ? uploadedFile.name + slideIndex : slideIndex}
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="text-center p-12 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950"
                  >
                    <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-blue-400 font-bold text-sm mb-6 border border-white/5">
                      {uploadedFile ? "FILE: " + uploadedFile.name.toUpperCase() : "PRESENTATION MODE"}
                    </div>
                    <h4 className="text-6xl font-black mb-6 tracking-tighter">
                      {uploadedFile ? `Trang ${slideIndex + 1}` : `Slide ${slideIndex + 1}`}
                    </h4>
                    <div className="w-full max-w-2xl bg-white/5 rounded-3xl p-8 border border-white/10 text-left mb-8 overflow-hidden">
                      {isParsing ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-blue-400 font-bold">Đang xử lý tệp PPTX...</p>
                        </div>
                      ) : slides.length > 0 ? (
                        <div className="space-y-4">
                          <h5 className="text-2xl font-bold text-blue-400">Nội dung tệp: {uploadedFile?.name}</h5>
                          {slides[slideIndex].image && (
                            <img src={slides[slideIndex].image} className="w-full h-48 object-contain rounded-xl bg-black/20 mb-4" alt="Slide preview" referrerPolicy="no-referrer" />
                          )}
                          <p className="text-slate-300 line-clamp-4 text-lg">
                            {slides[slideIndex].text || "Không tìm thấy nội dung văn bản cho trang này."}
                          </p>
                        </div>
                      ) : uploadedFile ? (
                        <div className="space-y-4">
                          <h5 className="text-2xl font-bold text-blue-400">Nội dung tệp: {uploadedFile.name}</h5>
                          <p className="text-slate-400 italic">Định dạng .ppt không hỗ trợ xem trước nội dung. Vui lòng sử dụng .pptx để có trải nghiệm tốt nhất.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h5 className="text-2xl font-bold text-blue-400">Hướng dẫn nhanh</h5>
                          <p className="text-slate-400 leading-relaxed">
                            {slideIndex === 0 && "Chào mừng bạn đến với GestureAI. Hãy thử vuốt tay để chuyển slide."}
                            {slideIndex === 1 && "Công nghệ nhận diện cử chỉ giúp bạn thuyết trình tự nhiên hơn."}
                            {slideIndex === 2 && "Bạn có thể dùng Laser Pointer để chỉ vào các điểm quan trọng."}
                            {slideIndex === 3 && "Hệ thống hỗ trợ cả Canva và Google Slides thông qua liên kết."}
                            {slideIndex === 4 && "Cảm ơn bạn đã theo dõi buổi thuyết trình này!"}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      {(slides.length > 0 ? slides : [0,1,2,3,4]).map((_, i) => (
                        <div key={i} className={cn("w-2 h-1.5 rounded-full transition-all duration-500", i === slideIndex ? "bg-blue-500 w-8" : "bg-white/10")} />
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
              
              {/* Virtual Laser on Slide */}
              {gesture === 'Laser' && (
                <div 
                  className="absolute w-6 h-6 bg-red-500 rounded-full blur-[3px] shadow-[0_0_20px_red] z-50 pointer-events-none"
                  style={{ left: `${100 - virtualCursor.x}%`, top: `${virtualCursor.y}%`, transform: 'translate(-50%, -50%)' }}
                />
              )}
            </div>

            {/* Presentation Mode Overlay */}
            <AnimatePresence>
              {isPresentationMode && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-slate-950 flex flex-col"
                >
                  {/* Minimal Exit Button - Auto-hide or very subtle */}
                  <button 
                    onClick={() => setIsPresentationMode(false)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/60 text-white/40 hover:text-white rounded-full backdrop-blur-sm z-[70] transition-all opacity-0 hover:opacity-100"
                    title="Thoát chế độ thuyết trình"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 relative overflow-hidden">
                    {presentationUrl ? (
                      <iframe 
                        src={presentationUrl}
                        className="w-full h-full border-none"
                        allowFullScreen
                      />
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={slideIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full flex flex-col items-center justify-center bg-black"
                        >
                          <div className="w-full h-full flex items-center justify-center relative">
                            <div className="w-full h-full flex items-center justify-center">
                            
                              {slides.length > 0 ? (
                                <div className="w-full h-full flex items-center justify-center p-0">
                                  {slides[slideIndex].image ? (
                                    <div className="w-full h-full flex items-center justify-center bg-black">
                                      <img src={slides[slideIndex].image} className="max-w-full max-h-full object-contain" alt="Slide content" referrerPolicy="no-referrer" />
                                    </div>
                                  ) : (
                                    <div className="p-20 space-y-8 flex flex-col justify-center items-center h-full bg-slate-950/50 backdrop-blur-3xl text-center w-full">
                                      <h5 className="text-5xl font-black text-blue-500 leading-tight tracking-tighter uppercase">{uploadedFile?.name}</h5>
                                      <p className="text-slate-200 text-3xl leading-relaxed font-light max-w-4xl">
                                        {slides[slideIndex].text || "Nội dung đang được cập nhật cho trang này..."}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-12 p-20 bg-gradient-to-br from-slate-950 to-blue-950">
                                  <h5 className="text-7xl font-black text-blue-500 tracking-tighter uppercase">GestureAI Presentation</h5>
                                  <p className="text-slate-300 text-4xl leading-relaxed font-light max-w-5xl text-center">
                                    {slideIndex === 0 && "Chào mừng bạn đến với GestureAI. Hệ thống điều khiển thuyết trình bằng cử chỉ tay tiên tiến nhất."}
                                    {slideIndex === 1 && "Công nghệ nhận diện cử chỉ mượt mà, độ trễ cực thấp giúp bạn tự tin hơn."}
                                    {slideIndex === 2 && "Laser Pointer ảo chuyên nghiệp, giúp bạn nhấn mạnh các thông tin quan trọng."}
                                    {slideIndex === 3 && "Hỗ trợ đa nền tảng thuyết trình từ Canva, Google Slides đến file PPT cá nhân."}
                                    {slideIndex === 4 && "Cảm ơn bạn đã theo dõi! Hãy bắt đầu trải nghiệm ngay hôm nay."}
                                  </p>
                                </div>
                              )}

                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}

                    {/* Floating Camera Overlay - Shrunk and Cleaned */}
                    <motion.div 
                      drag
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 z-50 cursor-move opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <video
                        ref={presentationVideoRef}
                        className="w-full h-full object-cover scale-x-[-1]"
                        autoPlay
                        playsInline
                      />
                      <canvas
                        ref={presentationCanvasRef}
                        width={640}
                        height={480}
                        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60"
                      />
                      <div className="absolute top-2 left-2">
                        <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 text-[8px] font-bold text-white uppercase tracking-widest">
                          {fps} FPS
                        </div>
                      </div>
                      {/* Virtual Cursor in Overlay */}
                      <div 
                        className={cn(
                          "absolute border-2 rounded-full pointer-events-none transition-all duration-75 z-50 flex items-center justify-center",
                          gesture === 'Click' ? "w-6 h-6 border-yellow-400 bg-yellow-400/40" : "w-4 h-4 border-white bg-blue-500/50"
                        )}
                        style={{ left: `${100 - virtualCursor.x}%`, top: `${virtualCursor.y}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    </motion.div>

                    {/* Laser on Full Screen */}
                    {gesture === 'Laser' && (
                      <div 
                        className="absolute w-8 h-8 bg-red-500 rounded-full blur-[4px] shadow-[0_0_30px_red] z-[60] pointer-events-none"
                        style={{ left: `${100 - virtualCursor.x}%`, top: `${virtualCursor.y}%`, transform: 'translate(-50%, -50%)' }}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl group hover:border-blue-200 transition-colors">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Cử chỉ hiện tại</p>
            <div className="flex items-center gap-6 mb-4">
              <motion.div 
                key={gesture}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg",
                  gesture === 'None' ? "bg-slate-100 text-slate-400" : "bg-blue-600 text-white shadow-blue-200"
                )}
              >
                {gesture === 'Click' && <Zap className="w-10 h-10 fill-current" />}
                {gesture === 'Laser' && <CircleDot className="w-10 h-10" />}
                {gesture === 'Swipe Left' && <ChevronRight className="w-10 h-10" />}
                {gesture === 'Swipe Right' && <ChevronLeft className="w-10 h-10" />}
                {gesture === 'None' && <Camera className="w-10 h-10 opacity-30" />}
              </motion.div>
              <div>
                <p className="text-3xl font-black text-slate-900">{gesture === 'None' ? "---" : gesture}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={cn("w-1.5 h-4 rounded-full", i <= Math.ceil(confidence * 5) ? "bg-blue-500" : "bg-slate-200")} />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-blue-600">{Math.round(confidence * 100)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Tải lên PPT
            </h4>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".ppt,.pptx" 
              onChange={handleFileUpload}
            />
            <div 
              onClick={triggerUpload}
              className={cn(
                "border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer group",
                uploadedFile ? "border-green-400 bg-green-50/50" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
              )}
            >
              <div className="bg-white w-12 h-12 rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                {uploadedFile ? (
                  <Monitor className="text-green-600 w-6 h-6" />
                ) : (
                  <Upload className="text-slate-400 group-hover:text-blue-600 w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-bold text-slate-700">
                {uploadedFile ? uploadedFile.name : "Kéo thả file PPT vào đây"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {uploadedFile ? "Nhấn để thay đổi tệp tin" : "Hoặc nhấn để chọn từ máy tính"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Hướng dẫn cử chỉ
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="bg-white/20 p-2 rounded-xl"><CircleDot className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">1 ngón trỏ: Laser Pointer</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="bg-white/20 p-2 rounded-xl"><Zap className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">Chụm ngón cái: Click / Next Slide</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="bg-white/20 p-2 rounded-xl"><MoveHorizontal className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">Vuốt tay: Chuyển slide nhanh</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsPage = () => {
  const data = [
    { name: 'Move', accuracy: 98, f1: 0.97 },
    { name: 'Click', accuracy: 92, f1: 0.91 },
    { name: 'Swipe', accuracy: 95, f1: 0.94 },
    { name: 'Laser', accuracy: 96, f1: 0.95 },
    { name: 'Pause', accuracy: 99, f1: 0.98 },
  ];

  const pieData = [
    { name: 'Chính xác', value: 94.5 },
    { name: 'Sai lệch', value: 5.5 },
  ];

  const COLORS = ['#2563eb', '#e2e8f0'];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Đánh giá hệ thống</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 font-medium mb-2">Độ chính xác trung bình</p>
          <p className="text-5xl font-extrabold text-blue-600">94.5%</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 font-medium mb-2">F1-Score</p>
          <p className="text-5xl font-extrabold text-indigo-600">0.92</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center">
          <p className="text-slate-500 font-medium mb-2">FPS trung bình</p>
          <p className="text-5xl font-extrabold text-emerald-600">32</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Độ chính xác theo cử chỉ</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="accuracy" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-bold mb-6 w-full">Tỷ lệ nhận diện đúng</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-sm font-medium text-slate-600">Chính xác (94.5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <span className="text-sm font-medium text-slate-600">Sai lệch (5.5%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
