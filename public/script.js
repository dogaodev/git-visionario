async function buscarNoYouTube() {
  const searchQuery = document.getElementById('search').value;
  const apiKey = 'visionario';  // A API Key que você definiu
  const url = `https://visionarioapi.netlify.app/api/youtube-search?search=${searchQuery}&api_key=${apiKey}`;

  try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
          console.error(data.error);
          return;
      }

      // Aqui você pode mostrar os resultados na página
      console.log(data);
  } catch (error) {
      console.error('Erro ao buscar no YouTube:', error);
  }
}
