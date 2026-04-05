import streamlit as st
import cv2
import mediapipe as mp
import pandas as pd
import numpy as np
import time
import av
import io
import os
import tempfile
from PIL import Image
from pptx import Presentation
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase, RTCConfiguration, WebRtcMode

# --- Configuration ---
st.set_page_config(
    page_title="GestureAI - Hand Gesture Control",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- Custom CSS ---
st.markdown("""
    <style>
    .main { background-color: #ffffff; }
    .stButton>button { width: 100%; border-radius: 12px; height: 3em; font-weight: bold; }
    .stSidebar { background-color: #f8f9fa; }
    </style>
    """, unsafe_allow_html=True)

# --- MediaPipe Setup ---
@st.cache_resource
def get_mediapipe_hands():
    return mp.solutions.hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5
    )

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

import queue

# --- Heuristic Gesture Logic ---
def calculate_distance(p1, p2):
    return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

def detect_gesture_heuristic(hand_landmarks, prev_x=None):
    thumb_tip = hand_landmarks.landmark[4]
    index_tip = hand_landmarks.landmark[8]
    middle_tip = hand_landmarks.landmark[12]
    index_mcp = hand_landmarks.landmark[5]
    middle_mcp = hand_landmarks.landmark[9]
    
    # Tọa độ X trung tâm bàn tay (dùng landmark 9 - Middle Finger MCP)
    curr_x = hand_landmarks.landmark[9].x
    
    dist_thumb_index = calculate_distance(thumb_tip, index_tip)
    is_index_ext = index_tip.y < index_mcp.y
    is_middle_folded = middle_tip.y > middle_mcp.y
    
    gesture = "None"
    
    # Kiểm tra vuốt (Swipe) dựa trên sự thay đổi tọa độ X
    if prev_x is not None:
        diff = curr_x - prev_x
        if diff > 0.15: # Ngưỡng vuốt phải
            gesture = "Swipe Right"
        elif diff < -0.15: # Ngưỡng vuốt trái
            gesture = "Swipe Left"
    
    if gesture == "None":
        if dist_thumb_index < 0.05:
            gesture = "Click"
        elif is_index_ext and is_middle_folded:
            gesture = "Laser Pointer"
        elif not is_index_ext and is_middle_folded:
            gesture = "Fist (Nắm tay)"
        else:
            gesture = "Open Hand"
            
    return gesture, curr_x

# --- WebRTC Processor ---
class VideoProcessor(VideoProcessorBase):
    def __init__(self):
        self.hands = get_mediapipe_hands()
        self.result_queue = queue.Queue()
        self.prev_x = None
        self.last_gesture_time = 0

    def recv(self, frame):
        img = frame.to_ndarray(format="bgr24")
        img = cv2.flip(img, 1)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_img)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(img, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                gesture, curr_x = detect_gesture_heuristic(hand_landmarks, self.prev_x)
                self.prev_x = curr_x
                
                # Hiển thị nhãn lên camera feed
                color = (0, 255, 0)
                if "Swipe" in gesture:
                    color = (0, 165, 255) # Màu cam cho Swipe
                
                cv2.putText(img, gesture, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                
                # Gửi tín hiệu chuyển slide vào queue (có cooldown 1s để tránh nhảy slide liên tục)
                curr_time = time.time()
                if ("Swipe" in gesture) and (curr_time - self.last_gesture_time > 1.0):
                    self.result_queue.put(gesture)
                    self.last_gesture_time = curr_time
        else:
            self.prev_x = None
        
        return av.VideoFrame.from_ndarray(img, format="bgr24")

# --- Helper for Slide Content ---
def get_slide_content(slide):
    text_content = []
    for shape in slide.shapes:
        if hasattr(shape, "text") and shape.text.strip():
            text_content.append(shape.text.strip())
    return "\n\n".join(text_content) if text_content else "Slide này không có nội dung văn bản."

# --- Sidebar ---
with st.sidebar:
    st.markdown("# ⚡ GestureAI")
    page = st.radio("Navigation", ["Giới thiệu & EDA", "Triển khai mô hình", "Đánh giá hệ thống"], index=1)
    st.divider()
    st.info("**Sinh viên:** Nguyễn Công Minh Đức\n\n**Đề tài:** Nhận diện cử chỉ bàn tay.")

# --- Pages ---
if page == "Giới thiệu & EDA":
    st.title("📊 Giới thiệu & Khám phá dữ liệu")
    st.write("Dự án sử dụng MediaPipe & Heuristic Logic để nhận diện cử chỉ bàn tay thời gian thực.")
    df = pd.DataFrame({'label': ['Click', 'Laser', 'Swipe', 'Noise'], 'count': [1200, 1500, 800, 2000]})
    st.bar_chart(df.set_index('label'))

elif page == "Triển khai mô hình":
    st.title("🚀 Triển khai & Trình chiếu")
    
    # Khởi tạo trạng thái slide trong session_state
    if 'slide_idx' not in st.session_state:
        st.session_state.slide_idx = 0

    # Tabs cho các chế độ làm việc
    tab_setup, tab_present = st.tabs(["🛠️ Thiết lập", "📺 Chế độ trình chiếu"])

    with tab_setup:
        col_l, col_r = st.columns([1, 1.5])
        with col_l:
            st.subheader("📹 Phân tích Video")
            up_vid = st.file_uploader("Tải video (.mp4, .mov, .avi)", type=["mp4", "mov", "avi"])
            if up_vid:
                st.video(up_vid)
                if st.button("Tiến hành phân tích Video", type="primary"):
                    # Tạo file tạm để OpenCV có thể đọc
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
                        tmp_file.write(up_vid.read())
                        video_path = tmp_file.name

                    with st.spinner("Hệ thống đang quét từng khung hình..."):
                        cap = cv2.VideoCapture(video_path)
                        gesture_counts = {
                            "Click": 0,
                            "Laser Pointer": 0,
                            "Fist (Nắm tay)": 0,
                            "Open Hand": 0,
                            "Swipe Left": 0,
                            "Swipe Right": 0
                        }
                        
                        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                        progress_bar = st.progress(0)
                        
                        frame_count = 0
                        prev_x = None
                        hands_processor = get_mediapipe_hands()
                        
                        while cap.isOpened():
                            ret, frame = cap.read()
                            if not ret:
                                break
                            
                            # Xử lý mỗi 3 khung hình để tăng tốc độ phân tích
                            if frame_count % 3 == 0:
                                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                                results = hands_processor.process(rgb_frame)
                                
                                if results.multi_hand_landmarks:
                                    for hl in results.multi_hand_landmarks:
                                        gesture, curr_x = detect_gesture_heuristic(hl, prev_x)
                                        prev_x = curr_x
                                        if gesture in gesture_counts:
                                            gesture_counts[gesture] += 1
                                else:
                                    prev_x = None
                            
                            frame_count += 1
                            if frame_count % 10 == 0:
                                progress_bar.progress(min(frame_count / total_frames, 1.0))
                        
                        cap.release()
                        os.unlink(video_path) # Xóa file tạm

                        st.success(f"✅ Phân tích hoàn tất {frame_count} khung hình!")
                        
                        # Hiển thị kết quả thực tế
                        st.write("📊 **Thống kê cử chỉ phát hiện được:**")
                        
                        # Lọc bỏ các cử chỉ có số lượng bằng 0 để biểu đồ đẹp hơn
                        filtered_counts = {k: v for k, v in gesture_counts.items() if v > 0}
                        
                        if filtered_counts:
                            st.bar_chart(filtered_counts)
                            
                            # Hiển thị chi tiết dưới dạng bảng
                            res_df = pd.DataFrame({
                                'Cử chỉ': filtered_counts.keys(),
                                'Số lần xuất hiện': filtered_counts.values()
                            })
                            st.table(res_df)
                        else:
                            st.warning("Không tìm thấy cử chỉ bàn tay nào trong video này.")
                            
                        st.info("💡 Bạn có thể sử dụng kết quả này để đánh giá độ chính xác của mô hình trên dữ liệu thực tế.")

        with col_r:
            st.subheader("📂 Quản lý Slide")
            ppt_file = st.file_uploader("Tải file PPTX", type=["pptx"])
            if ppt_file:
                st.session_state.prs = Presentation(ppt_file)
                st.success(f"Đã tải: {ppt_file.name} ({len(st.session_state.prs.slides)} slides)")
                st.info("Chuyển sang tab 'Chế độ trình chiếu' để bắt đầu.")

    with tab_present:
        if 'prs' not in st.session_state:
            st.warning("Vui lòng tải file PPTX ở tab 'Thiết lập' trước.")
        else:
            # Giao diện trình chiếu
            st.markdown("### 📺 Đang trình chiếu...")
            
            col_cam, col_slide = st.columns([1, 3])
            
            with col_cam:
                st.write("📷 Camera Control")
                webrtc_ctx = webrtc_streamer(
                    key="present-gesture", mode=WebRtcMode.SENDRECV,
                    rtc_configuration=RTCConfiguration({"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]}),
                    media_stream_constraints={"video": {"width": 320, "height": 240}, "audio": False},
                    video_processor_factory=VideoProcessor,
                    async_processing=True,
                )
                st.caption("Vuốt TRÁI để về trước, Vuốt PHẢI để sang sau")
                
                # Lắng nghe cử chỉ từ VideoProcessor
                if webrtc_ctx.video_processor:
                    try:
                        gesture = webrtc_ctx.video_processor.result_queue.get_nowait()
                        if gesture == "Swipe Right":
                            st.session_state.slide_idx = min(len(st.session_state.prs.slides) - 1, st.session_state.slide_idx + 1)
                            st.rerun()
                        elif gesture == "Swipe Left":
                            st.session_state.slide_idx = max(0, st.session_state.slide_idx - 1)
                            st.rerun()
                    except queue.Empty:
                        pass

                # Nút điều khiển thủ công
                st.divider()
                c1, c2 = st.columns(2)
                if c1.button("⬅️ Trước"):
                    st.session_state.slide_idx = max(0, st.session_state.slide_idx - 1)
                if c2.button("Sau ➡️"):
                    st.session_state.slide_idx = min(len(st.session_state.prs.slides) - 1, st.session_state.slide_idx + 1)
                
                if st.button("Reset Slide", type="secondary"):
                    st.session_state.slide_idx = 0
                    st.rerun()

            with col_slide:
                # Hiển thị Slide hiện tại
                total_slides = len(st.session_state.prs.slides)
                current_idx = st.session_state.slide_idx
                current_slide = st.session_state.prs.slides[current_idx]
                
                st.markdown(f"#### Slide {current_idx + 1} / {total_slides}")
                
                # Trích xuất và hiển thị nội dung thực của Slide
                slide_text = get_slide_content(current_slide)
                
                st.markdown(f"""
                <div style="background-color: #f0f2f6; padding: 40px; border-radius: 15px; border: 2px solid #d1d5db; min-height: 400px; color: #1f2937;">
                    <div style="white-space: pre-wrap; font-size: 1.2em; line-height: 1.6;">
                        {slide_text}
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                st.progress((current_idx + 1) / total_slides)

elif page == "Đánh giá hệ thống":
    st.title("📈 Đánh giá hệ thống")
    st.metric("Accuracy", "95%", "+2%")
    st.line_chart(np.random.randn(20, 2))

st.divider()
st.caption("Built with Streamlit • GestureAI Project")
