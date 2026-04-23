export const useApi = () => {
  const { setUser } = useAuthState();

  return $fetch.create({
    onResponseError({ response }) {
      if (response.status === 401) {
        setUser(null);
        if (import.meta.client) {
          navigateTo("/login");
        }
      }
    },
  });
};
