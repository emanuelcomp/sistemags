import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { UserCog, Plus, Edit, Trash2, Save, X, Shield, Eye, Edit3, Crown } from 'lucide-react';
import { usuarios, cidades } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';

const Usuarios = () => {
  const [usuariosList, setUsuariosList] = useState([]);
  const [cidadesList, setCidadesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    senha: '',
    nivel_acesso: 1,
    cidade_id: ''
  });

  const { hasPermission, user } = useAuth();

  useEffect(() => {
    if (!hasPermission(3)) {
      return;
    }
    fetchData();
  }, [hasPermission]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usuariosData, cidadesData] = await Promise.all([
        usuarios.listar(),
        cidades.listar()
      ]);
      setUsuariosList(usuariosData);
      setCidadesList(cidadesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = { ...formData };
      
      // Se não tem senha e está editando, remover o campo senha
      if (editingUsuario && !submitData.senha) {
        delete submitData.senha;
      }

      // Converter cidade_id para número ou null
      if (submitData.cidade_id === '') {
        submitData.cidade_id = null;
      } else {
        submitData.cidade_id = parseInt(submitData.cidade_id);
      }

      if (editingUsuario) {
        await usuarios.atualizar(editingUsuario.id, submitData);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        await usuarios.criar(submitData);
        setSuccess('Usuário cadastrado com sucesso!');
      }
      
      setShowDialog(false);
      setEditingUsuario(null);
      setFormData({
        nome_completo: '',
        email: '',
        senha: '',
        nivel_acesso: 1,
        cidade_id: ''
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar usuário');
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome_completo: usuario.nome_completo,
      email: usuario.email,
      senha: '',
      nivel_acesso: usuario.nivel_acesso,
      cidade_id: usuario.cidade_id ? usuario.cidade_id.toString() : ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (usuario) => {
    if (usuario.id === user.id) {
      setError('Você não pode deletar seu próprio usuário');
      return;
    }

    if (window.confirm(`Tem certeza que deseja deletar o usuário "${usuario.nome_completo}"?`)) {
      try {
        await usuarios.deletar(usuario.id);
        setSuccess('Usuário deletado com sucesso!');
        fetchData();
      } catch (error) {
        setError('Erro ao deletar usuário');
      }
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingUsuario(null);
    setFormData({
      nome_completo: '',
      email: '',
      senha: '',
      nivel_acesso: 1,
      cidade_id: ''
    });
    setError('');
  };

  const getNivelAcessoIcon = (nivel) => {
    switch (nivel) {
      case 1: return <Eye className="h-4 w-4" />;
      case 2: return <Edit3 className="h-4 w-4" />;
      case 3: return <Shield className="h-4 w-4" />;
      case 4: return <Crown className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getNivelAcessoTexto = (nivel) => {
    switch (nivel) {
      case 1: return 'Visualização';
      case 2: return 'Editor';
      case 3: return 'Admin Cidade';
      case 4: return 'Admin Global';
      default: return 'Visualização';
    }
  };

  const getNivelAcessoColor = (nivel) => {
    switch (nivel) {
      case 1: return 'bg-gray-100 text-gray-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      case 4: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCidadeNome = (cidadeId) => {
    if (!cidadeId) return 'Todas as cidades';
    const cidade = cidadesList.find(c => c.id === cidadeId);
    return cidade ? cidade.nome : 'N/A';
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
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="mt-2 text-gray-600">
            Gerencie os usuários e seus níveis de acesso
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUsuario ? 'Atualize as informações do usuário' : 'Cadastre um novo usuário no sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">
                  Senha {editingUsuario ? '(deixe em branco para manter a atual)' : '*'}
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  required={!editingUsuario}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel_acesso">Nível de Acesso *</Label>
                <Select 
                  value={formData.nivel_acesso.toString()} 
                  onValueChange={(value) => setFormData({...formData, nivel_acesso: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Visualização</SelectItem>
                    <SelectItem value="2">Editor</SelectItem>
                    <SelectItem value="3">Admin Cidade</SelectItem>
                    {user?.nivel_acesso === 4 && (
                      <SelectItem value="4">Admin Global</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade_id">Cidade</Label>
                <Select 
                  value={formData.cidade_id} 
                  onValueChange={(value) => setFormData({...formData, cidade_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades (Admin Global)</SelectItem>
                    {cidadesList.map(cidade => (
                      <SelectItem key={cidade.id} value={cidade.id.toString()}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingUsuario ? 'Atualizar' : 'Cadastrar'}
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

      <div className="grid grid-cols-1 gap-4">
        {usuariosList.map((usuario) => (
          <Card key={usuario.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCog className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {usuario.nome_completo}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>{usuario.email}</span>
                      <span>•</span>
                      <span>{getCidadeNome(usuario.cidade_id)}</span>
                    </div>
                    <div className="mt-2">
                      <Badge className={`${getNivelAcessoColor(usuario.nivel_acesso)} border-0`}>
                        <span className="flex items-center space-x-1">
                          {getNivelAcessoIcon(usuario.nivel_acesso)}
                          <span>{getNivelAcessoTexto(usuario.nivel_acesso)}</span>
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(usuario)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {usuario.id !== user.id && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(usuario)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {usuariosList.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <UserCog className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum usuário encontrado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Usuarios;

