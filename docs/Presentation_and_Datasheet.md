# Smart Parking System: Project Datasheet & Presentation Content

## 1. Project Title
**AI-Powered Smart Parking Management System**

## 2. Abstract / Project Overview
Urban areas face significant challenges with parking management, leading to congestion, fuel waste, and driver frustration. This project proposes an AI-powered Smart Parking System that leverages Edge IoT devices (ESP32-CAM) and a custom-trained object detection model to monitor parking slot availability in real-time. The system processes visual data to detect vehicle presence, identifies improper parking, automates entry/exit logging, and calculates dynamic parking fees. A centralized dashboard provides real-time monitoring and analytics for both administrators and users.

---

## 3. Methodology & Architecture

Our system architecture is divided into three primary tiers: Edge, Processing, and Client.

### Step 1: Data Acquisition (Edge IoT)
- **Cameras:** ESP32-CAM modules are positioned over parking slots.
- **Capture Rate:** Images are captured continuously (e.g., every 5-10 seconds).
- **Transmission:** Images are transmitted over Wi-Fi via HTTP POST requests to the centralized backend server.

### Step 2: AI Processing & Inference
- **Model:** A custom-trained Convolutional Neural Network (CNN) object detection model (based on the YOLO architecture).
- **Processing:** The server receives the image feed and passes it to the AI model. 
- **Tasks Performed:**
  - **Vehicle Detection:** Identifies if a car is present in the slot bounding box.
  - **Alignment Checking:** Determines "Good" vs "Bad" parking based on spatial lines.
  - **License Plate Extraction:** Extracts OCR data to track individual vehicles.
- **Output:** The model generates a structured JSON output mapping the detected vehicle to a specific Slot ID (e.g., "A1") along with its status.

### Step 3: Backend Logic & Storage
- **State Management:** The Node.js server updates the MongoDB database, changing the slot status (`available`, `occupied`, `fined`).
- **Billing Logic:** The server calculates duration-based billing upon vehicle exit (using hourly rates) and logs a timestamped event.
- **API Endpoints:** REST APIs serve this data to the frontend client.

### Step 4: Real-Time Dashboard (Client UI)
- **Visualization:** A React-based web interface polls or subscribes to the backend for the latest parking data.
- **Features:** 
  - Visual grid of slots (Empty, Occupied, Fined).
  - Live activity logs and revenue tracking.
  - Admin configurations (changing total slots, rates).

---

## 4. Technology Stack & Tools Used

### Hardware / IoT Edge
* **ESP32-CAM (AI-Thinker)**: Low-cost edge camera module with Wi-Fi capabilities for image capture.
* **Power Supply / Cabling**: Standard 5V power supply for continuous operation.

### Artificial Intelligence & Computer Vision
* **Custom Object Detection Model**: Trained on thousands of parking lot images.
* **Architecture**: YOLO (You Only Look Once) / CNN-based architecture optimized for fast inference.
* **Capabilities**: Bounding box determination, alignment verification, basic character recognition.

### Backend Infrastructure
* **Environment**: Node.js
* **Framework**: Express.js (REST API development, routing, middleware processing).
* **Storage Interface**: Mongoose ORM.
* **Image Processing**: Multer (for handling multi-part form data from ESP32).

### Database Management
* **Database**: MongoDB (NoSQL)
* **Rationale**: Flexible schema design is ideal for fluid JSON logs, dynamically expanding slot records, and fast read/writes for activity feeds.

### Frontend Web Application
* **Framework**: React.js with Vite
* **Styling**: Modern CSS3, Glassmorphism design principles, responsive grid layouts.
* **Icons & Animation**: `lucide-react` for scalable SVGs, `framer-motion` for fluid component transitions.
* **Routing/State Context**: React Context API for global state management.

---

## 5. Slide-by-Slide PPT Outline

**Slide 1: Title Slide**
- Project Title: AI-Powered Smart Parking Management System
- Team Members / Name
- Date

**Slide 2: Problem Statement**
- Traffic congestion caused by drivers searching for parking.
- Inefficient manual management of parking spaces.
- Lack of real-time visibility into available slots.
- Revenue leakage from improper parking and manual ticketing.

**Slide 3: Proposed Solution**
- An automated, camera-based IoT parking system.
- Real-time slot monitoring.
- Automated entry/exit logging and dynamic billing.
- Penalty detection for misaligned vehicles.

**Slide 4: System Architecture**
- Diagram flow: `ESP32-CAM > HTTP Server > AI Inference Model > MongoDB > React Dashboard`.
- Briefly explain how each tier communicates via REST APIs.

**Slide 5: The AI Model**
- Mention the creation of a Custom Object Detection Model.
- Explain that it was trained on diverse lighting conditions and angles.
- Tasks: Vehicle Presence Detection, Alignment Checking, and outputting JSON coordinates mapped to Slot IDs.

**Slide 6: Hardware (ESP32-CAM)**
- Why ESP32-CAM? Cost-effective, built-in Wi-Fi, sufficient resolution for inference.
- Captures images systematically to ensure the AI model is always fed current real-world states.

**Slide 7: Software Stack**
- Backend: Node.js, Express, MongoDB.
- Frontend: React.js, Vite, Framer Motion.
- Display logos of these technologies.

**Slide 8: Key Features (Dashboard)**
- Live Slot Grid Mapping (`A1`, `A2`...).
- Instant Activity Logs.
- Revenue Tracking & Automated Hourly Billing calculations.
- Responsive, intuitive UI with animations.

**Slide 9: Advantages & Impact**
- Reduces carbon emissions by minimizing search time.
- Lowers operational costs (no human attendants needed per floor).
- Scalable (can add 'A30', 'A50' instantly via software config).
- Ensures billing accuracy.

**Slide 10: Conclusion & Future Scope**
- Conclusion: AI and IoT together create a robust, resilient smart infrastructure.
- Future Scope: Integrating a mobile app for users to pre-book slots, adding barriers/booms based on AI approval.

**Slide 11: Q&A**
- "Thank You! Questions?"
