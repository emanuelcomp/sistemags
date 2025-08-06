import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { FileText, Filter, Calendar, User, Database, Activity } from 'lucide-react';
import { auditoria, usuarios } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';

const Auditoria = () => {
  const [auditoriaList, setAuditoriaList] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    tabela: '',
    acao: '',
    usuario_id: '',
    data_inicio: '',
    data_fim: ''
  });

  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission(3)) {
      return;
    }
    fetchData();
  }, [hasPermission, filtros]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [auditoriaData, usuariosData, estatisticasData] = await Promise.all([
        auditoria.listar(filtros),
        usuarios.listar(),
        auditoria.estatisticas()
      ]);
      
      setAuditoriaList(auditoriaData);
      setUsuariosList(usuariosData);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioNome = (usuarioId) => {
    const usuario = usuariosList.find(u => u.id === usuarioId);
    return usuario ? usuario.nome_completo : 'Usuário não encontrado';
  };

  const getAcaoColor = (acao) => {
    switch (acao) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'EXPORT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAcaoTexto = (acao) => {
    switch (acao) {
      case 'CREATE': return 'Criação';
      case 'UPDATE': return 'Atualização';
      case 'DELETE': return 'Exclusão';
      case 'EXPORT': return 'Exportação';
      default: return acao;
    }
  };

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  if (!hasPermission(3)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Auditoria</h1>
        <p className="mt-2 text-gray-600">
          Visualize o histórico de ações realizadas no sistema
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações por Tipo</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {estatisticas.acoes.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Badge className={getAcaoColor(item.acao)}>
                      {getAcaoTexto(item.acao)}
                    </Badge>
                    <span className="text-sm font-medium">{item.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tabelas Mais Alteradas</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {estatisticas.tabelas.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{item.tabela}</span>
                    <span className="text-sm font-medium">{item.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Mais Ativos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {estatisticas.usuarios.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm truncate">{item.usuario}</span>
                    <span className="text-sm font-medium">{item.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tabela</label>
              <Select value={filtros.tabela} onValueChange={(value) => setFiltros({...filtros, tabela: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as tabelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as tabelas</SelectItem>
                  <SelectItem value="profissionais">Profissionais</SelectItem>
                  <SelectItem value="usuarios">Usuários</SelectItem>
                  <SelectItem value="cidades">Cidades</SelectItem>
                  <SelectItem value="equipamentos">Equipamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ação</label>
              <Select value={filtros.acao} onValueChange={(value) => setFiltros({...filtros, acao: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criação</SelectItem>
                  <SelectItem value="UPDATE">Atualização</SelectItem>
                  <SelectItem value="DELETE">Exclusão</SelectItem>
                  <SelectItem value="EXPORT">Exportação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <Select value={filtros.usuario_id} onValueChange={(value) => setFiltros({...filtros, usuario_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os usuários</SelectItem>
                  {usuariosList.map(usuario => (
                    <SelectItem key={usuario.id} value={usuario.id.toString()}>
                      {usuario.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Auditoria */}
      <div className="space-y-4">
        {auditoriaList.map((registro) => (
          <Card key={registro.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge className={getAcaoColor(registro.acao)}>
                      {getAcaoTexto(registro.acao)}
                    </Badge>
                    <span className="text-sm font-medium capitalize">
                      {registro.tabela}
                    </span>
                    <span className="text-sm text-gray-500">
                      ID: {registro.registro_id}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Usuário:</span> {getUsuarioNome(registro.usuario_id)}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Data/Hora:</span> {formatarData(registro.data_hora)}
                  </div>
                  
                  {registro.ip_origem && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">IP:</span> {registro.ip_origem}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dados alterados */}
              {(registro.dados_antigos || registro.dados_novos) && (
                <div className="mt-4 pt-4 border-t">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                      Ver detalhes das alterações
                    </summary>
                    <div className="mt-2 space-y-2">
                      {registro.dados_antigos && (
                        <div>
                          <span className="text-sm font-medium text-red-600">Dados anteriores:</span>
                          <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(registro.dados_antigos, null, 2)}
                          </pre>
                        </div>
                      )}
                      {registro.dados_novos && (
                        <div>
                          <span className="text-sm font-medium text-green-600">Dados novos:</span>
                          <pre className="text-xs bg-green-50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(registro.dados_novos, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {auditoriaList.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum registro de auditoria encontrado com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Auditoria;

