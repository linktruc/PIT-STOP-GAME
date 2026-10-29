# Deploy V8 — hướng dẫn ngắn

## Đã có game V7 trên Supabase

- Chọn lúc không có đội đang thi; giữ bản ZIP V7 để quay lại nếu cần.
- Mở đúng dự án Supabase → **SQL Editor → New query**.
- Dán toàn bộ `supabase/002_v8_stability.sql`, bấm **Run**. Script nâng cấp giữ phòng và kết quả hiện có.
- Chỉ deploy ZIP mới **không cập nhật database**; phải chạy SQL trên trước.
- Nếu Supabase hiện cảnh báo destructive/RLS, xem đúng câu SQL được đánh dấu. Bản migration này có `ALTER` và thay hàm; đã bật RLS cho bảng mới. Không bấm thêm RLS tự động lên bảng riêng lẻ hoặc chạy một script xóa bảng cũ.

## Cài mới

- Tạo dự án Supabase → Authentication → bật **Anonymous Sign-Ins**.
- SQL Editor → chạy toàn bộ `SUPABASE_SETUP.sql` một lần.
- Database → Publications → kiểm tra `supabase_realtime` có bảng `public.pit_public_state`.
- Không bật Realtime cho các bảng `pit_private`.

## Upload Netlify

- Giải nén `pit-stop-v8-netlify-ready.zip` vào một thư mục.
- Mở `config.js`; điền `supabaseUrl` và `supabaseAnonKey` bằng URL và **public publishable/anon key** của dự án.
- Không đưa secret key, service_role key hay mật khẩu vào file.
- Netlify → Sites → deploy thủ công; kéo **thư mục chứa trực tiếp `index.html`** vào vùng upload.
- Supabase → Authentication → URL Configuration → đặt Site URL và Redirect URL theo tên miền Netlify.
- Mở site bằng hai thiết bị: tạo phòng, tham gia, Ready; thử đủ 4 người rồi Start. Đội online vẫn cần 4–15 người.
- Leaderboard xem công khai; không cần đăng nhập admin.
- Nếu để trống cả hai giá trị config, game chạy luyện tập cục bộ; các thiết bị không kết nối với nhau.

## Tạo admin thật

- Supabase → Authentication → Users → tạo tài khoản email/mật khẩu và xác nhận email.
- Sao chép UUID của tài khoản; chạy trong SQL Editor:

```sql
insert into pit_private.admins(user_id)
values ('DAN-UUID-AUTH-USER-VAO-DAY')
on conflict do nothing;
```

- Trong game: Leaderboard → Admin access → đăng nhập email/mật khẩu đó.
- Tài khoản host không tự có quyền admin. Không có tài khoản mặc định `admin/1234`.
- Thao tác xóa kết quả cần xác nhận và được kiểm tra quyền trong database.

## Tắt Solo Test

- Trong `config.js`, đổi `enableSoloTest: true` thành `enableSoloTest: false`, rồi deploy lại thư mục.
- Solo Test là chế độ tạm: 1 người + 14 bot, không gửi dữ liệu Supabase, không ghi leaderboard, mất khi tải lại trang.

## Chỉnh source

- Giải nén `pit-stop-v8-source.zip`; cài Node.js 22 LTS.
- Chạy `npm ci`, rồi `npm run dev`.
- Kiểm tra: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Đóng gói: `npm run package`, rồi `npm run verify:packages`.
- ZIP mới nằm trong `artifacts/`. Đổi config ở `public/config.js` trước khi build, hoặc sửa `config.js` sau khi giải nén bản Netlify.

## Nếu mất kết nối

- Giữ nguyên tab/tài khoản; trở lại foreground để nối lại session.
- Sau 45 giây không heartbeat, trạng thái hiển thị disconnected; ghế trong sảnh giữ tối đa 15 phút.
- Host có thể xóa người vắng trong sảnh. Nếu kích cuối cùng rời đội, chỉ một người được đổi sang vai trò kích và phải Ready lại.
- Có thể chỉnh timeout bằng SQL owner: `update pit_private.settings set lobby_grace_ms=900000, disconnected_after_ms=45000 where id;`.
- Vào Menu vẫn giữ ghế; **Leave crew** mới rời phòng. Rời trong lượt đang chạy sẽ hủy lượt đó.
