import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Users, Building2, MapPin, UserCheck, UserX } from 'lucide-react';
import { profissionais, equipamentos, cidades } from '../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProfissionais: 0,
    profissionaisAtivos: 0,
    profissionaisInativos: 0,
    totalEquipamentos: 0,
    totalCidades: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          profissionaisData,
          profissionaisAtivosData,
          profissionaisInativosData,
          equipamentosData,
          cidadesData
        ] = await Promise.all([
          profissionais.listar(),
          profissionais.listar({ status: 'ativo' }),
          profissionais.listar({ status: 'inativo' }),
          equipamentos.listar(),
          cidades.listar()
        ]);

        setStats({
          totalProfissionais: profissionaisData.length,
          profissionaisAtivos: profissionaisAtivosData.length,
          profissionaisInativos: profissionaisInativosData.length,
          totalEquipamentos: equipamentosData.length,
          totalCidades: cidadesData.length
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total de Profissionais',
      value: stats.totalProfissionais,
      description: 'Profissionais cadastrados no sistema',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Profissionais Ativos',
      value: stats.profissionaisAtivos,
      description: 'Profissionais atualmente ativos',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Profissionais Inativos',
      value: stats.profissionaisInativos,
      description: 'Profissionais inativos no sistema',
      icon: UserX,
      color: 'text-red-600'
    },
    {
      title: 'Equipamentos',
      value: stats.totalEquipamentos,
      description: 'Equipamentos cadastrados',
      icon: Building2,
      color: 'text-purple-600'
    },
    {
      title: 'Cidades',
      value: stats.totalCidades,
      description: 'Cidades cadastradas',
      icon: MapPin,
      color: 'text-orange-600'
    }
  ];

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do sistema de gerenciamento de profissionais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
            <CardDescription>
              Informações gerais sobre o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Profissionais Ativos</span>
                <span className="text-sm text-gray-600">
                  {stats.totalProfissionais > 0 
                    ? Math.round((stats.profissionaisAtivos / stats.totalProfissionais) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalProfissionais > 0 
                      ? (stats.profissionaisAtivos / stats.totalProfissionais) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Links para as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a 
                href="/profissionais" 
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Gerenciar Profissionais</div>
                <div className="text-sm text-gray-600">Cadastrar, editar e visualizar profissionais</div>
              </a>
              <a 
                href="/equipamentos" 
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">Gerenciar Equipamentos</div>
                <div className="text-sm text-gray-600">Cadastrar e gerenciar equipamentos</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

