let _ip = "";
let _user = null;
const autoLogin = window.localStorage.getItem("autoLogin") === 'true';
const SERVICE_ID = "ap214UHTHgvr8ZLYxckv";
const OWNER_ID = "4d4a36a5-b318-4093-92ae-7cf11feae989";
const _bleedingEdge = { "hostDomain": "skapi.app", "target_cdn": "d1wrj5ymxrt2ir", "network_logs": true }; // 테스트 망에서의 옵션

const skapi = new Skapi(SERVICE_ID, OWNER_ID, { autoLogin }, _bleedingEdge);

// html끼워넣는 함수 (spa framework 경우 필요없음)
const insertComponent = async (loc, parent) => {
    await skapi.__connection;
    return fetch(loc)
        .then(res => res.text())
        .then(html => {
            parent.innerHTML = html;
            // run script
            const scripts = parent.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.head.appendChild(newScript).parentNode.removeChild(newScript);
            });
        });
}

// 사용자 접속 정보
skapi.getConnectionInfo().then((info) => {
    _ip = info.user_ip;
    if(window._el_ip_info) _el_ip_info.innerText = "IP:" + _ip;
});

// 사용자 로그인 콜백. 사용자가 로그인, 로그아웃, 프로필수정 하면 호출됨. 로그아웃하면 null이 넘어옴
skapi.onLogin = (user)=>{
    _user = user;
    console.log(_user);
    if(user === null) {
        window.location = "index.html"; // 로그인 페이지로 이동
    }
}
