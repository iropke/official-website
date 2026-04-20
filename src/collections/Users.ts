import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  /**
   * Payload 3.82.1 sessions 버그 우회 (Task #15).
   *
   * `auth: true` 기본값은 `useSessions: true` 로 동작한다. 이 모드에서는
   * 쿠키 JWT 의 sid 가 `users.sessions[]` 에 매칭되지 않으면 GET 은 통과
   * 하지만 PATCH/POST/DELETE 의 req.user 가 주입되지 않아 모든 mutation 이
   * 403 "You are not allowed to perform this action." 로 거부된다.
   * 로그아웃(POST /api/users/logout) 도 동일 원인으로 400 "No User" 반환.
   *
   * 증상 확인:
   *   - GET /api/users/me : 200 (user 반환)
   *   - PATCH /api/posts/5 (쿠키만): 403
   *   - PATCH /api/posts/5 (쿠키 + Authorization: JWT <token>): 200 성공
   *
   * 원인은 Payload 3.x 세션 매칭 로직의 sid 불일치이며, Fresh Chrome 프로필
   * 에서도 재현되므로 단순 쿠키/캐시 문제가 아님. useSessions 를 꺼 전통적
   * JWT 기반 인증으로 전환해 사이드이펙트 없이 복구한다.
   */
  auth: {
    useSessions: false,
  },
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
