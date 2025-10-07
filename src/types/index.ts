export interface User {
  id: string;
  cpf?: string;
  login?: string;
  name: string;
  department?: string;
  promax_unico?: string;
  isAdmin: boolean;
}

export interface AuthUser extends User {}

export interface Employee {
  id: string;
  cpf: string;
  name: string;
  department?: string;
  promax_unico: string;
  Senha?: string;
  created_at: string;
  Coditem_mapa?: string;
}

export interface Voucher {
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

export interface AdminUser {
  id: string;
  login: string;
  password: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}