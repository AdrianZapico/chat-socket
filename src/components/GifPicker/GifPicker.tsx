import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GiftPicker.css";

// Tipagem das imagens
interface Gif {
  id: string;
  images: {
    fixed_height: {
      url: string;
    };
  };
}

// Tipagem para as props do componente
interface GifPickerProps {
  onSelectGif: (gifUrl: string) => void;
}

const API_KEY = "7usOg98Rq9UoTyA3mm36KNygyWjMO4qf"; // Chave da API da Giphy

// Função para buscar GIFs da API
const fetchGifs = async (): Promise<string[]> => {
  try {
    const response = await axios.get(
      `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=20`
    );
    return response.data.data.map((gif: Gif) => gif.images.fixed_height.url);
  } catch (error) {
    console.error("Erro ao carregar GIFs:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
};

const GifPicker: React.FC<GifPickerProps> = ({ onSelectGif }) => {
  const [gifs, setGifs] = useState<string[]>([]);

  useEffect(() => {
    // Chama a função de busca de GIFs e atualiza o estado
    const loadGifs = async () => {
      const gifUrls = await fetchGifs();
      setGifs(gifUrls);
    };

    loadGifs();
  }, []);

  return (
    <div className="gif-picker">
      {gifs.length === 0 ? (
        <p>Não foi possível carregar GIFs. Tente novamente.</p> // Exibe mensagem de erro se não houver GIFs
      ) : (
        gifs.map((gif, index) => (
          <img
            key={index}
            src={gif}
            alt={`GIF ${index}`}
            onClick={() => onSelectGif(gif)} // Passa o GIF selecionado
            className="gif-item"
          />
        ))
      )}
    </div>
  );
};

export default GifPicker;
