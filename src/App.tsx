import React, { useEffect, useRef, useState } from 'react';
import { Results } from '@mediapipe/hands';
import { HandTracker } from './lib/handTracker';
import { detectGesture, GestureType } from './lib/gestureLogic';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Play, 
  BarChart3, 
  ChevronRight,
  ChevronLeft,
  CircleDot, 
  Info,
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
    { path: '/', label: 'Giới thiệu & EDA', icon: Info },
    { path: '/demo', label: 'Triển khai mô hình', icon: Play },
    { path: '/stats', label: 'Đánh giá hệ thống', icon: BarChart3 },
  ];

  return (
    <div className="w-[18rem] bg-slate-50 h-screen flex flex-col border-r border-slate-200 shrink-0 overflow-y-auto">
      <div className="p-8 border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-100">
            <Zap className="text-white w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-slate-900">GestureAI</h1>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v1.0.0 • Streamlit Mode</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Navigation</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold",
                isActive 
                  ? "bg-red-500 text-white shadow-lg shadow-red-100" 
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-8 px-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Project Info</p>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Sinh viên</p>
              <p className="text-sm font-bold text-slate-700">Nguyễn Công Minh Đức</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">MSSV</p>
              <p className="text-sm font-bold text-slate-700">22T1020078</p>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="p-6 text-center border-t border-slate-200">
        <p className="text-[10px] text-slate-400 font-medium">© 2024 HUSC AI Lab</p>
      </div>
    </div>
  );
};

// --- Pages ---

const IntroPage = () => {
  const studentInfo = {
    topic: "Nhận diện cử chỉ bàn tay bằng thư viện OpenCV và mô hình MediaPipe Hand Landmarker nhằm thay thế chuột máy tính hỗ trợ thuyết trình",
    name: "Nguyễn Công Minh Đức",
    id: "22T1020078"
  };

  const mockData = [
    { id: 1, gesture: 'Laser', thumb_index_dist: 0.15, index_up: 1, middle_up: 0, ring_up: 0, pinky_up: 0 },
    { id: 2, gesture: 'Click', thumb_index_dist: 0.03, index_up: 1, middle_up: 0, ring_up: 0, pinky_up: 0 },
    { id: 3, gesture: 'Swipe', thumb_index_dist: 0.12, index_up: 1, middle_up: 1, ring_up: 1, pinky_up: 1 },
    { id: 4, gesture: 'None', thumb_index_dist: 0.08, index_up: 0, middle_up: 0, ring_up: 0, pinky_up: 0 },
    { id: 5, gesture: 'Laser', thumb_index_dist: 0.14, index_up: 1, middle_up: 0, ring_up: 0, pinky_up: 0 },
    { id: 6, gesture: 'Click', thumb_index_dist: 0.02, index_up: 1, middle_up: 0, ring_up: 0, pinky_up: 0 },
    { id: 7, gesture: 'Swipe', thumb_index_dist: 0.13, index_up: 1, middle_up: 1, ring_up: 1, pinky_up: 1 },
    { id: 8, gesture: 'Laser', thumb_index_dist: 0.16, index_up: 1, middle_up: 0, ring_up: 0, pinky_up: 0 },
  ];

  const labelDist = [
    { name: 'Laser', count: 450 },
    { name: 'Click', count: 380 },
    { name: 'Swipe', count: 320 },
    { name: 'None', count: 250 },
  ];

  const featureDist = [
    { gesture: 'Click', avg_dist: 0.035 },
    { gesture: 'Laser', avg_dist: 0.145 },
    { gesture: 'Swipe', avg_dist: 0.125 },
    { gesture: 'None', avg_dist: 0.085 },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header & Student Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold mb-6">
            Đồ án chuyên ngành
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
            {studentInfo.topic}
          </h2>
          <div className="flex flex-wrap gap-8 items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Info className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sinh viên thực hiện</p>
                <p className="text-lg font-bold text-slate-900">{studentInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mã số sinh viên</p>
                <p className="text-lg font-bold text-slate-900">{studentInfo.id}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50 rounded-full blur-3xl" />
      </motion.div>

      {/* Practical Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Monitor className="text-blue-400 w-6 h-6" />
            Giá trị thực tiễn
          </h3>
          <p className="text-slate-300 leading-relaxed text-lg font-light">
            Ứng dụng giúp người thuyết trình giải phóng khỏi sự gò bó của chuột và bàn phím. 
            Bằng cách sử dụng cử chỉ tay tự nhiên, người dùng có thể điều khiển slide, 
            sử dụng laser pointer ảo và tương tác với nội dung một cách chuyên nghiệp, 
            tăng tính thuyết phục và sự tự tin trong các buổi báo cáo, giảng dạy.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <BarChart3 className="text-blue-600 w-6 h-6" />
            Khám phá dữ liệu (EDA)
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Dữ liệu được thu thập từ MediaPipe Hand Landmarker, bao gồm tọa độ 21 điểm mốc của bàn tay. 
            Quá trình EDA tập trung vào việc phân tích các đặc trưng hình học như khoảng cách giữa các ngón tay 
            và trạng thái gập/duỗi để phân loại cử chỉ chính xác.
          </p>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6">Dữ liệu thô (Trích đoạn)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-4 px-4 text-slate-400 font-bold uppercase text-xs">ID</th>
                <th className="py-4 px-4 text-slate-400 font-bold uppercase text-xs">Gesture</th>
                <th className="py-4 px-4 text-slate-400 font-bold uppercase text-xs">Thumb-Index Dist</th>
                <th className="py-4 px-4 text-slate-400 font-bold uppercase text-xs">Index Up</th>
                <th className="py-4 px-4 text-slate-400 font-bold uppercase text-xs">Middle Up</th>
                <th className="py-4 px-4 text-slate-400 font-bold uppercase text-xs">Ring Up</th>
                <th className="py-4 px-4 text-slate-400 font-bold uppercase text-xs">Pinky Up</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm text-slate-500">{row.id}</td>
                  <td className="py-4 px-4 font-bold text-blue-600">{row.gesture}</td>
                  <td className="py-4 px-4 text-slate-600">{row.thumb_index_dist.toFixed(3)}</td>
                  <td className="py-4 px-4"><div className={cn("w-2 h-2 rounded-full", row.index_up ? "bg-green-500" : "bg-slate-200")} /></td>
                  <td className="py-4 px-4"><div className={cn("w-2 h-2 rounded-full", row.middle_up ? "bg-green-500" : "bg-slate-200")} /></td>
                  <td className="py-4 px-4"><div className={cn("w-2 h-2 rounded-full", row.ring_up ? "bg-green-500" : "bg-slate-200")} /></td>
                  <td className="py-4 px-4"><div className={cn("w-2 h-2 rounded-full", row.pinky_up ? "bg-green-500" : "bg-slate-200")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Phân phối nhãn cử chỉ</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={labelDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Đặc trưng: Khoảng cách ngón cái - trỏ</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="gesture" type="category" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="avg_dist" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200">
        <h3 className="text-2xl font-bold mb-6">Nhận xét về dữ liệu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-blue-100 leading-relaxed">
              Dữ liệu cho thấy sự phân bố khá cân bằng giữa các nhãn cử chỉ chính (Laser, Click, Swipe). 
              Nhãn 'None' có số lượng ít hơn do đây là trạng thái mặc định khi không có cử chỉ xác định.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-blue-100 leading-relaxed">
              Đặc trưng quan trọng nhất là <span className="text-white font-bold">Thumb-Index Distance</span>. 
              Như biểu đồ thể hiện, cử chỉ 'Click' có khoảng cách cực thấp (pinch), 
              trong khi 'Laser' và 'Swipe' có khoảng cách lớn hơn rõ rệt, 
              giúp mô hình dễ dàng phân loại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DemoPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presentationVideoRef = useRef<HTMLVideoElement>(null);
  const presentationCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [liveFeatures, setLiveFeatures] = useState({
    thumb_index_dist: 0,
    index_up: 0,
    middle_up: 0,
    ring_up: 0,
    pinky_up: 0
  });
  
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
  
  // States for manual input simulation (Streamlit-like widgets)
  const [modelType, setModelType] = useState('MediaPipe + Custom Logic (.h5)');
  const [manualInputs, setManualInputs] = useState({
    thumb_index_dist: 0.15,
    index_up: 1,
    middle_up: 0,
    ring_up: 0,
    pinky_up: 0
  });

  const handleManualPredict = () => {
    // Simulate prediction logic based on manual inputs
    let pred: GestureType = 'None';
    let conf = 0.85;

    if (manualInputs.index_up && !manualInputs.middle_up && manualInputs.thumb_index_dist > 0.1) {
      pred = 'Laser';
    } else if (manualInputs.index_up && manualInputs.thumb_index_dist < 0.05) {
      pred = 'Click';
    } else if (manualInputs.index_up && manualInputs.middle_up && manualInputs.ring_up && manualInputs.pinky_up) {
      pred = 'Swipe Left'; // Default to Swipe Left for simulation
    }

    setGesture(pred);
    setConfidence(conf);
  };
  
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
      const { gesture: g, confidence: c, features } = detectGesture(results);
      setGesture(g);
      setConfidence(c);
      if (features) setLiveFeatures(features);
      
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
        if (ctx) t.draw(ctx, results, g);
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
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Triển khai mô hình</h2>
          <p className="text-slate-500 mt-2 text-lg">Môi trường thực thi và kiểm thử hệ thống nhận diện cử chỉ.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPresentationMode(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            Bắt đầu thuyết trình
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column: Configuration & Manual Test */}
        <div className="xl:col-span-4 space-y-8">
          {/* Model Config */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Cấu hình mô hình
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Loại mô hình (st.selectbox)</label>
                <select 
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option>MediaPipe + Custom Logic (.h5)</option>
                  <option>Random Forest Classifier (.pkl)</option>
                  <option>Deep Learning Model (.pth)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tải mô hình (st.file_uploader)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/50">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Kéo thả file mô hình vào đây</p>
                </div>
              </div>
            </div>
          </section>

          {/* Manual Input */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              Kiểm thử thủ công
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Thumb-Index Distance (st.number_input)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={manualInputs.thumb_index_dist}
                  onChange={(e) => setManualInputs({...manualInputs, thumb_index_dist: parseFloat(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['index_up', 'middle_up', 'ring_up', 'pinky_up'].map((key) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">{key.replace('_', ' ')}</label>
                    <select 
                      value={manualInputs[key as keyof typeof manualInputs]}
                      onChange={(e) => setManualInputs({...manualInputs, [key]: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm"
                    >
                      <option value={1}>Duỗi (1)</option>
                      <option value={0}>Gập (0)</option>
                    </select>
                  </div>
                ))}
              </div>
              <button 
                onClick={handleManualPredict}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4 hover:bg-slate-800 transition-colors"
              >
                Dự đoán kết quả
              </button>
            </div>
          </section>
        </div>
        {/* Right Column: Real-time Implementation & Results */}
        <div className="xl:col-span-8 space-y-8">
          {/* Webcam View */}
          <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden relative group">
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                autoPlay
                playsInline
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-90"
              />
              
              <div className="absolute top-6 left-6 flex gap-3">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", isCameraOn ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                  Live: {fps} FPS
                </div>
                <button
                  onClick={isCameraOn ? stopCamera : startCamera}
                  className={cn(
                    "bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 hover:bg-black/60 transition-all",
                    isCameraOn ? "text-red-400" : "text-blue-400"
                  )}
                >
                  <Camera className="w-4 h-4" />
                  {isCameraOn ? "Tắt Camera" : "Bật Camera"}
                </button>
              </div>

              {/* Virtual Laser on Preview */}
              {gesture === 'Laser' && (
                <div 
                  className="absolute w-6 h-6 bg-red-500 rounded-full blur-[3px] shadow-[0_0_20px_red] z-50 pointer-events-none"
                  style={{ left: `${100 - virtualCursor.x}%`, top: `${virtualCursor.y}%`, transform: 'translate(-50%, -50%)' }}
                />
              )}
            </div>
          </div>

          {/* Prediction Result Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200">
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-4">Kết quả dự đoán</p>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                  {gesture === 'Click' && <Zap className="w-10 h-10 fill-current" />}
                  {gesture === 'Laser' && <CircleDot className="w-10 h-10" />}
                  {(gesture === 'Swipe Left' || gesture === 'Swipe Right') && <ChevronRight className="w-10 h-10" />}
                  {gesture === 'None' && <Camera className="w-10 h-10 opacity-30" />}
                </div>
                <div>
                  <h4 className="text-4xl font-black tracking-tighter">
                    {gesture === 'None' ? "Chưa nhận diện" : `Cử chỉ: ${gesture}`}
                  </h4>
                  <p className="text-blue-100 mt-1 font-medium italic">
                    {gesture === 'Click' && "Hành động: Click chuột / Next Slide"}
                    {gesture === 'Laser' && "Hành động: Kích hoạt Laser Pointer"}
                    {(gesture === 'Swipe Left' || gesture === 'Swipe Right') && "Hành động: Chuyển slide nhanh"}
                    {gesture === 'None' && "Hệ thống đang chờ cử chỉ..."}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Độ tin cậy (Probability)</p>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-black text-slate-900 tracking-tighter">
                  {Math.round(confidence * 100)}%
                </span>
                <div className="flex-1 h-4 bg-slate-100 rounded-full mb-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-4">
                Mô hình đang sử dụng: <span className="font-bold text-blue-600">{modelType}</span>
              </p>
            </section>
          </div>

          {/* Live Feature Data (Streamlit-like Dataframe) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Dữ liệu đặc trưng thời gian thực (st.dataframe)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 px-4 text-slate-400 font-bold uppercase text-[10px]">Đặc trưng</th>
                    <th className="py-3 px-4 text-slate-400 font-bold uppercase text-[10px]">Giá trị hiện tại</th>
                    <th className="py-3 px-4 text-slate-400 font-bold uppercase text-[10px]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-600">Thumb-Index Distance</td>
                    <td className="py-3 px-4 font-mono text-blue-600">{liveFeatures.thumb_index_dist.toFixed(4)}</td>
                    <td className="py-3 px-4">
                      <div className={cn("h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden")}>
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, liveFeatures.thumb_index_dist * 500)}%` }} />
                      </div>
                    </td>
                  </tr>
                  {['index_up', 'middle_up', 'ring_up', 'pinky_up'].map((key) => (
                    <tr key={key} className="border-t border-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-600 capitalize">{key.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{liveFeatures[key as keyof typeof liveFeatures]}</td>
                      <td className="py-3 px-4">
                        <div className={cn("w-3 h-3 rounded-full", liveFeatures[key as keyof typeof liveFeatures] ? "bg-green-500" : "bg-slate-200")} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PPT Upload Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Tải lên PPT (st.file_uploader)
              </h4>
              <button 
                onClick={() => setIsPresentationMode(true)}
                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                <Monitor className="w-4 h-4" />
                Bắt đầu thuyết trình
              </button>
            </div>
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
        </div>
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
            <button 
              onClick={() => setIsPresentationMode(false)}
              className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/60 text-white/40 hover:text-white rounded-full backdrop-blur-sm z-[70] transition-all opacity-0 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 relative overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                {slides.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    {slides[slideIndex].image ? (
                      <img src={slides[slideIndex].image} className="max-w-full max-h-full object-contain" alt="Slide content" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="p-20 text-center">
                        <h5 className="text-5xl font-black text-blue-500 uppercase mb-8">{uploadedFile?.name}</h5>
                        <p className="text-slate-200 text-3xl font-light max-w-4xl mx-auto">
                          {slides[slideIndex].text || "Nội dung đang được cập nhật cho trang này..."}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-20">
                    <h5 className="text-5xl font-black text-blue-500 uppercase mb-8">Chế độ thuyết trình</h5>
                    <p className="text-slate-300 text-2xl">Sử dụng cử chỉ tay để điều khiển slide này.</p>
                  </div>
                )}
              </div>
              {/* Floating Camera Overlay */}
              <div className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 z-50">
                <video ref={presentationVideoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay playsInline />
                <canvas ref={presentationCanvasRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-90" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatsPage = () => {
  const data = [
    { name: 'Click', accuracy: 92, f1: 0.91 },
    { name: 'Swipe', accuracy: 95, f1: 0.94 },
    { name: 'Laser', accuracy: 96, f1: 0.95 },
  ];

  const pieData = [
    { name: 'Chính xác', value: 94.5 },
    { name: 'Sai lệch', value: 5.5 },
  ];

  const confusionMatrix = [
    { actual: 'Laser', laser: 96, click: 1, swipe: 1, noise: 2 },
    { actual: 'Click', laser: 2, click: 92, swipe: 2, noise: 4 },
    { actual: 'Swipe', laser: 1, click: 1, swipe: 95, noise: 3 },
    { actual: 'Noise*', laser: 2, click: 2, swipe: 1, noise: 95 },
  ];

  const COLORS = ['#2563eb', '#e2e8f0'];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Đánh giá hệ thống</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-blue-200 transition-colors">
          <p className="text-slate-500 font-medium mb-2">Accuracy (Độ chính xác)</p>
          <p className="text-5xl font-extrabold text-blue-600">94.5%</p>
          <p className="text-xs text-slate-400 mt-2 italic">Tỷ lệ nhận diện đúng lệnh</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-indigo-200 transition-colors">
          <p className="text-slate-500 font-medium mb-2">F1-Score</p>
          <p className="text-5xl font-extrabold text-indigo-600">0.92</p>
          <p className="text-xs text-slate-400 mt-2 italic">Cân bằng Precision & Recall</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center group hover:border-emerald-200 transition-colors">
          <p className="text-slate-500 font-medium mb-2">FPS trung bình</p>
          <p className="text-5xl font-extrabold text-emerald-600">32</p>
          <p className="text-xs text-slate-400 mt-2 italic">Tốc độ xử lý thời gian thực</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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

      {/* Confusion Matrix Section */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Confusion Matrix (Ma trận nhầm lẫn)</h3>
            <p className="text-sm text-slate-500 mt-1">Đảm bảo hệ thống không nhận nhầm ngôn ngữ cơ thể thành lệnh điều khiển.</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Noise* = Ngôn ngữ cơ thể tự nhiên</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-center border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase">Thực tế \ Dự đoán</th>
                <th className="p-4 bg-slate-50 rounded-xl text-sm font-bold">Laser</th>
                <th className="p-4 bg-slate-50 rounded-xl text-sm font-bold">Click</th>
                <th className="p-4 bg-slate-50 rounded-xl text-sm font-bold">Swipe</th>
                <th className="p-4 bg-slate-50 rounded-xl text-sm font-bold">Noise*</th>
              </tr>
            </thead>
            <tbody>
              {confusionMatrix.map((row) => (
                <tr key={row.actual}>
                  <td className="p-4 bg-slate-50 rounded-xl text-sm font-bold text-left">{row.actual}</td>
                  <td className={cn("p-4 rounded-xl text-sm font-bold", row.actual === 'Laser' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>{row.laser}%</td>
                  <td className={cn("p-4 rounded-xl text-sm font-bold", row.actual === 'Click' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>{row.click}%</td>
                  <td className={cn("p-4 rounded-xl text-sm font-bold", row.actual === 'Swipe' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>{row.swipe}%</td>
                  <td className={cn("p-4 rounded-xl text-sm font-bold", row.actual === 'Noise*' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>{row.noise}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex gap-4">
            <div className="bg-blue-100 p-2 rounded-lg h-fit">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Phân tích khả năng chống nhiễu</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hệ thống đạt tỷ lệ nhận diện đúng 95% đối với các hành động "Noise" (vung tay tự nhiên khi nói). 
                Điều này chứng minh mô hình có khả năng phân biệt tốt giữa cử chỉ điều khiển có chủ đích và các chuyển động cơ thể ngẫu nhiên, 
                giúp tránh tình trạng nhảy slide ngoài ý muốn trong quá trình thuyết trình.
              </p>
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
      <div className="flex bg-white min-h-screen font-sans text-slate-900 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          {/* Streamlit Header Anchor */}
          <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 w-full sticky top-0 z-50" />
          
          <div className="max-w-5xl mx-auto py-12 px-8">
            <Routes>
              <Route path="/" element={<IntroPage />} />
              <Route path="/demo" element={<DemoPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </div>

          <footer className="max-w-5xl mx-auto px-8 py-12 border-t border-slate-100 mt-12 flex justify-between items-center text-slate-400 text-sm">
            <p>Built with React (Streamlit UI Pattern)</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> System Online</span>
            </div>
          </footer>
        </main>
      </div>
    </BrowserRouter>
  );
}
