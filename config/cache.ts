// config/cache.ts

// Cache em memória simples (não persistente entre reinicializações)
const cache: { [key: string]: any } = {};

// Função para pegar dados do cache
export const getCache = (key: string) => {
  return cache[key] || null;
};

// Função para armazenar dados no cache
export const setCache = (key: string, value: any) => {
  cache[key] = value;
};

export const deleteCache = (key: string) => {
  const isWildcard = key.endsWith('*');
  if (isWildcard) {
    const prefix = key.slice(0, -1); // Remove o '*'
    for (const cacheKey in cache) {
      if (cacheKey.startsWith(prefix)) {
        delete cache[cacheKey];
      }
    }
  } else if (cache.hasOwnProperty(key)) {
    delete cache[key];
  }
};

// Função para verificar se os dados estão no cache ou retornar do banco de dados
export const getOrSetCache = async (key: string, fetchData: () => Promise<any>) => {
  try {
    // Verifica se os dados estão no cache
    const cachedData = getCache(key);
    if (cachedData) {
      console.log("Dados encontrados no cache");
      return cachedData;
    }

    // Se não estiver no cache, executa a função para buscar os dados
    console.log("Dados não encontrados no cache, consultando o banco...");
    const freshData = await fetchData();

    // Armazena os dados no cache
    setCache(key, freshData);

    return freshData;
  } catch (error) {
    console.error("Erro ao acessar o cache ou banco:", error);
    throw new Error("Erro ao acessar dados");
  }
};
