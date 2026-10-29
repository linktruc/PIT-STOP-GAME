# Cập nhật V8 → V9.1

- Chọn lúc không có đội đang thi. Giữ ZIP V8 làm bản dự phòng.
- Supabase → **SQL Editor → New query** → chạy toàn bộ `003_v9_early_tap_penalty.sql` đi kèm.
- Nếu đang ở **V7**: chạy `002_v8_stability.sql` trước, rồi `003_v9_early_tap_penalty.sql`.
- Nếu cài **dự án mới**: chạy `SUPABASE_SETUP.sql` của V9.1; không cần chạy thêm 002/003.
- Migration giữ phòng, vai trò/Ready và kết quả cũ. **Upload ZIP không cập nhật database. Không chạy lại SQL phiên bản cũ sau migration mới.**

## Cấu hình game và Netlify

- Giải nén `pit-stop-v9.1-netlify-ready.zip`.
- Copy `supabaseUrl`, `supabaseAnonKey` từ `config.js` V8 sang `config.js` V9.1. Chỉ dùng public publishable/anon key.
- `enableSoloTest: true` giữ Solo Test; đổi thành `false` nếu muốn tắt. Không cần sửa source để tắt.
- Netlify → site hiện tại → **Deploys** → kéo thư mục chứa trực tiếp `index.html` vào.
- Nếu giữ tên miền Netlify cũ, giữ nguyên Auth Site URL/Redirect URL. Nếu đổi tên miền, cập nhật hai mục này trong Supabase → Authentication → URL Configuration.
- Kiểm tra **Anonymous Sign-Ins** vẫn bật; publication `supabase_realtime` có bảng `public.pit_public_state`. Không thêm các bảng `pit_private` vào Realtime.
- Để trống cả hai giá trị Supabase sẽ chạy luyện tập cục bộ; các thiết bị không kết nối với nhau.

## Admin: nay đăng nhập bằng username

- Nếu V8 đã có admin: dùng lại tài khoản Auth và UUID cũ; chỉ thêm alias ở SQL dưới. Không cần tạo tài khoản mới.
- Nếu chưa có: Supabase → **Authentication → Users** → tạo tài khoản email/mật khẩu, bật **Auto Confirm User**, hoặc xác nhận email qua thư.
- Dùng mật khẩu riêng, mạnh, **ít nhất 12 ký tự**. Trong cấu hình Auth của dự án, đặt minimum password length từ 12 ký tự; bật chính sách chống mật khẩu yếu nếu gói hỗ trợ.
- Nếu mật khẩu admin V8 ngắn hơn 12 ký tự, đặt lại mật khẩu tài khoản trước khi dùng V9.1. Không đổi UUID.
- Copy UUID tài khoản đó, thay vào **cả hai chỗ** rồi chạy trong SQL Editor:

```sql
insert into pit_private.admins(user_id)
values ('THAY-BANG-UUID-TAI-KHOAN-AUTH')
on conflict do nothing;

insert into pit_private.admin_aliases(username, user_id)
values ('admin', 'THAY-BANG-UUID-TAI-KHOAN-AUTH')
on conflict (username) do update set user_id = excluded.user_id;
```

- Đăng nhập admin khi chưa ở trong đội; nếu đang chơi, đợi kết thúc rồi Leave Team trước khi đổi tài khoản.
- Trong game: **Leaderboard → Admin access** → username `admin` + mật khẩu riêng của tài khoản Auth.
- Username do database ánh xạ tới email Auth. Không nhập email hay mật khẩu vào `config.js`; không đưa service_role/secret key vào ZIP.
- Không có tài khoản đặc quyền mặc định `admin/1234`. Leaderboard vẫn xem công khai; host không tự có quyền xóa điểm.
- Lỗi **Email not confirmed**: xác nhận email hoặc nhờ owner xác nhận user trong Supabase. Thêm UUID vào allowlist không tự xác nhận email.
- Lỗi **username not configured**: kiểm tra migration 003 và bản ghi `pit_private.admin_aliases` trỏ đúng UUID đã nằm trong `pit_private.admins`.

## Timeout và luật mới

- Timeout V8 được giữ nguyên; **không bắt buộc chỉnh lại**. Mặc định: 45 giây không heartbeat hiện disconnected; ghế trong sảnh được giữ tối đa 15 phút, trừ khi host chủ động xóa.
- Muốn thay timeout, owner có thể chạy SQL sau; đơn vị là mili giây:

```sql
update pit_private.settings
set lobby_grace_ms = 900000, disconnected_after_ms = 45000
where id;
```

- **Main Menu** giữ ghế. **My Garage** trở lại đội hiện tại. **Team Members** mở danh sách thành viên. **Leave Team** mới rời đội; rời khi đang thi sẽ hủy lượt.
- Bấm nút hành động quá sớm: khóa riêng 2 giây. Bấm trong countdown: khóa ít nhất đến GO + 2 giây. Bấm lặp khi đang khóa không cộng dồn; đồng hồ đội vẫn chạy.
- Solo Test: chọn bất kỳ 1 trong 15 vai trò trước Start. Vai trò không phải kích dùng nhịp bot khởi động 400 ms; sau phản ứng người thật, bot thích nghi bình thường. Đây là chế độ local, không xếp hạng, không thay luật online 4–15 người và ít nhất một người giữ kích.

## Kiểm tra sau cập nhật

- Tải lại trang trên mọi thiết bị; nếu còn giao diện cũ, đóng/mở lại tab hoặc tải lại bỏ cache.
- Thử join/leave: vai trò và Ready của người còn lại phải giữ nguyên, trừ đổi tối thiểu khi kích người thật cuối cùng rời đội.
- Đủ 4 người Ready → Start. Bấm sớm, kiểm tra khóa 2 giây; thử Space và kết nối lại trong lúc khóa.
- Chạy hai đội: Watch Live phải có hai garage 3D độc lập. Đội chờ/kết thúc không có preview.
- Thử username admin, xác nhận xóa một kết quả thử nghiệm; người không phải admin không được xóa.
- Thử Solo ở vai trò gunner, rear jack và release; kiểm tra leaderboard online không thay đổi.

## Chỉnh sửa và build source

- Giải nén source ZIP; dùng Node.js 22 LTS.
- Chạy `npm ci`, `npm run dev`.
- Kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Đóng gói: `npm run package`, `npm run verify:packages`; ZIP nằm trong `artifacts/`.
- Muốn bỏ Solo khỏi source: bỏ `SoloRolePicker`/nút Solo và route `solo_enter` trong adapter API, rồi xóa module `solo.ts` cùng test Solo. Cách đơn giản được hỗ trợ là đặt feature flag thành `false`; backend online không phụ thuộc Solo.
