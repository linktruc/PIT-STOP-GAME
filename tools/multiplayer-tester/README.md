# Pit Stop Multiplayer Tester

Bản portable Windows: giải nén toàn bộ ZIP, mở **Open Tester.cmd**. Không chạy trực tiếp bên trong file ZIP. Cần Microsoft Edge đã cài trên máy; Node và Playwright Core đã được đóng gói trong bản portable.

1. Tạo phòng trong game của bạn.
2. Trong công cụ, dán link game/link mời, bấm **Tải phòng**, chọn đúng phòng. Có thể nhập tên và host trực tiếp.
3. Chọn số phiên, tiền tố tên và khoảng phản ứng, rồi bấm **Bắt đầu test**.
4. Đợi đủ người chơi Ready, sau đó bạn bấm **Start round** trong game. Các phiên tự ready ở lượt sau và tự bấm action khi được mở khóa.
5. Khi xong, chọn **Dừng và rời phòng** hoặc **Thoát app**. Đóng tab điều khiển không tự dừng test. Nếu dừng trong lượt đang chạy, game có thể hủy lượt theo luật rời phòng.

Mỗi phiên có cookie/local storage riêng và được server tính là người chơi thật. Role do server phân công. Công cụ không tạo bot nội bộ, không sửa đồng hồ/điểm hay giả lập hoàn thành task ở client. Bản đồ 2D ở các phiên phụ giảm tải máy; bạn vẫn xem animation 3D ở trình duyệt chơi chính. Tùy chọn hiện cửa sổ trình duyệt giúp xem các phiên phụ.

Số phiên tối đa là 14 để chừa ghế cho host; tổng số người trong phòng vẫn tối đa 15. Độ trễ phản ứng không bao gồm độ trễ mạng/RPC. Chỉ dùng với phòng bạn muốn test. Kết quả vẫn theo luật multiplayer hiện có, bao gồm bảng xếp hạng.

Cấu hình lần trước và nhật ký nằm ở `%LOCALAPPDATA%\PitStopTester`. Log chứa tên phiên, role, hành động, mã trạng thái và thời gian RPC; công cụ không ghi token đăng nhập, header hoặc nội dung RPC. Các phiên đăng nhập test chỉ tồn tại trong browser context tạm. Nút **Lưu log JSON** xuất nhật ký và cấu hình để kiểm tra sau.

Nếu không thấy phòng: kiểm tra tên, host, room còn ở trạng thái WAITING và link đúng bản deploy. Link Netlify có mã deploy cố định tiếp tục chạy bản deploy đó. Nếu test dừng do mạng lỗi, kiểm tra ghế còn lại trong phòng; host có thể xóa các ghế test chưa rời được.

## Source

Cần Node 20+ và Edge. Chạy `npm install`, rồi `npm start`. `npm test` kiểm tra cấu hình và bộ điều khiển action. `node tests/integration.mjs` kiểm tra end-to-end qua một game fixture cục bộ; không tự tạo/join phòng online. Source nằm riêng dưới `tools/multiplayer-tester`, không thay đổi website game.

Bản portable dùng Node.js và Playwright Core. Giấy phép được giữ trong `NODE_LICENSE.txt` và thư mục `node_modules/playwright-core`.
