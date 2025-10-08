// auth.d.ts
declare module '#auth-utils' {
  interface User {
    sub: string
  email?: string
  name?: string
  username?: string
  }
}

export {}
