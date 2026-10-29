# Cập nhật lên V10.3 + đính chính V10.4

## 1. Cập nhật database trước

- Chọn lúc không có đội đang thi. Giữ ZIP và `config.js` hiện tại để dự phòng.
- Giữ nguyên dự án Supabase đang dùng để giữ đội và điểm cũ.
- Supabase → **SQL Editor → New query**. Chạy từng file đầy đủ theo đúng thứ tự:

| Bản đang dùng | SQL cần chạy |
| --- | --- |
| V9/V9.1 | `004_v10_recorded_replays.sql` |
| V8 | `003_v9_early_tap_penalty.sql` → `004_v10_recorded_replays.sql` |
| V7 | `002_v8_stability.sql` → `003_v9_early_tap_penalty.sql` → `004_v10_recorded_replays.sql` |
| Dự án mới | Chỉ `SUPABASE_SETUP.sql` mới; không chạy thêm 002/003/004 |

- Không chạy lại setup/SQL của phiên bản cũ sau migration mới. **Kéo ZIP lên Netlify không cập nhật Supabase.**
- Migration giữ điểm cũ và ghi metadata replay cho lượt mới. Lượt cũ dùng thời điểm thực tế còn lưu; tên/vai trò cũ có thể không khôi phục chính xác nếu thành viên đã đổi trước khi cập nhật.

## 2. Cấu hình và upload Netlify

- Giải nén `pit-stop-v10-3-netlify.zip`.
- Mở `config.js` ở thư mục vừa giải nén; copy `supabaseUrl` và `supabaseAnonKey` từ bản hiện tại.
- Chỉ dùng **publishable/anon public key**. Không dùng secret/service_role key, mật khẩu database hay mật khẩu admin.
- Giữ `enableSoloTest: true` để có Solo Test; đổi `false` để tắt.
- Netlify → site hiện tại → **Deploys** → kéo thư mục chứa trực tiếp `index.html` vào vùng upload.
- Nếu deploy bằng Git: build command `npm run build`, publish directory `dist`; sửa `public/config.js` trước khi build.
- Supabase → **Authentication → Sign In / Providers**: kiểm tra **Anonymous Sign-Ins** vẫn bật.
- Supabase → **Database → Publications → supabase_realtime**: phải có `public.pit_public_state`. Không thêm bảng `pit_private`.
- Giữ domain cũ thì giữ Auth URL. Đổi domain thì sửa **Authentication → URL Configuration → Site URL / Redirect URLs**.
- Nếu để trống cả hai giá trị Supabase, game chỉ chạy local; nhiều thiết bị không chơi cùng nhau.

## 3. Admin: giữ tài khoản cũ hoặc tạo một lần

- Đã có admin V9.1 hoạt động: dùng lại tài khoản, UUID và alias; không cần tạo lại.
- Chưa có admin: Supabase → **Authentication → Users** → tạo user email/mật khẩu; bật **Auto Confirm User** hoặc xác nhận qua email.
- Dùng mật khẩu riêng, mạnh, ít nhất **12 ký tự**. Trong Auth settings đặt minimum password length từ 12; nâng mật khẩu tài khoản cũ nếu đang ngắn hơn.
- Copy UUID của user; thay UUID vào **cả hai chỗ** rồi chạy SQL sau:

```sql
insert into pit_private.admins(user_id)
values ('THAY-BANG-UUID-TAI-KHOAN-AUTH')
on conflict do nothing;

insert into pit_private.admin_aliases(username, user_id)
values ('admin', 'THAY-BANG-UUID-TAI-KHOAN-AUTH')
on conflict (username) do update set user_id = excluded.user_id;
```

- Trong game: **Leaderboard → Admin access** → username `admin` + mật khẩu riêng vừa đặt.
- Đăng nhập/đăng xuất admin khi không giữ ghế trong đội; nếu đang chơi, đợi xong và **Leave Team** trước.
- `admin / 1234` chỉ dùng **Local Practice khi chưa cấu hình Supabase**; màn hình ghi rõ local/testing, chỉ xóa dữ liệu luyện tập trong bộ nhớ trình duyệt. Nó không đăng nhập Supabase và không có quyền xóa leaderboard online.
- Online dùng `admin` + mật khẩu riêng ít nhất 12 ký tự; không có tài khoản production mặc định `admin/1234`. Host không tự có quyền xóa; xem leaderboard không cần admin.
- **Email not confirmed**: xác nhận email hoặc owner xác nhận user trong Supabase. Thêm allowlist không tự xác nhận email.
- **Username not configured**: kiểm tra alias `admin` trỏ đúng UUID đã nằm trong `pit_private.admins`.
- Xóa điểm bằng admin sẽ xóa/loại bỏ cả replay và mục Just Finished tương ứng; hãy thử bằng một lượt thử nghiệm.

## 4. Heartbeat, timeout và kết nối lại

- Cấu hình timeout cũ được giữ; **không bắt buộc chỉnh lại**.
- Heartbeat là tín hiệu nhỏ game gửi định kỳ để báo tab vẫn kết nối. Không bấm nút vẫn có heartbeat khi tab hoạt động bình thường.
- Mất mạng hoặc trình duyệt tạm ngưng tab có thể làm heartbeat ngừng. Sau mặc định **45 giây** không nhận tín hiệu, người chơi hiện disconnected.
- Ở sảnh, mặc định giữ ghế tối đa **15 phút** kể từ heartbeat cuối, trừ khi host chủ động xóa.
- Mở lại game bằng cùng trình duyệt/identity và có mạng để tải trạng thái mới, khôi phục ghế còn được giữ. Không xóa dữ liệu trình duyệt nếu muốn giữ identity.
- Trong lượt đang chạy, game không tự bấm hộ vai trò người bị ngắt mạng; đồng hồ tiếp tục. **Leave Team** khi đang chạy sẽ hủy lượt.
- Muốn đổi hai mốc này, owner chạy SQL dưới; đơn vị mili giây:

```sql
update pit_private.settings
set lobby_grace_ms = 900000, disconnected_after_ms = 45000
where id;
```

## 5. Kiểm tra sau cập nhật

- Tải lại trên mọi thiết bị; nếu còn giao diện cũ, đóng/mở tab hoặc tải lại bỏ cache.
- Thử Solo: chọn vai trò bất kỳ, Start, thấy xe tới trong **3–2–1**, dừng ở **GO**; điểm Solo không lên leaderboard.
- Bấm sớm trong lượt: nút đỏ, khóa riêng 2 giây; bấm lặp không kéo dài khóa, đồng hồ đội vẫn chạy. Bấm trong countdown bị khóa ít nhất đến **GO + 2 giây**.
- Online: đủ 4–15 người, mọi người Ready → host Start. Thử join/leave và kết nối lại; vai trò/Ready người còn lại phải ổn định.
- Kiểm tra ribbon rộng hơn hiện nhiều tác vụ hơn; mở workflow thấy 21 tác vụ và nickname/Bot.
- Thử Watch Live: desktop có preview 3D của đội đang chạy; mobile overview chỉ thông tin/progress; mở đội mới xem 3D lớn.
- Kết thúc → **Watch replay**; thử pause, tua, đổi tốc độ, Event Log. **Play again** bắt đầu lượt mới.
- Tải lại trang rồi mở replay online; dùng admin xóa lượt thử và kiểm tra điểm/replay/Just Finished tương ứng biến mất.
- Bấm bật âm thanh và tăng volume game/thiết bị; kiểm tra countdown, GO, súng, lốp và release.

## 6. Chỉnh sửa source

- Giải nén `pit-stop-v10-3-source.zip`; dùng Node.js 22.12+.
- Source có đầy đủ bằng chứng V10 và 3 ảnh trước từ V9. Thư mục ảnh/bằng chứng V8/V9 đầy đủ nằm trong ZIP phiên bản cũ, không lặp lại ở ZIP mới.
- Chạy `npm ci`, rồi `npm run dev`.
- Kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Đóng gói: `npm run package`, `npm run verify:packages`; ZIP nằm trong `artifacts/`.
- Solo có thể tắt ngay bằng `enableSoloTest: false`; backend online không phụ thuộc chế độ này.

Xem `TEST_REPORT.md` để biết kiểm tra đã chạy và giới hạn còn cần kiểm tra trên Supabase/Netlify, Safari và thiết bị thật.
