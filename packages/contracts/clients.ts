export const clientsPath = "/home/client/list";

export type ClientType = "INDIVIDUAL" | "LEGAL_ENTITY";
export type ClientStatus = "ACTIVE" | "INACTIVE";

export type ClientSummary = {
  id: string;
  type: ClientType;
  displayName: string;
  cuit: string;
  email: string | null;
  status: ClientStatus;
  updatedAt: string;
  firstName?: string | null;
  lastName?: string | null;
  legalName?: string | null;
  tradeName?: string | null;
  phone?: string | null;
  taxAddress?: string | null;
  legalRepresentativeName?: string | null;
  legalRepresentativeTaxId?: string | null;
};

export type ClientCreate =
  | {
      type: "INDIVIDUAL";
      firstName: string;
      lastName: string;
      cuit: string;
      email?: string | undefined;
      phone?: string | undefined;
      taxAddress?: string | undefined;
    }
  | {
      type: "LEGAL_ENTITY";
      legalName: string;
      cuit: string;
      tradeName?: string | undefined;
      email?: string | undefined;
      phone?: string | undefined;
      taxAddress?: string | undefined;
      legalRepresentativeName?: string | undefined;
      legalRepresentativeTaxId?: string | undefined;
    };

export type ClientUpdate = {
  firstName?: string | undefined;
  lastName?: string | undefined;
  legalName?: string | undefined;
  tradeName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  taxAddress?: string | undefined;
  legalRepresentativeName?: string | undefined;
  legalRepresentativeTaxId?: string | undefined;
  status?: ClientStatus | undefined;
  updatedAt: string;
};
