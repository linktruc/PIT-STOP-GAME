# Cập nhật lên V11.3

## 1. Database: chọn đúng nhánh

- Giữ bản deploy và `config.js` hiện tại để dự phòng; cập nhật lúc không có đội đang thi.
- Giữ **dự án Supabase hiện tại** để giữ đội, điểm, replay, tài khoản admin và timeout.
- **Từ V10.3/V10.4: không cần SQL mới cho V11.3.** Logic SQL hiện tại được giữ; không chạy lại full setup.
- Từ bản cũ hơn, chạy từng file đầy đủ theo đúng thứ tự trong **Supabase → SQL Editor → New query**:

| Bản đang dùng | SQL cần chạy trước frontend V11.3 |
| --- | --- |
| V10.3 / V10.4 | Không có migration V11 mới |
| V9 / V9.1 | `004_v10_recorded_replays.sql` |
| V8 | `003_v9_early_tap_penalty.sql` → `004_v10_recorded_replays.sql` |
| V7 | `002_v8_stability.sql` → `003_v9_early_tap_penalty.sql` → `004_v10_recorded_replays.sql` |
| Dự án mới | Chỉ `SUPABASE_SETUP.sql` hiện tại, một lần |

- Không chạy SQL/setup phiên bản cũ đè lên schema mới. **Upload Netlify không tự cập nhật database.**
- Điểm cũ được giữ. Metadata replay mới đầy đủ hơn; không thể tự khôi phục tên/vai trò lịch sử đã mất trước các bản cập nhật trước.

## 2. Cấu hình và upload Netlify

- Giải nén `pit-stop-v11-3-netlify.zip`.
- Mở `config.js` ở thư mục vừa giải nén; copy `supabaseUrl` và `supabaseAnonKey` từ bản đang chạy.
- Chỉ dùng **publishable/anon public key** của cùng project; không dùng secret/service-role key hay mật khẩu.
- Giữ `enableSoloTest: true` để có Solo; đổi `false` nếu muốn tắt.
- Giữ `hudHostingBadge: "netlify"` khi deploy Netlify để bảo vệ nút mobile cả khi game không đọc được badge của nền tảng. Chỉ đặt `"none"` nếu chuyển sang host **không có badge ngoài game**.
- Netlify → site hiện tại → **Deploys** → kéo thư mục chứa trực tiếp `index.html` vào vùng upload.
- Deploy bằng Git: Node.js **22.12+**, build `npm run build`, publish `dist`; sửa `public/config.js` trước khi build.
- Supabase → **Authentication → Sign In / Providers**: giữ **Anonymous Sign-Ins** bật cho người chơi.
- **Database → Publications → supabase_realtime**: phải có `public.pit_public_state`; không publish bảng `pit_private`.
- Giữ domain thì giữ Auth URL. Đổi domain thì cập nhật **Authentication → URL Configuration → Site URL / Redirect URLs**.
- Tải lại trên mọi thiết bị. Nếu giao diện còn cũ, đóng/mở tab hoặc tải lại bỏ cache.
- Mobile chừa vùng cho badge Netlify và khoảng cách nhỏ 10px ngay cả khi badge nằm ngoài DOM mà game đọc được. Khi đo được badge thật, game dùng đúng mép trên của nó để đặt cụm nút thấp nhất có thể. Role/action đi cùng một cụm gọn, thích ứng viewport và safe area. Không xóa hay sửa badge.
- Nếu host bọc badge bằng phần tử riêng, có thể thêm `hudOverlaySelector: "CSS_SELECTOR_CUA_BADGE"` vào `PIT_CONFIG` để game đo đúng khung badge. Đây là tùy chọn; cấu hình mặc định đã bảo vệ vùng đáy mobile.
- Để trống cấu hình Supabase chỉ chạy local/Solo; không có multiplayer nhiều thiết bị hoặc quản trị online.

## 3. Admin: dùng tài khoản Supabase đang có

- **Không cần tạo lại tài khoản, đổi UUID, đổi alias hay reset mật khẩu** nếu tài khoản cũ đúng.
- Mở **Main Menu → Admin Access**, hoặc **Leaderboard → Admin Access**, nhập alias username và mật khẩu Auth hiện tại.
- Frontend không còn chặn mật khẩu hiện có vì ngắn hơn 12 ký tự; Supabase quyết định xác thực.
- Nên dùng mật khẩu riêng, mạnh; không bắt buộc đổi mật khẩu chỉ để cập nhật V11.3.
- Nếu giữ ghế online: nên hoàn tất lượt rồi **Leave Team**. Khi đăng nhập, có thể tick xác nhận cảnh báo và bấm **Leave Team & sign in** để rời ghế trước khi đổi Auth; lượt đang chạy sẽ kết thúc. Về menu vẫn giữ ghế. Đăng xuất cũng phải bảo đảm đã rời ghế online.
- Mục Admin Access vẫn có từ menu khi đang dùng Solo; quyền quản trị luôn do Supabase xác nhận.
- Chưa có admin hoặc gặp **Email not confirmed / Username not configured**: làm đúng [V11_ADMIN_SETUP.md](V11_ADMIN_SETUP.md), gồm SQL allowlist + alias một lần và cách đối chiếu UUID.
- Đăng nhập hợp lệ sẽ có trạng thái **Global admin**; xem leaderboard không cần admin.
- Dùng một lượt online thử nghiệm để kiểm tra xóa đồng bộ điểm, Just Finished, Replay và Event Log; không thử trên dữ liệu cần giữ.

## 4. Heartbeat, timeout và kết nối lại

- Hai mốc cũ được giữ; **không bắt buộc chỉnh lại**.
- Heartbeat là tín hiệu game gửi định kỳ để báo tab còn kết nối. Không bấm nút vẫn có heartbeat khi tab hoạt động bình thường.
- Mất mạng hoặc trình duyệt tạm ngưng tab có thể làm tín hiệu dừng. Mặc định sau **45 giây** không nhận heartbeat, người chơi hiện disconnected.
- Ở sảnh, mặc định giữ ghế tối đa **15 phút** tính từ heartbeat cuối, trừ khi host chủ động xóa.
- Có mạng lại, mở cùng trình duyệt/identity để tải trạng thái mới và khôi phục ghế còn được giữ. Không xóa dữ liệu trình duyệt nếu muốn giữ identity.
- Trong lượt đang chạy, đồng hồ vẫn chạy và game không tự bấm hộ người mất mạng. **Leave Team** lúc countdown/đang chạy sẽ hủy lượt.
- Muốn đổi mốc, owner chạy SQL sau; đơn vị mili giây:

```sql
update pit_private.settings
set lobby_grace_ms = 900000, disconnected_after_ms = 45000
where id;
```

## 5. Kiểm tra sau cập nhật

- Mobile: role/action nằm thấp nhưng cao hơn badge Netlify một khoảng nhỏ; thử 390×844, 430×932 và chiều cao ngắn hơn khi thanh địa chỉ Safari mở. Chạy cả sảnh, action, penalty và kết quả; các nút phải bấm được.
- Mobile giữ workflow ngang gọn. Desktop 1366×768, 1920×1080: workflow **dọc bên trái**, Event Log ngay dưới; role/action bên phải, giữa màn hình dành cho cảnh 3D.
- Desktop Event Log phải cập nhật khi hoàn tất tác vụ, hiện task, nickname/Bot, thời gian bước và tổng thời gian đội; dòng cũ cuộn trong panel, không mở rộng che xe.
- Chạm workflow mở board thấy đủ 21 tác vụ, nickname/Bot và YOU trong một trang; gold chỉ đúng các tác vụ được giao cho bạn.
- Solo **FRONT_JACK**: đợi khoảng 4 giây rồi bấm; bot downstream phải dùng thời gian quan sát hợp lệ, trừ trường hợp đồng bộ/cap được chẩn đoán. So sánh với lượt bấm khoảng 250ms.
- Solo vai trò không phải jack có thể cần bot mở đầu trước mẫu người đầu tiên; sau mẫu người, tác vụ mới dùng mean thực tế.
- Xe đến từ travel lane, rẽ vào ô, dừng đúng **GO**; crew chỉ làm việc sau GO. Điểm tính GO → release, không tính animation cuối.
- Thử penalty: bấm sớm khóa riêng 2 giây, bấm lặp không kéo dài; đồng hồ đội tiếp tục.
- Online: 4–15 người, Ready → host Start; join/leave/reconnect không đổi vai trò/Ready người khác ngoài sửa jack bắt buộc.
- Watch Live overview: đội đang chạy có **Event Log**; đội vừa xong có **Event Log** cạnh **Replay**, mở độc lập.
- Thử replay pause/tua/đổi tốc độ, Event Log, rồi tải lại và mở lại replay online.
- Bật âm thanh, tăng volume game/thiết bị; kiểm tra countdown, GO, súng, lốp và release.

## 6. Chỉnh sửa source

- Giải nén `pit-stop-v11-3-source.zip`; dùng Node.js **22.12+**, npm và Python 3.
- Chạy `npm ci`, rồi `npm run dev`.
- Kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Đóng gói: `npm run package`, `npm run verify:packages`; ZIP nằm trong `artifacts/`.
- `docs/v11-evidence/` chứa ảnh, video hoàn chỉnh và dữ liệu kiểm tra mới; `docs/history/` giữ báo cáo cũ. ZIP bỏ chuỗi frame encode trung gian/video trùng và các thư mục bằng chứng V8/V9/V10 để tránh lặp nặng.

Xem `TEST_REPORT.md` và `V11_FIX_REPORT.md` để biết kiểm tra thực tế, giới hạn chưa thử trên Supabase/Netlify, Safari và thiết bị thật. Bản bàn giao không đồng nghĩa đã deploy production.
