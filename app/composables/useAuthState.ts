import type { UserResponseDto } from "~/interfaces/UserResponseDto";

export const useAuthState = () => {
  const user = useState<UserResponseDto | null>("auth.user", () => null);
  const isAuthenticated = computed(() => user.value !== null);

  const setUser = (u: UserResponseDto | null) => {
    user.value = u;
  };

  return { user, isAuthenticated, setUser };
};
