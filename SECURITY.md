# 보안 설정 가이드 🔐

## API 키 설정 (중요!)

이 프로젝트는 **Google Gemini API**를 사용합니다. API 키를 안전하게 관리하기 위해 다음 단계를 따르세요.

### 1️⃣ .env 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

### 2️⃣ API 키 설정

`.env` 파일을 열고 Google Gemini API 키를 입력하세요:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3️⃣ API 키 얻기

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 방문
2. "Create API Key" 클릭
3. 생성된 키를 `.env` 파일에 붙여넣기

### ⚠️ 주의사항

- ❌ **절대 .env 파일을 Git에 커밋하지 마세요!**
- ✅ `.gitignore`에 `.env`가 포함되어 있습니다
- ❌ API 키를 소스 코드에 하드코드하지 마세요
- ✅ 환경 변수를 통해 안전하게 관리하세요

### 🔒 프로덕션 배포 시

호스팅 플랫폼(Vercel, Netlify, Heroku 등)에서 환경 변수를 설정하세요:

- **환경 변수명**: `VITE_GEMINI_API_KEY`
- **값**: 실제 Google Gemini API 키

### 📋 체크리스트

- [ ] `.env` 파일 생성
- [ ] API 키 입력
- [ ] `.env` 파일이 `.gitignore`에 있는지 확인
- [ ] `git status`로 `.env` 파일이 표시되지 않는지 확인

## 기타 보안 권장사항

1. **API 키 정기적 갱신**: 월 1회 이상 키 로테이션
2. **API 제한 설정**: Google Console에서 API 사용량 모니터링
3. **코드 리뷰**: API 키 누출 여부 정기적 확인
4. **시크릿 스캐너**: GitHub 시크릿 스캐너 활성화

---

더 궁금한 점이 있으면 프로젝트 관리자에게 문의하세요! 💚

