import React, { useState, useEffect } from 'react';
import { LogOut, Building2, Upload, Users, Shield, FileText, BarChart3, Search, Filter, Download, UserPlus, Plus, Eye, CreditCard as Edit, Trash2, CheckCircle, Clock, AlertCircle, Database, ExternalLink, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { formatDateForDisplay } from '../utils/excelDateConverter';

interface User {
  id: string;
  name: string;
  login?: string;
  isAdmin: boolean;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Employee {
  id: string;
  cpf: string;
  name: string;
  department?: string;
  promax_unico: string;
  Senha?: string;
  created_at: string;
  Coditem_mapa?: string;
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
}

interface AdminUser {
  id: string;
  login: string;
  password: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  // Stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalVouchers: 0,
    pendingVouchers: 0,
    justifiedVouchers: 0,
    totalValue: 0
  });

  useEffect(() => {
    if (activeTab === 'employees') {
      loadEmployees();
    } else if (activeTab === 'vouchers') {
      loadVouchers();
    } else if (activeTab === 'admins') {
      loadAdminUsers();
    } else if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [employeesRes, vouchersRes] = await Promise.all([
        supabase.from('employees').select('id'),
        supabase.from('vouchers').select('id, acao_transportadora, Valor')
      ]);

      const totalEmployees = employeesRes.data?.length || 0;
      const totalVouchers = vouchersRes.data?.length || 0;
      const pendingVouchers = vouchersRes.data?.filter(v => v.acao_transportadora === 'Sem ação').length || 0;
      const justifiedVouchers = vouchersRes.data?.filter(v => v.acao_transportadora === 'Justificado').length || 0;
      const totalValue = vouchersRes.data?.reduce((sum, v) => sum + (v.Valor || 0), 0) || 0;

      setStats({
        totalEmployees,
        totalVouchers,
        pendingVouchers,
        justifiedVouchers,
        totalValue
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error('Erro ao carregar vales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('name');

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupDatabase = async () => {
    setCleanupLoading(true);
    setCleanupMessage('Iniciando limpeza da base de dados...');

    try {
      console.log('🧹 Iniciando limpeza da base de dados...');
      
      // 1. Buscar todos os vales justificados
      const { data: justifiedVouchers, error: fetchError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('acao_transportadora', 'Justificado');

      if (fetchError) {
        console.error('❌ Erro ao buscar vales justificados:', fetchError);
        throw fetchError;
      }

      const totalJustified = justifiedVouchers?.length || 0;
      console.log(`📊 Encontrados ${totalJustified} vales justificados`);
      
      // 2. Copiar vales justificados para tabela permanente (se existirem)
      if (totalJustified > 0) {
        setCleanupMessage(`Encontrados ${totalJustified} vales justificados. Copiando para tabela permanente...`);
        console.log('📋 Preparando dados para cópia...');
        const valesParaCopiar = justifiedVouchers.map(voucher => ({
          Mapa: voucher.Mapa,
          Data: voucher.Data,
          cod_cli: voucher.cod_cli,
          Cliente: voucher.Cliente,
          Vale: voucher.Vale,
          Emissão: voucher.Emissão,
          Item_TI: voucher.Item_TI,
          'coditem': voucher.coditem,
          Item: voucher.Item,
          UN: voucher.UN,
          Qtde_Saída: voucher.Qtde_Saída,
          Avulsa: voucher.Avulsa,
          Qtde_Retorno: voucher.Qtde_Retorno,
          Avulsa2: voucher.Avulsa2,
          'Qtde_Diferença': voucher.Qtde_Diferença,
          Avulsa3: voucher.Avulsa3,
          Valor: voucher.Valor,
          Conferente: voucher.Conferente,
          Coditem_mapa: voucher.Coditem_mapa,
          Promax_unico: voucher.Promax_unico,
          justification_type: voucher.justification_type,
          observations: voucher.observations,
          justified_at: voucher.justified_at,
          acao_transportadora: voucher.acao_transportadora,
          created_at: voucher.created_at,
          Medida: voucher.Medida,
          justified_by_ip: voucher.justified_by_ip,
          justified_by_device: voucher.justified_by_device,
          justified_by_location: voucher.justified_by_location,
          device_type: voucher.device_type,
          screen_resolution: voucher.screen_resolution,
          timezone: voucher.timezone,
          original_voucher_id: voucher.id,
          justified_by_user: user.name,
          moved_to_permanent_at: new Date().toISOString()
        }));

        console.log('💾 Inserindo na tabela permanente...');
        const { error: insertError } = await supabase
          .from('vales_justificados')
          .insert(valesParaCopiar);

        if (insertError) {
          console.error('❌ Erro ao inserir na tabela permanente:', insertError);
          // Se for erro de duplicata, tenta upsert
          if (insertError.code === '23505') {
            console.log('🔄 Tentando upsert devido a duplicatas...');
            const { error: upsertError } = await supabase
              .from('vales_justificados')
              .upsert(valesParaCopiar, { onConflict: 'Coditem_mapa' });
            
            if (upsertError) {
              console.error('❌ Erro no upsert:', upsertError);
              throw upsertError;
            }
          } else {
            throw insertError;
          }
        }
        
        console.log('✅ Dados copiados para tabela permanente');
      } else {
        console.log('ℹ️ Nenhum vale justificado encontrado para copiar');
        setCleanupMessage('Nenhum vale justificado encontrado. Prosseguindo com limpeza completa...');
      }

      // 3. Buscar total de vales na tabela para informar ao usuário
      const { data: allVouchers, error: countError } = await supabase
        .from('vouchers')
        .select('id');

      const totalVouchers = allVouchers?.length || 0;
      console.log(`📊 Total de vales na tabela: ${totalVouchers}`);
      
      setCleanupMessage(`🗑️ Removendo TODOS os ${totalVouchers} vales da tabela principal...`);

      // 4. Remover TODOS os vales da tabela principal
      // Clear vouchers table - delete all records regardless of status
      console.log('🗑️ Limpando tabela vouchers...');
      const { data: vouchersData, error: deleteError } = await supabase
        .from('vouchers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Condição que sempre será verdadeira para deletar todos

      if (deleteError) {
        console.error('❌ Erro ao deletar vales:', deleteError);
        throw deleteError;
      }

      console.log('✅ Limpeza concluída com sucesso');
      setCleanupMessage(`✅ Limpeza concluída! ${totalJustified} vales justificados copiados para tabela permanente e TODOS os ${totalVouchers} vales removidos da tabela principal.`);
      
      // Recarregar dados
      console.log('🔄 Recarregando dados...');
      await loadVouchers();
      await loadStats();

    } catch (error) {
      console.error('Erro na limpeza:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setCleanupMessage(`❌ Erro na limpeza: ${errorMessage}`);
    } finally {
      setCleanupLoading(false);
      console.log('🏁 Processo de limpeza finalizado');
    }
  };

  const excelSerialToDate = (serial: number): Date => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadMessage('Processando arquivo...');

    try {
      console.log('📁 Iniciando processamento do arquivo:', file.name);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('📊 Total de linhas encontradas na planilha:', jsonData.length);
      console.log('📋 Primeira linha:', jsonData[0]);
      console.log('🔍 Chaves disponíveis na primeira linha:', Object.keys(jsonData[0] || {}));

      setUploadMessage(`Processando ${jsonData.length} registros...`);
      setUploadProgress(50);

      // Helper function para buscar campo com várias variações
      const findField = (row: any, fieldVariations: string[]): any => {
        for (const variation of fieldVariations) {
          if (row[variation] !== undefined && row[variation] !== null && row[variation] !== '') {
            return row[variation];
          }
        }
        return null;
      };

      // Converter data do Excel para formato ISO
      const convertExcelDate = (excelDate: any): string => {
        if (!excelDate) return new Date().toISOString().split('T')[0];
        
        // Se é um número (serial do Excel)
        if (typeof excelDate === 'number') {
          const date = new Date((excelDate - 25569) * 86400 * 1000);
          return date.toISOString().split('T')[0];
        }
        
        // Se é string, tenta converter
        if (typeof excelDate === 'string') {
          // Formato DD/MM/YYYY
          const match = excelDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (match) {
            const [, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
        
        return new Date().toISOString().split('T')[0];
      };

      // Processar dados seguindo as regras especificadas
      const processedData = jsonData.map((row: any, index: number) => {
        console.log(`🔄 Processando linha ${index + 1}:`, row);
        
        // Buscar Coditem_mapa com várias variações
        let coditenMapa = findField(row, [
          'coditem_mapa',
          'Coditem_mapa', 
          'coditemMapa',
          'CodItemMapa',
          'coditemmapa',
          'CODITEM_MAPA',
          'Coditem_Mapa',
          'CodItem_Mapa',
          'Código Item Mapa',
          'codigo_item_mapa'
        ]);
        
        // Se não encontrou, tenta construir a partir de coditem + mapa
        if (!coditenMapa) {
          const coditem = findField(row, ['coditem', 'Coditem', 'CodItem', 'CODITEM', 'Código Item', 'codigo_item']);
          const mapa = findField(row, ['mapa', 'Mapa', 'MAPA', 'Número Mapa', 'numero_mapa']);
          
          if (coditem && mapa) {
            coditenMapa = `${coditem}_${mapa}`;
            console.log(`🔧 Construído coditem_mapa: ${coditenMapa}`);
          }
        }
        
        if (!coditenMapa) {
          const availableKeys = Object.keys(row).join(', ');
          throw new Error(`Linha ${index + 1}: Campo 'coditem_mapa' é obrigatório e não foi encontrado. Colunas disponíveis: ${availableKeys}`);
        }

        // Buscar outros campos obrigatórios
        const promaxUnico = findField(row, ['Promax_unico', 'promax_unico', 'PROMAX_UNICO', 'Promax Único', 'promax_único']);
        const mapa = findField(row, ['Mapa', 'mapa', 'MAPA', 'Número Mapa', 'numero_mapa']);
        const item = findField(row, ['Item', 'item', 'ITEM', 'Descrição', 'descricao', 'Produto', 'produto']);
        
        // Buscar campo DATA corretamente
        const dataValue = findField(row, ['Data', 'data', 'DATA', 'Date', 'date']);
        const data = convertExcelDate(dataValue);
        console.log(`📅 Data processada - Original: ${dataValue}, Convertida: ${data}`);
        
        // Buscar Qtde_Diferença corretamente (não usar valor padrão 1)
        const qtdeDiferencaValue = findField(row, [
          'Qtde Diferença',
          'Qtde_Diferença', 
          'qtde_diferenca',
          'QTDE_DIFERENCA',
          'QTD_DIFERENCA',
          'Qtd Diferença',
          'Quantidade Diferença',
          'qtde diferenca',
          'QTDE DIFERENCA'
        ]);
        
        const qtdeDiferenca = qtdeDiferencaValue !== null && qtdeDiferencaValue !== undefined && qtdeDiferencaValue !== '' 
          ? parseInt(qtdeDiferencaValue.toString()) 
          : 0;
        console.log(`🔢 Qtde Diferença - Original: ${qtdeDiferencaValue}, Convertida: ${qtdeDiferenca}`);
        
        if (isNaN(qtdeDiferenca)) {
          console.warn(`⚠️ Linha ${index + 1}: Qtde Diferença não é um número válido. Valor original: ${qtdeDiferencaValue}`);
        }
        
        const valor = parseFloat(findField(row, ['Valor', 'valor', 'VALOR', 'Preço', 'preco']) || '0');

        return {
          Data: data,
          Mapa: mapa,
          cod_cli: findField(row, ['cod_cli', 'Cod_Cli', 'Código Cliente', 'codigo_cliente']),
          Cliente: findField(row, ['Cliente', 'cliente', 'CLIENTE', 'Nome Cliente', 'nome_cliente']),
          Vale: findField(row, ['Vale', 'vale', 'VALE', 'Número Vale', 'numero_vale']),
          Emissão: findField(row, ['Emissão', 'emissao', 'EMISSAO', 'Data Emissão', 'data_emissao']),
          Item_TI: findField(row, ['Item_TI', 'item_ti', 'ITEM_TI']),
          coditem: findField(row, ['coditem', 'Coditem', 'CodItem', 'CODITEM', 'Código Item', 'codigo_item']),
          Item: item,
          UN: findField(row, ['UN', 'un', 'Unidade', 'unidade', 'Medida', 'medida']),
          Qtde_Saída: parseInt(findField(row, ['Qtde_Saída', 'qtde_saida', 'Quantidade Saída', 'quantidade_saida']) || '0'),
          Avulsa: findField(row, ['Avulsa', 'avulsa', 'AVULSA']),
          Qtde_Retorno: parseInt(findField(row, ['Qtde_Retorno', 'qtde_retorno', 'Quantidade Retorno', 'quantidade_retorno']) || '0'),
          Avulsa2: findField(row, ['Avulsa2', 'avulsa2', 'AVULSA2']),
          Qtde_Diferença: qtdeDiferenca,
          Avulsa3: findField(row, ['Avulsa3', 'avulsa3', 'AVULSA3']),
          Valor: valor,
          Conferente: findField(row, ['Conferente', 'conferente', 'CONFERENTE']),
          Coditem_mapa: coditenMapa,
          Promax_unico: promaxUnico,
          acao_transportadora: 'Sem ação',
          Medida: findField(row, ['Medida', 'medida', 'MEDIDA', 'UN', 'un'])
        };
      });

      console.log('📝 Dados processados:', processedData.slice(0, 2)); // Log dos primeiros 2 registros
      
      setUploadMessage('Salvando no banco de dados...');
      setUploadProgress(75);

      // Inserir dados na tabela vouchers
      const { data: insertedData, error: insertError } = await supabase
        .from('vouchers')
        .insert(processedData);

      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError);
        throw new Error(`Erro ao salvar dados: ${insertError.message}`);
      }

      console.log('✅ Dados inseridos com sucesso:', insertedData);
      
      setUploadMessage(`✅ ${processedData.length} vales importados com sucesso!`);
      setUploadProgress(100);
      setUploadStatus('success');
      
      // Recarregar dados
      await loadVouchers();
      await loadStats();

    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadStatus('error');
      setUploadMessage(`Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const exportData = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cpf.includes(searchTerm) ||
    emp.promax_unico.includes(searchTerm)
  );

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = 
      voucher.Item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.Mapa.includes(searchTerm) ||
      voucher.Promax_unico.includes(searchTerm);
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'pending' && voucher.acao_transportadora === 'Sem ação') ||
      (filterStatus === 'justified' && voucher.acao_transportadora === 'Justificado');

    return matchesSearch && matchesFilter;
  });

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Funcionários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vales</p>
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
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {stats.totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('vouchers')}
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <FileText className="h-6 w-6 text-orange-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-orange-900">Gerenciar Vales</p>
              <p className="text-sm text-orange-600">Ver todos os vales</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Funcionários</p>
              <p className="text-sm text-blue-600">Gerenciar funcionários</p>
            </div>
          </button>

          <button
            onClick={() => setShowCleanupModal(true)}
            className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Database className="h-6 w-6 text-red-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-red-900">Limpeza</p>
              <p className="text-sm text-red-600">Limpar base de dados</p>
            </div>
          </button>
        </div>
      </div>

      {/* External Links */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Links Externos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.open('https://docs.google.com/spreadsheets/d/18mjwOgJdk6XTmM9ameBU0foNpImot7HbibeFbERh7oo/edit?usp=drive_link', '_blank')}
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <ExternalLink className="h-6 w-6 text-orange-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-orange-900">Abrir Google Sheets</p>
              <p className="text-sm text-orange-600">Planilha de dados</p>
            </div>
          </button>

          <button
            onClick={() => window.open('https://lookerstudio.google.com/reporting/412ad3ff-61c1-44c6-bb06-d6106e10e4e0', '_blank')}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Abrir Looker Studio</p>
              <p className="text-sm text-blue-600">Dashboard BI</p>
            </div>
          </button>
        </div>
      </div>

      {/* Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Limpeza</h3>
            <p className="text-gray-600 mb-6">
              Esta ação irá mover todos os vales justificados para a tabela permanente e limpar a tabela principal. Esta ação não pode ser desfeita.
            </p>
            {cleanupMessage && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{cleanupMessage}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={handleCleanupDatabase}
                disabled={cleanupLoading}
                className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cleanupLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Processando...
                  </div>
                ) : (
                  'Confirmar Limpeza'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCleanupModal(false);
                  setCleanupMessage('');
                }}
                disabled={cleanupLoading}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Funcionários</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => exportData(employees, 'funcionarios')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum funcionário encontrado
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.promax_unico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForDisplay(employee.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVouchers = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Vales</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => exportData(vouchers, 'vales')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </label>
          </div>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus !== 'idle' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            {uploadStatus === 'uploading' && (
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            )}
            {uploadStatus === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {uploadStatus === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{uploadMessage}</p>
              {uploadStatus === 'uploading' && (
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por item, mapa ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="justified">Justificados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mapa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferença</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Nenhum vale encontrado
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateForDisplay(voucher.Data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.Mapa}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {voucher.Item}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {voucher.Qtde_Diferença}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {voucher.Valor?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        voucher.acao_transportadora === 'Justificado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {voucher.acao_transportadora}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForDisplay(voucher.Data)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAdmins = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Administradores</h2>
        <button
          onClick={() => setShowAddAdmin(true)}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Nenhum administrador encontrado
                  </td>
                </tr>
              ) : (
                adminUsers.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admin.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {admin.login}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateForDisplay(admin.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/logo copy copy copy.png" 
                alt="LOG20 Logística" 
                className="h-10 w-auto"
              />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-500">Bem-vindo, {user.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'employees'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Funcionários
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vouchers'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Vales
              </div>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Administradores
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'vouchers' && renderVouchers()}
        {activeTab === 'admins' && renderAdmins()}
      </main>
    </div>
  );
}