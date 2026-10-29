# Cập nhật V11.4

- Giải nén `pit-stop-v11-4-netlify.zip`.
- Copy `supabaseUrl` và `supabaseAnonKey` từ `config.js` đang chạy sang `config.js` mới. Giữ `hudHostingBadge: "netlify"`.
- Dùng lại Supabase hiện tại, tài khoản/alias/mật khẩu admin và timeout cũ. **Từ V11.3 không có SQL mới, không chạy lại setup.**
- Netlify → site hiện tại → **Deploys** → kéo thư mục chứa trực tiếp `index.html` vào vùng upload.
- Tải lại trang. Kiểm tra menu có ghế đang giữ, mở **Quick controls**, rồi vào **Solo Test → Choose role** cạnh Ready.
- Solo: đổi vai trò phải trở về **Mark ready**; thử jack/gunner có hai thao tác và release controller chờ các bot hoàn thành.
- Kiểm tra mobile: Role/Action vẫn nằm phía trên badge Netlify. Desktop vẫn có workflow dọc và Event Log bên trái.

Source: giải nén `pit-stop-v11-4-source.zip`, dùng Node.js 22.12+, chạy `npm ci` rồi `npm run dev`. Kiểm tra bằng `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`; tạo ZIP bằng `npm run package` và `npm run verify:packages`.

Nếu đang ở bản trước V11.3, xem bảng SQL theo phiên bản và hướng dẫn admin đầy đủ trong [V11_3_DEPLOY_GUIDE.md](V11_3_DEPLOY_GUIDE.md). Các file SQL cũ đi kèm source để hỗ trợ nhánh nâng cấp đó; V11.4 không thay đổi chúng.
