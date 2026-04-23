import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, setUser } = useAuthState();
  const isLoginPage = to.path === "/login";
  const isOnboardingPage = to.path === "/onboarding";

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
    const needsOnboarding = user.value.role === "member" && !user.value.matricula;
    return navigateTo(needsOnboarding ? "/onboarding" : "/");
  }

  const isMember = user.value?.role === "member";

  if (user.value && isMember && !user.value.matricula && !isOnboardingPage) {
    return navigateTo("/onboarding");
  }

  if (user.value && (!isMember || user.value.matricula) && isOnboardingPage) {
    return navigateTo("/");
  }
});
