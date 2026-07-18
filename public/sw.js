self.addEventListener("push", (event) => {
  let dados = { titulo: "Rota CMB", corpo: "Você tem uma nova atualização.", url: "/" };

  try {
    if (event.data) {
      dados = { ...dados, ...event.data.json() };
    }
  } catch (erro) {
    console.log("Erro ao ler payload do push:", erro);
  }

  event.waitUntil(
    self.registration.showNotification(dados.titulo, {
      body: dados.corpo,
      icon: "/notification-icon.png",
      data: { url: dados.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((janelas) => {
      for (const janela of janelas) {
        if (janela.url.includes(url) && "focus" in janela) {
          return janela.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
