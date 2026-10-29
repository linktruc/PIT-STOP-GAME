# V11.3 — tài khoản quản trị Supabase thật

## Đã có tài khoản hoạt động

- Giữ nguyên dự án Supabase, user Auth, UUID và alias username đang dùng.
- Trong game mở **Main Menu → Admin Access**, hoặc **Leaderboard → Admin Access**.
- Nhập username alias hiện có và **mật khẩu hiện tại của đúng user trong Supabase Auth**.
- V11.3 gửi mật khẩu hiện có cho Supabase kiểm tra, kể cả khi ngắn hơn 12 ký tự. Bản cập nhật không tự đặt lại mật khẩu hay thêm yêu cầu độ dài ở frontend.
- Nên dùng mật khẩu riêng, mạnh; việc đổi mật khẩu là lựa chọn quản lý tài khoản của owner, không phải bước bắt buộc để nâng cấp.
- Khi server xác nhận quyền, giao diện hiển thị **Global admin**. Leaderboard vẫn xem được khi chưa đăng nhập.
- Nếu đang giữ ghế online: nên hoàn tất lượt rồi **Leave Team** trước khi đăng nhập/đăng xuất. Khi đăng nhập, cũng có thể đọc và tick xác nhận trong form rồi bấm **Leave Team & sign in**; thao tác này rời ghế và kết thúc lượt đang chạy. Không xác nhận thì nút chưa cho đăng nhập. **Main Menu** vẫn giữ ghế.
- Solo vẫn là chế độ không xếp hạng; mở Admin Access từ menu không biến tài khoản thành người chơi khác hay cấp quyền từ dữ liệu Solo.

## Chỉ tạo/cấu hình nếu chưa có

- Supabase → **Authentication → Users** → tạo user email/mật khẩu riêng.
- Xác nhận email bằng email nhận được hoặc chức năng xác nhận user của dashboard. Nếu tạo user mới, chọn **Auto Confirm User** khi dashboard có tùy chọn đó.
- Copy UUID user vừa tạo. Trong **SQL Editor**, thay đúng UUID vào cả hai vị trí sau. Đây là cấu hình owner thực hiện một lần, không phải SQL chạy trong trình duyệt người chơi:

```sql
insert into pit_private.admins(user_id)
values ('THAY-BANG-UUID-USER-AUTH')
on conflict do nothing;

insert into pit_private.admin_aliases(username, user_id)
values ('admin', 'THAY-BANG-UUID-USER-AUTH')
on conflict (username) do update set user_id = excluded.user_id;
```

- Chỉ dùng alias `admin` nếu đó là username bạn muốn. Đã có alias đúng thì không cần chạy lại hay ghi đè.
- Mật khẩu đăng nhập là mật khẩu Auth bạn đã đặt; SQL trên không tạo, đọc hay thay mật khẩu.

## Khi gặp lỗi

| Thông báo / biểu hiện | Kiểm tra |
| --- | --- |
| Global administration requires a connection to Supabase | `config.js` phải có URL và publishable/anon public key của đúng project; kiểm tra mạng, tải lại và thử lại. |
| Email not confirmed | Xác nhận email của đúng user trong Authentication. Thêm UUID vào allowlist không tự xác nhận email. |
| Username not configured | Kiểm tra `pit_private.admin_aliases.username` và UUID mà alias trỏ tới. |
| Invalid login credentials | Dùng đúng mật khẩu hiện tại của user Auth đó; kiểm tra project/alias. Không đoán tài khoản hoặc thay mật khẩu chỉ vì nâng cấp. |
| Auth thành công nhưng không có quyền admin | UUID Auth phải tồn tại trong `pit_private.admins`; alias phải trỏ đến cùng UUID. User thường/host không tự có quyền quản trị. |
| Yêu cầu rời đội trước khi đổi tài khoản | Chọn **Leave Team** trước, hoặc xác nhận rõ cảnh báo trong Admin Access rồi bấm **Leave Team & sign in**. Lượt đang chạy sẽ kết thúc nếu rời. |

Owner có thể kiểm tra alias/allowlist trong SQL Editor:

```sql
select aa.username, aa.user_id,
       (a.user_id is not null) as allowlisted
from pit_private.admin_aliases aa
left join pit_private.admins a on a.user_id = aa.user_id
order by aa.username;
```

Đối chiếu UUID với **Authentication → Users** và trạng thái xác nhận email của user đó. Không đưa mật khẩu, secret/service-role key hoặc thông tin database vào `config.js`, source công khai hay ảnh báo cáo.

## Kiểm tra quyền xóa

- Dùng một lượt online thử nghiệm, không dùng dữ liệu cần giữ.
- Đăng nhập đúng admin và kiểm tra trạng thái **Global admin**.
- Xóa lượt thử qua công cụ quản trị, xác nhận theo yêu cầu của giao diện.
- Kiểm tra cùng lượt đã biến mất khỏi leaderboard, Just Finished, Replay và Event Log; lượt khác vẫn còn.
- Server phải kiểm tra quyền và ghi audit cho thao tác xóa. Chỉ thay giao diện không cấp được quyền xóa online.
- Đăng xuất, tải lại và kiểm tra leaderboard vẫn đọc được, công cụ xóa không còn quyền.

Việc thử Auth/Realtime/xóa trên Supabase thật cần owner thực hiện với tài khoản và dự án của mình. Xem `TEST_REPORT.md` để biết phần nào đã kiểm tra trong môi trường phát triển.
