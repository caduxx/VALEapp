import React, { useState, useEffect } from 'react';
import { LogOut, FileText, Search, Filter, MessageSquare, CheckCircle, Clock, BarChart3, User, Calendar, Package, Building2, AlertCircle, Eye, RefreshCw, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDateForDisplay } from '../utils/excelDateConverter';
import { collectRobustGeolocation, formatGeolocationForDB } from '../utils/geolocation';
import { collectDeviceInfo } from '../utils/deviceInfo';

interface User {
  id: string;
  name: string;
  cpf?: string;
  department?: string;
  promax_unico?: string;
  isAdmin: boolean;
}

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Voucher {
  id: string;
  Data: string;
  Mapa: string;
  cod_cli?: string;
  Cliente?: string;
  Vale?: string;
  Emissão?: string;
  Item_TI?: string;
  Cód_Item?: string;
  Item: string;
  UN?: string;
  Qtde_Saída?: number;
  Avulsa?: string;
  Qtde_Retorno?: number;
  Avulsa2?: string;
  Qtde_Diferença: number;
  Avulsa3?: string;
  Valor: number;
  Conferente?: string;
  Coditem_mapa: string;
  Promax_unico: string;
  justification_type?: string;
  observations?: string;
  justified_at?: string;
  acao_transportadora: string;
  created_at: string;
  Medida?: string;
  justified_by_ip?: string;
  justified_by_device?: string;
  justified_by_location?: string;
  device_type?: string;
  screen_resolution?: string;
  timezone?: string;
}

export function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [justificationForm, setJustificationForm] = useState({
    type: '',
    observations: '',
    medida: ''
  });
  const [submittingJustification, setSubmittingJustification] = useState(false);
  const [justificationMessage, setJustificationMessage] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalVouchers: 0,
    pendingVouchers: 0,
    justifiedVouchers: 0,
    totalValue: 0
  });

  useEffect(() => {
    loadVouchers();
  }, [user.promax_unico]);

  const loadVouchers = async () => {
    if (!user.promax_unico) return;
    
    setLoading(true);
    try {
      console.log('🔍 Carregando vales para PROMAX:', user.promax_unico);
      
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('Promax_unico', user.promax_unico)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar vales:', error);
        throw error;
      }

      console.log('✅ Vales carregados:', data?.length || 0);
      setVouchers(data || []);

      // Calculate stats
      const totalVouchers = data?.length || 0;
      const pendingVouchers = data?.filter(v => v.acao_transportadora === 'Sem ação').length || 0;
      const justifiedVouchers = data?.filter(v => v.acao_transportadora === 'Justificado').length || 0;
      const totalValue = data?.reduce((sum, v) => sum + (v.Valor || 0), 0) || 0;

      setStats({
        totalVouchers,
        pendingVouchers,
        justifiedVouchers,
        totalValue
      });
    } catch (error) {
      console.error('❌ Erro ao carregar vales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJustifyVoucher = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setJustificationForm({ type: '', observations: '', medida: '' });
    setShowJustificationModal(true);
    setJustificationMessage('');
  };

  const submitJustification = async () => {
    if (!selectedVoucher || !justificationForm.type.trim()) {
      setJustificationMessage('Por favor, selecione um tipo de justificativa.');
      return;
    }

    setSubmittingJustification(true);
    setJustificationMessage('');

    try {
      console.log('📝 Enviando justificativa para vale:', selectedVoucher.Coditem_mapa);

      // Collect device and location info
      const deviceInfo = await collectDeviceInfo();
      const geoData = await collectRobustGeolocation();

      // Prepare justification data
      const justificationData = {
        justification_type: justificationForm.type,
        observations: justificationForm.observations || null,
        Medida: justificationForm.medida || null,
        justified_at: new Date().toISOString(),
        acao_transportadora: 'Justificado',
        justified_by_ip: deviceInfo.ip_address || null,
        justified_by_device: deviceInfo.user_agent || null,
        justified_by_location: formatGeolocationForDB(geoData),
        device_type: deviceInfo.device_type || null,
        screen_resolution: deviceInfo.screen_resolution || null,
        timezone: deviceInfo.timezone || null
      };

      console.log('📊 Dados da justificativa:', justificationData);

      // Update voucher in database
      const { error: updateError } = await supabase
        .from('vouchers')
        .update(justificationData)
        .eq('Coditem_mapa', selectedVoucher.Coditem_mapa);

      if (updateError) {
        console.error('❌ Erro ao atualizar vale:', updateError);
        throw updateError;
      }

      // Move to permanent table
      const { error: insertError } = await supabase
        .from('vales_justificados')
        .insert({
          ...selectedVoucher,
          ...justificationData,
          original_voucher_id: selectedVoucher.id,
          justified_by_user: user.name,
          moved_to_permanent_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('⚠️ Erro ao mover para tabela permanente:', insertError);
        // Don't throw here, the main update was successful
      }

      console.log('✅ Justificativa enviada com sucesso');
      setJustificationMessage('Justificativa enviada com sucesso!');
      
      // Reload vouchers
      await loadVouchers();
      
      // Close modal after delay
      setTimeout(() => {
        setShowJustificationModal(false);
        setSelectedVoucher(null);
        setJustificationMessage('');
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao enviar justificativa:', error);
      setJustificationMessage(
        error instanceof Error 
          ? `Erro: ${error.message}` 
          : 'Erro ao enviar justificativa. Tente novamente.'
      );
    } finally {
      setSubmittingJustification(false);
    }
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = 
      voucher.Item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.Mapa.includes(searchTerm) ||
      voucher.Coditem_mapa.includes(searchTerm);
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && voucher.acao_transportadora === 'Sem ação') ||
      (filterStatus === 'justified' && voucher.acao_transportadora === 'Justificado');

    return matchesSearch && matchesFilter;
  });

  const justificationTypes = [
    'Faltou no carregamento',
    'Esqueci no cliente',
    'Simples remessa',
    'Produto não gera vale',
    'Não sai neste mapa',
    'Troca por avaria ou qualidade',
    'Troca',
    'Inversão',
    'Comodato/Empréstimo',
    'Apoio',
    'Outros'
  ];

  return (
    <div className="min-h-screen bg-teal-50">
      {/* Header */}
      <header className="bg-teal-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-4">
                <div>
                  <img 
                    src="/logo copy copy copy.png" 
                    alt="LOG20 Logística" 
                    className="h-12 w-auto"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">VALEAPP</h1>
                  <p className="text-sm text-white font-medium">LOG20 LOGÍSTICA</p>
                  <p className="text-orange-200">Olá, {user.name}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-white hover:bg-teal-600 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVouchers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVouchers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Justificados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.justifiedVouchers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {stats.totalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por item, mapa ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendentes</option>
              <option value="justified">Justificados</option>
            </select>
            <button
              onClick={loadVouchers}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Vouchers List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-teal-600" />
              Seus Vales ({filteredVouchers.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-2 text-gray-600">Carregando seus vales...</span>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Nenhum vale encontrado' : 'Nenhum vale disponível'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Você não possui vales no momento.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mapa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qtde Diferença
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDateForDisplay(voucher.Data)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{voucher.Mapa}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={voucher.Item}>
                          {voucher.Item}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{voucher.Qtde_Diferença}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">R$ {voucher.Valor.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          voucher.acao_transportadora === 'Justificado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {voucher.acao_transportadora === 'Justificado' ? 'Justificado' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {voucher.acao_transportadora === 'Sem ação' ? (
                            <button
                              onClick={() => handleJustifyVoucher(voucher)}
                              className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Justificar
                            </button>
                          ) : (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Justificado</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Justification Modal */}
      {showJustificationModal && selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Justificar Vale</h3>
                <button
                  onClick={() => setShowJustificationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Voucher Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Informações do Vale</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Mapa:</strong> {selectedVoucher.Mapa}</p>
                  <p><strong>Item:</strong> {selectedVoucher.Item}</p>
                  <p><strong>Quantidade:</strong> {selectedVoucher.Qtde_Diferença}</p>
                  <p><strong>Valor:</strong> R$ {selectedVoucher.Valor.toFixed(2)}</p>
                 <p><strong>Medida:</strong> {selectedVoucher.Medida || 'N/A'}</p>
                </div>
              </div>

              {/* Justification Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Justificativa *
                  </label>
                  <select
                    value={justificationForm.type}
                    onChange={(e) => setJustificationForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um tipo</option>
                    {justificationTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medida
                  </label>
                  <input
                    type="text"
                    value={justificationForm.medida}
                    onChange={(e) => setJustificationForm(prev => ({ ...prev, medida: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: UN, KG, CX..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações {(['Troca', 'Inversão', 'Comodato/Empréstimo', 'Apoio'].includes(justificationForm.type)) ? '*' : '(opcional)'}
                  </label>
                  {justificationForm.type === 'Troca' && (
                    <p className="text-sm text-orange-600 mb-2">
                      📋 Descreva no campo OBSERVAÇÕES o produto que foi trocado
                    </p>
                  )}
                  {justificationForm.type === 'Inversão' && (
                    <p className="text-sm text-orange-600 mb-2">
                      📋 Descreva no campo OBSERVAÇÕES o produto que foi invertido
                    </p>
                  )}
                  {justificationForm.type === 'Comodato/Empréstimo' && (
                    <p className="text-sm text-orange-600 mb-2">
                      📋 Descreva no campo OBSERVAÇÕES o código do PDV que foi feito
                    </p>
                  )}
                  {justificationForm.type === 'Apoio' && (
                    <p className="text-sm text-orange-600 mb-2">
                      📋 Descreva no campo OBSERVAÇÕES o nome da equipe de apoio
                    </p>
                  )}
                  <textarea
                    value={justificationForm.observations}
                    onChange={(e) => setJustificationForm(prev => ({ ...prev, observations: e.target.value }))}
                    rows={3}
                    maxLength={100}
                    disabled={!justificationForm.type}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      ['Troca', 'Inversão', 'Comodato/Empréstimo', 'Apoio'].includes(justificationForm.type) 
                        ? 'bg-yellow-50 border-yellow-300' 
                        : ''
                    } ${!justificationForm.type ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Descreva detalhes adicionais sobre a justificativa..."
                    required={['Troca', 'Inversão', 'Comodato/Empréstimo', 'Apoio'].includes(justificationForm.type)}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {['Troca', 'Inversão', 'Comodato/Empréstimo', 'Apoio'].includes(justificationForm.type) && '* Campo obrigatório'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {justificationForm.observations.length}/100
                    </span>
                  </div>
                </div>

                {justificationMessage && (
                  <div className={`p-3 rounded-lg ${
                    justificationMessage.includes('sucesso') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {justificationMessage.includes('sucesso') ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-sm">{justificationMessage}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowJustificationModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submittingJustification}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={submitJustification}
                    disabled={
                      submittingJustification || 
                      !justificationForm.type.trim() ||
                      (['Troca', 'Inversão', 'Comodato/Empréstimo', 'Apoio'].includes(justificationForm.type) && !justificationForm.observations.trim())
                    }
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      submittingJustification || 
                      !justificationForm.type.trim() ||
                      (['Troca', 'Inversão', 'Comodato/Empréstimo', 'Apoio'].includes(justificationForm.type) && !justificationForm.observations.trim())
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {submittingJustification ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Justificativa'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}