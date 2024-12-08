import axios from "axios";

const API_KEY = "7usOg98Rq9UoTyA3mm36KNygyWjMO4qf"; // Substitua pela chave da Giphy ou outro serviço
const BASE_URL = "https://api.giphy.com/v1/gifs"; // URL base para a API da Giphy

// Criando uma instância do axios com a URL base e chave da API
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY, // Chave de autenticação
  },
});

export const fetchTrendingGifs = async (limit: number = 10) => {
  try {
    const response = await api.get("/trending", {
      params: { limit }, // Quantidade de GIFs
    });
    return response.data.data; // Retorna os GIFs
  } catch (error) {
    console.error("Erro ao buscar GIFs em alta:", error);
    throw error;
  }
};

export const searchGifs = async (query: string, limit: number = 10) => {
  try {
    const response = await api.get("/search", {
      params: {
        q: query, // Termo de busca
        limit, // Quantidade de GIFs
      },
    });
    return response.data.data; // Retorna os GIFs
  } catch (error) {
    console.error("Erro ao buscar GIFs:", error);
    throw error;
  }
};
