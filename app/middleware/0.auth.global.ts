import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, setUser } = useAuthState();
  const isLoginPage = to.path === "/login";

  if (user.value === null) {
    try {
      const fetch = useRequestFetch();
      const me = await fetch<UserResponseDto>("/api/auth/me");
      setUser(me);
    } catch {
      if (isLoginPage) return;
      return navigateTo("/login");
    }
  }

  if (user.value && isLoginPage) {
    return navigateTo("/");
  }
});
