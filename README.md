# Smart AAC / PECS Mobile App

> **Hệ thống Hỗ trợ Giao tiếp Trao đổi Hình ảnh Thông minh dành riêng cho Trẻ Rối loạn Phổ Tự kỷ (ASD), Trẻ Chậm nói và Người Chăm sóc tại Việt Nam.**

---

## 📖 Giới thiệu Dự án

**Smart AAC / PECS** là ứng dụng di động hỗ trợ giao tiếp tăng cường và thay thế (Augmentative and Alternative Communication - AAC) kết hợp phương pháp Trao đổi Hình ảnh (Picture Exchange Communication System - PECS) được bản địa hóa và tối ưu hóa chuyên sâu cho môi trường tiếng Việt.

Ứng dụng giúp trẻ tự kỷ phá vỡ rào cản ngôn ngữ, chủ động biểu đạt nhu cầu và cảm xúc thông qua hình ảnh trực quan, đồng thời cung cấp cho cha mẹ và chuyên viên can thiệp một bộ công cụ sư phạm toàn diện với các phương pháp trị liệu đã được kiểm chứng (Fitzgerald Key, ABA Token Economy, Expectant Delay, Sensory Sound Shield).

---

## 🚀 Tính năng Cốt lõi & Điểm nhấn Công nghệ

### 1. Phân hệ Trẻ em (Child Mode)
- **Thanh ghép câu thông minh (Sentence Strip & Smart Guided Flow):**
  - Trẻ chạm vào thẻ từ vựng để đưa lên thanh câu theo đúng trật tự ngữ pháp.
  - Tự động chuyển danh mục thông minh: Khi chọn thẻ *"Con muốn"* (Vàng), hệ thống tự lọc ra Hành động (Xanh lá); khi chọn *"Ăn"*, tự động mở danh mục Đồ ăn (Cam).
  - Tích hợp phát âm giọng đọc tiếng Việt mượt mà và nút xóa một chạm.
- **Chuẩn màu ngữ pháp Fitzgerald Key (Pastel dịu mắt):**
  - Màu sắc quy ước chuẩn quốc tế: **Vàng** (Chủ ngữ/Người), **Xanh lá** (Động từ/Hành động), **Cam** (Danh từ/Đồ vật), **Xanh dương** (Tính từ/Cảm xúc), **Tím** (Giao tiếp xã hội).
  - Sử dụng bảng màu Pastel dịu nhẹ (Low-Sensory UX) tránh kích thích thị giác quá mức ở trẻ tự kỷ.
- **Xử lý cảm ứng chuyên biệt (Autism-Friendly Touch Engine):**
  - Bắt sự kiện ngay khi chạm xuống (`onPressIn`), loại bỏ hoàn toàn hiện tượng nuốt cảm ứng do trẻ tì đè hoặc kéo lê ngón tay.
  - Mở rộng vùng dung sai chạm (`pressRetentionOffset`).
- **Cơ chế chống bấm lặp (Anti-Stimming Cooldown Timer):**
  - Ngắt nhịp từ $0.5$ đến $2.0$ giây giữa các lần bấm vào cùng một thẻ, loại bỏ triệt để hành vi tự kích thích thính giác vô thức (Stimming) có hại.
- **Khay nhu cầu khẩn cấp 1 chạm (Quick Emergency Bar):**
  - Luôn thường trực trên màn hình với các nhu cầu tối khẩn: *Con đói 🍚, Khát nước 🥤, Đi vệ sinh 🚽, Con bị đau 🤕, Ôm mẹ 🫂*. Bấm 1 lần phát chuông báo và câu thoại to rõ ràng ngay lập tức.

---

### 2. Hệ thống Hướng dẫn Ban đầu Từng bước (Step-by-Step Onboarding Walkthrough)
- Tự động kích hoạt khi người dùng lần đầu mở ứng dụng (lưu cờ `has_seen_onboarding` trong SQLite) hoặc mở lại bất cứ lúc nào qua nút **"Hướng dẫn"** trên Header.
- **Thiết kế 2 chặng học tập thực hành sống động:**
  - 👶 **Chặng 1: Dành cho Bé (4 bước thực hành trực tiếp):**
    1. *Chạm thẻ mở đầu:* Thẻ "Con muốn 🙋" phát sáng hoạt ảnh nhịp đập kèm bàn tay chỉ dẫn `👆`, chạm vào phát âm pop và bay lên thanh câu.
    2. *Chọn đồ vật:* Chọn 1 trong các món đồ (*Uống nước 🥛, Ăn bánh 🍪, Chơi ô tô 🚗*) ghép tiếp vào thanh câu.
    3. *Bấm nút Loa:* Nút Loa màu xanh nhấp nháy, bấm vào nghe máy đọc to: *"Con muốn uống nước"*.
    4. *Nhận thưởng Sao:* Linh vật khủng long Dino reo hò nhảy múa, tặng bé 1 ngôi sao thưởng Token Economy thật.
  - 👨‍👩‍👧 **Chặng 2: Dành cho Bố Mẹ (4 kỹ năng đồng hành can thiệp):**
    5. *Quy tắc 3 giây vàng (Expectant Delay):* Hướng dẫn giơ đồ ngang mắt, nhắc từ khóa, kèm bộ đếm nhịp 3 giây thử nghiệm để cha mẹ thực hành nhịp chờ con phản xạ.
    6. *Khay khẩn cấp 1 chạm:* Giới thiệu cơ chế giải cứu nhanh khi con gặp sự cố, đau ốm hoặc quá tải giác quan.
    7. *5 Trò chơi tương tác & Thêm câu hỏi:* Giới thiệu 5 mini-game và hướng dẫn cách tự tạo câu hỏi riêng của gia đình.
    8. *Cá nhân hóa & Khóa bảo vệ:* Cài đặt tên bé, chọn số cột hiển thị ($1 - 4$ cột) và hướng dẫn khóa Parental Gate.

---

### 3. Trung tâm 5 Trò chơi Trị liệu Tương tác Bố Mẹ & Bé (`ParentChildGamesModal`)
Tích hợp trực tiếp trên Header và thanh câu, mang lại trải nghiệm can thiệp sớm vui nhộn tại gia đình:
1. **🎴 Trò chơi 1: Thẻ Lật (Flip Cards):** Luyện nhận biết đồ vật, hoa quả, con vật qua câu đố 3 lựa chọn trực quan.
2. **🧩 Trò chơi 2: Nối Ý Logic (Matching Pairs):** Rèn luyện tư duy liên hệ nhân - quả giữa đồ vật và công dụng (Chó - Xương, Mưa - Ô, Đánh răng - Bàn chải) cùng thói quen sinh hoạt sạch sẽ.
3. **↔️ Trò chơi 3: Quiz Nghiêng Đầu Camera AI (Google MediaPipe Face):** Nhận diện góc nghiêng đầu của trẻ qua camera thời gian thực ($> 15^\circ$ sang Trái hoặc Phải), đồng hồ giữ dáng $1.0\text{s}$ để chọn đáp án mà không cần chạm tay.
4. **💖 Trò chơi 4: Trắc Nghiệm Cảm Xúc (Emotional Quiz):** Triết lý *Errorless Learning* tôn trọng cảm xúc chân thật của trẻ, không chấm sai, phản hồi êm dịu giúp con bày tỏ nhu cầu và tìm kiếm sự hỗ trợ.
5. **🤸 Trò chơi 5: Thể Dục Tư Thế Camera AI (Google MediaPipe Pose):** Nhận diện 4 cử động xương khớp (*Vươn tay chữ V, Làm tai thỏ, Chắp tay trước ngực, Dang hai tay sang ngang*), giữ dáng $1.5\text{s}$ để chọn đáp án.

---

### 4. Tính năng Tùy biến & Thêm Câu hỏi cho 5 Trò chơi (`GameQuestionEditorModal`)
- Phụ huynh có thể tự soạn câu hỏi mới phù hợp riêng với đồ vật, thú cưng và sinh hoạt thực tế của gia đình.
- Giao diện biên tập chuyên biệt cho từng trò chơi:
  - Chọn đáp án đúng/sai, chọn biểu tượng Emoji hoặc gắn liền với tư thế AI MediaPipe.
  - Tự soạn tình huống cảm xúc kèm lời khen ngợi/động viên từ mẹ.
- Lưu trữ bền bỉ trong SQLite (`custom_game_questions_v1`), tự động hòa trộn vào luồng chơi và gắn huy hiệu nhận diện thân thương: **"⭐ Câu hỏi của Bố Mẹ"**.

---

### 5. Các Tính năng Trị liệu Nâng cao Khác
- **Khiên bảo vệ giác quan (Sensory Overload Sound Shield):** Đo áp suất âm thanh thực thời (RMS) từ Microphone. Khi tiếng ồn vượt ngưỡng ($75\text{ dB}$), tự động bật bài tập thở điều hòa nhịp nhàng và đưa ra các thẻ trợ giúp khẩn cấp.
- **Động cơ kích âm tự nhiên (Natural Speech Induction Engine):** Kỹ thuật ngắt nhịp Expectant Delay (chờ $2-5\text{s}$), mớm âm tiết đầu (Phonemic Cueing) và thưởng sao khi bé cố gắng bật âm.
- **Chế độ Hai thiết bị kết nối gia đình (Dual-Device Family Sync):** Kết nối không dây cục bộ giữa máy của bé và điện thoại của mẹ, rung và đọc to thông báo khi bé bấm câu khẩn cấp ở phòng khác.
- **Khóa bảo vệ phụ huynh (Parental Gate):** Thử thách toán học ngẫu nhiên hoặc nhấn giữ bí mật ngăn trẻ tự ý thoát cài đặt.
- **Trình tạo thẻ cá nhân hóa & Thu âm giọng Mẹ (Card Creator & Dual-Engine Voice Recording):**
  - Chụp ảnh trực tiếp qua Camera hoặc chọn ảnh từ bộ sưu tập gia đình.
  - **Động cơ thu âm giọng nói kép (Dual-Engine Recording):**
    - *Trên Web:* Tự động kích hoạt HTML5 `MediaRecorder` và chuyển đổi sang Base64 Data URL để lưu vĩnh viễn trong SQLite (không bị mất file khi reload trình duyệt).
    - *Trên Native (Android/iOS):* Tận dụng `expo-audio` cấu hình chuẩn `RecordingPresets.HIGH_QUALITY` (AAC 128 kbps).
  - Có đồng hồ đếm giây thực thời (`00:0X`s), nút nghe thử ngay lập tức và tính năng thu lại hoặc xóa bản ghi.
  - Các thẻ có giọng mẹ được gắn huy hiệu nhận diện hồng ấm áp `🎙️ MẸ` trên bảng thẻ và ưu tiên phát âm thanh thực tế của mẹ khi chạm vào hoặc khi bật âm.
- **Báo cáo & Nhật ký giao tiếp (Communication Analytics):** Thống kê định lượng tần suất giao tiếp, nhóm từ vựng và sự tiến bộ ngữ pháp của trẻ.

---

## 🛠️ Ngăn xếp Công nghệ (Technology Stack)

| Thành phần | Công nghệ lựa chọn | Ghi chú & Vai trò |
| :--- | :--- | :--- |
| **Framework** | **React Native (Expo SDK 58)** | Đa nền tảng mượt mà (Android, iOS, Web), quản lý phần cứng tối ưu |
| **Ngôn ngữ** | **TypeScript 5.x** | Kiểm soát chặt chẽ kiểu dữ liệu, giảm thiểu lỗi runtime |
| **Quản lý Trạng thái** | **Zustand** | Store toàn cục siêu nhẹ, hiệu năng cao, không re-render thừa |
| **Cơ sở Dữ liệu Cục bộ** | **SQLite (`expo-sqlite`)** | Lưu trữ Offline-First $100\%$, bền bỉ, an toàn dữ liệu |
| **Thị giác Máy tính AI** | **Google MediaPipe (CDN Wasm)** | Nhận diện 468 điểm mốc khuôn mặt (Face) & 33 điểm mốc cơ thể (Pose) |
| **Âm thanh & Giọng nói** | **`expo-audio` & `expo-speech`** | Phát âm thanh độ trễ thấp $< 50\text{ms}$, ghi âm microphone và TTS tiếng Việt `vi-VN` |
| **Hình ảnh & Camera** | **`expo-image-picker`** | Chụp ảnh và chọn ảnh từ thư viện để tạo thẻ PECS |
| **Giao diện & Biểu tượng** | **`@expo/vector-icons`** | Bộ biểu tượng Ionicons & MaterialCommunityIcons chuẩn |

---

## 📱 Hướng dẫn Khởi chạy Ứng dụng

Di chuyển vào thư mục `app`:
```bash
cd "app"
npm install
```

### 1. Chạy trên điện thoại / máy tính bảng thật (Khuyên dùng)
```bash
npx expo start
```
- Cài ứng dụng **Expo Go** trên thiết bị (tải từ Google Play hoặc App Store).
- Mở Expo Go và quét mã QR hiển thị trên màn hình terminal để trải nghiệm đầy đủ cảm ứng và camera.

### 2. Xem trước nhanh trên Trình duyệt Web
```bash
npm run web
```
Ứng dụng sẽ tự động mở trên trình duyệt tại địa chỉ `http://localhost:8081`. Hỗ trợ đầy đủ tương tác chuột/cảm ứng, webcam nhận diện khuôn mặt và tư thế qua MediaPipe AI.

### 3. Chạy trên Thiết bị ảo Android / iOS
```bash
npm run android
# hoặc
npm run ios
```

### 4. Kiểm tra Kiểu dữ liệu TypeScript
```bash
npx tsc --noEmit
```

---

## 📂 Cấu trúc Thư mục Dự án

```text
app/
├── src/
│   ├── components/
│   │   ├── child/                     # Giao diện dành riêng cho Trẻ
│   │   │   ├── SentenceStrip.tsx      # Thanh tạo câu & kích âm
│   │   │   ├── QuickEmergencyBar.tsx  # Khay nhu cầu khẩn cấp 1 chạm
│   │   │   ├── CoreWordsBar.tsx       # Thanh từ vựng cốt lõi thường trực
│   │   │   ├── CategoryTabs.tsx       # Phân loại danh mục Fitzgerald Key
│   │   │   ├── GridBoard.tsx          # Lưới thẻ tương tác chính
│   │   │   ├── ParentChildGamesModal.tsx # Trung tâm 5 Trò chơi tương tác Bố Mẹ & Bé
│   │   │   ├── SensoryPopItModal.tsx  # Mini-game giải tỏa giác quan Pop-It
│   │   │   └── DetectiveQuestModal.tsx # Trò chơi Thám tử PECS đố vui tìm thẻ
│   │   ├── caregiver/                 # Giao diện dành cho Phụ huynh / Giáo viên
│   │   │   ├── SettingsModal.tsx      # Cài đặt hệ thống, lưới thẻ & âm thanh
│   │   │   ├── CardCreatorModal.tsx   # Trình chụp ảnh và tạo thẻ PECS mới
│   │   │   ├── AnalyticsModal.tsx     # Bảng phân tích & nhật ký giao tiếp
│   │   │   ├── FamilySyncModal.tsx    # Chế độ kết nối 2 thiết bị gia đình
│   │   │   └── GameQuestionEditorModal.tsx # Trình biên tập câu hỏi 5 mini-game
│   │   └── common/                    # Thành phần giao diện dùng chung
│   │       ├── Header.tsx             # Thanh tiêu đề, đổi chế độ & nút Hướng dẫn
│   │       ├── ParentalGateModal.tsx  # Khóa bảo vệ an toàn cho cha mẹ
│   │       ├── SensoryShieldModal.tsx # Khiên làm dịu quá tải giác quan Sound Shield
│   │       └── GuidedTourModal.tsx    # Hướng dẫn Step-by-Step 2 Chặng cho Bé & Mẹ
│   ├── constants/
│   │   ├── colors.ts                  # Bảng màu Fitzgerald Key Pastel chuẩn
│   │   └── defaultData.ts             # 60+ thẻ từ vựng sinh hoạt gốc tiếng Việt
│   ├── services/
│   │   ├── audioService.ts            # Động cơ âm thanh, phát thẻ & giọng đọc TTS
│   │   ├── database.ts                # Cơ sở dữ liệu SQLite offline bền vững
│   │   ├── noiseMonitorService.ts     # Đo áp suất âm thanh RMS thời gian thực
│   │   ├── mediaPipeService.ts        # AI Google MediaPipe nhận diện đầu & tư thế
│   │   └── familySyncService.ts       # Đồng bộ sự kiện gia đình 2 thiết bị
│   ├── stores/
│   │   └── useAppStore.ts             # Zustand Store quản lý toàn bộ trạng thái app
│   └── types/
│       ├── index.ts                   # Định nghĩa kiểu dữ liệu hệ thống
│       └── gameQuestions.ts           # Kiểu dữ liệu câu hỏi tùy biến cho 5 trò chơi
├── App.tsx                            # Root Component điều phối toàn bộ ứng dụng
├── app.json                           # Cấu hình Expo Application
└── package.json                       # Danh sách dependencies & scripts
```

---

## 📄 Bản quyền & Trách nhiệm Học thuật
Dự án được xây dựng phục vụ nghiên cứu học thuật và mục đích nhân văn can thiệp giáo dục đặc biệt cho trẻ em yếu thế tại Việt Nam.
