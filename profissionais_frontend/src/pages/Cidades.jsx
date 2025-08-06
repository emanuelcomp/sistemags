import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MapPin, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { cidades } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';

const Cidades = () => {
  const [cidadesList, setCidadesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingCidade, setEditingCidade] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    status: 'ativo'
  });

  const { hasPermission } = useAuth();

  useEffect(() => {
    if (!hasPermission(3)) {
      return;
    }
    fetchData();
  }, [hasPermission]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cidadesData = await cidades.listar();
      setCidadesList(cidadesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      setError('Erro ao carregar cidades');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingCidade) {
        await cidades.atualizar(editingCidade.id, formData);
        setSuccess('Cidade atualizada com sucesso!');
      } else {
        await cidades.criar(formData);
        setSuccess('Cidade cadastrada com sucesso!');
      }
      
      setShowDialog(false);
      setEditingCidade(null);
      setFormData({ nome: '', status: 'ativo' });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar cidade');
    }
  };

  const handleEdit = (cidade) => {
    setEditingCidade(cidade);
    setFormData({
      nome: cidade.nome,
      status: cidade.status
    });
    setShowDialog(true);
  };

  const handleDelete = async (cidade) => {
    if (window.confirm(`Tem certeza que deseja inativar a cidade "${cidade.nome}"?`)) {
      try {
        await cidades.deletar(cidade.id);
        setSuccess('Cidade inativada com sucesso!');
        fetchData();
      } catch (error) {
        setError('Erro ao inativar cidade');
      }
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingCidade(null);
    setFormData({ nome: '', status: 'ativo' });
    setError('');
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cidades</h1>
          <p className="mt-2 text-gray-600">
            Gerencie as cidades do sistema
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Cidade
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCidade ? 'Editar Cidade' : 'Nova Cidade'}
              </DialogTitle>
              <DialogDescription>
                {editingCidade ? 'Atualize as informações da cidade' : 'Cadastre uma nova cidade no sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Cidade *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                  placeholder="Digite o nome da cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingCidade ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && !showDialog && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cidadesList.map((cidade) => (
          <Card key={cidade.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MapPin className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{cidade.nome}</CardTitle>
                    <Badge variant={cidade.status === 'ativo' ? "default" : "secondary"}>
                      {cidade.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(cidade)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(cidade)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500">
                Cadastrada em: {new Date(cidade.data_cadastro).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cidadesList.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma cidade cadastrada.</p>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Primeira Cidade
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Cidades;

