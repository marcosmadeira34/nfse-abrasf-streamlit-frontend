let pluggyConnect; // Variável para armazenar a instância do Pluggy Connect

//function showSuccessAlert() {
  // Exibe um alerta como pop-up na tela com a mensagem de sucesso
  //window.alert('Integração concluída com sucesso! Você pode fechar esta janela.');
//}
function getCookie(name) {
  const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return cookieValue ? cookieValue.pop() : '';
}


function showErrorAlert() {
  // Exibe um alerta como pop-up na tela com a mensagem de erro
  window.alert('Ocorreu um erro ao conectar com o widget.');
}

function onSuccessCallback(itemData) {
  // Callback de sucesso na conexão com o widget
  // Implemente o que deseja fazer quando a conexão é bem-sucedida aqui
  
  console.log('Yay! Pluggy connect success!', itemData);

  fetch('/process_widget_data/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie("csrftoken")
    },
    body: JSON.stringify(itemData),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.message);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  // Exibir mensagem de conclusão
  //const statusMessage = document.getElementById("statusMessage");
  //statusMessage.textContent = "Integração concluída com sucesso!";
  //statusMessage.classList.add("alert", "alert-success");
  
  // Habilitar o botão novamente após a conclusão
  const button = document.getElementById("embedWidgetButton");
  button.disabled = false;
}

function onErrorCallback(error) {
  // Callback de erro na conexão com o widget
  // Implemente o que deseja fazer quando ocorre um erro na conexão aqui
  console.error('Whoops! Pluggy Connect error... ', error);
  showErrorAlert()
  // Exibir mensagem de erro
  //const statusMessage = document.getElementById("statusMessage");
  //statusMessage.textContent = "Erro: Ocorreu um erro ao conectar com o widget.";
  //statusMessage.classList.add("alert", "alert-danger");
  
  // Habilitar o botão novamente após o erro
  const button = document.getElementById("embedWidgetButton");
  button.disabled = false;
}

function startIntegration(accessToken) {
  
  openPluggyWidget(accessToken);
}

function openPluggyWidget(accessToken) {
  // Desabilitar o botão durante o processo de integração
  const button = document.getElementById("embedWidgetButton");
  button.disabled = true;

  pluggyConnect = new PluggyConnect({
    connectToken: accessToken,
    includeSandbox: true,
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
  });

  pluggyConnect.init();
}