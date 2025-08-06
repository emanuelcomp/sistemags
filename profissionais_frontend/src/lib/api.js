import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: '/api', // Usar caminho relativo para funcionar tanto em dev quanto em produção
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções de autenticação
export const auth = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Funções para cidades
export const cidades = {
  listar: async () => {
    const response = await api.get('/cidades');
    return response.data;
  },
  
  criar: async (cidadeData) => {
    const response = await api.post('/cidades', cidadeData);
    return response.data;
  },
  
  atualizar: async (id, cidadeData) => {
    const response = await api.put(`/cidades/${id}`, cidadeData);
    return response.data;
  },
  
  deletar: async (id) => {
    const response = await api.delete(`/cidades/${id}`);
    return response.data;
  }
};

// Funções para equipamentos
export const equipamentos = {
  listar: async () => {
    const response = await api.get('/equipamentos');
    return response.data;
  },
  
  criar: async (equipamentoData) => {
    const response = await api.post('/equipamentos', equipamentoData);
    return response.data;
  },
  
  atualizar: async (id, equipamentoData) => {
    const response = await api.put(`/equipamentos/${id}`, equipamentoData);
    return response.data;
  },
  
  deletar: async (id) => {
    const response = await api.delete(`/equipamentos/${id}`);
    return response.data;
  },
  
  listarProfissionais: async (id, status = 'ativo') => {
    const response = await api.get(`/equipamentos/${id}/profissionais?status=${status}`);
    return response.data;
  }
};

// Funções para profissionais
export const profissionais = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await api.get(`/profissionais?${params.toString()}`);
    return response.data;
  },
  
  obter: async (id) => {
    const response = await api.get(`/profissionais/${id}`);
    return response.data;
  },
  
  criar: async (profissionalData) => {
    const response = await api.post('/profissionais', profissionalData);
    return response.data;
  },
  
  atualizar: async (id, profissionalData) => {
    const response = await api.put(`/profissionais/${id}`, profissionalData);
    return response.data;
  },
  
  inativar: async (id, motivo) => {
    const response = await api.delete(`/profissionais/${id}`, {
      data: { motivo_inativacao: motivo }
    });
    return response.data;
  },
  
  reativar: async (id) => {
    const response = await api.put(`/profissionais/${id}/reativar`);
    return response.data;
  }
};

// Funções para usuários
export const usuarios = {
  listar: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },
  
  criar: async (usuarioData) => {
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
  },
  
  atualizar: async (id, usuarioData) => {
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  },
  
  deletar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};

// Funções para auditoria
export const auditoria = {
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await api.get(`/auditoria?${params.toString()}`);
    return response.data;
  },
  
  estatisticas: async () => {
    const response = await api.get('/auditoria/estatisticas');
    return response.data;
  }
};

// Funções para relatórios
export const relatorios = {
  gerarPDF: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await api.get(`/relatorios/profissionais/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  gerarExcel: async (filtros = {}) => {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params.append(key, filtros[key]);
      }
    });
    
    const response = await api.get(`/relatorios/profissionais/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  obterEstatisticas: async () => {
    const response = await api.get('/relatorios/estatisticas');
    return response.data;
  }
};

export default api;

