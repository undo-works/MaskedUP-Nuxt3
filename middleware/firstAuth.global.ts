export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp();
  if (
    import.meta.client &&
    nuxtApp.isHydrating &&
    nuxtApp.payload.serverRendered
  ) {
    // const { refresh } = useAuth();
    try {
      // await refresh();
    } catch (error) {
      // navigateTo("/");
    }
  } else {
    return;
  }
});
