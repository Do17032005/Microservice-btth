# HƯỚNG DẪN TRIỂN KHAI VÀ CHẠY DỰ ÁN MICROSERVICES (SRS-RHL-002)

Dự án được xây dựng theo kiến trúc **Microservices chuẩn với Spring Cloud, Docker, Kafka, Redis, Eureka, Gateway và PostgreSQL**.

---

## CÁCH 1: TRIỂN KHAI BẰNG DOCKER COMPOSE (KHUYẾN NGHỊ CHO BÁO CÁO / NỘP BÀI)

Khi thầy cô yêu cầu demo hoặc nộp bài, chỉ cần thực hiện 2 lệnh:

### Bước 1: Build các file JAR
Mở terminal tại thư mục gốc của dự án (`c:\Users\ADMIN\Desktop\hdxvgh`) và chạy:
```powershell
cd eureka-server; ./mvnw clean package -DskipTests; cd ..
cd api-gateway;   ./mvnw clean package -DskipTests; cd ..
cd rhl;           ./mvnw clean package -DskipTests; cd ..
cd payment-service; ./mvnw clean package -DskipTests; cd ..
```

### Bước 2: Khởi chạy toàn bộ hệ thống bằng 1 lệnh duy nhất
```bash
docker compose up -d --build
```

### Các Container sẽ tự động chạy:
1. `rhl-postgres` (Port 5432) - Cơ sở dữ liệu PostgreSQL
2. `rhl-redis` (Port 6379) - Redis Caching & Spatial Indexing (Session 11)
3. `rhl-zookeeper` (Port 2181) & `rhl-kafka` (Port 9092) - Event Message Broker (Session 10)
4. `rhl-eureka-server` (Port 8761) - Service Registry (Session 04)
5. `rhl-api-gateway` (Port 8000) - API Gateway (Session 05, 06)
6. `rhl-trip-service` (Port 8081) - Trip, Pricing, Dispatch, Chat (Session 01-03, 07, 13-15)
7. `rhl-payment-service` (Port 8083) - Payment & Wallet Ledger (Session 07, 10)

Để dừng hệ thống:
```bash
docker compose down
```

---

## CÁCH 2: CHẠY TRỰC TIẾP TRÊN MÁY BẰNG JAVA / IDE (NHẸ MÁY CHO CODE & TEST HÀNG NGÀY)

Khi bạn muốn lập trình và thử nghiệm nhanh mà không cần bật Docker Desktop:

1. **Khởi động Eureka Server**:
   ```powershell
   cd c:\Users\ADMIN\Desktop\hdxvgh\eureka-server
   ./mvnw spring-boot:run
   ```
   *Dashboard kiểm tra*: `http://localhost:8761`

2. **Khởi động API Gateway**:
   ```powershell
   cd c:\Users\ADMIN\Desktop\hdxvgh\api-gateway
   ./mvnw spring-boot:run
   ```
   *Cổng vào chung của toàn hệ thống*: `http://localhost:8000`

3. **Khởi động Trip Service**:
   ```powershell
   cd c:\Users\ADMIN\Desktop\hdxvgh\rhl
   ./mvnw spring-boot:run
   ```

4. **Khởi động Payment Service**:
   ```powershell
   cd c:\Users\ADMIN\Desktop\hdxvgh\payment-service
   ./mvnw spring-boot:run
   ```

---

## DANH MỤC CÁC ENDPOINT CHÍNH (GỌI QUA GATEWAY PORT 8000)

* **Đăng ký tài khoản**: `POST http://localhost:8000/api/v1/auth/register`
* **Đăng nhập**: `POST http://localhost:8000/api/v1/auth/login`
* **Làm mới Token (Refresh Token)**: `POST http://localhost:8000/api/v1/auth/refresh`
* **Báo giá cuốc xe (Pricing & Surge)**: `POST http://localhost:8000/api/v1/pricing/quotes`
* **Tìm tài xế xung quanh**: `GET http://localhost:8000/api/v1/locations/nearby-drivers`
* **Tạo cuốc xe**: `POST http://localhost:8000/api/v1/trips`
* **Tài xế nhận cuốc**: `POST http://localhost:8000/api/v1/offers/{offerId}/accept`
* **Thanh toán & Cộng ví**: `POST http://localhost:8000/api/v1/payments/process`
* **Đánh giá tài xế (1-5 sao)**: `POST http://localhost:8000/api/v1/trips/{tripId}/rating`
* **Chat trong chuyến (REST Fallback)**: `POST http://localhost:8000/api/v1/trips/{tripId}/chat`
