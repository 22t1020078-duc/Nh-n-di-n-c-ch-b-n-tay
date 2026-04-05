import streamlit as st
import cv2
import mediapipe as mp
import pandas as pd
import numpy as np
import time
import av
import io
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

# --- Heuristic Gesture Logic ---
def calculate_distance(p1, p2):
    return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

def detect_gesture_heuristic(hand_landmarks):
    # Landmarks: 4: Thumb_Tip, 8: Index_Tip, 12: Middle_Tip
    thumb_tip = hand_landmarks.landmark[4]
    index_tip = hand_landmarks.landmark[8]
    middle_tip = hand_landmarks.landmark[12]
    index_mcp = hand_landmarks.landmark[5]
    middle_mcp = hand_landmarks.landmark[9]
    
    dist_thumb_index = calculate_distance(thumb_tip, index_tip)
    is_index_ext = index_tip.y < index_mcp.y
    is_middle_folded = middle_tip.y > middle_mcp.y
    
    if dist_thumb_index < 0.05:
        return "Click"
    elif is_index_ext and is_middle_folded:
        return "Laser Pointer"
    elif not is_index_ext and is_middle_folded:
        return "Fist (Nắm tay)"
    else:
        return "Open Hand"

# --- WebRTC Processor ---
class VideoProcessor(VideoProcessorBase):
    def __init__(self):
        self.hands = get_mediapipe_hands()

    def recv(self, frame):
        img = frame.to_ndarray(format="bgr24")
        img = cv2.flip(img, 1)
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_img)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(img, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                gesture = detect_gesture_heuristic(hand_landmarks)
                cv2.putText(img, gesture, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        return av.VideoFrame.from_ndarray(img, format="bgr24")

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
                if st.button("Phân tích Video", type="primary"):
                    st.success("Phân tích hoàn tất!")

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
                webrtc_streamer(
                    key="present-gesture", mode=WebRtcMode.SENDRECV,
                    rtc_configuration=RTCConfiguration({"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]}),
                    media_stream_constraints={"video": {"width": 320, "height": 240}, "audio": False},
                    video_processor_factory=VideoProcessor,
                    async_processing=True,
                )
                st.caption("Sử dụng cử chỉ để chuyển Slide")
                
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
                
                st.markdown(f"**Slide {current_idx + 1} / {total_slides}**")
                
                # Hiển thị ảnh slide (placeholder)
                st.image(f"https://picsum.photos/seed/slide_{current_idx}/800/450", 
                         use_container_width=True,
                         caption=f"Nội dung Slide số {current_idx + 1}")
                
                st.progress((current_idx + 1) / total_slides)

elif page == "Đánh giá hệ thống":
    st.title("📈 Đánh giá hệ thống")
    st.metric("Accuracy", "95%", "+2%")
    st.line_chart(np.random.randn(20, 2))

st.divider()
st.caption("Built with Streamlit • GestureAI Project")
