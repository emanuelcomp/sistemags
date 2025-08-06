import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Save } from 'lucide-react';
import { profissionais, cidades, equipamentos } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';

const ProfissionalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nome_completo: '',
    data_nascimento: '',
    cpf: '',
    rg: '',
    data_expedicao_rg: '',
    escolaridade: '',
    profissao: '',
    cargo: '',
    vinculo_institucional: '',
    telefone: '',
    email: '',
    data_inicio_trabalho: '',
    endereco_residencial: '',
    cidade_id: '',
    equipamento_id: ''
  });

  const [cidadesList, setCidadesList] = useState([]);
  const [equipamentosList, setEquipamentosList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!hasPermission(2)) {
      navigate('/profissionais');
      return;
    }

    fetchData();
  }, [id, hasPermission, navigate]);

  const fetchData = async () => {
    try {
      const [cidadesData, equipamentosData] = await Promise.all([
        cidades.listar(),
        equipamentos.listar()
      ]);

      setCidadesList(cidadesData);
      setEquipamentosList(equipamentosData);

      if (isEditing) {
        const profissionalData = await profissionais.obter(id);
        setFormData({
          ...profissionalData,
          data_nascimento: profissionalData.data_nascimento?.split('T')[0] || '',
          data_expedicao_rg: profissionalData.data_expedicao_rg?.split('T')[0] || '',
          data_inicio_trabalho: profissionalData.data_inicio_trabalho?.split('T')[0] || ''
        });
      }
    } catch (error) {
      setError('Erro ao carregar dados');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        await profissionais.atualizar(id, formData);
        setSuccess('Profissional atualizado com sucesso!');
      } else {
        await profissionais.criar(formData);
        setSuccess('Profissional cadastrado com sucesso!');
        // Limpar formulário após criação
        setFormData({
          nome_completo: '',
          data_nascimento: '',
          cpf: '',
          rg: '',
          data_expedicao_rg: '',
          escolaridade: '',
          profissao: '',
          cargo: '',
          vinculo_institucional: '',
          telefone: '',
          email: '',
          data_inicio_trabalho: '',
          endereco_residencial: '',
          cidade_id: '',
          equipamento_id: ''
        });
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };

  const escolaridadeOptions = [
    'Ensino Fundamental Incompleto',
    'Ensino Fundamental Completo',
    'Ensino Médio Incompleto',
    'Ensino Médio Completo',
    'Ensino Superior Incompleto',
    'Ensino Superior Completo',
    'Pós-graduação',
    'Mestrado',
    'Doutorado'
  ];

  const vinculoOptions = [
    'Servidor Público',
    'CLT',
    'Terceirizado',
    'Estagiário',
    'Voluntário',
    'Cooperado',
    'Autônomo'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/profissionais')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Profissional' : 'Novo Profissional'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Atualize as informações do profissional' : 'Cadastre um novo profissional no sistema'}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Informações básicas do profissional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rg">RG *</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_expedicao_rg">Data de Expedição do RG *</Label>
                <Input
                  id="data_expedicao_rg"
                  type="date"
                  value={formData.data_expedicao_rg}
                  onChange={(e) => handleInputChange('data_expedicao_rg', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escolaridade">Escolaridade *</Label>
                <Select value={formData.escolaridade} onValueChange={(value) => handleInputChange('escolaridade', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escolaridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {escolaridadeOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco_residencial">Endereço Residencial *</Label>
              <textarea
                id="endereco_residencial"
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
                value={formData.endereco_residencial}
                onChange={(e) => handleInputChange('endereco_residencial', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Profissionais</CardTitle>
            <CardDescription>Informações sobre a atuação profissional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão *</Label>
                <Input
                  id="profissao"
                  value={formData.profissao}
                  onChange={(e) => handleInputChange('profissao', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vinculo_institucional">Vínculo Institucional *</Label>
                <Select value={formData.vinculo_institucional} onValueChange={(value) => handleInputChange('vinculo_institucional', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o vínculo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vinculoOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_inicio_trabalho">Data de Início do Trabalho *</Label>
                <Input
                  id="data_inicio_trabalho"
                  type="date"
                  value={formData.data_inicio_trabalho}
                  onChange={(e) => handleInputChange('data_inicio_trabalho', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipamento_id">Equipamento *</Label>
                <Select value={formData.equipamento_id.toString()} onValueChange={(value) => handleInputChange('equipamento_id', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentosList.map(equipamento => (
                      <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                        {equipamento.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade_id">Cidade *</Label>
                <Select value={formData.cidade_id.toString()} onValueChange={(value) => handleInputChange('cidade_id', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cidadesList.map(cidade => (
                      <SelectItem key={cidade.id} value={cidade.id.toString()}>
                        {cidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados de Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Contato</CardTitle>
            <CardDescription>Informações para contato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/profissionais')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfissionalForm;

