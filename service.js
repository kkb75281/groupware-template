let _ip = "";
let _user = null;
const autoLogin = window.localStorage.getItem("autoLogin") === 'true';
const SERVICE_ID = "ap214UHTHgvr8ZLYxckv";
const OWNER_ID = "4d4a36a5-b318-4093-92ae-7cf11feae989";
const _bleedingEdge = { "hostDomain": "skapi.app", "target_cdn": "d1wrj5ymxrt2ir", "network_logs": true }; // 테스트 망에서의 옵션

const skapi = new Skapi(SERVICE_ID, OWNER_ID, { autoLogin }, _bleedingEdge);

const maxEmp = 1000;

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
    if (window._el_ip_info) _el_ip_info.innerText = "IP:" + _ip;
});


let RealtimeCallback = (rt) => { // 실시간 통신 (노티피케이션 / 체팅 등등)
    // Callback executed when there is data transfer between the users.
    /**
    rt = {
        type: 'message' | 'private' | 'error' | 'success' | 'close' | 'notice',
        message: '...',
        ...
    }
    */
    if (rt.type === 'success') {
        if (rt.message === 'Connected to WebSocket server.') {
            // 실시간 통신 연결 성공
            // 과거 결제 요청 목록 가져오기

            skapi.getRecords(
                {
                    table: {
                        name: 'audit_request',
                        access_group: 'authorized'
                    },
                    reference: `audit:${_user.user_id}`
                },
                {
                    ascending: false, // 최신순
                }
            ).then(audits => {
                console.log('audits:', audits); // 들어온 결제 요청
            }).catch(err => null);

            skapi.getRecords({ // 결제 완료된 목록 가져오기
                table: {
                    name: 'audit_approval',
                    access_group: 'authorized'
                },
                tag: _user.user_id.replaceAll('-', '_'),
            }).then(approvals => {
                console.log('approvals:', approvals);
            }).catch(err => null);
        }
    }

    if (rt.type === 'private') { // 개인 메시지
        if (rt.message?.audit_request) {
            // 결제 요청이 들어옴
            let audit_request = rt.message.audit_request;
            console.log('audit_request:', audit_request);
        }
        if (rt.message?.audit_approval) {
            // 결제 완료 알림
            let audit_approval = rt.message.audit_approval;
            console.log('audit_approval:', audit_approval);
        }

        if (rt.sender !== _user.user_id) {
            let notification_count = document.getElementById('notification_count');
            console.log(notification_count.innerText);
            notification_count.innerText = (parseInt(notification_count.innerText) + 1).toString();
            window.sessionStorage.setItem(`notification_count:${_user.user_id}`, notification_count.innerText); // notification count 가져오기
        }
    }

    console.log(rt);
}

// 사용자 로그인 콜백. 사용자가 로그인, 로그아웃, 프로필수정 하면 호출됨. 로그아웃하면 null이 넘어옴
skapi.onLogin = (user) => {
    _user = user;
    if (!_user) {
        console.log(window.location.pathname);
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
        return;
    }

    console.log('user:', _user);
    // 결제 창구

    let misc = JSON.parse(_user.misc || '{}');

    if (!misc.logged) { // 첫 로그인이고 관리자 권한 이상인 경우
        skapi.postRecord(null, { // 결제 창구 만들기
            unique_id: `audit:${_user.user_id}`,
            table: {
                name: 'audit',
                access_group: 'authorized',
            },
            source: {
                can_remove_referencing_records: true,
            }
        }).catch(err => console.error({ err }));

        misc.logged = true; // 로그인 후 한번만 실행
        skapi.updateProfile({ misc: JSON.stringify(misc) }).catch(err => console.error({ err }));
    }

    skapi.connectRealtime(RealtimeCallback);
}
