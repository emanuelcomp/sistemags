import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Plus, Search, Filter, Edit, Trash2, UserCheck, UserX, Download, FileText } from 'lucide-react';
import { profissionais, cidades, equipamentos, relatorios } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';

const Profissionais = () => {
  const [profissionaisList, setProfissionaisList] = useState([]);
  const [cidadesList, setCidadesList] = useState([]);
  const [equipamentosList, setEquipamentosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    status: 'ativo',
    cidade_id: '',
    equipamento_id: '',
    profissao: '',
    cargo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showInativarDialog, setShowInativarDialog] = useState(false);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [motivoInativacao, setMotivoInativacao] = useState('');
  const [error, setError] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchData();
  }, [filtros]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profissionaisData, cidadesData, equipamentosData] = await Promise.all([
        profissionais.listar(filtros),
        cidades.listar(),
        equipamentos.listar()
      ]);

      setProfissionaisList(profissionaisData);
      setCidadesList(cidadesData);
      setEquipamentosList(equipamentosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleInativar = async () => {
    if (!profissionalSelecionado || !motivoInativacao.trim()) {
      setError('Motivo da inativação é obrigatório');
      return;
    }

    try {
      await profissionais.inativar(profissionalSelecionado.id, motivoInativacao);
      setShowInativarDialog(false);
      setProfissionalSelecionado(null);
      setMotivoInativacao('');
      fetchData();
    } catch (error) {
      setError('Erro ao inativar profissional');
    }
  };

  const handleReativar = async (profissional) => {
    try {
      await profissionais.reativar(profissional.id);
      fetchData();
    } catch (error) {
      setError('Erro ao reativar profissional');
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await relatorios.gerarPDF(filtros);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_profissionais_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Erro ao gerar relatório PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await relatorios.gerarExcel(filtros);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_profissionais_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Erro ao gerar relatório Excel');
    }
  };

  const filteredProfissionais = profissionaisList.filter(prof =>
    prof.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.cpf.includes(searchTerm) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCidadeNome = (cidadeId) => {
    const cidade = cidadesList.find(c => c.id === cidadeId);
    return cidade ? cidade.nome : 'N/A';
  };

  const getEquipamentoNome = (equipamentoId) => {
    const equipamento = equipamentosList.find(e => e.id === equipamentoId);
    return equipamento ? equipamento.nome : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="mt-2 text-gray-600">
            Gerencie os profissionais cadastrados no sistema
          </p>
        </div>
        <div className="flex space-x-2">
          {hasPermission(2) && (
            <>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Link to="/profissionais/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Profissional
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome, CPF ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filtros.status} onValueChange={(value) => setFiltros({...filtros, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                  <SelectItem value="">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Select value={filtros.cidade_id} onValueChange={(value) => setFiltros({...filtros, cidade_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as cidades</SelectItem>
                  {cidadesList.map(cidade => (
                    <SelectItem key={cidade.id} value={cidade.id.toString()}>
                      {cidade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Equipamento</label>
              <Select value={filtros.equipamento_id} onValueChange={(value) => setFiltros({...filtros, equipamento_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os equipamentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os equipamentos</SelectItem>
                  {equipamentosList.map(equipamento => (
                    <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                      {equipamento.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Profissão</label>
              <Input
                placeholder="Filtrar por profissão..."
                value={filtros.profissao}
                onChange={(e) => setFiltros({...filtros, profissao: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Profissionais */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProfissionais.map((profissional) => (
          <Card key={profissional.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {profissional.nome_completo}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <span>{profissional.profissao}</span>
                        <span>•</span>
                        <span>{profissional.cargo}</span>
                        <span>•</span>
                        <span>{getEquipamentoNome(profissional.equipamento_id)}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>CPF: {profissional.cpf}</span>
                        <span>•</span>
                        <span>{profissional.email}</span>
                        <span>•</span>
                        <span>{getCidadeNome(profissional.cidade_id)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={profissional.ativo ? "default" : "secondary"}>
                        {profissional.ativo ? (
                          <>
                            <UserCheck className="mr-1 h-3 w-3" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <UserX className="mr-1 h-3 w-3" />
                            Inativo
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  {!profissional.ativo && profissional.motivo_inativacao && (
                    <div className="mt-2 p-2 bg-red-50 rounded-md">
                      <p className="text-sm text-red-700">
                        <strong>Motivo da inativação:</strong> {profissional.motivo_inativacao}
                      </p>
                      <p className="text-xs text-red-600">
                        Inativado em: {new Date(profissional.data_inativacao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>

                {hasPermission(2) && (
                  <div className="flex items-center space-x-2">
                    <Link to={`/profissionais/editar/${profissional.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {profissional.ativo ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setProfissionalSelecionado(profissional);
                          setShowInativarDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReativar(profissional)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProfissionais.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum profissional encontrado com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Inativação */}
      <Dialog open={showInativarDialog} onOpenChange={setShowInativarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inativar Profissional</DialogTitle>
            <DialogDescription>
              Informe o motivo da inativação de {profissionalSelecionado?.nome_completo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da inativação</label>
              <textarea
                className="w-full p-3 border rounded-md resize-none"
                rows={4}
                value={motivoInativacao}
                onChange={(e) => setMotivoInativacao(e.target.value)}
                placeholder="Descreva o motivo da inativação..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowInativarDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleInativar}>
                Inativar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profissionais;

