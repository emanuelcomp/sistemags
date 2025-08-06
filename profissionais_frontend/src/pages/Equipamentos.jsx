import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Building2, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { equipamentos } from '../lib/api';
import { useAuth } from '../lib/auth.jsx';

const Equipamentos = () => {
  const [equipamentosList, setEquipamentosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const equipamentosData = await equipamentos.listar();
      setEquipamentosList(equipamentosData);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      setError('Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleInativar = async (equipamento) => {
    try {
      await equipamentos.deletar(equipamento.id);
      fetchData();
    } catch (error) {
      setError('Erro ao inativar equipamento');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
          <p className="mt-2 text-gray-600">
            Gerencie os equipamentos do sistema (CRAS, CREAS, CAPS, etc.)
          </p>
        </div>
        {hasPermission(3) && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Equipamento
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipamentosList.map((equipamento) => (
          <Card key={equipamento.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{equipamento.nome}</CardTitle>
                    <Badge variant={equipamento.status === 'ativo' ? "default" : "secondary"}>
                      {equipamento.status}
                    </Badge>
                  </div>
                </div>
                {hasPermission(3) && (
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleInativar(equipamento)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {equipamento.descricao && (
                <p className="text-gray-600 mb-4">{equipamento.descricao}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Cadastrado em: {new Date(equipamento.data_cadastro).toLocaleDateString('pt-BR')}
                </div>
                <Link to={`/equipamentos/${equipamento.id}/profissionais`}>
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Ver Profissionais
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {equipamentosList.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhum equipamento cadastrado.</p>
            {hasPermission(3) && (
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Equipamento
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Equipamentos;

