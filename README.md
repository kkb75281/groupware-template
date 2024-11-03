# Groupware Template

Simple Groupware SaaS template with Skapi

## 세팅

- skapi 테스트 망 또는 서비스 망에서 trial 서비스를 생성합니다.
- skapi에서 user를 생성하고 admin (access_group: 99)으로 권한을 부여합니다.
- broadwayinc.com 어드민 패이지에서 생성한 서비스를 unlimited로 만듭니다. grant unlimited 메뉴 클릭. (권한은 kkb75281 님이 있습니다.)
- service.js에 service id와 owner id를 자신의 것으로 변경해주세요.

## 실행

아래와 같이 실행합니다.
```bash
npm run start # localhost:3000
```

또는 index.html 파일을 브라우저로 열어도 됩니다.

생성한 admin 계정으로 로그인해보세요.
