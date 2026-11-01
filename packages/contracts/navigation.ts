export type ClientContext = {
  clientId: string;
  name: string;
  description: string;
  logoUrl: string;
  tenantId: string;
};

export type NavigationState = {
  currentRoute: "/home/welcome" | "/home/client/services";
  isMenuCollapsed: boolean;
  canViewAccountStatus: boolean;
};
