export function reservationEmailHtml({
  name,
  popup,
  place,
  timeSlot,
  headcount,
}: {
  name: string;
  popup: string;
  place: string;
  timeSlot: string;
  headcount: string;
}) {
  return `
    <div style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#2c2a26;background:#f8f5f0;padding:32px 24px;border-radius:16px;">
      <p style="font-size:12px;letter-spacing:0.2em;color:#c9b99a;margin:0 0 8px;">일오책방</p>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 24px;">예약이 접수되었습니다</h1>
      <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e8e2d9;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#8a8480;width:80px;">이름</td><td style="padding:8px 0;font-weight:500;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">팝업</td><td style="padding:8px 0;font-weight:500;">${popup}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">장소</td><td style="padding:8px 0;">${place}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">시간</td><td style="padding:8px 0;">${timeSlot}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">인원</td><td style="padding:8px 0;">${headcount}명</td></tr>
        </table>
      </div>
      <p style="font-size:13px;color:#8a8480;line-height:1.7;margin:0 0 8px;">
        예약 확정 안내는 이메일 또는 문자로 별도 발송됩니다.<br/>
        문의사항은 인스타그램 @ilochekbang으로 연락해주세요.
      </p>
      <p style="font-size:12px;color:#b0aba4;margin:24px 0 0;">일오책방 · @ilochekbang</p>
    </div>
  `;
}

export function reservationConfirmedEmailHtml({
  name,
  popup,
  place,
  timeSlot,
  headcount,
}: {
  name: string;
  popup: string;
  place: string;
  timeSlot: string;
  headcount: string;
}) {
  return `
    <div style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#2c2a26;background:#f8f5f0;padding:32px 24px;border-radius:16px;">
      <p style="font-size:12px;letter-spacing:0.2em;color:#c9b99a;margin:0 0 8px;">일오책방</p>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">예약이 확정되었습니다 🎉</h1>
      <p style="font-size:14px;color:#6b6760;margin:0 0 24px;line-height:1.7;">
        ${name}님의 예약이 확정되었어요.<br/>
        아래 일정을 확인해주세요!
      </p>
      <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #e8e2d9;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#8a8480;width:80px;">이름</td><td style="padding:8px 0;font-weight:500;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">팝업</td><td style="padding:8px 0;font-weight:500;">${popup}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">장소</td><td style="padding:8px 0;">${place}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">시간</td><td style="padding:8px 0;">${timeSlot}</td></tr>
          <tr><td style="padding:8px 0;color:#8a8480;">인원</td><td style="padding:8px 0;">${headcount}명</td></tr>
        </table>
      </div>
      <div style="background:#2c2a26;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="font-size:13px;color:#c9b99a;margin:0 0 4px;font-weight:500;">📌 안내사항</p>
        <p style="font-size:13px;color:#f0ebe3;line-height:1.7;margin:0;">
          예약 시간 10분 전까지 도착해주세요.<br/>
          취소 및 문의는 인스타그램 DM으로 해주세요.
        </p>
      </div>
      <a href="https://www.ilobookcafe.com" style="display:inline-block;background:#2c2a26;color:#f8f5f0;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:500;">
        일오책방 방문하기
      </a>
      <p style="font-size:12px;color:#b0aba4;margin:24px 0 0;">일오책방 · @ilochekbang</p>
    </div>
  `;
}

export function welcomeEmailHtml({ name }: { name: string }) {
  return `
    <div style="max-width:480px;margin:0 auto;font-family:sans-serif;color:#2c2a26;background:#f8f5f0;padding:32px 24px;border-radius:16px;">
      <p style="font-size:12px;letter-spacing:0.2em;color:#c9b99a;margin:0 0 8px;">일오책방</p>
      <h1 style="font-size:20px;font-weight:700;margin:0 0 12px;">환영합니다, ${name}님!</h1>
      <p style="font-size:14px;color:#6b6760;line-height:1.8;margin:0 0 24px;">
        일오책방 회원이 되어주셔서 감사해요.<br/>
        조용히 책 읽고 쉬어가는 팝업 북카페에서<br/>
        좋은 시간 보내시길 바랍니다.
      </p>
      <a href="https://www.ilobookcafe.com" style="display:inline-block;background:#2c2a26;color:#f8f5f0;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:500;">
        일오책방 방문하기
      </a>
      <p style="font-size:12px;color:#b0aba4;margin:24px 0 0;">일오책방 · @ilochekbang</p>
    </div>
  `;
}