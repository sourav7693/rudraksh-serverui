export type CommunicationPurpose =
  | "LOGIN_OTP"
  | "SIGNUP_OTP"
  | "ORDER_CONFIRMATION"
  | "ORDER_CANCELLATION"
  | "ORDER_REFUND"
  | "ORDER_REPLACEMENT"
  | "PRODUCT_SHIPPED"
  | "PROMOTIONAL_ALL"
  | "PROMOTIONAL_CART"
  | "PROMOTIONAL_REGISTERED";

export type ProviderType = "SMS" | "WHATSAPP";

interface PurposeConfig {
  enabled: boolean;
  templateId?: string; 
  templateName?: string;
}

export type CommunicationProviderItem= {
    _id:string;
  provider: ProviderType;

  enabled: boolean; 

  sms_credentials: {
    apiKey?: string;
    senderId?: string; 
    phoneNumberId?: string; 
  };
    whatsapp_credentials: {
    auth_key?: string;
    app_key?: string; 
    device_id?: string; 
  };

  purposes: Record<CommunicationPurpose, PurposeConfig>;

  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  userId: string;
  username: string;
  mobile: string;
  email: string;
  role: "admin" | "staff";
  permissions: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
};