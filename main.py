import cv2
import mediapipe as mp
import numpy as np

# Khởi tạo MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

def calculate_distance(p1, p2):
    return np.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2)

def detect_gesture(hand_landmarks):
    thumb_tip = hand_landmarks.landmark[4]
    index_tip = hand_landmarks.landmark[8]
    middle_tip = hand_landmarks.landmark[12]
    index_mcp = hand_landmarks.landmark[5]
    middle_mcp = hand_landmarks.landmark[9]
    
    dist_ti = calculate_distance(thumb_tip, index_tip)
    is_index_ext = index_tip.y < index_mcp.y
    is_middle_folded = middle_tip.y > middle_mcp.y
    
    if dist_ti < 0.05: return "Click"
    if is_index_ext and is_middle_folded: return "Laser Pointer"
    if not is_index_ext and is_middle_folded: return "Fist"
    return "Open Hand"

def main():
    cap = cv2.VideoCapture(0)
    print("Đang khởi chạy Camera... Nhấn 'q' để thoát.")
    
    while cap.isOpened():
        success, image = cap.read()
        if not success: break

        image = cv2.flip(image, 1)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_image)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)
                gesture = detect_gesture(hand_landmarks)
                cv2.putText(image, f"Gesture: {gesture}", (10, 50), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        cv2.imshow('GestureAI - Local Version', image)
        if cv2.waitKey(5) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
